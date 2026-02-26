#!/usr/bin/env bash
# Build and push Digital Library images to Docker Hub (sadafjamal3)
set -e

DOCKER_USER="${DOCKER_USER:-sadafjamal3}"
TAG="${1:-latest}"

echo "Building images (tag: $TAG)..."
docker compose build --no-cache

echo "Tagging for Docker Hub..."
docker tag digital-library-backend "${DOCKER_USER}/digital-library-backend:${TAG}"
docker tag digital-library-frontend "${DOCKER_USER}/digital-library-frontend:${TAG}"

echo "Pushing to Docker Hub (login with: docker login)..."
docker push "${DOCKER_USER}/digital-library-backend:${TAG}"
docker push "${DOCKER_USER}/digital-library-frontend:${TAG}"

echo "Done. Images pushed:"
echo "  - ${DOCKER_USER}/digital-library-backend:${TAG}"
echo "  - ${DOCKER_USER}/digital-library-frontend:${TAG}"
