

import { createRouter, createWebHashHistory } from 'vue-router';

import { SITE_CONFIG, DEFAULT_CONFIG, isBrowserRestricted, TRAFFICLOG_CONFIG, isXiaoV2board, AUTH_LAYOUT_CONFIG } from '@/utils/baseConfig';

import i18n from '@/i18n';

import pageCache from '@/utils/pageCache';



const LandingPage = () => import('@/views/landing/LandingPage.vue');

const CustomLandingPage = () => import('@/views/landing/CustomLandingPage.vue');

const ApiValidation = () => import('@/views/errors/ApiValidation.vue');



const getAuthComponent = (componentName) => {

  const layoutType = AUTH_LAYOUT_CONFIG?.layoutType || 'center';

  return () => import(`@/views/auth/${layoutType}/${componentName}.vue`);

};



const Login = getAuthComponent('Login');

const Register = getAuthComponent('Register');

const ForgotPassword = getAuthComponent('ForgotPassword');

const Dashboard = () => import('@/views/dashboard/Dashboard.vue');

const MainBoard = () => import('@/views/layout/MainBoard.vue');

const Profile = () => import('@/views/profile/UserProfile.vue');

const BrowserRestricted = () => import('@/views/errors/BrowserRestricted.vue');

const NotFound = () => import('@/views/errors/NotFound.vue');

const CustomerService = () => import('@/views/service/CustomerService.vue');



const routes = [

  {

    path: '/',

    redirect: DEFAULT_CONFIG.enableLandingPage ? '/landing' : '/login'

  },

  {

    path: '/api-validation',

    name: 'ApiValidation',

    component: ApiValidation,

    meta: {

      titleKey: 'common.apiChecking',

      requiresAuth: false

    }

  },

  {

    path: '/landing',

    name: 'Landing',

    component: getCustomOrDefaultLandingPage(),

    meta: {

      titleKey: 'landing.mainText',

      requiresAuth: false

    },

    beforeEnter: (to, from, next) => {

      if (!DEFAULT_CONFIG.enableLandingPage) {

        next('/login');

      } else {

        next();

      }

    }

  },

  {

    path: '/login',

    name: 'Login',

    component: Login,

    meta: {

      titleKey: 'common.login',

      requiresAuth: false

    }

  },

  {

    path: '/register',

    name: 'Register',

    component: Register,

    meta: {

      titleKey: 'common.register',

      requiresAuth: false,

      keepAlive: true

    }

  },

  {

    path: '/forgot-password',

    name: 'ForgotPassword',

    component: ForgotPassword,

    meta: {

      titleKey: 'common.forgotPassword',

      requiresAuth: false,

      keepAlive: true

    }

  },

  {

    path: '/browser-restricted',

    name: 'BrowserRestricted',

    component: BrowserRestricted,

    meta: {

      titleKey: 'errors.browserRestricted',

      requiresAuth: false

    }

  },

  {

    path: '/customer-service',

    name: 'CustomerService',

    component: CustomerService,

    meta: {

      titleKey: 'service.title',

      requiresAuth: false 
    }

  },

  {

    path: '/',

    component: MainBoard,

    meta: { 

      requiresAuth: true 

    },

    children: [

      {

        path: 'dashboard',

        name: 'Dashboard',

        component: Dashboard,

        meta: {

          titleKey: 'menu.dashboard',

          requiresAuth: true,

          keepAlive: true

        }

      },

      {

        path: 'shop',

        name: 'Shop',

        component: () => import('@/views/shop/Shop.vue'),

        meta: {

          titleKey: 'menu.shop',

          requiresAuth: true,

          keepAlive: true

        }

      },

      {

        path: 'order-confirm',

        name: 'OrderConfirm',

        component: () => import('@/views/shop/OrderConfirm.vue'),

        meta: {

          titleKey: 'orders.confirmOrder',

          requiresAuth: true,

          activeNav: 'Shop' 
        }

      },

      {

        path: 'payment',

        name: 'Payment',

        component: () => import('@/views/shop/Payment.vue'),

        meta: {

          titleKey: 'orders.payment',

          requiresAuth: true,

          activeNav: 'Shop' 
        }

      },

      {

        path: 'invite',

        name: 'Invite',

        component: () => import('@/views/invite/Invite.vue'),

        meta: {

          titleKey: 'menu.invite',

          requiresAuth: true,

          keepAlive: true

        }

      },

      {

        path: 'more',

        name: 'More',

        component: () => import('@/views/more/MoreOptions.vue'),

        meta: {

          titleKey: 'menu.more',

          requiresAuth: true

        }

      },

      {

        path: 'docs',

        name: 'Docs',

        component: () => import('@/views/docs/DocsPage.vue'),

        meta: {

          titleKey: 'more.viewHelp',

          requiresAuth: true,

          activeNav: 'More' 
        }

      },

      {

        path: 'docs/:id',

        name: 'DocDetail',

        component: () => import('@/views/docs/DocDetail.vue'),

        meta: {

          titleKey: 'more.viewHelp',

          requiresAuth: true,

          activeNav: 'More' 
        }

      },

      {

        path: 'nodes',

        name: 'NodeList',

        component: () => import('@/views/servers/NodeList.vue'),

        meta: {

          titleKey: 'nodes.title',

          requiresAuth: true,

          activeNav: 'More' 
        }

      },

      {

        path: 'orders',

        name: 'OrderList',

        component: () => import('@/views/orders/OrderList.vue'),

        meta: {

          titleKey: 'orders.title',

          requiresAuth: true,

          activeNav: 'More' 
        }

      },

      {

        path: 'tickets',

        name: 'TicketList',

        component: () => import('@/views/ticket/TicketList.vue'),

        meta: {

          titleKey: 'tickets.title',

          requiresAuth: true,

          activeNav: 'More' 
        }

      },

      {

        path: 'mobile/tickets',

        name: 'MobileTickets',

        component: () => import('@/views/ticket/MobileTicketList.vue'),

        meta: {

          titleKey: 'tickets.title',

          requiresAuth: true,

          activeNav: 'More' 
        }

      },

      {

        path: 'profile',

        name: 'Profile',

        component: Profile,

        meta: {

          titleKey: 'profile.title',

          requiresAuth: true,

          activeNav: 'More' 
        }

      },

      {

        path: 'trafficlog',

        name: 'TrafficLog',

        component: () => import('@/views/trafficLog/TrafficLog.vue'),

        meta: {

          titleKey: 'trafficLog.title',

          requiresAuth: true,

          activeNav: 'More' 
        },

        beforeEnter: (to, from, next) => {

          if (!TRAFFICLOG_CONFIG.enableTrafficLog) {

            next('/dashboard');

          } else {

            next();

          }

        }

      },

      {

        path: 'wallet/deposit',

        name: 'Deposit',

        component: () => import('@/views/wallet/WalletDeposit.vue'),

        meta: {

          titleKey: 'wallet.deposit.title',

          requiresAuth: true,

          activeNav: 'More' 
        },

        beforeEnter: (to, from, next) => {

          if (!isXiaoV2board()) {

            next('/dashboard');

          } else {

            next();

          }

        }

      }

    ]

  },

  {

    path: '/:pathMatch(.*)*',

    name: 'NotFound',

    component: NotFound,

    meta: {

      titleKey: 'errors.notFound',

      requiresAuth: false

    }

  }

];



const router = createRouter({

  history: createWebHashHistory(),

  routes,

  scrollBehavior() {

    return { top: 0 };

  }

});



// 智能提取专属二级域名中的邀请码 (如 https://Lyhk1LDP.tianque.cc)
function getSubdomainInviteCode() {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;
  if (/^(\d+\.){3}\d+$/.test(hostname) || hostname === 'localhost' || hostname.startsWith('www.')) {
    return null;
  }
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const potentialCode = parts[0];
    const systemPrefixes = ['api', 'admin', 'panel', 'mail', 'cdn', 'static', 'assets', 'dev', 'test', 'app'];
    if (potentialCode && /^[a-zA-Z0-9]{4,16}$/.test(potentialCode) && !systemPrefixes.includes(potentialCode.toLowerCase())) {
      return potentialCode;
    }
  }
  return null;
}

router.beforeEach((to, from, next) => {
  if (to.name !== 'BrowserRestricted' && isBrowserRestricted()) {
    return next({ name: 'BrowserRestricted' });
  }

  // 若通过专属二级域名访问 (例如 https://Lyhk1LDP.tianque.cc)，自动重定向到注册页面并附带邀请码
  if (to.path === '/' || to.path === '/landing' || to.path === '/login') {
    const subCode = getSubdomainInviteCode();
    if (subCode && !to.query.code) {
      return next({ path: '/register', query: { ...to.query, code: subCode } });
    }
  }

  if (to.meta.titleKey && i18n.global && i18n.global.t) {
    try {
      const title = i18n.global.t(to.meta.titleKey);
      if (title && title !== to.meta.titleKey) {
        document.title = SITE_CONFIG.siteName ? `${title} - ${SITE_CONFIG.siteName}` : title;
      } else {
        document.title = SITE_CONFIG.siteName || 'Dashboard';
      }
    } catch (e) {
      document.title = SITE_CONFIG.siteName || 'Dashboard';
    }
  } else {
    document.title = SITE_CONFIG.siteName || 'Dashboard';
  }

  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login' });
  } else if (to.path === '/login' && token) {
    return next({ path: '/dashboard' });
  }

  if (to.meta.keepAlive && to.name) {
    pageCache.addRouteToCache(to.name);
  } else if (to.name && to.meta.keepAlive === false) {
    pageCache.removeRouteFromCache(to.name);
  }

  next();
});



router.afterEach(() => {

  setTimeout(() => {

    document.body.classList.remove('page-transitioning');

  }, 400);

});

// 全局捕获由于静态文件发版更新导致的旧 Chunk 404 错位，带时间戳强行击穿本地缓存自愈
router.onError((error) => {
  const pattern = /Loading (CSS )?chunk .* failed|ChunkLoadError/i;
  if (pattern.test(error.message) || error.name === 'ChunkLoadError') {
    console.warn('检测到系统版本更新，正在穿透本地缓存自愈...');
    const now = Date.now();
    const hash = window.location.hash || '#/';
    window.location.replace(window.location.origin + window.location.pathname + '?_t=' + now + hash);
  }
});



function getCustomOrDefaultLandingPage() {

  if (!SITE_CONFIG.customLandingPage) {

    return LandingPage;

  }

  return CustomLandingPage;

}



export default router; 
