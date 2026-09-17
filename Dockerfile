# ---- Etapa 1: build con Angular CLI ----
# @angular/cli 22 exige Node >=22.22.3/24.15.0/26.0.0; node:20 no alcanza.
FROM node:22-alpine AS build
WORKDIR /build

# Se copia primero package*.json para aprovechar la cache de capas de Docker:
# las dependencias solo se vuelven a instalar si estos archivos cambian.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build

# ---- Etapa 2: Nginx sirviendo los archivos estaticos ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist/frontend-campuslab/browser /usr/share/nginx/html

EXPOSE 80
