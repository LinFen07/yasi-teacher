import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Form, Input, Card, Button } from 'antd';
import ScoreInput from '../ScoreInput';
import { useDispatch, useSelector } from 'react-redux';
import { getOriginalTitel } from '../../store/tasks';
import { useEffect } from 'react';
const { TextArea } = Input;

const convertToText = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.documentElement.textContent;
};

const ScoringPanel = ({
    form,
    editorContent,
    setEditorContent,
    onSubmit,
    onCancel,
    isEditingMode,
    paperData,
}) => {
    // const { paper = [], article = {} } = useSelector(state => state.tasks);
    const [count, setCount] = useState(1)
    const [essayTitle, setEssayTitle] = useState('');
    const dispatch = useDispatch()
    // const items = article?.response?.items || [];
    const studentAnswer_1 = paperData?.composition[0]?.studentAnswer ? paperData.composition[0].studentAnswer : '暂无'
    const studentAnswer_2 = paperData?.composition[1]?.studentAnswer ? paperData.composition[1].studentAnswer : '暂无'
    const studentAnswer = count === 1 ? studentAnswer_1 : studentAnswer_2
    const score_1 = paperData?.composition[0]?.score ? paperData.composition[0].score : '未评分'
    const score_2 = paperData?.composition[1]?.score ? paperData.composition[1].score : '未评分'
    const score = count === 1 ? score_1 : score_2
    useEffect(() => {
        const fetchTitle = async () => {
            if (!paperData?.composition || paperData.composition.length < count) {
                setEssayTitle('');
                return;
            }

            const question = count === 1 ? paperData.composition[0] : paperData.composition[1];
            if (!question?.questionId) {
                setEssayTitle('');
                return;
            }

            try {
                const title = await dispatch(getOriginalTitel(question.questionId));
                setEssayTitle(title);
            } catch (error) {
                console.error('获取作文标题失败:', error);
                setEssayTitle('');
            }
        };

        fetchTitle();
    }, [dispatch, count, paperData]);
    // console.log(essayTitle)
    return (
        <div style={{ display: 'flex', height: '100%', gap: '16px' }}>
            {/* 左侧：作文内容 */}
            <Card
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 8 }}>作文标题</h3>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: essayTitle?.title || essayTitle?.content || '无标题'
                        }}
                        style={{
                            border: '1px solid #f0f0f0',
                            padding: 16,
                            borderRadius: 4,
                            background: '#fff',
                            marginBottom: 16
                        }}
                    />
                    <h3 style={{ marginBottom: 8 }}>作文内容</h3>
                    <TextArea
                        value={convertToText(studentAnswer) || ''}
                        readOnly
                        style={{ flex: 1, width: '100%', resize: 'none', marginBottom: 16 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <Button
                            onClick={() => setCount(1)}
                            disabled={count === 1}
                        >
                            上一篇
                        </Button>
                        <Button
                            onClick={() => setCount(2)}
                            disabled={count === 2}
                        >
                            下一篇
                        </Button>
                    </div>
                </div>
            </Card>

            {/* 右侧：合并后的信息与评分区域 */}
            <div style={{ width: '300px' }}>
                <Card title="考生信息与评分">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div><strong>姓名：</strong>{paperData?.studentName || '未知'}</div>
                            <div style={{ marginBottom: 8 }}>
                                <strong>原评分：</strong>
                                <ScoreInput
                                    value={score}
                                    readOnly
                                    disabled
                                    style={{
                                        width: '100%',
                                        marginTop: 4,
                                        backgroundColor: '#f5f5f5',
                                        cursor: 'not-allowed',
                                        opacity: 0.8
                                    }}
                                />
                            </div>
                        </div>
                        <Form form={form} onFinish={onSubmit}>
                            {count === 1 && (
                                <Form.Item
                                    name="score1"
                                    label="评分"
                                    rules={[
                                        { required: true, message: '请输入评分' },
                                        { type: 'number', message: '评分必须为数字' }
                                    ]}
                                >
                                    <ScoreInput style={{ width: '100%' }} />
                                </Form.Item>
                            )}
                            {count === 2 && (
                                <Form.Item
                                    name="score2"
                                    label="评分"
                                    rules={[
                                        { required: true, message: '请输入评分' },
                                        { type: 'number', message: '评分必须为数字' }
                                    ]}
                                >
                                    <ScoreInput style={{ width: '100%' }} />
                                </Form.Item>
                            )}
                            {/* <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ marginBottom: '8px' }}>作文评价</h3>
                                <TextArea rows={4} placeholder="请输入对作文的评价" />
                            </div> */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                <Button onClick={onCancel}>返回</Button>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">   {isEditingMode ? '保存修改' : '提交评价'}</Button>
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </Card>
            </div >
        </div >
    );
};

ScoringPanel.propTypes = {
    form: PropTypes.object.isRequired,
    editorContent: PropTypes.string,
    setEditorContent: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isEditingMode: PropTypes.bool,
    paperData: PropTypes.object,
    onPrevious: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    hasPrevious: PropTypes.bool,
    hasNext: PropTypes.bool
};

export default ScoringPanel;
