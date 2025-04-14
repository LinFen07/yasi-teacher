import {  makeAutoObservable} from "mobx";

class AnswerStore {
  constructor() {
    makeAutoObservable(this);
  }

  // 打勾题答案数组
  tickAnswers: Array<string> = [];
}

export default new AnswerStore();