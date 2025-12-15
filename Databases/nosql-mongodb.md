# NoSQL (MongoDB)

### 1. Document Modeling

**Explanation:**
MongoDB stores data as JSON-like documents. Design for how you query, not for normalization.

**Patterns**:
- **Embedding**: Nest related data (one-to-few)
- **Referencing**: Store IDs (one-to-many, many-to-many)

**Exercise:**
```javascript
// Embedding (one-to-few): User with addresses
{
  _id: ObjectId("..."),
  name: "John",
  email: "john@example.com",
  addresses: [
    { street: "123 Main St", city: "NYC", zip: "10001" },
    { street: "456 Oak Ave", city: "LA", zip: "90001" }
  ]
}

// Referencing (one-to-many): User with many orders
// users collection:
{
  _id: ObjectId("user1"),
  name: "John",
  email: "john@example.com"
}

// orders collection:
{
  _id: ObjectId("order1"),
  user_id: ObjectId("user1"),
  total: 100.00,
  items: [...]
}

// Hybrid: Embed frequently accessed data, reference the rest
{
  _id: ObjectId("order1"),
  user: {
    _id: ObjectId("user1"),
    name: "John" // Denormalized for quick access
  },
  total: 100.00,
  items: [...]
}

// When to embed vs reference:
// Embed: One-to-few, data accessed together, data doesn't change often
// Reference: One-to-many, many-to-many, data changes frequently, large documents
```

---

### 2. Aggregation Pipelines

**Explanation:**
**Aggregation pipelines** process documents through stages to transform and analyze data.

**Common stages**:
- `$match`: Filter documents
- `$group`: Group by field
- `$sort`: Sort results
- `$project`: Select fields
- `$lookup`: Join collections
- `$unwind`: Deconstruct arrays

**Exercise:**
```javascript
// 1. Basic aggregation: Count orders by user
db.orders.aggregate([
  { $group: { _id: "$user_id", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// 2. Calculate total revenue by product
db.orders.aggregate([
  { $unwind: "$items" },
  { $group: {
    _id: "$items.product_id",
    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
  }},
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 }
]);

// 3. Join collections with $lookup
db.orders.aggregate([
  { $lookup: {
    from: "users",
    localField: "user_id",
    foreignField: "_id",
    as: "user"
  }},
  { $unwind: "$user" },
  { $project: {
    order_id: "$_id",
    user_name: "$user.name",
    total: 1
  }}
]);

// 4. Filter and group
db.orders.aggregate([
  { $match: { status: "completed", created_at: { $gte: new Date("2024-01-01") } } },
  { $group: {
    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
    count: { $sum: 1 },
    revenue: { $sum: "$total" }
  }},
  { $sort: { _id: 1 } }
]);

// 5. Complex pipeline
db.users.aggregate([
  // Stage 1: Match active users
  { $match: { active: true } },

  // Stage 2: Lookup orders
  { $lookup: {
    from: "orders",
    localField: "_id",
    foreignField: "user_id",
    as: "orders"
  }},

  // Stage 3: Add computed fields
  { $addFields: {
    orderCount: { $size: "$orders" },
    totalSpent: { $sum: "$orders.total" }
  }},

  // Stage 4: Filter users with orders
  { $match: { orderCount: { $gt: 0 } } },

  // Stage 5: Sort by total spent
  { $sort: { totalSpent: -1 } },

  // Stage 6: Limit results
  { $limit: 100 }
]);
```

---

### 3. TTL Indexes

**Explanation:**
**TTL (Time To Live) indexes** automatically delete documents after a specified time.

**Use cases**:
- Session data
- Temporary tokens
- Logs
- Cache

**Exercise:**
```javascript
// 1. Create TTL index (expires after 1 hour)
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
);

// Insert document:
db.sessions.insertOne({
  user_id: ObjectId("..."),
  token: "abc123",
  createdAt: new Date() // Will be deleted after 1 hour
});

// 2. TTL index on expiration date
db.tokens.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 } // Delete immediately after expiresAt
);

// Insert document:
db.tokens.insertOne({
  token: "xyz789",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
});

// 3. Logs with TTL (30 days)
db.logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

// Note: TTL monitor runs every 60 seconds, so deletion may be delayed
```

---

### 4. When to Choose NoSQL vs SQL

**Explanation:**
Choose based on data structure, scalability needs, and query patterns.

**Choose SQL when**:
- Complex relationships
- ACID transactions critical
- Complex queries (JOINs, aggregations)
- Data structure is well-defined

**Choose NoSQL when**:
- Flexible schema
- Horizontal scaling needed
- Simple queries
- High write throughput

**Exercise:**
```javascript
// SQL use case: E-commerce with complex relationships
// - Users, Orders, Products, Categories, Reviews
// - Complex JOINs, transactions, referential integrity

// NoSQL use case: Social media posts
// - Flexible schema (posts can have different fields)
// - High write volume
// - Simple queries (get user's posts)
// - Horizontal scaling

// Hybrid approach: Use both!
// - SQL for transactional data (orders, payments)
// - NoSQL for user-generated content (posts, comments)
```

---

### 5. Sharding Basics

**Explanation:**
**Sharding** distributes data across multiple servers for horizontal scaling.

**Shard key**: Field used to distribute data
**Chunks**: Ranges of shard key values

**Exercise:**
```javascript
// 1. Enable sharding on database
sh.enableSharding("mydb");

// 2. Shard collection by user_id
sh.shardCollection("mydb.orders", { user_id: 1 });

// MongoDB distributes data:
// Shard 1: user_id 1-1000
// Shard 2: user_id 1001-2000
// Shard 3: user_id 2001-3000

// 3. Choose good shard key:
// ✅ High cardinality (many unique values)
// ✅ Even distribution
// ✅ Queries include shard key

// Bad shard key: status (low cardinality)
sh.shardCollection("mydb.orders", { status: 1 }); // ❌

// Good shard key: user_id (high cardinality)
sh.shardCollection("mydb.orders", { user_id: 1 }); // ✅

// Compound shard key:
sh.shardCollection("mydb.orders", { user_id: 1, created_at: 1 });

// 4. Query with shard key (fast):
db.orders.find({ user_id: 123 }); // Targets specific shard

// Query without shard key (slow):
db.orders.find({ status: "pending" }); // Queries all shards!
```
