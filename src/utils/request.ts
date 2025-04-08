import axios from "axios";

const request = axios.create({
  baseURL: 'http://120.24.144.113:8668',
  timeout: 30000,
})

export const post = (url: string, params: any) => {
  const query = {
    url: url,
    method: 'POST',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true,}
  }
  return request(query)
}

export const postWithLoadTip = function (url: string, params: any) {
  const query = {
    url: url,
    method: 'POST',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true }
  }
  return request(query)
}

export const postWithOutLoadTip = function (url: string, params: any) {
  const query = {
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true }
  }
  return request(query)
}

export const get = function (url: string, params: any) {
  const query = {
    url: url,
    method: 'get',
    withCredentials: true,
    timeout: 30000,
    params: params,
    headers: { 'request-ajax': true }
  }
  return request(query)
}



//添加请求拦截器
request.interceptors.request.use((config) => {
  return config
}, (error) => {
  return Promise.reject(error)
})

//添加响应拦截器
request.interceptors.response.use((response) => {
  // 2xx 范围内的状态码触发该函数。
  return response.data
}, (error) => {
  // 超出 2xx 范围的状态码触发该函数。
  return Promise.reject(error)
})

export { request }