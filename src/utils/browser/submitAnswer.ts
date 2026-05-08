
import { ExamType, StudentAnswer, StudentWritingAnswer } from '@/typings/exam';
import stores from '@/stores';

// 将输入转为纯文本：去除所有 HTML 标签，并规范空白
function stripTagsNormalize(input: string): string {
  if (!input) return '';
  const div = document.createElement('div');
  div.innerHTML = input;
  const text = div.textContent || '';
  return text.replace(/\s+/g, ' ').trim();
}

const studentAnswer: StudentAnswer = {
  // isCorrect: 0,
  // paperId: stores.ExamStore.paperId,
  questionId: 0,
  content: '1',
  prefix: "1"
  // studentId: stores.UserStore.userId,
  // score: '0',
  // questionType: '1',
  // questionOrder: 0,
}

const studentWritingAnswer: StudentWritingAnswer = {
  paperId: stores.ExamStore.paperId,
  questionId: 0,
  composition: '1',
  studentId: stores.UserStore.userId,
}

export function submitStudentSelectAnswer(
  questionsArr: ExamType[],
  index: number,
  value: string,
  questionIndex: number,
): void {
  Object.assign(studentAnswer, {
    // isCorrect: stripTagsNormalize(value) == stripTagsNormalize(questionsArr[index].correct) ? 1 : 0,
    // paperId: stores.ExamStore.paperId,
    questionId: questionsArr[index].id,
    content: value,
    prefix: "1"
    // studentId: stores.UserStore.userId,
    // score: questionsArr[index].score,
    // questionType: questionsArr[index].topicType,
    // questionOrder: questionIndex + 1,
  });

  stores.AnswerStore.changeAnswer(questionIndex, studentAnswer);
}
export function submitStudentBlankAnswer(
  questionArr: ExamType,
  i: number,
  prevCount: number,
  value: string,
  correctIndex: number,
  prefix: string
): void {
  Object.assign(studentAnswer, {
    // isCorrect: stripTagsNormalize(value) == stripTagsNormalize(questionArr.correctArray[correctIndex]) ? 1 : 0,
    // paperId: stores.ExamStore.paperId,
    questionId: questionArr.id,
    content: value,
    prefix: prefix
    // studentId: stores.UserStore.userId,
    // score: stripTagsNormalize(value) == stripTagsNormalize(questionArr.correctArray[correctIndex]) ? questionArr.items[correctIndex].score : '0',
    // questionType: questionArr.topicType,
    // questionOrder: prevCount + i + 1,
  });
  stores.AnswerStore.changeAnswer(prevCount + i, studentAnswer);

}

export function submitStudentWritteAnswer(
  questionArr: ExamType,
  index: number,
  value: string,
): void {
  Object.assign(studentWritingAnswer, {
    // isCorrect: 0,
    paperId: stores.ExamStore.paperId,
    questionId: questionArr.id,
    composition: value,
    studentId: stores.UserStore.userId,
    // questionType: questionArr.topicType,
    // questionOrder: index + 1,
  });
  stores.AnswerStore.changeStudentWritteAnswer(index, studentWritingAnswer);
}