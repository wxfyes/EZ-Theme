/**
 * 客户端运行环境与硬件架构智能探测工具 (EZ-Theme 版)
 * 立足第一性原理，利用 WebGL GPU 渲染器特征与 Client Hints 穿透现代浏览器的 UA 伪装
 */

let cachedMacArch = null;

/**
 * 判断当前操作系统是否为 macOS
 * @returns {boolean}
 */
export function isMacOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  return /Macintosh|Mac OS X/i.test(ua) || /Mac/i.test(platform);
}

/**
 * 智能探测 macOS 的 CPU 芯片架构
 * 现代浏览器（Safari、Chrome 等）在 macOS 上的 navigator.userAgent 均被官方写死为 "Intel Mac OS X 10_15_7"
 * 本函数通过 WebGL 底层 UNMASKED_RENDERER_WEBGL 与 User-Agent Client Hints 双因子穿透识别
 * 
 * @returns {'arm64' | 'x64' | 'not_mac' | 'unknown'}
 */
export function detectMacArchitecture() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'unknown';

  if (!isMacOS()) {
    return 'not_mac';
  }

  if (cachedMacArch) {
    return cachedMacArch;
  }

  // 1. 尝试 WebGL GPU 渲染器嗅探 (同步执行，覆盖 Safari、Chrome、Edge、Firefox)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
        const vendor = (gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '').toLowerCase();

        // Apple Silicon 判定: 渲染器字符串包含 Apple M 系列芯片或 Apple GPU
        if (renderer.includes('apple m') || renderer.includes('apple gpu') || (vendor.includes('apple') && !renderer.includes('intel') && !renderer.includes('amd'))) {
          cachedMacArch = 'arm64';
          return 'arm64';
        }

        // Intel Mac 判定: 常见如 "intel iris", "intel(r) uhd graphics", "amd radeon pro"
        if (renderer.includes('intel') || renderer.includes('amd') || renderer.includes('radeon')) {
          cachedMacArch = 'x64';
          return 'x64';
        }
      }
    }
  } catch (e) {
    // 忽略 WebGL 异常
  }

  // 2. 尝试 Chromium 浏览器的 User-Agent Client Hints (针对部分 Chrome/Edge)
  if (navigator.userAgentData && Array.isArray(navigator.userAgentData.brands)) {
    if (typeof navigator.userAgentData.getHighEntropyValues === 'function') {
      navigator.userAgentData.getHighEntropyValues(['architecture']).then((values) => {
        if (values && values.architecture) {
          const arch = values.architecture.toLowerCase();
          if (arch.includes('arm')) {
            cachedMacArch = 'arm64';
          } else if (arch.includes('x86')) {
            cachedMacArch = 'x64';
          }
        }
      }).catch(() => {});
    }
  }

  // 3. 兜底策略: 现代 Mac 设备 Apple Silicon 占绝大多数 (>85%)，默认推荐 arm64
  cachedMacArch = 'arm64';
  return 'arm64';
}
