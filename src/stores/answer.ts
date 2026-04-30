import { makeAutoObservable, reaction } from "mobx";
import { Correct, StudentAnswer, StudentWritingAnswer } from "@/typings/exam";

class AnswerStore {
  constructor() {
    makeAutoObservable(this);
    this.loadFromLocalStorage();
    this.loadTableDataFromLocalStorage(); // 单独加载 tableData

    // 自动保存到 localStorage（不包括 tableData）
    reaction(
      () => JSON.stringify({
        tickAnswers: this.tickAnswers,
        dragAnswers: this.dragAnswers,
        completedAnswers: this.completedAnswers,
        writingAnswers: this.writingAnswers,
        correct: this.correct,
        listenTotalSorce: this.listenTotalSorce,
        readTotalSorce: this.readTotalSorce,
        listenTrueCount: this.listenTrueCount,
        readTrueCount: this.readTrueCount,
        appraise: this.appraise,
      }),
      () => {
        this.saveToLocalStorage();
      }
    );
  }

  tickAnswers: Array<string> = []; // 打勾题答案数组
  dragAnswers: Array<string> = Array(10).fill(""); //拖拽题答案数组
  completedAnswers: Array<StudentAnswer> = Array(40).fill(""); //已完成的题目
  writingAnswers: Array<StudentWritingAnswer> = Array(2).fill(""); //写作答案
  correct: Array<Correct> = Array(82).fill(""); //正确答案
  tableData: any[] = []; // 表格数据，独立存储
  listenTotalSorce: number = 0;
  readTotalSorce: number = 0;
  listenTrueCount: number = 0;
  readTrueCount: number = 0;
  appraise: string = "";

  fullReset() {
    const data = {
      tickAnswers: [],
      dragAnswers: Array(10).fill(""),
      completedAnswers: Array(40).fill(""),
      writingAnswers: Array(2).fill(""),
      correct: this.correct,
      listenTotalSorce: this.listenTotalSorce,
      readTotalSorce: this.readTotalSorce,
      listenTrueCount: this.listenTrueCount,
      readTrueCount: this.readTrueCount,
    };
    localStorage.setItem("answerStore", JSON.stringify(data));

    // 同时清空 tableData
    this.clearTableData();
  }

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
    localStorage.setItem("answerStore", JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem("answerStore");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        this.tickAnswers = parsedData.tickAnswers || [];
        this.dragAnswers = parsedData.dragAnswers || Array(10).fill("");
        this.completedAnswers = parsedData.completedAnswers || Array(40).fill("");
        this.writingAnswers = parsedData.writingAnswers || Array(2).fill("");
        this.correct = parsedData.correct || [];
        this.listenTotalSorce = parsedData.listenTotalSorce || 0;
        this.readTotalSorce = parsedData.readTotalSorce || 0;
        this.listenTrueCount = parsedData.listenTrueCount || 0;
        this.readTrueCount = parsedData.readTrueCount || 0;
      } catch (error) {
        console.error('加载本地存储失败:', error);
        this.resetToDefaults();
      }
    }
  }

  // 单独存储和加载 tableData
  saveTableDataToLocalStorage() {
    localStorage.setItem("tableData", JSON.stringify(this.tableData));
  }

  loadTableDataFromLocalStorage() {
    const data = localStorage.getItem("tableData");
    if (data) {
      try {
        this.tableData = JSON.parse(data) || [];
      } catch (error) {
        console.error('加载 tableData 失败:', error);
        this.tableData = [];
      }
    }
  }

  resetToDefaults() {
    this.tickAnswers = [];
    this.dragAnswers = Array(10).fill("");
    this.completedAnswers = Array(40).fill("");
    this.writingAnswers = Array(2).fill("");
    this.correct = Array(82).fill("");
    this.tableData = [];
    this.listenTotalSorce = 0;
    this.readTotalSorce = 0;
    this.listenTrueCount = 0;
    this.readTrueCount = 0;
    this.appraise = "";
  }

  resetLocalStorage() {
    localStorage.removeItem("answerStore");
    localStorage.removeItem("tableData"); // 同时删除 tableData
    this.resetToDefaults();
  }

  // 设置 tableData 并保存到独立存储
  setTableData(data: any[]) {
    this.tableData = data;
    this.saveTableDataToLocalStorage(); // 保存到独立存储
  }

  // 清空 tableData
  clearTableData() {
    this.tableData = [];
    localStorage.removeItem("tableData");
  }

  // 获取统计数据
  get stats() {
    let listenTotalSorce = 0;
    let readTotalSorce = 0;
    let listenTrueCount = 0;
    let readTrueCount = 0;

    if (Array.isArray(this.tableData) && this.tableData.length > 0) {
      this.tableData.forEach((item: any) => {
        if (item.module === '听力' && item.isCorrect === 1) {
          listenTrueCount++;
          listenTotalSorce += Number(item.score) || 0;
        } else if (item.module === '阅读' && item.isCorrect === 1) {
          readTrueCount++;
          readTotalSorce += Number(item.score) || 0;
        }
      });
    }

    return {
      listenTrueCount,
      readTrueCount,
      listenTotalSorce,
      readTotalSorce
    };
  }

  // 获取总分
  get totalScore() {
    const { listenTotalSorce, readTotalSorce } = this.stats;
    return listenTotalSorce + readTotalSorce;
  }

  // 获取正确率统计
  get accuracyStats() {
    const { listenTrueCount, readTrueCount } = this.stats;
    const listenAccuracy = listenTrueCount > 0 ?
      ((listenTrueCount / 40) * 100).toFixed(1) : '0';
    const readAccuracy = readTrueCount > 0 ?
      ((readTrueCount / 40) * 100).toFixed(1) : '0';

    return {
      listenAccuracy: `${listenAccuracy}%`,
      readAccuracy: `${readAccuracy}%`,
      listenTrueCount,
      readTrueCount
    };
  }

  // 添加正确答案
  addCorrect(index: number, correct: Correct) {
    this.correct[index] = correct;
  }

  //改变答案
  changeAnswer(index: number, answer: StudentAnswer) {
    this.completedAnswers[index] = answer;
  }

  //初始化答案
  initAnswer(answer: StudentAnswer[]) {
    this.completedAnswers = answer
  }

  //提交完将答案清空
  clearAnswers(type: string) {
    // this.getCorrectRate(type);
    this.completedAnswers = Array(40).fill("");
  }

  // 计算正确率
  // getCorrectRate(type: string) {
  //   if (type === "listen") {
  //     this.listenTrueCount = this.completedAnswers.filter(
  //       (item) => item.isCorrect === 1
  //     ).length;
  //     this.completedAnswers.forEach(
  //       (item) => this.listenTotalSorce + item.score
  //     );
  //   } else {
  //     this.readTrueCount = this.completedAnswers.filter(
  //       (item) => item.isCorrect === 1
  //     ).length;
  //     this.completedAnswers.forEach((item) => this.readTotalSorce + item.score);
  //   }
  // }

  changeStudentWritteAnswer(index: number, answer: StudentWritingAnswer) {
    this.writingAnswers[index] = answer;
  }
}

export default new AnswerStore();