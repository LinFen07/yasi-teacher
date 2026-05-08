
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, message, Select, Cascader } from 'antd';
import { fetchRegister, getExamMeal } from "@/api/register";
import { fetchLogin } from '@/api/login'
import stores from "@/stores";
import './index.scss'

import { citys } from '@/utils/contants/ChinaCitys2025'
import { useEffect, useState } from "react";

const { Option } = Select;

type Props = {
  data: string;
};

function LoginRoute(props: Props) {

  const navigate = useNavigate();

  const [ExamMeal, setExamMeal] = useState<any>([]);

  const cityOptions = citys.map((city: any) => {
    return {
      value: city.value, label: city.value, children: city.children.map((item: any) => {
        return { value: item.value, label: item.value }
      })
    }
  })

  const fetchGetExamMeal = async (pageSize: number, pageNum: number) => {
    const res = await getExamMeal(pageSize, pageNum);
    // @ts-ignore
    setExamMeal(res.response.items);
  }

  useEffect(() => {
    try {
      fetchGetExamMeal(10, 1);
    } catch (error) {
      console.log(error);
    }
  }, [])

  const onFinish = async (values: any) => {
    let res, mess, nav;
    if (props.data == 'login') {
      const va = { ...values, remember: false }
      res = await fetchLogin(va);
      //@ts-ignore
      if (res.code == 1) {
        //@ts-ignore
        stores.UserStore.login(res.response || res.data || {});
        message.success('登录成功');
        navigate('/layout/dashboard', { replace: true });
      }
      else {
        // @ts-ignore
        message.error(res.message);
      }
      return;
    }
    else {
      const ad = values.address
      values.address = ad[0] + ad[1];
      res = await fetchRegister(values);
      // @ts-ignore
      if (res.code == 1) {
        message.success('注册成功');
        navigate('/login');
      }
      else {
        // @ts-ignore
        message.error(res.message);
      }
    };
  };

  return (
    <div className="lowin lowin-blue">
      <div className="lowin-brand">
        <img
          src='http://111.230.5.159:9000/yasi/image/logo/logo-03.webp'
          alt="logo"
        />
      </div>
      <div className="lowin-wrapper">
        <div className="lowin-box lowin-login">
          <div className="lowin-box-inner">
            <Form
              name="login"
              style={{ maxWidth: 360 }}
              onFinish={onFinish}
            >
              <p style={{ fontSize: '16px' }}>考试系统</p>
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
                        {
                          ExamMeal?.map((item: any, index: number) => (
                            <Option value={item.id} key={index}>
                              {item.dictValue}: {item.description}
                            </Option>
                          ))
                        }
                        {/* <Option value="1">一套试卷</Option> */}
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
                    <div style={{ height: '40px' }}>
                      <Form.Item wrapperCol={{ span: 25, offset: 1 }}>
                        <Flex>
                          <Form.Item name="remember" valuePropName="checked" noStyle>
                            <span>
                              <Checkbox />
                              <label className="rememberCheck">记住我</label>
                            </span>
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
                <div style={{ height: '5px' }}></div>
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
