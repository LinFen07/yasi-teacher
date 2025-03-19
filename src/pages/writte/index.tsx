
import { Layout } from 'antd';
import FooterNav from '@/components/FooterNav';
import './index.scss';
import HeadTip from '@/components/HeadTip';
import store from '@/stores'
import PageContent from '@/components/examContent';

const {Header, Content, Footer} = Layout;


export default function writteExam() {
  const exam = store.ExamStore.getWritteExam();
  console.log(exam);
  return (
    <div className='examBox'>
      <Layout>
        <Header className='examHeader'>
          <HeadTip type='writte'></HeadTip>
        </Header>
        <Content className='examContent'>
          <PageContent type='writte'></PageContent>
        </Content>
        <div className='footer'>
          <FooterNav type='writte'></FooterNav>
        </div>
      </Layout>
    </div>
  )
}