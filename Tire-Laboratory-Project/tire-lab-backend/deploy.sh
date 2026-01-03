echo "Building app ..."
npm run build

echo "Deploying files to server..."
scp -r * root@194.180.11.232:/var/www/tire-lab-backend/

echo "Restarting backend on VPS..."
ssh root@194.180.11.232 "pm2 restart tire-backend"

echo "Done!"