# Commander - Personal Command Repository

## Project Structure
```
commander/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   └── App.jsx
    ├── package.json
    └── .env

## Tech Stack
- Backend: Node.js + Express
- Frontend: React + Vite
- Database: MongoDB Atlas
- Authentication: JWT
- UI Framework: Tailwind CSS + shadcn/ui
- Code Editor: Monaco Editor

## Step 1: Project Setup

### 1.1 Create Backend
```bash
mkdir commander
cd commander
mkdir backend
cd backend
npm init -y
npm install express mongoose dotenv cors bcryptjs jsonwebtoken morgan winston
npm install -D nodemon
```

### 1.2 Create Frontend
```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install @monaco-editor/react @tanstack/react-query axios tailwindcss @headlessui/react lucide-react date-fns
npm install -D postcss autoprefixer
```

### 1.3 Initialize Git
```bash
cd ..
git init
echo "node_modules\n.env\n.DS_Store\ndist\nbuild" > .gitignore
```

## Step 2: Database Setup

1. Create MongoDB Atlas account
2. Create new cluster (free tier)
3. Set up database access (username/password)
4. Add IP address to whitelist
5. Get connection string

## Step 3: Environment Setup

### Backend (.env)
```plaintext
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (.env)
```plaintext
VITE_API_URL=http://localhost:5000/api
```

## Step 4: API Routes

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

### Commands
- GET /api/commands
- GET /api/commands/:id
- POST /api/commands
- PUT /api/commands/:id
- DELETE /api/commands/:id
- GET /api/commands/search

## Step 5: Run Development Servers

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```