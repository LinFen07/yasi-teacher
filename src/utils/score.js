import axios from "axios";
import { fetchArticle } from "../store/tasks";
import { request } from "../utils/request.js"
const postScore = (id, score) => {
    return async (dispatch) => {
        try {
            const response = await request.post(`api/teacher/exam/paper/judge?id=${id}&score=${score}`)
            console.log(`分数 ${score} id ${id}`)
            // dispatch(fetchArticle(7, id))
        } catch (error) {
            console.log(error)
        };
    };
}
export { postScore }