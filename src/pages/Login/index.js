import { Card, Form, Input, Button, message } from "antd"
import { fetchLogin } from "../../store/user"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/logo.jpg"
import './index.scss'
const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const onFinish = async (values) => {
        await dispatch(fetchLogin(values))
        navigate('/')
        message.success("登录成功")
    }
    return (<>
        <div className="login">
            <div style={{ height: '1px' }}></div>
            <Card className="login-container">
                <img className="login-logo" src={logo} alt="#" ></img>
                <Form validateTrigger="onBlur" onFinish={onFinish}>
                    <Form.Item
                        name="mobile"
                        rules={[
                            {
                                required: true,
                                message: '请输入您的账号',
                            },
                            {
                                pattern: /^\d{11}$/,
                                message: '请输入正确的账号'
                            }
                        ]}
                    >
                        <Input size="large" placeholder="请输入账号"></Input>
                    </Form.Item>
                    <Form.Item
                        name="code"
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
                        <Input size="large" placeholder="请输入密码"></Input>
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