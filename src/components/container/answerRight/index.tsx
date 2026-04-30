import './index.scss';
import ScoreLie from '@/components/basic/scoreLie';
import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import stores from '@/stores';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { getAnswerList } from '@/api/studentAnswer';
import { select as getExamPaper } from '@/api/examPaper';
import { parse } from 'path';

// 类型定义：题号映射信息
interface QuestionMapping {
  key: string; // 唯一标识（questionId + 小题索引）
  questionId: number; // 原题ID
  subQuestionIndex: number; // 小题索引（0开始，用于多空题）
  globalNumber: number; // 全局题号（整个试卷的顺序）
  moduleNumber: number; // 模块内题号（每个模块从1开始）
  moduleType: '听力' | '阅读' | '写作'; // 模块类型
}

// 轻量 HTML 白名单清洗，移除危险标签与属性
function sanitizeHtml(input: string) {
  if (!input) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');

    const allowedTags = new Set(['b', 'strong', 'i', 'em', 'u', 'p', 'br', 'ul', 'ol', 'li', 'span']);
    const blockedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);

    // 移除不安全标签
    blockedTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    // 清理标签属性
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

// 根据questionId推测模块类型（兜底用）
function guessModuleByQuestionId(questionId: number): '听力' | '阅读' | '写作' | '未知' {
  if (questionId >= 1 && questionId <= 100) return '听力';
  if (questionId >= 101 && questionId <= 200) return '阅读';
  if (questionId >= 201) return '写作';
  return '未知';
}

// 生成完整的题号映射（每个模块独立编号）
function createCompleteQuestionMapping(
  listenExam: any[],
  readExam: any[],
  wirrteExam: any[]
): QuestionMapping[] {
  const mappings: QuestionMapping[] = [];
  let globalNumber = 1;

  // 处理单个模块的题目映射
  const processModule = (moduleExams: any[], moduleType: '听力' | '阅读' | '写作') => {
    let moduleNumber = 1;
    moduleExams.forEach(exam => {
      exam.questionItems?.forEach((questionItem: any) => {
        const questionId = questionItem.id;

        // 判断是否为多选题（既有correct又有correctArray）
        const hasCorrect = questionItem.correct !== null && questionItem.correct !== undefined && questionItem.correct !== '';
        const hasCorrectArray = Array.isArray(questionItem.correctArray) && questionItem.correctArray.length > 0;
        const isMultiChoice = hasCorrect && hasCorrectArray;

        // 判断是否为多空题（只有correctArray）
        const isMultiSub = hasCorrectArray && !hasCorrect;

        if (isMultiSub) {
          // 多空题：每道小题算一题
          questionItem.correctArray.forEach((_: any, subIndex: number) => {
            mappings.push({
              key: `${questionId}-${subIndex}`,
              questionId,
              subQuestionIndex: subIndex,
              globalNumber,
              moduleNumber,
              moduleType
            });
            globalNumber++;
            moduleNumber++;
          });
        } else if (isMultiChoice) {
          questionItem.correctArray.forEach((_: any, subIndex: number) => {
            mappings.push({
              key: `${questionId}-${subIndex}`,
              questionId,
              subQuestionIndex: subIndex,
              globalNumber,
              moduleNumber,
              moduleType
            });
            globalNumber++;
            moduleNumber++;
          });
        } else {
          // 单选题：作为一道题处理
          mappings.push({
            key: `${questionId}-0`,
            questionId,
            subQuestionIndex: 0,
            globalNumber,
            moduleNumber,
            moduleType
          });
          globalNumber++;
          moduleNumber++;
        }
      });
    });
  };

  // 按 听力→阅读→写作 顺序处理
  processModule(listenExam || [], '听力');
  processModule(readExam || [], '阅读');
  processModule(wirrteExam || [], '写作');

  return mappings;
}

// 表格列配置（显示模块内题号）
const columns: TableProps<{
  key: string;
  questionId: number;
  globalNumber: number;
  moduleNumber: number;
  module: string;
  answer: string;
  isCorrect: number;
  studentAnswer: string;
}>['columns'] = [
    {
      title: '题号',
      dataIndex: 'moduleNumber',
      key: 'moduleNumber',
      width: 100,
      render: (num) => <strong>{num}</strong>
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
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
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px', whiteSpace: 'nowrap' }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(record.answer) }}
        />
      ),
    },
    {
      title: '作答情况',
      key: '作答情况',
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
    },
  ];

const AnswerRight = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 创建数据项的辅助函数
  const createDataItem = (
    item: any,
    mappingKey: string,
    index: number,
    questionMappings: QuestionMapping[],
    correctAnswersMap: Map<string, string>,
    score: number,
    studentAnswerOption?: string,
    isCorrectOption?: number
  ) => {
    const mapping = questionMappings.find(m => m.key === mappingKey);
    const questionId = Number(item.questionId);
    const correctAnswer = correctAnswersMap.get(mappingKey);
    return {
      key: `${mappingKey}-${index}-${Date.now()}`,
      mappingKey,
      questionId,
      globalNumber: mapping?.globalNumber,
      moduleNumber: mapping?.moduleNumber,
      module: mapping?.moduleType || guessModuleByQuestionId(questionId),
      isCorrect: isCorrectOption !== undefined ? isCorrectOption : item.isCorrect,
      studentAnswer: studentAnswerOption !== undefined ? studentAnswerOption : (item.studentAnswer || '未作答'),
      answer: correctAnswer || '无正确答案',
      score: score || 0
    };
  };

  // 加载试卷数据（包含三种题型）和答案数据
  const fetchAndProcessData = async () => {
    setLoading(true);
    try {
      // 1. 获取试卷基础数据
      const examRes = await getExamPaper(stores.ExamStore.paperId);
      if (examRes?.code !== 1) {
        throw new Error('获取试卷数据失败');
      }

      // 2. 更新Store中的模块数据
      const { titleItems } = examRes.response;
      stores.ExamStore.addExam(titleItems);

      // 3. 获取学生答案列表
      const answerRes = await getAnswerList(1, 100, {
        paperId: stores.ExamStore.paperId,
        studentId: stores.UserStore.userId,
      });
      const answerItems = answerRes?.response?.pageResult?.items || [];
      // console.log(answerItems)
      // 4. 从Store中获取三种题型数据
      const { listenExam, readExam, wirrteExam } = stores.ExamStore;

      // 5. 生成完整的题号映射
      const questionMappings = createCompleteQuestionMapping(
        listenExam || [],
        readExam || [],
        wirrteExam || []
      );
      // console.log(questionMappings)
      // 6. 构建正确答案映射
      const correctAnswersMap = new Map<string, string>();
      const multiChoiceCorrectArrayMap = new Map<number, string[]>();

      [...(listenExam || []), ...(readExam || []), ...(wirrteExam || [])].forEach(exam => {
        exam.questionItems?.forEach((questionItem: any) => {
          const questionId = questionItem.id;

          // 判断是否为多选题（既有correct又有correctArray）
          const hasCorrect = questionItem.correct !== null && questionItem.correct !== undefined && questionItem.correct !== '';
          const hasCorrectArray = Array.isArray(questionItem.correctArray) && questionItem.correctArray.length > 0;
          const isMultiChoice = hasCorrect && hasCorrectArray;

          // 判断是否为多空题（只有correctArray）
          const isMultiSub = hasCorrectArray && !hasCorrect;

          if (isMultiSub) {
            // 多空题：每道小题的正确答案来自correctArray
            questionItem.correctArray.forEach((correct: string, subIndex: number) => {
              correctAnswersMap.set(`${questionId}-${subIndex}`, correct || '无正确答案');
            });
          } else if (isMultiChoice) {
            multiChoiceCorrectArrayMap.set(questionId, [...questionItem.correctArray]);
            questionItem.correctArray.forEach((correct: any, subIndex: number) => {
              correctAnswersMap.set(`${questionId}-${subIndex}`, typeof correct === 'string' ? correct : JSON.stringify(correct));
            });
          } else {
            // 单选题：正确答案来自correct字段
            correctAnswersMap.set(`${questionId}-0`, questionItem.correct || '无正确答案');
          }
        });
      });

      // 7. 处理答案数据
      const processedData: any[] = [];
      const usedMappingKeys = new Set<string>();
      const questionAnswerCounter = new Map<number, number>();

      // 第一遍：创建答案项与分数的映射
      const answerScoreMap = new Map<string, number>();
      const answerItemMap = new Map<string, any>();

      answerItems.forEach((item: any, index: number) => {
        const questionId = Number(item.questionId);
        const score = item.score || 0;

        // 统计当前题目的已处理数量
        const currentCount = questionAnswerCounter.get(questionId) || 0;
        const mappingKey = `${questionId}-${currentCount}`;

        // 存储分数映射和原始数据
        answerScoreMap.set(mappingKey, score);
        answerItemMap.set(mappingKey, item);

        // 更新计数
        questionAnswerCounter.set(questionId, currentCount + 1);
      });

      // 重置计数器用于后续处理
      questionAnswerCounter.clear();
      // console.log(questionMappings)
      // console.log(answerItems)
      answerItems.forEach((item: any, index: number) => {
        const questionId = Number(item.questionId);
        const studentAnswer = item.studentAnswer || '';
        const isMultiChoice = item.questionType === 2 && studentAnswer.includes(',');

        if (isMultiChoice) {
          const studentOptions = studentAnswer.split(',').map((s: string) => s.trim()).filter((s: string) => s);
          const correctOptions = multiChoiceCorrectArrayMap.get(questionId) || [];

          studentOptions.forEach((option: string, optionIndex: number) => {
            const mappingKey = `${questionId}-${optionIndex}`;
            if (!usedMappingKeys.has(mappingKey)) {
              const correctOption = correctOptions[optionIndex] || '';
              const isCorrectOption = option === correctOption ? 1 : 0;
              processedData.push(createDataItem(
                item,
                mappingKey,
                index,
                questionMappings,
                correctAnswersMap,
                item.score || 0,
                option,
                isCorrectOption
              ));
              usedMappingKeys.add(mappingKey);
              questionAnswerCounter.set(questionId, (questionAnswerCounter.get(questionId) || 0) + 1);
            }
          });
          return;
        }

        // 查找该题目在试卷中的映射
        const potentialMappings = questionMappings.filter(m => m.questionId === questionId);
        if (potentialMappings.length === 0) {
          // 兜底：创建默认映射
          const fallbackKey = `${questionId}-0`;
          if (!usedMappingKeys.has(fallbackKey)) {
            const score = answerScoreMap.get(fallbackKey) || item.score || 0;
            processedData.push(createDataItem(item, fallbackKey, index, questionMappings, correctAnswersMap, score));
            usedMappingKeys.add(fallbackKey);
          }
          return;
        }
        // 确定子题索引
        const currentCount = questionAnswerCounter.get(questionId) || 0;
        let subIndex = 0;

        if (potentialMappings.length > 1) {
          // 多空题：按顺序分配子题索引
          subIndex = currentCount;
          questionAnswerCounter.set(questionId, currentCount + 1);
        } else {
          // 单选题：固定使用子题索引0
          subIndex = 0;
          questionAnswerCounter.set(questionId, 1);
        }

        const mappingKey = `${questionId}-${subIndex}`;
        // console.log(mappingKey)
        // 只添加未使用过的映射键
        if (!usedMappingKeys.has(mappingKey)) {
          const score = answerScoreMap.get(mappingKey) || item.score || 0;
          const currentItem = answerItemMap.get(mappingKey) || item;
          processedData.push(createDataItem(currentItem, mappingKey, index, questionMappings, correctAnswersMap, score));
          usedMappingKeys.add(mappingKey);
        }
      });
      // 8. 排序和去重
      const filteredData = processedData.filter(item => item != null);

      const moduleGroups = filteredData.reduce((groups, item) => {
        const module = item.module || '未知';
        if (!groups[module]) {
          groups[module] = [];
        }
        groups[module].push(item);
        return groups;
      }, {} as Record<string, any[]>);

      // 3. 第三步：对每个模块内的数组，按moduleNumber升序排序
      Object.keys(moduleGroups).forEach(module => {
        moduleGroups[module] = moduleGroups[module].sort((a: any, b: any) => {
          // 仅按模块内题号排序（无需再判断模块，因为已经分组了）
          return a.moduleNumber - b.moduleNumber;
        });
      });

      const moduleOrder = ['听力', '阅读', '写作'];
      const validData = moduleOrder
        // 过滤出存在的模块（避免某模块无数据时添加空数组）
        .filter(module => moduleGroups[module])
        // 把各模块的有序数组合并成最终数组
        .flatMap(module => moduleGroups[module]);
      // 9. 重新验证题号唯一性
      const moduleNumberCheck = new Map<string, number>();
      const finalData = validData.map(item => {
        const moduleKey = `${item.module}-${item.moduleNumber}`;
        if (moduleNumberCheck.has(moduleKey)) {
          // 如果发现重复，重新分配模块内题号
          const newModuleNumber = (moduleNumberCheck.get(moduleKey) || 0) + 1;
          moduleNumberCheck.set(moduleKey, newModuleNumber);
          return {
            ...item,
            moduleNumber: newModuleNumber,
            key: `${item.mappingKey}-${newModuleNumber}-${Date.now()}`
          };
        } else {
          moduleNumberCheck.set(moduleKey, item.moduleNumber);
          return item;
        }
      });

      // 10. 过滤数据：去掉非写作模块中无正确答案的项，但保留所有写作模块
      const filteredData_ = finalData.filter(item => {
        // 如果是写作模块，无论是否有正确答案都保留
        if (item.module === '写作') {
          return true;
        }
        // 非写作模块，只有当有正确答案时才保留
        return item.answer !== '无正确答案';
      });
      // console.log(filteredData_)
      setTableData(filteredData_);
      setTotal(filteredData_.length);

      // 11. 验证题号唯一性（开发环境）
      if (process.env.NODE_ENV === 'development') {
        const duplicateCheck = new Map();
        filteredData_.forEach(item => {
          const key = `${item.module}-${item.moduleNumber}`;
          duplicateCheck.set(key, (duplicateCheck.get(key) || 0) + 1);
        });

        const duplicates = Array.from(duplicateCheck.entries())
          .filter(([_, count]) => count > 1);

        const moduleStats: Record<string, number> = {};
        filteredData.forEach(item => {
          moduleStats[item.module] = (moduleStats[item.module] || 0) + 1;
        });
        // console.log('各模块题数:', moduleStats);
      }

    } catch (error) {
      console.error('加载数据失败:', error);
      setTableData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 分页数据处理
  const getPagedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return tableData.slice(startIndex, startIndex + pageSize);
  };

  // 监听试卷ID和用户ID变化，重新加载数据
  useEffect(() => {
    if (stores.ExamStore.paperId && stores.UserStore.userId) {
      fetchAndProcessData();
    }
  }, [stores.ExamStore.paperId, stores.UserStore.userId]);

  useEffect(() => {
    stores.AnswerStore.setTableData(tableData);
  }, [tableData]);

  return (
    <div className="anrt">
      <div className="anrtHead">
        <button className="act">我的答案</button>
      </div>
      <div className="anrtContent">
        <ScoreLie />
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