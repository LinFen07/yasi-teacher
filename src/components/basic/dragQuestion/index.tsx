import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ExamType } from "@/typings/exam";
import TurndownService from 'turndown';
import './index.scss';
import stores from '@/stores';
import { computedDragPrevCount } from '@/utils/computed';
import { runInAction } from 'mobx';
import { submitStudentBlankAnswer } from '@/utils/submitAnswer';

interface OptionProps {
  key: string;
  option: string;
  index: number;
}
interface DropTargetProps {
  questionIndex: number;
  onDrop: (item: { option: string; index: number }, questionIndex: number) => void;
  onRemove: (item: { option: string; index: number }) => void;
  droppedItems: { option: string; originalIndex: number }[];
}
const turndownService = new TurndownService();
const ItemTypes = {
  OPTION: 'option',
};

const Option = ({key, option, index }: OptionProps) => {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.OPTION,
      item: { option, key, index },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    []
  );

  return (
    <div ref={preview} className='drag-question-option'>
      <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'pointer' }}>
        {option}
      </div>
    </div>
  );
};
const DropTargetItem = ({ option, originalIndex, onRemove }: { option: string; originalIndex: number; onRemove: (item: { option: string; index: number }) => void }) => {
  const [, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.OPTION,
      item: { option, index: originalIndex },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [option, originalIndex]
  );

  return (
    <div ref={preview} style={{ margin: '5px 0', cursor: 'pointer' }} onClick={() => onRemove({ option, index: originalIndex })}>
      <div ref={drag}>{option}</div>
    </div>
  );
};

const DropTarget = ({ questionIndex, onDrop, onRemove, droppedItems }: DropTargetProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.OPTION,
    drop: (item: { option: string; index: number }) => onDrop(item, questionIndex),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className='drag-question-dragItem'>
      {droppedItems.map((item, idx) => (
        <DropTargetItem key={idx} option={item.option} originalIndex={item.originalIndex} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default function DragQuestion(questionArr: ExamType) {
  function parseMarkdownToQuestionData(markdown: string) {
    const lines = markdown.split('\n').map(line => line.trim());

    const optionRegex = /^[A-Z]\s(.*)$/;
    const questionRegex = /^\*\*\d+\*\*\s*(.*)$/;

    let Options: string[] = [];
    let Questions: string[] = [];
    let questionTitle: string = lines[0].replace(/\*\*/g, '');
    let optionTitle: string = '', title: string = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (line === '') continue; // 跳过空行

      // 匹配选项
      const optionMatch = line.match(optionRegex);
      const questionMatch = line.match(questionRegex);

      if (optionMatch) {
        Options.push(optionMatch[0].trim());
      }
      else if (questionMatch) {
        let cleanedLine = questionMatch[0].replace(/\*\*/g, '');
        cleanedLine = cleanedLine.replace(/\s*\d+\s*$/, '');
        Questions.push(cleanedLine);
      }
      else {
        let cleanedLine = line.replace(/\*\*/g, '');
        if (!optionTitle) {
          optionTitle = cleanedLine;
        }
        else {
          title = cleanedLine;
        }
      }
    }

    return {
      questionTitle,
      Questions,
      Options,
      optionTitle,
      title
    };
  }
  const markdown = turndownService.turndown(questionArr.title);
  const { questionTitle, Questions, Options, optionTitle, title } = parseMarkdownToQuestionData(markdown);
  const [localOptions, setLocalOptions] = useState<string[]>(Options);
  const [droppedItems, setDroppedItems] = useState<{ questionIndex: number; option: string; originalIndex: number }[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<string[]>(stores.AnswerStore.dragAnswers);

  useEffect(() => {
    // 初始化 droppedItems 和 localOptions
    const initialDroppedItems: { questionIndex: number; option: string; originalIndex: number }[] = [];
    const initialLocalOptions: string[] = [...Options];

    stores.AnswerStore.dragAnswers.forEach((answer, questionIndex) => {
      if (answer) {
        const optionIndex = Options.indexOf(answer);
        if (optionIndex !== -1) {
          initialDroppedItems.push({ questionIndex, option: answer, originalIndex: optionIndex });
          initialLocalOptions.splice(optionIndex, 1);
        }
      }
    });

    setDroppedItems(initialDroppedItems);
    setLocalOptions(initialLocalOptions);
  }, []);


  const dragPrevCount = computedDragPrevCount(stores.ExamStore.currentExamTitle, stores.ExamStore.currentExam);
  const handleDrop = (item: { option: string; index: number }, questionIndex: number) => {
    console.log(item, questionIndex)
    submitStudentBlankAnswer(questionArr,questionIndex,dragPrevCount, item.option[0], questionIndex)
    stores.ExamStore.changeCurrent(dragPrevCount + questionIndex + 1);
    stores.AnswerStore.dragAnswers[questionIndex] = item.option;
    setStudentAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[item.index] = item.option[0]; 
      return newAnswers;
    });
    setDroppedItems((prevItems) => {
      // 查找现有项
      const existingItem = prevItems.find(droppedItem => droppedItem.questionIndex === questionIndex);
      let newItems = prevItems;
      // 如果存在现有项，将其移回 localOptions 并从 droppedItems 中移除
      if (existingItem) {
        const originalIndex = existingItem.originalIndex;
         // 将现有项移回 localOptions 的原始位置
        setLocalOptions((prevOptions) => {
        const newOptions = [...prevOptions];
        newOptions.splice(originalIndex, 0, existingItem.option);
        return newOptions;
      });
        newItems = prevItems.filter(droppedItem => droppedItem.questionIndex !== questionIndex);
      }
      // 添加新项
      newItems = [
        ...newItems.filter(droppedItem => droppedItem.option !== item.option),
        { questionIndex, option: item.option, originalIndex: item.index }
      ];
      return newItems;
    });
    // 移除已拖拽的选项
    setLocalOptions((prevOptions) => prevOptions.filter(option => option !== item.option));
    runInAction(() => {
      const indexToRemove = stores.ExamStore.correctListenAnswer.indexOf(dragPrevCount + questionIndex + 1);
      if (indexToRemove == -1) {
        stores.ExamStore.correctListenAnswer.push(dragPrevCount + questionIndex + 1);
      }
    });
  };

  const handleRemove = (item: { option: string; index: number }) => {
    setDroppedItems((prevItems) => prevItems.filter(droppedItem => droppedItem.option !== item.option));
    // 将选项移回原始位置
    setLocalOptions((prevOptions) => {
      const newOptions = [...prevOptions];
      // 找到该选项的原始索引
      const originalIndex = droppedItems.find(droppedItem => droppedItem.option === item.option)?.originalIndex;
      if (originalIndex !== undefined) {
        // 在原始索引位置插入选项
        newOptions.splice(originalIndex, 0, item.option);
      } else {
        // 如果找不到原始索引，直接添加到末尾
        newOptions.push(item.option);
      }
      return newOptions;
    });
    runInAction(() => {
      const indexToRemove = stores.ExamStore.correctListenAnswer.indexOf(dragPrevCount + item.index + 1);
      if (indexToRemove !== -1) {
        stores.ExamStore.correctListenAnswer.splice(indexToRemove, 1);
      }
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className='drag-questionTitle'>{questionTitle}</div>
        <div style={{ display: 'flex' }}>
          <div className='drag-question-option-box'>
            <div className='drag-question-title'>{optionTitle}</div>
            {localOptions.map((option, index) => (
              <Option key={option} option={option} index={index} />
            ))}
          </div>
          <div className='drag-question-question-box'>
            <div className='drag-question-title' style={{marginTop:'2vh'}}>{title}</div>
            {
              Questions.map((question, questionIndex) => (
                <div key={questionIndex} className='drag-question-question' style={{ marginBottom: '10px' }}>
                  {question}
                  <DropTarget 
                    questionIndex={questionIndex} 
                    onDrop={handleDrop} 
                    onRemove={handleRemove} 
                    droppedItems={
                      droppedItems
                        .filter(item => item.questionIndex === questionIndex)
                        .map(item => ({ option: item.option, originalIndex: item.originalIndex }))
                    }
                  />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </DndProvider>
  );
}