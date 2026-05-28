# Pyro 
A production-grade real-time chat application built with TypeScript, Node.js, React, Socket.IO, PostgreSQL, and Prisma.

Pyro delivers realtime messaging, typing indicators, unread tracking, online presence, infinite scrolling, offline resilience, and production deployment infrastructure using AWS, Nginx, PM2, and CI/CD.

---

## Features

###  Real-Time Messaging

* Socket.IO powered realtime communication
* Room-based messaging architecture
* Instant message broadcasting
* Optimistic UI updates

### Presence System

* Online/offline user tracking
* Active user broadcasting
* Reconnection handling
* Room restoration after reconnect

### Typing Indicators

* Live typing status updates
* Room-specific typing events
* Realtime typing synchronization

### Message System

* Infinite scroll message pagination
* Offline message queueing
* Message synchronization after reconnect
* Read/unread tracking architecture
* Message timestamps

### Authentication & Security

* JWT authentication
* Protected Socket.IO connections
* Secure API middleware
* Production HTTPS setup

###  Database Architecture

* PostgreSQL relational schema
* Prisma ORM integration
* Optimized database indexing
* Room membership system
* Attachment support

### 🚀Production Infrastructure

* AWS EC2 deployment
* Nginx reverse proxy
* PM2 process management
* GitHub Actions CI/CD
* HTTPS with SSL certificates
* Custom domain setup

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Axios
* Socket.IO Client
* Vite

### Backend

* Node.js
* Express.js
* TypeScript
* Socket.IO
* Prisma ORM
* JWT Authentication

### Database

* PostgreSQL
* Prisma

### DevOps & Deployment

* AWS EC2
* Nginx
* PM2
* GitHub Actions
* Docker
* Certbot SSL

---

## System Architecture

```txt
Frontend (Vercel)
        ↓
Nginx Reverse Proxy
        ↓
Node.js + Express + Socket.IO
        ↓
PostgreSQL + Prisma ORM
```

---

## Realtime Features

### Socket Events

#### Client → Server

* `joinRoom`
* `leaveRoom`
* `typing:start`
* `typing:stop`
* `restoreRooms`

#### Server → Client

* `userOnline`
* `userOffline`
* `onlineUsers`
* `typing:start`
* `typing:stop`

---

## Monorepo Structure

```txt
Pyro/
├── frontend/
├── backend/
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

---

## Environment Variables

### Backend

```env
DATABASE_URL=
PORT=
JWT_SECRET=
JWT_EXPIRES_IN=
```

### Frontend

```env
VITE_API_URL=
VITE_SOCKET_URL=
```

---

##  Local Development Setup

### 1. Clone Repository

```bash
git clone <repo-url>
cd Pyro
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create:

```txt
backend/.env
```

Add required environment variables.

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start Backend

```bash
npm run dev
```

### 6. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🌍 Production Deployment

### Backend

* Hosted on AWS EC2
* Managed using PM2
* Reverse proxied with Nginx
* HTTPS configured with Certbot

### Frontend

* Hosted on Vercel
* Connected to production backend using custom domain

### CI/CD

Automatic backend deployment using GitHub Actions:

```txt
Push → GitHub Actions → EC2 → Build → PM2 Restart
```

---


### Authentication

* Login & Signup pages
* Protected routes

### Chat Interface

* Realtime messaging
* Typing indicators
* Presence system
* Infinite scrolling

---

## 🧠 Key Engineering Concepts

* WebSocket architecture
* Offline resilience
* Reconnection handling
* Realtime synchronization
* Optimistic UI updates
* Presence systems
* Infinite pagination
* Scalable room-based messaging
* CI/CD deployment pipelines
* Production infrastructure management

---

## 🔮 Upcoming Features

* AI-powered assistant inside rooms
* Message search
* Read receipts
* File uploads
* Voice/video support
* Push notifications
* AI conversation summaries
* AI smart replies

---

## 👨‍💻 Author

Bhavya Bhardwaj

* Portfolio: [https://bhavy4.tech](https://bhavya.live)
* GitHub: [https://github.com/Bhavyabhardwaj](https://github.com/Bhavyabhardwaj)

---

## 📄 License

This project is licensed under the MIT License.
