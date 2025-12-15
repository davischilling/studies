# CI/CD & DevOps

### 1. Git Branching & PR Workflows

**Explanation:**
**Git branching strategies** organize code changes and collaboration.

**Common strategies**:
- **Git Flow**: main, develop, feature, release, hotfix branches
- **GitHub Flow**: main + feature branches
- **Trunk-based**: Short-lived feature branches

**Exercise:**
```bash
# GitHub Flow (simple, recommended):

# 1. Create feature branch
git checkout -b feature/add-user-auth

# 2. Make changes and commit
git add .
git commit -m "Add user authentication"

# 3. Push to remote
git push origin feature/add-user-auth

# 4. Create Pull Request on GitHub

# 5. Code review, CI checks pass

# 6. Merge to main
git checkout main
git pull origin main
git merge feature/add-user-auth
git push origin main

# 7. Delete feature branch
git branch -d feature/add-user-auth
git push origin --delete feature/add-user-auth

# Git Flow (more complex):
# main: Production code
# develop: Integration branch
# feature/*: New features
# release/*: Release preparation
# hotfix/*: Emergency fixes

# Create feature:
git checkout develop
git checkout -b feature/new-feature

# Finish feature:
git checkout develop
git merge feature/new-feature
git branch -d feature/new-feature

# Create release:
git checkout -b release/1.0.0 develop
# Bump version, fix bugs
git checkout main
git merge release/1.0.0
git tag -a v1.0.0
git checkout develop
git merge release/1.0.0

# Hotfix:
git checkout -b hotfix/critical-bug main
# Fix bug
git checkout main
git merge hotfix/critical-bug
git tag -a v1.0.1
git checkout develop
git merge hotfix/critical-bug
```

---

### 2. Docker Basics

**Explanation:**
**Docker** packages applications with dependencies into containers.

**Key concepts**:
- **Image**: Template for containers
- **Container**: Running instance of image
- **Dockerfile**: Instructions to build image
- **Docker Compose**: Multi-container applications

**Exercise:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]

# Build image:
# docker build -t my-app .

# Run container:
# docker run -p 3000:3000 my-app

# Multi-stage build (smaller image):
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - db-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  db-data:

# Run:
# docker-compose up -d

# Stop:
# docker-compose down

# View logs:
# docker-compose logs -f app
```

---

### 3. GitHub Actions

**Explanation:**
**GitHub Actions** automates CI/CD workflows.

**Triggers**: push, pull_request, schedule, manual

**Exercise:**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: test
          DB_PASSWORD: password

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t my-app:${{ github.sha }} .

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push image
        run: |
          docker tag my-app:${{ github.sha }} my-app:latest
          docker push my-app:${{ github.sha }}
          docker push my-app:latest

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # SSH to server and pull new image
```

---

### 4. Environment Promotion (dev → staging → production)

**Explanation:**
**Environment promotion** moves code through environments with increasing stability.

**Environments**:
- **Development**: Local, frequent changes
- **Staging**: Production-like, testing
- **Production**: Live, stable

**Exercise:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - develop  # Deploy to staging
      - main     # Deploy to production

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
          # Deploy logic
        env:
          API_URL: https://staging-api.example.com
          DB_HOST: staging-db.example.com

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Deploy logic
        env:
          API_URL: https://api.example.com
          DB_HOST: prod-db.example.com

      - name: Run smoke tests
        run: npm run test:smoke

      - name: Notify team
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text":"Deployed to production: ${{ github.sha }}"}'
```

```javascript
// Environment-specific config:
// config/development.js
module.exports = {
  db: {
    host: 'localhost',
    port: 5432,
    database: 'mydb_dev'
  },
  apiUrl: 'http://localhost:3000',
  logLevel: 'debug'
};

// config/staging.js
module.exports = {
  db: {
    host: 'staging-db.example.com',
    port: 5432,
    database: 'mydb_staging'
  },
  apiUrl: 'https://staging-api.example.com',
  logLevel: 'info'
};

// config/production.js
module.exports = {
  db: {
    host: process.env.DB_HOST,
    port: 5432,
    database: 'mydb_prod'
  },
  apiUrl: 'https://api.example.com',
  logLevel: 'warn'
};

// config/index.js
const env = process.env.NODE_ENV || 'development';
module.exports = require(`./${env}`);
```
