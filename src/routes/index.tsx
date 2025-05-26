
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Login from '@/pages/Login';
import Layout from "@/layout";
import Dashboard from "@/pages/dashboard";
import stores from "@/stores";
import type { Router } from "@/typings/router";

// 快速导入工具函数
const lazyLoad = (moduleName: string, Examtype: string = '') => {
  const Module = lazy(() => import(`@/pages/${moduleName}`));
  return Examtype.length ? <Module type={Examtype}/> : <Module />;
};

// 路由鉴权组件
const Appraisal = ({ children }: any) => {
  const token = localStorage.getItem(stores.UserStore.key);
  return token ? children : <Navigate to="/login" />;
};

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
      }
    ]
  },
  {
    path: '/listeningExam',
    element: lazyLoad('examPage', 'listen')
  },
  {
    path: '/readnExam',
    element: lazyLoad('examPage', 'read')
  },
  {
    path: '/writteExam',
    element: lazyLoad('examPage', 'weitte')
  },
  {
    path: '/testOver',
    element: lazyLoad('testOver')
  },
  {
    path: '/video',
    element: lazyLoad('video')
  }
]



export default routes