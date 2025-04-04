//封装和token相关的方法
const TOKENKTY = 'token_key'
function setToken(token) {
    localStorage.setItem(TOKENKTY, token)
}

function getToken() {
    return (localStorage.getItem(TOKENKTY))
}

function removeToken() {
    localStorage.removeItem(TOKENKTY)
}

export {
    setToken,
    getToken,
    removeToken
}