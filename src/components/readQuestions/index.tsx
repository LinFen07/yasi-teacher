import './index.scss'
import {  Radio } from 'antd';
import { useEffect, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import stores from '@/stores';


const questions = () => {
  const exam = stores.ExamStore.getReadExam();

  const [title, setTitle] = useState(exam[0].content);
  const [questionArr, setQuestionArr] = useState(exam[0].questions);

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
    console.log(exam)
    setTitle(exam[index].content);
    setQuestionArr(exam[index].questions);
  },[stores.ExamStore.currentExamTitle, exam]);

  const onChange = (e:any) => {
    const { name, value } = e.target;
    const index = parseInt(name, 10);
    const updatedQuestions = [...questionArr];
    updatedQuestions[index].answer = value;
    setQuestionArr(updatedQuestions);
    stores.ExamStore.updateReadExam(0, updatedQuestions);
  };

  return (
    <div className='readContent'>
        <div className='leftContent' >{ReactHtmlParser(title)}</div>
        <div className='rightContent'>
        {
          questionArr.map((item,i) => {
            return(
              <div key={i}>
                {ReactHtmlParser(item.title)}
                {
                  item.questionType == '1'
                  ? <Radio.Group 
                      onChange={onChange} 
                      name={`${i}`}
                      value={item.answer ? item.answer : ''}
                      options={item.items.map((opt) => ({
                        value: opt.prefix,
                        label: ReactHtmlParser(opt.prefix == opt.content ? opt.content : opt.prefix + ' '+ opt.content)
                      }))}
                      > 
                    </Radio.Group>
                  :<></>
                }
              </div>
            )
          })
        }
        </div>
      </div>
  )
}

export default questions;