import {  makeAutoObservable, reaction} from "mobx";
import { Correct, StudentAnswer } from '@/typings/exam'

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

  tickAnswers: Array<string> = [];  // 打勾题答案数组
  dragAnswers: Array<string> = Array(10).fill("");  //拖拽题答案数组
  completedAnswers: Array<StudentAnswer> = Array(40).fill('');  //已完成的题目
  writingAnswers: Array<StudentAnswer> = Array(2).fill('');  //写作答案
  correct: Array<Correct> = Array(82).fill('');  //正确答案
  listenTotalSorce: number = 0;
  readTotalSorce: number = 0;
  listenTrueCount: number = 0;
  readTrueCount: number = 0;

  saveToLocalStorage() {
    const data = {
      tickAnswers: this.tickAnswers,
      dragAnswers: this.dragAnswers,
      completedAnswers: this.completedAnswers,
      writingAnswers: this.writingAnswers,
      correct: this.correct,
      listenTotalSorce: this.listenTotalSorce,
      readTotalSorce: this.readTotalSorce,
      listenTrueCount: this.listenTrueCount,
      readTrueCount: this.readTrueCount,
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
      this.correct = parsedData.correct || [];
      this.listenTotalSorce = parsedData.listenTotalSorce || 0;
      this.readTotalSorce = parsedData.readTotalSorce || 0;
      this.listenTrueCount = parsedData.listenTrueCount || 0;
      this.readTrueCount = parsedData.readTrueCount || 0;
    }
  }

  resetLocalStorage() {
    localStorage.removeItem('answerStore');
  }

  // 添加正确答案
  addCorrect(index: number, correct: Correct) {
    this.correct[index] = correct;
  }

  //改变答案
  changeAnswer(index: number, answer: StudentAnswer) {
    this.completedAnswers[index] = answer;
  }

  //提交完将答案清空
  clearAnswers(type: string) {
    this.getCorrectRate(type);
    this.completedAnswers = Array(40).fill('');
  }

  // 计算正确率
  getCorrectRate(type: string) {
    if(type === 'listen') {
      this.listenTrueCount = this.completedAnswers.filter(item => item.isCorrect === 1).length;
      this.completedAnswers.forEach(item => this.listenTotalSorce + item.score);
    }
    else {
      this.readTrueCount = this.completedAnswers.filter(item => item.isCorrect === 1).length;
      this.completedAnswers.forEach(item => this.readTotalSorce + item.score);
    }
  }

  changeStudentWritteAnswer(index: number, answer: StudentAnswer){
    this.writingAnswers[index] = answer;
  }
}

export default new AnswerStore();