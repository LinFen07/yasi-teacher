
import { Layout, Splitter } from 'antd';
import './index.scss';
import HeadTip from '@/components/container/HeadTip';
import PageContent from '@/components/container/examContent';
import FooterNav from '@/components/container/FooterNav';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react'
import { runInAction } from 'mobx'
import stores from '@/stores';

const {Header, Content} = Layout;

function ExamPage({type}: {type: string}) {

  const [sizes, setSizes] = React.useState<(number | string)[]>(['80%', '20%']);
  const [scale, setFontSize] = useState(1) 
  useEffect(() => {
    setFontSize(stores.ExamStore.FontSize / 18);
    console.log(stores.ExamStore.FontSize)

    // 保存当前页面类型到localStorage
    stores.ExamStore.changeCurrentPageType(type);

    // 处理页面刷新后的状态恢复
    runInAction(() => {
      try {
        const savedState = localStorage.getItem('examPageState');
        if (savedState) {
          const state = JSON.parse(savedState);
          // 检查是否是同一个考试
          if (state.paperId === stores.ExamStore.paperId) {
            // 检查是否是同一个页面类型，避免跨模块状态混乱
            if (state.currentPageType === type) {
              // 恢复保存的状态
              stores.ExamStore.changeCurrent(state.currentExamIndex);
              stores.ExamStore.changeCurrentTitle(state.currentExamTitle);
              console.log('页面状态已恢复:', state);
            } else {
              // 页面类型变更，重置为默认值
              stores.ExamStore.changeCurrent(1);
              stores.ExamStore.changeCurrentTitle('Part1');
              console.log('页面类型变更，重置状态到 Part1');
            }
          }
        } else {
          // 无保存状态，默认重置
          stores.ExamStore.changeCurrent(1);
          stores.ExamStore.changeCurrentTitle('Part1');
        }
      } catch (error) {
        console.warn('恢复页面状态失败:', error);
        stores.ExamStore.changeCurrent(1);
        stores.ExamStore.changeCurrentTitle('Part1');
      }
    });
  },[stores.ExamStore.FontSize, type])

  return (
    <div className='examBox' style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
      <Splitter
        onResize={setSizes}
      >
      <Splitter.Panel size={sizes[0]} resizable={true}>
        <Layout style={{width: '100%', height: '100%'}}>
          <Header className='examHeader'>
            <HeadTip type={type}></HeadTip>
          </Header>
          <Content className='examContent'>
            <PageContent type={type}></PageContent>
          </Content>
          <div className='footer'>
            <FooterNav type={type}></FooterNav>
          </div>
        </Layout>
      </Splitter.Panel>

      {
        stores.helperStore.isNoteView && 
        (
          <Splitter.Panel size={sizes[1]}>
            {
              stores.helperStore.noteText.map((item, index) => {
                return (
                  <div key={index} className='noteText'>
                    <h3>{item.title}</h3>
                    <div className='noteContent'>
                      <p>{item.content}</p>
                    </div>
                  </div>
                )
              })
            }
          </Splitter.Panel>
        )
      }
      </Splitter>
    </div>
  )
}

export default observer(ExamPage);