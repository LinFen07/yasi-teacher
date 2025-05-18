import {  Radio, Checkbox } from 'antd';
import { useState, useRef, useEffect } from 'react';
import stores from '@/stores';
import ReactHtmlParser from 'react-html-parser';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import  { computedBlanksPrevCount, computedPrevCount }  from '@/utils/computedPrevCount';
import { submitStudentSelectAnswer } from '@/utils/submitAnswer'
import  TickQuestion  from '../tickQuestion/index'
import DragQuestion from '../dragQuestion';
import SelectQuestion from '../selectQuestion';
import { Exam } from '@/typings/exam';

function questions({exam}: {exam: Exam[]}) {
  const [listensArr, setListensArr] = useState(exam[0]);
  const [questionsArr, setQuestionArr] = useState(listensArr.questionItems);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const questionIndex = stores.ExamStore.currentExamIndex;

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle[4] - 1;
    setListensArr(exam[index]);
    setQuestionArr(exam[index].questionItems);
  },[stores.ExamStore.currentExamTitle]);

  const onChange = (index: number) => (e: any) => {
    let pre = computedPrevCount(stores.ExamStore.currentExamTitle, stores.ExamStore.currentExam);
    stores.ExamStore.changeStudentListenAnswer(pre + index + 1, e.target.value);
    const examIndex = +stores.ExamStore.currentExamTitle[4] - 1;
    const value  = e.target.value;

    //向数据提交答案
    submitStudentSelectAnswer(questionsArr, index, value, index + pre);

    const updatedQuestions = { ...questionsArr[index] };
    updatedQuestions.answer = value.toString();
    const newQuestionsArr = questionsArr.map((question, idx) =>
      idx === index ? updatedQuestions : question
    );
    setQuestionArr(newQuestionsArr);
    stores.ExamStore.changeCurrent(pre + index + 1)
    stores.ExamStore.updateListenExam(examIndex, index, updatedQuestions);
    runInAction(() => {
      stores.ExamStore.correctListenAnswer.push(pre + index + 1);
    });
  };

  const checkedOnChange = (index: number) => (checkedValues: string[]) =>{
    let pre = computedPrevCount(stores.ExamStore.currentExamTitle, stores.ExamStore.currentExam);
    stores.ExamStore.changeStudentListenAnswer(pre + index + 1,checkedValues.toString());
    const examIndex = +stores.ExamStore.currentExamTitle[4] - 1;

    submitStudentSelectAnswer(questionsArr, index, checkedValues.toString(), index + pre);

    const updatedQuestions = { ...questionsArr[index] };
    updatedQuestions.selectionsAnswer = checkedValues;
    const newQuestionsArr = questionsArr.map((question, idx) =>
      idx === index ? updatedQuestions : question
    );
    setQuestionArr(newQuestionsArr);
    stores.ExamStore.updateListenExam(examIndex, index, updatedQuestions);
    runInAction(() => {
      stores.ExamStore.correctListenAnswer.push(pre + index + 1);
    });
  }

  useEffect(() => {
    let prevCount = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
    let BlanksprevCount = computedBlanksPrevCount(prevCount, stores.ExamStore.currentExamTitle, exam);

    titleRefs.current[questionIndex - prevCount - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const inputAll = document.querySelectorAll('.textInput');
    //@ts-ignore
    inputAll[questionIndex - BlanksprevCount - 1]?.focus();
    inputAll[questionIndex - BlanksprevCount - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [questionIndex]);

    //字体大小
  const [fontSize, setFontSize] = useState(stores.ExamStore.FontSize);

  useEffect(() => {
    setFontSize(stores.ExamStore.FontSize);
  },[stores.ExamStore.FontSize]);

  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');;
  };

  return (
    <div className='listencontent'>
        {
          questionsArr.map((questionArr, index) => (
            <div key={index}>
              {
                questionArr.topicType == '5' 
                ? (<TickQuestion {...questionArr}></TickQuestion>)
                : questionArr.topicType == '6'
                ? <DragQuestion {...questionArr}></DragQuestion>
                : questionArr.topicType == '4'
                ?<div> 
                    {ReactHtmlParser(questionArr.title)}
                  </div>
                : <div ref={el => titleRefs.current[index] = el} style={{fontSize: `${fontSize}px`}}> 
                    {stripHtmlTags(questionArr.title)}
                  </div>
              }
              <div>
                {
                  questionArr.questionType == '1'
                  ? (<Radio.Group style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                      onChange={onChange(index)} 
                      value={questionArr.answer ? questionArr.answer : ''}
                      options={questionArr.items.map((opt) => ({
                      value: opt.prefix,
                      label: (
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: `${fontSize}px` }}>
                          {opt.prefix}
                          <p style={{width:'8px'}}></p>
                          {stripHtmlTags(opt.content)}
                        </span>
                      )
                      }))}>
                    </Radio.Group>) 
                    : questionArr.questionType == '2' 
                    ? <Checkbox.Group style={{ width: '100%', display: 'flex', flexDirection: 'column'}}
                      onChange={checkedOnChange(index)} 
                      value={questionArr.selectionsAnswer ? questionArr.selectionsAnswer : []}
                      options={questionArr.items.map((opt) => ({
                      value: opt.prefix,
                      label: (
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: `${fontSize}px`  }}>
                          {opt.prefix}
                          <p style={{width:'8px'}}></p>
                          {stripHtmlTags(opt.content)}
                        </span>
                      )
                      }))}>
                      </Checkbox.Group>
                    :<></>
                }
              </div>
              <div style={{height: '24px'}}></div>
            </div>
          ))
        }
      </div>
  )
}

export default observer(questions);