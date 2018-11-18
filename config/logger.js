import winston from 'winston';
import props from '../properties';

export default winston.createLogger({
  level: props.logLevel,
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.printf(msg =>
      winston.format
        .colorize()
        .colorize(msg.level, `${msg.level}: ${msg.message}`)
    )
  ),
  transports: new winston.transports.Console(),
});
