FROM node:20-alpine AS builder

WORKDIR /app

# Kopiuj package.json i package-lock.json
COPY package*.json ./

# Instaluj zależności
RUN npm ci

# Kopiuj resztę kodu
COPY . .

# Buduj aplikację
RUN npm run build

# Etap produkcyjny - używamy nginx do serwowania
FROM nginx:alpine

# Kopiuj zbudowaną aplikację
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiuj konfigurację nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]