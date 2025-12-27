# CipherSQLStudio

**🎮 Created by Gourav Chaudhary**

[![GitHub](https://img.shields.io/badge/GitHub-GouravSittam-blue?style=flat&logo=github)](https://github.com/GouravSittam)

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints. Features a **Brutalist Gaming Theme** with bold, playful, and modern UI design.

## ✨ Features

- 🎮 **Gaming-Inspired UI** - Brutalist/Neo-Brutalism design with bold colors and animations
- 📝 **SQL Challenges** - View assignments with pre-loaded sample data
- 💻 **Monaco Editor** - Write and execute SQL queries in a professional code editor
- 💡 **AI-Powered Hints** - Get intelligent hints (not solutions) from LLM integration
- 📊 **Real-Time Results** - See query execution results instantly
- 📱 **Mobile-First Design** - Fully responsive across all devices
- ⚡ **Fast Execution** - PostgreSQL sandbox with schema isolation

## 🎨 Theme

The application uses a **Brutalist Gaming Theme** featuring:

- Dark base with vibrant neon accents (Orange, Cyan, Pink, Purple)
- Bold offset shadows and thick borders
- Gaming-inspired terminology (Challenges, Power-Ups, Victory)
- Space Grotesk & JetBrains Mono fonts
- Smooth hover animations and glow effects

## 🛠️ Tech Stack

### Frontend

- **React.js** with Vite
- **Monaco Editor** (SQL code editor)
- **SCSS** with Brutalist Gaming Theme
- **React Router** for navigation

### Backend

- **Node.js** & **Express.js**
- **MongoDB Atlas** (assignments & user progress)
- **PostgreSQL** (sandbox query execution)
- **LLM Integration** (OpenAI/Gemini for hints)

## 📁 Project Structure

```
CipherSQLStudio/
├── client/                    # React Frontend (Vite)
│   ├── public/               # Static assets & CipherSchools logo
│   └── src/
│       ├── components/       # Header, Footer, SQLEditor, ResultsPanel, SampleDataViewer
│       ├── pages/            # AssignmentList, AssignmentAttempt
│       ├── services/         # API integration (axios)
│       └── styles/           # SCSS (Brutalist Gaming Theme)
│
├── server/                    # Express.js Backend
│   ├── config/               # MongoDB & PostgreSQL configs
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── services/             # Query execution & LLM services
│   ├── scripts/              # Database seeding
│   └── server.js             # Entry point
│
└── Documentation/
    ├── README.md             # This file
    ├── QUICK_START.md        # 5-minute setup guide
    ├── ARCHITECTURE.md       # System design
    └── ...                   # Other docs
```

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- PostgreSQL v13+
- MongoDB Atlas account
- OpenAI/Gemini API key

### Installation

```bash
# Clone repository
git clone https://github.com/GouravSittam/CipherSQLStudio.git
cd CipherSQLStudio

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

**Server (.env)**

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ciphersqlstudio_app
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
LLM_API_KEY=your_api_key
LLM_PROVIDER=gemini
```

**Client (.env)**

```env
VITE_API_URL=http://localhost:5000/api
```

### Run Application

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📡 API Endpoints

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/assignments`     | List all assignments   |
| GET    | `/api/assignments/:id` | Get assignment details |
| POST   | `/api/execute/query`   | Execute SQL query      |
| POST   | `/api/hints`           | Get AI-generated hint  |
| POST   | `/api/progress`        | Save user progress     |

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1023px
- **Desktop**: 1024px - 1280px
- **Large Desktop**: 1281px+

## 🔒 Security Features

- SQL query validation and sanitization
- Schema isolation per user session
- Blocked destructive operations (DROP, DELETE, UPDATE)
- Query timeout protection (5 seconds)
- Result row limit (1000 rows)

## 📄 License

MIT License © Gourav Chaudhary

---

**Made with ❤️ by [Gourav Chaudhary](https://github.com/GouravSittam)**
