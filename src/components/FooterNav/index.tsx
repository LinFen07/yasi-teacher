import './index.scss';

import { Button, Space } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

import store from '@/stores';
import { useEffect, useState } from 'react';

type pageType = {
  title: string;
  questionArr: number[];
  maxNum: number;
}

type propType = {
  type: string;
};

export default function footerNav(props: propType) {
  const { type } = props;
  const exam = type === 'listen' 
    ? (store.ExamStore.getListenExam())
    : type === 'read' 
    ? (store.ExamStore.getReadExam())
    : (store.ExamStore.getWritteExam());
  let currentPage = store.ExamStore.currentExamIndex;

  const [curren, setCurren] = useState(currentPage);

  const getQuestionArr = (prevLen:number, len: number) => {
    const questionArr = [];
    let currLen = prevLen + len;
    for(let i = prevLen; i < currLen; i++) {
      questionArr.push(i + 1);
    };
    return {
      questionArr,
      currLen
    };
  };

  let prevLen = 0
  const initialPageArr = type === 'listen'
    ? (exam.map((part, index) => {
        //@ts-ignore
        const {questionArr, currLen} = getQuestionArr(prevLen, part.correctArray ? part.correctArray.length : 1);
        prevLen = currLen;
        return {
          title: `Part${index + 1}:`,
          questionArr: questionArr,
          maxNum: currLen
        };
      }))
    : type === 'read' 
    ? (exam.map((item, index) => {
      //@ts-ignore
      const {questionArr, currLen} = getQuestionArr(prevLen, item.questions.length);
        prevLen = currLen;
        return {
          title: `Part${index + 1}:`,
          questionArr: questionArr,
          maxNum: currLen
        }
    }))
    : (exam.map((item,index) => {
      return {
        title: `Part${index + 1}:`,
          questionArr: [index + 1],
          maxNum: index + 1
      }
    }));

  const [PageArr, setPageArr] = useState<Array<pageType>>([]);

  useEffect(() => {
    setPageArr(initialPageArr);
  },[]);

  const handleChangeTitle = (curren: number) => {
    for(let page of PageArr){
      if(page.maxNum >= curren){
        store.ExamStore.changeCurrentTitle(page.title);
        break;
      };
    };
  };

  const activeAction = (e: any) => {
    if(e.target.tagName == 'UL' || e.target.tagName == 'LI') return;
    setCurren(+e.target.innerHTML);
    store.ExamStore.changeCurrent(+e.target.innerHTML);
    handleChangeTitle(+e.target.innerHTML);
  };

  const handleArrowAction = (arrow: string) => {
    if(arrow == 'left') {
      setCurren(curren - 1);
      store.ExamStore.changeCurrent(curren - 1);
      handleChangeTitle(curren - 1);
    } else if(arrow == 'right') {
      setCurren(curren + 1);
      store.ExamStore.changeCurrent(curren + 1);
      handleChangeTitle(curren + 1);
    }
  };

  return (
    <div className='nav'>
      <div className='paginaction'>
        {
          PageArr.map((item, index) => (
            <ul style={{display: 'flex'}} onClick={activeAction} key={index}>
              {item.title}
              {item.questionArr.map((e, i) => (
                <li key={e} ><button className={e == curren ? 'active' : ''}>{e}</button></li>
              ))}
            </ul>
          ))
        }
      </div>
      <div className='footerRight'>
        <Space>
          <Button 
          size='large' 
          className='navButton' 
          icon={<ArrowLeftOutlined 
            style={{fontSize: '32px'}}/>
          }
          onClick={() => handleArrowAction('left')}
          disabled = {curren == 1}
          ></Button>
          <Button 
          size='large' 
          className='navButton' 
          icon={<ArrowRightOutlined 
          style={{fontSize: '32px'}}/>
          }
          onClick={() => handleArrowAction('right')}
          ></Button>
        </Space>
      </div>
    </div>
  )
};