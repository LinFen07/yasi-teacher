import echarts from '@/utils/contants/echarts';
import { useEffect, useState } from 'react';
import { getAnswerList } from '@/api/studentAnswer';
import stores from '@/stores';
import './index.scss';
import { Button } from 'antd'
import { table } from 'console';

type EChartsOption = any;

export default function ScoreLie() {
  const [chartData, setChartData] = useState({
    correctCount: 0,
    inCorrectCount: 0,
    noAnswer: 0
  });
  const [isdisable, setDisable] = useState(false)
  const [moduleNow, setModule] = useState('听力')
  const [score, setScore] = useState(0)
  const answerRes = stores.AnswerStore.tableData
  // console.log(JSON.stringify(answerRes, null, 2))
  const computeListen = () => {
    let correctCount = 0;
    let inCorrectCount = 0;
    let noAnswer = 0;
    let score = 0;
    if (answerRes) {
      answerRes.forEach((item: any) => {
        if (item.module === '听力') {
          if (item.isCorrect === 1) {
            correctCount++;
            score += item.score
          } else if (item.isCorrect === 0) {
            inCorrectCount++;
          }
          // 检查是否有未作答的题目
          if (item.studentAnswer === '未作答') {
            noAnswer++;
          }
        }
      });
    }
    inCorrectCount = inCorrectCount - noAnswer
    setChartData({ correctCount, inCorrectCount, noAnswer });
    setScore(score)
  }
  const computeRead = () => {
    let correctCount = 0;
    let inCorrectCount = 0;
    let noAnswer = 0;
    let score = 0;
    if (answerRes) {
      answerRes.forEach((item: any) => {
        if (item.module === '阅读') {
          if (item.isCorrect === 1) {
            correctCount++;
            score += item.score
          } else if (item.isCorrect === 0) {
            inCorrectCount++;
          }
          // 检查是否有未作答的题目
          if (item.studentAnswer === '未作答') {
            noAnswer++;
          }
        }
      });
    }
    inCorrectCount = inCorrectCount - noAnswer
    setChartData({ correctCount, inCorrectCount, noAnswer });
    setScore(score)
  }
  const handleListenClick = () => {
    setDisable(!isdisable)
    setModule('听力')
    computeListen()
  }

  const handleReadClick = () => {
    setDisable(!isdisable)
    setModule('阅读')
    computeRead()
  }

  useEffect(() => {
    computeListen()
  }, [stores.AnswerStore.tableData])

  useEffect(() => {
    const fetchAndRenderChart = async () => {
      // 4. 渲染图表
      const chartDom = document.getElementsByClassName('scorepie')[0];
      if (chartDom && echarts) {
        const myChart = echarts.init(chartDom);

        const option: EChartsOption = {
          color: ['#22c17c', '#f05533', '#e2e2e2'],
          title: {
            text: `${moduleNow}得分:${score}`,
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
                formatter: '{b}: {c} ({d}%)'
              },
              data: [
                { value: chartData.correctCount, name: '正确' },
                { value: chartData.inCorrectCount, name: '错误' },
                { value: chartData.noAnswer, name: '未做' },
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

        myChart.setOption(option);
      }
    };

    if (stores.ExamStore.paperId && stores.UserStore.userId) {
      fetchAndRenderChart();
    }
  }, [stores.ExamStore.paperId, stores.UserStore.userId, score, moduleNow, stores.AnswerStore.tableData]); // 添加依赖项

  return (
    <>
      <div className='button_container'>
        <Button disabled={!isdisable} onClick={handleListenClick}>听力</Button>
        &nbsp;
        <Button disabled={isdisable} onClick={handleReadClick}>阅读</Button>
      </div>
      <div className='scorepie'></div>
    </>
  );
}