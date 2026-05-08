import { makeAutoObservable, reaction, observable } from "mobx";
import { Exam, ExamType } from "@/typings/exam";

class AudioCacheManager {
  private db: IDBDatabase | null = null;
  private objectUrls: Map<number, string> = new Map();
  private readonly DB_NAME = "AudioCacheDB";
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = "audioCache";

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB 初始化失败:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB 初始化成功");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: "paperId" });
        }
      };
    });
  }

  async hasCache(paperId: number): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(paperId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(!!request.result);
    });
  }

  async downloadAndCache(
    paperId: number,
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    if (!paperId || isNaN(paperId) || typeof paperId !== 'number') {
      throw new Error('无效的试卷ID');
    }

    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const blob = await this.downloadWithProgress(url, onProgress);
        await this.saveToIndexedDB(paperId, blob);
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error("音频下载失败");
        }
        await this.sleep(1000);
      }
    }
  }

  private async downloadWithProgress(
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<Blob> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("响应体为空");
    }

    const contentLength = parseInt(response.headers.get("Content-Length") || "0");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (contentLength && onProgress) {
        const percent = Math.round((receivedLength / contentLength) * 100);
        onProgress(percent);
      }
    }

    return new Blob(chunks);
  }

  private async saveToIndexedDB(paperId: number, blob: Blob): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);

      const data = {
        paperId,
        audioBlob: blob,
        downloadTime: Date.now(),
      };

      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCachedBlob(paperId: number): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(paperId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.audioBlob : null);
      };
    });
  }

  async getAudioUrl(paperId: number): Promise<string | null> {
    if (this.objectUrls.has(paperId)) {
      return this.objectUrls.get(paperId)!;
    }

    const blob = await this.getCachedBlob(paperId);
    if (!blob) return null;

    const objectUrl = URL.createObjectURL(blob);
    this.objectUrls.set(paperId, objectUrl);
    return objectUrl;
  }

  revokeAudioUrl(paperId: number): void {
    const url = this.objectUrls.get(paperId);
    if (url) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(paperId);
    }
  }

  async getAllCachedPaperIds(): Promise<number[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as number[]);
    });
  }

  async removeCache(paperId: number): Promise<void> {
    if (!this.db) await this.init();

    this.revokeAudioUrl(paperId);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(paperId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const audioCacheManager = new AudioCacheManager();

class ExamStore {
  //当前试卷ID
  paperId = 0;

  //当前题目索引
  currentExamIndex = 1;
  currentExamTitle = "Part1";
  titleExpain = "";

  // 页面类型状态保存
  currentPageType = "listen";

  //字体大小
  FontSize = 18;

  //听力录音
  listenAudio: string = "";
  audioVolume = 30;

  exam: Array<Exam> = [];
  listenExam: Array<Exam> = [];
  readExam: Array<Exam> = [];
  wirrteExam: Array<Exam> = [];
  currentExam: Array<Exam> = [];

  //已完成题目数组
  correctListenAnswer: Array<number> = [];

  //考生答案
  studentListenAnswers: Array<string> = Array(50).fill("");
  studentReadAnswers: Array<string> = Array(50).fill("");

  //写作答案
  correctWritte: Array<string> = Array(2).fill("");

  // 音频下载完成状态追踪
  downloadCompleteMap: Record<number, boolean> = {};
  downloadedPaperIds = observable.array<number>();
  downloadTrigger: number = 0;

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

  fullReset() {
    const data = {
      paperId: this.paperId,
      currentExamIndex: this.currentExamIndex,
      currentExamTitle: this.currentExamTitle,
      currentPageType: this.currentPageType,
      FontSize: this.FontSize,
      listenAudio: this.listenAudio,
      exam: this.exam,
      listenExam: this.listenExam,
      readExam: this.readExam,
      wirrteExam: this.wirrteExam,
      currentExam: this.currentExam,
      correctListenAnswer: this.correctListenAnswer,
      studentListenAnswers: Array(50).fill(""),
      studentReadAnswers: Array(50).fill(""),
      correctWritte: Array(2).fill(""),
      audioVolume: this.audioVolume,
    };
    localStorage.setItem("examStore", JSON.stringify(data));
  } //打开新试卷重置考生答案

  saveToLocalStorage() {
    const data = {
      paperId: this.paperId,
      currentExamIndex: this.currentExamIndex,
      currentExamTitle: this.currentExamTitle,
      currentPageType: this.currentPageType,
      FontSize: this.FontSize,
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
      audioVolume: this.audioVolume,
    };
    localStorage.setItem("examStore", JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem("examStore");
    if (data) {
      const parsedData = JSON.parse(data);
      this.paperId = parsedData.paperId || 0;
      this.currentExamIndex = parsedData.currentExamIndex || 1;
      this.currentExamTitle = parsedData.currentExamTitle || "Part1";
      this.currentPageType = parsedData.currentPageType || "listen";
      this.FontSize = parsedData.FontSize || 18;
      this.listenAudio = parsedData.listenAudio || "";
      this.exam = parsedData.exam || [];
      this.listenExam = parsedData.listenExam || [];
      this.readExam = parsedData.readExam || [];
      this.wirrteExam = parsedData.wirrteExam || [];
      this.currentExam = parsedData.currentExam || [];
      this.correctListenAnswer = parsedData.correctListenAnswer || [];
      this.studentListenAnswers =
        parsedData.studentListenAnswers || Array(50).fill("");
      this.studentReadAnswers =
        parsedData.studentReadAnswers || Array(50).fill("");
      this.correctWritte = parsedData.correctWritte || Array(2).fill("");
      this.audioVolume = parsedData.audioVolume || 30;
    }
  }

  resetLocalStorage() {
    localStorage.removeItem("examStore");
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
    if (this.exam.length == 7) {
      this.listenExam = this.exam.slice(0, 2);
      this.readExam = this.exam.slice(2, 5);
      this.wirrteExam = this.exam.slice(5, 7);
    } else {
      this.listenExam = this.exam.slice(0, 4);
      this.readExam = this.exam.slice(4, 7);
      this.wirrteExam = this.exam.slice(7);
    }
    this.saveToLocalStorage();
  }

  getListenExam() {
    this.changeCurrentExam(this.listenExam);
    return this.listenExam;
  }

  getReadExam() {
    this.changeCurrentExam(this.readExam);
    return this.readExam;
  }

  getWritteExam() {
    this.changeCurrentExam(this.wirrteExam);
    return this.wirrteExam;
  }

  changeCurrent(current: number) {
    // console.log(current)
    this.currentExamIndex = current;
  }

  changeCurrentTitle(title: string) {
    this.currentExamTitle = title;
  }

  changeTitleExpain(title: string) {
    this.titleExpain = title;
  }

  changeCurrentPageType(pageType: string) {
    this.currentPageType = pageType;
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

  resetcorrectListenAnswer() {
    this.correctListenAnswer = [];
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
  changeStudentListenAnswer(index: number, answer: string) {
    this.studentListenAnswers[index] = answer;
  }
  changeStudentReadAnswer(index: number, answer: string) {
    this.studentReadAnswers[index] = answer;
  }

  changeWritteAnswer(index: number, answer: string) {
    this.correctWritte[index] = answer;
  }
  changeAusioVolume(volume: number) {
    this.audioVolume = volume;
  }

  async hasAudioCache(): Promise<boolean> {
    if (this.paperId === 0) return false;
    return await audioCacheManager.hasCache(this.paperId);
  }

  async hasAudioCacheForPaper(paperId: number): Promise<boolean> {
    if (!paperId || isNaN(paperId)) return false;
    return await audioCacheManager.hasCache(paperId);
  }

  async shouldRedownload(paperId: number, url: string): Promise<boolean> {
    try {
      const cachedBlob = await audioCacheManager.getCachedBlob(paperId);
      if (!cachedBlob) return true;

      const headRes = await fetch(url, { method: 'HEAD' });
      const serverSize = parseInt(headRes.headers.get('content-length') || '0');

      if (serverSize > 0) {
        return cachedBlob.size !== serverSize;
      }

      return false;
    } catch (error) {
      console.warn(`检查试卷 ${paperId} 是否需要重新下载失败:`, error);
      return false;
    }
  }

  async downloadAudio(
    paperId: number,
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    if (!paperId || isNaN(paperId) || paperId === 0) {
      throw new Error("无效的试卷ID");
    }

    await audioCacheManager.downloadAndCache(paperId, url, onProgress);
    this.downloadCompleteMap[paperId] = true;
    this.downloadedPaperIds.push(paperId);
    this.downloadTrigger++;
  }

  isPaperDownloadComplete(paperId: number): boolean {
    return this.downloadCompleteMap[paperId] === true;
  }

  async getCachedAudioUrl(): Promise<string | null> {
    if (this.paperId === 0) return null;
    return await audioCacheManager.getAudioUrl(this.paperId);
  }

  async getCachedAudioBlob(): Promise<Blob | null> {
    if (this.paperId === 0) return null;
    return await audioCacheManager.getCachedBlob(this.paperId);
  }

  revokeAudioCacheUrl(): void {
    if (this.paperId !== 0) {
      audioCacheManager.revokeAudioUrl(this.paperId);
    }
  }

  async getAllCachedPaperIds(): Promise<number[]> {
    return await audioCacheManager.getAllCachedPaperIds();
  }

  async checkMultipleCacheStatus(paperIds: number[]): Promise<Map<number, boolean>> {
    const result = new Map<number, boolean>();
    for (const paperId of paperIds) {
      const hasCache = await audioCacheManager.hasCache(paperId);
      result.set(paperId, hasCache);
    }
    return result;
  }

  async removeAudioCache(paperId: number): Promise<void> {
    await audioCacheManager.removeCache(paperId);
  }

  async downloadAllAudio(
    paperIds: number[],
    audioUrls: Map<number, string>
  ): Promise<void> {
    console.log('📥 开始批量下载音频，共', paperIds.length, '个试卷');

    for (const paperId of paperIds) {
      const url = audioUrls.get(paperId);
      if (!url) {
        console.warn(`⚠️ 试卷 ${paperId} 没有音频地址，跳过`);
        continue;
      }

      try {
        console.log(`⬇️ 开始下载试卷 ${paperId} 的音频...`);
        await this.downloadAudio(paperId, url);
        console.log(`✅ 试卷 ${paperId} 音频下载完成`);
      } catch (error) {
        console.warn(`❌ 试卷 ${paperId} 下载失败，继续下载其他音频:`, error);
      }
    }

    console.log('📥 批量下载音频完成');
  }
}

export default new ExamStore();
