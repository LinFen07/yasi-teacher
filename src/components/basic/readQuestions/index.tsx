import './index.scss'
import { useEffect, useRef, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import stores from '@/stores';
import { observer } from 'mobx-react'
import { createInput } from '@/utils/createInput';
import Questions from '@/components/basic/questions'

const questions = () => {
  const examTitle = stores.ExamStore.currentExamTitle;
  const exam = stores.ExamStore.getReadExam();
  const [readArr, setReadArr] = useState(exam[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const index = +examTitle[4] - 1;
    setReadArr(exam[index]);
    // createInput(exam, 'read');
    if(containerRef.current) {
      // let span = containerRef.current.querySelectorAll('.gapfilling-span') || [];
      // console.log('span', span);
      createInput(exam, 'read', containerRef.current);
    }
  },[examTitle, exam]);
  
  return (
    <div className='readContent'>
      <div className='leftContent parsed-name' >{ReactHtmlParser(readArr.name)}</div>
      <div className='rightContent' ref={containerRef}>
        <Questions exam={exam}/>
      </div>
    </div>
  )
}

export default observer(questions);