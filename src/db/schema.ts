import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real, doublePrecision } from 'drizzle-orm/pg-core';

// Users table storing the driver profile details (such as current vehicle details)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  model: text('model').default('Honda CG 160 Fan'),
  plate: text('plate').default('MBO-4A26'),
  averageConsumption: doublePrecision('average_consumption').default(38), // km/L
  fuelType: text('fuel_type').default('Gasolina'),
  currentKm: real('current_km').default(42150.0),
  dailyGoal: real('daily_goal').default(180.0),
  username: text('username').default('admin'),
  password: text('password').default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Deliveries table mapping the completed/pending deliveries
export const deliveries = pgTable('deliveries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  app: text('app').notNull(), // iFood, Rappi, etc.
  earnings: real('earnings').notNull(),
  distanceKm: real('distance_km').notNull(),
  tip: real('tip').default(0),
  waitTimeMin: integer('wait_time_min').default(0),
  date: text('date').notNull(), // YYYY-MM-DD
  kmStart: real('km_start'),
  kmEnd: real('km_end'),
  fromAddress: text('from_address'),
  toAddress: text('to_address'),
  status: text('status').default('Concluído'), // Concluído, Pendente
  createdAt: timestamp('created_at').defaultNow(),
});

// Fuel Expenses table
export const fuelExpenses = pgTable('fuel_expenses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  liters: real('liters').notNull(),
  pricePerLiter: real('price_per_liter').notNull(),
  totalCost: real('total_cost').notNull(),
  kmAtFuel: real('km_at_fuel').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Maintenance Records table
export const maintenanceRecords = pgTable('maintenance_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // Troca de Óleo, Pneus, etc.
  cost: real('cost').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  kmAtMaintenance: real('km_at_maintenance').notNull(),
  nextDueKm: real('next_due_km'),
  nextDueDate: text('next_due_date'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Other Expenses table
export const otherExpenses = pgTable('other_expenses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // Alimentação, etc.
  cost: real('cost').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Payment Transactions table
export const paymentTransactions = pgTable('payment_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientName: text('client_name').notNull(),
  amount: real('amount').notNull(),
  method: text('method').notNull(), // PIX, etc.
  status: text('status').default('Pendente'), // Sucesso, Pendente, Falhou
  date: text('date').notNull(), // ISO string or text
  deliveryId: text('delivery_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations for drizzle queries
export const usersRelations = relations(users, ({ many }) => ({
  deliveries: many(deliveries),
  fuelExpenses: many(fuelExpenses),
  maintenanceRecords: many(maintenanceRecords),
  otherExpenses: many(otherExpenses),
  paymentTransactions: many(paymentTransactions),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  user: one(users, {
    fields: [deliveries.userId],
    references: [users.id],
  }),
}));

export const fuelExpensesRelations = relations(fuelExpenses, ({ one }) => ({
  user: one(users, {
    fields: [fuelExpenses.userId],
    references: [users.id],
  }),
}));

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  user: one(users, {
    fields: [maintenanceRecords.userId],
    references: [users.id],
  }),
}));

export const otherExpensesRelations = relations(otherExpenses, ({ one }) => ({
  user: one(users, {
    fields: [otherExpenses.userId],
    references: [users.id],
  }),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
}));
