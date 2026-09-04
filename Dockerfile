# Simplified, ultra-fast Docker build for Railway
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Copy requirements and install pre-compiled wheels
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Create runtime data directories
RUN mkdir -p data logs

# Copy static frontend build and backend code
COPY --from=frontend-builder /app/dist ./dist
COPY backend ./backend

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
