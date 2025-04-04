import { Layout, Menu, Popconfirm, Select } from 'antd';
import {
    HomeOutlined,
    DiffOutlined,
    EditOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import './index.scss';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo, clearUserInfo } from '../../store/user';

const { Header, Sider } = Layout;
const { Option } = Select;

const items = [
    {
        label: '首页',
        key: '/home',
        icon: <HomeOutlined />,
    },
    {
        label: '考试阅卷',
        key: '/evaluation',
        icon: <EditOutlined />,
    },
];

const GeekLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // 获取用户信息
    useEffect(() => {
        dispatch(fetchUserInfo());
    }, [dispatch]);

    const name = useSelector((state) => state.user.userInfo.name);

    // 退出登录
    const onConfirm = () => {
        dispatch(clearUserInfo());
        navigate('/login');
    };

    const onMenuClick = (route) => {
        const path = route.key;
        navigate(path);
    };



    return (
        <Layout>
            <Header className="header">
                <div className="logo-container">
                    <div className="logo" />
                    <span className="welcome-text">欢迎来到教师后台管理系统</span>
                </div>
                <div className="header-right">
                    <div className="user">
                        <img src="" alt="" />
                        <span className="user-name">张老师</span>
                    </div>
                    <span className="Layout-logout">
                        <Popconfirm
                            title="是否确认退出？"
                            okText="退出"
                            cancelText="取消"
                            onConfirm={onConfirm}
                        >
                            <LogoutOutlined /> 退出
                        </Popconfirm>
                    </span>
                </div>
            </Header>
            <Layout>
                <Sider width={200} className="site-layout-background">
                    <Menu
                        mode="inline"
                        theme="dark"
                        selectedKeys={[location.pathname]}
                        items={items}
                        onClick={onMenuClick}
                        style={{ height: '100%', borderRight: 0 }}
                    />
                </Sider>
                <Layout className="layout-content" style={{ padding: 20 }}>
                    <Outlet />
                </Layout>
            </Layout>
        </Layout>
    );
};

export default GeekLayout;
