import React, { useState } from 'react';
import { Table, Button, Tag, Card, message, Spin, Empty } from 'antd';
import GradingPanel from '../../components/GradingPanel';
import ViewGradedPaper from '../../components/ViewGradedPaper';

const Evaluation = () => {
  const [papers, setPapers] = useState([
    {
      id: 1,
      name: '张三',
      score: 0,
      comment: '',
      status: '待阅',
      paperImage: '/papers/1.jpg',
      questions: [
        { number: 1, points: 20, score: 15, grader: '王老师' },
        { number: 2, points: 30, score: 25, grader: '王老师' }
      ],
      gradedTime: '2023-05-15 10:30'
    },
    {
      id: 2,
      name: '李四',
      score: 85,
      comment: '表现良好',
      status: '已阅',
      paperImage: '/papers/2.jpg',
      questions: [
        { number: 1, points: 20, score: 18, grader: '李老师' },
        { number: 2, points: 30, score: 27, grader: '李老师' }
      ],
      gradedTime: '2023-05-16 14:15'
    },
    {
      id: 3,
      name: '套三',
      score: 0,
      comment: '',
      status: '待阅',
      paperImage: '/papers/1.jpg',
      questions: [
        { number: 1, points: 20, score: 15, grader: '王老师' },
        { number: 2, points: 30, score: 25, grader: '王老师' }
      ],
      gradedTime: '2023-05-15 10:30'
    },
  ]);

  const [currentPaper, setCurrentPaper] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grade', 'view'
  const [loading, setLoading] = useState(false);

  const handleGradeSubmit = (values) => {
    // 更新当前试卷状态
    const updatedPapers = papers.map(p =>
      p.id === currentPaper.id ? {
        ...p,
        ...values,
        status: '已阅',
        gradedTime: new Date().toLocaleString()
      } : p
    );
    setPapers(updatedPapers);

    // 查找下一份待阅试卷
    const nextPaper = updatedPapers.find(p =>
      p.id !== currentPaper.id && p.status === '待阅'
    );

    if (nextPaper) {
      // 完全重置下一份试卷的批改状态
      setLoading(true);
      const resetPaper = {
        ...nextPaper,
        score: undefined,
        comment: undefined,
        questions: nextPaper.questions.map(q => ({
          number: q.number,
          points: q.points,
          score: undefined,
          grader: undefined
        }))
      };
      setCurrentPaper(resetPaper);
      // 显示加载状态，延迟切换视图
      setTimeout(() => {
        setViewMode('list');
        setTimeout(() => {
          setViewMode('grade');
          setLoading(false);
        }, 300);
      }, 300);
      message.success('已自动跳转到下一份试卷');
      console.log('自动跳转到下一份试卷', nextPaper);
    } else {
      message.success({
        content: '批改已完成',
        duration: 3,
        className: 'grading-complete-message'
      });
      setTimeout(() => {
        setViewMode('list');
      }, 300);
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: status => (
        <Tag color={status === '已阅' ? 'green' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setCurrentPaper(record);
            setViewMode(record.status === '已阅' ? 'view' : 'grade');
          }}
        >
          {record.status === '已阅' ? '查看' : '阅卷'}
        </Button>
      ),
    },
  ];

  const handleStartGrading = () => {
    const firstPendingPaper = papers.find(p => p.status === '待阅');
    if (firstPendingPaper) {
      setCurrentPaper(firstPendingPaper);
      setViewMode('grade');
    } else {
      message.info('当前没有待阅试卷');
    }
  };

  return (
    <Spin spinning={loading} tip="正在加载下一份试卷...">
      <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>试卷批阅</h2>
        {viewMode === 'list' && papers.length > 0 && (
          <Button
            type="primary"
            onClick={handleStartGrading}
          >
            开始阅卷
          </Button>
        )}
      </div>

      {viewMode === 'list' && (
        <Card>
          {papers.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Empty description="当前没有考生" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={papers}
              rowKey="id"
              pagination={false}
            />
          )}
        </Card>
      )}

      {viewMode === 'grade' && currentPaper && (
        <GradingPanel
          paperData={currentPaper}
          onSubmit={handleGradeSubmit}
          onCancel={() => setViewMode('list')}
        />
      )}

      {viewMode === 'view' && currentPaper && (
        <ViewGradedPaper
          paperData={currentPaper}
          onBack={() => setViewMode('list')}
        />
      )}
      </div>
    </Spin>
  );
};

export default Evaluation;
