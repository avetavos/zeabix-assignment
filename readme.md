# Zeabix Assignment - Tech Overview & Guide

## 🛠️ Tech Stack Overview

This repository is a microservices-based system for order and inventory management, event streaming, and API gateway. It uses:

- **Node.js** & **NestJS**: For all backend services
- **MongoDB 8.0**: Inventory data (with replica set support for transactions)
- **PostgreSQL**: Orders data (with Debezium CDC)
- **Kafka**: Event streaming between services
- **Docker Compose**: Local orchestration of all services
- **Prisma ORM**: For PostgreSQL in orders-service
- **Mongoose ODM**: For MongoDB in inventory-service
- **Postman**: API testing

## 📦 Services in This Repo

### 1. **authentication-service**
- Handles user authentication and authorization
- Exposes REST APIs for login, registration, etc.

### 2. **gateway**
- API Gateway for routing requests to backend services
- Handles plugins (e.g., role-checker)

### 3. **inventory-service**
- Manages inventory stock
- Uses MongoDB (with replica set for transactions)
- Consumes order events from Kafka, updates inventory, emits inventory events

### 4. **orders-service**
- Manages orders
- Uses PostgreSQL (with Debezium for CDC)
- Emits order events to Kafka

### 5. **event-streaming**
- Contains Kafka, Debezium connectors, and scripts for event streaming
- Connects MongoDB and PostgreSQL to Kafka topics

## 🚀 How to Run All Services

### 1. **Clone the Repository**
```bash
git clone <this-repo-url>
cd zeabix-assignment
```

### 2. **Start All Services with Docker Compose**
Each service has its own `docker-compose.yml`. Start them in this order:

#### a. **event-streaming** (Kafka, Debezium, Zookeeper, Connectors)
```bash
cd event-streaming
cp .env.example .env
# Edit .env if needed
# Start Kafka, Zookeeper, Debezium, Connectors
sudo docker-compose up -d
```

#### b. **inventory-service** (MongoDB, Inventory API)
```bash
cd ../inventory-service
cp .env.example .env
# Edit .env if needed
sudo docker-compose up -d
```

#### c. **orders-service** (PostgreSQL, Orders API)
```bash
cd ../orders-service
cp .env.example .env
# Edit .env if needed
sudo docker-compose up -d
```

#### d. **authentication-service** and **gateway**
```bash
cd ../authentication-service
cp .env.example .env
sudo docker-compose up -d

cd ../gateway
cp .env.example .env
sudo docker-compose up -d
```

### 3. **Check Service Health**
- Inventory: http://localhost:<inventory-port>/health
- Orders: http://localhost:<orders-port>/health

## 🧪 How to Test with Postman

1. **Import the Collection**
   - Open Postman
   - Import `postman-collection/Shoplite.postman_collection.json`

2. **Set Environment Variables**
   - Set base URLs for each service (inventory, orders, gateway, etc.)

3. **Run Test Requests**
   - Place an order via the gateway or orders-service
   - Check inventory adjustment via inventory-service
   - Test authentication endpoints
   - Observe event streaming in Kafka (optional)

4. **Check Event Flow**
   - Orders placed → Orders-service emits event → Kafka → Inventory-service consumes event → Inventory updated

## 📚 Useful Commands

- **View Kafka topics:**
  ```bash
  docker exec -it <kafka-container> kafka-topics --bootstrap-server localhost:9092 --list
  ```
- **View MongoDB:**
  ```bash
  docker exec -it inventory-mongodb mongosh
  ```
- **View PostgreSQL:**
  ```bash
  docker exec -it orders-service-order-db-1 psql -U orders_user -d orders_db
  ```

## 📝 Notes
- Ensure all `.env` files are configured for your local environment.
- For CDC, Debezium connectors must be running and properly configured.

---

**For more details, see the docs/ folder and each service's README.**
