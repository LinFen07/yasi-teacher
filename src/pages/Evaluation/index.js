import React, { useState, useEffect } from "react";
import { getConfrim } from "../../store/tasks";
import 'react-quill/dist/quill.snow.css';
import { Table, Button, Tag, Card, Spin, Select, Statistic, Breadcrumb } from "antd";
import { useSelector, useDispatch } from "react-redux";
import GradingPanel from "../../components/GradingPanel";
import ViewGradedPaper from "../../components/ViewGradedPaper";
import { fetchCompositionInfo, fetchArticle, updatePaperStatus, getAppraise } from '../../store/tasks';
import { putAppraise } from "../../utils/appraise";
import { postScore } from "../../utils/score";
import axios from "axios";
const { Countdown } = Statistic;

const Evaluation = () => {
  const { currentTask, appraise } = useSelector(state => state.tasks);
  const [papers, setPapers] = useState([
    {
      id: 31,
      studentName: "张三",
      studentId: "S001",
      paperName: "雅思模拟试卷1",
      status: "已阅",
      questions: [
        { id: 1, number: '一', points: 20, score: 18 },
        { id: 2, number: '二', points: 30, score: 28 },
        { id: 3, number: '三', points: 50, score: 46 }
      ],
      gradedTime: '2023-05-15 14:30'
    },
    {
      id: 25,
      studentName: '李四',
      studentId: 'S002',
      paperName: '雅思模拟试卷2',
      status: '待阅',
      questions: [
        { id: 1, number: '一', points: 20, score: undefined, grader: undefined },
        { id: 2, number: '二', points: 30, score: undefined, grader: undefined },
        { id: 3, number: '三', points: 50, score: undefined, grader: undefined }
      ],
      gradedTime: ''
    },
    {
      id: 28,
      studentName: '王五',
      studentId: 'S003',
      paperName: '雅思模拟试卷1',
      status: '待阅',
      questions: [
        { id: 1, number: '听力', points: 30, score: undefined, grader: undefined, comment: undefined },
        { id: 2, number: '阅读', points: 40, score: undefined, grader: undefined, comment: undefined },
        { id: 3, number: '写作', points: 30, score: undefined, grader: undefined, comment: undefined }
      ],
      gradedTime: ''
    }
  ]);

  const [currentPaper, setCurrentPaper] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [gradeLoading, setGradeLoading] = useState(false);
  const [essayLoading, setEssayLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const fetchInitialPapers = async () => {
      setEssayLoading(true);
      try {
        if (flag === false) {
          if (Array.isArray(papers) && papers.length > 0) {
            const firstPaper = papers.find(p => p?.id) || papers[0];
            const validatedPaper = {
              ...firstPaper,
              name: firstPaper.name || firstPaper.studentName || '未知考生',
              status: firstPaper.status || '待阅'
            };
            setCurrentPaper(validatedPaper);
          }
          setViewMode('list');
        } else {
          setViewMode('view');
          setFlag(false);
        }
      } catch (error) {
        console.error('初始化试卷数据失败:', error);
        setViewMode('list');
      } finally {
        setEssayLoading(false);
      }
    };
    fetchInitialPapers();
  }, [papers]);

  const dispatch = useDispatch();
  const userId = 1;
  useEffect(() => {
    dispatch(fetchCompositionInfo(31));
    dispatch(fetchArticle(userId, null));
    dispatch(getAppraise());

    if (viewMode === 'view' && currentPaper) {
      dispatch(getConfrim({
        paperId: currentPaper.id,
        questionId: currentPaper.questions[0]?.id,
        studentId: currentPaper.studentId
      }));
    }
  }, [dispatch, refreshFlag, viewMode, currentPaper]);

  const [isEditingMode, setIsEditingMode] = useState(false);

  const handleGradeSubmit = async (values) => {
    setGradeLoading(true);
    try {
      const updatedPapers = papers.map(p =>
        p.id === currentPaper.id ? {
          ...p,
          score: values.score,
          status: values.isEditingMode ? p.status : '已阅',
          gradedTime: values.isEditingMode ? p.gradedTime : new Date().toLocaleString()
        } : p
      );

      if (!values.isEditingMode) {
        const appraiseData = putAppraise(values.comment, currentPaper.id);
        await dispatch(appraiseData);
        await dispatch(updatePaperStatus({
          id: currentPaper.id,
          status: '已阅',
          score: values.score,
          gradedTime: new Date().toLocaleString()
        }));
        await postScore(currentPaper.id, values.score)();

        const nextPaper = updatedPapers.find(p =>
          p.paperName === currentPaper.paperName &&
          p.id !== currentPaper.id &&
          p.status === '待阅'
        );

        setPapers(updatedPapers);

        if (nextPaper) {
          if (flag === false) {
            const resetPaper = {
              ...nextPaper,
              score: undefined,
              comment: undefined,
              questions: nextPaper.questions.map(q => ({
                number: q.number,
                points: q.points,
                score: undefined,
                grader: undefined
              }))
            };
            setCurrentPaper(resetPaper);
            setViewMode('grade');
          }
          setTimeout(() => {
            setGradeLoading(false);
            setEditorContent('');
          }, 800);
        } else {
          if (flag === false) {
            setViewMode('list');
          }
          setGradeLoading(false);
          setEditorContent('');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      setGradeLoading(false);
    }
  };

  // 新增筛选函数
  const filterPendingPapers = () => {
    return papers.filter(paper => paper.status === '待阅' && paper.paperName === (selectedPaper || papers[0]?.paperName));
  };

  const handleStartGrading = () => {
    setEssayLoading(true);
    try {
      const pendingPapers = filterPendingPapers();
      if (pendingPapers.length > 0) {
        const firstPendingPaper = pendingPapers[0];
        setCurrentPaper(firstPendingPaper);
        setViewMode('grade');
      } else {
        console.log('没有待阅的试卷');
      }
    } finally {
      setEssayLoading(false);
    }
  };

  const handleEditPaper = (restoredData) => {
    setIsEditingMode(true);
    setFlag(true)
    setCurrentPaper({
      ...currentPaper,
      isEditing: true
    });
    setViewMode('grade');
  };

  const handleCancelEdit = () => {
    setIsEditingMode(false);
    setCurrentPaper({
      ...currentPaper,
      isEditing: false
    });
    setViewMode('view');
  };

  return (
    <Spin spinning={gradeLoading || essayLoading}>
      <div style={{ padding: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {viewMode === 'list' && (
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Breadcrumb
                  style={{ marginBottom: 16 }}
                  items={[
                    {
                      title: '试卷批阅'
                    },
                    {
                      title: (
                        <>
                          {selectedPaper || papers[0]?.paperName}
                          <span style={{ marginLeft: 8, color: '#1890ff' }}>
                            (已阅: {papers.filter(p => p.paperName === (selectedPaper || papers[0]?.paperName) && p.status === '已阅').length}
                            /总数: {papers.filter(p => p.paperName === (selectedPaper || papers[0]?.paperName)).length})
                          </span>
                        </>
                      )
                    }
                  ]}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  {currentTask?.deadline && (
                    <Countdown
                      title="剩余时间"
                      value={currentTask.deadline}
                      format="HH:mm:ss"
                    />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Select
                    style={{ width: 200 }}
                    defaultValue={papers[0]?.paperName}
                    value={selectedPaper || papers[0]?.paperName}
                    options={Array.from(new Set(papers.map(p => p.paperName))).map(name => ({
                      value: name,
                      label: name
                    }))}
                    onChange={value => setSelectedPaper(value)}
                  >
                  </Select>
                  <Button
                    type="primary"
                    onClick={handleStartGrading}
                    disabled={!filterPendingPapers().length}
                  >
                    开始批阅
                  </Button>
                </div>
                <Table
                  columns={[
                    {
                      title: '考生',
                      key: 'student',
                      render: (_, record) => record.studentName,
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: status => (
                        <Tag color={status === '已阅' ? 'green' : 'orange'}>
                          {status === '已阅' ? '已评阅' : '待评阅'}
                        </Tag>
                      )
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (_, record) => (
                        <Button
                          type="link"
                          onClick={() => {
                            setEssayLoading(true);
                            try {
                              setCurrentPaper(record);
                              setViewMode(record.status === '已阅' ? 'view' : 'grade');
                            } finally {
                              setEssayLoading(false);
                            }
                          }}>
                          {record.status === '已阅' ? '查看' : '评阅'}
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={papers
                    .filter(p => p.paperName === (selectedPaper || papers[0]?.paperName))
                    .sort((a, b) => {
                      if (a.status === '待阅' && b.status !== '待阅') return -1;
                      if (a.status !== '待阅' && b.status === '待阅') return 1;
                      return 0;
                    })}
                  rowKey="id"
                />
              </div>
            </Card>
          )}

          {viewMode === 'grade' && currentPaper && (
            <GradingPanel
              paperData={currentPaper}
              onSubmit={handleGradeSubmit}
              onCancel={() => setViewMode('list')}
              editorContent={editorContent}
              setEditorContent={setEditorContent}
              setFlag={setFlag}
            />
          )}

          {viewMode === 'view' && currentPaper && (
            <ViewGradedPaper
              paperData={currentPaper}
              onBack={() => setViewMode('list')}
              onEdit={handleEditPaper}
              originalData={papers.find(p => p.id === currentPaper.id)}
              appraiseData={appraise.response ? appraise.response.items : []}
            />
          )}
        </div>
      </div>
    </Spin>
  );
};

export default Evaluation;