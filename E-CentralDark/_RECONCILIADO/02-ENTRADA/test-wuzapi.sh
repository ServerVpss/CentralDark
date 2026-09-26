#!/bin/bash

export WUZAPI_URL="http://127.0.0.1:8081"
export TOKEN="admin"

echo "== WUZAPI USERS =="
curl -s $WUZAPI_URL/admin/users -H "Authorization: $TOKEN"

echo -e "\n== WUZAPI STATUS =="
curl -s $WUZAPI_URL/session/status/30898908-6622-4c87-b85e-5d84d774f164 -H "token: admin" || echo "FAIL"

