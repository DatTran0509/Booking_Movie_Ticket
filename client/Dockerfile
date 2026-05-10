FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@latest && npm ci

COPY . .

ARG VITE_BASE_URL=
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_TMDB_IMAGE_BASE_URL
ARG VITE_CURRENCY

ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV VITE_TMDB_IMAGE_BASE_URL=${VITE_TMDB_IMAGE_BASE_URL}
ENV VITE_CURRENCY=${VITE_CURRENCY}

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
