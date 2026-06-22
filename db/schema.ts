import {
  pgTable,
  serial,
  integer,
  bigint,
  varchar,
  text,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

export const budgetYears = pgTable("budget_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  income: bigint("income", { mode: "number" }).notNull(),
  expenditure: bigint("expenditure", { mode: "number" }).notNull(),
  drrf: bigint("drrf", { mode: "number" }).notNull(),
  sef: bigint("sef", { mode: "number" }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: text("title").notNull(),
  awardee: varchar("awardee", { length: 255 }).notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  category: varchar("category", { length: 100 }).notNull().default("Other"),
  date: varchar("date", { length: 20 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  source: varchar("source", { length: 50 }).notNull().default("philgeps"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dpwhProjects = pgTable("dpwh_projects", {
  contractId: varchar("contract_id", { length: 100 }).primaryKey(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("Other"),
  status: varchar("status", { length: 50 }).notNull(),
  budget: bigint("budget", { mode: "number" }).notNull(),
  amountPaid: bigint("amount_paid", { mode: "number" }).notNull().default(0),
  progress: integer("progress").notNull().default(0),
  contractor: text("contractor").notNull().default(""),
  startDate: varchar("start_date", { length: 50 }).notNull().default(""),
  completionDate: varchar("completion_date", { length: 50 }).notNull().default(""),
  infraYear: varchar("infra_year", { length: 10 }).notNull().default(""),
  sourceOfFunds: varchar("source_of_funds", { length: 255 }).notNull().default(""),
  latitude: real("latitude"),
  longitude: real("longitude"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
