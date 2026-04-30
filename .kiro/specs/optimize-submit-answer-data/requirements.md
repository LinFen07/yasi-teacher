# 需求文档

## 简介

本规范旨在优化学生批量提交答案时发送到后端的数据结构。当前实现在请求负载中发送了不必要的字段，增加了带宽使用并可能造成混淆。此优化将精简数据结构，仅包含必需字段，同时保持向后兼容性和系统功能。

## 术语表

- **StudentAnswer（学生答案）**: 表示学生对某个问题的答案的数据结构
- **SubmitAnswerBatch（批量提交答案）**: 接受单个请求中多个学生答案的 API 端点
- **RequestConcurrency（请求并发处理）**: 管理并发请求处理的工具函数，包含重试逻辑和离线缓存
- **Payload（请求负载）**: HTTP 请求体中发送的数据
- **Essential_Fields（必需字段）**: 后端 API 所需的最小字段集（paperId, questionId, studentAnswer, studentId, questionType, questionOrder, prefix）
- **Redundant_Fields（冗余字段）**: 当前发送但后端不需要的字段（content, contentArray, doRight, itemOrder, score）

## 需求

### 需求 1: 数据结构优化

**用户故事:** 作为开发者，我希望优化请求负载结构，以便减少带宽使用并提高 API 性能。

#### 验收标准

1. WHEN 准备批量提交数据时，THE RequestConcurrency SHALL 从负载中移除所有冗余字段
2. WHEN 准备批量提交数据时，THE RequestConcurrency SHALL 保留所有必需字段（paperId, questionId, studentAnswer, studentId, questionType, questionOrder, prefix）
3. WHEN 发送优化后的负载时，THE Backend_API SHALL 成功处理而不出错
4. WHEN 比较负载大小时，THE Optimized_Payload SHALL 小于原始负载

### 需求 2: Type 字段规范化

**用户故事:** 作为后端开发者，我希望 type 字段始终设置为 "studentAnswer"，以便 API 能够正确识别和路由请求。

#### 验收标准

1. WHEN 准备答案数据时，THE RequestConcurrency SHALL 为每个答案项设置 type 字段为 "studentAnswer"
2. WHEN 后端接收负载时，THE Backend_API SHALL 识别 type 字段值
3. WHERE type 字段缺失或不正确时，THE RequestConcurrency SHALL 将其规范化为 "studentAnswer"

### 需求 3: 数据转换函数

**用户故事:** 作为开发者，我希望有一个专用的数据转换函数，以便优化逻辑可复用且易于维护。

#### 验收标准

1. THE System SHALL 提供一个将 StudentAnswer 对象转换为优化负载格式的函数
2. WHEN 转换函数接收 StudentAnswer 对象时，THE Function SHALL 返回仅包含必需字段的对象
3. WHEN 转换函数处理 StudentAnswer 对象数组时，THE Function SHALL 返回优化对象数组
4. THE Transformation_Function SHALL 是纯函数（无副作用）

### 需求 4: 向后兼容性

**用户故事:** 作为系统管理员，我希望优化保持向后兼容性，以便现有功能继续正常工作而不中断。

#### 验收标准

1. WHEN 提交优化后的负载时，THE Existing_API_Endpoints SHALL 继续正常工作
2. WHEN 网络恢复后重试缓存的答案时，THE System SHALL 成功处理它们
3. WHEN 触发重试机制时，THE System SHALL 使用优化后的负载工作
4. THE StudentAnswer 类型定义 SHALL 与现有代码保持兼容

### 需求 5: 类型安全

**用户故事:** 作为开发者，我希望为优化后的负载提供 TypeScript 类型定义，以便在编译时捕获错误。

#### 验收标准

1. THE System SHALL 为优化后的负载结构定义 TypeScript 类型
2. WHEN 使用转换函数时，THE TypeScript_Compiler SHALL 强制类型正确性
3. WHEN 必需字段缺失时，THE TypeScript_Compiler SHALL 报告类型错误
4. THE Optimized_Payload_Type SHALL 导出供其他模块使用

### 需求 6: 请求处理完整性

**用户故事:** 作为用户，我希望我的答案能够可靠提交，以便我的工作不会丢失。

#### 验收标准

1. WHEN 网络不可用时，THE RequestConcurrency SHALL 将优化后的负载缓存到 localStorage
2. WHEN 网络恢复时，THE System SHALL 使用优化后的负载重试缓存的请求
3. WHEN 执行重试逻辑时，THE System SHALL 对优化后的负载使用指数退避
4. WHEN 所有重试失败时，THE System SHALL 在缓存中保留优化后的负载

### 需求 7: 数据验证

**用户故事:** 作为开发者，我希望在提交前验证必需字段，以便尽早捕获无效数据。

#### 验收标准

1. WHEN 转换数据时，THE Transformation_Function SHALL 验证必需字段是否存在
2. IF 必需字段缺失，THEN THE Transformation_Function SHALL 抛出描述性错误
3. WHEN 验证失败时，THE Error_Message SHALL 指示哪些字段缺失
4. THE Validation_Logic SHALL 检查字段的存在性和正确的数据类型
