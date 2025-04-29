import React, { useState, useRef, useEffect } from 'react';
import { Flex } from 'antd';
import PropTypes from 'prop-types';
import CustomReactQuill from '../CustomReactQuill';
import 'react-quill/dist/quill.snow.css';
import { Form, Card, Button, Table, Carousel, Tag, Spin, Drawer } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { getStudentsAnswers, getOriginalTitel } from '../../store/tasks';

const EvaluationPanel = ({
    form,
    editorContent,
    setEditorContent,
    onSubmit,
    onCancel,
    isEditingMode,
    paperData,
    answers: initialAnswers = []
}) => {
    const [answers, setAnswers] = useState(initialAnswers);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('组件挂载/更新，检查useEffect执行');
        console.log('当前paperData:', paperData);
        console.log('当前initialAnswers:', initialAnswers);

        const fetchAnswers = async () => {
            console.log('开始获取学生答案...');
            if (paperData?.studentId && paperData?.paperId) {
                console.log('检测到有效的paperData，包含studentId和paperId');
                setLoading(true);
                try {
                    console.log('准备调用getStudentsAnswers...');
                    const studentsInfo = {
                        studentId: paperData.studentId,
                        paperId: paperData.paperId
                    };
                    console.log('调用参数:', studentsInfo);

                    const response = await dispatch(getStudentsAnswers(studentsInfo));
                    console.log('API响应:', response);

                    if (!response) {
                        console.error('无效的API响应格式:', response);
                        setAnswers([]);
                        return;
                    }

                    // 按照questionId分组合并
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

                    console.log('分组合并后的数据:', groupedResponse);

                    console.log('开始获取题目详情...');
                    const answersWithDetails = await Promise.all(
                        Object.values(groupedResponse).map(async (group) => {
                            console.log(`获取题目${group.questionId}详情...`);
                            try {
                                const detailResponse = await dispatch(getOriginalTitel(group.questionId));
                                console.log(`题目${group.questionId}详情响应:`, detailResponse);
                                return {
                                    id: group.questionId,
                                    studentAnswer: group.answers.join(' / '),
                                    correctAnswer: group.correctAnswer || '无',
                                    isCorrect: group.isCorrects.includes(1) ? 1 : 0,
                                    score: (group.scores.reduce((a, b) => a + b, 0) / group.scores.length).toFixed(1),
                                    questionDetail: detailResponse.payload || '无题目详情',
                                    originalId: group.questionId
                                };
                            } catch (err) {
                                console.error(`获取题目${group.questionId}详情失败:`, err);
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
                    console.log('最终答案数据:', answersWithDetails);
                    setAnswers(answersWithDetails);
                } catch (error) {
                    console.error('获取学生答案过程中出错:', error);
                    setAnswers([]);
                } finally {
                    setLoading(false);
                    console.log('数据加载完成');
                }
            } else {
                console.warn('缺少必要的studentId或paperId，当前paperData:', paperData);
                setAnswers([]);
            }
        };
        fetchAnswers();
        console.log('检查initialAnswers:', initialAnswers);
        if (initialAnswers.length === 0) {
            console.log('initialAnswers为空，开始获取答案');
            fetchAnswers();
        } else {
            console.log('使用传入的初始答案:', initialAnswers);
            setAnswers(initialAnswers);
        }
    }, [dispatch, paperData, initialAnswers]);

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

    console.log('当前页码:', safePage, '总页数:', totalPages, '当前页数据:', currentAnswers);

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
                overflowX: 'hidden'
            }}>
                <div
                    style={{
                        display: 'flex',
                        height: 'calc(100vh - 180px)',
                        position: 'relative'
                    }}

                >
                    {isEditingMode ? (
                        <>
                            {/* 编辑模式下显示完整布局 */}
                            <div style={{
                                width: '480px',
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
                                                        title={`题号: ${item.id}`}
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
                                                        <p><strong>学生答案：</strong> {item.studentAnswer}</p>
                                                        <p><strong>正确答案：</strong> {item.correctAnswer}</p>
                                                        <p>
                                                            <strong>状态：</strong> 
                                                            {item.isCorrect === 2 ? (
                                                                <Tag color="blue">作文</Tag>
                                                            ) : (
                                                                <Tag color={item.isCorrect === 1 ? 'green' : 'red'}>
                                                                    {item.isCorrect === 1 ? '正确' : '错误'}
                                                                </Tag>
                                                            )}
                                                        </p>
                                                        <p><strong>得分：</strong> {item.score}</p>
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
                                        ) : (
                                            <div style={{ 
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#999'
                                            }}>
                                                {loading ? null : '暂无答题数据'}
                                            </div>
                                        )}
                                    </Spin>
                                </Card>
                            </div>


                        </>
                    ) : null}

                    {/* 右侧：评价编辑器 */}
                    <div style={{
                        width: isEditingMode ? '720px' : '100%',
                        paddingLeft: '8px',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                            <Card title="评价预览" style={{ flex: 1 }}>
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
                            </Card>
                            <Card title={isEditingMode ? "修改评价" : "撰写评价"} style={{ flex: 1 }}>
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
                                        style={{ height: 'calc(100% - 42px)', background: '#fff' }}
                                    />
                                </Form.Item>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* 操作按钮 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <Button onClick={onCancel}>取消</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                    >
                        {isEditingMode ? '保存修改' : '提交评价'}
                    </Button>
                </div>
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
                        <div 
                            dangerouslySetInnerHTML={{__html: currentDetail.questionDetail}}
                            style={{ 
                                border: '1px solid #f0f0f0',
                                padding: 16,
                                borderRadius: 4
                            }}
                        />
                    </div>
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