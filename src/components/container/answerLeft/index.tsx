import './index.scss';
import stores from '@/stores';
import { observer } from 'mobx-react'

const AnswerLeft = observer(() => {
  const { appraise } = stores.AnswerStore;
  return (
    <div className='anlt'>
      <div className='anltContent'>
        <div className='appraise'>{appraise || '作文1待批阅'}</div>
        <div className='appraise'>{appraise || '作文2待批阅'}</div>
      </div>
    </div>
  )
})

export default AnswerLeft;