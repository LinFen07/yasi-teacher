import './index.scss'
import { useEffect, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import { ExamType } from '@/typings/exam';
import stores from '@/stores';

import { Input } from 'antd';
import { submitStudentWritteAnswer } from '@/utils/submitAnswer';
const { TextArea } = Input;
export default function questions() {
  const exam = stores.ExamStore.getWritteExam();

  const [title, setTitle] = useState(exam[0].name);
  const [content, setContent] = useState(exam[0].questionItems[0].title);
  const [value, setValue] = useState('');

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
    setTitle(exam[index].name);
    setContent(exam[index].questionItems[0].title);
    if(index === 1)
      submitStudentWritteAnswer( exam[index].questionItems[0], 0, value);
    else
      submitStudentWritteAnswer( exam[index].questionItems[0], 1, value);
    setValue(stores.AnswerStore.writingAnswers[index].studentAnswer);
  },[stores.ExamStore.currentExamTitle, exam]);

  return (
    <div className='readContent'>
        <div className='leftContent'>
          {ReactHtmlParser(title)}
          {ReactHtmlParser(content)}
        </div>
        <TextArea
          className='rightContent'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
    </div>
  )
}