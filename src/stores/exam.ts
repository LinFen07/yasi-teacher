import {  makeAutoObservable, reaction} from "mobx";
import { Exam, ExamType} from '@/typings/exam'

class ExamStore {
  //当前试卷ID
  paperId = 0;

  //当前题目索引
  currentExamIndex = 1;
  currentExamTitle = 'Part1:';

  //字体大小
  FontSize = 18;
  //分数标签
  scoreTag = '听力报告';

  //听力录音
  listenAudio: string = '';

  exam: Array<Exam>  = [];
  listenExam: Array<Exam> = [];
  readExam: Array<Exam> = [];
  wirrteExam: Array<Exam> = [];
  currentExam: Array<Exam> = [];

  //已完成题目数组
  correctListenAnswer: Array<number> = [];

  //考生答案
  studentListenAnswers: Array<string> = Array(50).fill('');
  studentReadAnswers: Array<string> = Array(50).fill('');

  //写作答案
  correctWritte: Array<string> = Array(2).fill('');

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
      paperId: this.paperId,
      currentExamIndex: this.currentExamIndex,
      currentExamTitle: this.currentExamTitle,
      FontSize: this.FontSize,
      scoreTag: this.scoreTag,
      listenAudio: this.listenAudio,
      exam: this.exam,
      listenExam: this.listenExam,
      readExam: this.readExam,
      wirrteExam: this.wirrteExam,
      currentExam: this.currentExam,
      correctListenAnswer: this.correctListenAnswer,
      studentListenAnswers: this.studentListenAnswers,
      studentReadAnswers: this.studentReadAnswers,
      correctWritte: this.correctWritte,
    };
    localStorage.setItem('examStore', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('examStore');
    if (data) {
      const parsedData = JSON.parse(data);
      this.paperId = parsedData.paperId || 0;
      this.currentExamIndex = parsedData.currentExamIndex || 1;
      this.currentExamTitle = parsedData.currentExamTitle || 'Part1:';
      this.FontSize = parsedData.FontSize || 18;
      this.scoreTag = parsedData.scoreTag || '听力报告';
      this.listenAudio = parsedData.listenAudio || '';
      this.exam = parsedData.exam || [];
      this.listenExam = parsedData.listenExam || [];
      this.readExam = parsedData.readExam || [];
      this.wirrteExam = parsedData.wirrteExam || [];
      this.currentExam = parsedData.currentExam || [];
      this.correctListenAnswer = parsedData.correctListenAnswer || [];
      this.studentListenAnswers = parsedData.studentListenAnswers || Array(50).fill('');
      this.studentReadAnswers = parsedData.studentReadAnswers || Array(50).fill('');
      this.correctWritte = parsedData.correctWritte || Array(2).fill('');
    }
  }

  resetLocalStorage() {
    localStorage.removeItem('examStore');
  }

  //改变当前试卷
  changeCurrentExam(exam: Array<Exam>) {
    this.currentExam = exam;
  }

  //改变试卷id
  changePaperId(id: number) {
    this.paperId = id;
  }

  addExam(exam: Array<Exam>) {
    this.exam = exam;
    if(this.exam.length == 7) {
      this.listenExam = this.exam.slice(0,2);
      this.readExam = this.exam.slice(2,5);
      this.wirrteExam = this.exam.slice(5,7);
    }else{
      this.listenExam = this.exam.slice(0,4);
      this.readExam = this.exam.slice(4,7);
      this.wirrteExam = this.exam.slice(7);
    } 
    this.saveToLocalStorage();
  }

  getListenExam(){
    this.changeCurrentExam(this.listenExam);
    return this.listenExam;
  }

  getReadExam(){
    this.changeCurrentExam(this.readExam);
    return this.readExam;
  }

  getWritteExam(){
    this.changeCurrentExam(this.wirrteExam);
    return this.wirrteExam;
  }

  changeCurrent(current: number) {
    this.currentExamIndex = current;
  }

  changeCurrentTitle(title: string) {
    this.currentExamTitle = title;
  }

  //改变字体大小
  changeFontSize(size: number) {
    this.FontSize = size;
  }

  updateListenExam(index: number, questionIndex: number, queston: ExamType) {
    this.listenExam[index].questionItems[questionIndex] = queston;
  }

  updateReadExam(index: number, questionIndex: number, queston: ExamType) {
    this.readExam[index].questionItems[questionIndex] = queston;
  }

  resetcorrectListenAnswer(){
    this.correctListenAnswer = [];
  }

  changeScoreTag(tag: string) {
    this.scoreTag = tag;
  }

  //获取题目类型
  getScoreTag(){
    return this.scoreTag;
  }

  //添加听力录音
  addListenAudio(audio: string) {
    this.listenAudio = audio;
  }
  //获取听力录音
  getListenAudio() {
    return this.listenAudio;
  }

  //考生改变听力答案
  changeStudentListenAnswer(index: number, answer: string){
    this.studentListenAnswers[index] = answer;
  }
  changeStudentReadAnswer(index: number, answer: string){
    this.studentReadAnswers[index] = answer;
  }
}

export default new ExamStore();