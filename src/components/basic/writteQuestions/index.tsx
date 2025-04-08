import './index.scss'
import { useEffect, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import { ExamType } from '@/typings/exam';
import stores from '@/stores';

import { Input } from 'antd';

const { TextArea } = Input;

type propState = {
  title: string,
  textArr: ExamType
}
export default function questions() {
  const exam = stores.ExamStore.getWritteExam();

  const [title, setTitle] = useState(exam[0].name);
  const [value, setValue] = useState('');

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
    console.log(exam)
    setTitle(exam[index].name);
  },[stores.ExamStore.currentExamTitle, exam]);

  return (
    <div className='readContent'>
        <div className='leftContent'>{ReactHtmlParser(title)}</div>
        <TextArea
          className='rightContent'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
    </div>
  )
}