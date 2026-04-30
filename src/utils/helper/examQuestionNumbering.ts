/**
 * 考试题号管理工具
 * 用于生成与考试实际显示一致的题号映射
 */

import { Exam, ExamType } from "@/typings/exam";

export interface QuestionNumberInfo {
  questionId: number;
  displayNumber: number;
  moduleType: string;
  moduleNumber: number; // 在该模块中的题号
  globalNumber: number;  // 全局题号
  partTitle: string;     // Part标题
}

/**
 * 生成完整的题号映射信息
 * @param listenExam 听力考试数据
 * @param readExam 阅读考试数据
 * @param writeExam 写作考试数据
 * @returns 题号映射信息数组
 */
export function createCompleteQuestionMapping(
  listenExam: Exam[],
  readExam: Exam[],
  writeExam: Exam[]
): QuestionNumberInfo[] {
  const questionMappings: QuestionNumberInfo[] = [];
  let globalNumber = 1;

  // 处理听力题目
  let listenNumber = 1;
  listenExam.forEach((exam, partIndex) => {
    exam.questionItems.forEach((questionItem) => {
      if (questionItem.correctArray && questionItem.correctArray.length > 0) {
        // 有多个小题的情况
        questionItem.correctArray.forEach((_, subIndex) => {
          questionMappings.push({
            questionId: questionItem.id,
            displayNumber: globalNumber,
            moduleType: '听力',
            moduleNumber: listenNumber,
            globalNumber: globalNumber,
            partTitle: `Part${partIndex + 1}`
          });
          globalNumber++;
          listenNumber++;
        });
      } else {
        // 单个题目
        questionMappings.push({
          questionId: questionItem.id,
          displayNumber: globalNumber,
          moduleType: '听力',
          moduleNumber: listenNumber,
          globalNumber: globalNumber,
          partTitle: `Part${partIndex + 1}`
        });
        globalNumber++;
        listenNumber++;
      }
    });
  });

  // 处理阅读题目
  let readNumber = 1;
  readExam.forEach((exam, partIndex) => {
    exam.questionItems.forEach((questionItem) => {
      if (questionItem.correctArray && questionItem.correctArray.length > 0) {
        // 有多个小题的情况
        questionItem.correctArray.forEach((_, subIndex) => {
          questionMappings.push({
            questionId: questionItem.id,
            displayNumber: globalNumber,
            moduleType: '阅读',
            moduleNumber: readNumber,
            globalNumber: globalNumber,
            partTitle: `Part${partIndex + 1}`
          });
          globalNumber++;
          readNumber++;
        });
      } else {
        // 单个题目
        questionMappings.push({
          questionId: questionItem.id,
          displayNumber: globalNumber,
          moduleType: '阅读',
          moduleNumber: readNumber,
          globalNumber: globalNumber,
          partTitle: `Part${partIndex + 1}`
        });
        globalNumber++;
        readNumber++;
      }
    });
  });

  // 处理写作题目
  let writeNumber = 1;
  writeExam.forEach((exam, partIndex) => {
    exam.questionItems.forEach((questionItem) => {
      questionMappings.push({
        questionId: questionItem.id,
        displayNumber: globalNumber,
        moduleType: '写作',
        moduleNumber: writeNumber,
        globalNumber: globalNumber,
        partTitle: `Part${partIndex + 1}`
      });
      globalNumber++;
      writeNumber++;
    });
  });

  return questionMappings;
}

/**
 * 根据questionId获取题号信息
 * @param questionId 题目ID
 * @param questionMappings 题号映射数组
 * @returns 题号信息
 */
export function getQuestionNumberInfo(
  questionId: number,
  questionMappings: QuestionNumberInfo[]
): QuestionNumberInfo | null {
  return questionMappings.find(mapping => mapping.questionId === questionId) || null;
}

/**
 * 根据模块类型获取题号映射
 * @param moduleType 模块类型
 * @param questionMappings 题号映射数组
 * @returns 该模块的题号映射数组
 */
export function getModuleQuestionMappings(
  moduleType: string,
  questionMappings: QuestionNumberInfo[]
): QuestionNumberInfo[] {
  return questionMappings.filter(mapping => mapping.moduleType === moduleType);
}

/**
 * 生成简化的题号映射（兼容旧版本）
 * @param listenExam 听力考试数据
 * @param readExam 阅读考试数据
 * @param writeExam 写作考试数据
 * @returns 简化的题号映射对象
 */
export function createSimpleQuestionMapping(
  listenExam: Exam[],
  readExam: Exam[],
  writeExam: Exam[]
): Record<number, number> {
  const completeMapping = createCompleteQuestionMapping(listenExam, readExam, writeExam);
  const simpleMapping: Record<number, number> = {};
  
  completeMapping.forEach(info => {
    simpleMapping[info.questionId] = info.displayNumber;
  });
  
  return simpleMapping;
}

/**
 * 根据questionOrder计算正确的题号
 * @param questionOrder 题目顺序
 * @param listenCount 听力题目总数
 * @param readCount 阅读题目总数
 * @returns 模块信息
 */
export function getModuleInfoByOrder(
  questionOrder: number,
  listenCount: number,
  readCount: number
): { moduleType: string; moduleNumber: number; globalNumber: number } {
  if (questionOrder <= listenCount) {
    return {
      moduleType: '听力',
      moduleNumber: questionOrder,
      globalNumber: questionOrder
    };
  } else if (questionOrder <= listenCount + readCount) {
    return {
      moduleType: '阅读',
      moduleNumber: questionOrder - listenCount,
      globalNumber: questionOrder
    };
  } else {
    return {
      moduleType: '写作',
      moduleNumber: questionOrder - listenCount - readCount,
      globalNumber: questionOrder
    };
  }
}

/**
 * 计算各模块的题目数量
 * @param exams 考试数据数组
 * @returns 题目数量
 */
export function countQuestionsInExam(exams: Exam[]): number {
  return exams.reduce((total, exam) => {
    return total + exam.questionItems.reduce((sum, item) => {
      return sum + (Array.isArray(item.correctArray) && item.correctArray.length > 0 
        ? item.correctArray.length 
        : 1);
    }, 0);
  }, 0);
}