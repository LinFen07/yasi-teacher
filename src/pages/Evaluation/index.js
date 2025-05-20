import React, { useState, useEffect, useCallback } from "react";
import { getComposition, getConfrim, getStudentsAnswers, getStudentsInfo, getTask, selectNameById } from "../../store/tasks";
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import { Table, Button, Tag, Card, Spin, Select, Statistic, Breadcrumb, Form } from "antd";
import { LeftOutlined } from '@ant-design/icons';
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
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [flag, setFlag] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // 初始化页码状态
  const [pageState, setPageState] = useState(1);

  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.user);
  const userId = userInfo?.userId || 7;

  const navigate = useNavigate()
  // 处理页码变化
  const handleChange = useCallback((page) => {
    console.log(`切换到第${page}页`);
    setPageState(page);
  }, []);

  useEffect(() => {
    dispatch(getPaperName());
    dispatch(getTask(userId));
  }, [dispatch]);

  // 监听页码变化，加载对应数据
  useEffect(() => {
    if (!tasks?.response?.items) return;

    const currentPage = pageState;
    const itemsLength = tasks?.response?.items?.length || 0;
    const filteredItems = tasks.response.items;
    console.log(filteredItems)
    const newPapers = [];
    const startIndex = (currentPage - 1) * 10;
    const endIndex = Math.min(startIndex + 10, filteredItems.length);
    const processItemsSequentially = async () => {
      // 添加空数组检查
      if (!filteredItems || filteredItems.length === 0) {
        console.warn('没有找到符合条件的试卷');
        setPapers([]);
        return;
      }

      for (let i = startIndex; i < endIndex; i++) {
        try {
          const taskItem = filteredItems[i];
          // 添加空值检查
          if (!taskItem) {
            console.warn(`跳过无效的试卷项: index=${i}`);
            continue;
          }
          const examPaperId = taskItem?.examPaperId;
          const studentsInfo = await dispatch(getStudentsInfo(examPaperId));
          const composition = await dispatch(getComposition(studentsInfo));

          // 处理可能为空的composition
          const selectId = composition?.length >= 2
            ? [composition[0]?.id, composition[1]?.id].filter(Boolean)
            : [];

          const paperId = studentsInfo?.paperId;
          const studentName = taskItem?.studentName;
          const selectedPaperName = taskItem?.examName;

          // 安全计算status
          const status = composition?.length >= 2
            ? (composition[0]?.score !== 0 &&
              composition[1]?.score !== 0 &&
              studentsInfo?.appraise !== "undefined" &&
              studentsInfo?.appraise != null
              ? '已阅' : '未阅')
            : '未阅';

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
  }, [dispatch, tasks, pageState, refreshFlag]);

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
    return papers.filter(paper => paper.status === '待阅');
  };

  // 开始批阅
  // const handleStartGrading = () => {
  //   setEssayLoading(true);
  //   try {
  //     const pendingPapers = filterPendingPapers();
  //     if (!pendingPapers || pendingPapers.length === 0) {
  //       console.log('没有待阅的试卷');
  //       return;
  //     }

  //     const firstPendingPaper = pendingPapers[0];
  //     if (!firstPendingPaper) {
  //       console.error('获取待阅试卷失败');
  //       return;
  //     }

  //     setCurrentPaper({
  //       ...firstPendingPaper,
  //       questions: firstPendingPaper.questions || []
  //     });
  //     setViewMode('grade');
  //   } catch (error) {
  //     console.error('开始批阅失败:', error);
  //   } finally {
  //     setEssayLoading(false);
  //   }
  // };

  // 编辑试卷
  // const handleEditPaper = (restoredData) => {
  //   setIsEditingMode(true);
  //   setFlag(true);
  //   setCurrentPaper({
  //     ...currentPaper,
  //     isEditing: true
  //   });
  //   setViewMode('grade');
  // };
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
                      // {
                      //   title: (
                      //     <>
                      //       所有试卷
                      //       <span style={{ marginLeft: 8, color: '#1890ff' }}>
                      //         (已阅: {papers.filter(p => p.status === '已阅').length}
                      //         /总数: {papers.length})
                      //       </span>
                      //     </>
                      //   )
                      // }
                    ]}
                  />
                  {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    {currentTask?.deadline && (
                      <Countdown
                        title="剩余时间"
                        value={currentTask.deadline}
                        format="HH:mm:ss"
                      />
                    )}
                  </div> */}
                  <TaskTable
                    papers={papers}
                    paperName={paperName}
                    handleChange={handleChange}
                    pageNow={pageState}
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
                  <div style={{ position: 'relative' }}>
                    <Button
                      type="primary"
                      onClick={() => setViewMode('list')}
                      style={{ position: 'absolute', left: -40, top: -20 }}
                      icon={<LeftOutlined />}
                    />
                  </div>
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