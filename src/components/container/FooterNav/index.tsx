import "./index.scss";

import { Button, Space } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import store from "@/stores";
import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { reaction, runInAction } from "mobx";

type pageType = {
  title: string;
  headTitleExpain: string;
  questionArr: number[];
  maxNum: number;
};

type propType = {
  type: string;
};

function footerNav(props: propType) {
  const { type } = props;

  const exam =
    type === "listen"
      ? store.ExamStore.getListenExam()
      : type === "read"
      ? store.ExamStore.getReadExam()
      : store.ExamStore.getWritteExam();
  let currentPage = store.ExamStore.currentExamIndex;

  const [curren, setCurren] = useState(currentPage);

  const getQuestionArr = (prevLen: number, len: number) => {
    const questionArr = [];
    let currLen = prevLen + len;
    for (let i = prevLen; i < currLen; i++) {
      questionArr.push(i + 1);
    }
    return {
      questionArr,
      currLen,
    };
  };

  let prevLen = 0;
  const initialPageArr = exam.map((part, index) => {
    let allLen = 0;
    for (let i = 0; i < part.questionItems.length; i++) {
      const len = part.questionItems[i].correctArray
        ? part.questionItems[i].correctArray.length
        : 1;
      allLen += len;
    }
    //@ts-ignore
    const { questionArr, currLen } = getQuestionArr(prevLen, allLen);
    prevLen = currLen;

    let writteTitle = "";
    // if(type === 'writte') {
    //   if(index == 0)
    //     writteTitle = 'You should spend about 20 minutes on this task. Write at least 150 words.'
    //   else
    //     writteTitle = 'You should spend about 40 minutes on this task. Write at least 250 words.'
    // }
    let headTitleExpain =
      type === "listen"
        ? ` Questions ${prevLen - allLen + 1} - ${prevLen}`
        : type === "read"
        ? ` Read the passage below and answer questions ${
            prevLen - allLen + 1
          } - ${prevLen}`
        : type === "writte"
        ? `${writteTitle}`
        : "";
    return {
      title: `Part${index + 1}`,
      headTitleExpain,
      questionArr: questionArr,
      maxNum: currLen,
    };
  });

  const [PageArr, setPageArr] = useState<Array<pageType>>([]);

  const handleChangeTitle = (curren: number) => {
    for (let page of PageArr) {
      if (page.maxNum >= curren) {
        store.ExamStore.changeCurrentTitle(page.title);
        store.ExamStore.changeTitleExpain(page.headTitleExpain);
        break;
      }
    }
  };

  useEffect(() => {
    setPageArr(initialPageArr);

    // 从localStorage恢复状态
    const savedIndex = store.ExamStore.currentExamIndex;
    const savedTitle = store.ExamStore.currentExamTitle;

    setCurren(savedIndex);

    // 验证保存的标题是否在当前模块中存在
    const titleExists = initialPageArr.some(page => page.title === savedTitle);
    const savedIndexValid = initialPageArr.some(page => page.maxNum >= savedIndex);

    runInAction(() => {
      // 如果有保存的状态，且标题在当前模块中存在，则使用保存的状态
      if (savedTitle && titleExists && savedIndexValid) {
        // 根据保存的currentExamIndex找到对应的页面信息
        handleChangeTitle(savedIndex);
      } else if (initialPageArr.length > 0) {
        // 使用默认状态（模块切换时标题不匹配，默认从 Part1 开始）
        store.ExamStore.changeCurrentTitle(initialPageArr[0].title);
        store.ExamStore.changeTitleExpain(initialPageArr[0].headTitleExpain);
        store.ExamStore.changeCurrent(1);
        setCurren(1);
      }
    });
  }, []);

  const activeAction = (num: number) => {
    runInAction(() => {
      store.ExamStore.changeCurrent(num);
      setCurren(store.ExamStore.currentExamIndex);
      handleChangeTitle(num);
    });

    // 保存页面状态到localStorage
    try {
      const state = {
        currentExamIndex: num,
        currentExamTitle: store.ExamStore.currentExamTitle,
        currentPageType: type,
        paperId: store.ExamStore.paperId,
      };
      localStorage.setItem('examPageState', JSON.stringify(state));
    } catch (error) {
      console.warn('保存页面状态失败:', error);
    }
  };

  const handleArrowAction = (arrow: string) => {
    let newIndex = curren;
    runInAction(() => {
      if (arrow == "left") {
        newIndex = curren - 1;
        setCurren(newIndex);
        store.ExamStore.changeCurrent(newIndex);
        handleChangeTitle(newIndex);
      } else if (arrow == "right") {
        newIndex = curren + 1;
        setCurren(newIndex);
        store.ExamStore.changeCurrent(newIndex);
        handleChangeTitle(newIndex);
      }
    });

    // 保存页面状态到localStorage
    try {
      const state = {
        currentExamIndex: newIndex,
        currentExamTitle: store.ExamStore.currentExamTitle,
        currentPageType: type,
        paperId: store.ExamStore.paperId,
      };
      localStorage.setItem('examPageState', JSON.stringify(state));
    } catch (error) {
      console.warn('保存页面状态失败:', error);
    }
  };

  const [correctAnswers, setCorrectAnswers] = useState(
    store.ExamStore.correctListenAnswer
  );

  useEffect(() => {
    const dispose = reaction(
      () => store.ExamStore.correctListenAnswer.slice(),
      (correctListenAnswer) => {
        setCorrectAnswers(correctListenAnswer);
      }
    );

    // 清理 reaction
    return () => dispose();
  }, []);

  return (
    <div className="nav">
      <div className="paginaction">
        {PageArr.map((item, index) => (
          <ul style={{ display: "flex" }} key={index}>
            {item.title}
            {item.questionArr.map((e, i) => (
              <li key={e}>
                <button
                  style={
                    e == curren
                      ? { backgroundColor: "rgba(89, 174, 227, 0.931)" }
                      : {}
                  }
                  className={`${
                    correctAnswers.includes(e) ? "selectedAnswer" : ""
                  } `}
                  type="button"
                  onClick={() => activeAction(e)}
                >
                  {e}
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div className="footerRight">
        <Space>
          <Button
            size="large"
            className="navButton"
            icon={<ArrowLeftOutlined style={{ fontSize: "32px" }} />}
            onClick={() => handleArrowAction("left")}
            disabled={curren == 1}
          ></Button>
          <Button
            size="large"
            className="navButton"
            icon={<ArrowRightOutlined style={{ fontSize: "32px" }} />}
            disabled={
              initialPageArr.length > 0 && curren == initialPageArr[initialPageArr.length - 1].maxNum
            }
            onClick={() => handleArrowAction("right")}
          ></Button>
        </Space>
      </div>
    </div>
  );
}

export default observer(footerNav);
