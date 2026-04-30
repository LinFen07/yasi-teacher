import './index.scss'
import stores from '@/stores'
import { observer } from 'mobx-react'
import { useCallback, useEffect, useState } from 'react';
import { Input } from 'antd';

import ListenQuestions from '@/components/basic/listenQuestions';
import ReadQuestions from '@/components/basic/readQuestions'
import WritteQuestions from '@/components/basic/writteQuestions';
import { useEventListener } from '@/hooks/core/useEventListener';

const { TextArea } = Input;

type HighlightRange = {
  id: string;
  text: string;
  note: string;
  startOffset: number;
  endOffset: number;
  containerPath: string; // 用于标识容器的路径
  examTitle: string; // 题目标识
}

type propType = {
  type: string;
};

const examContent = observer((props: propType) => {
  const { type } = props;

  const [selectedText, setSelectedText] = useState<string>('');
  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [noteVisible, setNoteVisible] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [currentHighlightId, setCurrentHighlightId] = useState<string | null>(null);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  //字体大小
  const [fontSize, setFontSize] = useState(stores.ExamStore.FontSize);

  useEffect(() => {
    setFontSize(stores.ExamStore.FontSize);
  },[stores.ExamStore.FontSize]);

  // 题目切换时清理高亮和状态
  useEffect(() => {
    setHighlights([]);
    setMenuVisible(false);
    setNoteVisible(false);
    setCurrentHighlightId(null);
    setSelectedText('');
    setNoteText('');
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, [stores.ExamStore.currentExamIndex, stores.ExamStore.currentExamTitle, type]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    };
  }, []);

  const handleSelection = () => {
    if(noteVisible) return;
    const selection = window.getSelection();
    if (selection?.toString().length) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMenuPosition({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY });
        setSelectedText(selection.toString());
        setSelectionRange(range.cloneRange());
        setMenuVisible(true);
        setCurrentHighlightId(null);
    }
  };

  const handleCloseMenu = useCallback((e: any) => {
    const selection = window.getSelection();

    if (!selection?.toString().length ) {
      setMenuVisible(false);
      setCurrentHighlightId(null);
      if(e.target.className == 'note' || e.target.tagName == 'TEXTAREA' || e.target.tagName == 'BUTTON') {
        return;
      };
      setNoteVisible(false);
    }
  },[]);


  useEventListener('mouseup', handleSelection, document);
  useEventListener('click',handleCloseMenu, document);

  const handleNoteText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  }

  const handleHighlight = () => {
    if (!selectionRange || !selectedText) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    
    // 计算每个矩形相对于exam-content的位置
    const examContent = document.querySelector('.exam-content');
    if (!examContent) return;
    
    const contentRect = examContent.getBoundingClientRect();
    const highlights: Array<{top: number, left: number, width: number, height: number}> = [];
    
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      highlights.push({
        top: rect.top - contentRect.top + examContent.scrollTop,
        left: rect.left - contentRect.left,
        width: rect.width,
        height: rect.height
      });
    }

    const newHighlight: HighlightRange = {
      id: Date.now().toString(),
      text: selectedText,
      note: '',
      startOffset: 0,
      endOffset: selectedText.length,
      containerPath: JSON.stringify(highlights), // 存储高亮位置信息
      examTitle: stores.ExamStore.currentExamTitle
    };

    setHighlights(prev => [...prev, newHighlight]);
    setMenuVisible(false);
    
    if (selection) {
      selection.removeAllRanges();
    }
  }

  const handleNote = () => {
    setNoteVisible(true);
  }

  const handleBlur = () => {
    if(noteText.length === 0) {
      handleClear();
      return;
    }
    
    if (currentHighlightId) {
      // 更新现有高亮的笔记
      setHighlights(prev => prev.map(h => 
        h.id === currentHighlightId ? {...h, note: noteText} : h
      ));
    } else {
      // 创建新高亮（带笔记）
      if (selectionRange && selectedText) {
        const newHighlight: HighlightRange = {
          id: Date.now().toString(),
          text: selectedText,
          note: noteText,
          startOffset: 0,
          endOffset: selectedText.length,
          containerPath: '',
          examTitle: stores.ExamStore.currentExamTitle
        };
        setHighlights(prev => [...prev, newHighlight]);
      }
    }
    
    setNoteText('');
    setNoteVisible(false);
    setMenuVisible(false);
  }

  const handleClear = () => {
    if (currentHighlightId) {
      setHighlights(prev => prev.filter(h => h.id !== currentHighlightId));
    }
    setMenuVisible(false);
    setNoteVisible(false);
    setCurrentHighlightId(null);
    setNoteText('');
  }

  const handleClearAll = () => {
    setHighlights([]);
    setMenuVisible(false);
    setNoteVisible(false);
    setCurrentHighlightId(null);
    setNoteText('');
  }

  const handleNoteClose = () => {
    setNoteVisible(false);
  }

  return (
    <div className='pageContent'>
      <div className='title'>{stores.ExamStore.currentExamTitle}
        <div className='title-expin'>{stores.ExamStore.titleExpain}</div>
      </div>
      <div className='exam-content' style={{fontSize: `${fontSize}px`, position: 'relative'}}>
        {/* 高亮覆盖层 */}
        {highlights.map(highlight => {
          try {
            const positions = JSON.parse(highlight.containerPath);
            return positions.map((pos: any, idx: number) => (
              <div
                key={`${highlight.id}-${idx}`}
                className='highlight-overlay'
                style={{
                  position: 'absolute',
                  top: `${pos.top}px`,
                  left: `${pos.left}px`,
                  width: `${pos.width}px`,
                  height: `${pos.height}px`,
                  backgroundColor: 'rgb(246, 238, 11)',
                  opacity: 0.4,
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            ));
          } catch {
            return null;
          }
        })}
        
        <div style={{position: 'relative', zIndex: 2}}>
          {
            type === 'listen' ? (
              <ListenQuestions ></ListenQuestions>
            ) : type === 'read' ? (
              <ReadQuestions ></ReadQuestions>
            ) : type === 'writte' ?(
              <WritteQuestions ></WritteQuestions>
            ) : (
              <></>
            )
          }
        </div>
      </div>
      {
      menuVisible 
      ? <div style={{ position: 'absolute', top: menuPosition.y, left: menuPosition.x, zIndex: 999 }} className='menuBox'>
            <p>选中的文本: {selectedText}</p>
            <button onClick={handleHighlight}>Highlight</button>
            <button onClick={handleNote}>Note</button>
            <button onClick={handleClear} disabled={!currentHighlightId}>Clear</button>
            <button onClick={handleClearAll} disabled={highlights.length === 0}>Clear All</button>
        </div>
      :<></>
      }
      {
        noteVisible 
        ? <div className='note' style={{ position: 'absolute', top: menuPosition.y, left: menuPosition.x, zIndex: 999}}>
          <button onClick={handleNoteClose} className='noteCancel'>x</button>
            <p>选中的文本: {selectedText}</p>
            <TextArea autoFocus onChange={handleNoteText} onBlur={handleBlur} defaultValue={noteText}></TextArea>
          </div>
        : <></>
      }
      
      {/* 显示高亮笔记列表 */}
      {highlights.filter(h => h.note).length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: '300px',
          maxHeight: '200px',
          overflow: 'auto',
          zIndex: 1000
        }}>
          <div style={{fontWeight: 'bold', marginBottom: '8px'}}>
            笔记 ({highlights.filter(h => h.note).length})
          </div>
          {highlights.filter(h => h.note).map(h => (
            <div key={h.id} style={{
              fontSize: '12px',
              padding: '4px',
              borderBottom: '1px solid #eee',
              cursor: 'pointer'
            }}>
              <div style={{background: 'yellow', display: 'inline-block', padding: '0 4px'}}>
                {h.text.substring(0, 20)}{h.text.length > 20 ? '...' : ''}
              </div>
              <div style={{color: '#666', fontSize: '11px', marginTop: '2px'}}>
                📝 {h.note}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className='empty'></div>
    </div>
  )
})

export default examContent;
