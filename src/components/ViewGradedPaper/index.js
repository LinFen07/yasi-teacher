import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Descriptions, Button, Card, Table, Space, Tag, Pagination } from 'antd';
import ScoreInput from '../ScoreInput';
import { useSelector, useDispatch } from 'react-redux';
import { selectById } from '../../store/tasks';

const AnswerTable = ({ answers, pagination }) => {
  const columns = [
    {
      title: '题号',
      dataIndex: 'id',
      key: 'id',
      align: 'center'
    },
    {
      title: '学生答案',
      dataIndex: 'studentAnswer',
      key: 'studentAnswer',
      align: 'center',
      render: text => text || '未作答'
    },
    {
      title: '作答情况',
      key: 'isCorrect',
      align: 'center',
      render: (_, record) => {
        if (record.isCorrect === 2) {
          return <Tag color="blue">作文</Tag>;
        }
        return (
          <Tag color={record.isCorrect === 1 ? 'green' : 'red'}>
            {record.isCorrect === 1 ? '正确' : '错误'}
          </Tag>
        );
      }
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: score => score ?? 0
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={answers}
      pagination={pagination}
      rowKey="id"
      bordered
      size="small"
    />
  );
};

const ViewGradedPaper = ({ paperData = {}, onBack, onEdit, appraiseData }) => {
  const { article } = useSelector(state => state.tasks);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [appraise, setAppraise] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (paperData.id) {
      // 获取评价和分数
      const selectedAppraise = appraiseData?.find(item => item.id === paperData.id)?.appraise || '无评语';
      const selectedScore = article.response?.items?.[0]?.studentAnswers?.find(item => item.id === paperData.id)?.score || 0;
      setAppraise(selectedAppraise);
      setScore(selectedScore);

      // 获取2-10的答题数据
      const fetchAnswers = async () => {
        const ids = Array.from({length: 30}, (_, i) => i + 2); // 2-31
        const results = await Promise.all(ids.map(id => dispatch(selectById(id))));
        const validAnswers = results.map(res => res?.response).filter(Boolean);
        setAnswers(validAnswers);
        setCurrentAnswer(validAnswers[0] || null);
      };
      fetchAnswers();
    }
  }, [paperData.id, appraiseData, article, dispatch]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Card
          title="评分详情"
          extra={
            <Space>
              <Button type="primary" onClick={onEdit}>修改</Button>
              <Button onClick={onBack}>返回</Button>
            </Space>
          }
          style={{ flex: 1 }}
        >
          <Descriptions column={1} bordered>
            <Descriptions.Item label="学生姓名">{paperData.studentName || '未知'}</Descriptions.Item>
            <Descriptions.Item label="得分"><ScoreInput value={score} disabled /></Descriptions.Item>
            <Descriptions.Item label="评语"><div dangerouslySetInnerHTML={{ __html: appraise }} /></Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="评分明细" style={{ flex: 1 }}>
          <Table
            columns={[
              { title: '题号', dataIndex: 'number', key: 'number', align: 'center' },
              { title: '分值', dataIndex: 'points', key: 'points', align: 'center' },
              { title: '得分', dataIndex: 'score', key: 'score', align: 'center' }
            ]}
            dataSource={paperData.questions || []}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      </div>

      <Card title="答题情况">
        <AnswerTable 
          answers={answers}
          pagination={{
            total: answers.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 10,
            showTotal: total => `共 ${total} 条`
          }}
        />
      </Card>
    </div>
  );
};

ViewGradedPaper.propTypes = {
  paperData: PropTypes.shape({
    id: PropTypes.number,
    studentName: PropTypes.string,
    questions: PropTypes.array
  }),
  onBack: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  appraiseData: PropTypes.array
};

export default ViewGradedPaper;
