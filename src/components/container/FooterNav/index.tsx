import './index.scss';

import { Button, Space } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import store from '@/stores';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';

type pageType = {
  title: string;
  headTitleExpain: string;
  questionArr: number[];
  maxNum: number;
}

type propType = {
  type: string;
};

function footerNav(props: propType) {
  const { type } = props;

  const exam = type === 'listen' 
    ? (store.ExamStore.getListenExam())
    : type === 'read' 
    ? (store.ExamStore.getReadExam())
    : (store.ExamStore.getWritteExam());
  let currentPage = store.ExamStore.currentExamIndex;

  const [curren, setCurren] = useState(currentPage - 1);

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
  const initialPageArr = exam.map((part, index) => {
    let allLen = 0;
    for(let i = 0; i < part.questionItems.length; i++) {
      const len = part.questionItems[i].correctArray ? part.questionItems[i].correctArray.length : 1;
      allLen += len;
    }
    //@ts-ignore
    const {questionArr, currLen} = getQuestionArr(
      prevLen, 
      allLen
    );
    prevLen = currLen;
    
    let writteTitle = '';
    if(type === 'writte') {
      if(index == 0) 
        writteTitle = 'You should spend about 20 minutes on this task. Write at least 150 words.'
      else 
        writteTitle = 'You should spend about 40 minutes on this task. Write at least 250 words.'
    }
    let headTitleExpain = type === 'listen'
      ? ` Questions ${prevLen - allLen + 1} - ${prevLen}`
      : type === 'read'
      ? ` Read the passage below and answer questions ${prevLen - allLen + 1} - ${prevLen}`
      : type === 'writte'
      ? `${writteTitle}`
      : '';
    return {
      title: `Part${index + 1}`,
      headTitleExpain,
      questionArr: questionArr,
      maxNum: currLen
    };
  })

  const [PageArr, setPageArr] = useState<Array<pageType>>([]);

  const handleChangeTitle = (curren: number) => {
    for(let page of PageArr){
      if(page.maxNum >= curren){
        store.ExamStore.changeCurrentTitle(page.title);
        store.ExamStore.changeTitleExpain(page.headTitleExpain);
        break;
      };
    };
  };

  useEffect(() => {
    setPageArr(initialPageArr);
    setCurren(store.ExamStore.currentExamIndex);
    store.ExamStore.changeCurrentTitle(initialPageArr[0].title);
    store.ExamStore.changeTitleExpain(initialPageArr[0].headTitleExpain);
  },[]);

  const activeAction = (e: any) => {
    if(e.target.tagName == 'UL' || e.target.tagName == 'LI') return;
    store.ExamStore.changeCurrent(+e.target.innerHTML);
    setCurren(store.ExamStore.currentExamIndex);
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

  const [correctAnswers, setCorrectAnswers] = useState(store.ExamStore.correctListenAnswer);

  useEffect(() => {
    const dispose = reaction(
      () => store.ExamStore.correctListenAnswer.slice(),
      (correctListenAnswer) => {
        setCorrectAnswers(correctListenAnswer);
      }
    );

    // 清理 reaction
    return () => dispose();
  }, []);

  return (
    <div className='nav'>
      <div className='paginaction'>
        {
          PageArr.map((item, index) => (
            <ul style={{display: 'flex'}} onClick={activeAction} key={index}>
              {item.title}
              {item.questionArr.map((e, i) => (
                <li key={e} >
                <button 
                  style={e == curren ? { backgroundColor: 'rgba(89, 174, 227, 0.931)' } : {}}
                  className={`${correctAnswers.includes(e) ? 'selectedAnswer' : ''} `}
                >
                  {e}
                </button>
              </li>
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
          style={{fontSize: '32px'}}
          />
          }
          disabled = {curren == initialPageArr[initialPageArr.length-1].maxNum}
          onClick={() => handleArrowAction('right')}
          ></Button>
        </Space>
      </div>
    </div>
  )
};

export default observer(footerNav);