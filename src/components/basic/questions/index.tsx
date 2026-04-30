import { Radio, Checkbox } from "antd";
import { useState, useRef, useEffect } from "react";
import stores from "@/stores";
import parse from "html-react-parser";
import { observer } from "mobx-react";
import { runInAction } from "mobx";
import {
  computedBlanksPrevCount,
  computedCheckSelectPrevCount,
  computedPrevCount,
} from "@/utils/helper/computed";
import { submitStudentSelectAnswer } from "@/utils/browser/submitAnswer";
import TickQuestion from "../tickQuestion/index";
import DragQuestion from "../dragQuestion";
import SelectQuestion from "../selectQuestion";
import { Exam, StudentAnswer } from "@/typings/exam";
import { judgingProblem } from '@/api/studentAnswer'
function questions({ exam }: { exam: Exam[] }) {
  const [listensArr, setListensArr] = useState(exam[0]);
  const [questionsArr, setQuestionArr] = useState(listensArr.questionItems);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const questionIndex = stores.ExamStore.currentExamIndex;

  useEffect(() => {
    const index = +stores.ExamStore.currentExamTitle[4] - 1;
    setListensArr(exam[index]);
    setQuestionArr(exam[index].questionItems);
  }, [stores.ExamStore.currentExamTitle]);

  useEffect(() => {
    const initAnswers: any = exam.flatMap((item, index) => {
      return item.questionItems.flatMap((questionItem, index2) => {
        // console.log(JSON.stringify(questionItem, null, 2))
        // console.log(index)
        // 判断是否为多选题（既有correct又有correctArray）
        const hasCorrect = questionItem.correct !== null && questionItem.correct !== undefined && questionItem.correct !== '';
        const hasCorrectArray = Array.isArray(questionItem.correctArray) && questionItem.correctArray.length > 0;
        const isMultiChoice = hasCorrect && hasCorrectArray;

        // 判断是否为多空题（只有correctArray）
        const isMultiSub = hasCorrectArray && !hasCorrect;
        if (isMultiSub) {
          return questionItem.correctArray.map((correct, index3) => {
            return (
              {
                // isCorrect: 0,
                // paperId: stores.ExamStore.paperId,
                questionId: questionItem.id,
                content: "",
                prefix: `${index3 + 1}`
                // studentId: stores.UserStore.userId,
                // score: `${questionItem.items[0].score}`,
                // questionType: "",
                // questionOrder: 0,
              }
            )
          })
        } else if (isMultiChoice) {
          return ([{
            // isCorrect: 0,
            // paperId: stores.ExamStore.paperId,
            questionId: questionItem.id,
            content: "",
            prefix: "1"
            // studentId: stores.UserStore.userId,
            // score: `${questionItem.score}`,
            // questionType: "",
            // questionOrder: 0,
          }, ""])
        } else {
          return ({
            // isCorrect: 0,
            // paperId: stores.ExamStore.paperId,
            questionId: questionItem.id,
            content: "",
            prefix: "1"
            // studentId: stores.UserStore.userId,
            // score: `${questionItem.score}`,
            // questionType: "",
            // questionOrder: 0,
          })
        }
      })
    })
    stores.AnswerStore.initAnswer(initAnswers)
  }, [exam])

  const onChange = (index: number) => (e: any) => {
    const pre = computedPrevCount(stores.ExamStore.currentExamTitle, stores.ExamStore.currentExam);
    const beforeCount = questionsArr
      .slice(0, index)
      .reduce(
        (acc, q) => acc + (Array.isArray(q.correctArray) ? q.correctArray.length : 1),
        0
      );
    const start = pre + beforeCount + 1;

    stores.ExamStore.changeStudentListenAnswer(start, e.target.value);
    const examIndex = +stores.ExamStore.currentExamTitle[4] - 1;
    const value = e.target.value;

    // 向数据提交答案
    submitStudentSelectAnswer(questionsArr, index, value, start - 1);

    const updatedQuestions = { ...questionsArr[index] };
    updatedQuestions.answer = value.toString();
    const newQuestionsArr = questionsArr.map((question, idx) =>
      idx === index ? updatedQuestions : question
    );
    setQuestionArr(newQuestionsArr);
    stores.ExamStore.changeCurrent(start);
    stores.ExamStore.updateListenExam(examIndex, index, updatedQuestions);

    runInAction(() => {
      if (!stores.ExamStore.correctListenAnswer.includes(start)) {
        stores.ExamStore.correctListenAnswer.push(start);
      }
    });
  };

  const checkedOnChange = (index: number) => (checkedValues: string[]) => {
    const currentQuestion = questionsArr[index];
    let finalValues = checkedValues;
    if (checkedValues.length > 2) {
      finalValues = checkedValues.slice(-2);
    }

    const pre = computedPrevCount(stores.ExamStore.currentExamTitle, stores.ExamStore.currentExam);
    const beforeCount = questionsArr
      .slice(0, index)
      .reduce(
        (acc, q) => acc + (Array.isArray(q.correctArray) ? q.correctArray.length : 1),
        0
      );
    const start = pre + beforeCount + 1;

    stores.ExamStore.changeStudentListenAnswer(
      start,
      finalValues.toString()
    );

    const examIndex = +stores.ExamStore.currentExamTitle[4] - 1;

    submitStudentSelectAnswer(
      questionsArr,
      index,
      finalValues.toString(),
      start - 1
    );

    const updatedQuestions = { ...questionsArr[index] };
    updatedQuestions.selectionsAnswer = finalValues;
    updatedQuestions.answer = finalValues.join(",");
    const newQuestionsArr = questionsArr.map((question, idx) =>
      idx === index ? updatedQuestions : question
    );
    setQuestionArr(newQuestionsArr);
    stores.ExamStore.changeCurrent(start);
    stores.ExamStore.updateListenExam(examIndex, index, updatedQuestions);
    runInAction(() => {
      const requiredCount =
        currentQuestion && Array.isArray(currentQuestion.correctArray)
          ? currentQuestion.correctArray.length
          : 1;
      if (finalValues.length >= requiredCount) {
        for (let k = 0; k < requiredCount; k++) {
          const num = start + k;
          if (!stores.ExamStore.correctListenAnswer.includes(num)) {
            stores.ExamStore.correctListenAnswer.push(num);
          }
        }
      }
    });
  };

  useEffect(() => {
    const pre = computedPrevCount(stores.ExamStore.currentExamTitle, stores.ExamStore.currentExam);
    let currentIndexInPart = questionIndex - pre - 1;
    let accumulated = 0;
    let foundIndex = -1;

    for (let i = 0; i < questionsArr.length; i++) {
      const count = Array.isArray(questionsArr[i].correctArray) ? questionsArr[i].correctArray.length : 1;
      if (currentIndexInPart >= accumulated && currentIndexInPart < accumulated + count) {
        foundIndex = i;
        break;
      }
      accumulated += count;
    }

    if (foundIndex !== -1) {
      titleRefs.current[foundIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // 处理填空题的聚焦
      if (questionsArr[foundIndex].topicType === "4") {
        const inputAll = document.querySelectorAll(".textInput");
        const inputIndex = currentIndexInPart - accumulated;
        inputAll[inputIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        //@ts-ignore
        inputAll[inputIndex]?.focus();
      }
    }
  }, [questionIndex]);

  //字体大小
  const [fontSize, setFontSize] = useState(stores.ExamStore.FontSize);

  useEffect(() => {
    setFontSize(stores.ExamStore.FontSize);
  }, [stores.ExamStore.FontSize]);

  const stripHtmlTags = (html: string): string => {
    // 创建一个临时的 DOM 元素来安全地解析 HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // 获取纯文本内容，这样可以正确处理字符编码
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // 清理常见的 HTML 实体
    return textContent
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  const replaceFontSize = (html: string, fontSize: number): string => {
    // 确保 HTML 内容包含正确的字符编码声明
    const htmlWithMeta = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlWithMeta, "text/html");

    const elements = doc.body.querySelectorAll("*");
    elements.forEach((el: any) => {
      // 如果已有 style 属性，保留原有内容并添加 font-size
      let currentStyle = el.getAttribute("style") || "";
      const fontSizeRegex = /font-size\s*:\s*[^;]+;?/gi;
      currentStyle = currentStyle.replace(fontSizeRegex, "").trim(); // 移除已有的 font-size
      currentStyle += ` font-size:${fontSize}px;`;
      el.setAttribute("style", currentStyle);
    });

    return doc.body.innerHTML;
  };

  // 创建一个清理 HTML 的函数，只清理题目内容中的空 p 标签
  const cleanQuestionContent = (html: string): string => {
    if (!html) return html;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // 只清理题目内容中的空 p 标签，不清理选项中的
    const pElements = tempDiv.querySelectorAll("p");
    pElements.forEach(p => {
      // 检查这个 p 标签是否在选项部分（通过检查父级结构）
      const isInOption = p.closest('.ant-radio-wrapper, .ant-checkbox-wrapper');

      if (!isInOption) {
        const content = p.innerHTML.trim();
        const hasOnlyBr = /^(<br\s*\/?>)+$/.test(content);
        const isEmpty = content === '' || content === '<br>' || content === '<br/>';
        const hasOnlyWhitespace = /^\s*$/.test(p.textContent || '');

        // 新增：检查是否只包含零宽度空格
        const hasOnlyZeroWidthSpace = /^(&ZeroWidthSpace;|\u200B|\uFEFF)+$/i.test(content) ||
          /<span[^>]*>&ZeroWidthSpace;<\/span>/i.test(content) ||
          /<span[^>]*>[\u200B\uFEFF]<\/span>/i.test(content);

        if (hasOnlyBr || isEmpty || hasOnlyWhitespace || hasOnlyZeroWidthSpace) {
          p.remove();
        }
      }
    });

    return tempDiv.innerHTML;
  };

  // useEffect(() => {
  //   console.log(JSON.stringify(questionsArr, null, 2))
  // }, [questionsArr])

  // 使用 CSS 隐藏题目内容中的空 p 标签，但不影响选项
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* 只针对题目内容区域的空 p 标签 */
      .listencontent > div > div:first-child p:empty,
      .listencontent > div > div:first-child p:has(> br:only-child),
      .listencontent > div > div:first-child p:has(> br:first-child:last-child),
      .listencontent > div > div:first-child p:contains("&ZeroWidthSpace;"),
      .listencontent > div > div:first-child p:has(span:contains("&ZeroWidthSpace;")) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="listencontent">
      {questionsArr.map((questionArr, index) => (
        <div key={index}>
          {questionArr.topicType == "5" ? (
            <TickQuestion {...questionArr}></TickQuestion>
          ) : questionArr.topicType == "6" ? (
            <DragQuestion {...questionArr}></DragQuestion>
          ) : questionArr.topicType == "4" ? (
            <div>{parse(cleanQuestionContent(replaceFontSize(questionArr.title, fontSize)))}</div>
          ) : (
            <div ref={(el) => (titleRefs.current[index] = el)}>
              {parse(cleanQuestionContent(replaceFontSize(questionArr.title, fontSize)))}
              {/* 显示双选题提示 */}
              {questionArr.topicType === "7" && (
                <span style={{ color: "#666", fontSize: "14px" }}>（最多选两项）</span>
              )}
            </div>
          )}
          <div>
            {questionArr.topicType == "1" ? (
              <Radio.Group
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onChange={onChange(index)}
                value={questionArr.answer ? questionArr.answer : ""}
                options={questionArr.items.map((opt) => ({
                  value: opt.prefix,
                  label: (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: `${fontSize}px`,
                      }}
                    >
                      {opt.prefix}
                      <p style={{ width: "8px" }}></p>
                      {stripHtmlTags(opt.content)}
                    </span>
                  ),
                }))}
              ></Radio.Group>
            ) : questionArr.topicType == "2" || questionArr.topicType == "7" ? (
              <Checkbox.Group
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onChange={checkedOnChange(index)}
                value={
                  questionArr.selectionsAnswer
                    ? questionArr.selectionsAnswer
                    : []
                }
                options={questionArr.items.map((opt) => ({
                  value: opt.prefix,
                  label: (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: `${fontSize}px`,
                      }}
                    >
                      {opt.prefix}
                      <p style={{ width: "8px" }}></p>
                      {stripHtmlTags(opt.content)}
                    </span>
                  ),
                }))}
              ></Checkbox.Group>
            ) : (
              <></>
            )}
          </div>
          <div style={{ height: "24px" }}></div>
        </div>
      ))}
    </div>
  );
}

export default observer(questions);