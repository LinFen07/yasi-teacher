import axios from "axios";
import { getNewAppraise } from "../store/tasks";
const putAppraise = (appraise, id) => {
    return async (dispatch) => {
        try {
            const response = await axios.post(`http://120.24.144.113:8668/api/teacher/examassignment/addAppraise?appraise=${appraise}&id=${id}`);
            console.log(`评价 ${appraise} id ${id}`);
            dispatch(getNewAppraise(id));
        } catch (error) {
            console.error('请求出错:', error);
        }
    };
};

export { putAppraise };