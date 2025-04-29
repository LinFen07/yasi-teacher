import axios from "axios";
import { fetchArticle } from "../store/tasks";
const postScore = (id, score) => {
    return async (dispatch) => {
        try {
            const response = await axios.post(`http://120.24.144.113:8668/api/teacher/exam/paper/judge?id=${id}&score=${score}`)
            console.log(`分数 ${score} id ${id}`)
            // dispatch(fetchArticle(7, id))
        } catch (error) {
            console.log(error)
        };
    };
}
export { postScore }