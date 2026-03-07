# Dockerfile for SIGOQ Django Backend
FROM python:3.12-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies for WeasyPrint and Postgres
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libpangocairo-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files (optional here, can be done in compose)
# RUN python manage.py collectstatic --noinput

# Expose port (Backend mapped to 8001 in production compose)
EXPOSE 8000

# Default command using Gunicorn
CMD ["gunicorn", "sigoq.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
