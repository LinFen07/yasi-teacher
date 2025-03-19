
import { read } from "fs";
import {  makeAutoObservable} from "mobx";

type Items = {
  content: string;
  itemUuid: string;
  prefix: string;
  score: string;
}

export interface ExamType {
  analyze: string;
  correct: string;
  correctArray: string[];
  difficult: number;
  gradeLevel: number;
  id: number;
  itemOrder: number;
  items: Array<Items>;
  questionType: string;
  score: string;
  subjectId: number;
  title: string;
  answer: string | null;
}

export interface ReadExamType {
  content: string;
  questions: Array<ExamType>;
}

interface correct {
  answer: string | null;
  true: string;
  score: number;
}

class ExamStore {
  exam: Array<Array<ExamType>>  = [];
  readExam: Array<ReadExamType>  = [];
  readQuestion: ReadExamType = {
    content:'',
    questions: []
  };
  listenExam: Array<ExamType> = [];
  wirtteExam: Array<ExamType> = [];
  currentExamIndex = 1;
  currentExamTitle = 'Part1:';
  scoreTag = '听力报告';
  FontSize = 18;
  listenScore: Array<correct> = [];
  readScore: Array<correct> = [];

  constructor() {
    makeAutoObservable(this);
  }

  addExam(exam: Array<ExamType>) {
    this.exam.push(exam);
    for(let i = 0; i < exam.length;){
      if(exam[i].title.includes('Listening questions')){
        while(!exam[i].title.includes('reading question')){
          this.listenExam.push(exam[i]);
          i++;
        }
      }else if(exam[i].title.includes('reading question')){
        while(!exam[i].analyze.includes('参考范文')){
          if(!this.readQuestion.content){
            this.readQuestion.content = exam[i].title;
          }else{
            this.readQuestion.questions.push(exam[i]);
          }
          i++;
        }
        this.readExam.push(this.readQuestion);
          this.readQuestion = {
            content:'',
            questions: []
          };
      } else if(exam[i].title.includes('Matching Paragraphs to Questions')){
        while(i < exam.length){
          if(!this.readQuestion.content){
            this.readQuestion.content = exam[i].title;
          }else{
            this.readQuestion.questions.push(exam[i]);
          }
          i++;
        }
        this.readExam.push(this.readQuestion);
          this.readQuestion = {
            content:'',
            questions: []
          };
      }else{
        console.log(1)
        this.wirtteExam.push(exam[i]);
        i++;
      }
    }
  }

  getExam() {
    return this.exam[this.exam.length - 1];
  }

  getReadExam() {
    return this.readExam;
  }

  getListenExam() {
    return this.listenExam;
  }

  getWritteExam() {
    return this.wirtteExam;
  }

  changeCurrent(current: number) {
    this.currentExamIndex = current;
  }

  changeCurrentTitle(title: string) {
    this.currentExamTitle = title;
  }

  changeScoreTag(tag: string) {
    this.scoreTag = tag;
  }

  getScoreTag() {
    return this.scoreTag;
  }

  changeFontSize(size: number) {
    this.FontSize = size;
  }

  updateListenExam(questionIndex: number, queston: ExamType) {
    this.listenExam[questionIndex] = queston;
  }

  updateReadExam(questionIndex: number, queston: any) {
    this.readExam[questionIndex].questions = queston;
  }

  correctListenAnswer() {
    this.listenExam.forEach((listenQuestion) => {
      const score = listenQuestion.answer == listenQuestion.correct ? +listenQuestion.score : 0;
      this.listenScore.push({answer:listenQuestion.answer, true: listenQuestion.correct, score});
    });
    console.log(this.listenScore);
  }

  correctReadAnswer() {
    this.readExam.forEach((readQuestionArr) => {
      readQuestionArr.questions.forEach((readQuestion) => {
        const score = readQuestion.answer == readQuestion.correct ? +readQuestion.score : 0;
        this.readScore.push({answer:readQuestion.answer, true: readQuestion.correct, score});
      })
    })
    console.log(this.readScore);
  }
};

export default new ExamStore();