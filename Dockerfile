# Dockerfile for SIGOQ Django application
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies (if any)
# (Add any apt-get install commands here if needed)

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port (Gunicorn will bind to 8000)
EXPOSE 8000

# Default command
CMD ["gunicorn", "sigoq.wsgi:application", "--bind", "0.0.0.0:8000"]