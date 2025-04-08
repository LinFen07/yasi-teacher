import './index.scss'
import {  Radio, Checkbox } from 'antd';
import { useEffect, useState, useRef } from 'react';
import ReactHtmlParser from 'react-html-parser';
import stores from '@/stores';
import { observer } from 'mobx-react'
import { runInAction } from 'mobx';
import { computedPrevCount, computedBlanksPrevCount }from '@/utils/computedPrevCount';
import { createInput } from '@/utils/createInput';
import { submitStudentAnswer } from '@/utils/submitAnswer'

const questions = () => {
  //获取试卷
  const exam = stores.ExamStore.getReadExam();
  //试卷下标
  const questionIndex = stores.ExamStore.currentExamIndex;
  const [readArr, setReadArr] = useState(exam[0]);
  const [questionArr, setQuestionArr] = useState(exam[0].questionItems);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
    setReadArr(exam[index]);
    setQuestionArr(exam[index].questionItems);
    createInput(exam, 'read');
  },[stores.ExamStore.currentExamTitle]);

  //点击下标自动跳转对应题目
  useEffect(() => {
    let prevCount = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
    let BlanksprevCount = computedBlanksPrevCount(prevCount, stores.ExamStore.currentExamTitle, exam);
    if (titleRefs.current[questionIndex - prevCount - 1]) {
      titleRefs.current[questionIndex - prevCount - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const inputAll = document.querySelectorAll('.textInput');
    
    if(inputAll[questionIndex - BlanksprevCount - 1]){
      //@ts-ignore
      inputAll[questionIndex - BlanksprevCount - 1].focus();
      inputAll[questionIndex - BlanksprevCount - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [questionIndex]);

  const onChange = (index: number) => (e: any) => {
    const examIndex = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
    
    let prevCount = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
    const { value } = e.target;

    //向数据提交答案
    submitStudentAnswer(questionArr, index, value);

    const updatedQuestions = { ...questionArr[index] };
    updatedQuestions.answer = value;
    const newQuestionsArr = questionArr.map((question, idx) =>
      idx === index ? updatedQuestions : question
    );
    setQuestionArr(newQuestionsArr);
    stores.ExamStore.updateReadExam(examIndex, index, updatedQuestions);
    stores.ExamStore.changeCurrent(prevCount + index + 1);
    runInAction(() => {
      stores.ExamStore.correctListenAnswer.push(prevCount + index + 1);
    });
  };

  const checkedOnChange = (index: number) => (checkedValues: any[]) =>{
    let pre = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
    const examIndex = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;

    //向数据提交答案
    submitStudentAnswer(questionArr, index, checkedValues.toString());

    const updatedQuestions = { ...questionArr[index] };
    updatedQuestions.selectionsAnswer = checkedValues;
    const newQuestionsArr = questionArr.map((question, idx) =>
      idx === index ? updatedQuestions : question
    );
    setQuestionArr(newQuestionsArr);
    stores.ExamStore.updateReadExam(examIndex, index, updatedQuestions);
    runInAction(() => {
      stores.ExamStore.correctListenAnswer.push(pre + index + 1);
    });
  }

  return (
    <div className='readContent'>
        <div className='leftContent parsed-name' >{ReactHtmlParser(readArr.name)}</div>
        <div className='rightContent'>
        {
          questionArr.map((item,i) => {
            return(
              <div key={i}>
                <div ref={el => titleRefs.current[i] = el}>
                  {ReactHtmlParser(item.title)}
                </div>
                {
                  item.questionType == '1'
                  ? <Radio.Group 
                      onChange={onChange(i)} 
                      name={`${i}`}
                      value={item.answer ? item.answer : ''}
                      options={item.items.map((opt) => ({
                        value: opt.prefix,
                        label: ReactHtmlParser(opt.prefix == opt.content ? opt.content : opt.prefix + ' '+ opt.content)
                      }))}
                      > 
                    </Radio.Group>
                    : item.questionType == '2' 
                    ? <Checkbox.Group style={{ width: '100%' }} 
                      onChange={checkedOnChange(i)} 
                      value={item.selectionsAnswer ? item.selectionsAnswer : []}
                      options={item.items.map((opt) => ({
                      value: opt.prefix,
                      label: (
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {opt.prefix}
                          <p style={{width:'8px'}}></p>
                          {ReactHtmlParser(opt.content)}
                        </span>
                      )
                      }))}>
                      </Checkbox.Group>
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

export default observer(questions);