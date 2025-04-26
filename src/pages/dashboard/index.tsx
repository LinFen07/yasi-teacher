
import './index.scss';
import { Button, Card } from 'antd';
import { useNavigate } from "react-router";
import { select, getAdminExam } from "@/api/examPaper";
import stores from '@/stores';
import { useEffect, useState } from 'react';

const { Meta } = Card;

const Dashboard = () => {
  const navigate = useNavigate()
  const [ examList, setExamList ] = useState([]);
  const getExamList = async() => {
    const res = await getAdminExam();
    //@ts-ignore
    setExamList(res.response);
  }

  useEffect(() => {
    getExamList()
  },[])

  const handleConfirmExam = async(id: number) => {
    stores.ExamStore.changePaperId(id);
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
              <p>总题目·15</p>
              <Button type="primary" onClick={() => handleConfirmExam(item.id)}>
                前往考试
              </Button>
              <Button type="primary" disabled style={{marginLeft: '12px'}} onClick={() => handleConfirmExam(item.id)} >
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