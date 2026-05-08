import "./index.scss";
import { Button, Card } from "antd";
import { useNavigate } from "react-router";
import { getExam, select } from "@/api/examPaper";
import { useEffect, useState } from "react";
import stores from "@/stores";
import { getStudentId } from "@/api/login";

const { Meta } = Card;

const Dashboard = () => {
  const [examList, setExamList] = useState([]);
  const navigate = useNavigate();

  const getTime = (time: string) => {
    const t = new Date(time).getTime();
    const current = new Date().getTime();
    return current > t;
  };

  const getExamList = async () => {
    const res = await getExam(stores.UserStore.userId);
    // console.log(res);
    //@ts-ignore
    setExamList(res.response.items);
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
      // @ts-ignore
      const examListData = examRes.response.items || [];
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
    await stores.AnswerStore.fullReset();
    await stores.ExamStore.fullReset();
    window.open(`/video?id=${id}&type=listen`, "_blank");

    // 请求全屏
    // const requestFullscreen = () => {
    //   const element = document.documentElement; // 或者指定某个元素
    //   if (element.requestFullscreen) {
    //     element.requestFullscreen();
    //   }
    // };

    // requestFullscreen();
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
    </div>
  );
};

export default Dashboard;
