# Testing

### 1. Unit Testing

**Explanation:**
**Unit tests** test individual functions/modules in isolation.

**Characteristics**:
- Fast
- Isolated (no external dependencies)
- Test one thing

**Exercise:**
```javascript
// userService.js
class UserService {
  constructor(db) {
    this.db = db;
  }

  async getUser(id) {
    if (!id) {
      throw new Error('ID is required');
    }

    const user = await this.db.findUser(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

// userService.test.js
const UserService = require('./userService');

describe('UserService', () => {
  let userService;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      findUser: jest.fn()
    };
    userService = new UserService(mockDb);
  });

  test('getUser returns user when found', async () => {
    const mockUser = { id: 1, name: 'John' };
    mockDb.findUser.mockResolvedValue(mockUser);

    const result = await userService.getUser(1);

    expect(result).toEqual(mockUser);
    expect(mockDb.findUser).toHaveBeenCalledWith(1);
  });

  test('getUser throws when ID is missing', async () => {
    await expect(userService.getUser()).rejects.toThrow('ID is required');
  });

  test('getUser throws when user not found', async () => {
    mockDb.findUser.mockResolvedValue(null);

    await expect(userService.getUser(1)).rejects.toThrow('User not found');
  });
});
```

---

### 2. Integration Testing

**Explanation:**
**Integration tests** test multiple modules working together.

**Characteristics**:
- Slower than unit tests
- Test interactions between modules
- May use real database (test database)

**Exercise:**
```javascript
// userRoutes.test.js
const request = require('supertest');
const app = require('./app');
const db = require('./db');

describe('User Routes', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.query('DELETE FROM users');
  });

  test('GET /users returns list of users', async () => {
    // Seed database
    await db.query('INSERT INTO users (name, email) VALUES ($1, $2)', ['John', 'john@example.com']);

    const response = await request(app)
      .get('/users')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('John');
  });

  test('POST /users creates user', async () => {
    const newUser = { name: 'Jane', email: 'jane@example.com' };

    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body.name).toBe('Jane');

    // Verify in database
    const users = await db.query('SELECT * FROM users WHERE email = $1', ['jane@example.com']);
    expect(users.rows).toHaveLength(1);
  });

  test('GET /users/:id returns 404 when user not found', async () => {
    await request(app)
      .get('/users/999')
      .expect(404);
  });
});
```

---

### 3. E2E Testing

**Explanation:**
**E2E (End-to-End) tests** test the entire application flow from user perspective.

**Characteristics**:
- Slowest
- Test complete user journeys
- Use real browser (Playwright, Cypress)

**Exercise:**
```javascript
// e2e/userFlow.test.js
const { test, expect } = require('@playwright/test');

test.describe('User Registration Flow', () => {
  test('user can register, login, and view profile', async ({ page }) => {
    // 1. Register
    await page.goto('http://localhost:3000/register');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Verify redirect to login
    await expect(page).toHaveURL('http://localhost:3000/login');

    // 2. Login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // 3. View profile
    await page.click('a[href="/profile"]');
    await expect(page.locator('h1')).toHaveText('Profile');
    await expect(page.locator('.email')).toHaveText('test@example.com');
  });

  test('user cannot access protected route without login', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:3000/login');
  });
});
```

---

### 4. Mocking, Stubbing, Spying

**Explanation:**
- **Mock**: Replace entire module/function
- **Stub**: Replace function with predefined behavior
- **Spy**: Track function calls without replacing

**Exercise:**
```javascript
// 1. Mocking
jest.mock('./emailService');
const emailService = require('./emailService');

test('sends welcome email', async () => {
  emailService.sendEmail.mockResolvedValue(true);

  await userService.register('test@example.com');

  expect(emailService.sendEmail).toHaveBeenCalledWith({
    to: 'test@example.com',
    subject: 'Welcome!'
  });
});

// 2. Stubbing
const sinon = require('sinon');

test('handles email service failure', async () => {
  const stub = sinon.stub(emailService, 'sendEmail').rejects(new Error('Service unavailable'));

  await expect(userService.register('test@example.com')).rejects.toThrow('Service unavailable');

  stub.restore();
});

// 3. Spying
test('logs user creation', async () => {
  const spy = jest.spyOn(console, 'log');

  await userService.createUser({ name: 'John' });

  expect(spy).toHaveBeenCalledWith('User created:', expect.any(Object));

  spy.mockRestore();
});

// 4. Partial mocking
jest.mock('./db', () => ({
  connect: jest.fn(),
  query: jest.fn(),
  disconnect: jest.fn()
}));

// 5. Mock implementation
const mockFn = jest.fn()
  .mockReturnValueOnce('first call')
  .mockReturnValueOnce('second call')
  .mockReturnValue('default');

expect(mockFn()).toBe('first call');
expect(mockFn()).toBe('second call');
expect(mockFn()).toBe('default');
```

---

### 5. Jest / Mocha / Supertest Basics

**Explanation:**
- **Jest**: All-in-one testing framework
- **Mocha**: Test runner (needs assertion library)
- **Supertest**: HTTP testing

**Exercise:**
```javascript
// Jest:
describe('Calculator', () => {
  test('adds two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('subtracts two numbers', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});

// Mocha + Chai:
const { expect } = require('chai');

describe('Calculator', () => {
  it('adds two numbers', () => {
    expect(add(1, 2)).to.equal(3);
  });

  it('subtracts two numbers', () => {
    expect(subtract(5, 3)).to.equal(2);
  });
});

// Supertest:
const request = require('supertest');
const app = require('./app');

describe('API Tests', () => {
  test('GET /users returns 200', async () => {
    const response = await request(app)
      .get('/users')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /users creates user', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'John', email: 'john@example.com' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('John');
  });

  test('GET /users/:id returns 404 for invalid ID', async () => {
    await request(app)
      .get('/users/999')
      .expect(404);
  });
});

// Test coverage:
// Run: npm test -- --coverage
// Jest generates coverage report

// package.json:
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```
