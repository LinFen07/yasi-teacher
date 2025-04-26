import {  makeAutoObservable} from "mobx";
import { Exam, ExamType, correct} from '@/typings/exam'

class ExamStore {
  constructor() {
    makeAutoObservable(this);
  }
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

  //听力答案
  correctListen: Array<correct> = [];

  //考生答案
  studentListenAnswers: Array<string> = Array(50).fill('');
  studentReadAnswers: Array<string> = Array(50).fill('');

  //阅读答案
  correctRead: Array<correct> = [];

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