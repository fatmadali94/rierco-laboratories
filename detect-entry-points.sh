#!/bin/bash

# ============================================
# Detect Entry Points for Backend Services
# Run this to find the correct startup file for each service
# ============================================

echo "============================================"
echo "Detecting Backend Entry Points"
echo "============================================"

check_service() {
    local service_path=$1
    local service_name=$2
    
    echo ""
    echo "=== $service_name ==="
    echo "Path: $service_path"
    
    if [ ! -d "$service_path" ]; then
        echo "❌ Directory not found"
        return
    fi
    
    cd "$service_path"
    
    # Check package.json for start script
    if [ -f "package.json" ]; then
        echo ""
        echo "📦 package.json main field:"
        grep -A 1 '"main"' package.json || echo "Not found"
        
        echo ""
        echo "🚀 package.json scripts:"
        grep -A 10 '"scripts"' package.json | grep -E '"start"|"dev"|"build"'
    fi
    
    # Check for common entry points
    echo ""
    echo "📁 Checking for entry point files:"
    
    if [ -f "src/index.js" ]; then
        echo "  ✓ src/index.js (found)"
    fi
    
    if [ -f "src/server.js" ]; then
        echo "  ✓ src/server.js (found)"
    fi
    
    if [ -f "src/app.js" ]; then
        echo "  ✓ src/app.js (found)"
    fi
    
    if [ -f "index.js" ]; then
        echo "  ✓ index.js (found)"
    fi
    
    if [ -f "server.js" ]; then
        echo "  ✓ server.js (found)"
    fi
    
    if [ -f "dist/index.js" ]; then
        echo "  ✓ dist/index.js (found - built)"
    fi
    
    if [ -f "dist/server.js" ]; then
        echo "  ✓ dist/server.js (found - built)"
    fi
    
    # Check if TypeScript
    if [ -f "tsconfig.json" ]; then
        echo ""
        echo "📘 TypeScript project detected"
        echo "  Build output directory:"
        grep -A 2 '"outDir"' tsconfig.json || echo "  Using default: dist/"
    fi
    
    cd - > /dev/null
}

cd /opt/laboratory-projects

# Check each backend service
check_service "Shared/auth-service" "Auth Service"
check_service "Shared/chat-service" "Chat Service"
check_service "Materals-Parts-Laboratory-Project/materials-parts-lab-backend" "Materials Backend"
check_service "Tire-Laboratory-Project/tire-lab-backend" "Tire Backend"

echo ""
echo "============================================"
echo "Detection Complete"
echo "============================================"
