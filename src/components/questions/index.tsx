import {  Radio } from 'antd';
import { useEffect, useState } from 'react';
import stores from '@/stores';

import ReactHtmlParser from 'react-html-parser';
import type {ExamType} from '@/stores/exam'
import { observer } from 'mobx-react';

type propState = {
  title: string,
  textArr: ExamType
}
const questions = (propState: propState) => {

  const exam = stores.ExamStore.getListenExam();

  const [questionArr, setQuestionArr] = useState(exam[0]);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
    setQuestionArr(exam[index]);
    setQuestionIndex(index);
  },[stores.ExamStore.currentExamTitle, exam]);

  
  const onChange = (e: any) => {
    const { value } = e.target;

    const updatedQuestions = { ...questionArr };
    updatedQuestions.answer = value;
    setQuestionArr(updatedQuestions);
    stores.ExamStore.updateListenExam(questionIndex, updatedQuestions);
  };

  return (
    <div>
        <div className='contentTitle'>{ReactHtmlParser(propState.title)}</div>
        <div>
          {
            questionArr.questionType == '1'
            ? <Radio.Group 
              onChange={onChange} 
              value={questionArr.answer ? questionArr.answer : ''}
              options={questionArr.items.map((opt) => ({
                value: opt.prefix,
                label: ReactHtmlParser(opt.prefix + ' '+ opt.content)
              }))}
              >
            </Radio.Group>
            :<></>
          }
        </div>
      </div>
  )
}

export default observer(questions);