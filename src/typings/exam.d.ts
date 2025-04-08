export type Items = {
  content: string;
  itemUuid: string;
  prefix: string;
  score: string;
}

export interface Exam {
  name: string;
  questionItems: Array<ExamType>;
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
  selectionsAnswer:Array<string>;
  blanksAnswer: Array<string>;
}

export interface correct {
  key: string;
  question: number;
  answer: string;
  tag: string;
  myAn: string;
  score: string;
}

export type StudentAnswer = {
  isCorrect: number,
  paperId: number,
  questionId: number,
  studentAnswer: string,
  studentId: number,
}