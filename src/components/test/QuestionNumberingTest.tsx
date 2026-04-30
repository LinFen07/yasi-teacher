import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Typography, Alert, Table, Tag } from 'antd';
import { 
  createCompleteQuestionMapping, 
  getQuestionNumberInfo, 
  countQuestionsInExam,
  getModuleInfoByOrder 
} from '@/utils/helper/examQuestionNumbering';
import stores from '@/stores';

const { Title, Text } = Typography;

/**
 * 题号映射测试组件
 * 用于测试和验证题号映射功能
 */
const QuestionNumberingTest: React.FC = () => {
  const [questionMappings, setQuestionMappings] = useState<any[]>([]);
  const [moduleStats, setModuleStats] = useState<any>(null);

  // 更新题号映射
  const updateQuestionMappings = () => {
    try {
      const mappings = createCompleteQuestionMapping(
        stores.ExamStore.listenExam,
        stores.ExamStore.readExam,
        stores.ExamStore.wirrteExam
      );
      
      setQuestionMappings(mappings);

      // 计算各模块统计信息
      const listenCount = countQuestionsInExam(stores.ExamStore.listenExam);
      const readCount = countQuestionsInExam(stores.ExamStore.readExam);
      const writeCount = countQuestionsInExam(stores.ExamStore.wirrteExam);
      
      setModuleStats({
        listen: listenCount,
        read: readCount,
        write: writeCount,
        total: listenCount + readCount + writeCount
      });

      console.log('题号映射已更新:', mappings);
    } catch (error) {
      console.error('更新题号映射失败:', error);
    }
  };

  useEffect(() => {
    updateQuestionMappings();
  }, []);

  // 测试特定questionId的映射
  const testQuestionMapping = (questionId: number) => {
    const info = getQuestionNumberInfo(questionId, questionMappings);
    console.log(`题目ID ${questionId} 的映射信息:`, info);
    return info;
  };

  // 表格列定义
  const columns = [
    {
      title: '题目ID',
      dataIndex: 'questionId',
      key: 'questionId',
      width: 100,
    },
    {
      title: '显示题号',
      dataIndex: 'displayNumber',
      key: 'displayNumber',
      width: 100,
    },
    {
      title: '模块',
      dataIndex: 'moduleType',
      key: 'moduleType',
      width: 100,
      render: (moduleType: string) => {
        const color = moduleType === '听力' ? 'geekblue' : 
                     moduleType === '阅读' ? 'green' : 
                     moduleType === '写作' ? 'gold' : 'default';
        return <Tag color={color}>{moduleType}</Tag>;
      }
    },
    {
      title: '模块内题号',
      dataIndex: 'moduleNumber',
      key: 'moduleNumber',
      width: 120,
    },
    {
      title: '全局题号',
      dataIndex: 'globalNumber',
      key: 'globalNumber',
      width: 100,
    },
    {
      title: 'Part标题',
      dataIndex: 'partTitle',
      key: 'partTitle',
      width: 100,
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <Title level={2}>题号映射测试</Title>
      
      <Alert
        message="功能说明"
        description="此组件用于测试题号映射功能，确保答题情况组件中显示的题号与考试中的题号一致。"
        type="info"
        style={{ marginBottom: '20px' }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* 模块统计信息 */}
        <Card title="模块统计信息" size="small">
          {moduleStats && (
            <Space wrap>
              <Tag color="geekblue">听力: {moduleStats.listen} 题</Tag>
              <Tag color="green">阅读: {moduleStats.read} 题</Tag>
              <Tag color="gold">写作: {moduleStats.write} 题</Tag>
              <Tag color="purple">总计: {moduleStats.total} 题</Tag>
            </Space>
          )}
        </Card>

        {/* 操作按钮 */}
        <Card title="测试操作" size="small">
          <Space wrap>
            <Button onClick={updateQuestionMappings} type="primary">
              刷新题号映射
            </Button>
            <Button onClick={() => testQuestionMapping(1)}>
              测试题目ID 1
            </Button>
            <Button onClick={() => testQuestionMapping(10)}>
              测试题目ID 10
            </Button>
            <Button onClick={() => testQuestionMapping(20)}>
              测试题目ID 20
            </Button>
            <Button onClick={() => console.log('当前映射:', questionMappings)}>
              打印所有映射
            </Button>
          </Space>
        </Card>

        {/* 题号映射表格 */}
        <Card title="题号映射详情" size="small">
          <Table
            columns={columns}
            dataSource={questionMappings}
            rowKey="questionId"
            size="small"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 条`
            }}
            scroll={{ y: 400 }}
          />
        </Card>

        {/* 使用说明 */}
        <Card title="使用说明" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>题号映射规则：</Text>
              <ul>
                <li>听力模块：从第1题开始编号</li>
                <li>阅读模块：从听力题数+1开始编号</li>
                <li>写作模块：从听力+阅读题数+1开始编号</li>
                <li>每个题目如果有多个小题（correctArray），每个小题占一个题号</li>
              </ul>
            </div>
            <div>
              <Text strong>答题情况组件优化：</Text>
              <ul>
                <li>题号列显示考试中的实际题号（displayNumber）</li>
                <li>模块列显示题目所属模块（听力/阅读/写作）</li>
                <li>按模块和题号顺序排序显示</li>
                <li>支持HTML格式的正确答案显示</li>
              </ul>
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default QuestionNumberingTest;