import Layout from "../pages/Layout";
import Login from "../pages/Login";
import Evaluation from "../pages/Evaluation";
import Home from "../pages/Home"
import { createBrowserRouter, Navigate } from 'react-router-dom'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/home" replace />
            },
            {
                path: '/home',
                element: <Home />
            },
            {
                path: '/evaluation',
                element: <Evaluation />
            }
        ]
    },
    {
        path: '/login',
        element: <Login />
    }
])

export default router