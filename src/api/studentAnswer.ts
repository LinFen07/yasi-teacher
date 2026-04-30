import { request } from "@/utils/request";
import { StudentAnswer, StudentSubmitAnswer, StudentWritingAnswer } from '@/typings/exam'
// export const submitAnswer = (data: StudentAnswer) => {
//   return request({
//     url: '/api/student/studentAnswer/addStudentAnswer',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     data: `isCorrect=${data.isCorrect}&paperId=${data.paperId}&questionId=${data.questionId}&score=${data.score}&studentAnswer=${data.studentAnswer}&studentId=${data.studentId}&questionType=${data.questionType}`,
//   })
// }

export const submitAnswerBatch = (data: StudentWritingAnswer[]) => {
  return request({
    url: '/api/student/studentAnswer/addStudentAnswerBatch',
    method: 'POST',
    data: data,
  })
}

export const getAnswerList = (pageNow: number, pageSize: number, data: any) => {
  return request({
    url: `/api/student/studentAnswer/page?pageNow=${pageNow}&pageSize=${pageSize}`,
    method: 'POST',
    data: data,
  })
}

export const judgingProblem = async (data: StudentSubmitAnswer) => {
  return request({
    url: '/api/student/exampaper/answer/answerSubmit',
    method: 'POST',
    data: data
  })
}