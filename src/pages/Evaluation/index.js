import React, { useState, useEffect, useCallback } from "react";
import { getComposition, getConfrim, getStudentsAnswers, getStudentsInfo, getTask, selectNameById } from "../../store/tasks";
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import { Table, Button, Tag, Card, Spin, Select, Statistic, Breadcrumb, Form, message } from "antd"; // 新增message
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
            : composition?.length === 1
              ? [composition[0]?.id]
              : [];

          const paperId = studentsInfo?.paperId;
          const studentName = taskItem?.studentName;
          const selectedPaperName = taskItem?.examName;

          // 安全计算status
          const hasScore1 = composition?.[0]?.score && composition[0].score !== 0;
          const hasScore2 = composition?.[1]?.score && composition[1].score !== 0;
          const hasAppraise = studentsInfo?.appraise && studentsInfo.appraise !== "undefined" && studentsInfo.appraise !== null;
          // 根据实际作文数量判断状态
          const status = composition?.length === 1
            ? (hasScore1 && hasAppraise ? '已阅' : '未阅')
            : composition?.length === 2
              ? (hasScore1 && hasScore2 && hasAppraise ? '已阅' : '未阅')
              : '未阅';

          newPapers.push({
            studentsInfo: studentsInfo,
            paperId: paperId,
            studentName: studentName,
            studentId: studentsInfo.studentId,
            composition: composition || [], // 兜底为空数组
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

  // 修复后的批阅提交逻辑（完整可运行）
  const handleGradeSubmit = async (values) => {
    // 1. 前置校验：必填项检查 + 数据存在性检查
    if (!currentPaper) {
      message.error('当前无选中的试卷，无法提交');
      return;
    }
    // 提取关键参数，确保编辑模式参数正确传递
    const { score1, score2, comment, isEditingMode = false } = values;
    if (!isEditingMode && !comment) {
      message.warning('评价内容不能为空');
      return;
    }

    setGradeLoading(true);
    try {
      // 2. 深拷贝试卷列表，避免直接修改原数据
      const updatedPapers = JSON.parse(JSON.stringify(papers));
      // 3. 精准匹配当前试卷并更新数据
      const paperIndex = updatedPapers.findIndex(p =>
        p.examPaperId === currentPaper.examPaperId &&
        p.paperId === currentPaper.paperId
      );
      // 匹配失败直接返回
      if (paperIndex === -1) {
        message.error('未找到当前试卷数据');
        setGradeLoading(false);
        return;
      }

      const targetPaper = updatedPapers[paperIndex];
      // 4. 更新作文分数：增加存在性检查
      if (score1 !== undefined && targetPaper.composition[0]) {
        targetPaper.composition[0].score = Number(score1); // 确保是数字
      }
      if (score2 !== undefined && targetPaper.composition[1]) {
        targetPaper.composition[1].score = Number(score2);
      }
      // 5. 更新评价内容
      targetPaper.studentsInfo.appraise = comment || '';
      // 6. 区分编辑/提交模式：更新状态和时间
      if (!isEditingMode) {
        targetPaper.status = '已阅';
        targetPaper.gradedTime = new Date().toLocaleString();
      } else {
        // 编辑模式：保留原状态和时间
        targetPaper.status = currentPaper.status;
        targetPaper.gradedTime = currentPaper.gradedTime;
      }

      // 7. 同步更新前端数据：关键！让界面实时刷新
      setPapers(updatedPapers);
      setCurrentPaper({ ...targetPaper }); // 同步更新currentPaper

      // 8. 提交到后端：非编辑模式才调用接口
      if (!isEditingMode) {
        // 提交评价：检查参数是否正确
        if (comment) {
          const appraiseAction = putAppraise(comment, currentPaper.examPaperId);
          await dispatch(appraiseAction);
        }
        // 提交分数：检查id和分数是否存在
        if (score1 !== undefined && currentPaper.id?.[0]) {
          await postScore(currentPaper.id[0], score1)();
        }
        if (score2 !== undefined && currentPaper.id?.[1]) {
          await postScore(currentPaper.id[1], score2)();
        }

        // 9. 查找下一份待阅试卷：修复查找条件
        const nextPaper = updatedPapers.find(p =>
          p.paperName === currentPaper.paperName &&
          p.paperId !== currentPaper.paperId && // 用paperId比较，不是数组id
          p.status === '未阅'
        );

        // 10. 自动切换到下一份试卷
        if (nextPaper && !flag) {
          const resetNextPaper = {
            ...nextPaper,
            score: undefined,
            comment: undefined,
            questions: (nextPaper.questions || []).map(q => ({
              ...q,
              score: undefined,
              grader: undefined
            }))
          };
          setCurrentPaper(resetNextPaper);
          setViewMode('grade');
        } else if (!flag) {
          setViewMode('list'); // 没有下一份，返回列表
        }
      }

      // 11. 成功提示
      message.success(isEditingMode ? '评价修改成功' : '评价提交成功');
      // 12. 重置表单：确保字段名和组件一致
      form.resetFields(['score1', 'score2', 'comment']);
      setEditorContent('');
    } catch (error) {
      // 13. 后端请求失败的错误处理
      console.error('提交/修改评价失败:', error);
      message.error(isEditingMode ? '修改失败：' + error.message : '提交失败：' + error.message);
    } finally {
      setGradeLoading(false);
    }
  };

  // 过滤待阅试卷
  const filterPendingPapers = () => {
    return papers.filter(paper => paper.status === '未阅');
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
                    ]}
                  />
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