import React, { useState, useEffect, use } from "react";
import { getComposition, getConfrim, getStudentsAnswers, getStudentsInfo, getTask, selectNameById } from "../../store/tasks";
import 'react-quill/dist/quill.snow.css';
import { Table, Button, Tag, Card, Spin, Select, Statistic, Breadcrumb, Form } from "antd";
import { useSelector, useDispatch } from "react-redux";
import ScoringPanel from "../../components/ScoringPanel";
import EvaluationPanel from "../../components/EvaluationPanel";
import ViewGradedPaper from "../../components/ViewGradedPaper";
import { fetchCompositionInfo, fetchArticle, updatePaperStatus, getAppraise } from '../../store/tasks';
import { putAppraise } from "../../utils/appraise";
import { postScore } from "../../utils/score";
import axios from "axios";
const { Countdown } = Statistic;

const Evaluation = () => {
  const [form] = Form.useForm();
  const { currentTask, appraise, id, tasks, article } = useSelector(state => state.tasks);

  // 添加所有缺失的状态声明
  const [papers, setPapers] = useState([]);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [gradeLoading, setGradeLoading] = useState(false);
  const [essayLoading, setEssayLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [flag, setFlag] = useState(false);

  const dispatch = useDispatch();
  const userId = 7;

  // 清理未使用的变量

  useEffect(() => {
    dispatch(fetchCompositionInfo(34));
    dispatch(fetchArticle(userId, null));
    dispatch(getAppraise());
    dispatch(getTask(userId));
  }, [dispatch]);
  useEffect(() => {
    const itemsLength = tasks?.response?.items?.length || 0;
    const newPapers = [];
    const processItemsSequentially = async () => {
      for (let i = 0; i < itemsLength; i++) {
        try {
          const type = tasks.response.items[i].type;
          // console.log(type)
          if (type !== null) {
            const examPaperId = tasks.response.items[i].examPaperId;
            const studentsInfo = await dispatch(getStudentsInfo(examPaperId));
            const composition = await dispatch(getComposition(studentsInfo));
            const studentName = await dispatch(selectNameById(studentsInfo))
            const selectId = type === 1 ? [composition[0].id, composition[1].id] : tasks.response.items[i].examPaperId;
            const paperId = studentsInfo.paperId;
            const status = type === 1 ? composition[0].score !== 0 && composition[1].score !== 0 ? '已阅' : '未阅' : studentsInfo.appraise !== "undefined" && studentsInfo.appraise !== null ? '已阅' : '未阅';
            newPapers.push({
              studentsInfo: studentsInfo,
              paperId: paperId,
              studentName: studentName,
              studentId: studentsInfo.studentId,
              composition: composition,
              id: selectId,
              paperName: `雅思模拟试卷${paperId}`,
              type: type,
              status: status,
              questions: [
                { id: 1, number: '一', points: 20, score: undefined, grader: undefined },
                { id: 2, number: '二', points: 30, score: undefined, grader: undefined },
                { id: 3, number: '三', points: 50, score: undefined, grader: undefined }
              ],
              gradedTime: '',
            });
            setPapers(newPapers);
            console.log(papers);
          }
        } catch (error) {
          // console.error(`处理第${i}项时出错:`, error);
        }
      }
    };

    if (tasks?.response?.items) {
      processItemsSequentially();
    }
  }, [dispatch, tasks]);

  const [isEditingMode, setIsEditingMode] = useState(false);
  const handleGradeSubmit = async (values) => {
    setGradeLoading(true);
    const score1 = values.score1 || form.getFieldValue('score1')
    const score2 = values.score2 || form.getFieldValue('score2')
    try {
      let updatedPapers
      if (currentPaper.type === 1) {
        updatedPapers = papers.map(p => {
          if (p.id === currentPaper.id) {
            const newComposition = [...p.composition];
            if (score1 !== undefined) {
              newComposition[0].score = score1;
            }
            if (score2 !== undefined) {
              newComposition[1].score = score2;
            }
            return {
              ...p,
              composition: newComposition,
              status: values.isEditingMode ? p.status : '已阅',
              gradedTime: values.isEditingMode ? p.gradedTime : new Date().toLocaleString()
            };
          }
          return p;
        });
      }
      if (currentPaper.type === 2) {
        updatedPapers = papers.map(p => {
          if (p.id === currentPaper.id) {
            const newstudentInfo = { ...p.studentsInfo }
            newstudentInfo.appraise = values.appraise
            return {
              ...p,
              studentsInfo: newstudentInfo,
              status: values.isEditingMode ? p.status : '已阅',
              gradedTime: values.isEditingMode ? p.gradedTime : new Date().toLocaleString()
            }
          }
          return p;
        }
        )
      }
      if (!values.isEditingMode) {
        const appraiseData = putAppraise(values.comment, currentPaper.id);
        await dispatch(appraiseData);
        await dispatch(updatePaperStatus({
          id: currentPaper.id,
          status: '已阅',
          score: values.score,
          gradedTime: new Date().toLocaleString()
        }));
        if (score1 != undefined) {
          await postScore(currentPaper.id[0], score1)()
        }
        if (score2 != undefined) {
          await postScore(currentPaper.id[1], score2)();
        }
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
    return papers.filter(paper => paper.status === '待阅' && paper.type === (selectedPaper || 1));
  };

  const handleStartGrading = () => {
    setEssayLoading(true);
    try {
      const pendingPapers = filterPendingPapers();
      if (!pendingPapers || pendingPapers.length === 0) {
        console.log('没有待阅的试卷');
        return;
      }

      const firstPendingPaper = pendingPapers[0];
      if (!firstPendingPaper) {
        console.error('获取待阅试卷失败');
        return;
      }

      setCurrentPaper({
        ...firstPendingPaper,
        questions: firstPendingPaper.questions || []
      });
      setViewMode('grade');
    } catch (error) {
      console.error('开始批阅失败:', error);
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
    setCurrentPaper(null);
    setViewMode('list');
    setSelectedPaper(null);
    setRefreshFlag(prev => !prev); // 触发数据刷新
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
                          {selectedPaper === 1 ? '评分模式' : '评价模式'}
                          <span style={{ marginLeft: 8, color: '#1890ff' }}>
                            (已阅: {papers.filter(p => p.type === (selectedPaper || 1) && p.status === '已阅').length}
                            /总数: {papers.filter(p => p.type === (selectedPaper || 1)).length})
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
                    value={selectedPaper || 1}
                    options={[
                      { value: 1, label: '评分模式' },
                      { value: 2, label: '评价模式' }
                    ]}
                    onChange={value => {
                      setSelectedPaper(value);
                      setRefreshFlag(prev => !prev); // 触发数据刷新
                    }}
                  />
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
                              setViewMode('grade');
                              setIsEditingMode(record.status === '已阅');
                            } finally {
                              setEssayLoading(false);
                            }
                          }}>
                          评阅
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={papers
                    .filter(p => p.type === (selectedPaper || 1))
                    .sort((a, b) => {
                      if (a.status === '待阅' && b.status !== '待阅') return -1;
                      if (a.status !== '待阅' && b.status === '待阅') return 1;
                      return 0;
                    })}
                  rowKey={(record) => `${record.paperId}-${record.studentId}`}
                />
              </div>
            </Card>
          )}

          {viewMode === 'grade' && currentPaper && (
            <>
              {currentPaper.type === 1 && (
                <ScoringPanel
                  form={form}
                  editorContent={editorContent}
                  setEditorContent={setEditorContent}
                  onSubmit={handleGradeSubmit}
                  onCancel={() => setViewMode('list')}
                  isEditingMode={isEditingMode}
                  paperData={currentPaper}
                />
              )}
              {currentPaper.type === 2 && (
                <EvaluationPanel
                  form={form}
                  editorContent={editorContent}
                  setEditorContent={setEditorContent}
                  onSubmit={handleGradeSubmit}
                  onCancel={() => setViewMode('list')}
                  isEditingMode={isEditingMode}
                  paperData={currentPaper}
                  answers={currentPaper.questions}
                />
              )}
            </>
          )}


        </div>
      </div>
    </Spin>
  );
};

export default Evaluation;