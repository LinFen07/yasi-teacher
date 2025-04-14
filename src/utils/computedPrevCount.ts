import { Exam } from '@/typings/exam';

export function computedPrevCount(title: string, exam: Array<Exam>): number {
  const index = +title.slice(4, title.length - 1) - 1;
  let prevCount = 0;
  for(let i = 0; i < index; i++){
    for(let j = 0; j < exam[i].questionItems.length; j++){
      if(exam[i].questionItems[j].questionType == '4') prevCount += exam[i].questionItems[j].items.length;
      else if(exam[i].questionItems[j].questionType == '2') prevCount += exam[i].questionItems[j].correctArray.length;
      else prevCount++;
    }
  }
  return prevCount;
}

export function computedBlanksPrevCount(pre: number, title: string, exam: Array<Exam>){
  const index = +title.slice(4, title.length - 1) - 1;
    for(let j = 0; j < exam[index].questionItems.length; j++){
      if(exam[index].questionItems[j].questionType == '4') return pre;
      else if(exam[index].questionItems[j].questionType == '2') pre += exam[index].questionItems[j].correctArray.length;
      else pre++;
    }
  return pre;
}
export function computedTickPrevCount(pre: number, title: string, exam: Array<Exam>){
  const index = +title.slice(4, title.length - 1) - 1;
    for(let j = 0; j < exam[index].questionItems.length; j++){
      if(exam[index].questionItems[j].topicType == '5') return pre;
      else if(
        exam[index].questionItems[j].questionType == '2' 
        || exam[index].questionItems[j].questionType == '4'
      ) 
        pre += exam[index].questionItems[j].correctArray.length;
      else pre++;
    }
  return pre;
}
