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

  //已完成题目数组
  correctListenAnswer: Array<number> = [];

  //听力答案
  correctListen: Array<correct> = [];

  //考生答案
  studentListenAnswers: Array<string> = Array(50).fill('');
  studentReadAnswers: Array<string> = Array(50).fill('');

  //阅读答案
  correctRead: Array<correct> = [];
  //写作答案
  correctWritte: Array<correct> = [];

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
    return this.listenExam;
  }

  getReadExam(){
    return this.readExam;
  }

  getWritteExam(){
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

  //判断听力答案
  isTrueListeneAnswer(){
    let questionId = 1;
    this.listenExam.forEach((exam, index) => {
      exam.questionItems.forEach((question, questionIndex) => {
        // 获取正确答案
        const correctAnswer = question.correct ? question.correct : question.correctArray; 
        // 获取用户答案
        const userAnswer = this.studentListenAnswers[questionId];

        if(correctAnswer instanceof Array){
          for(let i = 0; i < correctAnswer.length; i++){
            let correctScore = Math.floor(+question.score / correctAnswer.length).toString();
            this.correctListen.push({
              key: `${index}-${questionIndex}`,
              question: questionId,
              answer: correctAnswer[i],
              tag: userAnswer === correctAnswer[i] ? 'true' : 'false',
              myAn: userAnswer,
              score: userAnswer === correctAnswer[i] ? correctScore : '0',
            });
            questionId++;
            console.log('questionId - userAnswer',questionId, userAnswer);
          }
        }else {
          this.correctListen.push({
            key: `${index}-${questionIndex}`,
            question: questionId,
            answer: correctAnswer,
            tag: userAnswer === correctAnswer ? 'true' : 'false',
            myAn: userAnswer,
            score: userAnswer === correctAnswer ? question.score : '0',
          });
          questionId++;
          console.log('questionId - userAnswer',questionId, userAnswer);
        }
      });
    });
    console.log(this.correctListen);
  }

  //判断阅读答案
  isTrueReadAnswer(){
    this.readExam.forEach((exam, index) => {
      exam.questionItems.forEach((question, questionIndex) => {
        const correctAnswer = question.correct; // 获取正确答案
        const userAnswer = question.answer ? question.answer : ''; // 获取用户答案

        this.correctRead.push({
          key: `${index}-${questionIndex}`,
          question: questionIndex + 1,
          answer: correctAnswer,
          tag: userAnswer === correctAnswer ? 'true' : 'false',
          myAn: userAnswer,
          score: userAnswer === correctAnswer? question.score : '0',
        });
      });
    });
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