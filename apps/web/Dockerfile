


FROM node:20-alpine AS development

WORKDIR /app


COPY package*.json ./
RUN npm ci


COPY . .


EXPOSE 3000


CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM node:20-alpine AS builder

WORKDIR /app


COPY package*.json ./
RUN npm ci


COPY . .


ARG VITE_API_URL
ARG VITE_APP_NAME=Phoenix
ARG VITE_APP_VERSION=0.1.0


ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION


RUN npm run build


FROM nginx:alpine AS production


COPY nginx.conf /etc/nginx/conf.d/default.conf


COPY --from=builder /app/dist /usr/share/nginx/html


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
