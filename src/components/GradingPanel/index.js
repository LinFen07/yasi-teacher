import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, Button, message, Input, Form, Spin } from 'antd';
import ScoreInput from '../ScoreInput';
import { useSelector, useDispatch } from 'react-redux';
import { getStudentsAnswers } from '../../store/tasks';
const { TextArea } = Input;

const convertToText = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.documentElement.textContent;
};

const GradingPanel = ({
  paperData = {},
  onSubmit,
  onCancel,
  editorContent = '',
  setEditorContent,
  setFlag,
  isEditingMode = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchStudentAnswers = async () => {
      if (paperData?.studentId && paperData?.paperId) {
        setLoading(true);
        try {
          const studentsInfo = {
            studentId: paperData.studentId,
            paperId: paperData.paperId
          };
          const answers = await dispatch(getStudentsAnswers(studentsInfo));
          setStudentAnswers(answers);
        } catch (error) {
          message.error('获取学生答案失败');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStudentAnswers();
  }, [dispatch, paperData]);

  const handleSubmit = () => {
    form.validateFields()
      .then(() => {
        const submitData = {
          comment: editorContent,
          score: form.getFieldValue('score'),
          isEditingMode
        };
        onSubmit(submitData);
      })
      .catch(() => {
        message.error('请填写完整的评分和评语');
      });
  };

  const [currentPage, setCurrentPage] = useState(1);

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };
  // const { paper, article } = useSelector(state => state.tasks);
  const studentAnswer1 = null
  const studentAnswer2 = null
  const essayTitle1 = null
  const essayTitle2 = null

  return (
    <Form form={form}>
      <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
        {/* 左侧：作文展示区域 */}
        <div style={{ flex: 1 }}>
          <Card
            title="试卷批阅"
            style={{ boxShadow: 'none' }}
          >
            <div style={{ padding: 16 }}>
              <h3>考生姓名：{paperData?.studentName || '未知'}</h3>
            </div>
          </Card>

          {/* 显示作文内容 */}
          <div style={{ flex: 1, marginTop: '40px' }}>
            {currentPage === 1 && (
              <>
                <h3 style={{ color: 'var(--text-color)' }}>作文标题1</h3>
                <TextArea value={convertToText(essayTitle1) || ''} readOnly rows={3} style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-color)' }}>学生答案</h3>
                <TextArea value={convertToText(studentAnswer1) || ''} readOnly rows={10} />
              </>
            )}
            {currentPage === 2 && (
              <>
                <h3 style={{ color: 'var(--text-color)' }}>作文标题2</h3>
                <TextArea value={convertToText(essayTitle2) || ''} readOnly rows={3} style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-color)' }}>学生答案</h3>
                <TextArea value={convertToText(studentAnswer2) || ''} readOnly rows={10} />
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                上一篇
              </button>
              <button onClick={handleNextPage} disabled={currentPage === 2}>
                下一篇
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：评阅区域 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 评阅编辑区 */}
          <Card
            title={isEditingMode ? "修改评语" : "评阅编辑"}
            style={{ flex: 2 }}
          >
            <Form.Item
              name="score"
              label="评分"
              rules={[
                { required: true, message: '请输入评分' },
                { type: 'number', message: '评分必须为数字' }
              ]}
            >
              <ScoreInput value={form.getFieldValue('score')} onChange={(value) => form.setFieldsValue({ score: value })} />
            </Form.Item>
            <Form.Item
              name="comment"
              rules={[{ required: true, message: '请输入评语' }]}
            >
              <ReactQuill
                theme="snow"
                value={editorContent}
                onChange={setEditorContent}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
                style={{ height: '160px', background: '#fff' }}
              />
            </Form.Item>
          </Card>

          {/* 预览区 */}
          <Card
            title="评阅预览"
            style={{ flex: 1 }}
          >
            <div
              className="ql-editor"
              style={{
                height: '100px',
                overflow: 'auto',
                background: '#fff',
                padding: '16px'
              }}
              dangerouslySetInnerHTML={{
                __html: editorContent || '<p style="color:#999; text-align:center; margin-top:120px">请在上方编辑评语内容</p>'
              }}
            />
          </Card>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Button onClick={onCancel}>取消</Button>
            <Button
              onClick={() => {
                setEditorContent('');
                form.resetFields(['comment']);
              }}
              danger
            >
              清空
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
            >
              {isEditingMode ? '保存修改' : '提交评阅'}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default GradingPanel;