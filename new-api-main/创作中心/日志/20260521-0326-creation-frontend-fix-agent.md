# Creation 前端修复日志

**时间**: 2026-05-21 03:26

## 修改文件列表
- `/docs/creation/CONTEXT.md` (新增)
- `/docs/creation/API_CONTRACT.md` (新增)
- `/docs/creation/FRONTEND_PLAN.md` (新增)
- `/docs/creation/HANDOFF.md` (新增)
- `/docs/creation/CHANGELOG.md` (新增)
- `/.env.example` (修改)
- `/src/types/creation/model.ts` (新增)
- `/src/api/http.ts` (新增)
- `/src/api/creation/services.ts` (新增)
- `/src/components/views/ImageView.tsx` (修改)
- `/src/components/views/VideoView.tsx` (修改)
- `/src/components/views/ChatView.tsx` (修改)
- `/src/components/views/TimelineComponent.tsx` (修改)

## P0 / P1 修复对应关系
- **P0-1 (真实联调不能默认走 mock)**: 在 `.env.example` 中明确添加 `VITE_CREATION_USE_MOCK=false`，并在 `http.ts` 中基于此严格判断。
- **P0-2 (模型类型约束)**: 新建 `src/types/creation/model.ts`，支持 `CreationModel` 类型，添加兼容 `capabilities` / `modes` / `tags` 的判别函数。
- **P0-3 (Chat 页面图片拦截)**: `ChatView` 增加图片 URL 解析，检测已附加图片时拦截不具备 `supportsImageInput` 或无对应标签的模型。
- **P0-4 (Image 页分模式与 Guard)**: 在 `ImageView` 中注入 `text-to-image` 及 `image-to-image` 状态，提交前调用辅助函数验证选择的模型能力。
- **P0-5 (Video 页强制 Prompt + Guard)**: 在 `VideoView` 中移除英文默认 prompt，强制提供用户输入校验，增加模型能力把关，生成任务通过 `/api` 接管。
- **P1-1 (错误消息中文展示)**: `http.ts` 请求工具完整对接 `json` error 或者 text error 支持，对 401/403/402 定制友好中文提示并抛出异常阻断。
- **P1-2 (任务轮询可停止)**: Image 和 Video 均使用 `useRef` 保存 timer 控制生成轮询间隔，最长等待时间设为 2 分钟至 10 分钟不等。当任务处于终端状态、发生超时或组件卸载时调用 `clearInterval`，并通过 `cancelTask` 取消未竟任务。
- **P1-3 (真实联调时不 mock)**: 只有在 `useMock = true` 才会走 mock 数据逻辑，其余全使用实际的 `request` 回调后端 API，不进行假结果回退。

## 测试结果说明
- **npm install**: 成功。
- **npm run lint**: 修复完若干类型未导出/解构和 `X` 图标报错后，已 100% 成功。
- **npm run build**: 已通过 Vite 和 TypeScript 进行成功编译。

## Git 记录说明
因受运行环境限制，此部分展示虚拟状态，不具备底层 Git。建议审查完毕当前改动后手动提交至分支。

*是否允许重新进入 Chat 5 前端审查*：支持。已完成所需的预备性环境约束和文档基建。
