# backend/Dockerfile
FROM node:20 AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Étape finale
FROM node:20 AS runner

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
