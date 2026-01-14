import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Card, Button } from 'antd';
import ScoreInput from '../ScoreInput';
import { useDispatch } from 'react-redux';
import { getOriginalTitel } from '../../store/tasks';

const { TextArea } = Input;

const stripHtmlTags = (html) => {
    if (!html) return '无标题';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
};

const ScoringPanel = ({
    form,
    onSubmit,
    isEditingMode,
    paperData,
    // 仅保留实际使用的 props，其他兼容 props 可通过 defaultProps 处理
}) => {
    const [count, setCount] = useState(1);
    const [essayTitle, setEssayTitle] = useState('');
    const dispatch = useDispatch();

    // 防御性处理作文数量
    const compositionCount = Array.isArray(paperData?.composition)
        ? paperData.composition.length
        : 0;

    // 当前作文数据
    const currentEssay = paperData?.composition?.[count - 1] || {};
    const studentAnswer = currentEssay.studentAnswer || '暂无';

    // 核心修复：处理评分值的类型转换
    const rawScore = currentEssay.score;
    // 1. 供 ScoreInput 使用的数字值（满足 propTypes）
    const scoreValue = !isNaN(Number(rawScore)) ? Number(rawScore) : 0;
    // 2. 供显示的文本（数字/未评分）
    const scoreDisplayText = !isNaN(Number(rawScore)) ? Number(rawScore) : '未评分';

    // 获取作文标题
    const fetchTitle = useCallback(async () => {
        if (!currentEssay?.questionId) {
            setEssayTitle('无标题');
            return;
        }
        try {
            const titleRes = await dispatch(getOriginalTitel(currentEssay.questionId));
            setEssayTitle(titleRes?.title || titleRes?.content || '无标题');
        } catch (error) {
            console.error('获取作文标题失败:', error);
            setEssayTitle('无标题');
        }
    }, [dispatch, currentEssay.questionId]);

    useEffect(() => {
        fetchTitle();
    }, [fetchTitle, count]);

    // 安全切换作文
    const handleSwitchEssay = (newCount) => {
        if (newCount < 1 || newCount > compositionCount) return;
        setCount(newCount);
    };

    return (
        <div style={{ display: 'flex', height: '100%', gap: '16px' }}>
            {/* 左侧作文内容 */}
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 8 }}>作文标题</h3>
                    {compositionCount === 0 ? (
                        <div style={{ textAlign: 'center', padding: 24, fontSize: 16 }}>考生未答题</div>
                    ) : (
                        <>
                            <div
                                style={{
                                    border: '1px solid #f0f0f0',
                                    padding: 16,
                                    borderRadius: 4,
                                    background: '#fff',
                                    marginBottom: 16
                                }}
                            >
                                {stripHtmlTags(essayTitle)}
                            </div>
                            <h3 style={{ marginBottom: 8 }}>作文内容</h3>
                            <TextArea
                                value={stripHtmlTags(studentAnswer) || ''}
                                readOnly
                                style={{ flex: 1, width: '100%', height: '190px', resize: 'none', marginBottom: 20 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                <Button
                                    onClick={() => handleSwitchEssay(1)}
                                    disabled={count === 1 || compositionCount < 1}
                                >
                                    上一篇
                                </Button>
                                <Button
                                    onClick={() => handleSwitchEssay(2)}
                                    disabled={count === 2 || compositionCount < 2}
                                >
                                    下一篇
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* 右侧评分区域 */}
            <div style={{ width: '300px' }}>
                <Card title="考生信息与评分">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div><strong>姓名：</strong>{paperData?.studentName || '未知'}</div>
                            <div style={{ marginBottom: 8 }}>
                                <strong>原评分：</strong>
                                {/* 修复核心：value 传数字 scoreValue，placeholder 显示文本 */}
                                <ScoreInput
                                    value={scoreValue}
                                    placeholder={scoreDisplayText}
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
                                        { type: 'number', min: 0, max: 100, message: '评分必须为0-100的数字' }
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
                                        { type: 'number', min: 0, max: 100, message: '评分必须为0-100的数字' }
                                    ]}
                                >
                                    <ScoreInput style={{ width: '100%' }} />
                                </Form.Item>
                            )}
                            <div style={{ marginTop: '16px' }}>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{ width: '100%' }}
                                    >
                                        {isEditingMode ? '保存修改' : '提交评价'}
                                    </Button>
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// 精简后的 PropTypes
ScoringPanel.propTypes = {
    form: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isEditingMode: PropTypes.bool,
    paperData: PropTypes.object
};

ScoringPanel.defaultProps = {
    isEditingMode: false,
    paperData: {}
};

export default ScoringPanel;