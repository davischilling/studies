# ORM / Query Builders

### 1. Prisma

**Pros**:
- ✅ Type-safe (TypeScript)
- ✅ Auto-generated types
- ✅ Great DX (developer experience)
- ✅ Migrations built-in
- ✅ Supports multiple databases

**Cons**:
- ❌ Less flexible than raw SQL
- ❌ Learning curve for schema syntax
- ❌ Can generate inefficient queries

**Common Pitfalls**:
- N+1 queries without `include`
- Missing indexes on relations
- Not using transactions for multiple operations

**Migration Workflow**:
1. Update `schema.prisma`
2. Run `npx prisma migrate dev`
3. Prisma generates migration SQL
4. Apply to production: `npx prisma migrate deploy`

**Exercise:**
```javascript
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  orders    Order[]
  createdAt DateTime @default(now())
}

model Order {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  total     Decimal
  createdAt DateTime @default(now())
}

// Usage:
const prisma = new PrismaClient();

// Create user
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John'
  }
});

// Get user with orders (avoid N+1)
const userWithOrders = await prisma.user.findUnique({
  where: { id: 1 },
  include: { orders: true }
});

// Transaction:
await prisma.$transaction([
  prisma.user.create({ data: { email: 'test@example.com', name: 'Test' } }),
  prisma.order.create({ data: { userId: 1, total: 100 } })
]);

// Migration:
// 1. Edit schema.prisma
// 2. npx prisma migrate dev --name add_user_role
// 3. npx prisma generate
```

---

### 2. Sequelize

**Pros**:
- ✅ Mature, battle-tested
- ✅ Supports many databases
- ✅ Rich feature set
- ✅ Active community

**Cons**:
- ❌ Not type-safe by default
- ❌ Verbose API
- ❌ Can be slow for complex queries
- ❌ Magic behavior can be confusing

**Common Pitfalls**:
- Forgetting `raw: true` (returns instances, not plain objects)
- N+1 queries without `include`
- Timezone issues with dates
- Hooks can cause unexpected behavior

**Migration Workflow**:
1. Create migration: `npx sequelize-cli migration:generate --name add-users`
2. Edit migration file
3. Run: `npx sequelize-cli db:migrate`
4. Rollback: `npx sequelize-cli db:migrate:undo`

**Exercise:**
```javascript
// Define model:
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: DataTypes.STRING
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  total: DataTypes.DECIMAL(10, 2)
});

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Usage:
const user = await User.create({
  email: 'john@example.com',
  name: 'John'
});

// Get user with orders (avoid N+1)
const userWithOrders = await User.findByPk(1, {
  include: [Order]
});

// Raw query:
const users = await User.findAll({ raw: true }); // Plain objects

// Transaction:
await sequelize.transaction(async (t) => {
  await User.create({ email: 'test@example.com', name: 'Test' }, { transaction: t });
  await Order.create({ userId: 1, total: 100 }, { transaction: t });
});

// Migration:
// migrations/20240101000000-create-user.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      name: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  }
};
```

---

### 3. TypeORM

**Pros**:
- ✅ TypeScript-first
- ✅ Decorators for clean syntax
- ✅ Active Record and Data Mapper patterns
- ✅ Supports many databases

**Cons**:
- ❌ Complex for simple use cases
- ❌ Decorators can be confusing
- ❌ Performance issues with large datasets
- ❌ Breaking changes between versions

**Common Pitfalls**:
- Circular dependencies with relations
- N+1 queries without `relations`
- Forgetting to save entities
- Synchronize in production (use migrations!)

**Migration Workflow**:
1. Generate: `npx typeorm migration:generate -n AddUser`
2. Edit migration file
3. Run: `npx typeorm migration:run`
4. Revert: `npx typeorm migration:revert`

**Exercise:**
```javascript
// Define entity:
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.orders)
  user: User;

  @Column('decimal')
  total: number;

  @CreateDateColumn()
  createdAt: Date;
}

// Usage:
const userRepository = getRepository(User);

// Create user
const user = userRepository.create({
  email: 'john@example.com',
  name: 'John'
});
await userRepository.save(user);

// Get user with orders (avoid N+1)
const userWithOrders = await userRepository.findOne(1, {
  relations: ['orders']
});

// Transaction:
await getConnection().transaction(async (manager) => {
  await manager.save(User, { email: 'test@example.com', name: 'Test' });
  await manager.save(Order, { userId: 1, total: 100 });
});

// Migration:
// migrations/1234567890-CreateUser.ts
export class CreateUser1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'user',
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        {
          name: 'email',
          type: 'varchar',
          isUnique: true
        },
        {
          name: 'name',
          type: 'varchar'
        }
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
```

---

### 4. Knex

**Pros**:
- ✅ Query builder (not full ORM)
- ✅ Flexible, close to SQL
- ✅ Great migration system
- ✅ Lightweight

**Cons**:
- ❌ No models/entities
- ❌ No type safety by default
- ❌ Manual relationship handling
- ❌ More boilerplate

**Common Pitfalls**:
- Forgetting to `await` queries
- Not using transactions
- SQL injection with raw queries
- Not closing connections

**Migration Workflow**:
1. Create: `npx knex migrate:make add_users`
2. Edit migration file
3. Run: `npx knex migrate:latest`
4. Rollback: `npx knex migrate:rollback`

**Exercise:**
```javascript
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'mydb'
  }
});

// Create user
await knex('users').insert({
  email: 'john@example.com',
  name: 'John'
});

// Get user
const user = await knex('users').where({ id: 1 }).first();

// Get user with orders (manual JOIN)
const userWithOrders = await knex('users')
  .leftJoin('orders', 'orders.user_id', 'users.id')
  .where('users.id', 1)
  .select('users.*', knex.raw('json_agg(orders.*) as orders'))
  .groupBy('users.id')
  .first();

// Transaction:
await knex.transaction(async (trx) => {
  await trx('users').insert({ email: 'test@example.com', name: 'Test' });
  await trx('orders').insert({ user_id: 1, total: 100 });
});

// Raw query:
const users = await knex.raw('SELECT * FROM users WHERE email = ?', ['john@example.com']);

// Migration:
// migrations/20240101000000_create_users.js
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('name');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```
