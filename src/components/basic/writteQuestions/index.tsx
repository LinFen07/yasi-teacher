import './index.scss';
import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import stores from '@/stores';

import { Input } from 'antd';
import { countWords } from '@/utils/helper/computed';
import { restrictChineseInput } from '@/utils/helper/inputRestriction';
import { submitStudentWritteAnswer } from '@/utils/browser/submitAnswer';
const { TextArea } = Input;
export default function questions() {
  const exam = stores.ExamStore.getWritteExam();
  const currentIndex = Math.max((stores.ExamStore.currentExamTitle?.charCodeAt(4) || 49) - 49, 0);

  const [title, setTitle] = useState(exam[0]?.name || '');
  const [content, setContent] = useState(exam[0]?.questionItems[0]?.title || '');
  const [value, setValue] = useState<string[]>(() => stores.ExamStore.correctWritte.slice());
  const [wordCOunt, setWordCount] = useState(0);

  useEffect(() => {
    const currentExam = exam[currentIndex];

    if (!currentExam) return;

    setTitle(currentExam.name);
    setContent(currentExam.questionItems[0].title);

    // 始终从 store 恢复当前作文答案，避免切题后输入丢失
    setValue(stores.ExamStore.correctWritte.slice());
    setWordCount(countWords(stores.ExamStore.correctWritte[currentIndex] || ''));
  }, [stores.ExamStore.currentExamTitle, exam, currentIndex]);

  useEffect(() => {
    const text = value[currentIndex] || '';
    stores.ExamStore.changeWritteAnswer(currentIndex, text);
    setWordCount(countWords(text));
  }, [value, currentIndex]);

  const handleOnChange = (e: any) => {
    const originalValue = e.target.value;
    const filteredValue = restrictChineseInput(originalValue);

    // 如果输入包含中文，则使用过滤后的值
    const finalValue = originalValue !== filteredValue ? filteredValue : originalValue;

    if (originalValue !== filteredValue) {
      console.warn('不允许输入中文字符');
    }

    setValue((prev) => {
      const updatedValues = [...prev];
      updatedValues[currentIndex] = finalValue;
      return updatedValues;
    });
    setWordCount(countWords(finalValue));
    submitStudentWritteAnswer(exam[currentIndex].questionItems[0], currentIndex, finalValue);
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
          value={value[currentIndex] || ''}
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
            setValue((prev) => {
              const updatedValues = [...prev];
              updatedValues[currentIndex] = filteredValue;
              return updatedValues;
            });
          }}
        />
        <div style={{ marginTop: '8px' }}>Word count: {wordCOunt}</div>
      </div>

    </div>
  );
}