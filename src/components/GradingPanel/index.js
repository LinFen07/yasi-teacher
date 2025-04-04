import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Card } from 'antd';
import ScoreInput from '../ScoreInput';

/**
 * 评分面板组件
 * @param {object} paperData - 试卷数据
 * @param {function} onSubmit - 提交回调
 * @param {function} onCancel - 取消回调
 */
const GradingPanel = ({ 
  paperData = {},
  onSubmit,
  onCancel
}) => {
  const [form] = Form.useForm();

  return (
    <Card 
      title="试卷批阅"
      extra={<Button onClick={onCancel}>取消</Button>}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* 左侧试卷图片 */}
        <div style={{ flex: 1 }}>
          <img
            src={paperData.paperImage || '/default-paper.jpg'}
            alt="考生试卷"
            style={{ maxWidth: '100%' }}
          />
        </div>

        {/* 右侧评分表单 */}
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '16px' }}>
            考生姓名：{paperData.name || '未知'}
          </h3>
          <Form form={form} initialValues={paperData}>
            <Form.Item name="score" label="评分" rules={[{ required: true }]}>
              <ScoreInput />
            </Form.Item>

            <Form.Item name="comment" label="评语">
              <Input.TextArea rows={4} />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={onCancel}>取消</Button>
              <Button 
                type="primary" 
                onClick={() => {
                  form.validateFields()
                    .then(values => onSubmit(values));
                }}
              >
                提交
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Card>
  );
};

GradingPanel.propTypes = {
  paperData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    score: PropTypes.number,
    comment: PropTypes.string,
    paperImage: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default GradingPanel;
