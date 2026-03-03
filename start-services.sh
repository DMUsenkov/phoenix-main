#!/bin/bash


echo " Starting Phoenix services..."


if ! docker info > /dev/null 2>&1; then
    echo "Warning  Docker is not running. Starting Docker Desktop..."
    open -a Docker


    echo "Waiting Waiting for Docker to start..."
    counter=0
    while ! docker info > /dev/null 2>&1; do
        sleep 2
        counter=$((counter + 2))
        if [ $counter -ge 60 ]; then
            echo "X Docker failed to start within 60 seconds"
            exit 1
        fi
    done
    echo "OK Docker is running"
fi


cd "$(dirname "$0")"


echo " Starting Phoenix containers..."
docker-compose up -d


echo "Waiting Waiting for services to be healthy..."
sleep 10


if docker ps | grep -q "phoenix-api.*healthy"; then
    echo "OK Phoenix API is healthy"
else
    echo "Warning  Phoenix API is not healthy yet"
fi

if docker ps | grep -q "phoenix-postgres.*healthy"; then
    echo "OK PostgreSQL is healthy"
else
    echo "Warning  PostgreSQL is not healthy yet"
fi

if docker ps | grep -q "phoenix-minio.*healthy"; then
    echo "OK MinIO is healthy"
else
    echo "Warning  MinIO is not healthy yet"
fi

echo ""
echo " Phoenix services are running!"
echo ""
echo "Place Services:"
echo "   - API:        http://localhost:8001"
echo "   - PostgreSQL: localhost:5433"
echo "   - MinIO:      http://localhost:9000"
echo "   - MinIO UI:   http://localhost:9001"
echo ""
echo "Info To view logs: docker-compose logs -f"
echo "Info To stop:      docker-compose down"
