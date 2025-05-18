// 任务相关状态管理
import { createSlice } from "@reduxjs/toolkit";
import axios from 'axios';
import { set } from "lodash";

const tasksStore = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    currentTask: null,
    article: [],
    paper: [],
    appraise: [],
    paperName: []
  },
  reducers: {
    setTasks(state, action) {
      // console.log('调用了')
      state.tasks = action.payload
      localStorage.setItem('tasks', JSON.stringify(action.payload))
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
      const existingIndex = state.article.response.items[2].studentAnswers.findIndex(item => item.id === id);
      if (existingIndex !== -1) {
        state.article.response.items[2].studentAnswers[existingIndex].score = score.response.items[2].studentAnswers[existingIndex].score;
      }
      localStorage.setItem('article', JSON.stringify(state.article));
    },
    setPaperName(state, action) {
      // console.log(111111111111)
      state.paperName = action.payload
      localStorage.setItem('paperName', JSON.stringify(action.payload))
    }
  }
})

const { setTasks, setCurrentTask, updateTask, setPaper, setArticle, setAppraise, addAppraise, setConfrim, updatePaperStatus, addScore, setStudentsInfo, setStudentsAnswers, setComposition, setPaperName } = tasksStore.actions;
const fetchArticle = (userId, id) => {  // 接收参数 
  return async (dispatch) => {
    try {
      const response = await axios.get('http://120.24.144.113:8668/api/teacher/exam/paper/allIdAndJudge?pageSize=50', {
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

// 定义获取作文信息的函数
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
      const res = await axios.get(`http://120.24.144.113:8668/api/teacher/examassignment/page?pageSize=50`);
      // console.log(res.data);
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

const getTask = (userId) => {
  return async (dispatch) => {
    try {
      const res = await axios.post(`http://120.24.144.113:8668/api/teacher/teacherAssignment/pageList?userId=${userId}`)
      const count = res.data.response.counts;
      const res_2 = await axios.post(`http://120.24.144.113:8668/api/teacher/teacherAssignment/pageList?userId=${userId}&pageSize=${count}`)
      const task = res_2.data
      dispatch(setTasks(task))
    } catch (error) {
      console.error('请求出错:', error)
    }
  }
}

const getStudentsInfo = (examPaperId) => {
  return async (dispatch) => {
    try {
      const res = await axios.get(`http://120.24.144.113:8668/api/teacher/examassignment/${examPaperId}`)
      const studentId = res.data.response.userId
      const paperId = res.data.response.examPaperId
      const appraise = res.data.response.appraise
      const studentsInfo = {
        studentId,
        paperId,
        appraise
      }
      return studentsInfo;
    } catch (error) {
      // console.error('请求出错', error)
    }
  }
}

const getStudentsAnswers = (studentsInfo) => {
  return async (dispatch) => {
    try {
      const { studentId, paperId } = studentsInfo;
      // 构建请求体数据
      const requestData = {
        "studentId": studentId,
        "paperId": paperId
      };

      const res = await axios.post(
        `http://120.24.144.113:8668/api/teacher/studentAnswer/page`,
        requestData
      );
      const count = res.data.response.counts
      const res_2 = await axios.post(
        `http://120.24.144.113:8668/api/teacher/studentAnswer/page?pageSize=${count}`,
        requestData
      );
      const studentAnswer = res_2.data.response.items
      return studentAnswer
    } catch (error) {
    }
  };
};

const getComposition = (studentsInfo) => {
  return async (dispatch) => {
    try {
      const { studentId, paperId } = studentsInfo;
      // 构建请求体数据
      const requestData = {
        "studentId": studentId,
        "paperId": paperId,
        "questionType": 7
      };

      const res = await axios.post(
        `http://120.24.144.113:8668/api/teacher/studentAnswer/page`,
        requestData
      );
      const composition = res.data.response.items
      console.log('返回的数据', composition)
      return composition
    } catch (error) {
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

const selectNameById = (studentsInfo) => {
  return async (dispatch) => {
    try {
      const { studentId } = studentsInfo
      const res = await axios.post(`http://120.24.144.113:8668/api/teacher/user/select/${studentId}`);
      const studentName = res.data.response.realName
      return studentName
    } catch (error) {
      // console.error('请求出错:', error);
      // return null;
    }
  };
}
//获取原题
const getOriginalTitel = (questionId) => {
  return async (dispatch) => {
    try {
      const res = await axios.post(`http://120.24.144.113:8668/api/teacher/question/select/${questionId}`)
      const title = res.data.response
      return title
    } catch (error) {
      console.error(error)
    }
  }
}

//获取试卷名字
const getPaperName = () => {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        'http://120.24.144.113:8668/api/teacher/exam/paper/pageList',
        {
          pageIndex: 0,
          pageSize: 1,
          paperType: 1
        }
      );
      const count = response.data.response.total
      console.log(count)
      const response_2 = await axios.post(
        'http://120.24.144.113:8668/api/teacher/exam/paper/pageList',
        {
          pageIndex: 0,
          pageSize: count,
          paperType: 1
        }
      );
      const paperName = response_2.data.response.list
      dispatch(setPaperName(paperName))
    } catch (error) {
      console.error('获取试卷列表失败:', error);
      throw error;
    }
  };
}
// 导出相关 action
export { setTasks, setCurrentTask, updateTask, setPaper, fetchCompositionInfo, fetchArticle, setArticle, getAppraise, getNewAppraise, getConfrim, updatePaperStatus, getTask, getStudentsInfo, getStudentsAnswers, getComposition, selectById, selectNameById, getOriginalTitel, getPaperName };
export default tasksStore.reducer;
