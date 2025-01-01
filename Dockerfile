FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies including react-router-dom, axios, and tailwindcss
RUN npm install
RUN npm install react-router-dom axios framer-motion react-icons react-spinners tailwind-scrollbar tailwindcss postcss autoprefixer

# Install the Babel plugin
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Copy the rest of your application code
COPY . .

# Create Tailwind CSS configuration files
RUN npx tailwindcss init -p

# Build the React app for production
RUN npm run build

# Install serve to serve the built files
RUN npm install -g serve

# Dynamically expose the port with an environment variable
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]
