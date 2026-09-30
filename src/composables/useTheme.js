import { ref, watch, onMounted, onUnmounted } from 'vue';
import { THEME_CONFIG } from '@/utils/baseConfig';

// 模块级单例状态，确保整个应用共享同一定时器和监听器
const theme = ref(THEME_CONFIG.defaultTheme);
let isInitialized = false;

const applyTheme = (selectedTheme) => {
  const root = document.documentElement;
  const themeVars = THEME_CONFIG[selectedTheme] || THEME_CONFIG.light;
  
  if (selectedTheme === 'dark') {
    root.classList.add('dark-theme');
    document.body.classList.add('dark-theme');
  } else {
    root.classList.remove('dark-theme');
    document.body.classList.remove('dark-theme');
  }
  
  // 移除强制回流 document.body.offsetHeight，完全避免卡顿
  root.style.setProperty('--theme-color', themeVars.primaryColor);
  root.style.setProperty('--theme-color-rgb', themeVars.primaryColorRgb);
  root.style.setProperty('--theme-hover-color', themeVars.primaryColorHover);
  root.style.setProperty('--primary-color-hover', themeVars.primaryColorHover);
  root.style.setProperty('--background-color', themeVars.backgroundColor);
  root.style.setProperty('--card-background', themeVars.cardBackground);
  root.style.setProperty('--card-bg-color', themeVars.cardBackground);
  root.style.setProperty('--text-color', themeVars.textColor);
  root.style.setProperty('--secondary-text-color', themeVars.secondaryTextColor);
  root.style.setProperty('--border-color', themeVars.borderColor);
  root.style.setProperty('--shadow-color', themeVars.shadowColor);
};

const initTheme = () => {
  if (isInitialized) return;
  isInitialized = true;
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.value = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark';
  }
  applyTheme(theme.value);
};

const handleSystemThemeChange = (e) => {
  if (!localStorage.getItem('theme')) {
    theme.value = e.matches ? 'dark' : 'light';
    applyTheme(theme.value);
  }
};

if (typeof window !== 'undefined' && window.matchMedia) {
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (colorSchemeQuery.addEventListener) {
    colorSchemeQuery.addEventListener('change', handleSystemThemeChange);
  }
}

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
    applyTheme(theme.value);
  };
  
  onMounted(() => {
    initTheme();
  });
  
  return {
    theme,
    toggleTheme,
    applyTheme
  };
}
