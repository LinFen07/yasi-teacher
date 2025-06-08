import { Card, Form, Input, Button, message } from "antd"
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { fetchLogin } from "../../store/user"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/logo.jpg"
import './index.scss'
const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const onFinish = async (values) => {
        const result = await dispatch(fetchLogin(values))
        if (result.success) {
            navigate('/app/evaluation')
            message.success(result.message)
        } else {
            message.error(result.message || "登录失败")
        }

    }
    const logo = 'http://111.230.5.159:9000/yasi/image/logo/logo-07-3.png'
    return (<>
        <div className="login">
            <div style={{ height: '1px' }}></div>
            <Card className="login-container">
                <img className="login-logo" src={logo} alt="#" style={{ borderRadius: '50%', width: '175px', height: '135px', transform: 'translate(-48px, -30px)' }}></img>
                <div style={{
                    fontSize: '30px',
                    textAlign: 'center',
                    marginBottom: '10px',
                }}>教师登录</div>
                <Form validateTrigger="onBlur" onFinish={onFinish} layout="vertical" requiredMark={false}>
                    <Form.Item
                        name="userName"
                        label="用户名"
                        rules={[
                            {
                                required: true,
                                message: '请输入用户名',
                            }
                        ]}
                    >
                        <Input size="large" placeholder="请输入用户名" prefix={<UserOutlined />}></Input>
                    </Form.Item>
                    <Form.Item
                        name="code"
                        label="密码"
                        rules={[
                            {
                                required: true,
                                message: '请输入密码',
                            },
                            {
                                pattern: /^\d{6}$/,
                                message: '密码为六位'
                            }
                        ]}
                    >
                        <Input.Password size="large" placeholder="请输入密码" prefix={<LockOutlined />} visibilityToggle></Input.Password>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>登录</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    </>
    )
}
export default Login