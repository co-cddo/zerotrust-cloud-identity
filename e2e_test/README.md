# E2E Test

## Run locally

```bash
nvm install
nvm use
npm install
npm test
```

Features are all stored in the `features` directory, and the step definitions are stored in the `step-definitions` directory.

You shouldn't need to change the features, apart from adding the provider name to the `Examples` table the Scenarios are are based on the described in the parent [README.md](../README.md).

The step definitions are where the magic happens, and where you'll need to put your implementation logic.