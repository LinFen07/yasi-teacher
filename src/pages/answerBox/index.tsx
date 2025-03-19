import './index.scss';
import AnswerLeft from '@/components/answerLeft';
import AnswerRight from '@/components/answerRight';

export default function Answer(){
  return (
    <div className='answerBox'>
      <AnswerLeft />
      <AnswerRight />
    </div>
  )
}