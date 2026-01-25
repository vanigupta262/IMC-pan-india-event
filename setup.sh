#!/bin/bash

# build docker images
sudo docker buildx build igts-bot-sandbox sandbox/

# setup python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

# build engine
g++ -std=c++23 -O3 -Iengine main.cpp -o game


