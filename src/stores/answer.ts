import {  makeAutoObservable} from "mobx";
import { StudentAnswer } from '@/typings/exam'

class AnswerStore {
  constructor() {
    makeAutoObservable(this);
  }

  // 打勾题答案数组
  tickAnswers: Array<string> = [];
  //拖拽题答案数组
  dragAnswers: Array<string> = Array(10).fill("");

  //已完成的题目
  completedAnswers: Array<StudentAnswer> = Array(41).fill('');

  //写作答案
  writingAnswers: Array<StudentAnswer> = Array(3).fill('');

  //改变答案
  changeAnswer(index: number, answer: StudentAnswer) {
    this.completedAnswers[index] = answer;
  }

  //提交完将答案清空
  clearAnswers() {
    this.completedAnswers = Array(41).fill('');
  }

  changeStudentWritteAnswer(index: number, answer: StudentAnswer){
    this.writingAnswers[index] = answer;
  }
}

export default new AnswerStore();