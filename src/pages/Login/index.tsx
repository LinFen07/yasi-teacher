
import { useNavigate } from "react-router";

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, message, Select  } from 'antd';
import { Cascader } from 'antd';

import { fetchRegister } from "@/api/register";
import { fetchLogin } from '@/api/login'

import stores from "@/stores";

import './index.scss'
//@ts-ignore
import img from '@/assets/logo2.png'

const { Option } = Select;

type Props = {
  data: string;
};

function LoginRoute(props: Props) {

  const navigate = useNavigate();
  const cityOptions = [
    {
      value: '广东省',
      label: '广东省',
      children: [
        { value: '广州市', label: '广州市' },
        { value: '深圳市', label: '深圳市' },
        { value: '珠海市', label: '珠海市' },
      ],
    },
    {
      value: '北京市',
      label: '北京市',
      children: [
        { value: '东城区', label: '东城区' },
        { value: '西城区', label: '西城区' },
        { value: '朝阳区', label: '朝阳区' },
      ],
    },
    {
      value: '上海市',
      label: '上海市',
      children: [
        { value: '黄浦区', label: '黄浦区' },
        { value: '徐汇区', label: '徐汇区' },
        { value: '长宁区', label: '长宁区' },
      ],
    },
  ];

  const onFinish = async(values: any) => {
    let res, mess, nav;
    if(props.data == 'login') {
      res = await fetchLogin(values);
      mess = '登录成功';
      nav = '/layout/dashboard';
    } else {
      console.log('注册', values);
      res = await fetchRegister(values);
      mess = '注册成功';
      nav = '/';
    };

    //@ts-ignore
    if(res.code == 1) {
      // stores.UserStore.setUserId(res.data.id);
      const cookies = document.cookie;
      console.log(cookies);
      stores.UserStore.login(cookies);
      stores.UserStore.setName(values.userName);
      message.success(mess);
      navigate(nav);
    }else{
      message.success(mess);
      navigate(nav);
    };
  };

  return (
    <div className="lowin  lowin-blue">
      <div className ="lowin-brand">
        <img src={img} alt="logo" style={{marginTop: '12px'}} />
      </div>
      <div className="lowin-wrapper">
        <div className="lowin-box lowin-login">
          <div className="lowin-box-inner">
            <Form
              name="login"
              style={{ maxWidth: 360 }}
              onFinish={onFinish}
            >
              <p style={{fontSize: '16px'}}>考试系统</p>
              <div className="lowin-group">
                <label>用户名</label>
                <Form.Item
                  name="userName"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名"
                  size="large"
                  className="lowin-input"
                  />
                </Form.Item>
              </div>
              <div className="lowin-group password-group">
                <label>密码</label>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input 
                  prefix={<LockOutlined />} 
                  type="password" 
                  placeholder="密码"
                  size="large"
                  className="lowin-input"
                  />
                </Form.Item>
              </div>
              {
                props.data == 'register'
                ? <div>
                    <label>确认密码</label>
                    <Form.Item
                      name="confirmPassword"
                      rules={[{ required: true, message: '两次输入的密码不同' }]}
                    >
                      <Input 
                      prefix={<LockOutlined />} 
                      placeholder="确认密码"
                      size="large"
                      className="lowin-input"
                      />
                    </Form.Item>
                    <label>真实姓名</label>
                    <Form.Item
                      name="realName"
                      rules={[{ required: true, message: '请输入真实姓名' }]}
                    >
                      <Input 
                      prefix={<UserOutlined />} 
                      placeholder="真实姓名"
                      size="large"
                      className="lowin-input"
                      />
                    </Form.Item>
                    <label>身份证</label>
                    <Form.Item
                      name="identity"
                      rules={[{ required: true, message: '请输入身份证号码' }]}
                    >
                      <Input 
                      placeholder="身份证号"
                      size="large"
                      className="lowin-input"
                      />
                    </Form.Item>

                    <label>居住城市</label>
                    <Form.Item
                      name="address"
                      rules={[{ required: true, message: '请填写居住城市' }]}
                    >
                      <Cascader
                        options={cityOptions}
                        placeholder="请选择居住城市"
                      />
                    </Form.Item>
                    <label>邮箱</label>
                    <Form.Item
                      name="email"
                      rules={[{ required: true, message: '请输入邮箱' }]}
                    >
                      <Input 
                      placeholder="留意邮箱中的考试通知"
                      size="large"
                      className="lowin-input"
                      />
                    </Form.Item>
                    <label>套餐</label>
                    <Form.Item
                      name="examPackage"
                      rules={[{ required: true, message: '请选择套餐' }]}
                    >
                      <Select placeholder="选择套餐">
                        <Option value="1">一套试卷</Option>
                      </Select>
                    </Form.Item>
              <div className="lowin-group password-group">
                <label>电话</label>
                <Form.Item
                  name="phone"
                  rules={[{ required: true, message: '请输入电话' }]}
                >
                  <Input 
                  placeholder="电话"
                  size="large"
                  className="lowin-input"
                  />
                </Form.Item>
              </div>
                  </div>
                : <div>
                    <div style={{height: '40px'}}>
                      <Form.Item wrapperCol={{ span: 25, offset: 1 }}>
                        <Flex>
                          <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox></Checkbox><label className="rememberCheck">记住我</label>
                          </Form.Item>
                          <label><a href="#"><b>忘记密码？</b></a></label>
                        </Flex>
                      </Form.Item>
                    </div>
                  </div>
              }
              <Form.Item>
                <Button block type="primary" htmlType="submit" className="lowin-btn">
                  {props.data == 'register' ? '注册' : '登录'}
                </Button>
                <div style={{height: '5px'}}></div>
                {
                  props.data == 'register' 
                  ? <div>已有账号？ <a href="/login" className="login-link"><b>登录</b></a> </div>
                  : <div>还没有账号？ <a href="/register" className="register-link"><b>注册</b></a></div>
                }
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
      <div className="account-foot-copyright">
        <span>仲恺农业工程学院 北京燕兴国际教育咨询有限公司 版权所有</span>
      </div>
    </div>
  );
};

export default LoginRoute;
