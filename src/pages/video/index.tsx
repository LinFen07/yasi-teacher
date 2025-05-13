import { Button } from "antd";
import { useNavigate } from "react-router";
import "./index.scss";
import { select } from "@/api/examPaper";
import { useEffect, useState } from "react";
import stores from "@/stores";
import { AddCorrect } from "@/utils/getCorrect";

export default function Video() {
  const id  = new URLSearchParams(window.location.search).get("id") || 0;
  const navigate = useNavigate()

  useEffect(() => {
    console.log(id);
    stores.ExamStore.changePaperId(+id);
    const fetchExamData = async () => {
      try {
        const res = await select(+id);
        console.log(res);
        //@ts-ignore
        if (res.code === 1) {
          //@ts-ignore
          const response = res.response;
          stores.ExamStore.addExam(response.titleItems);
          AddCorrect(response.titleItems);
          stores.ExamStore.addListenAudio(response.audioFileUrl);
        }
      } catch (error) {
        console.error("获取考试数据失败:", error);
      }
    };

    fetchExamData();
  }, [id]);

  function handleClick() {
    navigate(`/listeningExam`);
  }


  return (
    <div>
      <video className="video-img" controls src="http://120.24.144.113:9010/yasi/audio/audio.mp4" />
      <Button type="primary" onClick={handleClick}>前往考试</Button>
    </div>
  )
}