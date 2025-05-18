
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Login from '@/pages/Login';
import Layout from "@/layout";
import Dashboard from "@/pages/dashboard";
import ListeningExam from "@/pages/listeningExam";
import UserInfo from "@/pages/userInfo";
import ReadExam from "@/pages/readExam";
import WritteExam from "@/pages/writte";
import TestOver from "@/pages/testOver";
import stores from "@/stores";
import Video from "@/pages/video";

// 快速导入工具函数
const lazyLoad = (moduleName: string) => {
  const Module = lazy(() => import(`@/pages/${moduleName}`));
  return <Module />;
};

// 路由鉴权组件
const Appraisal = ({ children }: any) => {
  const token = localStorage.getItem(stores.UserStore.key);
  return token ? children : <Navigate to="/login" />;
};

interface Router {
  name?: string;
  path: string;
  children?: Array<Router>;
  element: any;
}

const routes: Array<Router> = [
  //路由重定向
  {
    path: '/',
    element: <Navigate to="/layout/dashboard" replace />
  },
  {
    path: '/login',
    element: <Login data={'login'}/>
  },
  {
    path: '/register',
    element: <Login data={'register'} />
  },
  {
    path: '/layout',
    element: <Appraisal><Layout /></Appraisal>,
    children:[
      {
        path: 'dashboard',
        element: <Dashboard/>
      },
      {
        path: 'userInfo',
        element: <UserInfo />
      },
    ]
  },
  {
    path: '/listeningExam',
    element: <ListeningExam/>
  },
  {
    path: '/readnExam',
    element: <ReadExam/>
  },
  {
    path: '/writteExam',
    element: <WritteExam/>
  },
  {
    path: '/testOver',
    element: <TestOver/>
  },
  {
    path: '/video',
    element: <Video/>
  }
]



export default routes