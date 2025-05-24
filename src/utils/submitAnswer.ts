
import { ExamType, StudentAnswer } from '@/typings/exam';
import stores from '@/stores';

const studentAnswer: StudentAnswer = {
  isCorrect: 0,
  paperId: stores.ExamStore.paperId,
  questionId: 0,
  studentAnswer: '1',
  studentId: stores.UserStore.userId,
  score: '0',
  questionType: '1',
  questionOrder: 0,
}

export function submitStudentSelectAnswer(
  questionsArr: ExamType[], 
  index: number, 
  value: string, 
  questionIndex: number,
): void {
  Object.assign(studentAnswer, {
    isCorrect: value == questionsArr[index].correct  ? 1 : 0,
    paperId: stores.ExamStore.paperId,
    questionId: questionsArr[index].id,
    studentAnswer: value,
    studentId: stores.UserStore.userId,
    score: questionsArr[index].score,
    questionType: questionsArr[index].topicType,
    questionOrder: questionIndex + 1
  });

  stores.AnswerStore.changeAnswer(questionIndex, studentAnswer);
}
export function submitStudentBlankAnswer(
  questionArr: ExamType, 
  i: number, 
  prevCount: number, 
  value: string, 
  correctIndex: number,
): void {
  Object.assign(studentAnswer, {
    isCorrect: value == questionArr.correctArray[correctIndex]  ? 1 : 0,
    paperId: stores.ExamStore.paperId,
    questionId: questionArr.id,
    studentAnswer: value,
    studentId: stores.UserStore.userId,
    score: value == questionArr.correctArray[correctIndex] ? questionArr.items[correctIndex].score : '0',
    questionType: questionArr.topicType,
    questionOrder: prevCount + i + 1
  });
  stores.AnswerStore.changeAnswer(prevCount + i, studentAnswer);
}

export function submitStudentWritteAnswer(
  questionArr: ExamType, 
  index: number, 
  value: string,
): void {
  Object.assign(studentAnswer, {
    isCorrect: 0,
    paperId: stores.ExamStore.paperId,
    questionId: questionArr.id,
    studentAnswer: value,
    studentId: stores.UserStore.userId,
    questionType: questionArr.topicType,
    questionOrder: index + 1,
  });
  stores.AnswerStore.changeStudentWritteAnswer(index, studentAnswer);
}