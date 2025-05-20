
import { Button } from 'antd';

import './index.scss'
import Score from '@/components/container/score';
import Answer from '@/components/basic/answerBox';
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
          <img src='http://111.230.5.159:9000/yasi/logo/logo%20(4).png' className='navImg'/>
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
