import React from 'react';
import PropTypes from 'prop-types';
import { Descriptions, Image, Divider, Table, Button, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import ScoreInput from '../ScoreInput';

/**
 * 已阅试卷查看组件
 * @param {object} paperData - 试卷数据
 * @param {function} onBack - 返回回调
 */
const ViewGradedPaper = ({ 
  paperData = {},
  onBack
}) => {
  return (
    <Card 
      title={`${paperData.name || '考生'}的已阅试卷`}
      extra={<Button onClick={onBack}>返回</Button>}
    >
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* 左侧试卷区域 */}
        <div style={{ flex: 1 }}>
          <Image
            src={paperData.paperImage || '/default-paper.jpg'}
            alt="已阅试卷"
            style={{ maxWidth: '100%', maxHeight: '600px' }}
          />
        </div>

        {/* 右侧评分信息 */}
        <div style={{ flex: 1 }}>
          <Descriptions title="评分详情" column={1} bordered>
            <Descriptions.Item label="学生姓名">
              {paperData.name || '未知'}
            </Descriptions.Item>
            <Descriptions.Item label="得分">
              <ScoreInput 
                value={paperData.score} 
                disabled
              />
            </Descriptions.Item>
            <Descriptions.Item label="评语">
              {paperData.comment || '无评语'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <div style={{ marginTop: '16px' }}>
            <h4>各题得分明细</h4>
            <Table
              size="small"
              columns={[
                { title: '题号', dataIndex: 'number', key: 'number' },
                { title: '分值', dataIndex: 'points', key: 'points' },
                { title: '得分', dataIndex: 'score', key: 'score' },
                { title: '批阅人', dataIndex: 'grader', key: 'grader' }
              ]}
              dataSource={paperData.questions || []}
              pagination={false}
            />
          </div>

          <Divider />

          <div style={{ marginTop: '16px' }}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => console.log('导出PDF')}
            >
              导出PDF
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

ViewGradedPaper.propTypes = {
  paperData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    score: PropTypes.number,
    comment: PropTypes.string,
    paperImage: PropTypes.string,
    questions: PropTypes.array,
    gradedTime: PropTypes.string
  }),
  onBack: PropTypes.func.isRequired
};

export default ViewGradedPaper;
