import * as echarts from 'echarts/core';
import { PieChart  } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent } from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
TitleComponent,
TooltipComponent,
GridComponent,
DatasetComponent,
TransformComponent,
PieChart,
LabelLayout,
UniversalTransition,
CanvasRenderer
]);

export default echarts;