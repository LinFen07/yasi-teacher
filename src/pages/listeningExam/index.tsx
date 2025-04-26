
import { Layout } from 'antd';
import './index.scss';
import HeadTip from '@/components/container/HeadTip';
import PageContent from '@/components/container/examContent';
import FooterNav from '@/components/container/FooterNav';

const {Header, Content} = Layout;

export default function listeningExam() {

  return (
    <div className='examBox'>
      <Layout>
        <Header className='examHeader'>
          <HeadTip type='listen'></HeadTip>
        </Header>
        <Content className='examContent'>
          <PageContent type='listen'></PageContent>
        </Content>
        <div className='footer'>
          <FooterNav type='listen'></FooterNav>
        </div>
      </Layout>
    </div>
  )
}