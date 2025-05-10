import React, { useState, useEffect, useCallback } from "react";
import { getComposition, getConfrim, getStudentsAnswers, getStudentsInfo, getTask, selectNameById } from "../../store/tasks";
import 'react-quill/dist/quill.snow.css';
import { Table, Button, Tag, Card, Spin, Select, Statistic, Breadcrumb, Form } from "antd";
import ScoringPanel from "../../components/ScoringPanel";
import EvaluationPanel from "../../components/EvaluationPanel";
import { fetchCompositionInfo, fetchArticle, updatePaperStatus, getAppraise, getPaperName } from '../../store/tasks';
import { putAppraise } from "../../utils/appraise";
import { postScore } from "../../utils/score";
import TaskTable from "../../components/Table/index.js";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
const { Countdown } = Statistic;

const Evaluation = () => {
  const [form] = Form.useForm();
  const { currentTask, appraise, id, tasks, paperName } = useSelector(state => state.tasks);
  const [papers, setPapers] = useState([]);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [gradeLoading, setGradeLoading] = useState(false);
  const [essayLoading, setEssayLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [flag, setFlag] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // 初始化页码状态 - 使用对象结构保存每种试卷的页码
  const [pageState, setPageState] = useState({});

  const dispatch = useDispatch();
  const userId = 7;

  // 处理页码变化
  const handleChange = useCallback((page, paperType) => {
    console.log(`切换到第${page}页，试卷类型:`, paperType);
    setPageState(prev => ({
      ...prev,
      [paperType]: page
    }));
  }, []);

  // 获取当前试卷类型的页码
  const getCurrentPage = useCallback(() => {
    if (!selectedPaper) return 1;
    return pageState[selectedPaper.value] || 1;
  }, [pageState, selectedPaper]);

  useEffect(() => {
    console.log('页码状态更新:', pageState);
  }, [pageState]);

  const handleSelectChange = (value) => {
    const selected = paperOptions.find(p => p.value === value);
    setSelectedPaper(selected);
    // 切换试卷类型时重置页码为1
    if (selected && !pageState[selected.value]) {
      setPageState(prev => ({
        ...prev,
        [selected.value]: 1
      }));
    }
    setRefreshFlag(prev => !prev);
  };

  const [paperOptions, setPaperOptions] = useState([]);

  useEffect(() => {
    const fetchPaperList = async () => {
      if (paperName.length > 0) {
        const options = paperName.map(paper => ({
          value: paper.name,
          label: paper.name
        }));
        options.push({
          value: '模拟试卷3',
          label: '模拟试卷3'
        });
        setPaperOptions(options);
      }
    };
    fetchPaperList();
  }, [paperName]);

  useEffect(() => {
    dispatch(getPaperName());
    dispatch(getTask(userId));
  }, [dispatch]);

  useEffect(() => {
    if (paperOptions.length > 0) {
      setSelectedPaper(paperOptions[0]);
    }
  }, [paperOptions]);

  // 监听试卷类型和页码变化，加载对应数据
  useEffect(() => {
    if (!tasks?.response?.items || !selectedPaper) return;

    const currentPage = getCurrentPage();
    const paperType = selectedPaper.value;
    const itemsLength = tasks?.response?.items?.length || 0;

    // 过滤当前试卷类型的任务
    const filteredItems = tasks.response.items.filter(
      item => item.examName === paperType
    );
    const newPapers = [];
    const startIndex = (currentPage - 1) * 10;
    const endIndex = Math.min(startIndex + 10, filteredItems.length);

    const processItemsSequentially = async () => {
      for (let i = startIndex; i < endIndex; i++) {
        try {
          const taskItem = filteredItems[i];
          const examPaperId = taskItem.examPaperId;
          const studentsInfo = await dispatch(getStudentsInfo(examPaperId));
          const composition = await dispatch(getComposition(studentsInfo));
          const selectId = [composition[0].id, composition[1].id];
          const paperId = studentsInfo.paperId;
          const studentName = taskItem.studentName;
          const selectedPaperName = taskItem.examName;
          const status = composition[0].score !== 0 && composition[1].score !== 0 &&
            studentsInfo.appraise !== "undefined" && studentsInfo.appraise !== null
            ? '已阅' : '未阅';

          newPapers.push({
            studentsInfo: studentsInfo,
            paperId: paperId,
            studentName: studentName,
            studentId: studentsInfo.studentId,
            composition: composition,
            id: selectId,
            paperName: selectedPaperName,
            status: status,
            gradedTime: '',
            examPaperId: examPaperId
          });
        } catch (error) {
          console.error(`处理第${i}项时出错:`, error);
        }
      }

      // 更新试卷列表和总页数
      setPapers(newPapers);
    };

    processItemsSequentially();
  }, [dispatch, tasks, selectedPaper, pageState, refreshFlag]);

  // 处理批阅提交
  const handleGradeSubmit = async (values) => {
    setGradeLoading(true);
    try {
      let score1 = undefined;
      let score2 = undefined;
      let appraise = undefined;
      let updatedPapers;
      score1 = values.score1 || form.getFieldValue('score1');
      score2 = values.score2 || form.getFieldValue('score2');
      appraise = values.comment;
      form.setFieldsValue({
        score1: '',
        score2: ''
      });
      updatedPapers = papers.map(p => {
        if (p.id === currentPaper.id && p.examPaperId === currentPaper.examPaperId) {
          const newComposition = [...p.composition];
          if (score1 !== undefined) {
            newComposition[0].score = score1;
          }
          if (score2 !== undefined) {
            newComposition[1].score = score2;
          }
          const newstudentInfo = { ...p.studentsInfo };
          newstudentInfo.appraise = values.comment;
          return {
            ...p,
            composition: newComposition,
            studentsInfo: newstudentInfo,
            status: values.isEditingMode ? p.status : '已阅',
            gradedTime: values.isEditingMode ? p.gradedTime : new Date().toLocaleString()
          };
        }
        return p;
      });
      setPapers(updatedPapers);
      if (!values.isEditingMode) {
        const appraiseData = putAppraise(values.comment, currentPaper.examPaperId);
        await dispatch(appraiseData);

        if (score1 !== undefined) {
          await postScore(currentPaper.id[0], score1)();
        }
        if (score2 !== undefined) {
          await postScore(currentPaper.id[1], score2)();
        }
        const nextPaper = updatedPapers.find(p =>
          p.paperName === currentPaper.paperName &&
          p.id !== currentPaper.id &&
          p.status === '待阅'
        );

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
          setEditorContent(''); // 提交成功后清空编辑器内容
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      setGradeLoading(false);
    }
  };

  // 过滤待阅试卷
  const filterPendingPapers = () => {
    if (!selectedPaper) {
      return [];
    }
    return papers.filter(paper =>
      paper.status === '待阅' &&
      paper.paperName === selectedPaper.value
    );
  };

  // 开始批阅
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

  // 编辑试卷
  const handleEditPaper = (restoredData) => {
    setIsEditingMode(true);
    setFlag(true);
    setCurrentPaper({
      ...currentPaper,
      isEditing: true
    });
    setViewMode('grade');
  };

  return (
    <Spin spinning={gradeLoading || essayLoading}>
      {paperName.length > 0 && (
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
                            {paperName?.name || '请选择试卷'}
                            <span style={{ marginLeft: 8, color: '#1890ff' }}>
                              (已阅: {papers.filter(p => p.status === '已阅').length}
                              /总数: {papers.length})
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
                  <TaskTable
                    papers={papers}
                    selectedPaper={selectedPaper}
                    paperOptions={paperOptions}
                    handleSelectChange={handleSelectChange}
                    paperName={paperName}
                    handleChange={(page) => handleChange(page, selectedPaper?.value || '')}
                    pageNow={getCurrentPage()}
                    filterPendingPapers={filterPendingPapers}
                    setEssayLoading={setEssayLoading}
                    setCurrentPaper={setCurrentPaper}
                    setViewMode={setViewMode}
                    setIsEditingMode={setIsEditingMode}
                  />
                </div>
              </Card>
            )}

            {viewMode === 'grade' && currentPaper && (
              <Card style={{ width: '100%', padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Card style={{ width: '100%' }}>
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
                  </Card>
                  <Card style={{ width: '100%' }}>
                    <ScoringPanel
                      form={form}
                      editorContent={editorContent}
                      setEditorContent={setEditorContent}
                      onSubmit={handleGradeSubmit}
                      onCancel={() => setViewMode('list')}
                      isEditingMode={isEditingMode}
                      paperData={currentPaper}
                    />
                  </Card>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </Spin>
  );
};

export default Evaluation;