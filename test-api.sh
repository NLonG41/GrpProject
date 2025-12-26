#!/bin/bash

# Test API Script
# Usage: ./test-api.sh

BASE_URL="http://localhost:5001"

echo "🧪 Testing API Endpoints..."
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Health Check: OK${NC}"
else
    echo -e "${RED}❌ Health Check: Failed (HTTP $response)${NC}"
fi
echo ""

# Test 2: Get All Users
echo -e "${YELLOW}2. Testing GET /api/users...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ GET /api/users: OK${NC}"
    curl -s "$BASE_URL/api/users" | head -c 200
    echo "..."
else
    echo -e "${RED}❌ GET /api/users: Failed (HTTP $response)${NC}"
fi
echo ""

# Test 3: Register User
echo -e "${YELLOW}3. Testing POST /api/auth/register...${NC}"
response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test'$(date +%s)'@usth.edu.vn",
    "password": "test123456",
    "role": "ASSISTANT"
  }' \
  -o /dev/null -w "%{http_code}")

if [ "$response" = "201" ]; then
    echo -e "${GREEN}✅ POST /api/auth/register: OK${NC}"
else
    echo -e "${RED}❌ POST /api/auth/register: Failed (HTTP $response)${NC}"
fi
echo ""

# Test 4: Login
echo -e "${YELLOW}4. Testing POST /api/auth/login...${NC}"
response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@usth.edu.vn",
    "password": "test123456"
  }' \
  -o /dev/null -w "%{http_code}")

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ POST /api/auth/login: OK${NC}"
else
    echo -e "${RED}❌ POST /api/auth/login: Failed (HTTP $response)${NC}"
fi
echo ""

# Test 5: Get Subjects
echo -e "${YELLOW}5. Testing GET /api/subjects...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/subjects")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ GET /api/subjects: OK${NC}"
else
    echo -e "${RED}❌ GET /api/subjects: Failed (HTTP $response)${NC}"
fi
echo ""

# Test 6: Get Rooms
echo -e "${YELLOW}6. Testing GET /api/rooms...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/rooms")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ GET /api/rooms: OK${NC}"
else
    echo -e "${RED}❌ GET /api/rooms: Failed (HTTP $response)${NC}"
fi
echo ""

echo "================================"
echo "✅ Testing completed!"

