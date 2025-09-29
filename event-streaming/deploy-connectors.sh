#!/bin/bash

# Debezium Connector Deployment Script
# This script deploys connectors to consume data from order_db and inventory_db

echo "🔌 Deploying Debezium Connectors..."

# Wait for Debezium Connect to be ready
echo "⏳ Waiting for Debezium Connect to be ready..."
until curl -f http://localhost:8083/connectors >/dev/null 2>&1; do
  echo "Debezium Connect is not ready yet. Waiting..."
  sleep 10
done

echo "✅ Debezium Connect is ready!"

# Deploy Orders PostgreSQL Connector
echo "📦 Deploying Orders PostgreSQL Connector..."
curl -X POST \
  -H "Content-Type: application/json" \
  --data @./connectors/orders-postgres-connector.json \
  http://localhost:8083/connectors

echo ""

# Deploy Inventory MongoDB Connector
echo "📊 Deploying Inventory MongoDB Connector..."
curl -X POST \
  -H "Content-Type: application/json" \
  --data @./connectors/inventory-mongodb-connector.json \
  http://localhost:8083/connectors

echo ""

# List all connectors
echo "📋 Active Connectors:"
curl -s http://localhost:8083/connectors | jq .

echo ""

# Check connector status
echo "🔍 Connector Status:"
echo "Orders Connector:"
curl -s http://localhost:8083/connectors/orders-postgres-connector/status | jq .

echo ""
echo "Inventory Connector:"
curl -s http://localhost:8083/connectors/inventories-mongodb-connector/status | jq .

echo ""
echo "🎉 Connector deployment completed!"
echo "🌐 Access Kafdrop at: http://localhost:9000 to view topics"
echo "🔧 Access Debezium Connect API at: http://localhost:8083"