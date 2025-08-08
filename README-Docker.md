# Docker Deployment Guide

## 🐳 Docker Architecture

This shopping solution uses a microservices architecture with Docker containers:

- **Frontend**: React app served by NGINX
- **Product Catalog API**: .NET 8 API with SQL Server
- **Order Service**: Node.js API with MongoDB  
- **NGINX Proxy**: Load balancer and reverse proxy
- **Databases**: SQL Server + MongoDB + Redis

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- At least 4GB RAM available

### Start All Services
```bash
# Build and start all containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Service Commands
```bash
# Build specific service
docker-compose build productcatalog-api

# Start specific service
docker-compose up -d sqlserver mongodb

# View service logs
docker-compose logs productcatalog-api
```

## 🔍 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | React application |
| NGINX Proxy | http://localhost:8080 | Load balancer |
| Product API | http://localhost:5001 | .NET API direct |
| Order Service | http://localhost:3001 | Node.js API direct |
| SQL Server | localhost:1433 | Database |
| MongoDB | localhost:27017 | NoSQL Database |

## 🏥 Health Checks

All services include health checks:
```bash
# Check service status
docker-compose ps

# Check individual service health
curl http://localhost:5001/health
curl http://localhost:3001/health
```

## 🛠 Development Mode

Use the override file for development:
```bash
# Start with development settings
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Hot reload is enabled for all services
```

## 📊 Monitoring

### View Container Stats
```bash
docker stats
```

### Service Logs
```bash
# All services
docker-compose logs

# Specific service with follow
docker-compose logs -f productcatalog-api

# Last 100 lines
docker-compose logs --tail=100 order-service
```

## 🗄 Database Access

### SQL Server
```bash
# Connect to SQL Server
docker exec -it shopping-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd'
```

### MongoDB
```bash
# Connect to MongoDB
docker exec -it shopping-mongodb mongo -u admin -p password123 --authenticationDatabase admin
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :80
   
   # Kill the process (Windows)
   taskkill /PID <PID> /F
   ```

2. **Database connection issues**
   ```bash
   # Restart databases
   docker-compose restart sqlserver mongodb
   
   # Check database logs
   docker-compose logs sqlserver
   ```

3. **Build failures**
   ```bash
   # Clean rebuild
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## 📝 Environment Variables

Create `.env` file in root directory:
```env
# Database passwords
SA_PASSWORD=YourStrong!Passw0rd
MONGO_ROOT_PASSWORD=password123

# API Configuration
API_BASE_URL=http://localhost:5001
ORDER_API_URL=http://localhost:3001

# Environment
ENVIRONMENT=production
```

## 🚀 Production Deployment

### AWS ECS Deployment
```bash
# Build for production
docker-compose -f docker-compose.yml build

# Tag images for ECR
docker tag shopping-solution_frontend:latest <account>.dkr.ecr.region.amazonaws.com/shopping-frontend:latest

# Push to ECR
docker push <account>.dkr.ecr.region.amazonaws.com/shopping-frontend:latest
```

### Kubernetes Deployment
See `k8s/` directory for Kubernetes manifests.

## 🔐 Security Features

- NGINX reverse proxy with rate limiting
- Security headers (XSS, CSRF protection)
- Container user privilege separation
- Network isolation with Docker networks
- Environment-based configuration