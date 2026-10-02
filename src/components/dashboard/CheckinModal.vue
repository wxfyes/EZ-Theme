<template>
  <transition name="fade">
    <div v-if="show" class="dialog-overlay" @click.self="handleClose">
      <div class="dialog-container checkin-modal-container">
        <!-- 弹窗头部 -->
        <div class="dialog-header">
          <div class="flex items-center gap-2">
            <div class="checkin-header-icon">
              <IconGift :size="20" />
            </div>
            <div>
              <h3 class="dialog-title flex items-center gap-2">
                <span>每日签到</span>
                <span class="checkin-badge">差额补齐</span>
              </h3>
              <p class="checkin-subtitle">抽取套餐差额流量，免费补齐标准容量</p>
            </div>
          </div>
          <button class="dialog-close-btn" @click="handleClose">
            <IconX :size="20" />
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="dialog-content checkin-content">
          <!-- 签到交互大卡片 -->
          <div v-if="!statusData.today_checked" class="checkin-card-unclaimed">
            <div class="checkin-circle-icon">
              <IconSparkles :size="32" />
            </div>
            <div class="checkin-status-text">
              <h4>今日尚未打卡</h4>
              <p>当前套餐：<span class="plan-highlight">{{ statusData.plan_name || '有效套餐' }}</span></p>
            </div>
            <button
              class="checkin-action-btn"
              :disabled="loading"
              @click="handleDoCheckin"
            >
              <IconLoader2 v-if="loading" :size="18" class="animate-spin" />
              <IconGift v-else :size="18" />
              <span>{{ loading ? '正在抽取专属流量...' : '立即打卡领取随机流量' }}</span>
            </button>
          </div>

          <!-- 已签到状态 -->
          <div v-else class="checkin-card-claimed">
            <div class="claimed-icon">
              <IconCircleCheck :size="30" />
            </div>
            <div class="claimed-text">
              <h4>今日已成功签到</h4>
              <p class="claimed-traffic">+{{ statusData.today_traffic_formatted }}</p>
            </div>
            <p class="claimed-tip">明日 00:00 刷新打卡机会，明天继续来领~</p>
          </div>

          <!-- 本月累计进度条 -->
          <div class="checkin-progress-box">
            <div class="progress-info-row">
              <span class="consecutive-text">
                <IconFlame :size="16" class="flame-icon" />
                <span>连续打卡 <strong>{{ statusData.consecutive_days || 0 }}</strong> 天</span>
              </span>
              <span class="percent-text">本月进度：{{ statusData.month_percentage }}%</span>
            </div>

            <div class="progress-bar-track">
              <div
                class="progress-bar-fill"
                :style="{ width: `${Math.min(100, statusData.month_percentage || 0)}%` }"
              ></div>
            </div>

            <div class="progress-labels">
              <span>已领差额：{{ statusData.month_used_formatted || '0 B' }}</span>
              <span>本月上限：{{ statusData.month_limit_formatted || '0 B' }}</span>
            </div>
          </div>

          <!-- 最近 7 天打卡明细 -->
          <div class="checkin-history-box">
            <div class="history-title-row">
              <span>近期打卡明细</span>
              <span class="history-badge">最近 7 天</span>
            </div>

            <div v-if="statusData.history && statusData.history.length > 0" class="history-list">
              <div
                v-for="item in statusData.history"
                :key="item.id"
                class="history-item"
              >
                <div class="history-date">
                  <span class="history-dot"></span>
                  <span>{{ item.checkin_date }}</span>
                </div>
                <span class="history-gain">+{{ item.traffic_formatted }}</span>
              </div>
            </div>
            <div v-else class="history-empty">
              暂无历史记录，快去完成首次签到吧！
            </div>
          </div>

          <!-- 规则提示 -->
          <div class="checkin-rules-box">
            💡 <strong>活动细则</strong>：系统根据您的套餐容量阶梯赠送标准差额流量（每 1024 GB 对应 24 GB 差额）。每天打卡赠送随机额度，当月可全额补齐，领取的流量直接累加至套餐包中！
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getCheckinStatus, doCheckin } from '@/api/user';
import {
  IconGift,
  IconX,
  IconSparkles,
  IconLoader2,
  IconCircleCheck,
  IconFlame,
} from '@tabler/icons-vue';

export default {
  name: 'CheckinModal',
  components: {
    IconGift,
    IconX,
    IconSparkles,
    IconLoader2,
    IconCircleCheck,
    IconFlame,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'checkinSuccess'],
  setup(props, { emit }) {
    const loading = ref(false);
    const statusData = ref({
      has_active_plan: false,
      plan_name: '',
      today_checked: false,
      today_traffic: 0,
      today_traffic_formatted: '',
      month_used: 0,
      month_used_formatted: '0 B',
      month_limit: 0,
      month_limit_formatted: '0 B',
      month_remain: 0,
      month_remain_formatted: '0 B',
      month_percentage: 0,
      consecutive_days: 0,
      history: [],
    });

    const handleClose = () => {
      emit('close');
    };

    const loadStatus = async () => {
      try {
        const res = await getCheckinStatus();
        if (res?.data) {
          statusData.value = res.data;
        }
      } catch (err) {
        console.error('获取签到状态失败:', err);
      }
    };

    const handleDoCheckin = async () => {
      if (loading.value) return;
      loading.value = true;
      try {
        const res = await doCheckin();
        if (res?.data) {
          await loadStatus();
          emit('checkinSuccess', res.data);
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || '签到失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadStatus();
    });

    return {
      loading,
      statusData,
      handleClose,
      handleDoCheckin,
      loadStatus,
    };
  },
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

.checkin-modal-container {
  width: 100%;
  max-width: 460px;
  background-color: var(--card-bg, #ffffff);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
}

.dialog-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));

  .checkin-header-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #f59e0b, #eab308);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
  }

  .dialog-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: var(--text-color, #1e293b);
  }

  .checkin-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 9999px;
    background: rgba(245, 158, 11, 0.15);
    color: #d97706;
  }

  .checkin-subtitle {
    font-size: 12px;
    color: var(--secondary-text-color, #64748b);
    margin: 2px 0 0 0;
  }

  .dialog-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text-color, #64748b);
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s ease;
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: var(--text-color, #0f172a);
    }
  }
}

.checkin-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkin-card-unclaimed {
  padding: 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(234, 179, 8, 0.02));
  border: 1px solid rgba(245, 158, 11, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;

  .checkin-circle-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: linear-gradient(135deg, #f59e0b, #eab308);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 16px rgba(245, 158, 11, 0.35);
  }

  .checkin-status-text {
    h4 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-color, #1e293b);
      margin: 0;
    }
    p {
      font-size: 12px;
      color: var(--secondary-text-color, #64748b);
      margin: 4px 0 0 0;
    }
    .plan-highlight {
      font-weight: 600;
      color: #d97706;
    }
  }

  .checkin-action-btn {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #f59e0b, #eab308);
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    transition: all 0.2s ease;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
    }
    &:active {
      transform: scale(0.98);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.checkin-card-claimed {
  padding: 18px;
  border-radius: 14px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;

  .claimed-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
    background: #10b981;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 14px rgba(16, 185, 129, 0.3);
  }

  .claimed-text {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #059669;
      margin: 0;
    }
    .claimed-traffic {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-color, #1e293b);
      margin: 4px 0 0 0;
    }
  }

  .claimed-tip {
    font-size: 11px;
    color: var(--secondary-text-color, #64748b);
    margin: 0;
  }
}

.checkin-progress-box {
  padding: 14px;
  border-radius: 12px;
  background: var(--bg-color, #f8fafc);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
  display: flex;
  flex-direction: column;
  gap: 8px;

  .progress-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-color, #1e293b);
    .flame-icon {
      color: #f97316;
      vertical-align: middle;
      display: inline-block;
      margin-right: 4px;
    }
    .percent-text {
      color: var(--secondary-text-color, #64748b);
      font-weight: 600;
    }
  }

  .progress-bar-track {
    width: 100%;
    height: 8px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 9999px;
    background: linear-gradient(90deg, #f59e0b, #eab308);
    transition: width 0.4s ease;
  }

  .progress-labels {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: var(--secondary-text-color, #64748b);
  }
}

.checkin-history-box {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .history-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-color, #1e293b);
    .history-badge {
      font-size: 10px;
      font-weight: normal;
      color: var(--secondary-text-color, #64748b);
    }
  }

  .history-list {
    max-height: 120px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--bg-color, #f8fafc);
    font-size: 12px;
    color: var(--text-color, #1e293b);

    .history-date {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .history-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f59e0b;
    }
    .history-gain {
      font-weight: 700;
      color: #d97706;
    }
  }

  .history-empty {
    text-align: center;
    padding: 12px;
    font-size: 12px;
    color: var(--secondary-text-color, #64748b);
    background: var(--bg-color, #f8fafc);
    border-radius: 8px;
  }
}

.checkin-rules-box {
  font-size: 11px;
  line-height: 1.5;
  color: var(--secondary-text-color, #64748b);
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.15);
}
</style>
