# Data Fetching - Mock API Data

## Files

### Dynamic Data Solutions

- **`generate-data.js`** - Node.js script to regenerate JSON files with fresh dates

---

## Generating Data: Node.js Data Generator Script

### Usage

The `generate-data.js` script regenerates the JSON files with fresh dates whenever you run it.

#### Run the script before sending the assignment and make sure there is data uploaded with your Repo

**Using Node.js:**

```bash
node data-fetching/generate-data.js
```

> ## You can also Edit or use what ever you see suit your needs Example (Enum , ...)

```typescript
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "high" | "medium" | "low";
export type ChangeType = "positive" | "negative" | "neutral";

export interface Statistic {
  id: string;
  title: string;
  icon: string;
  value: number;
  change: string;
  changeLabel: string;
  changeType: ChangeType;
  color: string;
}

interface StatisticsResponse {
  statistics: Statistic[];
  lastUpdated: string;
}

interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  completedAt: string;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  tasks: Task[];
  meta: {
    totalCount: number;
    lastUpdated: string;
  };
}

  ## Local JSON Server API

  Start the mock API from the project root with:

  ```bash
  npm run api
  ```

  The JSON Server database is generated from the `tasks` records in `tasks.json`.
  It exposes `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PATCH /tasks/:id`,
  and `DELETE /tasks/:id`; `GET /tasks` returns a JSON array. The source
  `tasks.json` wrapper and `statistics.json` remain separate generated artifacts.

  Run `node data-fetching/generate-data.js` to regenerate all three JSON files.
  This resets local JSON Server mutations by replacing `db.json` with freshly
```
  `tasks.json` without changing the generated artifacts, run
  `node data-fetching/generate-data.js --db-only`.
