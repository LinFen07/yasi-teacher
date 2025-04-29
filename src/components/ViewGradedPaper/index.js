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
  const isScoringMode = paperData.type === 1; // 1为评分模式，2为评价模式
  const { article } = useSelector(state => state.tasks);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [appraise, setAppraise] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    if (paperData.id) {
      // 获取评价和分数
      // const selectedAppraise = appraiseData?.find(item => item.id === paperData.id)?.appraise || '无评语';
      // const selectedScore = article.response?.items?.[0]?.studentAnswers?.find(item => item.id === paperData.id)?.score || 0;
      // console.log(paperData)
      const selectedAppraise = paperData?.studentInfo?.appraise != "undefined" ? paperData.studentInfo.appraise : '无评语'
      const selectedScore_1 = paperData?.composition[0]?.score != 0 ? paperData.composition[0].score : '暂无评分'
      const selectedScore_2 = paperData?.composition[1]?.score != 0 ? paperData.composition[1].score : '暂无评分'
      const selectedScore = [selectedScore_1, selectedScore_2]
      setAppraise(selectedAppraise);
      setScore(selectedScore);
      // console.log(score)
      // console.log(appraise)
      // 获取答题数据
      const fetchAnswers = async () => {
        try {
          if (paperData.questions) {
            const questionIds = paperData.questions.map(q => q.id);
            const results = await Promise.all(
              questionIds.map(id => dispatch(selectById(id)))
            );
            const validAnswers = results
              .map(res => res?.payload?.response)
              .filter(Boolean);
            setAnswers(validAnswers);
            setCurrentAnswer(validAnswers[0] || null);
          }
        } catch (error) {
          console.error('获取答题数据失败:', error);
        }
      };

      if (isScoringMode) {
        fetchAnswers();
      }
    }
  }, [paperData.id, appraiseData, article, dispatch]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {isScoringMode && currentAnswer && (
        <Card title="作文内容">
          <h3 style={{ color: 'var(--text-color)' }}>作文标题</h3>
          <div style={{
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '16px',
            minHeight: '80px'
          }}>
            {currentAnswer.title || '无标题'}
          </div>
          <h3 style={{ color: 'var(--text-color)' }}>作文内容</h3>
          <div
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '16px',
              minHeight: '500px'
            }}
            dangerouslySetInnerHTML={{ __html: currentAnswer.studentAnswer || '无内容' }}
          />
        </Card>
      )}

      <Card
        title={isScoringMode ? "评分详情" : "评价详情"}
        extra={
          <Space>
            <Button type="primary" onClick={onEdit}>修改</Button>
            <Button onClick={onBack}>返回</Button>
          </Space>
        }
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="学生姓名">{paperData.studentName || '未知'}</Descriptions.Item>
          {isScoringMode && (
            <>
              <Descriptions.Item label="得分"><ScoreInput value={score} disabled /></Descriptions.Item>
              <Descriptions.Item label="评分明细">
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
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label={isScoringMode ? "评语" : "综合评价"}>
            <div dangerouslySetInnerHTML={{ __html: appraise }} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {isScoringMode && (
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
      )}
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
