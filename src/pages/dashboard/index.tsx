
import './index.scss';
import { Button, Card } from 'antd';
import { useNavigate } from "react-router";
import { getAdminExam, isCompleted } from "@/api/examPaper";
import { useEffect, useState } from 'react';
import stores from '@/stores';

const { Meta } = Card;

const Dashboard = () => {
  const [ examList, setExamList ] = useState([]);
  const [ isCompletedList, setIsCompletedList ] = useState([]);
  const navigate = useNavigate();

  const getExamList = async() => {
    const res = await getAdminExam();
    console.log(res);
    //@ts-ignore
    setExamList(res.response);
  }

  const fetchisCompleted = async(id: number) => {
    const res = await isCompleted(id);
    //@ts-ignore
    setIsCompletedList(res.response.items.map((item: any) => item.examPaperId));
  }

  useEffect(() => {
    try {
      getExamList()
      fetchisCompleted(stores.UserStore.userId);
    } catch (error) {
      console.log(error);
    }
  },[])

  const handleConfirmExam = async(id: number) => {
    window.open(`/video?id=${id}`, '_blank');

    // 请求全屏
    // const requestFullscreen = () => {
    //   const element = document.documentElement; // 或者指定某个元素
    //   if (element.requestFullscreen) {
    //     element.requestFullscreen();
    //   }
    // };

    // requestFullscreen();
  }

  const handleSreachTestResult = (id: number) => { 
    stores.ExamStore.changePaperId(id)
    navigate('/testOver');
  }
  
  return (
    <div>
      <div className="app-item-contain appContent">
        <h3 className="index-title-h3">试卷中心</h3>
        <div style= {{paddingLeft: '15px' , display: 'flex'}}>
          {examList.map((item: any) => {
            return (
              <Card
              hoverable
              style={{ width: 240 }}
              key={item.id}
            >
              <Meta title={item.name} />
              <p>考试时间：2025.04.08 9:00 ~ 12:00</p>
              <Button 
                type="primary" 
                // disabled={isCompletedList.includes(item.id as never)} 
                onClick={() => handleConfirmExam(item.id)}>
                前往考试
              </Button>
              <Button 
                type="primary" 
                disabled={!isCompletedList.includes(item.id as never)}  
                style={{marginLeft: '12px'}} 
                onClick={() => handleSreachTestResult(item.id)} >
                查看结果
              </Button>
            </Card>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;