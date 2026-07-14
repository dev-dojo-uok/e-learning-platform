#!/bin/bash

# Base directories
ROOT_DIR="$(pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Determine commands based on --dev flag
if [ "$1" == "--dev" ]; then
    echo "Starting development servers..."
    BACKEND_CMD="npm run dev"
    FRONTEND_CMD="npm run dev"
else
    echo "Starting production servers..."
    BACKEND_CMD="npm start"
    FRONTEND_CMD="npm start"
fi

# Open Backend in a new Mac Terminal
osascript -e "tell application \"Terminal\" to do script \"cd '$BACKEND_DIR' && $BACKEND_CMD\""

# Open Frontend in a new Mac Terminal
osascript -e "tell application \"Terminal\" to do script \"cd '$FRONTEND_DIR' && $FRONTEND_CMD\""

echo "Servers launched!"
