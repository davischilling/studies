# General Database Concepts

### 1. ACID Properties

**Explanation:**
**ACID** ensures reliable database transactions.

- **Atomicity**: All or nothing (transaction succeeds completely or fails completely)
- **Consistency**: Database remains in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed data persists even after crashes

**Exercise:**
```javascript
// Example: Bank transfer (must be atomic)
async function transferMoney(fromAccount, toAccount, amount) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    // Debit from account
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromAccount]
    );

    // Credit to account
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toAccount]
    );

    await client.query('COMMIT'); // Commit transaction
    console.log('Transfer successful');
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Transfer failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Without ACID:
// - Money could be deducted but not credited (Atomicity violation)
// - Balance could go negative (Consistency violation)
// - Two transfers could interfere (Isolation violation)
// - Data could be lost on crash (Durability violation)
```

---

### 2. Indexing Strategies

**Explanation:**
**Indexes** speed up queries by creating data structures for fast lookups.

**Types**:
- **B-Tree**: Default, good for range queries
- **Hash**: Fast equality lookups
- **GIN/GiST**: Full-text search, arrays
- **Partial**: Index subset of rows
- **Composite**: Multiple columns

**Trade-offs**:
- ✅ Faster reads
- ❌ Slower writes
- ❌ More storage

**Exercise:**
```javascript
// 1. Create indexes
await db.query('CREATE INDEX idx_users_email ON users(email)');
await db.query('CREATE INDEX idx_orders_user_id ON orders(user_id)');

// 2. Composite index (order matters!)
await db.query('CREATE INDEX idx_users_country_city ON users(country, city)');

// Fast:
SELECT * FROM users WHERE country = 'US' AND city = 'NYC';
SELECT * FROM users WHERE country = 'US'; // Uses index

// Slow:
SELECT * FROM users WHERE city = 'NYC'; // Doesn't use index!

// 3. Partial index (index subset)
await db.query('CREATE INDEX idx_active_users ON users(email) WHERE active = true');

// 4. Check if index is used
const result = await db.query('EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1', ['test@example.com']);
console.log(result.rows);
// Look for "Index Scan" vs "Seq Scan"

// 5. When to index:
// ✅ Foreign keys
// ✅ Columns in WHERE clauses
// ✅ Columns in JOIN conditions
// ✅ Columns in ORDER BY
// ❌ Small tables
// ❌ Columns with low cardinality (few unique values)
// ❌ Frequently updated columns
```

---

### 3. Query Optimization

**Explanation:**
Optimize queries to reduce execution time and resource usage.

**Techniques**:
- Use indexes
- Avoid SELECT *
- Limit results
- Use JOINs instead of subqueries
- Avoid N+1 queries

**Exercise:**
```javascript
// Bad: N+1 query problem
const users = await db.query('SELECT * FROM users');
for (const user of users.rows) {
  const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [user.id]);
  user.orders = orders.rows;
}
// 1 query + N queries = N+1 queries!

// Good: Single JOIN query
const result = await db.query(`
  SELECT users.*, json_agg(orders.*) as orders
  FROM users
  LEFT JOIN orders ON orders.user_id = users.id
  GROUP BY users.id
`);
// 1 query!

// Bad: SELECT *
const users = await db.query('SELECT * FROM users');

// Good: Select only needed columns
const users = await db.query('SELECT id, name, email FROM users');

// Bad: No LIMIT
const users = await db.query('SELECT * FROM users');

// Good: Paginate
const users = await db.query('SELECT * FROM users LIMIT 10 OFFSET 0');

// Use EXPLAIN to analyze
const plan = await db.query('EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1', ['test@example.com']);
console.log(plan.rows);
```

---

### 4. Transactions

**Explanation:**
**Transactions** group multiple operations into a single atomic unit.

**Isolation levels**:
- **Read Uncommitted**: Dirty reads possible
- **Read Committed**: Default, no dirty reads
- **Repeatable Read**: Same data throughout transaction
- **Serializable**: Strictest, prevents all anomalies

**Exercise:**
```javascript
// 1. Basic transaction
const client = await pool.connect();

try {
  await client.query('BEGIN');

  await client.query('INSERT INTO users (name) VALUES ($1)', ['John']);
  await client.query('INSERT INTO orders (user_id) VALUES ($1)', [1]);

  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}

// 2. Transaction helper
async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Usage:
await withTransaction(async (client) => {
  await client.query('INSERT INTO users (name) VALUES ($1)', ['John']);
  await client.query('INSERT INTO orders (user_id) VALUES ($1)', [1]);
});

// 3. Set isolation level
await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
```

---

### 5. Normalization vs Denormalization

**Explanation:**
**Normalization**: Organize data to reduce redundancy (multiple tables, JOINs)
**Denormalization**: Duplicate data for performance (fewer JOINs)

**Normalization forms**:
- **1NF**: Atomic values, no repeating groups
- **2NF**: No partial dependencies
- **3NF**: No transitive dependencies

**Exercise:**
```javascript
// Normalized (3NF):
// users: id, name, email
// orders: id, user_id, total
// order_items: id, order_id, product_id, quantity

// Query requires JOINs:
SELECT users.name, orders.total, products.name
FROM users
JOIN orders ON orders.user_id = users.id
JOIN order_items ON order_items.order_id = orders.id
JOIN products ON products.id = order_items.product_id;

// Denormalized:
// orders: id, user_id, user_name, user_email, total, items_json

// Faster query (no JOINs):
SELECT * FROM orders WHERE user_id = 1;

// Trade-offs:
// Normalized: ✅ No redundancy, ✅ Easy updates, ❌ Slower reads
// Denormalized: ✅ Faster reads, ❌ Data redundancy, ❌ Update anomalies
```

---

### 6. Connection Pooling

**Explanation:**
**Connection pooling** reuses database connections instead of creating new ones for each request.

**Benefits**:
- Faster (no connection overhead)
- Limited connections (prevents overwhelming database)

**Exercise:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'user',
  password: 'password',
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000 // Timeout if no connection available
});

// Bad: Create new connection each time
async function badQuery() {
  const client = new Client();
  await client.connect();
  const result = await client.query('SELECT * FROM users');
  await client.end();
  return result;
}

// Good: Use pool
async function goodQuery() {
  const result = await pool.query('SELECT * FROM users');
  return result;
}

// For transactions: get client from pool
async function transaction() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // ... queries
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release(); // Return to pool
  }
}
```

---

### 7. N+1 Problems

**Explanation:**
**N+1 problem**: Making N additional queries in a loop (1 query + N queries).

**Solution**: Use JOINs or batch loading.

**Exercise:**
```javascript
// Bad: N+1 queries
async function getUsersWithOrders() {
  const users = await db.query('SELECT * FROM users'); // 1 query

  for (const user of users.rows) {
    const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [user.id]); // N queries
    user.orders = orders.rows;
  }

  return users.rows;
}

// Good: Single JOIN
async function getUsersWithOrders() {
  const result = await db.query(`
    SELECT
      users.*,
      json_agg(orders.*) as orders
    FROM users
    LEFT JOIN orders ON orders.user_id = users.id
    GROUP BY users.id
  `);

  return result.rows;
}

// Alternative: DataLoader (batching)
const DataLoader = require('dataloader');

const orderLoader = new DataLoader(async (userIds) => {
  const result = await db.query(
    'SELECT * FROM orders WHERE user_id = ANY($1)',
    [userIds]
  );

  // Group by user_id
  const ordersByUser = {};
  for (const order of result.rows) {
    if (!ordersByUser[order.user_id]) {
      ordersByUser[order.user_id] = [];
    }
    ordersByUser[order.user_id].push(order);
  }

  return userIds.map(id => ordersByUser[id] || []);
});

// Usage:
const users = await db.query('SELECT * FROM users');
for (const user of users.rows) {
  user.orders = await orderLoader.load(user.id); // Batched!
}
```

---

### 8. Data Modeling

**Explanation:**
Design database schema to represent business entities and relationships.

**Relationships**:
- **One-to-One**: User ↔ Profile
- **One-to-Many**: User → Orders
- **Many-to-Many**: Students ↔ Courses (join table)

**Exercise:**
```javascript
// One-to-Many: User has many orders
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

// Many-to-Many: Students and Courses
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE enrollments (
  student_id INTEGER REFERENCES students(id),
  course_id INTEGER REFERENCES courses(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (student_id, course_id)
);

// Query many-to-many:
SELECT students.name, courses.name
FROM students
JOIN enrollments ON enrollments.student_id = students.id
JOIN courses ON courses.id = enrollments.course_id
WHERE students.id = 1;
```

---

### 9. Migrations

**Explanation:**
**Migrations** are version-controlled database schema changes.

**Benefits**:
- Track schema changes
- Reproducible across environments
- Rollback capability

**Exercise:**
```javascript
// Using node-pg-migrate
// Create migration: npx node-pg-migrate create add-users-table

// migrations/1234567890_add-users-table.js
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  pgm.createIndex('users', 'email');
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};

// Run migrations: npx node-pg-migrate up
// Rollback: npx node-pg-migrate down

// Manual migration runner:
const fs = require('fs');
const path = require('path');

async function runMigrations(db) {
  // Create migrations table
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Get executed migrations
  const executed = await db.query('SELECT name FROM migrations');
  const executedNames = executed.rows.map(r => r.name);

  // Get migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (executedNames.includes(file)) {
      continue;
    }

    console.log(`Running migration: ${file}`);
    const migration = require(path.join(migrationsDir, file));

    await db.query('BEGIN');
    try {
      await migration.up(db);
      await db.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      await db.query('COMMIT');
      console.log(`✓ ${file}`);
    } catch (err) {
      await db.query('ROLLBACK');
      console.error(`✗ ${file}:`, err);
      throw err;
    }
  }
}
```
