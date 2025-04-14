import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ExamType } from "@/typings/exam";
import TurndownService from 'turndown';
import './index.scss';
import stores from '@/stores';

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
    const lines = markdown.split('\n');
    let Options: string[] = lines.slice(2, 10);
    let Questions: string[] = [];
    let questionTitle: string = lines[0].replace(/\*\*/g, '');

    for (let i = 11; i < lines.length; i++) {
      if (lines[i] !== '') {
        let cleanedLine = lines[i].replace(/\*\*/g, '');
        cleanedLine = cleanedLine.replace(/\s*\d+\s*$/, '');
        Questions.push(cleanedLine);
      }
    }

    return {
      questionTitle,
      Questions,
      Options
    };
  }

  const markdown = turndownService.turndown(questionArr.title);
  const { questionTitle, Questions, Options } = parseMarkdownToQuestionData(markdown);
  const [localOptions, setLocalOptions] = useState<string[]>(Options);
  const [droppedItems, setDroppedItems] = useState<{ questionIndex: number; option: string; originalIndex: number }[]>([]);

  const handleDrop = (item: { option: string; index: number }, questionIndex: number) => {
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
  
      // 返回新的 droppedItems 状态
      return newItems;
    });
    // 移除已拖拽的选项
    setLocalOptions((prevOptions) => prevOptions.filter(option => option !== item.option));
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
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className='drag-questionTitle'>{questionTitle}</div>
        <div style={{ display: 'flex' }}>
          <div className='drag-question-option-box'>
            {localOptions.map((option, index) => (
              <Option key={option} option={option} index={index} />
            ))}
          </div>
          <div className='drag-question-question-box'>
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