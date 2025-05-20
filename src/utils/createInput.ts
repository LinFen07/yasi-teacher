
import stores from '@/stores';
import type { Exam, ExamType } from '@/typings/exam';
import { autorun, runInAction } from 'mobx';
import  {computedPrevCount}  from '@/utils/computed';
import { submitStudentBlankAnswer } from './submitAnswer';
export function createInput(exam: Array<Exam>, type: string) {
  let prevCount = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
  const index = +stores.ExamStore.currentExamTitle[4] - 1;

  setTimeout(() => {
    const span = document.querySelectorAll('.gapfilling-span');
    if (span.length > 0) {
      let currIndex = 0;
      for (let j = 0; j < exam[index].questionItems.length; j++) {
        const questionArr = exam[index].questionItems[j];
        if (questionArr.topicType == '4' || questionArr.topicType == '6') {
          MyInput(currIndex, span, prevCount, questionArr, type);
          currIndex += questionArr.items.length;
        } else if (questionArr.topicType == '2' || questionArr.topicType == '5') {
          prevCount += questionArr.correctArray.length;
        } else {
          prevCount += 1;
        }
      }
    }
  },0)

  // 👇 添加 autorun 来监听字体大小变化
  autorun(() => {
    const fontSize = stores.ExamStore.FontSize;
    const inputs = document.querySelectorAll<HTMLInputElement>('.textInput');
    inputs.forEach(input => {
      input.style.fontSize = `${fontSize}px`;
    });
  });
}

export function MyInput(index: number, span: any, prevCount: number, questionArr: ExamType, type: string) {
  console.log('createInput', index, span, prevCount, questionArr);
  let len = index + questionArr.items.length;
  for (let i = index; i < len; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';

    const input = document.createElement('input');
    const placeholder = document.createElement('span');
    input.className = 'textInput';
    input.setAttribute('data-index', (prevCount + i + 1).toString()); // 设置序号
    if(stores.AnswerStore.completedAnswers[prevCount + i].studentAnswer){
      input.value = stores.AnswerStore.completedAnswers[prevCount + i].studentAnswer; // 设置默认值 
    }
    else{
      placeholder.className = 'placeholder';
      placeholder.innerText = (prevCount + i + 1).toString(); // 显示序号
    }

    input.addEventListener('focus', () => {
      placeholder.style.display = 'none';
      stores.ExamStore.changeCurrent(prevCount + i + 1);
    });
    input.addEventListener('blur', () => {
      if (!input.value) {
        placeholder.style.display = 'block';
      }
    });
    input.addEventListener('input', () => {
      if (input.value) {
        placeholder.style.display = 'none';
        const correctIndex = questionArr.correctArray.length - (len - i);
        submitStudentBlankAnswer(questionArr, i, prevCount, input.value, correctIndex);
        runInAction(() => {
          stores.ExamStore.correctListenAnswer.push(prevCount + i + 1);
        });
      } else {
        placeholder.style.display = 'block';
      }
    });

    wrapper.appendChild(placeholder);
    wrapper.appendChild(input);

    span[i].innerHTML = '';
    span[i].appendChild(wrapper);
  }
}