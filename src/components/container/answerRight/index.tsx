import './index.scss';
import ScoreLie from '@/components/basic/scoreLie';
import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import stores from '@/stores';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { getAnswerList } from '@/api/studentAnswer';

interface DataType {
  key: string;
  questionId: number;
  answer: string;
  isCorrect: number;
  studentAnswer: string;
  score: number;
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: '题目',
    dataIndex: 'questionId',
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
    render: (_, { isCorrect }) => (
      <Tag color={isCorrect === 1 ? 'green' : 'volcano'} key={isCorrect}>
        {isCorrect === 1 ? 'TRUE' : 'FALSE'}
      </Tag>
    ),
  },
  {
    title: '我的答案',
    key: '我的答案',
    render: (_, record) => (
      <Space size="middle">
        <p
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '120px',
            whiteSpace: 'nowrap',
          }}
        >
          {record.studentAnswer}
        </p>
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
  const [data, setData] = useState<DataType[]>([]);
  const [totalData, setTotalData] = useState<DataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [pageSize, setPageSize] = useState(5); // 每页显示的条数
  const [total, setTotal] = useState(0); // 总题目数

  const AnsewerData = {
    paperId: stores.ExamStore.paperId,
    studentId: stores.UserStore.userId,
  };

  async function fetchAnswerList() {
    const res = await getAnswerList(1, 75, AnsewerData);
    //@ts-ignore
    setTotal(res.response.counts); // 设置总题目数
    
    setTotalData(
      //@ts-ignore
      res.response.items.map((item: any, index: number) => ({
        key: item.id,
        questionId: item.questionId,
        isCorrect: item.isCorrect,
        studentAnswer: item.studentAnswer,
        score: item.score,
        answer: stores.AnswerStore.correct[index].correct,
      }))
    );
  }

  const changePageData = () => {
    setData(totalData.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  }

  useEffect(() => {
    fetchAnswerList();
  },[])

  useEffect(() => {
    changePageData();
  }, [currentPage, pageSize, totalData]);

  return (
    <div className="anrt">
      <div className="anrtHead">
        <button className="act">我的答案</button>
        {/* <button>答案解析</button> */}
      </div>
      <div className="anrtContent">
        <ScoreLie />
        <div>
          <p
            style={{
              textAlign: 'left',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            答题情况
          </p>
          <div>
            <Table<DataType>
              size="small"
              columns={columns}
              dataSource={data}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true, // 允许用户调整每页显示条数
                onChange: (page, pageSize) => {
                  setCurrentPage(page); // 更新当前页码
                  setPageSize(pageSize); // 更新每页显示条数
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default observer(AnswerRight);