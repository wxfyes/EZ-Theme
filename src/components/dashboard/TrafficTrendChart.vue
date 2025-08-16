<template>
  <div class="dashboard-card chart-card">
    <div class="card-header">
      <h2 class="card-title">{{ $t('trafficLog.trafficChart') }}</h2>
    </div>
    <div class="card-body">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ $t('trafficLog.loadingTraffic') }}</p>
      </div>
      
      <!-- 加载错误 -->
      <div v-else-if="error" class="error-container">
        <IconAlertCircle :size="48" class="error-icon" />
        <p>{{ $t('trafficLog.errorLoadingTraffic') }}</p>
      </div>
      
      <!-- 数据为空 -->
      <div v-else-if="!trafficData.length" class="empty-container">
        <IconFileOff :size="48" class="empty-icon" />
        <p>{{ $t('trafficLog.noTrafficData') }}</p>
      </div>
      
      <!-- 流量图表 -->
      <div v-else ref="chartRef" class="traffic-chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconAlertCircle, IconFileOff } from '@tabler/icons-vue';
import { getTrafficLog } from '@/api/trafficLog';
import { formatTraffic, formatDate } from '@/utils/formatters';
import { TRAFFICLOG_CONFIG } from '@/utils/baseConfig';
import * as echarts from 'echarts';
import { createDebouncedUpdate } from '@/utils/componentLifecycle';

const { t } = useI18n();

const props = defineProps({
  daysToShow: {
    type: Number,
    default: 30
  }
});

const trafficData = ref([]);
const loading = ref(true);
const error = ref(false);
const chartRef = ref(null);
let chartInstance = null;

const fetchTrafficData = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const response = await getTrafficLog();
    if (response && response.data) {
      trafficData.value = response.data.sort((a, b) => b.record_at - a.record_at);
      
      // 限制显示天数
      if (props.daysToShow > 0) {
        const uniqueDates = [...new Set(trafficData.value.map(item => {
          const date = new Date(item.record_at * 1000);
          return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }))];
        
        if (uniqueDates.length > props.daysToShow) {
          const datesToKeep = uniqueDates.slice(0, props.daysToShow);
          trafficData.value = trafficData.value.filter(item => {
            const date = new Date(item.record_at * 1000);
            const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            return datesToKeep.includes(dateStr);
          });
        }
      }
    } else {
      trafficData.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch traffic data:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  if (!chartRef.value || trafficData.value.length === 0) return;
  
  chartInstance = echarts.init(chartRef.value);
  
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#355cc2';
  
  const dates = [];
  const uploadData = [];
  const downloadData = [];
  const totalData = [];
  
  const sortedData = [...trafficData.value].slice(0, props.daysToShow).reverse();
  
  sortedData.forEach(item => {
    dates.push(formatDate(item.record_at));
    const upload = parseFloat((item.u / (1024 * 1024 * 1024)).toFixed(2));
    const download = parseFloat((item.d / (1024 * 1024 * 1024)).toFixed(2));
    uploadData.push(upload);
    downloadData.push(download);
    totalData.push(parseFloat((upload + download).toFixed(2)));
  });
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          let value = param.value + ' GB';
          result += param.marker + ' ' + param.seriesName + ': ' + value + '<br/>';
        });
        return result;
      }
    },
    legend: {
      data: [t('trafficLog.uploadTraffic'), t('trafficLog.downloadTraffic'), t('trafficLog.totalTraffic')],
      bottom: 0,
      textStyle: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#333333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '60px',
      top: '30px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 45,
        interval: 'auto',
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#333333'
      },
      axisLine: {
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e8e8e8'
        }
      },
      splitLine: {
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e8e8e8'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'GB',
      nameTextStyle: {
        padding: [0, 0, 0, 10],
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#333333'
      },
      axisLabel: {
        formatter: '{value} GB',
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#333333'
      },
      axisLine: {
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e8e8e8'
        }
      },
      splitLine: {
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e8e8e8'
        }
      }
    },
    series: [
      {
        name: t('trafficLog.uploadTraffic'),
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.2
        },
        emphasis: {
          focus: 'series'
        },
        data: uploadData,
        color: '#36AD47'
      },
      {
        name: t('trafficLog.downloadTraffic'),
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.2
        },
        emphasis: {
          focus: 'series'
        },
        data: downloadData,
        color: '#4080FF'
      },
      {
        name: t('trafficLog.totalTraffic'),
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3
        },
        showSymbol: false,
        emphasis: {
          focus: 'series'
        },
        data: totalData,
        color: themeColor
      }
    ]
  };
  
  chartInstance.setOption(option);
  
  window.addEventListener('resize', handleResize);
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

const debouncedResize = createDebouncedUpdate(handleResize, 200);

watch(trafficData, () => {
  if (!loading.value && !error.value && trafficData.value.length > 0) {
    nextTick(() => {
      initChart();
    });
  }
}, { deep: true });

let themeObserver = null;

const setupThemeObserver = () => {
  if (themeObserver) {
    themeObserver.disconnect();
  }
  
  let debounceTimer = null;
  themeObserver = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      nextTick(() => {
        if (chartInstance && chartRef.value) {
          initChart();
        }
      });
    }, 300);
  });
  
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
};

onMounted(() => {
  fetchTrafficData();
  setupThemeObserver();
  
  window.addEventListener('resize', debouncedResize);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', debouncedResize);
  
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
});

watch(loading, (newVal) => {
  if (!newVal && !error.value && trafficData.value.length > 0) {
    nextTick(() => {
      initChart();
    });
  }
});
</script>

<style lang="scss" scoped>
.chart-card {
  margin-bottom: 24px;
  
  .traffic-chart {
    height: 400px;
    width: 100%;
    
    @media (max-width: 768px) {
      height: 300px;
    }
  }
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  
  p {
    margin-top: 16px;
    color: var(--secondary-text-color);
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(var(--theme-color-rgb), 0.1);
  border-left-color: var(--theme-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
