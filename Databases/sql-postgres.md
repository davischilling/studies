# SQL-Specific (Postgres)

### 1. JOIN Types (INNER, LEFT, RIGHT)

**Explanation:**
**JOINs** combine rows from multiple tables.

- **INNER JOIN**: Only matching rows
- **LEFT JOIN**: All left rows + matching right rows
- **RIGHT JOIN**: All right rows + matching left rows
- **FULL OUTER JOIN**: All rows from both tables

**Exercise:**
```sql
-- Sample data:
-- users: id=1 (John), id=2 (Jane), id=3 (Bob)
-- orders: id=1 (user_id=1), id=2 (user_id=1), id=3 (user_id=4)

-- INNER JOIN: Only users with orders
SELECT users.name, orders.id
FROM users
INNER JOIN orders ON orders.user_id = users.id;
-- Result: John (2 rows)

-- LEFT JOIN: All users, with orders if they exist
SELECT users.name, orders.id
FROM users
LEFT JOIN orders ON orders.user_id = users.id;
-- Result: John (2 rows), Jane (NULL), Bob (NULL)

-- RIGHT JOIN: All orders, with users if they exist
SELECT users.name, orders.id
FROM users
RIGHT JOIN orders ON orders.user_id = users.id;
-- Result: John (2 rows), NULL (1 row for user_id=4)

-- FULL OUTER JOIN: All users and all orders
SELECT users.name, orders.id
FROM users
FULL OUTER JOIN orders ON orders.user_id = users.id;
-- Result: John (2 rows), Jane (NULL), Bob (NULL), NULL (1 row)

-- Multiple JOINs:
SELECT users.name, orders.id, products.name
FROM users
INNER JOIN orders ON orders.user_id = users.id
INNER JOIN order_items ON order_items.order_id = orders.id
INNER JOIN products ON products.id = order_items.product_id;
```

---

### 2. Index Types (B-Tree, HASH, GIN, GiST)

**Explanation:**
Different index types optimize different query patterns.

- **B-Tree**: Default, range queries, sorting
- **Hash**: Equality only, faster than B-Tree
- **GIN**: Arrays, JSONB, full-text search
- **GiST**: Geometric data, full-text search

**Exercise:**
```sql
-- B-Tree (default): Good for <, <=, =, >=, >, BETWEEN, ORDER BY
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

SELECT * FROM users WHERE email = 'test@example.com';
SELECT * FROM orders WHERE created_at > '2024-01-01';
SELECT * FROM orders ORDER BY created_at DESC;

-- Hash: Only equality (=)
CREATE INDEX idx_users_email_hash ON users USING HASH (email);

SELECT * FROM users WHERE email = 'test@example.com'; -- Fast
SELECT * FROM users WHERE email LIKE 'test%'; -- Won't use index!

-- GIN: Arrays, JSONB, full-text search
CREATE INDEX idx_tags_gin ON posts USING GIN (tags);
CREATE INDEX idx_metadata_gin ON products USING GIN (metadata);

SELECT * FROM posts WHERE tags @> ARRAY['javascript', 'nodejs'];
SELECT * FROM products WHERE metadata @> '{"color": "red"}';

-- GiST: Geometric data, ranges
CREATE INDEX idx_location_gist ON stores USING GIST (location);

SELECT * FROM stores WHERE location <-> point '(0,0)' < 10;

-- Full-text search with GIN:
ALTER TABLE articles ADD COLUMN tsv tsvector;
UPDATE articles SET tsv = to_tsvector('english', title || ' ' || body);
CREATE INDEX idx_articles_tsv ON articles USING GIN (tsv);

SELECT * FROM articles WHERE tsv @@ to_tsquery('english', 'nodejs & performance');
```

---

### 3. Upsert (ON CONFLICT / INSERT ... ON DUPLICATE)

**Explanation:**
**Upsert**: Insert or update if row already exists.

**Postgres syntax**: `ON CONFLICT ... DO UPDATE`

**Exercise:**
```sql
-- Basic upsert:
INSERT INTO users (id, name, email)
VALUES (1, 'John', 'john@example.com')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, email = EXCLUDED.email;

-- Upsert with condition:
INSERT INTO users (id, name, email, updated_at)
VALUES (1, 'John', 'john@example.com', NOW())
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  updated_at = NOW()
WHERE users.updated_at < EXCLUDED.updated_at;

-- Upsert on unique constraint:
INSERT INTO users (email, name)
VALUES ('john@example.com', 'John')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name;

-- Do nothing on conflict:
INSERT INTO users (email, name)
VALUES ('john@example.com', 'John')
ON CONFLICT (email) DO NOTHING;

-- Bulk upsert:
INSERT INTO users (id, name, email)
VALUES
  (1, 'John', 'john@example.com'),
  (2, 'Jane', 'jane@example.com'),
  (3, 'Bob', 'bob@example.com')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, email = EXCLUDED.email;
```

```javascript
// In Node.js:
await db.query(`
  INSERT INTO users (id, name, email)
  VALUES ($1, $2, $3)
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name, email = EXCLUDED.email
  RETURNING *
`, [1, 'John', 'john@example.com']);
```

---

### 4. Common Performance Pitfalls

**Explanation:**
Common mistakes that slow down queries.

**Exercise:**
```sql
-- Pitfall 1: SELECT *
-- Bad:
SELECT * FROM users; -- Returns all columns

-- Good:
SELECT id, name, email FROM users; -- Only needed columns

-- Pitfall 2: No indexes on WHERE/JOIN columns
-- Bad:
SELECT * FROM orders WHERE user_id = 1; -- Seq scan!

-- Good:
CREATE INDEX idx_orders_user_id ON orders(user_id);
SELECT * FROM orders WHERE user_id = 1; -- Index scan!

-- Pitfall 3: Functions on indexed columns
-- Bad:
SELECT * FROM users WHERE LOWER(email) = 'test@example.com'; -- Won't use index!

-- Good:
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'test@example.com'; -- Uses index!

-- Or store lowercase:
SELECT * FROM users WHERE email = 'test@example.com'; -- Uses regular index

-- Pitfall 4: OR conditions
-- Bad:
SELECT * FROM users WHERE name = 'John' OR email = 'john@example.com'; -- Slow!

-- Good:
SELECT * FROM users WHERE name = 'John'
UNION
SELECT * FROM users WHERE email = 'john@example.com';

-- Pitfall 5: NOT IN with NULL values
-- Bad:
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders); -- Slow if NULL!

-- Good:
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL);
-- Or use NOT EXISTS:
SELECT * FROM users WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id);

-- Pitfall 6: Implicit type conversion
-- Bad:
SELECT * FROM users WHERE id = '123'; -- id is INTEGER, '123' is VARCHAR

-- Good:
SELECT * FROM users WHERE id = 123;
```

---

### 5. Stored Procedures vs Application Logic

**Explanation:**
**Stored procedures**: Database-side logic
**Application logic**: Application-side logic

**Trade-offs**:

| Aspect | Stored Procedures | Application Logic |
|--------|-------------------|-------------------|
| Performance | ✅ Faster (less network) | ❌ Network overhead |
| Maintainability | ❌ Harder to version | ✅ Easy to version |
| Testing | ❌ Harder to test | ✅ Easy to test |
| Portability | ❌ Database-specific | ✅ Database-agnostic |

**Exercise:**
```sql
-- Stored procedure:
CREATE OR REPLACE FUNCTION transfer_money(
  from_account INTEGER,
  to_account INTEGER,
  amount DECIMAL
) RETURNS VOID AS $$
BEGIN
  UPDATE accounts SET balance = balance - amount WHERE id = from_account;
  UPDATE accounts SET balance = balance + amount WHERE id = to_account;
END;
$$ LANGUAGE plpgsql;

-- Call:
SELECT transfer_money(1, 2, 100.00);
```

```javascript
// Application logic:
async function transferMoney(fromAccount, toAccount, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromAccount]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toAccount]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

### 6. Isolation Levels

**Explanation:**
**Isolation levels** control how transactions interact.

- **Read Uncommitted**: Dirty reads possible
- **Read Committed**: Default, no dirty reads
- **Repeatable Read**: Same data throughout transaction
- **Serializable**: Strictest, prevents all anomalies

**Exercise:**
```sql
-- Set isolation level:
BEGIN ISOLATION LEVEL READ COMMITTED;
BEGIN ISOLATION LEVEL REPEATABLE READ;
BEGIN ISOLATION LEVEL SERIALIZABLE;

-- Example: Repeatable Read
-- Transaction 1:
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT * FROM accounts WHERE id = 1; -- balance = 100
-- (Transaction 2 updates balance to 200)
SELECT * FROM accounts WHERE id = 1; -- Still 100!
COMMIT;

-- Example: Serializable (prevents phantom reads)
-- Transaction 1:
BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT COUNT(*) FROM orders WHERE user_id = 1; -- 5 orders
-- (Transaction 2 inserts new order)
SELECT COUNT(*) FROM orders WHERE user_id = 1; -- Still 5!
COMMIT;
```

```javascript
// In Node.js:
const client = await pool.connect();
await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
try {
  // Your queries
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```
