# Auth Frontend

Shared authentication frontend for Rierco Laboratory Systems.

## Overview

This is the central authentication portal that handles:
- User login
- User registration  
- System selection (Tire Lab / Materials Lab)
- Password recovery

## Tech Stack

- React 18
- Redux Toolkit
- React Router v6
- Tailwind CSS
- Vite

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run on `http://localhost:3004`

### Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env.dev` file:

```env
# Auth Service API
VITE_AUTH_URL=http://localhost:3005/auth

# Redirect URLs for each laboratory system
VITE_TIRE_LAB_URL=http://localhost:3000
VITE_MATERIALS_LAB_URL=http://localhost:3003

# App Info
VITE_APP_NAME=سامانه آزمایشگاه‌های ریرکو
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/signup` | Registration page |
| `/forgot-password` | Password recovery |
| `/select-system` | System selection (after login) |

## Authentication Flow

1. User visits `auth.rierco.net`
2. User logs in or registers
3. After successful login, user is redirected to `/select-system`
4. User selects which laboratory system to access
5. User is redirected to `tire.rierco.net/auth-callback?token=xxx` or `lab.rierco.net/auth-callback?token=xxx`
6. The lab frontend stores the token and shows the dashboard

## Project Structure

```
src/
├── components/
│   ├── Button.jsx
│   ├── GuestRoute.jsx
│   ├── Input.jsx
│   ├── LoadingScreen.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── ForgotPassword.jsx
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   └── SystemSelector.jsx
├── store/
│   ├── authSlice.js
│   └── store.js
├── App.jsx
├── index.css
└── main.jsx
```

## Production Domains

| Service | Domain |
|---------|--------|
| Auth Frontend | auth.rierco.net |
| Auth Service | api.auth.rierco.net |
| Tire Lab | tire.rierco.net |
| Materials Lab | lab.rierco.net |
