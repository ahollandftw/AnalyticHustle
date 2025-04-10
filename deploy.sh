#!/bin/bash

# Create a temporary directory for deployment
mkdir -p deploy

# Copy necessary files and directories
cp -r app deploy/
cp -r components deploy/
cp -r lib deploy/
cp -r hooks deploy/
cp -r public deploy/
cp -r styles deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp tsconfig.json deploy/
cp tailwind.config.ts deploy/
cp postcss.config.mjs deploy/
cp next.config.mjs deploy/
cp components.json deploy/
cp README.md deploy/

# Create a zip file
cd deploy
zip -r ../deployment.zip .
cd ..

# Clean up
rm -rf deploy

echo "Deployment package created: deployment.zip" 