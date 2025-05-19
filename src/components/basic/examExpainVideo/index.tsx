import { Collapse } from "antd";
import "./index.scss"
import { CheckOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function ExamExplainVideo({type}: {type: string}) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [videoUrl, setVideoUrl] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    switch(type) {
      case 'listen':
        setVideoUrl('http://111.230.5.159:9000/yasi/video/listen.mp4')
        break;
      case 'read':
        setVideoUrl('http://111.230.5.159:9000/yasi/video/read.mp4');
        break;
      case 'writte':
        setVideoUrl('http://111.230.5.159:9000/yasi/video/writing.mp4');
        break;
    }

  }, [type])

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
            <video className="exam-expain-video" controls src={videoUrl} />
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