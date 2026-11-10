# Task Management Dashboard

An Angular standalone application for managing tasks on a responsive status board. It uses a local JSON Server API, Angular Signals for dashboard state, and Angular Material dialogs and form controls for task operations.

## Features

- Create, view, edit, and delete tasks, with a confirmation before deletion.
- Filter by status, priority, and assignee; search task titles and descriptions; sort by priority or due date.
- Summary counts for total, completed, in-progress, and overdue tasks.
- Loading, retryable error, empty-collection, and no-results states.
- Assignee choices derived from existing task records. If the API has no assignees, the form accepts assignee details directly.
- Responsive layout: navigation and board columns adapt to smaller viewports.

## Technology

- Angular 21, standalone components, Signals, and lazy-loaded dashboard routes.
- Angular Material 21 with a Material 3 light theme.
- JSON Server `1.0.0-beta.15` for local task data.
- Vitest through Angular's unit-test builder.
- TypeScript strict mode.

## Requirements

- Node.js compatible with Angular CLI 21 (the project was tested with Node 22.12).
- npm (the package declares npm 10.9.0).

Install the locked dependencies from the project root:

```bash
npm ci
```

## Run Locally

Start JSON Server in one terminal:

```bash
npm run api
```

It uses port `3000`; keep that port available because the application API URL is configured in `src/app/features/tasks/services/task-api.config.ts`.

Start Angular in another terminal:

```bash
npm start
```

Open the URL printed by Angular CLI (normally `http://localhost:4200/`). If the default port is busy, Angular CLI offers another port. The API must still be reachable at `http://localhost:3000` unless the API URL configuration is changed.

## API

The API base URL is `http://localhost:3000`; task routes are:

| Method   | Route        | Purpose               |
| -------- | ------------ | --------------------- |
| `GET`    | `/tasks`     | Return the task array |
| `GET`    | `/tasks/:id` | Return one task       |
| `POST`   | `/tasks`     | Create a task         |
| `PATCH`  | `/tasks/:id` | Update a task         |
| `DELETE` | `/tasks/:id` | Delete a task         |

`TaskService` uses Angular `httpResource` for the task collection GET and `HttpClient` for mutations. Successful mutations reload the collection. `data-fetching/tasks.json` and `statistics.json` are generated data artifacts; only `db.json` is served by JSON Server, and its `/tasks` response is an array.

To regenerate all mock data:

```bash
node data-fetching/generate-data.js
```

This rewrites `tasks.json`, `statistics.json`, and `db.json`, resetting local JSON Server task changes. To regenerate only `db.json` from the current `tasks.json` without rewriting the other artifacts:

```bash
node data-fetching/generate-data.js --db-only
```

## Project Structure

```text
src/app/core/                 Shared layout and search state
src/app/features/dashboard/   Dashboard page, filters, summary, and board
src/app/features/tasks/       Task models, API service, mapper, and dialogs
src/styles.scss               Global reset, tokens, and Material theme
data-fetching/                JSON Server data and generator
```

`DashboardPage` coordinates API-backed state and derives filtered, sorted, and summarized views. `StatsSummary`, `TaskFilterBar`, `TaskBoard`, and `TaskCard` receive inputs and emit user actions. API DTOs are kept separate from the task view model and converted by the task mapper.

## Commands

| Command                     | Purpose                              |
| --------------------------- | ------------------------------------ |
| `npm start`                 | Start the Angular development server |
| `npm run api`               | Start JSON Server                    |
| `npm run build`             | Create a production build in `dist/` |
| `npm run watch`             | Rebuild on changes                   |
| `npm run ng -- <arguments>` | Pass arguments to Angular CLI        |
| `npm test`                  | Run unit tests in watch mode         |
| `npx ng test --watch=false` | Run the unit tests once              |

## Tests

Tests cover the task service's HTTP operations, form and delete-dialog behavior, task actions, dashboard statistics and counts, search, filters, and sorting. The current suite passes, but code coverage has not been measured; no coverage threshold is configured.

## Limitations

- There are no task-distribution charts or recent-activity feed. The generated data contains no activity history.
- There is no separate user-management view or users API; assignees are based on task records.
- Drag and drop is not implemented.
- HTTP caching and automatic retry are not implemented. GET failures can be retried from the dashboard.
- The sidebar includes navigation labels for sections that do not yet have routes; only the dashboard route is implemented.
- No lint command, ESLint configuration, or Husky pre-commit hook is configured.
- The production build currently reports three Angular warnings for unused layout imports in `src/app/app.ts`.
