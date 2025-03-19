import * as echarts from 'echarts';
import { useEffect } from 'react';

import './index.scss';

type EChartsOption = echarts.EChartsOption;

export default function ScoreLie(){

  useEffect(() => {
    var chartDom = document.getElementsByClassName('scorepie')[0];
    if (chartDom) {
      //@ts-ignore
      var myChart = echarts.init(chartDom);
      var option: EChartsOption;

      option = {
        color: ['#22c17c', '#f05533', '#e2e2e2'],
        title: {
          text: '题目正确分布',
          subtext: '',
          left: '10px',
          top: '10px',
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: '10px',
          top: '45px',
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: '50%',
            center: ['60%', '40%'],
            label: {
              show: true,
              //@ts-ignore
              textStyle: {
                fontSize: 14 // 设置数据标签字体大小
              }
            },
            data: [
              { value: 26, name: '正确' },
              { value: 5, name: '错误' },
              { value: 9, name: '未做' },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 2,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      option && myChart.setOption(option);
    }
  }, []);
  
  return (
      <div className='scorepie'></div>
  )
}