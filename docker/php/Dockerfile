FROM php:8.3-fpm

# ──────────────────────────────────────────────
# 1. Systémové závislosti + Octave
# ──────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    # PHP build závislosti
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    # Utility
    git \
    curl \
    unzip \
    zip \
    # *** GNU Octave + control toolbox ***
    octave \
    octave-control \
    octave-signal \
    && rm -rf /var/lib/apt/lists/*

# ──────────────────────────────────────────────
# 2. PHP rozšírenia pre Laravel
# ──────────────────────────────────────────────
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        xml \
        curl

# ──────────────────────────────────────────────
# 3. Composer
# ──────────────────────────────────────────────
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ──────────────────────────────────────────────
# 4. Užívateľ (aby súbory neboli root-owned)
# ──────────────────────────────────────────────
ARG UID=1000
ARG GID=1000

RUN groupadd -g ${GID} appuser \
    && useradd -u ${UID} -g appuser -m -s /bin/bash appuser

# ──────────────────────────────────────────────
# 5. Pracovný adresár
# ──────────────────────────────────────────────
WORKDIR /var/www/html

# ──────────────────────────────────────────────
# 6. Over Octave pri builde
# ──────────────────────────────────────────────
RUN octave-cli --eval "pkg load control; disp('Octave + control toolbox OK')"

EXPOSE 9000
CMD ["php-fpm"]