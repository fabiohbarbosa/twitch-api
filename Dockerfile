#---- STAGE 1 - build stage ----
FROM node:11.1.0 as builder

ARG WORKDIR=/service-api
RUN mkdir -p ${WORKDIR}
WORKDIR ${WORKDIR}

COPY package.json .
COPY package-lock.json .

RUN npm install --production

# ---- STAGE 2 - final image stage ----
FROM node:11.1.0-alpine

ARG WORKDIR=/service-api
RUN mkdir -p ${WORKDIR}
WORKDIR ${WORKDIR}

COPY --from=builder ${WORKDIR}/node_modules/ ./node_modules

RUN npm rebuild

COPY config config
COPY properties properties
COPY src src
COPY index.js .

EXPOSE 8080
CMD ["node", "index.js"]
