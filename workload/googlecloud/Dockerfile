FROM cgr.dev/chainguard/node
ENV NODE_ENV=production
# Default port can be overridden with PORT environment variable
ENV PORT=8080

WORKDIR /googlecloud

COPY --chown=node:node ["package.json", "package-lock.json", "tsconfig.json", "./"]
RUN npm install

COPY --chown=node:node ["index.ts", "./"]

# Expose the default port (can be overridden at runtime with -e PORT=XXXX)
EXPOSE ${PORT}

CMD [ "index.ts" ]
