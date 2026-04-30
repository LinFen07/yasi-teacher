# 设计文档

## 概述

本设计实现了学生答案批量提交的数据结构优化。通过引入数据转换层，我们将在 `requestConcurrency` 函数中对提交数据进行清理和规范化，移除冗余字段，只保留后端 API 所需的必需字段。这种方法减少了请求负载大小，提高了性能，同时保持了向后兼容性和现有功能的完整性。

### 设计目标

1. 减少请求负载大小（移除冗余字段）
2. 标准化数据格式（规范化 type 字段）
3. 提高代码可维护性（引入专用转换函数）
4. 保持类型安全（TypeScript 类型定义）
5. 确保向后兼容性（不破坏现有功能）

## 架构

### 当前架构

```
调用方 → requestConcurrency → submitAnswerBatch → 后端 API
         (直接传递原始数据)
```

### 优化后架构

```
调用方 → requestConcurrency → transformAnswerData → submitAnswerBatch → 后端 API
         (原始数据)          (数据转换层)        (优化后数据)
```

### 架构决策

**决策 1: 在 requestConcurrency 中进行数据转换**
- 理由：这是数据流的中心点，所有提交都经过此处
- 优势：集中处理，易于维护和测试
- 劣势：增加了 requestConcurrency 的职责

**决策 2: 创建独立的转换函数而非内联逻辑**
- 理由：提高可测试性和可复用性
- 优势：纯函数，易于单元测试，可在其他地方复用
- 劣势：增加了一个额外的函数

**决策 3: 保留 StudentAnswer 类型不变**
- 理由：避免破坏现有代码
- 优势：向后兼容，减少重构范围
- 劣势：类型定义与实际提交的数据不完全一致

## 组件和接口

### 1. OptimizedAnswerPayload 类型

定义优化后的答案负载结构：

```typescript
export type OptimizedAnswerPayload = {
  paperId: number;
  questionId: number;
  studentAnswer: string;
  studentId: number;
  questionType: string;
  questionOrder: number;
  prefix: string;
  type: 'studentAnswer';
}
```

**字段说明：**
- `paperId`: 试卷 ID（必需）
- `questionId`: 问题 ID（必需）
- `studentAnswer`: 学生答案内容（必需）
- `studentId`: 学生 ID（必需）
- `questionType`: 问题类型（必需）
- `questionOrder`: 问题顺序（必需）
- `prefix`: 前缀标识（必需）
- `type`: 固定值 "studentAnswer"（必需）

### 2. transformAnswerData 函数

将 StudentAnswer 对象转换为优化的负载格式：

```typescript
function transformAnswerData(answer: StudentAnswer): OptimizedAnswerPayload {
  // 验证必需字段
  validateRequiredFields(answer);
  
  // 返回优化后的对象
  return {
    paperId: answer.paperId,
    questionId: answer.questionId,
    studentAnswer: answer.studentAnswer,
    studentId: answer.studentId,
    questionType: answer.questionType,
    questionOrder: answer.questionOrder,
    prefix: answer.prefix,
    type: 'studentAnswer'
  };
}
```

**函数特性：**
- 纯函数（无副作用）
- 输入验证
- 类型安全
- 可导出供其他模块使用

### 3. transformAnswerDataBatch 函数

批量转换 StudentAnswer 数组：

```typescript
function transformAnswerDataBatch(answers: StudentAnswer[]): OptimizedAnswerPayload[] {
  return answers.map(transformAnswerData);
}
```

**函数特性：**
- 使用 map 进行函数式转换
- 保持数组顺序
- 继承单个转换函数的验证逻辑

### 4. validateRequiredFields 函数

验证必需字段的存在性和类型：

```typescript
function validateRequiredFields(answer: StudentAnswer): void {
  const requiredFields: (keyof StudentAnswer)[] = [
    'paperId',
    'questionId',
    'studentAnswer',
    'studentId',
    'questionType',
    'questionOrder',
    'prefix'
  ];
  
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (answer[field] === undefined || answer[field] === null) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(
      `缺少必需字段: ${missingFields.join(', ')}`
    );
  }
  
  // 类型验证
  if (typeof answer.paperId !== 'number') {
    throw new Error('paperId 必须是数字类型');
  }
  if (typeof answer.questionId !== 'number') {
    throw new Error('questionId 必须是数字类型');
  }
  if (typeof answer.studentAnswer !== 'string') {
    throw new Error('studentAnswer 必须是字符串类型');
  }
  if (typeof answer.studentId !== 'number') {
    throw new Error('studentId 必须是数字类型');
  }
  if (typeof answer.questionType !== 'string') {
    throw new Error('questionType 必须是字符串类型');
  }
  if (typeof answer.questionOrder !== 'number') {
    throw new Error('questionOrder 必须是数字类型');
  }
  if (typeof answer.prefix !== 'string') {
    throw new Error('prefix 必须是字符串类型');
  }
}
```

### 5. 更新后的 requestConcurrency 函数

集成数据转换逻辑：

```typescript
export function requestConcurrency(data: StudentAnswer[]) {
  return new Promise((resolve, reject) => {
    // 转换数据为优化格式
    let optimizedData: OptimizedAnswerPayload[];
    try {
      optimizedData = transformAnswerDataBatch(data);
    } catch (error) {
      return reject(new Error(`数据验证失败: ${error.message}`));
    }
    
    // 初始网络检查
    if (!navigator.onLine) {
      cacheFailedRequests(optimizedData);
      return reject(new Error("网络不可用，请求已缓存"));
    }

    let queue = [...optimizedData];
    const results: any[] = [];
    
    const processNext = () => {
      if (queue.length === 0) {
        localStorage.removeItem("cachedAnswers");
        return resolve(results);
      }
      if (!navigator.onLine) {
        cacheFailedRequests(queue);
        return reject(new Error("网络中断，未完成请求已缓存"));
      }

      retryWithBackoff(() => submitAnswerBatch(queue), 3)
        .then((res) => {
          results.push(res);
          processNext();
        })
        .catch((error) => {
          if (error.isNetworkError) {
            cacheFailedRequests([...queue]);
            reject(new Error("网络错误，请求已缓存"));
          } else {
            reject(new Error(`提交失败: ${error.message}`));
          }
        });
    };

    processNext();
  });
}
```

### 6. 更新缓存函数

缓存函数需要支持 OptimizedAnswerPayload 类型：

```typescript
function cacheFailedRequests(
  requests: StudentAnswer[] | OptimizedAnswerPayload[]
) {
  const cached = JSON.parse(localStorage.getItem("cachedAnswers") || "[]");
  cached.push(
    ...requests.map((item) => ({ data: item, timestamp: Date.now() }))
  );
  localStorage.setItem("cachedAnswers", JSON.stringify(cached));
}

function loadCachedRequests(): OptimizedAnswerPayload[] {
  const cached = JSON.parse(localStorage.getItem("cachedAnswers") || "[]");
  return cached.map((entry: any) => entry.data);
}
```

## 数据模型

### StudentAnswer（现有类型，保持不变）

```typescript
export type StudentAnswer = {
  paperId: number;
  questionId: number;
  studentAnswer: string;
  studentId: number;
  questionType: string;
  questionOrder: number;
  prefix: string;
}
```

### OptimizedAnswerPayload（新增类型）

```typescript
export type OptimizedAnswerPayload = {
  paperId: number;
  questionId: number;
  studentAnswer: string;
  studentId: number;
  questionType: string;
  questionOrder: number;
  prefix: string;
  type: 'studentAnswer';
}
```

### 数据转换流程

```
StudentAnswer → transformAnswerData → OptimizedAnswerPayload
    ↓                                         ↓
  验证字段                                  添加 type 字段
  保留必需字段                              移除冗余字段
```

### 负载大小对比

**优化前（假设示例）：**
```json
{
  "content": "",
  "contentArray": [],
  "doRight": true,
  "id": 123,
  "itemOrder": 1,
  "prefix": "A",
  "questionId": 456,
  "questionScore": "10",
  "score": "8",
  "paperId": 789,
  "studentAnswer": "答案内容",
  "studentId": 101,
  "questionType": "single",
  "questionOrder": 1
}
```
估计大小：~250 字节

**优化后：**
```json
{
  "paperId": 789,
  "questionId": 456,
  "studentAnswer": "答案内容",
  "studentId": 101,
  "questionType": "single",
  "questionOrder": 1,
  "prefix": "A",
  "type": "studentAnswer"
}
```
估计大小：~150 字节

**节省：约 40% 的负载大小**


## 正确性属性

属性是一种特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。

### 属性 1: 转换保留所有必需字段且只保留必需字段

*对于任何* 有效的 StudentAnswer 对象，转换后的 OptimizedAnswerPayload 应该包含所有必需字段（paperId, questionId, studentAnswer, studentId, questionType, questionOrder, prefix, type），且不包含其他字段。

**验证需求: 1.1, 1.2, 3.2**

### 属性 2: 优化后负载更小

*对于任何* 包含额外字段的原始数据对象，转换为 OptimizedAnswerPayload 后的 JSON 字符串长度应该小于或等于原始对象的 JSON 字符串长度。

**验证需求: 1.4**

### 属性 3: Type 字段始终为 studentAnswer

*对于任何* StudentAnswer 对象，转换后的 OptimizedAnswerPayload 的 type 字段应该始终等于字符串 "studentAnswer"。

**验证需求: 2.1, 2.3**

### 属性 4: 批量转换保持数组长度

*对于任何* StudentAnswer 对象数组，批量转换后返回的 OptimizedAnswerPayload 数组长度应该等于输入数组长度。

**验证需求: 3.3**

### 属性 5: 纯函数特性

*对于任何* StudentAnswer 对象，多次调用 transformAnswerData 应该返回深度相等的结果（相同输入产生相同输出）。

**验证需求: 3.4**

### 属性 6: 网络不可用时缓存优化数据

*对于任何* StudentAnswer 数组，当 navigator.onLine 为 false 时调用 requestConcurrency，localStorage 中应该存储转换后的 OptimizedAnswerPayload 数据，而不是原始 StudentAnswer 数据。

**验证需求: 6.1**

### 属性 7: 必需字段缺失时抛出错误

*对于任何* 缺少一个或多个必需字段（paperId, questionId, studentAnswer, studentId, questionType, questionOrder, prefix）的对象，调用 transformAnswerData 应该抛出包含缺失字段名称的错误。

**验证需求: 7.1, 7.2**

### 属性 8: 类型错误时抛出错误

*对于任何* 必需字段类型不正确的 StudentAnswer 对象（例如 paperId 是字符串而非数字），调用 transformAnswerData 应该抛出描述类型错误的错误。

**验证需求: 7.4**

## 错误处理

### 验证错误

**场景**: 转换函数接收到无效数据
- **检测**: validateRequiredFields 函数检查字段存在性和类型
- **响应**: 抛出描述性错误，指明具体问题
- **错误消息格式**:
  - 缺失字段: `"缺少必需字段: field1, field2"`
  - 类型错误: `"fieldName 必须是 expectedType 类型"`

### 网络错误

**场景**: 网络不可用或请求失败
- **检测**: navigator.onLine 检查和 API 请求失败
- **响应**: 
  1. 将优化后的数据缓存到 localStorage
  2. 返回描述性错误消息
  3. 网络恢复时自动重试
- **重试策略**: 指数退避，最多 3 次重试

### 缓存错误

**场景**: localStorage 操作失败
- **检测**: try-catch 包裹 localStorage 操作
- **响应**: 记录错误但不阻止主流程
- **降级策略**: 如果缓存失败，继续尝试提交

### 类型错误

**场景**: TypeScript 类型不匹配
- **检测**: 编译时类型检查
- **响应**: 编译错误，阻止构建
- **预防**: 严格的类型定义和接口

## 测试策略

### 双重测试方法

我们将采用单元测试和基于属性的测试相结合的方法：

- **单元测试**: 验证特定示例、边缘情况和错误条件
- **属性测试**: 验证跨所有输入的通用属性

两者是互补的，对于全面覆盖都是必需的。单元测试捕获具体的错误，属性测试验证一般正确性。

### 单元测试策略

单元测试应该专注于：
- **特定示例**: 演示正确行为的具体案例
- **边缘情况**: 空字符串、零值、边界值
- **错误条件**: 缺失字段、类型错误、网络失败
- **集成点**: 组件之间的交互

避免编写过多的单元测试 - 基于属性的测试处理大量输入的覆盖。

### 基于属性的测试配置

**测试库选择**: 使用 `fast-check` 库（TypeScript/JavaScript 的属性测试库）

**配置要求**:
- 每个属性测试最少运行 100 次迭代（由于随机化）
- 每个测试必须引用其设计文档属性
- 标签格式: `Feature: optimize-submit-answer-data, Property {number}: {property_text}`
- 每个正确性属性必须由单个基于属性的测试实现

**示例配置**:
```typescript
import fc from 'fast-check';

// Feature: optimize-submit-answer-data, Property 1: 转换保留所有必需字段且只保留必需字段
test('transformAnswerData preserves all required fields and only required fields', () => {
  fc.assert(
    fc.property(
      studentAnswerArbitrary,
      (answer) => {
        const result = transformAnswerData(answer);
        const expectedKeys = [
          'paperId', 'questionId', 'studentAnswer', 
          'studentId', 'questionType', 'questionOrder', 
          'prefix', 'type'
        ];
        expect(Object.keys(result).sort()).toEqual(expectedKeys.sort());
      }
    ),
    { numRuns: 100 }
  );
});
```

### 测试覆盖范围

**转换函数测试**:
- 属性测试: 属性 1, 2, 3, 5, 7, 8
- 单元测试: 特定示例、边缘情况

**批量转换测试**:
- 属性测试: 属性 4
- 单元测试: 空数组、单个元素、多个元素

**集成测试**:
- requestConcurrency 与转换函数的集成
- 缓存机制（属性 6）
- 重试逻辑
- 网络恢复处理

**端到端测试**:
- 完整的提交流程
- 离线场景
- 错误恢复

### 测试数据生成

使用 fast-check 的 arbitrary 生成器创建测试数据：

```typescript
const studentAnswerArbitrary = fc.record({
  paperId: fc.integer({ min: 1 }),
  questionId: fc.integer({ min: 1 }),
  studentAnswer: fc.string(),
  studentId: fc.integer({ min: 1 }),
  questionType: fc.constantFrom('single', 'multiple', 'blank', 'essay'),
  questionOrder: fc.integer({ min: 1 }),
  prefix: fc.constantFrom('A', 'B', 'C', 'D', 'E')
});
```

### 测试隔离

- 每个测试应该独立运行
- 清理 localStorage 在每个测试之前和之后
- 模拟网络状态和 API 调用
- 不依赖外部服务

### 持续集成

- 所有测试在 CI/CD 管道中运行
- 属性测试使用固定的随机种子以保证可重现性
- 测试失败阻止部署
- 代码覆盖率目标: 90% 以上
