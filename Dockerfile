FROM node:18-alpine

WORKDIR /app-frontend

COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build

EXPOSE 3000

ENV PORT=3000

ENV NEXT_PUBLIC_API_URL=https://app-api-3ajijyz4inxm6.azurewebsites.net

CMD ["yarn", "start"]
