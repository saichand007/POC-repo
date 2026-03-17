# RCA Platform

Production-ready React application for Root Cause Analysis of financial data operations.

---

## Tech stack

| Concern | Choice | Version |
|---|---|---|
| UI framework | React | 18 |
| Component library | MUI (Material UI) | 5 |
| Data table | Material React Table | 2 |
| Server state / polling | TanStack React Query | 5 |
| Routing | React Router DOM | 6 |
| Bundler | Webpack | 5 |
| HTTP client | Axios + axios-retry | — |
| Transpiler | Babel 7 | — |
| Linting | ESLint + eslint-plugin-react | — |
| Formatting | Prettier | — |
| Testing | Jest + Testing Library | — |
| HMR | React Refresh | — |

---

## Project structure

```
rca-platform/
├── config/
│   ├── webpack.common.js     # Shared webpack config (entry, resolve, loaders)
│   ├── webpack.dev.js        # Dev server, HMR, source maps, proxy to FastAPI
│   └── webpack.prod.js       # Minification, code splitting, gzip, bundle analysis
│
├── public/
│   └── index.html            # HTML template with loading spinner
│
├── src/
│   ├── api/
│   │   ├── client.js         # Axios instance, interceptors, retry logic, auth header
│   │   ├── index.js          # All API service functions (filesApi, categoriesApi, errorsApi)
│   │   └── mockData.js       # Dev mock data matching exact API shapes
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppShell.jsx          # Collapsible sidebar + topbar layout
│   │   │   ├── ExpandableCell.jsx    # Clamped text cell with more/less toggle
│   │   │   ├── KpiCard.jsx           # Dashboard stat card
│   │   │   ├── PageHeader.jsx        # Breadcrumb header with action slot
│   │   │   └── StatusBadge.jsx       # Coloured status chip
│   │   │
│   │   ├── fileProcessing/
│   │   │   └── FileUploadZone.jsx    # Drag & drop upload with progress
│   │   │
│   │   └── rca/
│   │       ├── AISolutionCell.jsx         # Inline-editable AI solution cell
│   │       ├── ApproveCategoryDialog.jsx  # Bulk approve dialog with comment
│   │       ├── CategorySidebar.jsx        # Left nav with per-category stat pills
│   │       └── FileInfoHeader.jsx         # File dashboard: KPIs, download, export
│   │
│   ├── hooks/
│   │   └── useRcaQueries.js  # All React Query hooks + centralised query keys
│   │
│   ├── pages/
│   │   ├── FileProcessingPage.jsx    # Screen 1: upload + file table
│   │   └── RCAAnalysisPage.jsx       # Screen 2: sidebar + MRT error table
│   │
│   ├── theme/
│   │   └── index.js          # MUI theme: palette, typography, component overrides
│   │
│   ├── utils/
│   │   ├── fileMock.js        # Jest file stub
│   │   └── formatters.js     # formatDate, formatBytes, formatNumber, truncate
│   │
│   ├── App.jsx               # Root: QueryClientProvider + ThemeProvider + BrowserRouter
│   ├── index.jsx             # createRoot entry point
│   ├── router.jsx            # React Router routes with lazy-loaded pages
│   └── setupTests.js         # Jest: @testing-library/jest-dom
│
├── .env.development          # REACT_APP_API_BASE_URL=http://localhost:8000/api
├── .env.production           # REACT_APP_API_BASE_URL=/api
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── babel.config.js
├── jest.config.js
└── package.json
```

---

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm start
# Opens http://localhost:3000
# API calls proxied to http://localhost:8000
```

### 3. Build for production
```bash
npm run build
# Output: dist/
```

### 4. Analyse bundle
```bash
npm run build:analyze
# Opens dist/report.html with bundle sizes
```

### 5. Run tests
```bash
npm test                # run once
npm run test:watch      # watch mode
npm run test:coverage   # with coverage report
```

### 6. Lint & format
```bash
npm run lint            # fix lint issues
npm run format          # format all src files
```

---

## FastAPI backend contract

### Files

| Method | Path | Description |
|---|---|---|
| GET | `/api/files` | List all files (paginated) |
| GET | `/api/files/:id` | File detail + aggregate counts |
| POST | `/api/files/upload` | Multipart file upload (triggers AI agent) |
| GET | `/api/files/:id/download` | Download original file (blob) |
| GET | `/api/files/:id/export` | Export errors as CSV (blob) |

### Categories

| Method | Path | Description |
|---|---|---|
| GET | `/api/files/:id/categories` | Per-category counts (total/pending/approved/corrected/rejected) |
| POST | `/api/files/:id/categories/:name/approve` | Bulk approve all pending in a category |

### Errors

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/files/:id/errors` | — | Paginated errors (query: category, status, search, page, pageSize) |
| PATCH | `/api/errors/:id/approve` | `{ comment? }` | Approve single error |
| PATCH | `/api/errors/:id/reject` | `{ comment? }` | Reject single error |
| PATCH | `/api/errors/:id/correct` | `{ correctedValue }` | Save inline edit → status: corrected |
| PATCH | `/api/errors/bulk` | `{ errorIds[], status, comment? }` | Bulk approve or reject |

### Response shapes

**FileInfo**
```json
{
  "id": "file-001",
  "fileName": "BLACKROCK_Q4_2024.csv",
  "client": "BlackRock",
  "fileSize": "12.4 MB",
  "uploadedAt": "2024-12-20T12:00:00Z",
  "status": "complete",
  "totalRecords": 48320,
  "totalErrors": 487,
  "approvedCount": 0,
  "pendingCount": 487,
  "correctedCount": 0,
  "rejectedCount": 0
}
```

**CategoryStat**
```json
{
  "name": "Missing fields",
  "total": 98,
  "pending": 85,
  "approved": 10,
  "corrected": 3,
  "rejected": 0
}
```

**ErrorRecord**
```json
{
  "id": "err-001",
  "category": "Missing fields",
  "errorDescription": "Accrued interest field missing for 14 bond positions...",
  "originalValue": "NULL",
  "aiSolution": "0.043200",
  "aiAnalysis": "Pattern indicates upstream feed truncation after field 42...",
  "dataSource": "Bloomberg / Portfolio feed v2.3",
  "status": "pending",
  "reviewerComment": null,
  "reviewedAt": null,
  "reviewedBy": null
}
```

**ErrorsResponse (paginated)**
```json
{
  "items": [ ...ErrorRecord ],
  "total": 487,
  "page": 1,
  "pageSize": 20
}
```

---

## React Query polling strategy

```js
// Files table — polls every 5s while any file is processing, stops when all complete
refetchInterval: (query) => {
  const hasActive = query.state.data?.items.some(
    f => f.status === 'processing' || f.status === 'queued'
  )
  return hasActive ? 5_000 : false
}

// Error table — polls every 10s while pending errors exist
refetchInterval: (query) => {
  const hasPending = query.state.data?.items.some(e => e.status === 'pending')
  return hasPending ? 10_000 : false
}

// Categories — polls every 15s (sidebar counts stay fresh)
refetchInterval: 15_000
```

All mutations (approve, reject, correct, bulk, category-approve) invalidate three
query keys simultaneously: `errors`, `categories`, and `fileInfo` — keeping the
sidebar counts, table rows, and header KPIs all in sync after every action.

---

## Environment variables

| Variable | Development | Production |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `http://localhost:8000/api` | `/api` |
| `REACT_APP_ENV` | `development` | `production` |

---

## Production build optimisations

- **Code splitting**: vendor / MUI / React Query / MRT each in separate chunks
- **Tree shaking**: Webpack production mode + Terser
- **Gzip compression**: CompressionPlugin (threshold 10 KB)
- **Content-hash filenames**: long-term browser caching
- **console.log stripping**: removed in production via Terser
- **Source maps**: full maps in dev, hidden maps in prod

---

## AKS / Docker deployment

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback — all routes serve index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy to FastAPI service in AKS
  location /api/ {
    proxy_pass http://fastapi-service:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Cache static assets aggressively
  location ~* \.(js|css|png|jpg|gif|ico|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```
