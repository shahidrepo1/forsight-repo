# Start with slim Python base
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PYTHONPATH=/app

# Set working directory
WORKDIR /app

# Install system-level dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    libxml2 \
    libxslt1-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    netcat-openbsd \
    # WeasyPrint dependencies
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    fonts-liberation \
    fonts-dejavu \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# ✅ Copy full backend project including forsight/settings.py
COPY . .

# Optional: collect static files (uncomment if needed)
# RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Start Gunicorn server
CMD ["gunicorn", "--workers=4", "--bind=0.0.0.0:8000", "forsight.wsgi:application"]
