
import { Layout, Splitter } from 'antd';
import './index.scss';
import HeadTip from '@/components/container/HeadTip';
import PageContent from '@/components/container/examContent';
import FooterNav from '@/components/container/FooterNav';
import React from 'react';
import { observer } from 'mobx-react'
import stores from '@/stores';

const {Header, Content} = Layout;

function ExamPage({type}: {type: string}) {

  const [sizes, setSizes] = React.useState<(number | string)[]>(['80%', '20%']);
  return (
    <div className='examBox'>
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