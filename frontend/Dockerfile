FROM node:20-slim

WORKDIR /app

COPY package.json /app/package.json
RUN npm install

COPY index.html /app/index.html
COPY vite.config.ts /app/vite.config.ts
COPY tsconfig.json /app/tsconfig.json
COPY tailwind.config.js /app/tailwind.config.js
COPY postcss.config.js /app/postcss.config.js
COPY src /app/src

EXPOSE 5173

CMD ["npm", "run", "dev"]
