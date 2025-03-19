
import './index.scss'
import stores from '@/stores';

export default function Score() {

  const hanldeScore = (e: any) => {
    if(e.target.tagName === 'UL') return;
    const tag = e.target.innerText;
    stores.ExamStore.changeScoreTag(tag);
    let btns = document.getElementsByClassName('btn');
    for (let i = 0; i < btns.length; i++) {
      btns[i].classList.remove('active');
    }
    e.target.classList.add('active');
  }

  return(
    <div className='contentHead'>
          <div className='lt'>
            <h3 style={{fontSize: '20px'}}>你的模考分数</h3>
            <ul style={{display: 'flex'}}>
              <li className='box'>
                <p>听力</p>
                <p>20</p>
              </li>
              <li className='box'>
                <p>阅读</p>
                <p>20</p>
              </li>
              <li className='box'>
                <p>写作</p>
                <p>20</p>
              </li>
            </ul>
            <ul onClick={hanldeScore}>
            <button className='btn active'>听力报告</button>
            <button className='btn'>阅读报告</button>
            <button className='btn'>写作报告</button>
            </ul>
          </div>
          <div className='rt'>
            <h3 style={{fontSize: '20px'}}>你的正确率</h3>
            <ul>
              <div className='rtBox'>
                <p>听力</p>
                <p>正确率 0%</p>
                <p>正确数量 0/40</p>
              </div>
              <div className='rtBox'>
                <p>阅读</p>
                <p>正确率 0%</p>
                <p>正确数量 0/40</p>
              </div>
            </ul>
          </div>
    </div>
  )
}