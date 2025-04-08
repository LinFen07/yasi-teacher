import {  Radio, Checkbox  } from 'antd';
import { useEffect, useState, useRef } from 'react';
import stores from '@/stores';
import ReactHtmlParser from 'react-html-parser';
import { observer } from 'mobx-react';
import './index.scss'
import { runInAction } from 'mobx';
import  {computedPrevCount, computedBlanksPrevCount}  from '@/utils/computedPrevCount';
import { createInput } from '@/utils/createInput';
import { submitStudentAnswer } from '@/utils/submitAnswer'

const questions = () => {
  const exam = stores.ExamStore.getListenExam();

  const [listensArr, setListensArr] = useState(exam[0]);
  const [questionsArr, setQuestionArr] = useState(listensArr.questionItems);
  const questionIndex = stores.ExamStore.currentExamIndex;
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
    setListensArr(exam[index]);
    setQuestionArr(exam[index].questionItems);
    createInput(exam, 'listen');
  },[stores.ExamStore.currentExamTitle]);
  
  const onChange = (index: number) => (e: any) => {
    let pre = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
    stores.ExamStore.changeStudentListenAnswer(pre + index + 1,e.target.value);
    const examIndex = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
    const  value  = e.target.value;

    //向数据提交答案
    submitStudentAnswer(questionsArr, index, value);

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
    let pre = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
    stores.ExamStore.changeStudentListenAnswer(pre + index + 1,checkedValues.toString());
    const examIndex = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;

    submitStudentAnswer(questionsArr, index, checkedValues.toString());

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

  return (
    <div className='lllll'>
      <div className='contentTitle'>{ReactHtmlParser(listensArr.name)}</div>
      <div className='listencontent'>
        {
          questionsArr.map((questionArr, index) => (
            <div key={index}>
              <div ref={el => titleRefs.current[index] = el}> 
                {ReactHtmlParser(questionArr.title)}
              </div>
              <div >
                {
                  questionArr.questionType == '1'
                  ? (<Radio.Group 
                      onChange={onChange(index)} 
                      value={questionArr.answer ? questionArr.answer : ''}
                      options={questionArr.items.map((opt) => ({
                      value: opt.prefix,
                      label: (
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {opt.prefix}
                          <p style={{width:'8px'}}></p>
                          {ReactHtmlParser(opt.content)}
                        </span>
                      )
                      }))}>
                    </Radio.Group>) 
                    : questionArr.questionType == '2' 
                    ? <Checkbox.Group style={{ width: '100%' }} 
                      onChange={checkedOnChange(index)} 
                      value={questionArr.selectionsAnswer ? questionArr.selectionsAnswer : []}
                      options={questionArr.items.map((opt) => ({
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
            </div>
          ))
        }
      </div>
     </div>
  )
}

export default observer(questions);