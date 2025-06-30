#!/bin/bash
set -e

CMD_ID=$1
INSTANCE_ID=$2

if [ -z "$CMD_ID" ] || [ -z "$INSTANCE_ID" ]; then
  echo "Usage: $0 <command-id> <instance-id>"
  exit 1
fi

echo "Waiting for command $CMD_ID to finish on $INSTANCE_ID..."

while true; do
  STATUS=$(aws ssm get-command-invocation \
    --command-id "$CMD_ID" \
    --instance-id "$INSTANCE_ID" \
    --query 'Status' \
    --output text 2>/dev/null || echo "Pending")

  echo "Status: $STATUS"

  if [[ "$STATUS" == "Success" ]]; then
    echo "✅ Command completed successfully on $INSTANCE_ID"
    
    # Показать вывод команды
    echo "Command output:"
    aws ssm get-command-invocation \
      --command-id "$CMD_ID" \
      --instance-id "$INSTANCE_ID" \
      --query 'StandardOutputContent' \
      --output text
    break
    
  elif [[ "$STATUS" == "Failed" || "$STATUS" == "TimedOut" || "$STATUS" == "Cancelled" ]]; then
    echo "❌ Command on $INSTANCE_ID failed with status: $STATUS"
    
    # Показать ошибки
    echo "Error output:"
    aws ssm get-command-invocation \
      --command-id "$CMD_ID" \
      --instance-id "$INSTANCE_ID" \
      --query 'StandardErrorContent' \
      --output text
    
    echo "Standard output:"
    aws ssm get-command-invocation \
      --command-id "$CMD_ID" \
      --instance-id "$INSTANCE_ID" \
      --query 'StandardOutputContent' \
      --output text
    exit 1
  else
    sleep 5
  fi
done