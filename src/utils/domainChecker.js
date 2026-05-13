import { AUTHORIZED_DOMAINS, SECURITY_CONFIG } from './baseConfig';

/**
 * 检查当前域名是否在白名单中
 */
export const isDomainAuthorized = () => {
  if (!SECURITY_CONFIG.enableFrontendDomainCheck) {
    return true;
  }
  
  const currentDomain = window.location.hostname; 
  return AUTHORIZED_DOMAINS.includes(currentDomain); 
};

/**
 * 处理未授权域名
 * 如果域名未授权，仅在控制台输出警告，不再封杀页面
 */
export const handleUnauthorizedDomain = () => {
  if (!SECURITY_CONFIG.enableFrontendDomainCheck) {
    return true;
  }
  
  if (!isDomainAuthorized()) {
    console.warn('⚠️ 域名未授权访问:', window.location.hostname);
    // 为了防止 QQ/微信等环境误判导致白屏，这里强制返回 true
    return true; 
  }
  
  return true;
}; 
