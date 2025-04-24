// 任务相关状态管理
import { createSlice } from "@reduxjs/toolkit";
import axios from 'axios';
import { set } from "lodash";

const tasksStore = createSlice({
  name: "tasks",
  initialState: {
    tasks: [
    ],
    currentTask: null,
    article: [],
    paper: [],
    appraise: [],
    user: null,
    question: null
  },
  reducers: {
    setTasks(state, action) {
      state.tasks = action.payload
    },
    setCurrentTask(state, action) {
      state.currentTask = action.payload
    },
    updateTask(state, action) {
      state.tasks = state.tasks.map(task =>
        task.id === action.payload.id ? action.payload : task
      )
    },
    setArticle(state, action) {
      state.article = action.payload
      localStorage.setItem('article', JSON.stringify(action.payload))
    },
    setPaper(state, action) {
      state.paper = Array.isArray(action.payload) ? action.payload : [action.payload];
      localStorage.setItem('paperInfo', JSON.stringify(state.paper));
    },
    setAppraise(state, action) {
      state.appraise = action.payload
      localStorage.setItem('appraise', JSON.stringify(action.payload))
    },
    addAppraise(state, action) {
      const { id, appraise } = action.payload;
      const existingIndex = state.appraise.response.items.findIndex(item => item.id === id);
      if (existingIndex !== -1) {
        state.appraise.response.items[existingIndex].appraise = appraise.response.appraise;
      } else {
        state.appraise.response.items.push(appraise.response);
      }
      localStorage.setItem('appraise', JSON.stringify(state.appraise));
    },
    setConfrim(state, action) {
      state.cofirm = action.payload
      localStorage.setItem('cofirm', JSON.stringify(action.payload))
    },
    updatePaperStatus(state, action) {
      const { id, status, score, gradedTime } = action.payload;
      state.paper = state.paper.map(paper =>
        paper.id === id ? { ...paper, status, score, gradedTime } : paper
      );
      localStorage.setItem('paperInfo', JSON.stringify(state.paper));
    },
    addScore(state, action) {
      const { id, score } = action.payload;
      const existingIndex = state.article.response.items[0].studentAnswers.findIndex(item => item.id === id);
      if (existingIndex !== -1) {
        state.article.response.items[0].studentAnswers[existingIndex].score = score.response.items[0].studentAnswers[existingIndex].score;
      } else {
        state.article.response.items.push(score.response)
      }
      localStorage.setItem('article', JSON.stringify(state.article));
    }
  }
})

const { setTasks, setCurrentTask, updateTask, setPaper, setArticle, setAppraise, addAppraise, setConfrim, updatePaperStatus, addScore } = tasksStore.actions;
const fetchArticle = (userId, id) => {  // 接收参数 
  return async (dispatch) => {
    try {
      const response = await axios.get('http://120.24.144.113:8668/api/teacher/exam/paper/allIdAndJudge', {
        params: {  // 注意：GET 请求参数需要通过 `params` 传递 
          userId: userId  // 使用传入的参数 
        }
      });
      const score = response.data
      if (id) {
        dispatch(addScore({ id, score }))
      } else {
        dispatch(setArticle(score));
      }
    } catch (error) {
      console.log(error)
    }
  };
};

const paperId = 2; // 请将此 ID 替换为实际的试卷 ID

// 定义接口地址
const apiUrl = `http://120.24.144.113:8668/api/teacher/exam/paper/select/${paperId}`;

const fetchCompositionInfo = (id) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(`http://120.24.144.113:8668/api/teacher/question/select/${id}`);
      const compositionInfo = response.data;
      // 确保处理后的数据是数组格式
      const processedData = Array.isArray(compositionInfo) ? compositionInfo : [compositionInfo];
      dispatch(setPaper(processedData));
    } catch (error) {
      console.error('获取作文信息失败:', error);
    }
  };
};

const getAppraise = () => {
  return async (dispatch) => {
    try {
      const res = await axios.get(`http://120.24.144.113:8668/api/teacher/examassignment/page`);
      console.log(res.data);
      const appraise = res.data
      dispatch(setAppraise(appraise))
    } catch (error) {
      console.error('请求出错:', error);
    }
  };
};
const getConfrim = ({ paperId, questionId, studentId }) => {
  return async (dispatch) => {
    try {
      const res = await axios.post(`http://120.24.144.113:8668/api/teacher/studentAnswer/isExist`, {
        paperId,
        questionId,
        studentId
      });
      console.log(res.data)
      dispatch(setConfrim(res.data))
    } catch (error) {
      console.error('请求出错:', error);
    }
  }
}

const getNewAppraise = (id) => {
  return async (dispatch) => {
    try {
      const res = await axios.get(`http://120.24.144.113:8668/api/teacher/examassignment/${id}`);
      console.log(res.data);
      const appraise = res.data
      dispatch(addAppraise({ id, appraise }));
    } catch (error) {
      console.error('请求出错:', error);
    }
  };
}

const selectById = (id) => {
  return async (dispatch) => {
    try {
      const res = await axios.post(`http://120.24.144.113:8668/api/teacher/studentAnswer/selectById/${id}`);
      console.log(res.data);
      if (res.data) {
        dispatch(setConfrim(res.data));
        return res.data; // 返回数据以便在组件中使用
      }
      return null;
    } catch (error) {
      console.error('请求出错:', error);
      return null;
    }
  };
}

const batchSelectById = (ids) => {
  return async (dispatch) => {
    try {
      const requests = ids.map(id =>
        axios.get(`http://120.24.144.113:8668/api/teacher/studentAnswer/selectById/${id}`)
      );
      const responses = await Promise.all(requests);
      const results = responses.map(res => res.data).filter(Boolean);
      results.forEach(data => dispatch(setConfrim(data)));
      return results;
    } catch (error) {
      console.error('批量请求出错:', error);
      return [];
    }
  };
}

const getUserById = (id) => {
  return async (dispatch) => {
    try {
      const res = await axios.get(`http://120.24.144.113:8668/api/teacher/user/select/${id}`);
      dispatch(setUser(res.data));
      return res.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  };
}

const setUser = (user) => {
  return {
    type: 'tasks/setUser',
    payload: user
  };
}

const getQuestionById = (id) => {
  return async (dispatch) => {
    try {
      const res = await axios.post(`http://120.24.144.113:8668/api/teacher/question/select/${id}`);
      dispatch(setQuestion(res.data));
      return res.data;
    } catch (error) {
      console.error('获取问题信息失败:', error);
      return null;
    }
  };
}

const setQuestion = (question) => {
  return {
    type: 'tasks/setQuestion',
    payload: question
  };
}

// 导出相关 action
export { setTasks, setCurrentTask, updateTask, setPaper, fetchCompositionInfo, fetchArticle, setArticle, getAppraise, getNewAppraise, getConfrim, updatePaperStatus, selectById, batchSelectById, getUserById, getQuestionById };
export default tasksStore.reducer;
