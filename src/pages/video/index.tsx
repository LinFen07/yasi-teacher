import React, { useState, useEffect } from 'react';
import ExpainVideoCard from "@/components/hoc/videoCard";
import { Modal, Button } from 'antd';
import { useNavigate } from 'react-router';

import "./index.scss";
import { select } from "@/api/examPaper";
import stores from "@/stores";
import { AddCorrect } from "@/utils/browser/getCorrect";
import { checkOngoingExamState, clearAllExamData, OngoingExamState, getExamProgress, setModuleStatus, clearModuleData } from '@/utils/helper/examDataManager';
import { judgingProblem, submitAnswerBatch } from '@/api/studentAnswer';
import { submitStudentWritteAnswer } from '@/utils/browser/submitAnswer';

const IeltsFamiliarisationTest: React.FC = () => {
  const navigate = useNavigate();
  const id = new URLSearchParams(window.location.search).get("id") || 0;
  const type = new URLSearchParams(window.location.search).get("type") || '';
  const [listenCompelete, setListenCompelete] = useState(false);
  const [readCompelete, setReadCompekete] = useState(false);
  const [writteCompelete, setWritteCompelete] = useState(false);
  const [noteVisible, setNoteVisible] = useState(true);
  const [ongoingState, setOngoingState] = useState<OngoingExamState | null>(null);
  const [examExpiredModalVisible, setExamExpiredModalVisible] = useState(false);
  const [expiredModalVisible, setExpiredModalVisible] = useState(false);
  const [expiredModule, setExpiredModule] = useState<'listen' | 'read' | 'writte' | null>(null);

  useEffect(() => {
    stores.ExamStore.changePaperId(+id);
    const fetchExamData = async () => {
      try {
        const res = await select(+id);
        // @ts-ignore
        if (res.code === 1) {
          // @ts-ignore
          const response = res.response;
          stores.ExamStore.addExam(response.titleItems);
          stores.ExamStore.addListenAudio(response.audioFileUrl);
          AddCorrect(response.titleItems);
        }
      } catch (error) {
        console.error("获取考试数据失败:", error);
      }
    };

    fetchExamData();
  }, [id]);

  // 检查模块超时状态
  useEffect(() => {
    console.log('=== 检查模块超时状态 ===');
    console.log('id:', id, 'type:', type);
    
    const progress = getExamProgress(+id);
    console.log('progress:', progress);

    if (!progress) {
      console.log('没有 progress');
      return;
    }

    const timerState = checkOngoingExamState(+id);
    console.log('timerState:', timerState);
    setOngoingState(timerState);

    // 检查听力超时
    if (progress.listen.status === 'in_progress' && timerState.listen.status === 'expired') {
      console.log('听力进行中但已过期');
      setExpiredModule('listen');
      setExpiredModalVisible(true);
      return;
    }

    // 检查阅读超时
    if (progress.read.status === 'in_progress' && timerState.read.status === 'expired') {
      console.log('阅读进行中但已过期');
      setExpiredModule('read');
      setExpiredModalVisible(true);
      return;
    }

    // 检查写作超时 - 整个考试结束
    if (progress.writte.status === 'in_progress' && timerState.writte.status === 'expired') {
      console.log('写作进行中但已过期，触发 expiredModalVisible');
      setExpiredModule('writte');
      setExpiredModalVisible(true);
      return;
    }
  }, [id]);

  useEffect(() => {
    if (type == 'read' || type == 'writte' || type == 'end')
      setListenCompelete(true);
    if (type == 'writte' || type == 'end')
      setReadCompekete(true);
    if (type == 'end')
      setWritteCompelete(true);
  }, [type])

  const handleRestart = () => {
    setExamExpiredModalVisible(false);
    // 清空所有考试数据
    clearAllExamData();
    stores.AnswerStore.fullReset();
    stores.ExamStore.resetLocalStorage();
    // 跳转到首页
    navigate('/layout/dashboard');
  };

  const handleExpiredConfirm = () => {
    console.log('=== handleExpiredConfirm ===');
    console.log('expiredModule:', expiredModule);
    if (!expiredModule) return;

    const paperId = +id;
    const mod = expiredModule;

    if (mod === 'writte') {
      // 写作超时提交
      submitStudentWritteAnswer(stores.ExamStore.wirrteExam[0].questionItems[0], 0, stores.ExamStore.correctWritte[0]);
      submitStudentWritteAnswer(stores.ExamStore.wirrteExam[1].questionItems[0], 1, stores.ExamStore.correctWritte[1]);
      submitAnswerBatch(stores.AnswerStore.writingAnswers);
    } else {
      // 听力和阅读提交
      const submitData = stores.AnswerStore.completedAnswers
        .filter((item: any) => item.questionId !== undefined)
        .map((item: any) => ({
          prefix: item.prefix,
          questionId: item.questionId,
          content: item.content,
        }));

      const submitPayload = {
        answerItems: submitData,
        doTime: 0,
        id: paperId,
        type: mod === 'listen' ? 'LISTENING' : 'READING',
        userId: stores.UserStore.userId,
      };

      judgingProblem(submitPayload);
    }

    clearModuleData(mod);
    setModuleStatus(paperId, mod, 'completed');
    localStorage.removeItem(`testTimer:${paperId}:${mod}`);

    setExpiredModalVisible(false);
    setExpiredModule(null);

    // 刷新完成状态
    const progress = getExamProgress(paperId);
    if (progress) {
      setListenCompelete(progress.listen.status === 'completed');
      setReadCompekete(progress.read.status === 'completed');
      setWritteCompelete(progress.writte.status === 'completed');
    }
  };

  return (
    <div className='exam-expain-contatiner'>
      <div style={{ padding: '16px 0 0 40px', fontSize: 20, fontWeight: 400, textAlign: 'left' }}>
        xxxxxxxx
      </div>
      <div style={{ borderBottom: '1px solid #000', margin: '0 0 24px 0' }}></div>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <h1 style={{ color: '#d81b3a', fontWeight: 400, fontSize: 32, margin: '0 0 32px 0', textAlign: 'left' }}>
          ZY English Language Test Platform
        </h1>
        <ExpainVideoCard type='listen' isCompeleted={listenCompelete} />
        <ExpainVideoCard type='read' isCompeleted={readCompelete} />
        <ExpainVideoCard type='writte' isCompeleted={writteCompelete} />
        {
          noteVisible
            ? <div className='exam-video-explain-note-container'>
              <div className='note-close-button' onClick={() => setNoteVisible(false)}>×</div>
              <div style={{ color: '#222', fontSize: 16, lineHeight: 1.6 }}>
                To see the instructions for the test, click on the arrow（V）and press play, after that, click " I confirm" and then "Start" to start the test. In the test you'll only be able to see this once.
              </div>
            </div>
            : <></>
        }
      </div>

      <Modal
        title="考试已结束"
        open={expiredModalVisible}
        footer={[
          <Button key="confirm" type="primary" onClick={handleExpiredConfirm}>
            确认提交
          </Button>,
        ]}
        onCancel={() => setExpiredModalVisible(false)}
        closable={false}
        maskClosable={false}
      >
        <div style={{ fontSize: 15, lineHeight: 1.8 }}>
          <p>您的{expiredModule === 'listen' ? '听力' : expiredModule === 'read' ? '阅读' : '写作'}考试已结束</p>
          <p style={{ marginTop: 12 }}>点击确认提交您的答案</p>
        </div>
      </Modal>
    </div>
  );
};

export default IeltsFamiliarisationTest;