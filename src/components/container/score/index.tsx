import './index.scss'
import stores from '@/stores';
import { observer } from 'mobx-react';
import { getAnswerList } from '@/api/studentAnswer';
import { useEffect, useState } from 'react';

function Score() {
  const [totalData, setTotal] = useState({
    listenTrueCount: 0,
    readTrueCount: 0,
    listenTotalSorce: 0,
    readTotalSorce: 0
  })
  const data = stores.AnswerStore.tableData
  useEffect(() => {
    let listenTotalSorce = 0;
    let readTotalSorce = 0;
    let listenTrueCount = 0;
    let readTrueCount = 0;

    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.module === '听力' && item.isCorrect === 1) {
          listenTrueCount++;
          // console.log(item.score)
          listenTotalSorce += item.score || 0;
        } else if (item.module === '阅读' && item.isCorrect === 1) {
          readTrueCount++;
          readTotalSorce += item.score || 0;
        }
      });
    }
    setTotal({
      listenTrueCount,
      readTrueCount,
      listenTotalSorce,
      readTotalSorce
    });
  }, [stores.AnswerStore.tableData])

  // 计算正确率
  const listenAccuracy = totalData.listenTrueCount > 0 ?
    ((totalData.listenTrueCount / 40) * 100).toFixed(1) : 0;
  const readAccuracy = totalData.readTrueCount > 0 ?
    ((totalData.readTrueCount / 40) * 100).toFixed(1) : 0;

  return (
    <div className='contentHead'>
      {/* <div className='lt'>
        <h3 style={{ fontSize: '20px' }}>你的模考分数</h3>
        <ul style={{ display: 'flex' }}>
          <li className='box'>
            <p>听力</p>
            <p>{totalData.listenTotalSorce}</p>
          </li>
          <li className='box'>
            <p>阅读</p>
            <p>{totalData.readTotalSorce}</p>
          </li>
          <li className='box'>
            <p>写作</p>
            <p>待批阅</p>
          </li>
        </ul>
        <ul>
          <button className='btn active'>考试报告</button>
        </ul>
      </div> */}
      <div className='rt'>
        <h3 style={{ fontSize: '20px' }}>你的正确率</h3>
        <ul>
          <div className='rtBox'>
            <p>听力</p>
            <p>正确率 {listenAccuracy}%</p>
            <p>正确数量 {totalData.listenTrueCount}/40</p>
          </div>
          <div className='rtBox'>
            <p>阅读</p>
            <p>正确率 {readAccuracy}%</p>
            <p>正确数量 {totalData.readTrueCount}/40</p>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default observer(Score)