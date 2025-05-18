import axios from "axios";
import { getNewAppraise } from "../store/tasks";
import { request } from "../utils/request.js"
const putAppraise = (appraise, id) => {
    return async (dispatch) => {
        try {
            const response = await request.post(`/api/teacher/examassignment/addAppraise?appraise=${appraise}&id=${id}`);
            console.log(`评价 ${appraise} id ${id}`);
            // dispatch(getNewAppraise(id));
        } catch (error) {
            console.error('请求出错:', error);
        }
    };
};

export { putAppraise };