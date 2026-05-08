import { request } from "@/utils/request";

export const select = async (id: number) => {
  return request({
    url: '/api/student/exam/paper/select/' + id,
    method: 'POST',
  })
}

// 判断考生是否已完成该试卷
export const getExam = async (id: number) => {
  return request({
    url: `/api/student/examassignment/page?userId=${id}`,
    method: 'GET',
  })
}

export const getAdminExam = async () => {
  return request({
    url: '/api/admin/exam/paper/allIdAndName',
    method: 'POST',
  })
}


// export const getExam = async() => {
//   return request({
//       url: '/api/student/exam/paper/pageList',
//       method: 'POST',
//   })
// }