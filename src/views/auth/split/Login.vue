<template>
  <div class="login-view-container">
    <div class="auth-split-container">


      <!-- 左侧背景区域 -->
      <div class="auth-split-left" :style="leftSideStyles">
        <div class="left-content-overlay"></div>
        <div class="site-name"  v-if="showSiteName" :class="siteNameColorClass" @click="goTo('/')">
          {{ SITE_CONFIG.siteName }}
        </div>
        <div class="greeting-text" v-if="showGreeting" :class="greetingColorClass">
          {{ greetingMessage }}
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="auth-split-right">
        <!-- 顶部工具栏：语言选择器和主题切换 -->
        <div class="top-toolbar">
          <ThemeToggle />
          <LanguageSelector />
        </div>

        <div class="auth-form-container" v-if="configLoading">
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>{{ $t('common.loading') }}</p>
          </div>
        </div>

        <div class="auth-form-container" v-else>
          <div class="auth-header">
            <div class="auth-logo">
              <img
                :src="logoPath"
                alt="Logo"
                @error="handleLogoError"
                @click="goTo('/')"
              />
            </div>
            <h1 class="auth-title">{{ $t('auth.loginTitle') }}</h1>
            <p class="auth-subtitle">{{ $t('auth.loginSubtitle') }}</p>
          </div>

          <form class="auth-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">{{ $t('common.email') }} <span class="required">*</span></label>
              <div class="input-with-icon">
                <IconMail class="input-icon" />
                <input
                  type="email"
                  id="email"
                  v-model="formData.email"
                  class="form-control"
                  :placeholder="$t('auth.emailPlaceholder')"
                  required
                />
              </div>
              <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
            </div>

            <div class="form-group">
              <label for="password">{{ $t('common.password') }} <span class="required">*</span></label>
              <div class="input-with-icon">
                <IconLock class="input-icon" />
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="formData.password"
                  class="form-control"
                  :placeholder="$t('auth.passwordPlaceholder')"
                  required
                />
                <div class="password-toggle" @click="showPassword = !showPassword">
                  <IconEye v-if="!showPassword" />
                  <IconEyeOff v-else />
                </div>
              </div>
              <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            </div>

            <div class="form-options">
              <div class="remember-me">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="formData.rememberMe" />
                  <span class="checkmark"></span>
                  <span class="checkbox-label">{{ $t('common.rememberMe') }}</span>
                </label>
              </div>
              <router-link to="/forgot-password" class="forgot-password">
                {{ $t('common.forgotPassword') }}
              </router-link>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-wrapper">
                <span>{{ $t('common.loading') }}</span>
              </span>
              <span v-else>
                {{ $t('common.login') }}
                <IconArrowRight class="icon-right" />
              </span>
            </button>
          </form>

          <!-- 社交登录 -->
          <div class="social-login-section">
            <div class="auth-divider">
              <span class="auth-divider-text">{{ $t('auth.thirdPartyLogin') || '第三方账号登录' }}</span>
            </div>
            <div class="social-buttons">
              <a href="/api/v1/passport/auth/social/google" class="btn-social google-btn">
                <svg viewBox="0 0 24 24" class="social-icon">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.3-4.53-6.16-4.53z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </a>
              <a href="/api/v1/passport/auth/social/github" class="btn-social github-btn">
                <svg viewBox="0 0 24 24" class="social-icon"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div class="auth-footer">
            <div class="auth-divider">
              <span class="auth-divider-text">{{ $t('auth.noAccount') }}</span>
            </div>

            <router-link to="/register" class="btn btn-secondary btn-block" replace>
              {{ $t('auth.createAccount') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 验证码弹窗 -->
    <div class="captcha-modal" v-if="showCaptchaModal" :class="{ 'closing': isClosingModal }">
      <!-- 现有弹窗内容保持不变 -->
    </div>

    <!-- 自定义弹窗 -->
    <AuthPopup
      :show-popup="showAuthPopup"
      :title="authPopupConfig.title"
      :content="authPopupConfig.content"
      :cooldown-hours="authPopupConfig.cooldownHours"
      :close-wait-seconds="authPopupConfig.closeWaitSeconds"
      @close="handleAuthPopupClose"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from '@/composables/useToast';
import ThemeToggle from '@/components/common/ThemeToggle.vue';
import LanguageSelector from '@/components/common/LanguageSelector.vue';
import IconMail from '@/components/icons/IconMail.vue';
import IconLock from '@/components/icons/IconLock.vue';
import IconArrowRight from '@/components/icons/IconArrowRight.vue';
import IconEye from '@/components/icons/IconEye.vue';
import IconEyeOff from '@/components/icons/IconEyeOff.vue';
import { login, checkLoginStatus } from '@/api/auth';
import { validateEmail, validateRequired } from '@/utils/validators';

import DomainAuthAlert from '@/components/common/DomainAuthAlert.vue';
import { handleTokenLogin, hasVerifyToken } from '@/utils/tokenLogin';
import { AUTH_LAYOUT_CONFIG, SITE_CONFIG, AUTH_CONFIG } from '@/utils/baseConfig';
import AuthPopup from '@/components/auth/AuthPopup.vue';
import { shouldShowAuthPopup } from '@/utils/authPopupState';
import { useNavigator } from "@/composables/useNavigator";

export default {
  name: 'LoginView',
  components: {
    ThemeToggle,
    LanguageSelector,
    IconMail,
    IconLock,
    IconArrowRight,
    IconEye,
    IconEyeOff,
    DomainAuthAlert,
    AuthPopup
  },

  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const { showToast } = useToast();
    const { goTo } = useNavigator()

    const logoPath = ref('./images/logo.png');
    const handleLogoError = () => {
      logoPath.value = '/images/logo.png';
    };

    const formData = reactive({
      email: '',
      password: '',
      rememberMe: false
    });

    const errors = reactive({
      email: '',
      password: ''
    });

    const loading = ref(false);
    const configLoading = ref(false);

    const showCaptchaModal = ref(false);
    const isClosingModal = ref(false);

    const showAuthPopup = ref(false);
    const authPopupConfig = reactive({
      title: AUTH_CONFIG.popup?.title || '',
      content: AUTH_CONFIG.popup?.content || '',
      cooldownHours: AUTH_CONFIG.popup?.cooldownHours || 24,
      closeWaitSeconds: AUTH_CONFIG.popup?.closeWaitSeconds || 0
    });

    const handleAuthPopupClose = () => {
      showAuthPopup.value = false;
    };

    const showPassword = ref(false);



    const showSiteName = computed(() => {
      return AUTH_LAYOUT_CONFIG?.splitLayout?.leftContent?.siteName?.show !== false;
    });

    const siteNameColorClass = computed(() => {
      const color = AUTH_LAYOUT_CONFIG?.splitLayout?.leftContent?.siteName?.color || 'white';
      return color.toLowerCase() === 'black' ? 'black' : 'white';
    });

    const leftSideStyles = computed(() => {
      const backgroundImage = AUTH_LAYOUT_CONFIG?.splitLayout?.leftContent?.backgroundImage || '';

      if (backgroundImage) {
        return {
          'background-image': `url(${backgroundImage})`,
          'background-position': 'center',
          'background-size': 'cover',
          'background-repeat': 'no-repeat'
        };
      } else {
        return { background: 'var(--theme-color)' };
      }
    });

    const showGreeting = computed(() => {
      return AUTH_LAYOUT_CONFIG?.splitLayout?.leftContent?.greeting?.show !== false;
    });

    const greetingMessage = computed(() => {
      return getTimeBasedGreeting();
    });

    const greetingColorClass = computed(() => {
      const color = AUTH_LAYOUT_CONFIG?.splitLayout?.leftContent?.greeting?.color || 'white';
      return color.toLowerCase() === 'black' ? 'black' : 'white';
    });

    onMounted(async () => {


      const hasToken = hasVerifyToken();

      if (hasToken) {
        loading.value = true;

        try {
          const tokenLoginResult = await handleTokenLogin({
            onLoginSuccess: () => {
              console.log('令牌验证登录成功');
            }
          });


          if (tokenLoginResult.success) {
            return;
          }
        } catch (error) {
          console.error('令牌登录过程中出错:', error);
        } finally {
          loading.value = false;
        }
      }

      const urlParams = new URLSearchParams(window.location.search);
      const isJustLoggedOut = urlParams.get('logout') === 'true';

      if (isJustLoggedOut) {
        console.log('检测到用户刚刚登出，清除所有登录状态');
        showToast(t('auth.logoutSuccess'), 'success', 3000);

        if (window.history && window.history.replaceState) {
          const newUrl = window.location.href.replace('?logout=true', '').replace('&logout=true', '');
          window.history.replaceState({}, document.title, newUrl);
        }

        return;
      }

      try {
        if (window._isLoggingOut === true) {
          console.log('检测到全局登出标记，跳过登录状态检查');
          return;
        }

        const loginStatus = checkLoginStatus();

        if (loginStatus) {
          console.log('用户已登录，准备跳转到控制面板');
          showToast(t('auth.alreadyLoggedIn'), 'info');
          setTimeout(() => {
            router.push('/dashboard');
          }, 500);
        }

        showAuthPopup.value = shouldShowAuthPopup(AUTH_CONFIG.popup);
      } catch (error) {
        console.error("登录状态检查失败", error);
      }
    });

    const validateForm = () => {
      let isValid = true;

      errors.email = '';
      errors.password = '';

      if (!validateRequired(formData.email)) {
        errors.email = t('validation.emailRequired');
        isValid = false;
      } else if (!validateEmail(formData.email)) {
        errors.email = t('validation.emailInvalid');
        isValid = false;
      }

      if (!validateRequired(formData.password)) {
        errors.password = t('validation.passwordRequired');
        isValid = false;
      }

      return isValid;
    };

    const handleLogin = async () => {
      if (!validateForm()) {
        return;
      }

      loading.value = true;

      try {
        const response = await login(formData);

        showToast(response.message || t('auth.loginSuccess'), 'success', 3000);

        setTimeout(() => {
          router.push('/dashboard');
        }, 300);
      } catch (error) {
        showToast(error.response?.message || error.message || t('auth.loginFailed'), 'error');
      } finally {
        loading.value = false;
      }
    };

    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        return 'Good Morning';
      } else if (hour >= 12 && hour < 18) {
        return 'Good Afternoon';
      } else if (hour >= 18 && hour < 22) {
        return 'Good Evening';
      } else {
        return 'Good Night';
      }
    };

    return {
      formData,
      errors,
      loading,
      showPassword,
      handleLogin,

      logoPath,
      handleLogoError,
      leftSideStyles,
      configLoading,
      showCaptchaModal,
      isClosingModal,
      showSiteName,
      siteNameColorClass,
      SITE_CONFIG,
      showGreeting,
      greetingMessage,
      greetingColorClass,
      getTimeBasedGreeting,
      showAuthPopup,
      authPopupConfig,
      handleAuthPopupClose,
      goTo,
    };
  }
};
</script>

<style lang="scss" scoped>
.login-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  @media (max-width: 992px) {
    overflow-y: auto;
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
}

.auth-split-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.auth-split-left {
  flex: 1;
  min-width: 500px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  @media (max-width: 992px) {
    display: none;
  }

  .left-content-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .site-name {
    position: absolute;
    top: 30px;
    left: 30px;
    font-size: 1.5rem;
    font-weight: 700;
    z-index: 2;
    cursor: pointer;
    user-select: none;

    &.white {
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    &.black {
      color: #000000;
      text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
    }
  }

  .greeting-text {
    position: absolute;
    bottom: 30px;
    left: 30px;
    font-size: 1.5rem;
    font-weight: 600;
    z-index: 2;

    &.white {
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    &.black {
      color: #000000;
      text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
    }
  }
}

.auth-split-right {
  flex: 0.8;
  min-width: 320px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background-color: var(--background-color);
  overflow-y: auto;
  height: 100%;

  @media (max-width: 992px) {
    width: 100%;
    max-width: none;
    flex: 1;
    justify-content: center;
    overflow-y: visible;
    display: flex;
    padding: 60px 0;
    min-height: 100vh;
  }
}

.top-toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10;

  @media (max-width: 992px) {
    top: 10px;
    right: 10px;
  }
}

.auth-form-container {
  padding: 40px 40px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 992px) {
    padding: 20px;
    margin: auto;
    width: 100%;
  }
}

.auth-header {
  margin-bottom: 2rem;
  text-align: center;

  @media (min-width: 993px) {
    text-align: left;
  }

  .auth-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--primary-text-color);

    @media (min-width: 993px) {
      text-align: left;
    }
  }

  .auth-subtitle {
    font-size: 1rem;
    color: var(--secondary-text-color);
    margin-bottom: 1.5rem;

    @media (min-width: 993px) {
      text-align: left;
    }
  }
}

.required {
  color: #ff4d4f;
  margin-left: 4px;
  font-size: 16px;
  vertical-align: middle;
}

.input-with-icon {
  position: relative;
  width: 100%;

  .input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--secondary-text-color);
    width: 20px;
    height: 20px;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;

    &:hover {
      color: var(--theme-color);
    }
  }

  .form-control {
    padding-left: 40px;
    height: 45px;
    border-radius: 8px;
    border: 1px solid var(--input-border-color, transparent);
    background-color: var(--input-bg-color, #f9f9f9);
    transition: all 0.3s ease;
    color: var(--primary-text-color);

    &[type="password"],
    &[type="text"] {
      padding-right: 40px;
    }

    &:focus {
      outline: none;
      border-color: var(--theme-color);
      box-shadow: 0 0 0 2px var(--primary-color-focus);
      background-color: var(--input-focus-bg-color, #fff);
    }

    &::placeholder {
      color: var(--placeholder-color, #aaa);
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  .remember-me .checkbox-container {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 30px;
    cursor: pointer;
    user-select: none;

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;

      &:checked ~ .checkmark {
        background-color: var(--theme-color);
        border-color: var(--theme-color);

        &:after {
          display: block;
        }
      }
    }

    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 20px;
      width: 20px;
      background-color: transparent;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      transition: all 0.2s ease;

      &:after {
        content: "";
        position: absolute;
        display: none;
        left: 5px;
        top: 0.5px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    .checkbox-label {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
    }
  }

  .forgot-password {
    color: var(--theme-color);
    font-size: 0.875rem;
    text-decoration: none;
    transition: color 0.3s ease, opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

.btn {
  height: 45px;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &.btn-primary {
    background-color: var(--theme-color);
    border: none;
    color: white;
    font-weight: 600;

    &:hover:not(:disabled) {
      background-color: var(--primary-color-hover);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .icon-right {
      margin-left: 8px;
    }
  }
}

.error-message {
  display: block;
  color: #ff4d4f;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}


@media (max-width: 576px) {
  .auth-form-container {
    padding: 30px 20px;
    margin: auto;
  }

  .auth-split-right {
    padding: 20px 0;
  }

  .form-options {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;

    .remember-me {
      flex: 0 0 auto;
    }

    .forgot-password {
      flex: 0 0 auto;
      margin-left: auto;
    }
  }
}


@media (min-width: 576px) and (max-width: 992px) {
  .auth-split-right {
    padding: 2rem;
  }
}


.dark-theme {
  .input-with-icon {
    .input-icon {
      color: var(--secondary-text-color);
    }

    .form-control {
      background-color: var(--input-bg-color, #333);
      border-color: var(--input-border-color, #444);

      &:focus {
        background-color: var(--input-focus-bg-color, #3a3a3a);
        border-color: var(--theme-color);
      }

      &::placeholder {
        color: var(--placeholder-color, #777);
      }
    }
  }

  .checkbox-container {
    .checkbox-label {
      color: var(--secondary-text-color);
    }

    .checkmark {
      background-color: transparent;
      border-color: var(--border-color, #555);
    }
  }
}

.auth-footer {
  margin-top: 24px;

  a.btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-decoration: none;
    height: 45px !important;
    line-height: normal !important;
  }
}

.btn.btn-secondary.btn-block {
  height: 45px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: normal !important;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  background-color: transparent;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--theme-color);
    background-color: rgba(var(--theme-color-rgb), 0.05);
    color: var(--theme-color) !important;
    -webkit-text-fill-color: var(--theme-color) !important;
    background-image: none !important;
  }
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  svg {
    display: none;
  }

  &::before {
    content: "";
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }

  span {
    display: inline-block;
    animation: pulse 1.5s infinite ease-in-out;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auth-logo {
  margin-bottom: 1.5rem;
  text-align: center;

  @media (min-width: 993px) {
    text-align: left;
  }

  img {
    width: 60px;
    height: 60px;
    min-width: 60px;
    min-height: 60px;
    border-radius: 12px;
    object-fit: cover;
    cursor: pointer;
    user-select: none;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100vh;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(var(--theme-color-rgb), 0.3);
    border-radius: 50%;
    border-top-color: var(--theme-color);
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    color: var(--secondary-text-color);
    font-size: 1rem;
  }
}

@media (min-width: 993px) and (max-height: 700px) {
  .auth-split-right {
    justify-content: flex-start;
  }
}

.social-login-section {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.social-buttons {
  display: flex;
  gap: 15px;
  margin-top: 1rem;
}

.btn-social {
  flex: 1;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color, #e0e0e0);
  background-color: var(--card-bg, #ffffff);
  color: var(--primary-text-color, #333333);
}

.btn-social:hover {
  background-color: var(--input-bg-color, #f5f5f5);
  border-color: var(--theme-color);
  transform: translateY(-1px);
}

.social-icon {
  width: 18px;
  height: 18px;
}

.google-btn svg {
  /* color: #ea4335; */
}

.github-btn svg {
  color: #24292e;
}

.dark-theme .github-btn svg {
  color: #ffffff;
}
</style>
