echo "switching to brand master"
echo "Building app ..."
npm run build

echo "Deploying files to server..."
scp -r dist/* root@194.180.11.232:/var/www/tire-lab-front/
echo "Done!"