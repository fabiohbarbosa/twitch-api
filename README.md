Twitch API
=====================

## Links:
- [CI/CD](https://circleci.com/gh/fabiohbarbosa/twitch-api)
- [Coveralls](https://coveralls.io/github/fabiohbarbosa/twitch-api?branch=master)
- [Kubernetes Healthcheck](http://35.244.227.171/api/healthcheck)

## NVM
Change your node version to a project current node version.

`nvm use`

## ESLint
`npm run eslint`

## Test
`npm test`


## Run
`npm start`

## Run as a DEV
`npm run start:dev`

## Environment Variables

**CI/CD Variables**

- COVERALLS_REPO_TOKEN: Coveralls token to send coverage reports to [Coveralls](https://coveralls.io).
- ENV_URL: Kubernetes URL to be used in *healthcheck job*.
- GITHUB_TOKEN: Github user token to push tags and relese files.
- GOOGLE_AUTH: Google Cloud service account to deploy service in the Kubernetes.

*The last 3 ones are configured in CircleCi `twitch-envs` context to shared accross all projects.*

**Application Variables**

- LOG_LEVEL: Application log stdout level.
- SCHEDULE_ENABLE: Enable/disable application scheduler.
- SCHEDULE_GAMES_CRON: Crontab expression to configure scheduler.
