#!/bin/bash

URL="http://localhost:3000/api/auth/login"
EMAIL="test@example.com"
PASSWORD="wrongpassword"

echo "Testing Rate Limiting..."

for i in {1..4}
do
  echo "Attempt $i:"
  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST $URL \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
  
  echo "Status Code: $response"
  
  if [ "$i" -eq 4 ]; then
    if [ "$response" -eq 429 ]; then
      echo "SUCCESS: Rate limit hit on attempt $i."
    else
      echo "FAILURE: Expected 429 on attempt $i, got $response."
    fi
  fi
  
  # Small delay to ensure requests are processed
  sleep 1
done
