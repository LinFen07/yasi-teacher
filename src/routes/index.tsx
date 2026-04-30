
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Login from '@/pages/Login';
import Layout from "@/layout";
import Dashboard from "@/pages/dashboard";
import stores from "@/stores";
import type { Router } from "@/typings/router";
import Video from "@/pages/video";
const ExamPage = lazy(() => import('@/pages/examPage'));
const TextOver = lazy(() => import('@/pages/testOver'));

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
      },
      {
        path: '',
        element: <Dashboard/>
      }
    ]
  },
  {
    path: '/listeningExam',
    element: <ExamPage type="listen" />
  },
  {
    path: '/readnExam',
    element: <ExamPage type="read" />
  },
  {
    path: '/writteExam',
    element: <ExamPage type="writte" />
  },
  {
    path: '/testOver',
    element: <TextOver/>
  },
  {
    path: '/video',
    element: <Video />
  }
]

export default routes
