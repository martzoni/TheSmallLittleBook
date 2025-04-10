# TheSmallLittleBook Application

A minimalist accounting and management application designed specifically for small associations. Built with React, Node.js, and MongoDB.

## 📸 Screenshot

![TheSmallLittleBook App Screenshot](.github/images/app-screenshot.png)

## 🚀 Features

- User authentication (register/login)
- Financial record management (add, view, update, delete)
- Search and filter functionality
- Responsive design
- Dark/Light theme support

## 🛠 Tech Stack

### Frontend
- React with TypeScript
- Vite
- TailwindCSS
- Flowbite React components

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## 📦 Project Structure

```
TheSmallLittleBook/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── docker-compose.yml # Docker composition file
└── .env               # Environment variables
```

## 🚦 Getting Started

### Prerequisites
- Docker and Docker Compose
- Make
- Node.js (for local development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/TheSmallLittleBook.git
cd TheSmallLittleBook
```

2. Create .env file in the root directory with required variables:
```properties
# Application
NODE_ENV=development
APP_NAME=TheSmallLittleBook

# Ports
FRONTEND_PORT=4242
BACKEND_PORT=3000

# URLs
API_URL=http://backend:${BACKEND_PORT}
FRONTEND_URL=http://frontend:${FRONTEND_PORT}
MONGODB_URI=mongodb://mongodb:27017/thesmalllittlebook

# Variables pour Vite (Frontend)
VITE_API_URL=${API_URL}
```

3. Build and start the application using Make commands:
```bash
# Build all containers
make build

# Start the application
make up

# Stop the application
make down

# View logs
make logs

# Rebuild and restart specific service
make rebuild service=frontend
```

The application will be available at:
- Frontend: http://localhost:4242
- Backend API: http://localhost:3000
- MongoDB: mongodb://localhost:27017

## 🚧 Project Status

This project is currently under development.
