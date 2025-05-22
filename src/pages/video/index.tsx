import React, { useState } from 'react';
import ExpainVideoCard from "@/components/hoc/videoCard";

import "./index.scss";
import { select } from "@/api/examPaper";
import { useEffect } from "react";
import stores from "@/stores";
import { AddCorrect } from "@/utils/getCorrect";

const IeltsFamiliarisationTest: React.FC = () => {
  const id  = new URLSearchParams(window.location.search).get("id") || 0;
  const type = new URLSearchParams(window.location.search).get("type") || '';
  const [listenCompelete, setListenCompelete] = useState(false);
  const [readCompelete, setReadCompekete] = useState(false);
  const [writteCompelete, setWritteCompelete] = useState(false);
  const [noteVisible, setNoteVisible] = useState(true);

  useEffect(() => {
    stores.ExamStore.changePaperId(+id);
    const fetchExamData = async () => {
      try {
        const res = await select(+id);
        //@ts-ignore
        if (res.code === 1) {
          //@ts-ignore
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

  useEffect(() => {
    if( type == 'read' || type == 'writte' || type == 'end')
      setListenCompelete(true);
    if(type == 'writte'|| type == 'end')
      setReadCompekete(true);
    if(type == 'end')
      setWritteCompelete(true);
  },[type])

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
        <ExpainVideoCard type ='listen' isCompeleted= {listenCompelete} isShowVideo={type == 'listen'}/>
        <ExpainVideoCard type ='read' isCompeleted= {readCompelete} isShowVideo={type == 'read'}/>
        <ExpainVideoCard type ='writte' isCompeleted= {writteCompelete} isShowVideo={type == 'writte'}/>
        {
          noteVisible
          ? <div className='exam-video-explain-note-container'>
              <div className='note-close-button' onClick={() => setNoteVisible(false)}>×</div>
              <div style={{ color: '#222', fontSize: 16, lineHeight: 1.6 }}>
                To see the instructions for the test, click on the arrow（V）and press play, after that, click “ I confirm” and then “Start” to start the test. In the test you’ll only be able to see this once. 
              </div>
            </div>
          : <></>
        }
      </div>
    </div>
  );
};

export default IeltsFamiliarisationTest;