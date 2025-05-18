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
import { putAppraise } from '../../utils/appraise';

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
    const disnavigate = useNavigate();

    const [isFetching, setIsFetching] = useState(false);

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
                // console.log('API响应:', response);

                if (!response) {
                    // console.error('无效的API响应格式:', response);
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
                                correctAnswer: group.correctAnswer || '无',
                                isCorrect: group.isCorrects.includes(1) ? 1 : 0,
                                score: (group.scores.reduce((a, b) => a + b, 0) / group.scores.length).toFixed(1),
                                questionDetail: detailResponse.title || '无题目详情',
                                originalId: group.questionId,
                                items: detailResponse.items || []
                            };
                        } catch (err) {
                            // console.error(`获取题目详情失败:`, err);
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
                // console.error('获取学生答案失败:', error);
                setAnswers([]);
            } finally {
                setLoading(false);
                setIsFetching(false);
            }
        };

        fetchAnswers();
    }, [dispatch, paperData?.studentId, paperData?.paperId]);

    // 添加mount日志
    useEffect(() => {
        console.log('EvaluationPanel组件已挂载');
        return () => {
            console.log('EvaluationPanel组件即将卸载');
        };
    }, []);
    // console.log(paperData)
    const [currentPage, setCurrentPage] = useState(1);
    const [currentDetail, setCurrentDetail] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);


    const pageSize = 10; // 每页显示的题目数量

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
            render: text => text || '无'
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

    const handlePageChange = (page) => {
        console.log('切换页码:', page);
        setCurrentPage(page);
        // 强制触发重新渲染
        setAnswers([...answers]);
    };

    // 优化分页逻辑
    const totalPages = Math.max(Math.ceil(answers.length / pageSize), 1);
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const currentAnswers = answers.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );
    const handleDetailClose = async (values) => {
        try {
            const tasks = JSON.parse(localStorage.getItem('tasks'));
            const examPaperId = tasks?.response?.items?.[0]?.examPaperId;
            if (!examPaperId) {
                message.error('无法获取试卷ID');
                return;
            }

            // 保存编辑器内容
            const commentContent = editorContent;

            await dispatch(putAppraise(values.comment, examPaperId));
            message.success('评价提交成功');

            // 提交完成后手动调用onSubmit
            onSubmit();

            // 保留编辑器内容
            setEditorContent('');
        } catch (error) {
            console.error('提交失败:', error);
            message.error('评价提交失败');
        }

    }
    // console.log('当前页码:', safePage, '总页数:', totalPages, '当前页数据:', currentAnswers);
    // console.log(111, paperData)
    console.log('Rendering EvaluationPanel:', {
        loading,
        answersCount: answers.length,
        isEditingMode
    });

    return (
        <Form form={form} onFinish={onSubmit}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                height: '100%',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                overflowX: 'hidden',
                border: '1px solid rgb(232, 215, 215)' // 调试用边框
            }}>
                <div
                    style={{
                        display: 'flex',
                        height: 'calc(100vh - 180px)',
                        position: 'relative',
                        height: '520px'
                    }}
                >
                    <div style={{
                        width: '480px',
                        height: '500px',
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
                                overflow: 'hidden',
                                touchAction: 'pan-y'
                            }}
                        >
                            <Spin spinning={loading} tip="数据加载中..." size="large">
                                {answers.length > 0 ? (
                                    isEditingMode ? (
                                        <>
                                            <Carousel
                                                dots={false}
                                                afterChange={(current) => handlePageChange(current + 1)}
                                                style={{ flex: 1 }}
                                                easing="ease-in-out"
                                                draggable
                                                swipe
                                                touchMove
                                                swipeToSlide
                                                speed={500}
                                                waitForAnimate
                                                infinite={false}
                                                adaptiveHeight
                                            >
                                                {Array.from({ length: totalPages }).map((_, i) => (
                                                    <div key={i} style={{ padding: '0 8px' }}>
                                                        <div style={{
                                                            marginBottom: 16,
                                                            height: 'calc(100vh - 280px)',
                                                            overflowY: 'auto',
                                                            paddingRight: '8px',
                                                            margin: '0 -8px'
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
                                                                    <p><strong>学生答案：</strong> {item.studentAnswer || '无'}</p>
                                                                    <p><strong>正确答案：</strong> {item.correctAnswer || '无'}</p>
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
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            marginTop: 16
                                                        }}>
                                                            <Button
                                                                disabled={currentPage <= 1}
                                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                            >
                                                                上一页
                                                            </Button>
                                                            <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
                                                            <Button
                                                                disabled={currentPage >= totalPages}
                                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                            >
                                                                下一页
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Carousel>
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
                                                    onClick={() => setCurrentPage(currentPage - 1)}
                                                >
                                                    上一页
                                                </Button>
                                                <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
                                                <Button
                                                    disabled={currentPage >= totalPages}
                                                    onClick={() => setCurrentPage(currentPage + 1)}
                                                >
                                                    下一页
                                                </Button>
                                            </div>
                                        </>
                                    ) : null
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
                                                <div>暂无答题数据</div>
                                            </>
                                        )}
                                    </div>
                                )}
                                {console.log('Empty state rendered:', !loading && answers.length === 0)}
                            </Spin>
                        </Card>
                    </div>

                    {/* 右侧：评价编辑器 */}
                    <div style={{
                        width: isEditingMode ? '720px' : '100%',
                        paddingLeft: '8px',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                            {/* <Card title="评价预览" style={{ flex: 1 }}>
                                <div
                                    className="ql-editor"
                                    style={{
                                        height: '100%',
                                        overflow: 'auto',
                                        background: '#fff',
                                        padding: '16px'
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: editorContent || '<p style="color:#999; text-align:center; margin-top:120px">请在右侧编辑评价内容</p>'
                                    }}
                                />
                            </Card> */}
                            <Card title={isEditingMode ? "修改评价" : "撰写评价"} style={{ flex: 1 }}>
                                <div style={{ marginBottom: 8 }}>
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
                                <Form.Item
                                    name="comment"
                                    label=""
                                    rules={[{ required: true, message: '请输入评价内容' }]}
                                >
                                    <CustomReactQuill
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
                                        placeholder="请输入对试卷整体的评价..."
                                        style={{
                                            height: '250px',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '4px',
                                            background: '#fff'
                                        }}
                                    />
                                </Form.Item>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* 操作按钮
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <Button onClick={onCancel}>取消</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                    // onsubmit={() => setViewMode('list')}
                    // onClick={() => handleDetailClose()}
                    >
                        {isEditingMode ? '保存修改' : '提交评价'}
                    </Button>
                </div> */}
            </div>
            {currentDetail && (
                <Drawer
                    title={`题目详情 - 题号: ${currentDetail.id}`}
                    width={720}
                    visible={detailVisible}
                    onClose={() => setDetailVisible(false)}
                    bodyStyle={{ paddingBottom: 80 }}
                >
                    <div style={{ marginBottom: 24 }}>
                        <h4>学生答案</h4>
                        <p>{currentDetail.studentAnswer}</p>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <h4>正确答案</h4>
                        <p>{currentDetail.correctAnswer}</p>
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
                    {currentDetail.items && (
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

EvaluationPanel.propTypes = {
    form: PropTypes.object.isRequired,
    editorContent: PropTypes.string,
    setEditorContent: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isEditingMode: PropTypes.bool,
    paperData: PropTypes.object,
    answers: PropTypes.array
};

export default EvaluationPanel;