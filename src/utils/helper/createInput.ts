
import stores from '@/stores';
import type { Exam, ExamType } from '@/typings/exam';
import { autorun, runInAction, set } from 'mobx';
import { computedPrevCount } from '@/utils/helper/computed';
import { submitStudentBlankAnswer } from '../browser/submitAnswer';
import { restrictChineseInput } from './inputRestriction';
export function createInput(exam: Array<Exam>, type: string, container: any) {
  let prevCount = computedPrevCount(stores.ExamStore.currentExamTitle, exam);
  const index = +stores.ExamStore.currentExamTitle[4] - 1;

  const allSpans = container.querySelectorAll('.gapfilling-span');
  allSpans.forEach((span: any) => {
    span.innerHTML = '';
  });
  setTimeout(() => {
    const span = container.querySelectorAll('.gapfilling-span');
    if (span.length > 0) {
      let currIndex = 0;
      for (let j = 0; j < exam[index].questionItems.length; j++) {
        const questionArr = exam[index].questionItems[j];
        if (questionArr.topicType == '4' || questionArr.topicType == '6') {
          MyInput(currIndex, span, prevCount, questionArr);
          currIndex += questionArr.items.length;
        } else if (questionArr.topicType == '2' || questionArr.topicType == '5') {
          prevCount += questionArr.correctArray.length;
        } else {
          prevCount += 1;
        }
      }
    }
  })

  autorun(() => {
    const fontSize = stores.ExamStore.FontSize;
    const inputs = document.querySelectorAll<HTMLInputElement>('.textInput');
    inputs.forEach(input => {
      input.style.fontSize = `${fontSize}px`;
    });
  });
}

export function MyInput(index: number, span: any, prevCount: number, questionArr: ExamType) {
  // console.log('createInput', index, span, prevCount, questionArr);
  const fragment = document.createDocumentFragment();
  let len = index + questionArr.items.length;
  for (let i = index; i < len; i++) {
    // 检查 span 元素是否存在
    if (!span[i]) {
      console.error(`span[${i}] is undefined. Total spans: ${span.length}`);
      continue;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';

    const input = document.createElement('input');
    const placeholder = document.createElement('span');
    input.className = 'textInput';
    input.setAttribute('data-index', (prevCount + i + 1).toString()); // 设置序号
    if (stores.AnswerStore.completedAnswers[prevCount + i].studentAnswer) {
      input.value = stores.AnswerStore.completedAnswers[prevCount + i].studentAnswer; // 设置默认值 
    }
    else {
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
    input.addEventListener('input', (e) => {
      const originalValue = input.value;
      const filteredValue = restrictChineseInput(originalValue);

      // 如果输入包含中文，则替换为过滤后的值
      if (originalValue !== filteredValue) {
        input.value = filteredValue;
        // 显示提示信息（可选）
        console.warn('不允许输入中文字符');
      }

      if (input.value) {
        placeholder.style.display = 'none';
        const correctIndex = questionArr.correctArray.length - (len - i);
        const prefix = `${correctIndex + 1}`
        submitStudentBlankAnswer(questionArr, i, prevCount, input.value, correctIndex, prefix);
        runInAction(() => {
          stores.ExamStore.correctListenAnswer.push(prevCount + i + 1);
        });
      } else {
        placeholder.style.display = 'block';
      }
    });

    // 添加键盘事件监听，阻止中文输入法
    input.addEventListener('keydown', (e) => {
      // 阻止中文输入法的组合键
      if (e.key === 'Process' || e.isComposing) {
        e.preventDefault();
        return false;
      }
    });

    // 添加组合输入事件监听（处理输入法）
    input.addEventListener('compositionstart', (e) => {
      e.preventDefault();
    });

    input.addEventListener('compositionend', (e) => {
      e.preventDefault();
      const filteredValue = restrictChineseInput(input.value);
      input.value = filteredValue;
    });

    wrapper.appendChild(placeholder);
    wrapper.appendChild(input);


    span[i].innerHTML = '';
    span[i].appendChild(wrapper);
  }
}