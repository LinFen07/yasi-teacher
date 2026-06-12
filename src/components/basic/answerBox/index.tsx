import './index.scss';
import AnswerLeft from '@/components/container/answerLeft';
import AnswerRight from '@/components/container/answerRight';

export default function Answer() {
  return (
    <div className='answerBox'>
      <AnswerLeft />
      <AnswerRight />
    </div>
  )
}