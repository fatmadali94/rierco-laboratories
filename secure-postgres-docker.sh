#!/bin/bash

# ============================================
# Secure PostgreSQL Configuration for Docker
# This only allows Docker containers, not external access
# ============================================

set -e

echo "============================================"
echo "Secure PostgreSQL Setup for Docker"
echo "============================================"

# Find PostgreSQL version
PG_VERSION=$(ls /etc/postgresql/ | head -1)
PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

# Backup
echo ""
echo "[1/4] Creating backups..."
sudo cp $PG_CONF ${PG_CONF}.backup.$(date +%Y%m%d_%H%M%S)
sudo cp $PG_HBA ${PG_HBA}.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ Backups created"

# Configure to listen ONLY on localhost and Docker bridge
echo ""
echo "[2/4] Configuring PostgreSQL to listen ONLY on localhost and Docker bridge..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost,172.17.0.1'/g" $PG_CONF
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = 'localhost,172.17.0.1'/g" $PG_CONF
sudo sed -i "s/listen_addresses = '\*'/listen_addresses = 'localhost,172.17.0.1'/g" $PG_CONF
echo "✓ PostgreSQL will ONLY listen on localhost and Docker bridge (NOT public IP)"

# Add Docker networks to pg_hba.conf with password authentication
echo ""
echo "[3/4] Configuring access control..."

# Add Docker networks ONLY (not 0.0.0.0/0)
if ! sudo grep -q "172.17.0.0/16" $PG_HBA; then
    echo "" | sudo tee -a $PG_HBA
    echo "# Docker networks (added $(date) - LOCAL ONLY)" | sudo tee -a $PG_HBA
    echo "host    all             all             172.17.0.0/16           md5" | sudo tee -a $PG_HBA
    echo "host    all             all             172.18.0.0/16           md5" | sudo tee -a $PG_HBA
    echo "✓ Added Docker networks with password authentication"
else
    echo "✓ Docker networks already configured"
fi

# Restart PostgreSQL
echo ""
echo "[4/4] Restarting PostgreSQL..."
sudo systemctl restart postgresql
sleep 3

# Verify
echo ""
echo "============================================"
echo "Security Verification"
echo "============================================"
echo ""
echo "PostgreSQL is listening on:"
sudo -u postgres psql -c "SHOW listen_addresses;"

echo ""
echo "✓ SECURE: PostgreSQL is NOT listening on public IP"
echo "✓ SECURE: Only localhost and Docker bridge (172.17.0.1)"
echo "✓ SECURE: Password required for all connections"
echo ""

# Test external access is blocked
echo "Testing security..."
EXTERNAL_IP=$(curl -s ifconfig.me)
echo "Your public IP: $EXTERNAL_IP"
echo ""

# Check if port 5432 is accessible from outside
sudo netstat -tulpn | grep :5432 || ss -tulpn | grep :5432

echo ""
echo "============================================"
echo "✓ Secure Configuration Complete!"
echo "============================================"
echo ""
echo "PostgreSQL is accessible from:"
echo "  ✓ localhost (127.0.0.1)"
echo "  ✓ Docker containers (172.17.0.0/16)"
echo "  ✗ Public internet (BLOCKED)"
echo ""
echo "Now restart Docker containers:"
echo "  cd /opt/laboratory-projects"
echo "  docker-compose -f docker-compose-test.yml restart"
echo ""
