import { useEffect, useState, forwardRef, useRef } from 'react'
import { useNavigate } from 'react-router';
import { Button, Space, Avatar, Slider, Modal, Dropdown } from 'antd'
import { FieldTimeOutlined, SoundOutlined, DownOutlined, FormOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd';
import './index.scss'
import IntegerStep from '@/components/basic/fontSizeSetting';
import stores from '@/stores';
import { requestConcurrency } from '@/utils/requestConcurrency';
import { submitStudentWritteAnswer } from '@/utils/browser/submitAnswer';
import { clearModuleData, safeSubmitAndClear } from '@/utils/helper/examDataManager';
import { judgingProblem, submitAnswerBatch } from '@/api/studentAnswer';
import questions from '@/components/basic/writteQuestions';

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
  const [remainingMs, setRemainingMs] = useState<number>(testTime * 60 * 1000);
  const storageKey = `testTimer:${examstore.paperId}:${props.type}`;
  const durationMs = testTime * 60 * 1000;
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      let startAt: number | null = null;
      if (raw) {
        const parsed = JSON.parse(raw);
        startAt = Number(parsed.startAt) || null;
      }
      if (!startAt) {
        startAt = Date.now();
        localStorage.setItem(storageKey, JSON.stringify({ startAt }));
      }

      const tick = () => {
        if (isModalOpen) return;
        const end = (startAt as number) + durationMs;
        const remain = Math.max(0, end - Date.now());
        setRemainingMs(remain);
        setMintnue(Math.floor(remain / 60000));
        setSeconds(Math.floor((remain % 60000) / 1000));
        if (remain <= 0) {
          setSeconds(0);
          setMintnue(0);
          setModalOpen(true); // 触发完成弹窗
        }
      };
      const initAudioAndCountDown = async () => {
        const au = document.querySelector("audio");
        if (au) {
          if (props.type === 'listen') {
            const cachedAudioUrl = await stores.ExamStore.getCachedAudioUrl();
            if (cachedAudioUrl) {
              au.src = cachedAudioUrl;
              au.load();
            }
          }

          au.addEventListener('playing', () => {
            tick();
            intervalRef.current = window.setInterval(tick, 1000);
          }, { once: true });

          try {
            await au.play();
          } catch (error) {
            console.error('音频播放失败:', error);
          }
        }
        tick();
        intervalRef.current = window.setInterval(tick, 1000);
      }
      if (stores.ExamStore.currentPageType === 'listen') {
        initAudioAndCountDown()
      }
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } catch {
      // 解析失败时不影响正常倒计时
    }
  }, [storageKey, durationMs, isModalOpen]);

  const navigate = useNavigate();



  const finish = (type: string) => {
    // 当前模块结束，清除该模块的计时持久化，下一模块将重新开始计时
    try { localStorage.removeItem(storageKey); } catch { }
    // 释放计时器与状态，避免听力结束后资源残留
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerVisible(false);
    setSeconds(0);
    setMintnue(testTime);
    setRemainingMs(0);

    if (type === 'listen') {
      // 使用安全提交和清理流程
      const listenData = stores.AnswerStore.completedAnswers
        .map((item) => {
          if (item.questionId !== undefined) {
            return {
              prefix: item.prefix,
              questionId: item.questionId,
              content: item.content
            };
          }
          // 显式返回 undefined（可选，map 不返回时默认也是 undefined）
          return undefined;
        })
        // 关键：链式过滤，item != null 同时排除 null 和 undefined
        .filter((item) => item != null);
      const date = new Date();

      const listenData_ = {
        answerItems: [...listenData],
        doTime: 0,
        id: stores.ExamStore.paperId,
        type: 'LISTENING',
        userId: stores.UserStore.userId
      }
      console.log(JSON.stringify(listenData_, null, 2))
      // judgingProblem(listenData_);
      clearModuleData(type);
      navigate(`/video?id=${examstore.paperId}&type=read`, { replace: true });
      // safeSubmitAndClear(
      //   () => requestConcurrency(stores.AnswerStore.completedAnswers),
      //   () => {
      //     console.log('听力答案提交成功');
      //     clearModuleData(type);
      //     navigate(`/video?id=${examstore.paperId}&type=read`, { replace: true });
      //   },
      //   (error) => {
      //     console.error('听力答案提交失败:', error);
      //     // 提交失败时不清除数据，但仍然跳转
      //     navigate(`/video?id=${examstore.paperId}&type=read`, { replace: true });
      //   }
      // );
    } else if (type === 'read') {
      // 使用安全提交和清理流程
      const ReadData = stores.AnswerStore.completedAnswers
        .map((item) => {
          if (item.questionId !== undefined) {
            return {
              prefix: item.prefix,
              questionId: item.questionId,
              content: item.content
            };
          }
          // 显式返回 undefined（可选，map 不返回时默认也是 undefined）
          return undefined;
        })
        // 关键：链式过滤，item != null 同时排除 null 和 undefined
        .filter((item) => item != null);
      const date = new Date();

      const ReadData_ = {
        answerItems: [...ReadData],
        doTime: 0,
        id: stores.ExamStore.paperId,
        type: 'READING',
        userId: stores.UserStore.userId
      }
      console.log(JSON.stringify(ReadData_, null, 2))
      // judgingProblem(ReadData_)
      clearModuleData(type);
      navigate(`/video?id=${examstore.paperId}&type=writte`, { replace: true });
      // safeSubmitAndClear(
      //   () => requestConcurrency(stores.AnswerStore.completedAnswers),
      //   () => {
      //     console.log('阅读答案提交成功');
      //     clearModuleData(type);
      //     navigate(`/video?id=${examstore.paperId}&type=writte`, { replace: true });
      //   },
      //   (error) => {
      //     console.error('阅读答案提交失败:', error);
      //     // 提交失败时不清除数据，但仍然跳转
      //     navigate(`/video?id=${examstore.paperId}&type=writte`, { replace: true });
      //   }
      // );
    } else if (type === 'writte') {
      try {
        // 确保写作答案已添加到store中
        submitStudentWritteAnswer(examstore.wirrteExam[0].questionItems[0], 0, examstore.correctWritte[0]);
        submitStudentWritteAnswer(examstore.wirrteExam[1].questionItems[0], 1, examstore.correctWritte[1]);

        console.log('准备提交写作答案:', JSON.stringify(stores.AnswerStore.writingAnswers, null, 2));

        // submitAnswerBatch(stores.AnswerStore.writingAnswers)
        navigate(`/video?id=${examstore.paperId}&type=end`, { replace: true });
        // 使用安全提交和清理流程 - 考试完成时清除所有数据
        // safeSubmitAndClear(
        //   () => requestConcurrency(stores.AnswerStore.writingAnswers),
        //   () => {
        //     console.log('写作答案提交成功，考试完成，所有本地数据已清除');
        //     navigate(`/video?id=${examstore.paperId}&type=end`, { replace: true });
        //   },
        //   (error) => {
        //     console.error('写作答案提交失败:', error);
        //     console.warn('答案已保存在本地，网络恢复后将自动重试提交');
        //     navigate(`/video?id=${examstore.paperId}&type=end`, { replace: true });
        //   }
        // );
      } catch (error) {
        console.error('准备写作答案时出错:', error);
        navigate(`/video?id=${examstore.paperId}&type=end`, { replace: true });
      }
    }
    examstore.changeCurrent(1);
    examstore.changeCurrentTitle('Part1');
    examstore.resetcorrectListenAnswer();
  };

  const handleVolumeChange = (value: number) => {
    examstore.changeAusioVolume(value);
  };

  return (
    <div className='head'>
      <div className='headLeft'>
        <Space>
          <Avatar size={40} className='Avatar' />
          <h3>{stores.UserStore.name}</h3>
        </Space>
      </div>
      <div className='headMid'>
        <Space style={{ cursor: 'pointer' }} onMouseEnter={() => setTimerVisible(true)} onMouseLeave={() => setTimerVisible(false)}>
          <FieldTimeOutlined style={{ fontSize: '28px' }} />
          {
            remainingMs <= 60000 // 最后一分钟显示秒数
              ? <p>{minutes}：{seconds.toString().padStart(2, '0')}</p>
              : timerVisible
                ? <p>{minutes}：{seconds.toString().padStart(2, '0')}</p>
                : <p>{minutes} minutes remaining</p>
          }
        </Space>
        <div className='empty'></div>
        {
          props.type === 'listen'
            ? <div>
              <Space style={{ height: '100%' }}>
                <SoundOutlined style={{ fontSize: '28px' }} />
                <Slider defaultValue={30} className='slider' onChange={handleVolumeChange} />
                <p style={{ marginLeft: '8px' }}>Audio is playing</p>
              </Space>
            </div>
            : <></>
        }
      </div>
      <div className='headRight'>
        <Space size={24}>
          <Button size='large' onClick={() => setModalOpen(true)}>Finish Text</Button>
          <div className='head-note-icon' onClick={stores.helperStore.changerNoteView}><FormOutlined /></div>
          <div style={{ fontSize: '16px' }}>
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
        onCancel={() => { setModalOpen(false) }}
        footer={[
          <Button key="back" type='primary' onClick={() => finish(props.type)}>
            Continue
          </Button>
        ]}
      >
        <p style={{ fontSize: '18px' }}>Your test has finished.</p>
        <p style={{ fontSize: '18px' }}>All of your answers have been stored.</p>
        <p style={{ fontSize: '18px' }}>Please wait for further instructions.</p>
      </Modal>
    </div>
  );
});

export default HeadTip;