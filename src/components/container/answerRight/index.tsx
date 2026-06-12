import './index.scss';
import ScoreLie from '@/components/basic/scoreLie';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import stores from '@/stores';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { getAnswerList } from '@/api/studentAnswer';

// 轻量 HTML 白名单清洗
function sanitizeHtml(input: string) {
  if (!input) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    const allowedTags = new Set(['b', 'strong', 'i', 'em', 'u', 'p', 'br', 'ul', 'ol', 'li', 'span']);
    const blockedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);
    blockedTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });
    doc.body.querySelectorAll('*').forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const textNode = doc.createTextNode(el.textContent || '');
        el.replaceWith(textNode);
        return;
      }
      Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
    });
    return doc.body.innerHTML;
  } catch {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
}

// 表格列配置（增加“得分”列）
const columns: TableProps<{
  key: string;
  moduleNumber: number;
  module: string;
  answer: string;
  isCorrect: number;
  studentAnswer: string;
  score: number;
}>['columns'] = [
    {
      title: '题号',
      dataIndex: 'moduleNumber',
      key: 'moduleNumber',
      width: 80,
      render: (num) => <strong>{num}</strong>
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 80,
      render: (module) => {
        const color = module === '听力' ? 'geekblue' : module === '阅读' ? 'green' : 'gold';
        return <Tag color={color}>{module}</Tag>;
      }
    },
    {
      title: '正确答案',
      key: '正确答案',
      render: (_, record) => (
        <div
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px', whiteSpace: 'nowrap' }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(record.answer) }}
        />
      ),
    },
    {
      title: '作答情况',
      key: '作答情况',
      width: 120,
      render: (_, { isCorrect }) => (
        <Tag color={isCorrect === 1 ? 'green' : 'volcano'}>
          {isCorrect === 1 ? '正确' : '错误'}
        </Tag>
      ),
    },
    {
      title: '我的答案',
      key: '我的答案',
      render: (_, record) => (
        <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px', whiteSpace: 'nowrap' }}>
          {record.studentAnswer || '未作答'}
        </p>
      ),
    }
  ];

const AnswerRight = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAnswerData = async () => {
    setLoading(true);
    try {
      const answerRes = await getAnswerList(1, 100, {
        paperId: stores.ExamStore.paperId,
        studentId: stores.UserStore.userId,
      });
      let items = answerRes?.response?.pageResult?.items || [];
      if (!items.length) {
        setTableData([]);
        setTotal(0);
        return;
      }

      // 1. 按 questionId 分组，每个分组内按 prefix 升序排序
      const groupedByQuestion: Record<number, any[]> = {};
      for (const item of items) {
        if (!groupedByQuestion[item.questionId]) groupedByQuestion[item.questionId] = [];
        groupedByQuestion[item.questionId].push(item);
      }
      for (const qid in groupedByQuestion) {
        groupedByQuestion[qid].sort((a, b) => {
          const pa = a.prefix !== undefined && a.prefix !== null && a.prefix !== '' ? Number(a.prefix) : 0;
          const pb = b.prefix !== undefined && b.prefix !== null && b.prefix !== '' ? Number(b.prefix) : 0;
          return pa - pb;
        });
      }

      // 2. 按原始 items 中每个 questionId 首次出现的顺序，将分组后的数据拼接
      const seenQids = new Set<number>();
      const sortedItems: any[] = [];
      for (const item of items) {
        if (!seenQids.has(item.questionId)) {
          seenQids.add(item.questionId);
          const group = groupedByQuestion[item.questionId] || [];
          sortedItems.push(...group);
        }
      }

      // 3. 先对每个题目进行拆分（双选题拆成子题），暂不分配模块
      const allSubItems: any[] = [];
      for (let idx = 0; idx < sortedItems.length; idx++) {
        const item = sortedItems[idx];
        const qType = item.questionType;
        const studentAns = item.studentAnswer;
        const correctAns = item.correctAnswer;
        const originalScore = item.score || 0;

        if (qType === 2) {
          // 双选题：拆分正确答案和学生答案（按逗号）
          const correctOptions = correctAns ? correctAns.split(',').map(s => s.trim()) : [];
          const studentOptions = studentAns && studentAns !== '' ? studentAns.split(',').map(s => s.trim()) : [];
          const perScore = originalScore / correctOptions.length; // 平均分配每题分数
          correctOptions.forEach((correctOpt, optIdx) => {
            const studentOpt = studentOptions[optIdx] || '未作答';
            const isOptionCorrect = (studentOpt === correctOpt) ? 1 : 0;
            const optionScore = isOptionCorrect === 1 ? perScore : 0;
            allSubItems.push({
              ...item,
              studentAnswer: studentOpt,
              correctAnswer: correctOpt,
              isCorrect: isOptionCorrect,
              score: optionScore,
              subKey: `${item.questionId}-${item.prefix || ''}-${optIdx}`,
            });
          });
        } else {
          // 其他类型（单选、填空、写作等）直接保留
          allSubItems.push({
            ...item,
            studentAnswer: studentAns || '未作答',
            correctAnswer: correctAns,
            isCorrect: item.isCorrect,
            score: originalScore,
            subKey: `${item.questionId}-${item.prefix || ''}`,
          });
        }
      }

      // 4. 根据 allSubItems 的总顺序分配模块：前40 -> 听力，接着40 -> 阅读，剩余 -> 写作
      const totalSubItems = allSubItems.length - 2;
      const moduleForIndex: ('听力' | '阅读')[] = [];
      for (let i = 0; i < totalSubItems; i++) {
        if (i < 40) moduleForIndex.push('听力');
        else if (i < 80) moduleForIndex.push('阅读');
        // else moduleForIndex.push('写作');
      }
      // console.log(allSubItems)
      // 5. 给每个子项添加模块
      const itemsWithModule = allSubItems.slice(0, 80).map((item, idx) => ({
        ...item,
        module: moduleForIndex[idx],
      }));

      // 6. 每个模块内重新编号（从1开始）
      const finalData: any[] = [];
      const moduleCounter = { 听力: 0, 阅读: 0 };
      for (const item of itemsWithModule) {
        const mod = item.module;
        moduleCounter[mod]++;
        finalData.push({
          key: `${item.subKey}-${Date.now()}-${Math.random()}`,
          moduleNumber: moduleCounter[mod],
          module: mod,
          answer: item.correctAnswer,
          isCorrect: item.isCorrect,
          studentAnswer: item.studentAnswer,
          score: item.score,
        });
      }

      setTableData(finalData);
      setTotal(finalData.length);
    } catch (error) {
      console.error('加载答案数据失败:', error);
      setTableData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const getPagedData = () => {
    const start = (currentPage - 1) * pageSize;
    return tableData.slice(start, start + pageSize);
  };

  useEffect(() => {
    if (stores.ExamStore.paperId && stores.UserStore.userId) {
      fetchAnswerData();
    }
  }, [stores.ExamStore.paperId, stores.UserStore.userId]);



  return (
    <div className="anrt">
      <div className="anrtHead">
        <button className="act">我的答案</button>
      </div>
      <div className="anrtContent">
        <ScoreLie tableData={tableData} />
        <div style={{ marginTop: 16 }}>
          <p style={{ textAlign: 'left', fontSize: '16px', fontWeight: '600', marginBottom: 8 }}>
            答题情况（共 {total} 题）
          </p>
          <Table
            size="small"
            columns={columns}
            dataSource={getPagedData()}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 5);
              },
            }}
            rowKey="key"
            bordered
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default observer(AnswerRight);