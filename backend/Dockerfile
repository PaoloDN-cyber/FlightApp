FROM node:22-bookworm-slim

# Impostiamo la cartella di lavoro per il backend
WORKDIR /app

# Copia i file di configurazione per le dipendenze
COPY package.json package-lock.json ./

# Installa TUTTE le dipendenze, forzando legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copia il resto del codice del backend nella cartella di lavoro
COPY . .

# Installa le dipendenze del backend
RUN npm run compile 

# Espone la porta su cui il backend gira
EXPOSE 8080

CMD ["npm", "start"]