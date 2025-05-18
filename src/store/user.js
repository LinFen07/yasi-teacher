//用户相关状态管理
import { createSlice } from "@reduxjs/toolkit";
import { removeToken, request } from "../utils/index.js";
import { setToken as _setToken, getToken } from "../utils/index.js";
import { useNavigate } from "react-router-dom";
import { message } from 'antd'
// import axios from 'axios';
const userStore = createSlice({
    name: "user",
    //数据状态
    initialState: {
        token: getToken() || '',
        userInfo: {},
        theme: 'light' // 默认亮色主题
    },
    //同步修改方法
    reducers: {
        setToken(state, action) {
            state.token = action.payload
            _setToken(action.payload) // 使用token.js中的方法
        },
        setUserInfo(state, action) {
            state.userInfo = action.payload
            // 保持原样，因为token.js不处理用户信息
            localStorage.setItem('user_message', JSON.stringify(action.payload))
        },
        clearUserInfo(state) {
            state.token = ''
            state.userInfo = {}
            removeToken()
        },
        toggleTheme(state) {
            state.theme = state.theme === 'light' ? 'dark' : 'light'
        }
    }
})

//解构出actionCreater
const { setToken, setUserInfo, clearUserInfo, toggleTheme } = userStore.actions

//获取reduser函数
const userReducer = userStore.reducer

// const data = { "userName": "teacher", "password": "123456" };

//异步方法 完成登录获取token
const fetchLogin = (loginForm) => {
    return async (dispatch) => {
        // 构造请求数据，确保字段名正确
        const requestData = {
            userName: loginForm.userName,
            password: loginForm.code
        };
        // 发送请求
        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
            credentials: 'include' // 允许发送和接收cookies
        });
        const cookieString = document.cookie;
        const jsessionId = cookieString.split('JSESSIONID=')[1];
        const token = jsessionId ? jsessionId.split(';')[0] : '';
        console.log('Extracted token:', token)
        // 检查HTTP状态码
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        // 解析JSON数据
        const result = await response.json();
        console.log('完整响应:', result); // 打印完整响应以验证数据结构

        // 只有当code为1时才处理成功响应
        if (result.code === 1) {
            const userData = result.response;
            // 存储userId到localStorage
            if (userData.userId) {
                localStorage.setItem('userId', userData.id);
            }
            dispatch(setUserInfo(userData));
            return { success: true, message: "登录成功" };
        } else {
            return { success: false, message: result.message || "登录失败" };
        }
    };

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
}

export { fetchLogin, clearUserInfo, toggleTheme, setUserInfo }

export default userReducer
