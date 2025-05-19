import { request } from "@/utils/request";

export const fetchLogin =  
(loginForm: Object) => {
    return request({
        url: '/api/user/login',
        method: 'POST',
        data: loginForm,
      })
}

export const getStudentId = async(name: string) => {
  return request({
    url: `/api/student/user/selectByUserName?userName=${name}`,
    method: 'POST'
  })
}

export const fetchLogout = async() => {
  return request({
    url: '/api/user/logout',
    method: 'POST'
  })
}