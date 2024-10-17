import { utils as sushiUtils } from 'fsh-sushi';
import { utils as gofshUtils } from 'gofsh';

// Default the logger to SUSHI's logger, but support switching
// between the loggers so that any file can import one logger
// and have the stats tracked correctly
export let fshOnlineLogger = sushiUtils.logger;
export function setCurrentLogger(loggerName, loggerLevel) {
  if (loggerName === 'sushi') {
    fshOnlineLogger = sushiUtils.logger;
  } else if (loggerName === 'gofsh') {
    fshOnlineLogger = gofshUtils.logger;
  }
  fshOnlineLogger.level = loggerLevel;
}
