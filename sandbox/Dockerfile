FROM python:3.11-slim

# Install minimal dependencies; no network tools, no compilers, no shells beyond /bin/sh
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for bot execution
RUN groupadd -r botrunner && useradd -r -g botrunner botrunner

# Create sandbox directories
RUN mkdir -p /sandbox/input /sandbox/output /sandbox/bot && \
    chown -R botrunner:botrunner /sandbox

WORKDIR /sandbox

# Drop privileges: no root, no sudo, no shell
USER botrunner

# Entrypoint: run bot with timeout and resource limits
# Usage: docker run --rm --memory=256m --cpus=0.5 --read-only --tmpfs /tmp:size=10m igts-bot-sandbox /bot/my_bot.py
ENTRYPOINT ["python3"]
