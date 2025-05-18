import './index.scss'
import stores from '@/stores'
import { observer } from 'mobx-react'
import { useCallback, useEffect, useState } from 'react';
import { Input } from 'antd';

import ListenQuestions from '@/components/basic/listenQuestions';
import ReadQuestions from '@/components/basic/readQuestions'
import WritteQuestions from '@/components/basic/writteQuestions';
import { useEventListener } from '@/hooks/core/useEventListener';
import { computedPrevCount } from '@/utils/computedPrevCount';

const { TextArea } = Input;

type textArr = {
  text: string;
  isHightlight: boolean;
  note: string;
  menuPosition: {
    x: number;
    y: number;
  };
  selection: Selection | null
}

type propType = {
  type: string;
};

const examContent = observer((props: propType) => {
  const { type } = props;

  const [selectedText, setSelectedText] = useState<string>('');
  const [flagTextArr, setFlagTextArr] = useState<textArr[]>([
    {
      text:'',
      isHightlight: true,
      note: '',
      menuPosition: {x: 0, y: 0},
      selection: null
    }
  ]);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [noteVisible, setNoteVisible] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [isHightlight, setIsHightlight] = useState<boolean>(false);

  //字体大小
  const [fontSize, setFontSize] = useState(stores.ExamStore.FontSize);

  /*屏蔽浏览器默认右键事件*/
  // document.oncontextmenu = function (e) {
  //   e = e || window.event;
  //   return false;
  // };

  useEffect(() => {
    setFontSize(stores.ExamStore.FontSize);
  },[stores.ExamStore.FontSize]);

  const debounce = (func: any, delay: number) => {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleSelection = () => {
    if(noteVisible) return;
    const selection = window.getSelection();
    if (selection?.toString().length) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMenuPosition({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY });
        setSelectedText(selection.toString());
        setMenuVisible(true);
    }
  };

  const handleCloseMenu = useCallback((e: any) => {
    if(e.target.className == 'flag') return;
    const selection = window.getSelection();

    if (!selection?.toString().length ) {
      setMenuVisible(false);
      setIsHightlight(false);
      if(e.target.className == 'note' || e.target.tagName == 'TEXTAREA' || e.target.tagName == 'BUTTON') {
        return;
      };
      setNoteVisible(false);
    }
  },[]);
  const handleSelectionDebounced = debounce(handleSelection, 300);

  useEventListener('mouseup', handleSelectionDebounced, document);
  useEventListener('click',handleCloseMenu, document);

  const handleNoteText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  }

  const handleClickSpan = (e:any) => {
    setNoteVisible(false);
    flagTextArr.forEach(item => {
      if(item.text === e.target.innerText) {
        setMenuPosition({x:item.menuPosition.x, y:item.menuPosition.y});
        setSelectedText(e.target.innerText);
        setMenuVisible(true);
        setNoteText(item.note);
        setIsHightlight(true); 
      }
    })
  }

  const handleHighlight = (type: string) => {
    if(isHightlight) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        flagTextArr.push({
          text: selection.toString(),
          isHightlight: true,
          note: noteText,
          menuPosition:{
            x: range.getBoundingClientRect().left + window.scrollX,
            y: range.getBoundingClientRect().bottom + window.scrollY,
          },
          selection: selection
        });

          //创建新的元素
          const span = document.createElement('span');
          span.style.backgroundColor = 'yellow'
          span.className = 'flag';
          span.id = selection.toString();
  
          // 提取选中的文本
          const textNode = range.extractContents();
          const text = textNode.textContent;
        
          // 将文本设置到新的 span 元素中
          span.textContent = text;
  
          span.addEventListener('click', handleClickSpan);
  
          // 将 span 元素插入到原始位置
          range.insertNode(span);
        
          // 重新设置范围以包括新的 span 元素
          range.setStart(span, 0);
          range.setEnd(span, span.childNodes.length);
        
          // 更新选择以反映新的范围
          selection.removeAllRanges();
          selection.addRange(range);
        
        if(type == 'note') {
          const note = document.createElement('button');
          note.className = 'flagButton';
          span.appendChild(note);
        }
    }
  }

  const handleNote = () => {
    setNoteVisible(true)
    if(isHightlight && noteText.length == 0) {
      const note = document.createElement('button');
      note.className = 'flagButton';
      document.getElementById(`${selectedText}`)?.appendChild(note);
    }
    if(noteText.length == 0) {
      handleHighlight('note');
    }
  }

  const handleBlur = () => {
    if(noteText.length == 0) {
      handleClear();
      return
    }
    flagTextArr.forEach(item => {
      if(item.text == selectedText) {
        item.note = noteText;
      }
    })
    setNoteText('');
  }

  const handleClear = () => {
    const span = document.getElementById(`${selectedText}`);

    if(span && span.parentNode) {
      const spanContent = span.innerText;
      //TODO:清除事件监听
      span.parentNode.removeChild(span);
      
      flagTextArr.forEach(item => {
        if(item.text == selectedText) {
          const range = item.selection?.getRangeAt(0);
          range?.insertNode(document.createTextNode(spanContent));
        };
      });
      flagTextArr.filter(e => e.text == span.innerText);
      setNoteText('');
    }
  }

  const handleClearAll = () => {
    const span = document.getElementById(`${selectedText}`);
    //TODO:清除事件监听
    if(span && span.parentNode) {
      const parentText = span.parentNode.textContent || '';
      span.parentNode.textContent = parentText;
      flagTextArr.filter(e => e.text == span.innerText);
    }
    setNoteText('');
  }

  return (
    <div className='pageContent'>
      <div className='title'>{stores.ExamStore.currentExamTitle}</div>
      <div className='exam-content' style={{fontSize: `${fontSize}px`}}>
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
      {
      menuVisible 
      ? <div style={{ position: 'absolute', top: menuPosition.y, left: menuPosition.x }} className='menuBox'>
            <p>选中的文本: {selectedText}</p>
            <button onClick={() => handleHighlight('hightLight')}>Highlight</button>
            <button onClick={handleNote}>Note</button>
            <button onClick={handleClear} disabled={!isHightlight}>Clear</button>
            <button onClick={handleClearAll} disabled={!isHightlight}>Clear All</button>
        </div>
      :<></>
      }
      {
        noteVisible 
        ? <div className='note' style={{ position: 'absolute', top: menuPosition.y, left: menuPosition.x}}>
          <button onClick={() => {
            handleClear();
            setNoteVisible(false);
          }} className='noteCancel'>x</button>
            <p>选中的文本: {selectedText}</p>
            <TextArea autoFocus onChange={handleNoteText} onBlur={handleBlur} defaultValue= {noteText}>11</TextArea>
          </div>
        : <></>
      }
      <div className='empty'></div>
    </div>
  )
})

export default examContent;