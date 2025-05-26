
import './index.scss';
import { Button, Card } from 'antd';
import { useNavigate } from "react-router";
import { getExam } from "@/api/examPaper";
import { useEffect, useState } from 'react';
import stores from '@/stores';
import { getStudentId } from '@/api/login';

const { Meta } = Card;

const Dashboard = () => {
  const [ examList, setExamList ] = useState([]);
  const navigate = useNavigate();

  const getTime = (time: string) => {
    const t = new Date(time).getTime();
    const current = new Date().getTime();
    return current > t;
  }

  const getExamList = async() => {
    const res = await getExam(stores.UserStore.userId);
    console.log(res);
    //@ts-ignore
    setExamList(res.response.items);
  }

  const fetchGetStudentId = async() => {
    const res = await getStudentId(stores.UserStore.name);
    // @ts-ignore
    stores.UserStore.setUserId(res.response.value);
  }

  useEffect(() => {
    try {
      fetchGetStudentId()
    } catch (error) {
      console.log(error);
    }
  },[])

  useEffect(() => {
    try {
      getExamList();
    } catch (error) {
      console.log(error);
    }
  },[stores.UserStore.userId])

  const handleConfirmExam = async(id: number) => {
    window.open(`/video?id=${id}&type=listen`, '_blank');

    // 请求全屏
    // const requestFullscreen = () => {
    //   const element = document.documentElement; // 或者指定某个元素
    //   if (element.requestFullscreen) {
    //     element.requestFullscreen();
    //   }
    // };

    // requestFullscreen();
  }

  const handleSreachTestResult = (id: number, isAppraise: number, appraise: string) => { 
    stores.ExamStore.changePaperId(id);
    if (isAppraise) stores.AnswerStore.appraise = appraise;
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
              key={item.examPaperId}
            >
              <Meta title={item.examPaperName} />
              <p>考试时间：{item.startTime} ~ </p>
              <p>{item.endTime}</p>
              <Button 
                type="primary" 
                disabled={getTime(item.endTime)} 
                onClick={() => handleConfirmExam(item.examPaperId)}>
                前往考试
              </Button>
              <Button 
                type="primary" 
                // disabled={!getTime(item.endTime)} 
                style={{marginLeft: '12px'}} 
                onClick={() => handleSreachTestResult(item.examPaperId, item.isAppraise, item.appraise)} >
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