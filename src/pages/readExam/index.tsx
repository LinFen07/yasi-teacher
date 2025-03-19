import React from 'react';
import { Flex, Typography, Layout, Splitter } from 'antd';
import FooterNav from '@/components/FooterNav';
import './index.scss';
import HeadTip from '@/components/HeadTip';
import store from '@/stores'
import PageContent from '@/components/examContent';

const {Header, Content, Footer} = Layout;


export default function readnExam() {
  const exam = store.ExamStore.getReadExam();
  console.log(exam);
  return (
    <div className='examBox'>
      <Layout>
        <Header className='examHeader'>
          <HeadTip type='read'></HeadTip>
        </Header>
        <Content className='examContent'>
          <PageContent type='read'></PageContent>
        </Content>
        <div className='footer'>
          <FooterNav type='read'></FooterNav>
        </div>
      </Layout>
    </div>
  )
}