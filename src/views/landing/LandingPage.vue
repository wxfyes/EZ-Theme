<template>
  <div class="landing-wrapper" :class="{ 'dark-theme': isDarkTheme }">
    <header :class="{ 'scrolled': isScrolled }">
      <div class="logo" @click="scrollToTop">
        <img v-if="siteConfig.showLogo" :src="siteConfig.logo || '/images/logo.png'" alt="Logo">
        <h1 id="siteName">{{ siteConfig.siteName }}</h1>
      </div>
      <nav class="nav-links">
        <a href="javascript:void(0)" @click="scrollToSection('features')">特性</a>
        <a href="javascript:void(0)" @click="scrollToSection('download')">客户端</a>
        <a v-if="siteConfig.showPricing" href="javascript:void(0)" @click="scrollToSection('pricing')">价格</a>
        <a href="javascript:void(0)" @click="navigateTo('tickets')">支持</a>
      </nav>
      <div class="nav-buttons">
        <div class="theme-toggle" id="themeToggle" @click="toggleTheme">
          <svg v-if="!isDarkTheme" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path><path d="M12 2l0 2"></path><path d="M12 20l0 2"></path><path d="M20 12l2 0"></path><path d="M2 12l2 0"></path><path d="M18.5 5.5l-1.5 1.5"></path><path d="M18.5 18.5l-1.5 -1.5"></path><path d="M5.5 5.5l1.5 1.5"></path><path d="M5.5 18.5l1.5 -1.5"></path></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9a9 9 0 1 1 -9 -9z"></path></svg>
        </div>
        <a href="javascript:void(0)" @click="navigateTo('login')" class="button secondary-button">登录</a>
        <a href="javascript:void(0)" @click="navigateTo('register')" class="button primary-button">注册</a>
      </div>
      <button class="mobile-menu-button" @click="toggleMobileMenu">☰</button>
    </header>

    <div class="mobile-nav-overlay" :class="{ 'active': mobileMenuOpen }" @click="toggleMobileMenu"></div>
    <div class="mobile-nav" :class="{ 'active': mobileMenuOpen }">
      <button class="close-menu" @click="toggleMobileMenu">✕</button>
      <div class="mobile-theme-toggle" @click="toggleTheme">
        <svg v-if="!isDarkTheme" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path><path d="M12 2l0 2"></path></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9a9 9 0 1 1 -9 -9z"></path></svg>
        <span>切换主题</span>
      </div>
      <div class="mobile-nav-links">
        <a href="javascript:void(0)" @click="navigateTo('login'); toggleMobileMenu();">登录账户</a>
        <a href="javascript:void(0)" @click="navigateTo('register'); toggleMobileMenu();">注册账户</a>
        <a href="javascript:void(0)" @click="scrollToSection('features'); toggleMobileMenu();">特性介绍</a>
        <a href="javascript:void(0)" @click="scrollToSection('download'); toggleMobileMenu();">客户端下载</a>
        <a v-if="siteConfig.showPricing" href="javascript:void(0)" @click="scrollToSection('pricing'); toggleMobileMenu();">价格方案</a>
        <a href="javascript:void(0)" @click="navigateTo('tickets'); toggleMobileMenu();">联系支持</a>
      </div>
    </div>

    <section class="hero">
      <h2 class="animate-up">{{ heroTitle }}</h2>
      <p class="animate-up delay-1">{{ siteConfig.landingSubtitle || '高速稳定、安全私密，助力业务数字化转型' }}</p>
      <div class="hero-buttons animate-up delay-2">
        <div class="main-action-buttons">
          <a href="javascript:void(0)" @click="navigateTo('login')" class="button primary-button">立即登录</a>
          <a href="javascript:void(0)" @click="navigateTo('register')" class="button secondary-button">立即注册</a>
        </div>
        <div class="hero-divider"></div>
        <a href="javascript:void(0)" @click="scrollToSection('download')" class="button outline-button download-button-hero">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path><polyline points="7 11 12 16 17 11"></polyline><line x1="12" y1="4" x2="12" y2="16"></line></svg>
          下载客户端
        </a>
      </div>
      <div class="hero-image-container animate-scale">
        <img :src="siteConfig.landingImage || '/images/zhanshi.jpg'" alt="Dashboard Preview" class="hero-image">
      </div>
    </section>

    <section class="features" id="features">
      <div class="section-title">
        <h3>专为极致体验设计</h3>
        <p>我们为您提供最优质的服务和极致的用户体验</p>
      </div>
      <div class="feature-grid">
        <div class="feature-card animate-scroll">
          <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path></svg></div>
          <h4>高速稳定</h4>
          <p>高速节点全球覆盖，智能路由技术，保障您的网络连接稳定流畅</p>
        </div>
        <div class="feature-card animate-scroll">
          <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path><path d="M8 11v-4a4 4 0 1 1 8 0v4"></path></svg></div>
          <h4>安全私密</h4>
          <p>采用军事级加密技术，保护您的网络隐私和数据安全</p>
        </div>
        <div class="feature-card animate-scroll">
          <div class="feature-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M3.6 9h16.8"></path><path d="M3.6 15h16.8"></path><path d="M11.5 3a17 17 0 0 0 0 18"></path><path d="M12.5 3a17 17 0 0 1 0 18"></path></svg></div>
          <h4>全球连接</h4>
          <p>多区域节点覆盖，助您畅享全球网络资源</p>
        </div>
      </div>
    </section>

    <section v-if="siteConfig.showPricing" class="pricing" id="pricing">
      <div class="section-title">
        <h3>选择适合您的方案</h3>
        <p>多种套餐灵活搭配，满足您的不同需求</p>
      </div>
      <div v-if="loadingPlans && plans.length === 0" class="loading-plans">
        <div class="skeleton-grid">
          <div v-for="i in 3" :key="i" class="skeleton-card"></div>
        </div>
      </div>
      <div class="pricing-grid">
        <div v-for="(plan, index) in plans" :key="plan.id" class="pricing-card" :class="{ 'featured': index === 1 }">
          <div v-if="index === 1" class="pricing-badge">最受欢迎</div>
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-price">¥{{ getDisplayPrice(plan) }}<span>{{ getPriceUnit(plan) }}</span></div>
          <ul class="plan-features">
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> {{ plan.transfer_enable }}GB 流量</li>
            <li v-for="(line, idx) in (plan.content || '').split('\n').filter(l => l.trim())" :key="idx">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 
              <span v-html="line"></span>
            </li>
          </ul>
          <a href="javascript:void(0)" @click="navigateTo('register')" class="button primary-button pricing-button">开启体验</a>
        </div>
      </div>
    </section>

    <section class="download" id="download">
      <div class="section-title">
        <h3>跨平台客户端</h3>
        <p>支持各大主流平台，随时随地畅享极速体验</p>
      </div>
      <div class="client-grid">
        <div v-if="clientConfig.showIOS" class="client-card animate-scroll" @click="handleDownload('ios')">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.286 7.008c-3.216 0 -4.286 3.23 -4.286 5.92c0 3.229 2.143 8.072 4.286 8.072c1.165 -.05 1.799 -.538 3.214 -.538c1.406 0 1.607 .538 3.214 .538s4.286 -3.229 4.286 -5.381c-.03 -.011 -2.649 -.434 -2.679 -3.23c-.02 -2.335 2.589 -3.179 2.679 -3.228c-1.096 -1.606 -3.162 -2.113 -3.75 -2.153c-1.535 -.12 -3.032 1.077 -3.75 1.077c-.729 0 -2.036 -1.077 -3.214 -1.077z"></path><path d="M12 4a2 2 0 0 0 2 -2a2 2 0 0 0 -2 2"></path></svg>
          <h4>iOS</h4>
          <p>适用于 iPhone 和 iPad 的客户端</p>
          <a href="javascript:void(0)" class="button primary-button">下载</a>
        </div>
        <div v-if="clientConfig.showAndroid" class="client-card animate-scroll" @click="handleDownload('android')">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l0 6"></path><path d="M20 10l0 6"></path><path d="M7 9h10v8a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-8a5 5 0 0 1 10 0"></path><path d="M8 3l1 2"></path><path d="M16 3l-1 2"></path><path d="M9 18l0 3"></path><path d="M15 18l0 3"></path></svg>
          <h4>Android</h4>
          <p>适用于安卓手机和平板的客户端</p>
          <a href="javascript:void(0)" class="button primary-button">下载</a>
        </div>
        <div v-if="clientConfig.showWindows" class="client-card animate-scroll" @click="handleDownload('windows')">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 20l-12 -1.5c-1 -.1 -1.8 -.9 -1.8 -1.9v-9.2c0 -1 .8 -1.8 1.8 -1.9l12 -1.5c1.2 -.1 2.2 .8 2.2 1.9v12.1c0 1.2 -1.1 2.1 -2.2 1.9z"></path><path d="M12 5l0 14"></path><path d="M4 12l16 0"></path></svg>
          <h4>Windows</h4>
          <p>适用于 Windows 系统的客户端</p>
          <a href="javascript:void(0)" class="button primary-button">下载</a>
        </div>
        <div v-if="clientConfig.showMacOS" class="client-card animate-scroll" @click="handleDownload('macos')">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19l18 0"></path><path d="M5 6m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"></path></svg>
          <h4>MacOS</h4>
          <p>适用于 Mac 电脑的客户端</p>
          <a href="javascript:void(0)" class="button primary-button">下载</a>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="cta-container animate-scroll">
        <h3>准备好开始您的探索了吗？</h3>
        <p>加入我们，即刻体验无限可能</p>
        <a href="javascript:void(0)" @click="navigateTo('register')" class="button cta-button">立即注册</a>
      </div>
    </section>

    <footer>
      <div class="footer-logo">
        <img v-if="siteConfig.showLogo" :src="siteConfig.logo || '/images/logo.png'" alt="Logo">
      </div>
      <div class="footer-links">
        <a href="javascript:void(0)" @click="handleDownload('githubRepo')">关于我们</a>
        <a href="javascript:void(0)" @click="handleDownload('githubReleases')">Github下载客户端</a>
        <a v-if="siteConfig.showPricing" href="javascript:void(0)" @click="navigateTo('shop')">价格</a>
        <a href="javascript:void(0)" @click="navigateTo('tickets')">支持</a>
      </div>
      <p class="copyright">{{ siteConfig.copyright || '© 2026. All Rights Reserved.' }}</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { SITE_CONFIG, CLIENT_CONFIG } from '@/utils/baseConfig';

export default {
  name: 'LandingPage',
  setup() {
    const router = useRouter();
    const store = useStore();
    const isScrolled = ref(false);
    const mobileMenuOpen = ref(false);
    const loadingPlans = ref(true);
    const plans = ref([]);
    
    const siteConfig = ref(SITE_CONFIG || {});
    const clientConfig = ref(CLIENT_CONFIG || {});
    const isDarkTheme = computed(() => store.getters.currentTheme === 'dark');

    const heroTitle = computed(() => {
      const texts = (SITE_CONFIG && SITE_CONFIG.landingText) || {};
      return texts['zh-CN'] || '极致网络体验，从这里开始';
    });

    const toggleTheme = () => {
      store.dispatch('toggleTheme');
    };

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
    };

    const getDisplayPrice = (plan) => {
      if (!plan) return '0.00';
      try {
        if (plan.month_price != null) return (plan.month_price / 100).toFixed(2);
        if (plan.onetime_price != null) return (plan.onetime_price / 100).toFixed(2);
        if (plan.quarter_price != null) return (plan.quarter_price / 100).toFixed(2);
        if (plan.year_price != null) return (plan.year_price / 100).toFixed(2);
      } catch (e) { console.error(e); }
      return '0.00';
    };

    const getPriceUnit = (plan) => {
      if (!plan) return '/起';
      if (plan.month_price != null) return '/月起';
      if (plan.onetime_price != null) return '/一次性';
      return '/起';
    };

    const scrollToSection = (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const navigateTo = (route) => {
      // 首字母大写以匹配路由名称
      const routeName = route.charAt(0).toUpperCase() + route.slice(1);
      router.push({ name: routeName }).catch(() => {
        // 后备方案
        router.push('/' + route);
      });
    };

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownload = (key) => {
      const links = (clientConfig.value && clientConfig.value.clientLinks) || {};
      const link = links[key];
      if (link && link !== '#' && link !== '') {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        router.push('/login');
      }
    };

    const fetchPlans = async () => {
      // 尝试从缓存读取
      const cachedPlans = localStorage.getItem('__cached_plans__');
      if (cachedPlans) {
        try {
          const parsed = JSON.parse(cachedPlans);
          if (Array.isArray(parsed)) plans.value = parsed;
          loadingPlans.value = false;
        } catch (e) { console.error('Cache read error', e); }
      }

      try {
        // 使用更兼容的请求方式
        const response = await fetch('/api/v1/guest/plan/fetch').catch(() => null);
        if (!response) return;
        
        const result = await response.json().catch(() => null);
        if (result && result.data && Array.isArray(result.data)) {
          plans.value = result.data;
          localStorage.setItem('__cached_plans__', JSON.stringify(result.data));
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        loadingPlans.value = false;
      }
    };

    const setupAnimations = () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-start');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.animate-scroll').forEach(el => observer.observe(el));
    };

    const onScroll = () => {
      isScrolled.value = window.scrollY > 50;
    };

    onMounted(() => {
      window.addEventListener('scroll', onScroll);
      if (siteConfig.value.showPricing) {
        fetchPlans();
      }
      setTimeout(setupAnimations, 500);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', onScroll);
    });

    return {
      siteConfig,
      clientConfig,
      heroTitle,
      isScrolled,
      mobileMenuOpen,
      isDarkTheme,
      loadingPlans,
      plans,
      toggleTheme,
      toggleMobileMenu,
      navigateTo,
      scrollToTop,
      handleDownload,
      getDisplayPrice,
      getPriceUnit,
      scrollToSection
    };
  }
};
</script>

<style lang="scss" scoped>
.landing-wrapper {
  --primary-color: #355cc2;
  --primary-color-light: #5c93ff;
  --primary-rgb: 53, 92, 194;
  --text-color: #333;
  --text-light: #666;
  --background-color: #fff;
  --section-bg: #f5f5f7;
  --button-hover: #2d4eaa;
  --primary-shadow: rgba(53, 92, 194, 0.3);

  &.dark-theme {
    --text-color: #f5f5f7;
    --text-light: #a1a1a6;
    --background-color: #1a1a1a;
    --section-bg: #0f0f0f;
    --primary-color: #5c93ff;
    --primary-shadow: rgba(92, 147, 255, 0.2);
  }

  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  transition: all 0.3s ease;
  overflow-x: hidden;
}

header {
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 5%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &.scrolled {
    padding: 12px 5%;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
  }
}

.dark-theme header {
  background-color: rgba(26, 26, 26, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  img { height: 32px; margin-right: 10px; border-radius: 8px; }
  h1 { font-size: 22px; font-weight: 600; color: var(--text-color); }
}

.nav-links {
  display: flex;
  gap: 30px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  a {
    color: var(--text-color);
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    transition: color 0.3s;
    &:hover { color: var(--primary-color); }
  }
}

.nav-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
}

.button {
  padding: 10px 22px;
  border-radius: 24px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.primary-button {
  background-color: var(--primary-color);
  color: white !important;
  box-shadow: 0 4px 15px var(--primary-shadow);
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--primary-shadow); }
}

.outline-button {
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  background: rgba(var(--primary-rgb), 0.05);
  &:hover { background: rgba(var(--primary-rgb), 0.1); transform: translateY(-2px); }
}

.secondary-button {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid rgba(0, 0, 0, 0.1);
  .dark-theme & { border-color: rgba(255, 255, 255, 0.1); }
  &:hover { background-color: rgba(0, 0, 0, 0.05); .dark-theme & { background-color: rgba(255, 255, 255, 0.05); } }
}

.hero {
  padding: 30px 5% 100px;
  text-align: center;
  background-image: radial-gradient(at 0% 0%, rgba(var(--primary-rgb), 0.05) 0, transparent 50%);
  
  @media (max-width: 768px) {
    padding: 100px 5% 60px; /* 调大手机端顶部间距，防止遮挡 */
  }
  
  h2 {
    font-size: 56px;
    font-weight: 800;
    margin-bottom: 24px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-color-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.1;
    @media (max-width: 768px) { font-size: 36px; }
  }

  p {
    font-size: 22px;
    color: var(--text-light);
    margin-bottom: 40px;
    max-width: 800px;
    margin-left: auto; margin-right: auto;
  }
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 60px;
}

.hero-divider {
  height: 15px;
}

.main-action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    .button { width: 100%; }
  }
}

.hero-image-container {
  margin-top: 60px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 70%; height: 70%;
    background: radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%);
    filter: blur(60px);
    z-index: -1;
  }
}

.hero-image {
  width: 100%;
  max-width: 900px;
  height: 550px;
  object-fit: cover;
  margin: 0 auto;
  display: block;
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
  animation: float 6s ease-in-out infinite;
  @media (max-width: 768px) {
    height: 200px;
    border-radius: 16px;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.section { padding: 100px 5%; }
.section-title {
  text-align: center;
  margin-bottom: 60px;
  h3 { font-size: 40px; font-weight: 700; margin-bottom: 16px; }
  p { font-size: 18px; color: var(--text-light); }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background-color: var(--section-bg);
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  &:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05); }
}

.feature-icon {
  width: 64px; height: 64px;
  margin: 0 auto 20px;
  background: rgba(var(--primary-rgb), 0.1);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  svg { stroke: var(--primary-color); width: 32px; height: 32px; }
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-card {
  background-color: var(--section-bg);
  padding: 30px 25px;
  border-radius: 24px;
  text-align: center;
  position: relative;
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  &.featured { border: 2px solid var(--primary-color); transform: scale(1.03); }
  &:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
  @media (max-width: 768px) {
    padding: 25px 20px;
    margin: 0 10px;
  }
}

.pricing-badge {
  position: absolute; top: 15px; right: -30px;
  background: var(--primary-color); color: white;
  padding: 4px 40px; transform: rotate(45deg);
  font-size: 12px; font-weight: 600;
}

.plan-price {
  font-size: 48px; font-weight: 800; color: var(--primary-color);
  margin: 20px 0;
  span { font-size: 16px; color: var(--text-light); }
}

.plan-features {
  list-style: none;
  margin: 25px 0;
  text-align: left;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 5px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
  .dark-theme &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

  li { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; color: var(--text-light); font-size: 14px; }
  svg { color: #10b981; flex-shrink: 0; }
}

.client-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 25px;
  max-width: 1100px;
  margin: 0 auto;
}

.client-card {
  background: var(--section-bg);
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  svg { color: var(--primary-color); margin-bottom: 20px; }
  h4 { margin-bottom: 8px; }
  p { font-size: 13px; color: var(--text-light); margin-bottom: 20px; }
  &:hover { transform: translateY(-8px); background: rgba(var(--primary-rgb), 0.05); }
}

.cta {
  padding: 80px 5%;
  .cta-container {
    max-width: 900px; margin: 0 auto;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-color-light));
    padding: 60px; border-radius: 30px;
    color: white; text-align: center;
    box-shadow: 0 20px 40px var(--primary-shadow);
    h3 { font-size: 36px; margin-bottom: 20px; }
    p { font-size: 18px; margin-bottom: 30px; opacity: 0.9; }
  }
}

.cta-button {
  background: white; color: var(--primary-color) !important;
  font-weight: 700; padding: 14px 40px;
  &:hover { background: #f8f9fa; }
}

footer {
  padding: 60px 5% 40px; text-align: center;
  .footer-logo img { height: 40px; margin-bottom: 30px; border-radius: 8px; }
}

.footer-links {
  display: flex; justify-content: center; gap: 30px; margin-bottom: 30px;
  a { color: var(--text-light); text-decoration: none; transition: color 0.2s; &:hover { color: var(--primary-color); } }
}

.copyright { font-size: 14px; color: var(--text-light); opacity: 0.7; }

/* 移动端菜单 */
.mobile-menu-button { display: none; font-size: 24px; background: none; border: none; color: var(--text-color); }

@media (max-width: 768px) {
  header { padding: 12px 20px; }
  .nav-links, .nav-buttons { display: none; }
  .mobile-menu-button { display: block; }
  
  .mobile-nav {
    position: fixed; top: 0; right: 0; bottom: 0; width: 280px;
    background: var(--background-color); z-index: 1100;
    padding: 80px 30px; transform: translateX(100%);
    transition: transform 0.3s ease;
    &.active { transform: translateX(0); box-shadow: -10px 0 30px rgba(0,0,0,0.1); }
  }

  .mobile-nav-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 1050; opacity: 0; visibility: hidden; transition: 0.3s;
    &.active { opacity: 1; visibility: visible; }
  }

  .close-menu { position: absolute; top: 20px; right: 20px; font-size: 24px; border: none; background: none; color: var(--text-color); }
  .mobile-nav-links { display: flex; flex-direction: column; gap: 20px; a { font-size: 18px; font-weight: 600; text-decoration: none; color: var(--text-color); } }
  .mobile-theme-toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; color: var(--text-color); }
}

.loading-plans {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 60px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.skeleton-card {
  height: 400px;
  background: linear-gradient(90deg, var(--section-bg) 25%, rgba(var(--primary-rgb), 0.05) 50%, var(--section-bg) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 24px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.animate-up { opacity: 0; transform: translateY(30px); animation: fadeInUp 0.8s forwards; }
.animate-scale { opacity: 0; transform: scale(0.95); animation: scaleIn 0.8s 0.4s forwards; }
.animate-scroll { opacity: 0; transform: translateY(30px); transition: all 0.8s ease; }
.animate-start { opacity: 1; transform: translateY(0); }

@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { to { opacity: 1; transform: scale(1); } }
.delay-1 { animation-delay: 0.15s; }
.delay-2 { animation-delay: 0.3s; }
</style>
