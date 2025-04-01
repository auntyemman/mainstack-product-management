# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /src/app

# Copy package.json and lock files first (to optimize caching)
COPY package.json package-lock.json ./

# Install only production dependencies to reduce image size
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /src/app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S mainstack -G appgroup
USER mainstack

# Copy necessary files from the build stage
COPY --from=build --chown=mainstack:appgroup /src/app/dist ./dist
COPY --from=build --chown=mainstack:appgroup /src/app/node_modules ./node_modules
COPY --from=build --chown=mainstack:appgroup /src/app/package*.json ./
COPY --from=build --chown=mainstack:appgroup /src/app/.env ./

# Expose the port
EXPOSE 5500

# Run the application
CMD ["npm", "run", "start:prod"]
