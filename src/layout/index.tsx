import * as React from "react";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import type { MenuProps} from 'antd';
import { Layout, Menu, Dropdown, Space, Avatar } from 'antd';

import { fetchLogout } from "@/api/login";

import { observer } from "mobx-react";
import store from '@/stores/user'

import './index.scss'
//@ts-ignore
import img from '@/assets/logo.png'

const { Header, Content, Footer } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const navItems: MenuItem[] = [
  {
    label: '试卷中心',
    key: '/layout/dashboard',
  }
];


const items: MenuItem[] = [
  {
    label: '退出登录',
    key: 'logout',
    onClick: () => {
      fetchLogout();
      store.logout()
      window.location.href = '/login';
    },
  }
]

const Index: React.FC = observer(() => {
  const navigate = useNavigate();
  const onMenuClick = (route: any) => {
    const path = route.key;
    navigate(path);
  }

  //实现反向高亮
  const location = useLocation();
  const selectedkey = location.pathname;

    return (
    <Layout>
      <Header className='headNav' >
        <div>
          <img src={img} className='navImg'/>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedkey]}
          items={navItems}
          onClick={onMenuClick}
          className='menuNav'
        />
        <Dropdown menu={{ items }} trigger={['click']}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <Avatar size={37} className='avatar'/>
            </Space>
          </a>
        </Dropdown>
      </Header>
      <Content>
        <Outlet/>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        <div className="foot-copyright">
          <span>仲恺农业工程学院 北京燕兴国际教育咨询有限公司 版权所有</span>
        </div>
      </Footer>
    </Layout>
  );
})

export default Index;