import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Statistic, Table, Divider, Spin, Tabs, List, Progress, Button, message } from 'antd';
import * as echarts from 'echarts';
import './index.scss';

const Home = () => {
  const { userInfo } = useSelector(state => state.user);

  // 学生成绩数据
  const studentScores = [
    { score: '90-100', count: 15 },
    { score: '80-89', count: 20 },
    { score: '70-79', count: 10 },
    { score: '60-69', count: 5 },
    { score: '0-59', count: 3 }
  ];

  // 教师评卷数据
  // 任务数据
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: '期中考试',
      total: 200,
      evaluated: 125,
      status: 'in-progress',
      received: true
    },
    {
      id: 2,
      name: '单元测试',
      total: 150,
      evaluated: 98,
      status: 'in-progress',
      received: true
    },
    {
      id: 3,
      name: '随堂测验',
      total: 100,
      evaluated: 75,
      status: 'in-progress',
      received: true
    },
    {
      id: 4,
      name: '期末考试',
      total: 300,
      evaluated: 0,
      status: 'pending',
      received: false
    }
  ]);

  const handleReceiveTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, received: true, status: 'in-progress' } : task
    ));
    message.success('任务接收成功');
  };

  // 任务表格列配置
  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '卷子数量',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: '已阅数量',
      dataIndex: 'evaluated',
      key: 'evaluated',
    },
    {
      title: '完成率',
      key: 'completion',
      render: (_, record) => `${Math.round((record.evaluated / record.total) * 100)}%`,
    },
  ];

  // 表格列配置


  const chartRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    if (chartRef.current) {
      try {
        // 初始化图表
        chartInstance = echarts.init(chartRef.current);

        // 配置图表
        const option = {
          title: {
            text: '学生成绩分布'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['人数']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: studentScores.map(item => item.score),
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '人数',
              type: 'bar',
              data: studentScores.map(item => item.count),
              itemStyle: {
                color: function (params) {
                  const score = params.name.split('-')[0];
                  if (parseInt(score) >= 90) return '#52c41a';
                  if (parseInt(score) >= 80) return '#1890ff';
                  if (parseInt(score) >= 70) return '#faad14';
                  if (parseInt(score) >= 60) return '#ff7a45';
                  return '#ff4d4f';
                }
              }
            }
          ]
        };

        // 设置图表配置
        chartInstance.setOption(option);

        // 窗口大小变化时重新调整图表大小
        window.addEventListener('resize', () => {
          chartInstance && chartInstance.resize();
        });

        return () => {
          // 组件卸载时销毁图表
          if (chartInstance) {
            chartInstance.dispose();
            chartInstance = null;
          }
          // 移除窗口大小变化事件监听
          window.removeEventListener('resize', () => {
            chartInstance && chartInstance.resize();
          });
        };
      } catch (error) {
        console.error('图表初始化失败:', error);
      }
    }
  }, [studentScores]);

  return (
    <div className="evaluation-container">
      <h2>教学数据概览</h2>

      <div className="stats-section">
        <Card>
          <Statistic
            title="欢迎回来"
            value={userInfo?.name || '用户'}
            prefix={<span style={{ fontSize: 16 }}>👋</span>}
          />
          <Divider />
          <div className="quick-stats">
            <Statistic title="学生总数" value={53} />
            <Statistic title="平均成绩" value={78.5} precision={1} />
            <Statistic title="总评卷量" value={298} />
          </div>
        </Card>
      </div>

      <div className="chart-section">
        <Card>
          <div
            ref={chartRef}
            style={{
              height: '400px',
              width: '100%',
              backgroundColor: '#fff'
            }}
          />
          {!chartRef.current && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              {chartRef.current &&
                <Spin tip="图表加载中..." />}
            </div>
          )}
        </Card>
      </div>



      <div className="task-notification">
        <Card title="任务通知栏" className="stats-card">
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="进行中任务" key="1">
              <List
                dataSource={tasks.filter(t => t.status === 'in-progress')}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Progress
                        percent={Math.round((item.evaluated / item.total) * 100)}
                        status="active"
                        style={{ width: 200 }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={`已完成 ${item.evaluated}/${item.total}`}
                    />
                  </List.Item>
                )}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="待接收任务" key="2">
              <List
                dataSource={tasks.filter(t => t.status === 'pending' && !t.received)}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        onClick={() => handleReceiveTask(item.id)}
                      >
                        接收任务
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={`待阅 ${item.total} 份`}
                    />
                  </List.Item>
                )}
              />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>


    </div>
  );
};

export default Home;