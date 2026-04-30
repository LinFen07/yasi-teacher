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
    
    // 不清除ExamStore和页面状态，因为还要继续考试
    console.log(`${moduleType}模块数据清除完成`);
    return true;
  } catch (error) {
    console.error(`清除${moduleType}模块数据时出错:`, error);
    return false;
  }
};

/**
 * 考试完全结束时的数据清理
 */
export const clearAllExamData = () => {
  return clearExamLocalData({
    clearExamStore: true,
    clearAnswerStore: true,
    clearPageState: true,
    clearTimers: true,
    clearCachedAnswers: true // 考试完成后清除所有缓存
  });
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