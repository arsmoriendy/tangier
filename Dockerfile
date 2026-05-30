FROM oven/bun:alpine AS build-stage
RUN apk update
RUN apk add python3 build-base libudev-zero
WORKDIR /opt/var/tangier
COPY . .
RUN bun install
RUN bun -b run build

FROM oven/bun:alpine
RUN apk update
RUN apk add libudev-zero
WORKDIR /opt/var/tangier
COPY --from=build-stage /opt/var/tangier/.next/standalone .
CMD ["./server.js"]
