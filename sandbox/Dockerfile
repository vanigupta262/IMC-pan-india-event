FROM python:3.10-slim

# All bot execution happens here
WORKDIR /bot

# Remove tools that could be abused
RUN apt-get update && \
    apt-get remove -y curl wget gcc make && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Copy ONLY trusted code
COPY runner.py /bot/runner.py

# Run the trusted wrapper
CMD ["python", "runner.py"]