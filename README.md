<div align="center">

# 🚀 CollabSpace
### AI-Powered Unified Collaborative Platform

*One workspace. Every tool your team needs.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-6366f1?style=for-the-badge)](https://collab-space-pranali.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-pranali440-black?style=for-the-badge&logo=github)](https://github.com/pranali440)

</div>

---

## ✨ What is CollabSpace?

CollabSpace brings together everything your team needs to collaborate — in one place. No more switching between tools. Code, draw, chat, plan, and meet — all inside a single workspace.

---

## 🛠️ Features

| Feature | Description |
|---|---|
| 🖊️ **Whiteboard** | Real-time collaborative drawing with Excalidraw |
| 💻 **Code Editor** | Live code sharing with Monaco Editor + AI assistant |
| 📝 **Notepad** | Shared notes synced in real-time across the team |
| 💬 **Team Chat** | Instant messaging inside every workspace |
| 📋 **Kanban Board** | Drag-and-drop task management |
| 🎥 **Video Call** | In-browser video conferencing via JaaS/Jitsi |
| 🤖 **AI Assistant** | Code generation powered by Groq API |
| 💡 **Ideas Board** | Brainstorm and organize ideas collaboratively |
| 🔐 **Secure Auth** | JWT + Google & GitHub OAuth2 login |

---

## 🧱 Tech Stack

```
Frontend   →   React.js + Vite + Tailwind CSS
Backend    →   Spring Boot + Java 17 + JWT
Database   →   MySQL
Real-time  →   WebSocket
AI         →   Groq API
Auth       →   JWT + Google OAuth2 + GitHub OAuth2
```

---

## 📁 Project Structure

```
CollabSpace/
│
├── 📂 collabspace_frontend/        # React + Vite
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── api/                    # Axios config
│   │   ├── store/                  # Context & state
│   │   └── services/               # Firebase config
│   └── .env                        # 🔒  frontend keys
│
└── 📂 Backend/authService/authService/   # Spring Boot
    ├── src/main/java/com/CollabSpace/
    │   ├── config/                 # Security & WebSocket
    │   ├── controller/             # REST APIs
    │   ├── service/                # Business logic
    │   ├── entities/               # JPA entities
    │   ├── seviceImpl/             #Implementation
    │   └── repositories/           # Data access
    └── src/main/resources/
        ├── application.properties          
        
```

---

## ⚙️ Local Setup

### Prerequisites
- ✅ Java 17
- ✅ Maven
- ✅ Node.js v18+
- ✅ MySQL (running locally)
- ✅ Git

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/pranali440/CollabSpace.git
cd CollabSpace
```

---

### Step 2 — Backend Setup

**Create the database:**
```sql
CREATE DATABASE collabspace_db;
```

**Create `application-local.properties`** inside `Backend/authService/authService/src/main/resources/`:
```properties
DB_PASSWORD=your_mysql_password
MAIL_PASSWORD=your_gmail_app_password
GROQ_API_KEY=your_groq_api_key
GITHUB_SECRET=your_github_oauth_secret
GOOGLE_SECRET=your_google_oauth_secret
JAAS_APP_ID=your_jaas_app_id
JAAS_API_KEY_ID=your_jaas_api_key_id
JAAS_PRIVATE_KEY_CONTENT=-----BEGIN PRIVATE KEY-----
...your key...
-----END PRIVATE KEY-----
```

**Run the backend:**
```bash
cd Backend/authService/authService
mvn spring-boot:run
```
> Backend starts at `http://localhost:8081`

---

### Step 3 — Frontend Setup

**Install dependencies:**
```bash
cd collabspace_frontend
npm install
```

**Create `.env` file** inside `collabspace_frontend/`:
```env
VITE_API_URL=http://localhost:8081
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
VITE_GITHUB_TOKEN=your_github_token
```

**Run the frontend:**
```bash
npm run dev
```
> Frontend starts at `http://localhost:5173`

---

## 🔑 API Keys — Where to Get Them

| Key | Get it from |
|---|---|
| `VITE_FIREBASE_API_KEY` | [Firebase Console](https://console.firebase.google.com) → Project Settings |
| `VITE_YOUTUBE_API_KEY` | [Google Cloud](https://console.cloud.google.com) → YouTube Data API v3 |
| `VITE_GOOGLE_BOOKS_API_KEY` | [Google Cloud](https://console.cloud.google.com) → Books API |
| `VITE_GITHUB_TOKEN` | [GitHub](https://github.com/settings/tokens) → Personal Access Tokens |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com) |
| `GITHUB_SECRET` | [GitHub OAuth Apps](https://github.com/settings/developers) |
| `GOOGLE_SECRET` | [Google Cloud](https://console.cloud.google.com) → OAuth 2.0 |
| `JAAS_*` keys | [JaaS Console](https://jaas.8x8.vc) |
| `MAIL_PASSWORD` | Gmail → Security → App Passwords |

---

## 🔗 OAuth2 Redirect URIs

When setting up OAuth apps, use these callback URLs:

- **Google:** `http://localhost:8081/login/oauth2/code/google`
- **GitHub:** `http://localhost:8081/login/oauth2/code/github`

---
