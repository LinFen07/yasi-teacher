import { useEffect, useState } from 'react';
import TurndownService from 'turndown';
import { Table } from 'antd';
import { ExamType } from '@/typings/exam';
import './index.scss';
import { computedTickPrevCount } from '@/utils/computedPrevCount';
import stores from '@/stores';
import { runInAction } from 'mobx';

interface RecordType {
  key: number;
  question: string;
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  E?: string;
  F?: string;
  G?: string;
  H?: string;
  I?: string;
}

export default function tickQuestion(questionArr: ExamType) {
  const PrevCount = computedTickPrevCount(stores.ExamStore.currentExamTitle, stores.ExamStore.currentExam)
  const parseMarkdownToTableData = (markdown: string) => {
    const rows = markdown.trim().split('\n');
    const questionTitle = rows[2];
    const urlPattern = /(http?:\/\/[^\s]+)/g;
    const png = rows[0].match(urlPattern) as string[];
    const tableData: RecordType[] = [];
    let tickPrevCount = PrevCount;

    rows.forEach((row, index) => {
      const match = row.match(/^(\d+\.)(.+)$/gm);
      if (match) {
        tickPrevCount++;
        tableData.push({
          key: tickPrevCount,
          question: match[0].replace(/\s*\d+\s*$/, ''),
        });
      }
    });

    return {
      png,
      tableData,
      questionTitle,
    };
  };

  const columns = [
    {
      title: '',
      dataIndex: 'question',
      key: 'question',
      width: 290,
      render: (text: any) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'A',
      dataIndex: 'A',
      key: 'A',
      width: 70,
      editable: true,
    },
    {
      title: 'B',
      dataIndex: 'B',
      key: 'B',
      width: 70,
      editable: true,
    },
    {
      title: 'C',
      dataIndex: 'C',
      key: 'C',
      width: 70,
      editable: true,
    },
    {
      title: 'D',
      dataIndex: 'D',
      key: 'D',
      width: 70,
      editable: true,
    },
    {
      title: 'E',
      dataIndex: 'E',
      key: 'E',
      width: 70,
      editable: true,
    },
    {
      title: 'F',
      dataIndex: 'F',
      key: 'F',
      width: 70,
      editable: true,
    },
    {
      title: 'G',
      dataIndex: 'G',
      key: 'G',
      width: 70,
      editable: true,
    },
    {
      title: 'H',
      dataIndex: 'H',
      key: 'H',
      width: 70,
      editable: true,
    },
    {
      title: 'I',
      dataIndex: 'I',
      key: 'I',
      width: 70,
      editable: true,
    },
  ];

  const turndownService = new TurndownService();
  const markdown = turndownService.turndown(questionArr.title);
  const { tableData, png, questionTitle } = parseMarkdownToTableData(markdown);
  const [ studentAnswers, setStudentAnswers ] = useState<string[]>(stores.AnswerStore.tickAnswers);
  const [dataSource, setDataSource] = useState<RecordType[]>(() => {
    return tableData.map((item, index) => {
      const answer = studentAnswers[index];
      if (answer) {
        return {
          ...item,
          [answer]: '√',
        };
      }
      return item;
    });
  });
  
  useEffect(() => {
    return () => {
      console.log(stores.AnswerStore.tickAnswers.toString());
    }
  },[])

  const handleCellClick = (record: RecordType, dataIndex: string) => {
    stores.ExamStore.changeCurrent(record.key);
    setStudentAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[record.key - PrevCount - 1] = dataIndex;
      stores.AnswerStore.tickAnswers = [...newAnswers]
      return newAnswers;
    });
    const newData = dataSource.map((item) => {
      if (item.key === record.key) {
        // 清除同一行的所有选项
        const updatedItem = {
          ...item,
          A: undefined,
          B: undefined,
          C: undefined,
          D: undefined,
          E: undefined,
          F: undefined,
          G: undefined,
          H: undefined,
          I: undefined,
        };
        // 设置点击的选项为“√”
        return {
          ...updatedItem,
          [dataIndex]: '√',
        };
      }
      return item;
    });
    setDataSource(newData);
    runInAction(() => {
      stores.ExamStore.correctListenAnswer.push(record.key);
    });
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: RecordType) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        onClick: () => handleCellClick(record, col.dataIndex),
      }),
      render: (text: string) => (text === '√' ? <span className="tick-mark">√</span> : text),
    };
  });

  return (
    <div style={{ marginTop: '20px' }}>
      <div>{questionTitle}</div>
      <div style={{ display: 'flex' }}>
        <img className="tickQuestionImg" src={png[0]?.slice(0, png[0].length - 1)} alt="png" />
        <Table
          className="tickQuestionTable"
          bordered
          dataSource={dataSource}
          columns={mergedColumns}
          size="large"
          rowKey="key"
          pagination={false}
        />
      </div>
    </div>
  );
}