import "./index.scss";
import { Button, Card, Modal } from "antd";
import { useNavigate } from "react-router";
import { getExam, select } from "@/api/examPaper";
import { useEffect, useState } from "react";
import stores from "@/stores";
import { getStudentId } from "@/api/login";
import { getExamProgress, hasOngoingExam, initExamProgress, clearAllExamData, clearExamProgress } from "@/utils/helper/examDataManager";

const { Meta } = Card;

const Dashboard = () => {
  const [examList, setExamList] = useState([]);
  const [ongoingModalVisible, setOngoingModalVisible] = useState(false);
  const [pendingExamId, setPendingExamId] = useState<number | null>(null);
  const navigate = useNavigate();

  const getTime = (time: string) => {
    const t = new Date(time).getTime();
    const current = new Date().getTime();
    return current > t;
  };

  const getExamList = async () => {
    const res = await getExam(stores.UserStore.userId);
    const items = res?.response?.items ?? res?.data?.response?.items ?? res?.data?.items ?? [];
    setExamList(items);
  };

  const fetchGetStudentId = async () => {
    const res = await getStudentId(stores.UserStore.userName);
    console.log(res.data)
    // @ts-ignore
    stores.UserStore.setUserId(res.response.value);
  };

  const downloadAudioIfNeeded = async () => {
    try {
      const userId = stores.UserStore.userId;
      if (!userId) return;

      const channel = new BroadcastChannel('audio_download_channel');

      const examRes = await getExam(userId);
      const examListData = examRes?.response?.items ?? examRes?.data?.response?.items ?? examRes?.data?.items ?? [];
      for (const exam of examListData) {
        try {
          // ✅ 1. 检查缓存是否存在
          const isCached = await stores.ExamStore.hasAudioCacheForPaper(exam.examPaperId);
          if (!isCached) {
            // 无缓存，获取音频地址并下载
            console.log(`🔍 试卷 ${exam.examPaperId} 未缓存，获取音频地址...`);
            const paperRes = await select(exam.examPaperId);
            // @ts-ignore
            const audioUrl = paperRes.response?.audioFileUrl;

            if (audioUrl) {
              await stores.ExamStore.downloadAudio(exam.examPaperId, audioUrl);
              // 发送消息通知其他窗口
              channel.postMessage({
                type: 'AUDIO_DOWNLOADED',
                paperId: exam.examPaperId,
              });
            }
            continue;
          }

          // ✅ 2. 有缓存，检查是否需要重新下载
          console.log(`✅ 试卷 ${exam.examPaperId} 已有缓存，检查是否需要更新...`);
          const paperRes = await select(exam.examPaperId);
          // @ts-ignore
          const audioUrl = paperRes.response?.audioFileUrl;

          if (audioUrl) {
            const needRedownload = await stores.ExamStore.shouldRedownload(
              exam.examPaperId,
              audioUrl
            );

            if (needRedownload) {
              console.log(`🔄 试卷 ${exam.examPaperId} 音频已更新，重新下载...`);
              await stores.ExamStore.downloadAudio(exam.examPaperId, audioUrl);
              // 发送消息通知其他窗口
              channel.postMessage({
                type: 'AUDIO_DOWNLOADED',
                paperId: exam.examPaperId,
              });
            } else {
              console.log(`⏭️ 试卷 ${exam.examPaperId} 已是最新版本，使用缓存`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ 处理试卷 ${exam.examPaperId} 失败:`, error);
        }
      }
    } catch (error) {
      console.error('获取试卷列表失败:', error);
    }
  };

  useEffect(() => {
    try {
      fetchGetStudentId();
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    try {
      getExamList();
      downloadAudioIfNeeded();
    } catch (error) {
      console.log(error);
    }
  }, [stores.UserStore.userId]);

  const handleConfirmExam = async (id: number) => {
    console.log('=== handleConfirmExam ===');
    console.log('id:', id, 'type:', typeof id);
    const progress = getExamProgress(id);
    console.log('progress:', progress);

    if (progress) {
      const allCompleted =
        progress.listen.status === 'completed' &&
        progress.read.status === 'completed' &&
        progress.writte.status === 'completed';

      if (allCompleted) {
        console.log('全部完成，直接开始新考试');
        startNewExam(id);
      } else {
        const hasProgress =
          progress.listen.status !== 'not_started' ||
          progress.read.status !== 'not_started' ||
          progress.writte.status !== 'not_started';

        if (hasProgress) {
          console.log('有实际进度，弹出 Modal');
          setPendingExamId(id);
          setOngoingModalVisible(true);
        } else {
          console.log('没有实际进度，直接开始新考试');
          startNewExam(id);
        }
      }
    } else {
      console.log('没有 examProgress，直接开始新考试');
      startNewExam(id);
    }
  };

  const startNewExam = (id: number) => {
    clearAllExamData();
    clearExamProgress(id);
    initExamProgress(id);
    stores.AnswerStore.fullReset();
    stores.ExamStore.fullReset();
    window.open(`/video?id=${id}&type=listen`, "_blank");
  };

  const continueExam = (id: number) => {
    const progress = getExamProgress(id);
    let targetType = 'listen';

    if (progress?.listen.status !== 'completed') {
      targetType = 'listen';
    } else if (progress?.read.status !== 'completed') {
      targetType = 'read';
    } else if (progress?.writte.status !== 'completed') {
      targetType = 'writte';
    }
    console.log(targetType)
    setOngoingModalVisible(false);
    setPendingExamId(null);
    window.open(`/video?id=${id}&type=${targetType}`, "_blank");
  };

  const handleSreachTestResult = (
    id: number,
    isAppraise: number,
    appraise: string
  ) => {
    stores.ExamStore.changePaperId(id);
    if (isAppraise) stores.AnswerStore.appraise = appraise;
    navigate(`/testOver`);
  };

  return (
    <div>
      <div className="app-item-contain appContent">
        <h3 className="index-title-h3">试卷中心</h3>
        <div style={{ paddingLeft: "15px", display: "flex" }}>
          {examList.map((item: any) => {
            return (
              <Card hoverable style={{ width: 240 }} key={item.examPaperId}>
                <Meta title={item.examPaperName} />
                <p>考试时间：{item.startTime} ~ </p>
                <p>{item.endTime}</p>
                <Button
                  type="primary"
                  // disabled={getTime(item.endTime)}
                  onClick={() => handleConfirmExam(item.examPaperId)}
                >
                  前往考试
                </Button>
                <Button
                  type="primary"
                  // disabled={!getTime(item.endTime)}
                  style={{ marginLeft: "12px" }}
                  onClick={() =>
                    handleSreachTestResult(
                      item.examPaperId,
                      item.isAppraise,
                      item.appraise
                    )
                  }
                >
                  查看结果
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      <Modal
        title="考试未完成"
        open={ongoingModalVisible}
        onCancel={() => setOngoingModalVisible(false)}
        footer={[
          <Button key="continue" type="primary" onClick={() => pendingExamId && continueExam(pendingExamId)}>
            继续考试
          </Button>,
          <Button key="restart" onClick={() => pendingExamId && startNewExam(pendingExamId)}>
            开始新考试
          </Button>,
        ]}
      >
        <p>您有未完成的考试，是否继续？</p>
        {/* <p style={{ marginTop: 12, color: '#666' }}>选择"继续考试"将回到之前的考试进度</p>
        <p style={{ color: '#666' }}>选择"开始新考试"将清空所有数据</p> */}
      </Modal>
    </div>
  );
};

export default Dashboard;
