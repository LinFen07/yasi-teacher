
import './index.scss';
import ScoreLie from '../scoreLie';


import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';

interface DataType {
  key: string;
  question: number;
  answer: string;
  tag: string;
  myAn: string;
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
];

const data: DataType[] = [
  {
    key: '1',
    question: 1,
    answer: 'A',
    tag: 'true',
    myAn: 'A'
  },
  {
    key: '2',
    question: 2,
    answer: 'B',
    tag: 'false',
    myAn: 'A'
  },
  {
    key: '3',
    question: 3,
    answer: 'A',
    tag: 'true',
    myAn: 'A'
  },
];

export default function AnswerRight() {

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