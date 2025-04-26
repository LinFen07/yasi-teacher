import axios from 'axios';

const request = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'request-ajax': true,
  },
  withCredentials: true,
});

// export const post = (url: string, params: any) => {
//   const query = {
//     url: url,
//     method: 'POST',
//     withCredentials: true,
//     timeout: 30000,
//     data: params,
//     headers: { 'Content-Type': 'application/json', 'request-ajax': true,}
//   }
//   return request(query)
// }

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
  const setCookieHeader = response.headers['Set-Cookie'];
  if (setCookieHeader) {
    // 处理 Set-Cookie 头
    console.log('Set-Cookie:', setCookieHeader);
    // 将 Cookie 存储在 localStorage 或 sessionStorage 中
    localStorage.setItem('cookie', setCookieHeader.join('; '));
  }
  return response.data
}, (error) => {
  // 超出 2xx 范围的状态码触发该函数。
  return Promise.reject(error)
})

export { request }