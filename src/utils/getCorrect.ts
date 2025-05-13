import stores from "@/stores";
import { Exam } from "@/typings/exam";

export function AddCorrect(exam: Exam[]) {
  let questionIndex = 0;
  for(let i = 0; i < exam.length; i++) {
    const questionItems = exam[i].questionItems;
    for (let j = 0; j < questionItems.length; j++) {
      const questionItem = questionItems[j];
      if(questionItem.correct) {
        stores.AnswerStore.addCorrect(questionIndex, {
          questonId: questionItem.id,
          correct: questionItem.correct,
        });
        questionIndex++;
      }
      else {
        for(let k = 0; k < questionItem.correctArray.length; k++) {
          const correct = questionItem.correctArray[k];
          stores.AnswerStore.addCorrect(questionIndex, {
            questonId: questionItem.id,
            correct: correct,
          });
          questionIndex++;
        }
      }
      
    }
  }
}