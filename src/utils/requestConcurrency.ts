import { submitAnswer } from '@/api/studentAnswer';
import { StudentAnswer } from '@/typings/exam';

function cacheFailedRequests(requests: StudentAnswer[]) {
  const cached = JSON.parse(localStorage.getItem('cachedAnswers') || '[]');
  cached.push(...requests.map((item) => ({ data: item, timestamp: Date.now() })));
  localStorage.setItem('cachedAnswers', JSON.stringify(cached));
}

function loadCachedRequests(): StudentAnswer[] {
  const cached = JSON.parse(localStorage.getItem('cachedAnswers') || '[]');
  return cached.map((entry: any) => entry.data);
}

function retryWithBackoff(fn: Function, retries = 3): Promise<any> {
  return new Promise((resolve, reject) => {
    const attempt = (retryCount: number) => {
      fn()
        .then(resolve)
        .catch((error: Error) => {
          if (retryCount > 0) {
            setTimeout(() => attempt(retryCount - 1), 1000 * 2 ** (3 - retryCount)); // 指数退避
          } else {
            reject(error);
          }
        });
    };
    attempt(retries);
  });
}

export function requestConcurrency(data: StudentAnswer[]) {
  return new Promise((resolve, reject) => {
    // 初始网络检查
    if (!navigator.onLine) {
      cacheFailedRequests(data);
      return reject(new Error('网络不可用，请求已缓存'));
    }

    let queue = [...data];
    const results: any[] = [];
    const processNext = () => {
      if (queue.length === 0) {
        localStorage.removeItem('cachedAnswers');
        return resolve(results);
      }
      if (!navigator.onLine) {
        cacheFailedRequests(queue);
        return reject(new Error('网络中断，未完成请求已缓存'));
      }

      const currentItem = queue.shift()!;
      retryWithBackoff(() => submitAnswer(currentItem), 3) // 使用重试机制
        .then((res) => {
          results.push(res);
          processNext();
        })
        .catch((error) => {
          if (error.isNetworkError) {
            cacheFailedRequests([currentItem, ...queue]);
            reject(new Error('网络错误，请求已缓存'));
          } else {
            reject(new Error(`提交失败: ${error.message}`));
          }
        });
    };

    // 开始处理队列
    processNext();
  });
}

// 网络恢复监听（全局初始化）
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const cachedData = loadCachedRequests();
    if (cachedData.length > 0) {
      requestConcurrency(cachedData)
        .then(() => console.log('离线请求重试成功'))
        .catch(() => console.warn('部分离线请求重试失败'));
    }
  });
}