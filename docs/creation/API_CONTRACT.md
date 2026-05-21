# API Contract
Base URL: `/api`
Endpoints:
- `GET /api/creation/models?capability=chat|image|video`
- `GET /api/creation/billing/summary`
- `GET /api/creation/assets`
- `GET /api/creation/assets/:id`
- `POST /api/creation/assets/upload`
- `DELETE /api/creation/assets/:id`
- `GET /api/creation/tasks`
- `GET /api/creation/tasks/:id`
- `POST /api/creation/tasks/:id/cancel`
- `POST /api/creation/generations`
- `GET /api/creation/chat`
- `POST /api/creation/chat/:sessionId/messages`
