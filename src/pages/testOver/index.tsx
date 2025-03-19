
import { Button } from 'antd';

import './index.scss'
import Score from '@/components/score';
import Answer from '@/pages/answerBox';
//@ts-ignore
import img from '@/assets/logo.png'

export default function testOver() {

  const closeTest = () => {
    window.location.href = '/layout/dashboard'
  }

    return (
    <div className='testOver'>
      <div className='headNav' >
        <div>
          <img src={img} className='navImg'/>
        </div>
        <Button className='close' onClick={closeTest}>关闭</Button>
      </div>
      <div className='Scorecontent'>
        <Score />
        <Answer />
      </div>

    </div>
  );
}
