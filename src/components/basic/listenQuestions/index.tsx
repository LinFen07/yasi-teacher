
import { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import stores from '@/stores';
import parse from 'html-react-parser';
import { observer } from 'mobx-react';
import './index.scss'
import { createInput } from '@/utils/helper/createInput';

import Questions from '@/components/basic/questions'
import { useEventListener } from '@/hooks/core/useEventListener';

const listenQuestions = () => {
  const exam = stores.ExamStore.getListenExam();

  const [listensArr, setListensArr] = useState(exam[0]);
  const [audioLoading, setAudioLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle[4] - 1;
    setListensArr(exam[index]);
    if(containerRef.current) {
      createInput(exam, 'listen', containerRef.current);
    }
  },[stores.ExamStore.currentExamTitle]);

  useEffect(() => {
    let mounted = true;

    const ensureAudioLoaded = async () => {
      const paperId = stores.ExamStore.paperId;
      const audioUrl = stores.ExamStore.getListenAudio();

      if (!paperId || !audioUrl) {
        setAudioLoading(false);
        return;
      }

      try {
        const hasCache = await stores.ExamStore.hasAudioCacheForPaper(paperId);
        if (!hasCache) {
          if (mounted) setAudioLoading(true);
          await stores.ExamStore.ensureAudioReady(paperId, audioUrl);
        }
      } catch (error) {
        console.error('听力音频加载失败:', error);
      } finally {
        if (mounted) setAudioLoading(false);
      }
    };

    ensureAudioLoaded();

    return () => {
      mounted = false;
    };
  }, [stores.ExamStore.paperId, stores.ExamStore.listenAudio]);

  // 安全解析 HTML 内容的函数
  const safeParseHtml = (htmlContent: string) => {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return <div className="error-content">题目内容加载异常</div>;
    }
    
    try {
      return parse(htmlContent);
    } catch (error) {
      console.error('HTML 解析错误:', error);
      return <div className="error-content">题目内容解析失败</div>;
    }
  };

  // 刷新恢复听力进度
  useEffect(() => {
    try {
      const saved = localStorage.getItem('listen_state');
      if (saved) {
        const { title, index } = JSON.parse(saved);
        if (title) stores.ExamStore.changeCurrentTitle(title);
        if (index) stores.ExamStore.changeCurrent(index);
      }
    } catch (e) {
      console.error('restore listen_state failed', e);
    }
  }, []);

  // 刷新/离开前保存进度
  const saveProgress = () => {
    try {
      localStorage.setItem('listen_state', JSON.stringify({
        title: stores.ExamStore.currentExamTitle,
        index: stores.ExamStore.currentExamIndex,
      }));
    } catch (e) {
      console.error('save listen_state failed', e);
    }
  };
  useEventListener('beforeunload', () => saveProgress(), window as any);

  return (
    <div className='lllll'>
      {audioLoading ? (
        <div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" tip="听力音频加载中..." />
        </div>
      ) : (
        <>
          <div className='contentTitle'>{safeParseHtml(listensArr.name)}</div>
          <div ref={containerRef}>
            <Questions exam={exam}/>
          </div>
        </>
      )}
     </div>
  )

}

export default observer(listenQuestions);