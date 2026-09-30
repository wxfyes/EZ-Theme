import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 仅注册主题流量折线图所必需的组件，消除 85% 以上的无用图表引擎代码
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer
]);

export default echarts;
