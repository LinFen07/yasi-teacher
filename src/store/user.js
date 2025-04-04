//用户相关状态管理
import { createSlice } from "@reduxjs/toolkit";
import { removeToken, request } from "../utils/index.js";
import { setToken as _setToken, getToken } from "../utils/index.js";
const userStore = createSlice({
    name: "user",
    //数据状态
    initialState: {
        token: getToken() || '',
        userInfo: {}
    },
    //同步修改方法
    reducers: {
        setToken(state, action) {
            state.token = action.payload
            //localstorage存一份
            _setToken(action.payload)
        },
        setUserInfo(state, action) {
            state.userInfo = action.payload
        },
        clearUserInfo(state) {
            state.token = ''
            state.userInfo = {}
            removeToken()
        }
    }
})

//解构出actionCreater
const { setToken, setUserInfo, clearUserInfo } = userStore.actions

//获取reduser函数
const userReducer = userStore.reducer

//异步方法 完成登录获取token
const fetchLogin = (loginForm) => {
    return async (dispatch) => {
        //发送异步请求
        const res = await request.post('/authorizations', loginForm)
        //2.提交同步action进行token的存入
        dispatch(setToken(res.data.token))
    }
}
//获取个人用户信息
const fetchUserInfo = () => {
    return async (dispatch) => {
        //发送异步请求
        const res = await request.get('/user/profile')
        //2.提交同步action进行token的存入
        dispatch(setUserInfo(res.data))
    }
}
export { fetchLogin, fetchUserInfo, clearUserInfo }

export default userReducer
