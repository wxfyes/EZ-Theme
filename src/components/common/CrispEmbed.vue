<template>
  <!-- Crisp将会自动注入到页面，不需要特定的DOM元素 -->
  <!-- 添加一个包装容器，只是为了应用样式 -->
  <div class="crisp-embed-container" v-if="CONFIG.enabled">
    <!-- 通过JavaScript初始化Crisp，不需要视图内容 -->
  </div>
</template>

<script>
import { onMounted, onUnmounted, computed, watch, ref } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { getUserInfo, getCommConfig, getUserSubscribe } from '@/api/user';
import { CUSTOMER_SERVICE_CONFIG } from '@/utils/baseConfig';
import { formatDate } from '@/utils/formatters';
import { Crisp } from 'crisp-sdk-web';

if (typeof window !== 'undefined') {
  window.CRISP_INITIALIZED = window.CRISP_INITIALIZED || false;
}

export default {
  name: 'CrispEmbed',
  
  setup() {
    const store = useStore();
    const { locale } = useI18n();
    const userInfo = ref(null);
    const userSubscribe = ref(null);
    const currencySymbol = ref('¥'); 
    const crispInitialized = ref(window.CRISP_INITIALIZED || false);
    const isMobile = ref(false);
    
    const CONFIG = computed(() => {
      return {
        enabled: CUSTOMER_SERVICE_CONFIG.enabled && CUSTOMER_SERVICE_CONFIG.embedMode === 'embed',
        type: CUSTOMER_SERVICE_CONFIG.type || 'crisp',
        iconPosition: CUSTOMER_SERVICE_CONFIG.iconPosition || {
          desktop: { left: '20px', bottom: '20px' },
          mobile: { right: '20px', bottom: '100px' }
        }
      };
    });
    
    const makeChatwootDraggable = () => {
      const checkInterval = setInterval(() => {
        const holder = document.querySelector('.woot-widget-holder') || document.querySelector('[class*="woot-widget"]');
        if (holder) {
          clearInterval(checkInterval);
          initDraggable(holder);
        }
      }, 500);
      
      setTimeout(() => clearInterval(checkInterval), 20000);
    };

    const initDraggable = (el) => {
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;
      let isDragging = false;
      let hasMoved = false;

      // 临时存储初始定位
      const initPosition = () => {
        const rect = el.getBoundingClientRect();
        el.style.position = 'fixed';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.bottom = 'auto';
        el.style.right = 'auto';
        el.style.zIndex = '99999999';
      };

      const onTouchStart = (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        // 每次开始拖动时重算定位，防止窗口展开/折叠导致坐标丢失
        initPosition();
        
        const currentRect = el.getBoundingClientRect();
        initialLeft = currentRect.left;
        initialTop = currentRect.top;
        isDragging = true;
        hasMoved = false;
      };

      const onTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          hasMoved = true;
        }

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // 边界范围检查
        const maxLeft = window.innerWidth - el.offsetWidth;
        const maxTop = window.innerHeight - el.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        
        if (e.cancelable) e.preventDefault();
      };

      const onTouchEnd = (e) => {
        isDragging = false;
      };

      el.addEventListener('touchstart', onTouchStart, { passive: false });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd, { passive: false });

      // 桌面端鼠标拖拽支持
      const onMouseDown = (e) => {
        // 如果是点击了输入框或按钮内部，不启动拖拽
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('button')) {
          return;
        }
        startX = e.clientX;
        startY = e.clientY;
        
        initPosition();
        
        const currentRect = el.getBoundingClientRect();
        initialLeft = currentRect.left;
        initialTop = currentRect.top;
        isDragging = true;
        hasMoved = false;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          hasMoved = true;
        }

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const maxLeft = window.innerWidth - el.offsetWidth;
        const maxTop = window.innerHeight - el.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
      };

      const onMouseUp = (e) => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      el.addEventListener('mousedown', onMouseDown);

      // 核心：在捕获阶段拦截点击事件。如果用户进行了拖拽位移，则吞掉这一次 click，避免误触弹窗
      el.addEventListener('click', (e) => {
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
          hasMoved = false;
        }
      }, true);
    };

    const loadOtherService = () => {
      if (!CUSTOMER_SERVICE_CONFIG.customHtml) return;
      
      try {
        // 动态设置 Chatwoot 小部件语言，与当前系统语言保持一致
        window.chatwootSettings = window.chatwootSettings || {};
        window.chatwootSettings.locale = locale.value === 'zh-TW' ? 'zh-TW' : (locale.value === 'zh-CN' ? 'zh-CN' : 'en');
        window.chatwootSettings.useBrowserLanguage = false;

        const scriptContent = CUSTOMER_SERVICE_CONFIG.customHtml;
        const scriptElement = document.createElement('script');
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = scriptContent;
        const originalScript = tempDiv.querySelector('script');
        
        if (originalScript) {
          Array.from(originalScript.attributes).forEach(attr => {
            scriptElement.setAttribute(attr.name, attr.value);
          });
          
          scriptElement.textContent = originalScript.textContent || '';
          document.body.appendChild(scriptElement);
        } else {
          scriptElement.textContent = scriptContent;
          document.body.appendChild(scriptElement);
        }

        // 启动可拖拽绑定
        makeChatwootDraggable();

        // 监听 Chatwoot 准备就绪事件并自动传入 V2Board 用户数据
        window.addEventListener("chatwoot:ready", function () {
          if (store.getters.isLoggedIn) {
            fetchUserData().then(() => {
              const userEmail = extractUserEmail();
              if (userEmail && window.$chatwoot) {
                // 标识用户基本信息
                window.$chatwoot.setUser(userEmail, {
                  email: userEmail,
                  name: userEmail.split('@')[0]
                });

                // 同步套餐、到期时间、可用流量、用户余额等自定义属性
                const planName = extractPlanName();
                const expireDate = extractExpireDate();
                const remainingGB = calculateRemainingTraffic();
                const balance = extractBalance();

                window.$chatwoot.setCustomAttributes({
                  Plan: planName,
                  Expires: expireDate,
                  Traffic: remainingGB + ' GB',
                  Balance: balance + ' ' + currencySymbol.value
                });
              }
            });
          }
        });
      } catch (error) {
        console.error('加载第三方客服脚本失败:', error);
      }
    };

    const initCrisp = async () => {
      if (!CONFIG.value.enabled) return;
      
      if (window.CRISP_INITIALIZED && crispInitialized.value) {
        try {
          updateCrispConfig();
          return;
        } catch (error) {
          console.error('更新Crisp配置失败:', error);
        }
      }
      
      try {
        const crispIdMatch = CUSTOMER_SERVICE_CONFIG.customHtml?.match(/CRISP_WEBSITE_ID="([^"]*)"/);
        const websiteId = crispIdMatch ? crispIdMatch[1] : '';
        
        if (!websiteId) {
          console.error('无法从配置中提取Crisp ID');
          return;
        }

        Crisp.configure(websiteId);
        
        if (isMobile.value) {
          Crisp.setPosition("right");
        } else {
          Crisp.setPosition("left");
        }
        
        if (store.getters.isLoggedIn) {
          await fetchUserData();
          setUserDataToCrisp();
        }
        
        setCrispStyles();
        
        window.CRISP_INITIALIZED = true;
        crispInitialized.value = true;
        
      } catch (error) {
        console.error('初始化Crisp客服系统失败:', error);
      }
    };
    
    const updateCrispConfig = () => {
      if (isMobile.value) {
        Crisp.setPosition("right");
      } else {
        Crisp.setPosition("left");
      }
      
      setCrispStyles();
    };
    
    const setCrispStyles = () => {
      setTimeout(() => {
        try {
          const style = document.createElement('style');
          style.id = 'crisp-custom-styles';
          
          if (isMobile.value) {
            style.textContent = `
              
              .crisp-client .cc-1xry,
              .crisp-client .cc-7doi,
              .crisp-client .cc-imbb, 
              .crisp-client .cc-1drt,
              .crisp-client .cc-1jrn,
              .crisp-client [class^="cc-"] [data-visible="true"][data-is-failure="false"],
              .crisp-client [class^="cc-"] [data-compose="true"],
              .crisp-client [class^="cc-"] [data-maximized="false"]
               {
                transform: translateY(-80px) !important;
                bottom: 80px !important;
              }
            `;
          }
          
          const oldStyle = document.getElementById('crisp-custom-styles');
          if (oldStyle) {
            oldStyle.remove();
          }
          
          document.head.appendChild(style);
          
        } catch (error) {
          console.error('设置Crisp样式失败:', error);
        }
      }, 1000); 
    };
    
    const fetchUserData = async () => {
      try {
        const [userInfoResponse, commConfigResponse, subscribeResponse] = await Promise.all([
          getUserInfo(),
          getCommConfig(),
          getUserSubscribe()
        ]);
        
        userInfo.value = userInfoResponse.data ? userInfoResponse.data : userInfoResponse;
        
        const commConfigData = commConfigResponse.data ? commConfigResponse.data : commConfigResponse;
        if (commConfigData && commConfigData.currency_symbol) {
          currencySymbol.value = commConfigData.currency_symbol;
        }
        
        userSubscribe.value = subscribeResponse.data ? subscribeResponse.data : subscribeResponse;
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };
    
    const setUserDataToCrisp = () => {
      if (!crispInitialized.value) return;
      
      try {
        let userEmail = extractUserEmail();
        
        if (userEmail) {
          Crisp.user.setEmail(userEmail);
          const nickname = userEmail.split('@')[0];
          Crisp.user.setNickname(nickname);
        }
        
        const planName = extractPlanName();
        const expireDate = extractExpireDate();
        const remainingGB = calculateRemainingTraffic();
        const balance = extractBalance();
        
        const sessionData = {
          Email: userEmail || 'Unknown',
          Plan: planName,
          Expires: expireDate,
          Traffic: remainingGB + ' GB',
          Balance: balance + ' ' + currencySymbol.value
        };
        
        Crisp.session.setData(sessionData);
      } catch (error) {
        console.error('设置Crisp用户数据失败:', error);
      }
    };
    
    const extractUserEmail = () => {
      let userEmail = '';
      
      if (userInfo.value) {
        if (typeof userInfo.value === 'object') {
          if (userInfo.value.email) {
            userEmail = userInfo.value.email;
          } else if (userInfo.value.data && userInfo.value.data.email) {
            userEmail = userInfo.value.data.email;
          }
        }
      }
      
      if (!userEmail && userSubscribe.value) {
        if (typeof userSubscribe.value === 'object') {
          if (userSubscribe.value.email) {
            userEmail = userSubscribe.value.email;
          } else if (userSubscribe.value.data && userSubscribe.value.data.email) {
            userEmail = userSubscribe.value.data.email;
          }
        }
      }
      
      if (!userEmail) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.email) {
              userEmail = parsedUser.email;
            }
          } catch (e) {
            console.error('解析localStorage用户数据失败:', e);
          }
        }
      }
      
      return userEmail;
    };
    
    const extractPlanName = () => {
      let planName = "未知套餐";
      
      if (userSubscribe.value && userSubscribe.value.plan && userSubscribe.value.plan.name) {
        planName = userSubscribe.value.plan.name;
      } else if (userSubscribe.value && userSubscribe.value.data && userSubscribe.value.data.plan && userSubscribe.value.data.plan.name) {
        planName = userSubscribe.value.data.plan.name;
      } else if (userInfo.value && userInfo.value.plan_name && userInfo.value.plan_name.trim() !== '') {
        planName = userInfo.value.plan_name;
      } else if (userInfo.value && userInfo.value.group && userInfo.value.group.name && userInfo.value.group.name.trim() !== '') {
        planName = userInfo.value.group.name;
      }
      
      return planName;
    };
    
    const extractExpireDate = () => {
      let expireDate = "无限期";
      
      if (userSubscribe.value && userSubscribe.value.expired_at) {
        expireDate = formatDate(userSubscribe.value.expired_at);
      } else if (userSubscribe.value && userSubscribe.value.data && userSubscribe.value.data.expired_at) {
        expireDate = formatDate(userSubscribe.value.data.expired_at);
      } else if (userInfo.value && userInfo.value.expired_at) {
        expireDate = formatDate(userInfo.value.expired_at);
      } else if (userInfo.value && userInfo.value.data && userInfo.value.data.expired_at) {
        expireDate = formatDate(userInfo.value.data.expired_at);
      }
      
      return expireDate;
    };
    
    const calculateRemainingTraffic = () => {
      let transferEnable = 0;
      let u = 0;
      let d = 0;
      
      if (userSubscribe.value) {
        if (typeof userSubscribe.value === 'object') {
          if (userSubscribe.value.transfer_enable !== undefined) {
            transferEnable = userSubscribe.value.transfer_enable || 0;
            u = userSubscribe.value.u || 0;
            d = userSubscribe.value.d || 0;
          } else if (userSubscribe.value.data && userSubscribe.value.data.transfer_enable !== undefined) {
            transferEnable = userSubscribe.value.data.transfer_enable || 0;
            u = userSubscribe.value.data.u || 0;
            d = userSubscribe.value.data.d || 0;
          }
        }
      } 
      
      if (transferEnable === 0 && userInfo.value) {
        if (typeof userInfo.value === 'object') {
          if (userInfo.value.transfer_enable !== undefined) {
            transferEnable = userInfo.value.transfer_enable || 0;
            u = userInfo.value.u || 0;
            d = userInfo.value.d || 0;
          } else if (userInfo.value.data && userInfo.value.data.transfer_enable !== undefined) {
            transferEnable = userInfo.value.data.transfer_enable || 0;
            u = userInfo.value.data.u || 0;
            d = userInfo.value.data.d || 0;
          }
        }
      }
      
      const remainingBytes = transferEnable - (u + d);
      
      return (remainingBytes / (1024 * 1024 * 1024)).toFixed(2);
    };
    
    const extractBalance = () => {
      let balance = 0;
      
      if (userInfo.value) {
        if (typeof userInfo.value === 'object') {
          if (userInfo.value.balance !== undefined) {
            balance = userInfo.value.balance || 0;
          } else if (userInfo.value.data && userInfo.value.data.balance !== undefined) {
            balance = userInfo.value.data.balance || 0;
          }
        }
      }
      
      return balance;
    };
    
    const checkIfMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };
    
    const handleResize = () => {
      checkIfMobile();
      
      if (crispInitialized.value) {
        if (isMobile.value) {
          Crisp.setPosition("right");
        } else {
          Crisp.setPosition("left");
        }
        
        setCrispStyles();
      }
    };
    
    watch(() => store.getters.isLoggedIn, async (newVal) => {
      if (newVal) {
        if (CONFIG.value.type === 'crisp' && crispInitialized.value) {
        await fetchUserData();
        setUserDataToCrisp();
        } else if (CONFIG.value.type !== 'crisp' && window.$chatwoot) {
          await fetchUserData();
          const userEmail = extractUserEmail();
          if (userEmail) {
            window.$chatwoot.setUser(userEmail, {
              email: userEmail,
              name: userEmail.split('@')[0]
            });
            const planName = extractPlanName();
            const expireDate = extractExpireDate();
            const remainingGB = calculateRemainingTraffic();
            const balance = extractBalance();
            window.$chatwoot.setCustomAttributes({
              Plan: planName,
              Expires: expireDate,
              Traffic: remainingGB + ' GB',
              Balance: balance + ' ' + currencySymbol.value
            });
          }
        }
      }
    });
    
    // 监听语言变化，实时切换 Chatwoot 的语言
    watch(() => locale.value, (newLang) => {
      if (window.$chatwoot) {
        const chatwootLang = newLang === 'zh-TW' ? 'zh-TW' : (newLang === 'zh-CN' ? 'zh-CN' : 'en');
        window.$chatwoot.setLocale(chatwootLang);
      }
    });
    
    onMounted(async () => {
      checkIfMobile();
      
      if (CONFIG.value.enabled) {
        if (CONFIG.value.type === 'crisp') {
          await initCrisp();
        } else {
          loadOtherService();
        }
      }
      
      window.addEventListener('resize', handleResize);
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              if (node.classList && (node.classList.contains('crisp-client') || node.querySelector('.crisp-client'))) {
                setCrispStyles();
                setTimeout(setCrispStyles, 500);  
                setTimeout(setCrispStyles, 1500); 
                break;
              }
            }
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      window.crispObserver = observer;
    });
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      
      if (window.crispObserver) {
        window.crispObserver.disconnect();
        window.crispObserver = null;
      }
      
    });
    
    return {
      CONFIG
    };
  }
};
</script>

<style lang="scss" scoped>
.crisp-embed-container {
  
}


:global() {
  
}
</style> 
