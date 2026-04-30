import "./index.scss";
import { Button, Card, message } from "antd";
import { useNavigate } from "react-router";
import { getExam, select } from "@/api/examPaper";
import { useEffect, useRef, useState } from "react";
import stores from "@/stores";
import { getStudentId } from "@/api/login";
import { clearExamLocalData } from "@/utils/helper/examDataManager";

const { Meta } = Card;

const PREFETCH_CONCURRENCY = 2;

const Dashboard = () => {
  const [examList, setExamList] = useState([]);
  const navigate = useNavigate();
  const prefetchingRef = useRef(false);

  const getExamList = async () => {
    const res = await getExam(stores.UserStore.userId);
    //@ts-ignore
    const items = res.response.items;
    setExamList(items);
    return items;
  };

  const fetchGetStudentId = async () => {
    const res = await getStudentId(stores.UserStore.name);
    // @ts-ignore
    stores.UserStore.setUserId(res.response.value);
  };

  const prefetchListenAudio = async (paperId: number) => {
    try {
      const cacheExists = await stores.ExamStore.hasAudioCacheForPaper(paperId);
      if (cacheExists) return;

      const res = await select(paperId);
      //@ts-ignore
      if (res.code !== 1) return;

      //@ts-ignore
      const audioUrl = res.response?.audioFileUrl;
      if (!audioUrl) return;

      await stores.ExamStore.downloadAudio(paperId, audioUrl);
    } catch (error) {
      console.warn(`试卷 ${paperId} 听力音频预下载失败`, error);
    }
  };

  const startBackgroundPrefetch = async (items: any[]) => {
    if (prefetchingRef.current || !items.length) return;
    prefetchingRef.current = true;

    try {
      const paperIds = items.map((item) => item.examPaperId);
      for (let i = 0; i < paperIds.length; i += PREFETCH_CONCURRENCY) {
        const batch = paperIds.slice(i, i + PREFETCH_CONCURRENCY);
        await Promise.all(batch.map((paperId) => prefetchListenAudio(paperId)));
      }
    } finally {
      prefetchingRef.current = false;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await fetchGetStudentId();
      } catch (error) {
        console.log(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const items = await getExamList();
        await startBackgroundPrefetch(items);
      } catch (error) {
        console.log(error);
        message.warning("试卷音频后台预加载失败，将在进入考试页时继续加载");
      }
    };

    if (stores.UserStore.userId) {
      loadData();
    }
  }, [stores.UserStore.userId]);

  const getResumeExamType = (paperId: number): string | null => {
    try {
      const savedStateRaw = localStorage.getItem('examPageState');
      if (!savedStateRaw) return null;

      const savedState = JSON.parse(savedStateRaw);
      if (savedState.paperId !== paperId) return null;

      return savedState.currentPageType || 'listen';
    } catch {
      return null;
    }
  };

  const handleConfirmExam = async (id: number) => {
    const resumeType = getResumeExamType(id);

    if (resumeType) {
      window.open(`/video?id=${id}&type=${resumeType}`, "_blank");
      return;
    }

    clearExamLocalData({
      clearExamStore: true,
      clearAnswerStore: true,
      clearPageState: true,
      clearTimers: true,
      clearCachedAnswers: false,
    });

    await stores.AnswerStore.fullReset();
    await stores.ExamStore.fullReset();
    window.open(`/video?id=${id}&type=listen`, "_blank");
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
                  onClick={() => handleConfirmExam(item.examPaperId)}
                >
                  前往考试
                </Button>
                <Button
                  type="primary"
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
    </div>
  );
};

export default Dashboard;
