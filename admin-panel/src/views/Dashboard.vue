<template>
  <div class="dashboard-container">
    <!-- Top Stats Cards -->
    <el-row :gutter="20" style="display: flex; flex-wrap: wrap; align-items: stretch;">
      <el-col :xs="24" :sm="12" :md="6" v-for="(card, index) in statCards" :key="index">
        <el-card class="stat-card" :class="{ 'clickable-card': card.route }" shadow="hover" @click="handleCardClick(card)">
          <div class="card-content flex-between">
            <div class="card-info" style="flex: 1; min-width: 0; margin-right: 15px;">
              <div class="flex-center" style="justify-content: flex-start; gap: 8px;">
                <span class="card-title">{{ card.title }}</span>
                <el-button
                  v-if="index === 0"
                  type="text"
                  style="padding: 0; min-height: auto; font-size: 14px; color: var(--el-text-color-secondary);"
                  @click.stop="toggleIncomeHidden"
                >
                  <el-icon><component :is="isIncomeHidden ? 'View' : 'Hide'" /></el-icon>
                </el-button>
              </div>
              <h3 class="card-value">
                <template v-if="index === 0">
                  {{ isIncomeHidden ? '****' : card.value }}
                </template>
                <template v-else>
                  {{ card.value }}
                </template>
              </h3>
              <div class="income-details-list">
                <!-- Card 0: Income -->
                <template v-if="index === 0">
                  <div class="income-detail-item">
                    <span class="detail-label">本月收入</span>
                    <span class="detail-value font-mono">{{ isIncomeHidden ? '****' : formatMoney(overrideData.month_income) }}</span>
                  </div>
                  <div class="income-detail-item">
                    <span class="detail-label">上月收入</span>
                    <span class="detail-value font-mono">{{ isIncomeHidden ? '****' : formatMoney(overrideData.last_month_income) }}</span>
                  </div>
                </template>
                <!-- Card 1: Users -->
                <template v-else-if="index === 1">
                  <div class="income-detail-item">
                    <span class="detail-label">今日注册</span>
                    <span class="detail-value font-mono">{{ overrideData.day_register_total }} 人</span>
                  </div>
                  <div class="income-detail-item">
                    <span class="detail-label">本月注册</span>
                    <span class="detail-value font-mono">{{ overrideData.month_register_total }} 人</span>
                  </div>
                </template>
                <!-- Card 2: Traffic -->
                <template v-else-if="index === 2">
                  <div class="income-detail-item">
                    <span class="detail-label">有效订阅</span>
                    <span class="detail-value font-mono">{{ overrideData.total_user }} 人</span>
                  </div>
                  <div class="income-detail-item">
                    <span class="detail-label">系统状态</span>
                    <span class="detail-value text-success font-semibold">运行正常</span>
                  </div>
                </template>
                <!-- Card 3: Tickets -->
                <template v-else-if="index === 3">
                  <div class="income-detail-item">
                    <span class="detail-label">待审提现</span>
                    <span class="detail-value font-mono">{{ overrideData.commission_pending_total }} 笔</span>
                  </div>
                  <div class="income-detail-item">
                    <span class="detail-label">本月发佣</span>
                    <span class="detail-value font-mono">{{ formatMoney(overrideData.commission_month_payout) }}</span>
                  </div>
                </template>
              </div>
            </div>
            <div class="card-icon" :style="{ backgroundColor: card.bgColor, color: card.iconColor }">
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Main Chart Section -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="chart-title-text">平台 30 天运营趋势</span>
              <el-radio-group v-model="chartMetric" size="small" @change="renderChart">
                <el-radio-button label="income">收入金额</el-radio-button>
                <el-radio-button label="register">注册人数</el-radio-button>
                <el-radio-button label="orders">收款笔数</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" class="echart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Node Rankings Section -->
    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="12">
        <el-card class="rank-card" shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="rank-title-text">今日节点流量排名</span>
              <el-icon><Connection /></el-icon>
            </div>
          </template>
          <el-table :data="serverTodayRank" stripe style="width: 100%" height="320">
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="server_name" label="节点名称" show-overflow-tooltip />
            <el-table-column prop="server_type" label="类型" width="100" align="center">
              <template #default="scope">
                <el-tag size="small" effect="plain">{{ scope.row.server_type ? scope.row.server_type.toUpperCase() : 'UNKNOWN' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total" label="流量 (GB)" width="120" align="right">
              <template #default="scope">
                {{ scope.row.total.toFixed(2) }} GB
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="rank-card" shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="rank-title-text">昨日节点流量排名</span>
              <el-icon><Connection /></el-icon>
            </div>
          </template>
          <el-table :data="serverYesterdayRank" stripe style="width: 100%" height="320">
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="server_name" label="节点名称" show-overflow-tooltip />
            <el-table-column prop="server_type" label="类型" width="100" align="center">
              <template #default="scope">
                <el-tag size="small" effect="plain">{{ scope.row.server_type ? scope.row.server_type.toUpperCase() : 'UNKNOWN' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total" label="流量 (GB)" width="120" align="right">
              <template #default="scope">
                {{ scope.row.total.toFixed(2) }} GB
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- User Rankings Section -->
    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="12">
        <el-card class="rank-card" shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="rank-title-text">今日用户流量排名</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <el-table :data="userTodayRank" stripe style="width: 100%" height="320">
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="email" label="用户邮箱" show-overflow-tooltip />
            <el-table-column prop="total" label="使用量" width="140" align="right">
              <template #default="scope">
                <span class="traffic-text">{{ scope.row.total.toFixed(2) }} GB</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="rank-card" shadow="hover">
          <template #header>
            <div class="flex-between">
              <span class="rank-title-text">昨日用户流量排名</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <el-table :data="userYesterdayRank" stripe style="width: 100%" height="320">
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="email" label="用户邮箱" show-overflow-tooltip />
            <el-table-column prop="total" label="使用量" width="140" align="right">
              <template #default="scope">
                <span class="traffic-text">{{ scope.row.total.toFixed(2) }} GB</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getSecurePath } from '../api';
import api from '../api';
import * as echarts from 'echarts';

const router = useRouter();
const chartRef = ref(null);
const chartMetric = ref('income');
let myChart = null;

const overrideData = reactive({
  online_user: 0,
  month_income: 0,
  day_income: 0,
  last_month_income: 0,
  total_user: 0,
  day_traffic: 0,
  ticket_pending_total: 0,
  commission_pending_total: 0,
  day_register_total: 0,
  month_register_total: 0,
  commission_month_payout: 0,
  commission_last_month_payout: 0,
});

const statCards = ref([]);
const serverTodayRank = ref([]);
const serverYesterdayRank = ref([]);
const userTodayRank = ref([]);
const userYesterdayRank = ref([]);
let orderRawData = [];

const isIncomeHidden = ref(localStorage.getItem('is_income_hidden') === 'true');
const toggleIncomeHidden = () => {
  isIncomeHidden.value = !isIncomeHidden.value;
  localStorage.setItem('is_income_hidden', isIncomeHidden.value);
};

const handleCardClick = (card) => {
  if (card.route) {
    router.push(card.route);
  }
};

// Helper functions
const formatTraffic = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatMoney = (amount) => {
  return '¥ ' + parseFloat((amount / 100).toFixed(2));
};

const updateCards = () => {
  statCards.value = [
    {
      title: '今日收入',
      value: formatMoney(overrideData.day_income),
      sub: '',
      icon: 'Money',
      bgColor: 'rgba(64, 158, 255, 0.1)',
      iconColor: 'var(--el-color-primary)',
    },
    {
      title: '在线用户',
      value: `${overrideData.online_user} 人`,
      sub: `有效订阅用户: ${overrideData.total_user} 人`,
      icon: 'User',
      bgColor: 'rgba(103, 194, 58, 0.1)',
      iconColor: 'var(--el-color-success)',
    },
    {
      title: '今日流量',
      value: formatTraffic(overrideData.day_traffic),
      sub: '全节点综合流量消耗',
      icon: 'Odometer',
      bgColor: 'rgba(230, 162, 44, 0.1)',
      iconColor: 'var(--el-color-warning)',
    },
    {
      title: '待办工单',
      value: `${overrideData.ticket_pending_total} 件`,
      sub: `待审核提现: ${overrideData.commission_pending_total} 笔`,
      icon: 'Notification',
      bgColor: 'rgba(245, 108, 108, 0.1)',
      iconColor: 'var(--el-color-danger)',
      route: '/tickets',
    }
  ];
};

const fetchOverride = async () => {
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/stat/getOverride`);
    if (res.data) {
      Object.assign(overrideData, res.data);
      updateCards();
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchRanks = async () => {
  try {
    const securePath = getSecurePath();
    const [serverTodayRes, serverYesterdayRes, userTodayRes, userYesterdayRes] = await Promise.all([
      api.get(`/${securePath}/stat/getServerTodayRank`),
      api.get(`/${securePath}/stat/getServerLastRank`),
      api.get(`/${securePath}/stat/getUserTodayRank`),
      api.get(`/${securePath}/stat/getUserLastRank`)
    ]);

    if (serverTodayRes.data) {
      serverTodayRank.value = serverTodayRes.data.slice(0, 10);
    }
    if (serverYesterdayRes.data) {
      serverYesterdayRank.value = serverYesterdayRes.data.slice(0, 10);
    }
    if (userTodayRes.data) {
      userTodayRank.value = userTodayRes.data.slice(0, 10);
    }
    if (userYesterdayRes.data) {
      userYesterdayRank.value = userYesterdayRes.data.slice(0, 10);
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchChartData = async () => {
  try {
    const securePath = getSecurePath();
    const res = await api.get(`/${securePath}/stat/getOrder`);
    if (res.data) {
      orderRawData = res.data;
      renderChart();
    }
  } catch (err) {
    console.error(err);
  }
};

const renderChart = () => {
  if (!chartRef.value || orderRawData.length === 0) return;
  
  if (!myChart) {
    myChart = echarts.init(chartRef.value);
  }
  
  // Filter data based on metric
  let typeLabel = '收款金额';
  let color = '#409EFF';
  let areaColor = 'rgba(64, 158, 255, 0.1)';
  
  if (chartMetric.value === 'register') {
    typeLabel = '注册人数';
    color = '#67C23A';
    areaColor = 'rgba(103, 194, 58, 0.1)';
  } else if (chartMetric.value === 'orders') {
    typeLabel = '收款笔数';
    color = '#E6A23C';
    areaColor = 'rgba(230, 162, 44, 0.1)';
  }
  
  const filtered = orderRawData.filter(d => d.type === typeLabel);
  const dates = filtered.map(d => d.date);
  const values = filtered.map(d => d.value);
  
  const isDarkTheme = document.documentElement.classList.contains('dark');
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDarkTheme ? '#1e1e1e' : '#fff',
      borderColor: isDarkTheme ? '#333' : '#e4e7ed',
      textStyle: {
        color: isDarkTheme ? '#eee' : '#333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        color: isDarkTheme ? '#888' : '#666'
      },
      axisLine: {
        lineStyle: {
          color: isDarkTheme ? '#333' : '#e4e7ed'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: isDarkTheme ? '#888' : '#666'
      },
      splitLine: {
        lineStyle: {
          color: isDarkTheme ? '#222' : '#f0f2f5'
        }
      }
    },
    series: [
      {
        name: typeLabel,
        type: 'line',
        smooth: true,
        data: values,
        itemStyle: {
          color: color
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: areaColor
        }
      }
    ]
  };
  
  myChart.setOption(option);
};

const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

// Monitor theme change
watch(
  () => document.documentElement.className,
  () => {
    // Redraw ECharts to update background grids and tooltip colors
    if (myChart) {
      myChart.dispose();
      myChart = null;
    }
    renderChart();
  },
  { deep: true }
);

onMounted(async () => {
  updateCards();
  await Promise.all([
    fetchOverride(),
    fetchRanks(),
    fetchChartData()
  ]);
  
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.dashboard-container {
  padding-bottom: 20px;
}

.stat-card {
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.stat-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
}

.card-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  justify-content: space-between;
  height: 100%;
}

.card-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.card-value {
  font-size: 26px;
  font-weight: 700;
  margin: 6px 0;
  letter-spacing: -0.5px;
}

.card-sub {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.income-details-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);
  padding-top: 8px;
}

.income-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  line-height: 1.4;
}

.detail-label {
  color: var(--el-text-color-secondary);
}

.detail-value {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.font-mono {
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
}

.text-success {
  color: var(--el-color-success);
}

.font-semibold {
  font-weight: 600;
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.mt-20 {
  margin-top: 20px;
}

.chart-card {
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
  margin-bottom: 20px;
}

.chart-title-text {
  font-size: 15px;
  font-weight: 600;
}

.echart-box {
  height: 350px;
  width: 100%;
}

.rank-card {
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
  margin-bottom: 20px;
}

.rank-title-text {
  font-size: 15px;
  font-weight: 600;
}

.traffic-text {
  font-weight: 600;
  color: var(--el-color-primary);
}

.clickable-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--el-box-shadow-light);
}
</style>
