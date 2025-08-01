#!/bin/bash

echo "Setting up NAIDP monorepo..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install package dependencies
echo "Installing package dependencies..."
cd packages/domain && npm install && cd ../..
cd packages/db && npm install && cd ../..
cd packages/protocols && npm install && cd ../..
cd packages/ui && npm install && cd ../..
cd packages/test-utils && npm install && cd ../..

# Install app dependencies (simplified versions)
echo "Installing app dependencies..."
cd apps/user-api && npm install express cors helmet express-rate-limit dotenv morgan @types/express @types/cors @types/morgan typescript ts-node-dev && cd ../..
cd apps/admin-api && npm install express cors helmet express-rate-limit dotenv morgan joi @types/express @types/cors @types/morgan @types/joi typescript ts-node-dev && cd ../..

echo "Setup complete! You can now run 'npm run build' to build all packages."