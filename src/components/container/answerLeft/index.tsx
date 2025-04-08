import './index.scss';
import stores from '@/stores';
import { useEffect, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import { observer } from 'mobx-react'

const AnswerLeft = observer(() => {

  // const [exam, setExam] = useState(stores.ExamStore.getListenExam());
  // const [read, setRead] = useState(stores.ExamStore.getReadExam());
  // const [writte, setWritte] = useState(stores.ExamStore.getWritteExam());
  // const [AnswwerId, setAnswwerId] = useState(0);
  // const [scoreTag, setScoreTag] = useState(stores.ExamStore.scoreTag);
  // useEffect(() => {
  //   setScoreTag(stores.ExamStore.scoreTag);
  // },[stores.ExamStore.scoreTag]);

  // useEffect(() => {
  //   // 更新相关状态
  //   setAnswwerId(0);
  // }, [scoreTag]);

  // const changeAn = (e: any) => {
  //   if(e.target.tagName === 'DIV') return;
  //   let btns = document.getElementsByClassName('anltHead')[0].getElementsByTagName('button');
  //   for (let i = 0; i < btns.length; i++) {
  //     btns[i].classList.remove('act');
  //   }
  //   e.target.classList.add('act');

  //   let index = e.target.innerText.split(' ')[1];
  //   setAnswwerId(index - 1);
  // }

  return (
    <div className='anlt'>
      <div className='anltContent'>待批阅</div>
      {/* {
        scoreTag === '听力报告' 
        ? (
          <>
          <div className='anltHead' onClick={changeAn}>
            {
              exam.map((item, index) => (
                <button key={index} className={index === 0 ? 'act' : ''}>{'Part ' + (index += 1)}</button>
              ))
            }
          </div>
          <div className='anltContent'>待批阅</div>
          </>
        )
        : scoreTag === '阅读报告' ? (
          <>
          <div className='anltHead' onClick={changeAn}>
            {
              read.map((item, index) => (
                <button key={index} className={index === 0 ? 'act' : ''}>{'Part ' + (index += 1)}</button>
              ))
            }
          </div>
          <div className='anltContent'>待批阅</div>
          </>
        )
        : scoreTag === '写作报告' ? (
          <>
          <div className='anltHead' onClick={changeAn}>
            {
              writte.map((item, index) => (
                <button key={index} className={index === 0 ? 'act' : ''}>{'Part ' + (index += 1)}</button>
              ))
            }
          </div>
          <div className='anltContent'>待批阅</div>
          </>
        )
        : (<></>)
      } */}
    </div>
  )
})

export default AnswerLeft;