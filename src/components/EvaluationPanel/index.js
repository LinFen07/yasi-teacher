import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Flex, message, Input } from 'antd';
import PropTypes from 'prop-types';
import CustomReactQuill from '../CustomReactQuill';
import 'react-quill/dist/quill.snow.css';
import { Form, Card, Button, Table, Carousel, Tag, Spin, Drawer } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { getStudentsAnswers, getOriginalTitel } from '../../store/tasks';

// 转换HTML内容为纯文本
const convertHtmlToText = (html) => {
    if (!html) return '';
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    } catch (e) {
        console.error('HTML解析失败:', e);
        return html;
    }
};

const EvaluationPanel = ({
    form,
    editorContent,
    setEditorContent,
    onSubmit,
    onCancel,
    isEditingMode,
    paperData,
    answers: initialAnswers = [],
    setViewMode
}) => {
    const [answers, setAnswers] = useState(initialAnswers);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate(); // 修正变量名：disnavigate → navigate

    const [isFetching, setIsFetching] = useState(false);

    // 修复：编辑模式下回显原评价内容
    useEffect(() => {
        if (isEditingMode && paperData?.studentsInfo?.appraise) {
            setEditorContent(paperData.studentsInfo.appraise);
            // 同步到表单字段，确保校验通过
            form.setFieldsValue({ comment: paperData.studentsInfo.appraise });
        } else if (!isEditingMode) {
            // 非编辑模式清空编辑器
            setEditorContent('');
            form.setFieldsValue({ comment: '' });
        }
    }, [isEditingMode, paperData?.studentsInfo?.appraise, form, setEditorContent]);

    // 获取学生答题数据
    useEffect(() => {
        if (!paperData?.studentId || !paperData?.paperId || isFetching) {
            return;
        }

        const fetchAnswers = async () => {
            setIsFetching(true);
            setLoading(true);
            try {
                const studentsInfo = {
                    studentId: paperData.studentId,
                    paperId: paperData.paperId
                };

                const response = await dispatch(getStudentsAnswers(studentsInfo));
                if (!response || !Array.isArray(response)) {
                    setAnswers([]);
                    return;
                }

                const groupedResponse = response.reduce((acc, item) => {
                    if (!acc[item.questionId]) {
                        acc[item.questionId] = {
                            ...item,
                            answers: [item.studentAnswer || '未作答'],
                            scores: [item.score || 0],
                            isCorrects: [item.isCorrect || 0]
                        };
                    } else {
                        acc[item.questionId].answers.push(item.studentAnswer || '未作答');
                        acc[item.questionId].scores.push(item.score || 0);
                        acc[item.questionId].isCorrects.push(item.isCorrect || 0);
                    }
                    return acc;
                }, {});

                const answersWithDetails = await Promise.all(
                    Object.values(groupedResponse).map(async (group) => {
                        try {
                            const detailResponse = await dispatch(getOriginalTitel(group.questionId));
                            return {
                                id: group.questionId,
                                studentAnswer: group.answers.join(' / '),
                                correctAnswer: detailResponse.correct || detailResponse.correctArray || '无',
                                isCorrect: group.isCorrects.includes(1) ? 1 : 0,
                                score: (group.scores.reduce((a, b) => a + b, 0) / group.scores.length).toFixed(1),
                                questionDetail: detailResponse.title || '无题目详情',
                                originalId: group.questionId,
                                items: detailResponse.items || []
                            };
                        } catch (err) {
                            console.error(`获取题目详情失败:`, err);
                            return {
                                id: group.questionId,
                                studentAnswer: group.answers.join(' / '),
                                correctAnswer: group.correctAnswer || '无',
                                isCorrect: group.isCorrects.includes(1) ? 1 : 0,
                                score: (group.scores.reduce((a, b) => a + b, 0) / group.scores.length).toFixed(1),
                                questionDetail: '获取详情失败'
                            };
                        }
                    })
                );
                setAnswers(answersWithDetails);
            } catch (error) {
                console.error('获取学生答案失败:', error);
                setAnswers([]);
                message.error('获取答题数据失败');
            } finally {
                setLoading(false);
                setIsFetching(false);
            }
        };

        fetchAnswers();
    }, [dispatch, paperData?.studentId, paperData?.paperId]);

    // 组件挂载/卸载日志
    useEffect(() => {
        console.log('EvaluationPanel组件已挂载');
        return () => {
            console.log('EvaluationPanel组件即将卸载');
        };
    }, []);

    // 分页逻辑优化
    const [currentPage, setCurrentPage] = useState(1);
    const [currentDetail, setCurrentDetail] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [overflowY, setOverflowY] = useState('auto');
    const pageSize = 10; // 每页显示的题目数量

    // 修复：分页数据计算（避免Carousel和手动分页冲突）
    const totalPages = Math.max(Math.ceil(answers.length / pageSize), 1);
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const currentAnswers = answers.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );

    // 修复：分页切换逻辑（统一手动分页，移除Carousel的自动切换）
    const handlePageChange = (page) => {
        setOverflowY('hidden');
        setTimeout(() => {
            setCurrentPage(page);
            setOverflowY('auto');
        }, 300);
    };

    // 修复：移除重复的提交逻辑，统一由onSubmit处理
    const handleDetailClose = () => {
        setDetailVisible(false);
    };

    // 修复：编辑器内容和表单字段双向绑定
    const handleEditorChange = (content) => {
        setEditorContent(content);
        // 同步到表单字段，确保提交时能拿到值
        form.setFieldsValue({ comment: content });
    };

    // 表格列配置
    const columns = [
        {
            title: '题号',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 80
        },
        {
            title: '学生答案',
            dataIndex: 'studentAnswer',
            key: 'studentAnswer',
            align: 'center',
            width: 200,
            render: text => text || '未作答'
        },
        {
            title: '正确答案',
            dataIndex: 'correctAnswer',
            key: 'correctAnswer',
            align: 'center',
            width: 200,
            render: text => convertHtmlToText(text) || '无'
        },
        {
            title: '题目详情',
            key: 'isCorrect',
            align: 'center',
            width: 100,
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
            width: 80,
            render: score => score ?? 0
        }
    ];

    const answerCardRef = useRef(null);

    return (
        <Form form={form} onFinish={onSubmit} layout="vertical">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                height: '100%',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                overflowX: 'hidden'
            }}>
                <div
                    style={{
                        display: 'flex',
                        height: 'calc(100vh - 340px)',
                        position: 'relative',
                    }}
                >
                    {/* 左侧：答题情况 */}
                    <div style={{
                        width: '480px',
                        height: '520px',
                        paddingRight: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0
                    }}>
                        <Card
                            title="答题情况"
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                overflowY: 'auto',
                                touchAction: 'pan-y'
                            }}
                        >
                            <Spin spinning={loading} tip="数据加载中..." size="large">
                                {answers.length > 0 ? (
                                    <div style={{ flex: 1 }}>
                                        <div
                                            ref={answerCardRef}
                                            style={{
                                                marginBottom: 16,
                                                height: 'calc(100vh - 280px)',
                                                overflowY: overflowY,
                                                paddingRight: '8px'
                                            }}>
                                            {currentAnswers.map((item, index) => (
                                                <Card
                                                    key={index}
                                                    style={{ marginBottom: 8 }}
                                                    title={`题号: ${item.id || '无'}`}
                                                    extra={
                                                        <Button
                                                            type="link"
                                                            onClick={() => {
                                                                setCurrentDetail(item);
                                                                setDetailVisible(true);
                                                            }}
                                                        >
                                                            详情
                                                        </Button>
                                                    }
                                                >
                                                    <p><strong>学生答案：</strong> {item.studentAnswer ? (item.studentAnswer.length > 30 ? `${item.studentAnswer.substring(0, 30)}...` : item.studentAnswer) : '无'}</p>
                                                    <p><strong>正确答案：</strong> {convertHtmlToText(item.correctAnswer) || '无'}</p>
                                                    <p>
                                                        <strong>状态：</strong>
                                                        {item.isCorrect === 2 ? (
                                                            <Tag color="blue">作文</Tag>
                                                        ) : item.isCorrect === undefined ? (
                                                            <Tag color="gray">未评阅</Tag>
                                                        ) : (
                                                            <Tag color={item.isCorrect === 1 ? 'green' : 'red'}>
                                                                {item.isCorrect === 1 ? '正确' : '错误'}
                                                            </Tag>
                                                        )}
                                                    </p>
                                                    <p><strong>得分：</strong> {item.score || '0'}</p>
                                                </Card>
                                            ))}
                                        </div>
                                        {/* 手动分页控件（移除Carousel，避免冲突） */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: 16,
                                            padding: '12px 0',
                                            borderTop: '1px solid #f0f0f0',
                                            position: 'sticky',
                                            bottom: 0,
                                            background: '#fff',
                                            zIndex: 1
                                        }}>
                                            <Button
                                                disabled={currentPage <= 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                上一页
                                            </Button>
                                            <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
                                            <Button
                                                disabled={currentPage >= totalPages}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                下一页
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#666',
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        {loading ? <Spin /> : (
                                            <>
                                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 16 }}>
                                                    <path d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z" stroke="#666" strokeWidth="2" />
                                                    <path d="M32 24V32M32 40H32.02" stroke="#666" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                                <div>考生未答题</div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </Spin>
                        </Card>
                    </div>

                    {/* 右侧：评价编辑器 */}
                    <div style={{
                        flex: 1, // 修复宽度：自适应剩余空间，替代固定宽度
                        height: '520px',
                        paddingLeft: '8px',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        <Card title={isEditingMode ? "修改评价" : "撰写评价"} style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* 原评价展示 */}
                            <div style={{ marginBottom: 16 }}>
                                <strong>原评价：</strong>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: paperData?.studentsInfo?.appraise || '<span style="color:#999">未评价</span>'
                                    }}
                                    style={{
                                        width: '100%',
                                        marginTop: 8,
                                        padding: '12px',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '4px',
                                        backgroundColor: '#fafafa',
                                        minHeight: '32px',
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                        lineHeight: 1.6,
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* 修复：表单字段和编辑器双向绑定 */}
                            <Form.Item
                                name="comment"
                                label=""
                                rules={[
                                    {
                                        required: !isEditingMode, // 编辑模式允许为空
                                        message: '请输入评价内容'
                                    }
                                ]}
                            >
                                <CustomReactQuill
                                    theme="snow"
                                    value={editorContent || ''} // 兜底空字符串，避免undefined
                                    onChange={handleEditorChange} // 绑定自定义change事件，同步表单字段
                                    modules={{
                                        toolbar: {
                                            container: [
                                                [{ 'header': [1, 2, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'color': [] }, { 'background': [] }],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link'], // 移除image，避免上传问题
                                                ['clean']
                                            ]
                                        },
                                        clipboard: {
                                            matchVisual: false
                                        }
                                    }}
                                    placeholder="请输入对试卷整体的评价..."
                                    style={{
                                        height: '280px', // 优化高度
                                        width: '100%',
                                        borderRadius: '6px',
                                        background: '#fff'
                                    }}
                                />
                            </Form.Item>

                            {/* 修复：恢复提交/取消按钮，确保能触发表单提交 */}
                            {/* <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '16px',
                                marginTop: 'auto', // 固定在编辑器底部
                                paddingTop: '16px',
                                borderTop: '1px solid #f0f0f0'
                            }}>
                                <Button onClick={onCancel}>取消</Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                >
                                    {isEditingMode ? '保存修改' : '提交评价'}
                                </Button>
                            </div> */}
                        </Card>
                    </div>
                </div>
            </div>

            {/* 题目详情抽屉 */}
            {currentDetail && (
                <Drawer
                    title={`题目详情 - 题号: ${currentDetail.id}`}
                    width={720}
                    visible={detailVisible}
                    onClose={handleDetailClose}
                    bodyStyle={{ paddingBottom: 80 }}
                >
                    <div style={{ marginBottom: 24 }}>
                        <h4>学生答案</h4>
                        <p>{currentDetail.studentAnswer}</p>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <h4>正确答案</h4>
                        <p>{convertHtmlToText(currentDetail.correctAnswer)}</p>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <h4>得分</h4>
                        <p>{currentDetail.score}</p>
                    </div>
                    <div>
                        <h4>题目详情</h4>
                        <div style={{
                            border: '1px solid #f0f0f0',
                            padding: 16,
                            borderRadius: 4,
                            background: '#fff'
                        }}>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: currentDetail.questionDetail || '无题目详情'
                                }}
                                style={{
                                    fontSize: '15px',
                                    lineHeight: 1.6
                                }}
                            />
                        </div>
                    </div>
                    {currentDetail.items && currentDetail.items.length > 0 && (
                        <div style={{ marginTop: 24 }}>
                            <h4>题目选项</h4>
                            <div style={{
                                border: '1px solid #f0f0f0',
                                padding: 16,
                                borderRadius: 4,
                                background: '#fff'
                            }}>
                                {currentDetail.items.map((item, index) => (
                                    <div key={index} style={{ marginBottom: 8 }}>
                                        <strong>{String.fromCharCode(65 + index)}. </strong>
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: item.content || '无选项内容'
                                            }}
                                            style={{
                                                fontSize: '15px',
                                                lineHeight: 1.6
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Drawer>
            )}
        </Form>
    );
};

// 修复PropTypes：补充setViewMode的类型定义
EvaluationPanel.propTypes = {
    form: PropTypes.object.isRequired,
    editorContent: PropTypes.string,
    setEditorContent: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isEditingMode: PropTypes.bool,
    paperData: PropTypes.object,
    answers: PropTypes.array,
    setViewMode: PropTypes.func
};

// 设置默认props，避免undefined
EvaluationPanel.defaultProps = {
    isEditingMode: false,
    paperData: {},
    answers: [],
    setViewMode: () => { }
};

export default EvaluationPanel;