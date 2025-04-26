import { submitAnswer } from '@/api/studentAnswer';
import { StudentAnswer } from '@/typings/exam';


export function requestConcurrency(data: StudentAnswer[]) {
  return new Promise((resolve, reject) => {
    //初始化请求队列
    const waitQueue = data.map((item) => () =>
      submitAnswer(item)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      })
      .finally(() => {
        //请求完成后从队列中获取下一个请求
        const next = waitQueue.shift();
        if(next) {
          next();
        }
      })
    );

    // 开始第一个请求
    waitQueue.shift()?.();
  });
}