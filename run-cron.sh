#!/bin/bash
curl -s -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://vylozzone.com/api/cron/cleanup-orders"

