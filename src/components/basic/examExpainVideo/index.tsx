import { Collapse, message } from "antd";
import "./index.scss";
import { CheckOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import stores from "@/stores";
import { observer } from "mobx-react";

type AudioStatus = "checking" | "preparing" | "ready" | "error";

const ExamExplainVideo = observer(({ type }: { type: string }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("checking");
  const navigate = useNavigate();
  const title =
    type == "listen" ? "Listening" : type == "read" ? "Reading" : "Writting";

  useEffect(() => {
    switch (type) {
      case "listen":
        setVideoUrl("http://111.230.5.159:9000/yasi/audio/listen.mp3");
        break;
      case "read":
        setVideoUrl("http://111.230.5.159:9000/yasi/audio/read.mp3");
        break;
      case "writte":
        setVideoUrl("http://111.230.5.159:9000/yasi/audio/writing.mp3");
        break;
    }
  }, [type]);

  useEffect(() => {
    if (type !== "listen") return;

    const checkAudioStatus = async () => {
      const paperId = stores.ExamStore.paperId;
      console.log('🔍 检查音频状态 - 试卷ID:', paperId);

      if (!paperId) {
        setAudioStatus("checking");
        return;
      }

      setAudioStatus("preparing");

      try {
        const hasCache = await stores.ExamStore.hasAudioCache();
        console.log('📦 音频缓存状态:', hasCache ? '已缓存' : '未缓存');

        if (hasCache) {
          setAudioStatus("ready");
          console.log('✅ 音频已准备就绪');
        } else {
          setAudioStatus("preparing");
          console.log('⬇️ 音频准备中...');
        }
      } catch (error) {
        console.error("❌ 检查音频状态失败:", error);
        setAudioStatus("error");
      }
    };

    checkAudioStatus();
  }, [type, stores.ExamStore.paperId]);

  useEffect(() => {
    if (type !== "listen") return;

    const channel = new BroadcastChannel('audio_download_channel');

    const checkAudioStatus = async () => {
      const paperId = stores.ExamStore.paperId;
      if (!paperId) return;

      try {
        const hasCache = await stores.ExamStore.hasAudioCache();
        if (hasCache) {
          setAudioStatus("ready");
        }
      } catch (error) {
        console.error("检查音频状态失败:", error);
      }
    };

    // 首次加载：检查当前试卷是否已下载
    const paperId = stores.ExamStore.paperId;
    if (paperId && stores.ExamStore.downloadedPaperIds.includes(paperId)) {
      checkAudioStatus();
    }

    // 监听消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'AUDIO_DOWNLOADED' && 
          event.data.paperId === stores.ExamStore.paperId) {
        console.log('📨 收到下载完成消息，试卷ID:', event.data.paperId);
        checkAudioStatus();
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [type, stores.ExamStore.paperId]);

  const handlerStart = () => {
    if (type === "listen" && audioStatus !== "ready") {
      if (audioStatus === "checking") {
        message.warning("音频检查中，请稍候...");
      } else if (audioStatus === "preparing") {
        message.warning("音频正在下载中，请等待下载完成后再开始考试");
      } else if (audioStatus === "error") {
        message.error("音频加载失败，请刷新页面重试");
      }
      return;
    }

    if (type === "listen") {
      navigate(`/listeningExam`);
    } else if (type === "read") {
      navigate(`/readnExam`);
    } else if (type === "writte") {
      navigate(`/writteExam`);
    }
  };

  const renderAudioStatus = () => {
    if (type !== "listen") return null;

    if (audioStatus === "checking") {
      return <p style={{ fontSize: "14px", color: "#666", marginTop: "8px", marginBottom: 0 }}>检查音频状态...</p>;
    }

    if (audioStatus === "preparing") {
      return <p style={{ fontSize: "14px", color: "#faad14", marginTop: "8px", marginBottom: 0 }}>⬇️ 音频准备中...准备完成即可开始考试</p>;
    }

    if (audioStatus === "error") {
      return <p style={{ fontSize: "14px", color: "#ff4d4f", marginTop: "8px", marginBottom: 0 }}>❌ 音频加载失败</p>;
    }

    if (audioStatus === "ready") {
      return <p style={{ fontSize: "14px", color: "#52c41a", marginTop: "8px", marginBottom: 0 }}>✅ 音频已准备就绪</p>;
    }

    return null;
  };

  return (
    <div>
      <Collapse
        size="large"
        items={[
          {
            key: "1",
            label: (
              <>
                <span className="video-information-text">
                  Test information.
                </span>
                <span className="video-iscomplete-text">Not confirmed.</span>
              </>
            ),
            children: (
              <div>
                <video className="exam-expain-video" controls src={videoUrl} />
                {renderAudioStatus()}
                {isConfirmed ? (
                  <button
                    className={`video-confirm-button ${type === "listen" && audioStatus !== "ready" ? "video-confirm-button-disabled" : ""}`}
                    onClick={handlerStart}
                    disabled={type === "listen" && audioStatus !== "ready"}
                    style={{ marginTop: "8px" }}
                  >
                    <ArrowRightOutlined style={{ marginRight: "12px" }} />
                    Start {title}
                  </button>
                ) : (
                  <div className="video-confirm-container">
                    <h4 className="video-ready">Ready?</h4>
                    <p style={{ fontSize: "18px", marginBottom: "12px" }}>
                      Please confirm that you have understood the instructions
                      above.
                    </p>
                    <button
                      className="video-confirm-button"
                      onClick={() => setIsConfirmed(true)}
                    >
                      <CheckOutlined style={{ marginRight: "12px" }} />I confirm
                    </button>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
});

export default ExamExplainVideo;
