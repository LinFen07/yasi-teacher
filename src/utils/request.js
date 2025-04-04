//axios的封装处理
import axios from "axios"
import { getToken, removeToken } from "./token"
import router from "../router"
import { message } from "antd"
//1.根域名配置
//2.超时时间
//3.请求拦截器/响应拦截器

const request = axios.create({
    baseURL: 'http://geek.itheima.net/v1_0',
    timeout: 5000
})

request.interceptors.request.use((config) => {
    //操作config 注入token数据
    //1.获取到token
    //2.按照后端的格式要求做token拼接
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

request.interceptors.response.use((response) => {
    return response.data
}, (error) => {
    if (error.response.status === 401) {
        removeToken()
        router.navigate('/login')
        window.location.reload()
    } if (error.response.status === 400) {
        router.navigate('/login')
        window.location.reload()
    }
    return Promise.reject(error)
})

export { request }