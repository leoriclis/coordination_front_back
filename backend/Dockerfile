FROM python:3.11-slim-bookworm AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

WORKDIR /code

RUN apt-get update && apt-get install -y --no-install-recommends \
    xz-utils \
    fontconfig \
    gcc \
    libpq-dev \
    libgdal-dev \
    libffi-dev \
    libfreetype6 \
    libjpeg62-turbo \
    libpng16-16 \
    libx11-6 \
    libxcb1 \
    libxext6 \
    libxrender1 \
    xz-utils \
    xfonts-75dpi \
    xfonts-base \
    locales \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configuration locales
ENV LC_ALL=fr_FR.UTF-8 \
    LANG=fr_FR.UTF-8 \
    LANGUAGE=fr_FR.UTF-8
RUN sed -i '/fr_FR.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

# install deps python
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .