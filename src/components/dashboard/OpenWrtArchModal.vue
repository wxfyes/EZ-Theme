<template>
  <transition name="fade">
    <div v-if="show" class="dialog-overlay" @click.self="handleClose">
      <div class="dialog-container openwrt-modal-container">
        <!-- 弹窗头部 -->
        <div class="dialog-header">
          <div class="header-left">
            <div class="header-icon-box">
              <IconRouter :size="20" />
            </div>
            <div>
              <h3 class="dialog-title">OpenWrt 路由器客户端下载</h3>
              <p class="dialog-subtitle">请按软路由或路由器 CPU 芯片架构下载对应 .ipk 安装包</p>
            </div>
          </div>
          <button class="dialog-close-btn" @click="handleClose">
            <IconX :size="18" />
          </button>
        </div>

        <!-- 弹窗主体 -->
        <div class="dialog-body">
          <!-- 架构卡片网格列表 -->
          <div class="arch-card-list">
            <div
              v-for="arch in openwrtConfig.list"
              :key="arch.key"
              class="openwrt-arch-card"
            >
              <div class="arch-meta">
                <div class="arch-title-row">
                  <span class="arch-title">{{ arch.name }}</span>
                  <span class="arch-tag">{{ arch.label }}</span>
                </div>
                <p class="arch-desc">{{ arch.desc }}</p>
              </div>
              <a
                :href="arch.url"
                target="_blank"
                class="download-btn-purple"
              >
                <IconDownload :size="14" />
                <span>下载 IPK</span>
              </a>
            </div>
          </div>

          <!-- 通用发布页直链 (若有) -->
          <div v-if="openwrtConfig.releasesUrl" class="releases-banner">
            <a
              :href="openwrtConfig.releasesUrl"
              target="_blank"
              class="releases-link"
            >
              <IconExternalLink :size="14" />
              <span>未找到匹配架构？前往全架构发布页 / Releases 目录</span>
            </a>
          </div>

          <!-- 底部 SSH 命令指引 -->
          <div class="ssh-tip-box">
            <div class="ssh-tip-title">
              <IconCpu :size="14" />
              <span>如何查看您的路由器架构：</span>
            </div>
            <p class="ssh-tip-desc">
              SSH 登录路由器后台运行命令
              <code class="code-pill">opkg print-architecture</code>
              即可查看支持的芯片架构代码。
            </p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  IconX,
  IconRouter,
  IconDownload,
  IconExternalLink,
  IconCpu
} from '@tabler/icons-vue';

export default {
  name: 'OpenWrtArchModal',
  components: {
    IconX,
    IconRouter,
    IconDownload,
    IconExternalLink,
    IconCpu
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    openwrtConfig: {
      type: Object,
      default: () => ({
        list: [],
        releasesUrl: '',
        isAvailable: false
      })
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const handleClose = () => {
      emit('close');
    };

    return {
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

.openwrt-modal-container {
  width: 100%;
  max-width: 520px;
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
    background: rgba(147, 51, 234, 0.1);
    color: #9333ea;
    display: flex;
    align-items: center;
    justify-content: center;
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
  gap: 12px;
}

.arch-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.openwrt-arch-card {
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  background: var(--bg-hover, rgba(0, 0, 0, 0.015));
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(147, 51, 234, 0.4);
    background: rgba(147, 51, 234, 0.02);
  }

  .arch-meta {
    min-width: 0;
    flex: 1;

    .arch-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;

      .arch-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-color, #0f172a);
      }

      .arch-tag {
        font-size: 10px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 4px;
        background: rgba(147, 51, 234, 0.1);
        color: #9333ea;
      }
    }

    .arch-desc {
      margin: 3px 0 0;
      font-size: 11px;
      color: var(--text-muted, #64748b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .download-btn-purple {
    flex-shrink: 0;
    padding: 7px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
    background: #9333ea;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(147, 51, 234, 0.25);

    &:hover {
      background: #7e22ce;
      box-shadow: 0 4px 10px rgba(147, 51, 234, 0.35);
    }
  }
}

.releases-banner {
  .releases-link {
    width: 100%;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px dashed var(--border-color, rgba(0, 0, 0, 0.15));
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted, #64748b);
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      border-color: #9333ea;
      color: #9333ea;
      background: rgba(147, 51, 234, 0.03);
    }
  }
}

.ssh-tip-box {
  background: rgba(0, 0, 0, 0.025);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 11px;

  .ssh-tip-title {
    font-weight: 600;
    color: var(--text-color, #1e293b);
    display: flex;
    align-items: center;
    gap: 5px;
    color: #9333ea;
  }

  .ssh-tip-desc {
    margin: 4px 0 0;
    color: var(--text-muted, #64748b);
    line-height: 1.4;

    .code-pill {
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      font-family: monospace;
      color: #9333ea;
      font-size: 10px;
    }
  }
}

/* 深色模式适配 */
:global(.dark) {
  .openwrt-modal-container {
    background-color: #1e222d;
    border-color: rgba(255, 255, 255, 0.08);
  }

  .dialog-header {
    border-bottom-color: rgba(255, 255, 255, 0.06);

    .header-icon-box {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
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

  .openwrt-arch-card {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);

    &:hover {
      border-color: rgba(168, 85, 247, 0.5);
      background: rgba(168, 85, 247, 0.05);
    }

    .arch-meta {
      .arch-title-row {
        .arch-title {
          color: #f8fafc;
        }

        .arch-tag {
          background: rgba(168, 85, 247, 0.2);
          color: #c084fc;
        }
      }

      .arch-desc {
        color: #94a3b8;
      }
    }
  }

  .releases-banner .releases-link {
    border-color: rgba(255, 255, 255, 0.1);
    color: #94a3b8;

    &:hover {
      border-color: #c084fc;
      color: #c084fc;
    }
  }

  .ssh-tip-box {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.06);

    .ssh-tip-title {
      color: #c084fc;
    }

    .ssh-tip-desc {
      color: #94a3b8;

      .code-pill {
        background: rgba(255, 255, 255, 0.1);
        color: #c084fc;
      }
    }
  }
}
</style>
