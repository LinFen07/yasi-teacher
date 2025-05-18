import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { useNavigate } from 'react-router';
import { Button, Space, Avatar, Slider, Modal, Dropdown } from 'antd'
import { FieldTimeOutlined, SoundOutlined, DownOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd';
import './index.scss'
import store from '@/stores'
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
      navigate('/readnExam',{ replace: true });
      requestConcurrency(stores.AnswerStore.completedAnswers);
      stores.AnswerStore.clearAnswers(type);
    }else if(type === 'read'){
      navigate('/writteExam',{ replace: true });
      requestConcurrency(stores.AnswerStore.completedAnswers);
      stores.AnswerStore.clearAnswers(type);
    }else if(type === 'writte'){
      navigate('/testOver',{ replace: true });
      submitStudentWritteAnswer(stores.ExamStore.wirrteExam[0].questionItems[0], 0, stores.ExamStore.correctWritte[0]);
      submitStudentWritteAnswer(stores.ExamStore.wirrteExam[1].questionItems[0], 1, stores.ExamStore.correctWritte[1]);
      requestConcurrency(stores.AnswerStore.writingAnswers);
      stores.AnswerStore.resetLocalStorage();
      stores.ExamStore.resetLocalStorage();
    }
    store.ExamStore.changeCurrent(1);
    store.ExamStore.changeCurrentTitle('Part1');
    store.ExamStore.resetcorrectListenAnswer();
  };
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVolumeChange = (value: number) => {
    stores.ExamStore.changeAusioVolume(value);
  };
  
  return(
    <div className='head'>
      <div className='headLeft'>
        <Space>
          <Avatar size={40} className='Avatar'/>
        <h3>{store.UserStore.name}</h3>
        </Space>
      </div>
      <div className='headMid'>
          <Space style={{cursor: 'pointer'}} onMouseEnter={() => setTimerVisible(true)} onMouseLeave={() => setTimerVisible(false)}>
          <FieldTimeOutlined style={{fontSize: '28px'}}/>
          {
            timerVisible
            ? <p>{minutes}：{seconds.toString().padStart(2, '0')}</p>
            : <p>{minutes}minutes left</p>
          }
        </Space>
      <div className='empty'></div>
        {
          props.type === 'listen' 
          ? <div>
              <Space>
               <SoundOutlined style={{fontSize: '28px'}}/>  
               <Slider defaultValue={30} className='slider' onChange={handleVolumeChange}/>
              </Space>
            </div>
          : <></>
        }
      </div>
      <div className='headRight'>
        <Space size={24}>
          <Button size='large' onClick={() => setModalOpen(true)}>Finish Text</Button>
          {/* {
            props.type === 'listen'
            ? <></>
            : <Button size='large' onClick={() => setModalOpen(true)}>Pause</Button>
          } */}
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
      <Modal title="Basic Modal" open={isModalOpen} onOk={() => finish(props.type)} onCancel={() => {setModalOpen(false)}}>
      <p>You have selected to end this section of the test, click OK to progress to the next section or Cancel to return to the test.
      This function is not available in the real computer-delivered lELTs test</p>
      </Modal>
    </div>
  );
});

export default HeadTip;