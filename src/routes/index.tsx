
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Login from '@/pages/Login';
import Layout from "@/layout";
import Record from "@/pages/record";
import Dashboard from "@/pages/dashboard";
import ErrorQuestions from "@/pages/errorQuestions";
import ListeningExam from "@/pages/listeningExam";
import Message from "@/pages/message";
import UserInfo from "@/pages/userInfo";
import ReadExam from "@/pages/readExam";
import WritteExam from "@/pages/writte";
import TestOver from "@/pages/testOver";

// 快速导入工具函数
const lazyLoad = (moduleName: string) => {
  const Module = lazy(() => import(`@/pages/${moduleName}`));
  return <Module />;
};

// 路由鉴权组件
const Appraisal = ({ children }: any) => {
  const token = localStorage.getItem("student");
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
        path:'record',
        element: <Record />
      },
      {
        path: 'errorQuestions',
        element: <ErrorQuestions />
      },
      {
        path: 'message',
        element: <Message />
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
]



export default routes