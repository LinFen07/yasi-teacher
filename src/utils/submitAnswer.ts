
import { ExamType, StudentAnswer } from '@/typings/exam';
import { submitAnswer } from '@/api/studentAnswer';
import stores from '@/stores';

export function submitStudentAnswer(questionsArr: ExamType[], index: number, value: string){
  const studentAnswer: StudentAnswer = {
    isCorrect: value == questionsArr[index].correct  ? 1 : 0,
    paperId: stores.ExamStore.paperId,
    questionId: questionsArr[index].id,
    studentAnswer: value.toString(),
    studentId: stores.UserStore.userId,
  }

  submitAnswer(studentAnswer).then((res) => {
    //@ts-ignore
    if(res.code == 200){
      console.log('提交成功');
    }
  }).catch((err) => {
    console.error('提交失败', err);
  })
}