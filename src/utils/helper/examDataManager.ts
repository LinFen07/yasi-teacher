/**
 * 考试数据管理器
 * 用于管理考试数据的保存、清理和状态跟踪
 */

import stores from '@/stores';

export interface ExamDataClearOptions {
  clearExamStore?: boolean;
  clearAnswerStore?: boolean;
  clearPageState?: boolean;
  clearTimers?: boolean;
  clearCachedAnswers?: boolean;
}

/**
 * 清除考试相关的本地数据
 * @param options 清理选项
 */
export const clearExamLocalData = (options: ExamDataClearOptions = {}) => {
  const {
    clearExamStore = true,
    clearAnswerStore = true,
    clearPageState = true,
    clearTimers = true,
    clearCachedAnswers = false
  } = options;

  try {
    console.log('开始清除考试本地数据...', options);

    // 清除ExamStore数据
    if (clearExamStore) {
      stores.ExamStore.resetLocalStorage();
      localStorage.removeItem('examStore');
      // console.log('ExamStore数据已清除');
    }

    // 清除AnswerStore数据
    if (clearAnswerStore) {
      stores.AnswerStore.resetLocalStorage();
      localStorage.removeItem('answerStore');
      // console.log('AnswerStore数据已清除');
    }

    // 清除页面状态数据
    if (clearPageState) {
      localStorage.removeItem('examPageState');
      // console.log('页面状态数据已清除');
    }

    // 清除计时器相关数据
    if (clearTimers) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('testTimer:')) {
          localStorage.removeItem(key);
        }
      });
      // console.log('计时器数据已清除');
    }

    // 清除缓存的答案数据（通常在网络问题时保留）
    if (clearCachedAnswers) {
      localStorage.removeItem('cachedAnswers');
      // console.log('缓存答案数据已清除');
    }

    // console.log('考试本地数据清除完成');
    return true;
  } catch (error) {
    console.error('清除考试本地数据时出错:', error);
    return false;
  }
};

/**
 * 部分清除数据（用于模块切换时）
 * @param moduleType 模块类型
 */
export const clearModuleData = (moduleType: 'listen' | 'read' | 'writte') => {
  try {
    console.log(`清除${moduleType}模块数据`);

    // 清除对应模块的答案数据
    stores.AnswerStore.clearAnswers(moduleType);

    // 清除输入草稿（answer-input-* localStorage）
    stores.AnswerStore.clearPersistedDrafts();

    // 清除页面状态
    localStorage.removeItem('examPageState');

    // 清除表格数据
    stores.AnswerStore.clearTableData();

    // 不清除ExamStore和页面状态，因为还要继续考试
    console.log(`${moduleType}模块数据清除完成`);
    return true;
  } catch (error) {
    console.error(`清除${moduleType}模块数据时出错:`, error);
    return false;
  }
};

/**
 * 检查是否有未提交的数据
 */
export const hasUnsubmittedData = (): boolean => {
  try {
    // 检查是否有缓存的答案
    const cachedAnswers = localStorage.getItem('cachedAnswers');
    if (cachedAnswers && JSON.parse(cachedAnswers).length > 0) {
      return true;
    }

    // 检查各个store中是否有未提交的答案
    const hasListenAnswers = stores.AnswerStore.completedAnswers.length > 0;
    const hasWritingAnswers = stores.AnswerStore.writingAnswers.length > 0;

    return hasListenAnswers || hasWritingAnswers;
  } catch (error) {
    console.error('检查未提交数据时出错:', error);
    return false;
  }
};

/**
 * 获取数据清理状态报告
 */
export const getDataClearReport = () => {
  const report = {
    examStore: !localStorage.getItem('examStore'),
    answerStore: !localStorage.getItem('answerStore'),
    pageState: !localStorage.getItem('examPageState'),
    cachedAnswers: !localStorage.getItem('cachedAnswers'),
    timers: Object.keys(localStorage).filter(key => key.startsWith('testTimer:')).length === 0,
    hasUnsubmitted: hasUnsubmittedData()
  };

  console.log('数据清理状态报告:', report);
  return report;
};

/**
 * 模块完成时的清理流程
 * 提交答案成功后，清除本地草稿、页面状态和 tableData
 * 但保留 examStore（下个模块需要）和已提交的答案
 */
export const clearModuleDrafts = () => {
  try {
    // 清除所有 answer-input-* 草稿
    stores.AnswerStore.clearPersistedDrafts();

    // 清除页面状态
    localStorage.removeItem('examPageState');

    // 清除表格数据
    stores.AnswerStore.clearTableData();

    console.log('模块草稿/状态/表格数据已清理');
    return true;
  } catch (error) {
    console.error('清除模块草稿时出错:', error);
    return false;
  }
};

/**
 * 考试完全结束时的清理流程
 * 清除所有考试相关的本地数据
 */
export const clearAllExamData = () => {
  try {
    // 清除考试存储
    stores.ExamStore.resetLocalStorage();
    localStorage.removeItem('examStore');

    // 清除答案存储
    stores.AnswerStore.resetLocalStorage();
    localStorage.removeItem('answerStore');

    // 清除页面状态
    localStorage.removeItem('examPageState');

    // 清除表格数据
    stores.AnswerStore.clearTableData();

    // 清除所有 timer 类数据
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('testTimer:')) {
        localStorage.removeItem(key);
      }
    });

    // 清除缓存答案
    localStorage.removeItem('cachedAnswers');

    // 清除输入草稿
    stores.AnswerStore.clearPersistedDrafts();

    console.log('所有考试数据已清除');
    return true;
  } catch (error) {
    console.error('清除考试数据时出错:', error);
    return false;
  }
};

/**
 * 验证提交的答案是否正确（本地对比）
 * @param submittedData 已提交的答案数据数组
 * @returns 验证结果
 */
export const validateSubmittedAnswers = (
  submittedData: Array<{ questionId: number; content: string; prefix?: string }>
): { total: number; correctCount: number; results: Array<{ questionId: number; isCorrect: boolean; correctAnswer: string }> } => {
  const correctArray = stores.AnswerStore.correct;
  const results: Array<{ questionId: number; isCorrect: boolean; correctAnswer: string }> = [];
  let correctCount = 0;

  submittedData.forEach(submitted => {
    // 在 correct 数组中查找对应的正确答案
    const correctItem = correctArray.find(c => c.questonId === submitted.questionId);
    if (correctItem) {
      // 比较提交的答案和正确答案（去除空白和 HTML 标签后比较）
      const submittedNormalized = submitted.content.replace(/<[^>]*>/g, '').replace(/\s+/g, '').trim().toLowerCase();
      const correctNormalized = correctItem.correct.replace(/<[^>]*>/g, '').replace(/\s+/g, '').trim().toLowerCase();
      const isCorrect = submittedNormalized === correctNormalized;

      if (isCorrect) correctCount++;
      results.push({
        questionId: submitted.questionId,
        isCorrect,
        correctAnswer: correctItem.correct
      });
    } else {
      results.push({
        questionId: submitted.questionId,
        isCorrect: false,
        correctAnswer: '未找到正确答案'
      });
    }
  });

  return {
    total: submittedData.length,
    correctCount,
    results
  };
};

/**
 * 安全的数据提交和清理流程
 * @param submitFunction 提交函数
 * @param onSuccess 成功回调
 * @param onError 错误回调
 */
export const safeSubmitAndClear = async (
  submitFunction: () => Promise<any>,
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    console.log('开始安全提交流程...');
    
    // 执行提交
    await submitFunction();
    
    console.log('提交成功，开始清理数据...');
    
    // 提交成功后清理数据
    const clearSuccess = clearAllExamData();
    
    if (clearSuccess) {
      console.log('数据清理成功');
      onSuccess?.();
    } else {
      console.warn('数据清理部分失败');
      onSuccess?.(); // 即使清理失败也执行成功回调
    }
    
   } catch (error) {
    console.error('提交失败:', error);

    // 提交失败时不清理数据，保留用于重试
    console.log('提交失败，保留本地数据用于重试');
    onError?.(error);
  }
};

/**
 * 检查未完成考试的状态
 * @param paperId 试卷ID
 * @returns 各模块状态
 */
export interface OngoingExamState {
  listen: { status: 'pending' | 'in_progress' | 'expired' | 'completed' | 'not_started'; remainingMs: number };
  read: { status: 'pending' | 'in_progress' | 'expired' | 'completed' | 'not_started'; remainingMs: number };
  writte: { status: 'pending' | 'in_progress' | 'expired' | 'completed' | 'not_started'; remainingMs: number };
}

const DURATION_MS: Record<string, number> = {
  listen: 30 * 60 * 1000,
  read: 1 * 60 * 1000,
  writte: 1 * 60 * 1000,
};

export interface ModuleProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: number;
}

export interface ExamProgress {
  paperId: number;
  listen: ModuleProgress;
  read: ModuleProgress;
  writte: ModuleProgress;
}

const PROGRESS_KEY_PREFIX = 'examProgress:';

export const getExamProgress = (paperId: number): ExamProgress | null => {
  console.log('=== getExamProgress ===');
  console.log('paperId:', paperId, 'type:', typeof paperId);
  if (!paperId) return null;
  const key = `${PROGRESS_KEY_PREFIX}${paperId}`;
  console.log('key:', key);
  const raw = localStorage.getItem(key);
  console.log('raw:', raw);
  if (!raw) return null;
  try {
    const result = JSON.parse(raw) as ExamProgress;
    console.log('result:', result);
    return result;
  } catch {
    return null;
  }
};

export const setModuleStatus = (
  paperId: number,
  mod: 'listen' | 'read' | 'writte',
  status: 'not_started' | 'in_progress' | 'completed'
): void => {
  if (!paperId) return;
  const key = `${PROGRESS_KEY_PREFIX}${paperId}`;
  let progress = getExamProgress(paperId);
  
  if (!progress) {
    progress = {
      paperId,
      listen: { status: 'not_started' },
      read: { status: 'not_started' },
      writte: { status: 'not_started' },
    };
  }
  
  progress[mod] = {
    status,
    completedAt: status === 'completed' ? Date.now() : undefined,
  };
  
  localStorage.setItem(key, JSON.stringify(progress));
};

export const hasOngoingExam = (paperId: number): boolean => {
  console.log('=== hasOngoingExam ===');
  console.log('paperId:', paperId, 'type:', typeof paperId);
  const progress = getExamProgress(paperId);
  console.log('progress:', progress);
  if (!progress) {
    console.log('返回 false - 没有 progress');
    return false;
  }
  
  const result = (
    progress.listen.status === 'in_progress' ||
    progress.read.status === 'in_progress' ||
    progress.writte.status === 'in_progress'
  );
  console.log('result:', result);
  return result;
};

export const initExamProgress = (paperId: number): ExamProgress => {
  const progress: ExamProgress = {
    paperId,
    listen: { status: 'not_started' },
    read: { status: 'not_started' },
    writte: { status: 'not_started' },
  };
  const key = `${PROGRESS_KEY_PREFIX}${paperId}`;
  localStorage.setItem(key, JSON.stringify(progress));
  return progress;
};

export const clearExamProgress = (paperId: number): void => {
  if (!paperId) return;
  const key = `${PROGRESS_KEY_PREFIX}${paperId}`;
  localStorage.removeItem(key);
};

export const checkOngoingExamState = (paperId: number): OngoingExamState => {
  const result: OngoingExamState = {
    listen: { status: 'not_started', remainingMs: 0 },
    read: { status: 'not_started', remainingMs: 0 },
    writte: { status: 'not_started', remainingMs: 0 },
  };

  if (!paperId) return result;

  const modules: Array<'listen' | 'read' | 'writte'> = ['listen', 'read', 'writte'];

  for (const mod of modules) {
    const key = `testTimer:${paperId}:${mod}`;
    const raw = localStorage.getItem(key);
    const durationMs = DURATION_MS[mod];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const startAt = Number(parsed.startAt) || 0;
        const end = startAt + durationMs;
        const remaining = Math.max(0, end - Date.now());

        if (remaining > 0) {
          result[mod] = { status: 'in_progress', remainingMs: remaining };
        } else {
          result[mod] = { status: 'expired', remainingMs: 0 };
        }
      } catch {
        result[mod] = { status: 'not_started', remainingMs: 0 };
      }
    } else {
      result[mod] = { status: 'not_started', remainingMs: 0 };
    }
  }

  return result;
};