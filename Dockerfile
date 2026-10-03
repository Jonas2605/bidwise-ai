# Build the React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY shared ./shared
COPY frontend ./frontend

RUN npm run build --prefix frontend


# Run the Express backend and serve the built frontend
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm ci --prefix backend

COPY shared ./shared
COPY backend ./backend

COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start", "--prefix", "backend"]