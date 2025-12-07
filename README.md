# Task Tracker

A simple task management app where users can create, edit, delete and manage their tasks.

**Live URL:** https://brew-assingment.vercel.app

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Better Auth
- Tailwind CSS + shadcn/ui
- Jest for testing

### Why this stack?

I chose Next.js, Prisma, PostgreSQL, and shadcn/ui because I'm most comfortable with this stack. The assignment also encouraged using these technologies and they're pretty popular for building full-stack apps.

I used Better Auth instead of NextAuth because Better Auth works much better in a TypeScript environment and has better support for things I needed.

## Setup Instructions

### 1. Clone and install

```bash
git clone https://github.com/tarunkumar2005/brew-assingment.git
cd brew-assingment
bun install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project/database
3. Click "Connect" button on top
4. You'll get two connection strings:
   - **Transaction pooler** - for normal database connections
   - **Session pooler** - for migrations

### 3. Environment variables

Create a `.env` file:

```env
DATABASE_URL="your-transaction-pooler-url"
DIRECT_URL="your-session-pooler-url"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="any-random-long-string"
```

### 4. Run migrations

```bash
bunx prisma migrate dev --name init
```

Note: You need to change the env variable `DIRECT_URL` to `DATABASSE_URL` for running migrations otherwise you can adjust the command to use the `DIRECT_URL` variable. If you do without changing the env variable or adjusting the command, you might get connection issues and migration will fail.

### 5. Start dev server

```bash
bun run dev
```

Open http://localhost:3000

## Running Tests

```bash
bun run test
```

Tests are basic unit tests for API validation logic. I'm newer to writing tests so kept them simple.

## CI/CD

GitHub Actions runs lint and tests on every push. It doesn't auto-deploy because Vercel handles deployment automatically. One thing to note - Vercel will try to deploy even before CI runs, so if tests fail the deploy might still go through. That's a tradeoff I made.

## Assumptions

- Only email/password authentication (no Google OAuth) - kept it simple
- No email verification - Better Auth supports it but skipped for simplicity
- Tasks are private to each user
- Tests are basic - focused on API validation logic only

## AI Usage Disclosure

I used AI for:

- Understanding and setting up Jest tests - I don't usually write tests so needed help here
- Setting up GitHub Actions CI/CD pipeline - haven't done this before
- Generating the initial Figma UI wireframe/design

The actual application code, components, API routes, database schema, and authentication setup I did myself.
