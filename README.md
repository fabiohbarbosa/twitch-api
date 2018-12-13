Twitch API
=====================

## Links:
- [CI/CD](https://circleci.com/gh/fabiohbarbosa/workflows/twitch-api)
- [Coveralls](https://coveralls.io/github/fabiohbarbosa/twitch-api?branch=master)
- [Kubernetes Healthcheck](http://35.244.227.171/api/healthcheck)

## NVM
Change your node version to a project current node version.

`nvm use`

## ESLint
`npm run lint`

## ESLint Fix
`npm run lint:fix`

## Test
`npm test`

## Run
`npm start`

## Run as a DEV
`npm run start:dev`

## Environment Variables

**CI/CD Variables**

- ENV_URL: Kubernetes URL to be used in *healthcheck job*.
- CYPRESS_BASE_URL: Cypress base URL that has the production host address
- CYPRESS_RECORD_KEY: Cypress record key to store test reports into the [dashboard](https://dashboard.cypress.io/#/projects/3zzwmr/)
- COVERALLS_REPO_TOKEN: Coveralls token to send coverage reports to [Coveralls](https://coveralls.io).
- GITHUB_TOKEN: Github user token to push tags and relese files.
- GOOGLE_AUTH: Google Cloud service account to deploy service in the Kubernetes.

*All variables, except **COVERALLS_REPO_TOKEN**, are configured in CircleCi `twitch-envs` context to shared accross all projects.*

**Application Variables**

- LOG_LEVEL: Application log stdout level.
- SCHEDULE_ENABLE: Enable/disable application scheduler.
- SCHEDULE_GAMES_CRON: Crontab expression to configure scheduler.

## CI latest report
![Latest Report](https://drive.google.com/open?id=1fmvlgBbSWg2AggUjfG6rDFwh2PbrJouw)
