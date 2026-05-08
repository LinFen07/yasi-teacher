/**
 * 输入限制工具函数
 * 用于限制输入框中的中文字符
 */

/**
 * 移除字符串中的所有中文字符
 * @param value 输入的字符串
 * @returns 过滤后的字符串
 */
export const restrictChineseInput = (value: string): string => {
  if (!value) return '';
  // 移除所有中文字符（包括中文标点符号）
  // \u4e00-\u9fff: 中日韩统一表意文字
  // \u3400-\u4dbf: 中日韩统一表意文字扩展A
  // \uff00-\uffef: 全角ASCII、全角标点符号、半角片假名、全角片假名、全角平假名
  return value.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]/g, '');
};

/**
 * 检查字符串是否包含中文字符
 * @param value 输入的字符串
 * @returns 是否包含中文字符
 */
export const containsChinese = (value: string): boolean => {
  if (!value) return false;
  return /[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]/.test(value);
};

/**
 * 为输入框添加中文输入限制的事件处理器
 * @param inputElement HTML输入元素
 * @param onWarning 警告回调函数
 */
export const addChineseRestriction = (
  inputElement: HTMLInputElement | HTMLTextAreaElement,
  onWarning?: (message: string) => void
) => {
  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const originalValue = target.value;
    const filteredValue = restrictChineseInput(originalValue);

    if (originalValue !== filteredValue) {
      target.value = filteredValue;
      if (onWarning) {
        onWarning('不允许输入中文字符');
      } else {
        console.warn('不允许输入中文字符');
      }

      // 触发 input 事件以确保 React 状态更新
      const inputEvent = new Event('input', { bubbles: true });
      target.dispatchEvent(inputEvent);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // 阻止中文输入法的组合键
    if (e.key === 'Process' || (e as any).isComposing) {
      e.preventDefault();
      return false;
    }
  };

  const handleCompositionStart = (e: CompositionEvent) => {
    e.preventDefault();
  };

  const handleCompositionEnd = (e: CompositionEvent) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const filteredValue = restrictChineseInput(target.value);
    target.value = filteredValue;

    // 触发 input 事件以确保 React 状态更新
    const inputEvent = new Event('input', { bubbles: true });
    target.dispatchEvent(inputEvent);
  };

  // 添加事件监听器
  inputElement.addEventListener('input', handleInput);
  inputElement.addEventListener('keydown', handleKeyDown);
  inputElement.addEventListener('compositionstart', handleCompositionStart);
  inputElement.addEventListener('compositionend', handleCompositionEnd);

  // 返回清理函数
  return () => {
    inputElement.removeEventListener('input', handleInput);
    inputElement.removeEventListener('keydown', handleKeyDown);
    inputElement.removeEventListener('compositionstart', handleCompositionStart);
    inputElement.removeEventListener('compositionend', handleCompositionEnd);
  };
};

/**
 * React 组件的中文输入限制 props
 */
export const getChineseRestrictionProps = (onWarning?: (message: string) => void) => {
  return {
    onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const originalValue = target.value;
      const filteredValue = restrictChineseInput(originalValue);

      if (originalValue !== filteredValue) {
        target.value = filteredValue;
        if (onWarning) {
          onWarning('不允许输入中文字符');
        } else {
          console.warn('不允许输入中文字符');
        }
      }
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Process' || (e.nativeEvent as any).isComposing) {
        e.preventDefault();
        return false;
      }
    },
    onCompositionStart: (e: React.CompositionEvent) => {
      e.preventDefault();
    },
    onCompositionEnd: (e: React.CompositionEvent) => {
      e.preventDefault();
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const filteredValue = restrictChineseInput(target.value);
      target.value = filteredValue;
    }
  };
};