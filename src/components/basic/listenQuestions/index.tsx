
import { useEffect, useRef, useState } from 'react';
import stores from '@/stores';
import parse from 'html-react-parser';
import { observer } from 'mobx-react';
import './index.scss'
import { createInput } from '@/utils/helper/createInput';

import Questions from '@/components/basic/questions'
import { useEventListener } from '@/hooks/core/useEventListener';

const listenQuestions = () => {
  const exam = stores.ExamStore.getListenExam();

  const [listensArr, setListensArr] = useState(exam[0] || null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle[4] - 1;
    setListensArr(exam[index]);
    if(containerRef.current) {
      createInput(exam, 'listen', containerRef.current);
    }
  },[stores.ExamStore.currentExamTitle]);

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

  if (!listensArr) {
    return <div className='lllll'>加载中...</div>;
  }

  return (
    <div className='lllll'>
      <div className='contentTitle'>{safeParseHtml(listensArr.name)}</div>
      <div ref={containerRef}>
        <Questions exam={exam}/>
      </div>
     </div>
  )

}

export default observer(listenQuestions);