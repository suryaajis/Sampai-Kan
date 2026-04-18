# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Sampai-Kan is an on-demand food delivery platform (similar to GoFood/ShopeeFood) built with Express.js and EJS server-side rendering. It has three distinct user roles: **Customer**, **Merchant**, and **Driver**, each with separate controllers, routes, middlewares, and views.

## Commands

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server

# Database
npm run db:setup     # Create DB + run migrations + seed
npm run db:reset     # Drop DB, then run db:setup

# Individual sequelize commands
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npx sequelize-cli db:drop
```

There is no test suite (`npm test` is not implemented).

## Environment Setup

Copy `.env.example` to `.env`. Key variables:

```
PORT=3000
SESSION_SECRET=<random string>
MAIL_SERVICE=hotmail   # Email is optional; omit credentials to skip
MAIL_USER=
MAIL_PASS=
```

Database config lives in `config/config.json`. Development defaults to MySQL at `localhost:3310` with `root/root`. Production reads from `DATABASE_URL` (PostgreSQL with SSL).

## Architecture

**Pattern:** MVC with Express.js + EJS templates

```
app.js              # Entry point — registers middleware, routes, and session
routes/             # Route files per role (customer, driver, merchant, auth)
controllers/        # Business logic per role + auth
middlewares/        # Role-based auth guards (isCustomer, isDriver, isMerchant, isLoggedIn)
models/             # Sequelize models (index.js wires associations)
migrations/         # Schema migrations (sequelize-cli)
seeders/            # Seed data (reads from data/*.json)
views/              # EJS templates per role + partials (header, footer, nav-*)
helpers/            # formatCurrency, formatDate, etc.
nodemailer.js       # Email transport config (skipped if credentials absent)
```

**Authentication:** Session-based (`express-session`). Each role has its own session key (`req.session.customer`, `req.session.driver`, `req.session.merchant`). Passwords are hashed with bcryptjs (10 rounds).

**Cart:** Session-based (`req.session.cart`), not persisted to DB. Enforces a single-store constraint — adding an item from a different store clears the cart.

**Order status flow:** `pending` → `preparing` → `picked_up` → `delivering` → `delivered` (can be `cancelled` at `pending` stage).

**Email:** Nodemailer sends notifications on order status changes. If `MAIL_USER`/`MAIL_PASS` are absent, email is silently skipped.

## Database Models & Key Relationships

- `Customer` → has many `Order`
- `Store` → belongs to `Merchant`; has many `Item`, has many `Order`
- `Order` → has many `OrderItem`; belongs to `Customer`, `Store`, `Driver`
- `Item` → belongs to `Store`, `Category`

Associations are defined in each model file and also centralized in `models/index.js`.

## Demo Accounts (after seeding)

| Store | Email | Password |
|---|---|---|
| Warung Mama Sari | sari@warungmamasari.id | password123 |
| Grill & BBQ Station | budi@grillstation.id | password123 |
| Minum & Camilan | rina@minumancamilan.id | password123 |
