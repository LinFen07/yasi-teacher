import { Collapse } from "antd";
import "./index.scss"
import { CheckOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useState } from "react";
import { useNavigate } from "react-router";

export default function ExamExplainVideo({type}: {type: string}) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();

  const handlerStart = () => {
    if(type === 'listen') {
      const au = document.querySelector("audio");
      if(au) {
        au.play()
      } 
      navigate(`/listeningExam`);
    }
    else if(type === 'read') {
      navigate(`/readnExam`);
    }
    else if(type === 'writte') {
      navigate(`/writteExam`);
    }
  }

  return(
    <div>
      <Collapse
        size="large"
        items={[{ key: '1', 
          label: 
            <>
            <span className="video-information-text">Test information.</span>
            <span className="video-iscomplete-text">Not confirmed.</span>
            </>, 
          children: 
          <div>
            <video className="exam-expain-video" controls src="http://120.24.144.113:9010/yasi/audio/audio.mp4" />
            {
              isConfirmed 
              ? <button className="video-confirm-button" onClick={handlerStart}><ArrowRightOutlined style={{marginRight: '12px'}}/>Start Reading</button>
              : <div className="video-confirm-container">
                  <h4 className="video-ready">Ready?</h4>
                  <p style={{fontSize: '18px'}}>Please confirm that you have understood the instructions above.</p>
                  <button className="video-confirm-button" onClick={() => setIsConfirmed(true)}><CheckOutlined style={{marginRight: '12px'}}/>I confirm</button>
                </div>
            }
          </div>
         }]}
      />
    </div>
  )
}