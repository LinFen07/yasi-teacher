import { useEffect, useState, forwardRef } from 'react'
import { useNavigate } from 'react-router';
import { Button, Space, Avatar, Slider, Modal, Dropdown } from 'antd'
import { FieldTimeOutlined, SoundOutlined, DownOutlined, FormOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd';
import './index.scss'
import IntegerStep from '@/components/basic/fontSizeSetting';
import stores from '@/stores';
import { requestConcurrency } from '@/utils/requestConcurrency';
import { submitStudentWritteAnswer } from '@/utils/submitAnswer';


const items: MenuProps['items'] = [
  {
    label: (
      <Space style={{ width: '400px' }} direction="vertical">
        <IntegerStep />
      </Space>
    ),
    key: '0',
  }
];

type propType = {
    type: string;
};

const HeadTip = forwardRef((props: propType) => {
  const testTime: number = props.type == 'listen' ? 30 : 60;
  const examstore = stores.ExamStore;

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [minutes, setMintnue] = useState<number>(testTime);
  const [timerVisible, setTimerVisible] = useState<boolean>(false);

  useEffect(() => {
    if (minutes === 0 && seconds == 0) {
      return;
    } else if (seconds < 0) {
      setSeconds(59);
      setMintnue(minutes - 1);
    }

    const intervalId = setInterval(() => {
      if(!isModalOpen) {
        setSeconds((prevCount) => prevCount - 1);
      }
    }, 1000);

    return () => clearInterval(intervalId); 
  }, [seconds, isModalOpen]);
  
  const navigate = useNavigate();

  const finish = (type: string) => {
    if(type === 'listen'){
      navigate(`/video?id=${examstore.paperId}&type=read`, { replace: true });
      requestConcurrency(stores.AnswerStore.completedAnswers);
      stores.AnswerStore.clearAnswers(type);
    }else if(type === 'read'){
      navigate(`/video?id=${examstore.paperId}&type=writte`, { replace: true });
      requestConcurrency(stores.AnswerStore.completedAnswers);
      stores.AnswerStore.clearAnswers(type);
    }else if(type === 'writte'){
      // navigate('/testOver',{ replace: true });
      navigate(`/video?id=${examstore.paperId}&type=end`, { replace: true });
      submitStudentWritteAnswer(examstore.wirrteExam[0].questionItems[0], 0, examstore.correctWritte[0]);
      submitStudentWritteAnswer(examstore.wirrteExam[1].questionItems[0], 1, examstore.correctWritte[1]);
      requestConcurrency(stores.AnswerStore.writingAnswers);
      stores.AnswerStore.resetLocalStorage();
      examstore.resetLocalStorage();
    }
    examstore.changeCurrent(1);
    examstore.changeCurrentTitle('Part1');
    examstore.resetcorrectListenAnswer();
  };

  const handleVolumeChange = (value: number) => {
    examstore.changeAusioVolume(value);
  };
  
  return(
    <div className='head'>
      <div className='headLeft'>
        <Space>
          <Avatar size={40} className='Avatar'/>
        <h3>{stores.UserStore.name}</h3>
        </Space>
      </div>
      <div className='headMid'>
          <Space style={{cursor: 'pointer'}} onMouseEnter={() => setTimerVisible(true)} onMouseLeave={() => setTimerVisible(false)}>
          <FieldTimeOutlined style={{fontSize: '28px'}}/>
          {
            timerVisible
            ? <p>{minutes}：{seconds.toString().padStart(2, '0')}</p>
            : <p>{minutes} minutes remaining</p>
          }
        </Space>
      <div className='empty'></div>
        {
          props.type === 'listen' 
          ? <div>
              <Space style={{height: '100%'}}>
               <SoundOutlined style={{fontSize: '28px'}}/>  
               <Slider defaultValue={30} className='slider' onChange={handleVolumeChange}/>
               <p style={{marginLeft: '8px'}}>Audio is playing</p>
              </Space>
            </div>
          : <></>
        }
      </div>
      <div className='headRight'>
        <Space size={24}>
          <Button size='large' onClick={() => setModalOpen(true)}>Finish Text</Button>
          <div className='head-note-icon' onClick={stores.helperStore.changerNoteView}><FormOutlined /></div>
          <div style={{fontSize: '16px'}}>
            <Dropdown menu={{ items }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  Setting
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
        </Space>
      </div>
      <Modal 
        centered 
        title="Test ended" 
        open={isModalOpen} 
        onOk={() => finish(props.type)} 
        onCancel={() => {setModalOpen(false)}}
        footer={[
          <Button key="back" type='primary' onClick={() => finish(props.type)}>
            Continue
          </Button>
        ]}
      >
        <p style={{fontSize: '18px'}}>Your test has finished.</p>
        <p style={{fontSize: '18px'}}>All of your answers have been stored.</p>
        <p style={{fontSize: '18px'}}>Please wait for further instructions.</p>
      </Modal>
    </div>
  );
});

export default HeadTip;