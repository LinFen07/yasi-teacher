import {  makeAutoObservable, reaction} from "mobx";
import { StudentAnswer } from '@/typings/exam'

class AnswerStore {
  constructor() {
    makeAutoObservable(this);
    this.loadFromLocalStorage();
    
    // 自动保存到 localStorage
    reaction(
      () => JSON.stringify(this),
      () => {
        this.saveToLocalStorage();
      }
    );
  }

  saveToLocalStorage() {
    const data = {
      tickAnswers: this.tickAnswers,
      dragAnswers: this.dragAnswers,
      completedAnswers: this.completedAnswers,
      writingAnswers: this.writingAnswers,
    };
    localStorage.setItem('answerStore', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('answerStore');
    if (data) {
      const parsedData = JSON.parse(data);
      this.tickAnswers = parsedData.tickAnswers || [];
      this.dragAnswers = parsedData.dragAnswers || Array(10).fill('');
      this.completedAnswers = parsedData.completedAnswers || Array(40).fill('');
      this.writingAnswers = parsedData.writingAnswers || Array(2).fill('');
    }
  }

  // 打勾题答案数组
  tickAnswers: Array<string> = [];
  //拖拽题答案数组
  dragAnswers: Array<string> = Array(10).fill("");

  //已完成的题目
  completedAnswers: Array<StudentAnswer> = Array(40).fill('');

  //写作答案
  writingAnswers: Array<StudentAnswer> = Array(2).fill('');

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