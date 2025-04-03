FROM node:20-alpine

WORKDIR /app

# Copier package.json pour les dépendances
COPY package*.json ./

# Installer toutes les dépendances, y compris les dépendances de développement
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port
EXPOSE ${VITE_FRONTEND_PORT}

# Démarrer le serveur de développement
CMD ["npm", "run", "dev", "--", "--host"]
