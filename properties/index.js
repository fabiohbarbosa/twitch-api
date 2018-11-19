const defaultVars = {
  twitch: {
    url: 'https://api.twitch.tv/kraken',
    clientId: '5kmsl1vf18x2rzw290aqbf81hvo8mr'
  }
};

const localVars = {
  port: 8080,
  logLevel: 'info',
  schedule: {
    enable: true,
    gameCron: '*/15 * * * *'
  },
  ...defaultVars
};

const envVars = {
  port: process.env.PORT,
  logLevel: process.env.LOG_LEVEL,
  schedule: {
    enable: process.env.SCHEDULE_ENABLE === 'true' ? true : false,
    gameCron: process.env.SCHEDULE_GAMES_CRON
  },
  ...defaultVars
};

export default !process.env.NODE_ENV ? localVars : envVars;
