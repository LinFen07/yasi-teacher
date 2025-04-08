
import './index.scss';
import ScoreLie from '@/components/basic/scoreLie';

import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import stores from '@/stores';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';

interface DataType {
  key: string;
  question: number;
  answer: string;
  tag: string;
  myAn: string;
  score: string;
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: '题目',
    dataIndex: 'question',
    key: '题目',
  },
  {
    title: '正确答案',
    dataIndex: 'answer',
    key: '正确答案',
  },
  {
    title: '作答情况',
    key: '作答情况',
    dataIndex: 'tags',
    render: (_, { tag }) => (

      <Tag color={tag === 'true' ? 'green' : 'volcano'} key={tag}>
        {tag.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: '我的答案',
    key: '我的答案',
    render: (_, record) => (
      <Space size="middle">
        <p>{record.myAn}</p>
      </Space>
    ),
  },
  {
    title: '得分',
    key: '得分',
    dataIndex: 'score',
    render: (_, record) => (
      <Space size="middle">
        <p>{record.score}</p>
      </Space>
    ),
  },
];

 function AnswerRight() {
  const [data, setData] = useState<DataType[]>(stores.ExamStore.correctListen);

  useEffect(() => {
    let tag = stores.ExamStore.getScoreTag();
    if(tag == '听力报告') setData(stores.ExamStore.correctListen);
    else setData(stores.ExamStore.correctRead);
  }, [stores.ExamStore.scoreTag]);

  const changeAn = (e: any) => {
    if (e.target.tagName === 'DIV') return;
    let btns = document.getElementsByClassName('anrtHead')[0].getElementsByTagName('button');
    for (let i = 0; i < btns.length; i++) {
      btns[i].classList.remove('act');
    }
    e.target.classList.add('act');
  }

  return (
    <div className='anrt'>
      <div className='anrtHead' onClick={changeAn}>
        <button className='act'>我的答案</button>
        {/* <button>答案解析</button> */}
      </div>
      <div className='anrtContent'>
        <ScoreLie />
        <div>
          <p style={{textAlign:'left',fontSize:'16px',fontWeight:'600' }}>答题情况</p>
          <div>
            <Table<DataType>  size='small' columns={columns} dataSource={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default observer(AnswerRight);