
import stores from '@/stores';
import type { Exam, ExamType } from '@/typings/exam';
import { runInAction } from 'mobx';
import  {computedPrevCount}  from '@/utils/computedPrevCount';
export function createInput(exam: Array<Exam>, type: string) {
  let prevCount = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
  const index = +stores.ExamStore.currentExamTitle.slice(4, stores.ExamStore.currentExamTitle.length - 1) - 1;
  let currIndex = 0;
  let timerId = setTimeout(() => {
    const span = document.querySelectorAll('.gapfilling-span');
    if (span.length === 0) return;
    for(let j = 0; j < exam[index].questionItems.length; j++){
      const questionArr = exam[index].questionItems[j];
      if(questionArr.questionType == '4'){
        MyInput(currIndex, span, prevCount, questionArr, type);
        currIndex += questionArr.items.length;
      }else if(questionArr.questionType == '2'){
        prevCount += questionArr.correctArray.length;
      }else {
        prevCount += 1;
      }
    } 
  }, 0)
    return () => clearTimeout(timerId);
}

function MyInput(index: number, span: any, prevCount: number, questionArr: ExamType, type: string) {
  let len = index + questionArr.items.length;
  for (let i = index; i < len; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';

    const input = document.createElement('input');
    const placeholder = document.createElement('span');
    input.className = 'textInput';
    input.setAttribute('data-index', (prevCount + i + 1).toString()); // 设置序号
    if(type== 'listen' && stores.ExamStore.studentListenAnswers[prevCount + i + 1]){
      input.value = stores.ExamStore.studentListenAnswers[prevCount + i + 1]; // 设置默认值 
    } else if(type == 'read' && stores.ExamStore.studentReadAnswers[prevCount + i + 1]){
      input.value = stores.ExamStore.studentReadAnswers[prevCount + i + 1]; // 设置默认值
    } 
    else{
      placeholder.className = 'placeholder';
      placeholder.innerText = (prevCount + i + 1).toString(); // 显示序号
    }

    // 监听 input 的 focus 和 input 事件
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
        if(type == 'listen')
          stores.ExamStore.changeStudentListenAnswer(prevCount + i + 1,input.value);
        else
          stores.ExamStore.changeStudentReadAnswer(prevCount + i + 1,input.value);
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