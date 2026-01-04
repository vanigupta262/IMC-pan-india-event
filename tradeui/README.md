# Trade Simulation UI

A modular Next.js 16 application for trade simulation with C++ backend integration.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Setup

1. Install dependencies:
```bash
npm install lucide-react @monaco-editor/react zustand class-variance-authority tailwind-merge clsx
```

2. Configure backend:
```bash
cp .env.example .env.local
```
Edit `.env.local` and set `NEXT_PUBLIC_API_URL`

## Features

- Authentication (Login/Signup with JWT)
- Monaco Editor for C++ code
- Submission history with swap functionality
- Admin dashboard with user/lobby management
- Auto-distribution algorithm (groups of 10)
- Modular atomic design pattern

## Test Credentials

- Admin: `admin@example.com` / `admin123`
- User: any email / `password`

## Build

```bash
npm run build
npm start
```
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Shadcn/UI](https://ui.shadcn.com/) - UI components

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

**Built for IMC Pan India Event | Next.js 16 + Tailwind CSS 4 + Zustand**

