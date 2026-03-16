# FROM node:20-alpine

# WORKDIR /app-frontend

# COPY package.json yarn.lock ./

# ENV NEXT_PUBLIC_API_URL=https://app-api-3ajijyz4inxm6.azurewebsites.net

# RUN yarn install --frozen-lockfile

# COPY . ./

# RUN yarn build

# EXPOSE 3000

# ENV PORT=3000

# USER node

# CMD ["yarn", "start"]
