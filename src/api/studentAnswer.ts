import { request } from "@/utils/request";
import {StudentAnswer} from '@/typings/exam'
export const submitAnswer = (data: StudentAnswer) => {
  return request({
    url: '/api/student/studentAnswer/addStudentAnswer',
    method: 'POST',
    data: `isCorrect=${data.isCorrect}&paperId=${data.paperId}&questionId=${data.questionId}&studentAnswer=${data.studentAnswer}&studentId=${data.studentId}`,
  })
}

export const isHaveAnswer = (data: StudentAnswer) => {
  return request({
    url: '/api/student/studentAnswer/isExist',
    method: 'POST',
    data: data,
  })
}

export const changeAnswer = (data: StudentAnswer) => {
  return request({
    url: '/api/student/studentAnswer/updateStudentAnswer',
    method: 'POST',
    data: `isCorrect=${data.isCorrect}&paperId=${data.paperId}&questionId=${data.questionId}&studentAnswer=${data.studentAnswer}&studentId=${data.studentId}`,
  })
}

export const getAnswer = (data: StudentAnswer) => {
  return request({
    url: '/api/student/studentAnswer/page',
    method: 'POST',
    data: data,
  })
}