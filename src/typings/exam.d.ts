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
  topicType: string;
  score: string;
  subjectId: number;
  title: string;
  answer: string | null;
  selectionsAnswer: Array<string>;
  blanksAnswer: Array<string>;
}

export interface correct {
  key: string;
  questionId: number;
  answer: string;
  isCorrect: string;
  studentAnswer: string;
  score: number;
}

export type StudentAnswer = {
  // isCorrect: number,
  prefix: string,
  questionId: number,
  content: string,
  // score: string,
  // questionType: string,
  // questionOrder: number,
}

export type StudentSubmitAnswer = {
  answerItems: StudentAnswer[],
  doTime: number,
  id: number,
  type: string,
  userId: number
}

export type StudentWritingAnswer = {
  paperId: number,
  questionId: number,
  composition: string,
  studentId: number,
  // createTime: number,
  // updateTime: number
}

export type Correct = {
  questonId: number;
  correct: string;
}

export type textArr = {
  text: string;
  isHightlight: boolean;
  note: string;
  menuPosition: {
    x: number;
    y: number;
  };
  selection: Selection | null
}