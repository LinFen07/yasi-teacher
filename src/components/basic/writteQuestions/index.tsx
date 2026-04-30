import './index.scss';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import stores from '@/stores';

import { Input } from 'antd';
import { countWords } from '@/utils/helper/computed';
import { restrictChineseInput } from '@/utils/helper/inputRestriction';
const { TextArea } = Input;
export default function questions() {
  const exam = stores.ExamStore.getWritteExam();

  const [title, setTitle] = useState(exam[0].name);
  const [content, setContent] = useState(exam[0].questionItems[0].title);
  const [value, setValue] = useState(['', '']);
  const [wordCOunt, setWordCount] = useState(0);

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle[4] - 1;
    console.log(index);
    setTitle(exam[index].name);
    setContent(exam[index].questionItems[0].title);

    // 设置当前作文的答案
    setValue((prev) => {
      const updatedValues = [...prev];
      updatedValues[index] = stores.ExamStore.correctWritte[index] || '';
      return updatedValues;
    });
  }, [stores.ExamStore.currentExamTitle, exam]);

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle[4] - 1;
    stores.ExamStore.changeWritteAnswer(index, value[index]); // 更新答案到 MobX store
    const text = value[index];
    const count = countWords(text);

    setWordCount(count);
  }, [value]);

  const handleOnChange = (e: any) => {
    const originalValue = e.target.value;
    const filteredValue = restrictChineseInput(originalValue);

    // 如果输入包含中文，则使用过滤后的值
    const finalValue = originalValue !== filteredValue ? filteredValue : originalValue;

    if (originalValue !== filteredValue) {
      console.warn('不允许输入中文字符');
    }

    const index = +stores.ExamStore.currentExamTitle[4] - 1;
    setValue((prev) => {
      const updatedValues = [...prev];
      updatedValues[index] = finalValue; // 使用过滤后的值
      return updatedValues;
    });
    const text = finalValue;
    const count = countWords(text);

    setWordCount(count);
  }

  return (
    <div className='readContent'>
      <div className='leftContent'>
        {parse(title)}
        {parse(content)}
      </div>
      <div className='rightContent'>
        <TextArea
          className='writte-textarea'
          style={{ minHeight: '500px' }}
          value={value[+stores.ExamStore.currentExamTitle[4] - 1]} // 根据 index 获取对应的答案
          onChange={handleOnChange}
          onKeyDown={(e) => {
            // 阻止中文输入法的组合键
            if (e.key === 'Process' || (e.nativeEvent as any).isComposing) {
              e.preventDefault();
              alert('请不要使用中文输入法');
              return false;
            }
          }}
          onCompositionStart={(e) => {
            e.preventDefault();
          }}
          onCompositionEnd={(e) => {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const filteredValue = restrictChineseInput(target.value);
            const index = +stores.ExamStore.currentExamTitle[4] - 1;
            setValue((prev) => {
              const updatedValues = [...prev];
              updatedValues[index] = filteredValue;
              return updatedValues;
            });
          }}
        />
        <div style={{ marginTop: '8px' }}>Word count: {wordCOunt}</div>
      </div>

    </div>
  );
}