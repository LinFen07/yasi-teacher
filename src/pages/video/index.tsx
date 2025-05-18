import React, { useState } from 'react';
import ExamExplainVideo from '@/components/basic/examExpainVideo';

import "./index.scss";
import { select } from "@/api/examPaper";
import { useEffect } from "react";
import stores from "@/stores";
import { AddCorrect } from "@/utils/getCorrect";
const IeltsFamiliarisationTest: React.FC = () => {
  const id  = new URLSearchParams(window.location.search).get("id") || 0;
  const type = new URLSearchParams(window.location.search).get("type") || ''
  const [listenCompelete, setListenCompelete] = useState(false);
  const [readCompelete, setReadCompekete] = useState(false);

  useEffect(() => {
    stores.ExamStore.changePaperId(+id);
    const fetchExamData = async () => {
      try {
        const res = await select(+id);
        console.log(res);
        //@ts-ignore
        if (res.code === 1) {
          //@ts-ignore
          const response = res.response;
          console.log(response);
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
    if(type == 'listen' || type == 'read')
      setListenCompelete(true);
    if(type == 'read')
      setReadCompekete(true);
  },[type])

  return (
    <div className='exam-expain-contatiner'>
      <div style={{ padding: '16px 0 0 40px', fontSize: 20, fontWeight: 400, textAlign: 'left' }}>
        xxxxxxxx
      </div>
      <div style={{ borderBottom: '1px solid #000', margin: '0 0 24px 0' }}></div>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <h1 style={{ color: '#d81b3a', fontWeight: 400, fontSize: 32, margin: '0 0 32px 0', textAlign: 'left' }}>
          IELTS Familiarisation Test
        </h1>
        {/* <div style={{ fontWeight: 600, color: '#555', marginBottom: 8 }}>Today</div> */}
        {/* Listening Card */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          background: '#fff',
          marginBottom: 32,
          padding: 36,
          position: 'relative'
        }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#555' }}>Listening</div>
          <div className='exam-compelete' style={listenCompelete ? {color: '#aebe36'}: undefined} >{listenCompelete ? 'completed' : 'Not completed'}</div>
          <div style={{ color: '#666', marginBottom: 16 }}>Timing: 30 minutes</div>
          {
            type === ''
            ? <ExamExplainVideo type='listen'></ExamExplainVideo>
            : <></>
          }
          
        </div>
        {/* Reading Card */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          background: '#fff',
          marginBottom: 32,
          padding: 36,
          position: 'relative'
        }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#555' }}>Listening</div>
          <div className='exam-compelete' style={readCompelete ? {color: '#aebe36'}: undefined}>{readCompelete ? 'completed' : 'Not completed'}</div>
          <div style={{ color: '#666', marginBottom: 16 }}>Timing: 60 minutes</div>
          {
            type === 'listen'
            ? <ExamExplainVideo type='read'></ExamExplainVideo>
            : <></>
          }
        </div>
        {/* Writing Card */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          background: '#fff',
          marginBottom: 32,
          padding: 36,
          position: 'relative'
        }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#555' }}>Listening</div>
          <div style={{ color: '#d81b3a', fontWeight: 600, fontSize: 20, margin: '8px 0' }}>Not completed</div>
          <div style={{ color: '#666', marginBottom: 16 }}>Timing: 60 minutes</div>
          {
            type === 'read'
            ? <ExamExplainVideo type='writte'></ExamExplainVideo>
            : <></>
          }
        </div>
        {/* Yellow Note */}
        <div className='exam-video-explain-note-container'>
          <div className='note-close-button'>×</div>
          <div style={{ color: '#222', fontSize: 16, lineHeight: 1.6 }}>
            To see the instructions for the test, click on the arrow (▼) and press play; after that, click 'I confirm' and then 'Start' to start the test. In the real test you’ll only be able to see this once.
          </div>
        </div>
      </div>
    </div>
  );
};

export default IeltsFamiliarisationTest;