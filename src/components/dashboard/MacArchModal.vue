<template>
  <transition name="fade">
    <div v-if="show" class="dialog-overlay" @click.self="handleClose">
      <div class="dialog-container mac-modal-container">
        <!-- 弹窗头部 -->
        <div class="dialog-header">
          <div class="header-left">
            <div class="header-icon-box">
              <IconBrandFinder :size="20" />
            </div>
            <div>
              <h3 class="dialog-title">MacOS 客户端下载</h3>
              <p class="dialog-subtitle">请选择匹配您 Mac 电脑芯片架构的安装包</p>
            </div>
          </div>
          <button class="dialog-close-btn" @click="handleClose">
            <IconX :size="18" />
          </button>
        </div>

        <!-- 弹窗主体 -->
        <div class="dialog-body">
          <!-- 智能识别状态横幅 -->
          <div v-if="detectedArch === 'arm64'" class="banner banner-arm">
            <IconSparkles :size="18" class="banner-icon animate-pulse" />
            <div class="banner-text">
              <span class="banner-title">✨ 已智能检测到当前设备：</span>
              <span class="banner-highlight">Apple Silicon (M系列芯片)</span>
              <p class="banner-desc">已为您优先推荐并高亮此架构，点击下方按钮即可一键高速下载。</p>
            </div>
          </div>

          <div v-else-if="detectedArch === 'x64'" class="banner banner-intel">
            <IconSparkles :size="18" class="banner-icon animate-pulse" />
            <div class="banner-text">
              <span class="banner-title">✨ 已智能检测到当前设备：</span>
              <span class="banner-highlight">Intel 处理器架构</span>
              <p class="banner-desc">已为您优先推荐并高亮此架构，点击下方按钮即可一键高速下载。</p>
            </div>
          </div>

          <div v-else class="banner banner-other">
            <IconInfoCircle :size="16" class="banner-icon" />
            <span>当前非 Mac 设备访问，请根据目标 Mac 电脑的芯片类型选择下载。</span>
          </div>

          <!-- 双架构卡片列表 -->
          <div class="arch-card-list">
            <!-- ARM64 卡片 -->
            <div
              v-if="macConfig.arm || macConfig.legacy"
              class="arch-card"
              :class="{ 'is-recommended-arm': detectedArch === 'arm64' }"
            >
              <div v-if="detectedArch === 'arm64'" class="badge-recommended badge-arm">
                <IconSparkles :size="12" />
                <span>推荐当前设备</span>
              </div>
              <div class="arch-info">
                <h4 class="arch-name">Apple Silicon 芯片 (ARM64)</h4>
                <p class="arch-desc">适用 M1 / M2 / M3 / M4 及 Pro/Max/Ultra 芯片（2020 年及以后发布的 Mac）</p>
              </div>
              <a
                :href="macConfig.arm || macConfig.legacy"
                target="_blank"
                class="download-btn"
                :class="{ 'btn-highlight-arm': detectedArch === 'arm64' }"
              >
                <IconDownload :size="14" />
                <span>下载 ARM64 版</span>
              </a>
            </div>

            <!-- Intel 卡片 -->
            <div
              v-if="macConfig.intel || macConfig.legacy"
              class="arch-card"
              :class="{ 'is-recommended-intel': detectedArch === 'x64' }"
            >
              <div v-if="detectedArch === 'x64'" class="badge-recommended badge-intel">
                <IconSparkles :size="12" />
                <span>推荐当前设备</span>
              </div>
              <div class="arch-info">
                <h4 class="arch-name">Intel 处理器 (x86_64)</h4>
                <p class="arch-desc">适用 Intel Core i3 / i5 / i7 / i9 / Xeon 处理器（2020 年以前发布的老款 Mac）</p>
              </div>
              <a
                :href="macConfig.intel || macConfig.legacy"
                target="_blank"
                class="download-btn"
                :class="{ 'btn-highlight-intel': detectedArch === 'x64' }"
              >
                <IconDownload :size="14" />
                <span>下载 Intel 版</span>
              </a>
            </div>
          </div>

          <!-- 底部指引 -->
          <div class="dialog-footer-tip">
            <IconInfoCircle :size="13" />
            <span class="inline-flex items-center gap-1">
              如何查看芯片：点击 Mac 屏幕左上角苹果图标
              <IconBrandApple :size="13" class="inline" />
              ➔【关于本机】即可查看处理器型号
            </span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, watch } from 'vue';
import {
  IconX,
  IconBrandFinder,
  IconBrandApple,
  IconSparkles,
  IconDownload,
  IconInfoCircle
} from '@tabler/icons-vue';
import { detectMacArchitecture } from '@/utils/hardwareDetector';

export default {
  name: 'MacArchModal',
  components: {
    IconX,
    IconBrandFinder,
    IconBrandApple,
    IconSparkles,
    IconDownload,
    IconInfoCircle
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    macConfig: {
      type: Object,
      default: () => ({
        arm: '',
        intel: '',
        legacy: '',
        hasMultiArch: false
      })
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const detectedArch = ref('unknown');

    watch(
      () => props.show,
      (val) => {
        if (val) {
          detectedArch.value = detectMacArchitecture();
        }
      },
      { immediate: true }
    );

    const handleClose = () => {
      emit('close');
    };

    return {
      detectedArch,
      handleClose
    };
  }
};
</script>

<style lang="scss" scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.mac-modal-container {
  width: 100%;
  max-width: 480px;
  background-color: var(--card-bg, #ffffff);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color, #1e293b);
  }

  .dialog-title {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--text-color, #0f172a);
  }

  .dialog-subtitle {
    margin: 2px 0 0;
    font-size: 11px;
    color: var(--text-muted, #64748b);
  }

  .dialog-close-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--text-muted, #94a3b8);
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      color: var(--text-color, #0f172a);
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

.dialog-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.banner {
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;

  &.banner-arm {
    background: rgba(14, 165, 233, 0.08);
    border: 1px solid rgba(14, 165, 233, 0.25);
    color: #0369a1;

    .banner-icon {
      color: #0284c7;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .banner-highlight {
      font-weight: 700;
      color: #0284c7;
    }

    .banner-desc {
      margin: 2px 0 0;
      font-size: 11px;
      opacity: 0.85;
    }
  }

  &.banner-intel {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
    color: #b45309;

    .banner-icon {
      color: #d97706;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .banner-highlight {
      font-weight: 700;
      color: #d97706;
    }

    .banner-desc {
      margin: 2px 0 0;
      font-size: 11px;
      opacity: 0.85;
    }
  }

  &.banner-other {
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.06);
    color: var(--text-muted, #64748b);
    align-items: center;

    .banner-icon {
      flex-shrink: 0;
    }
  }
}

.arch-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.arch-card {
  position: relative;
  border-radius: 14px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  background: var(--bg-hover, rgba(0, 0, 0, 0.015));
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s;

  &.is-recommended-arm {
    border-color: #0284c7;
    background: rgba(14, 165, 233, 0.04);
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
  }

  &.is-recommended-intel {
    border-color: #d97706;
    background: rgba(245, 158, 11, 0.04);
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
  }

  .badge-recommended {
    position: absolute;
    top: -9px;
    right: 14px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 4px;

    &.badge-arm {
      background: #0284c7;
    }

    &.badge-intel {
      background: #d97706;
    }
  }

  .arch-info {
    min-width: 0;
    flex: 1;

    .arch-name {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-color, #0f172a);
    }

    .arch-desc {
      margin: 3px 0 0;
      font-size: 11px;
      color: var(--text-muted, #64748b);
      line-height: 1.4;
    }
  }

  .download-btn {
    flex-shrink: 0;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    background: rgba(0, 0, 0, 0.06);
    color: var(--text-color, #1e293b);

    &:hover {
      background: #0284c7;
      color: #ffffff;
    }

    &.btn-highlight-arm {
      background: #0284c7;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);

      &:hover {
        background: #0369a1;
      }
    }

    &.btn-highlight-intel {
      background: #d97706;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25);

      &:hover {
        background: #b45309;
      }
    }
  }
}

.dialog-footer-tip {
  padding-top: 6px;
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 深色模式适配 */
:global(.dark) {
  .mac-modal-container {
    background-color: #1e222d;
    border-color: rgba(255, 255, 255, 0.08);
  }

  .dialog-header {
    border-bottom-color: rgba(255, 255, 255, 0.06);

    .header-icon-box {
      background: rgba(255, 255, 255, 0.06);
      color: #f1f5f9;
    }

    .dialog-title {
      color: #f8fafc;
    }

    .dialog-subtitle {
      color: #94a3b8;
    }

    .dialog-close-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
  }

  .banner.banner-other {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.06);
    color: #94a3b8;
  }

  .arch-card {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);

    .arch-name {
      color: #f8fafc;
    }

    .arch-desc {
      color: #94a3b8;
    }

    .download-btn {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;

      &:hover {
        background: #0284c7;
        color: #ffffff;
      }
    }
  }

  .dialog-footer-tip {
    border-top-color: rgba(255, 255, 255, 0.06);
    color: #64748b;
  }
}
</style>
