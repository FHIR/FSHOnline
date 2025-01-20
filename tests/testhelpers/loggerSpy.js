import { utils as sushiUtils } from 'fsh-sushi';
import { utils as gofshUtils } from 'gofsh';

const sushiLogger = sushiUtils.logger;
const gofshLogger = gofshUtils.logger;

// copied from fsh-sushi and gofsh, since FSH Online logging has the same requirements.

// MUTE_LOGS controls whether or not logs get printed during testing.
// Usually, we don't want logs actually printed, as they cause clutter.
const MUTE_LOGS = true;

class LoggerSpy {
  sushiMockWriter = vi.spyOn(sushiLogger.transports[0], 'write');
  gofshMockWriter = vi.spyOn(gofshLogger.transports[0], 'write');
  constructor() {
    if (MUTE_LOGS) {
      this.sushiMockWriter = this.sushiMockWriter.mockImplementation(() => true);
      this.gofshMockWriter = this.gofshMockWriter.mockImplementation(() => true);
    }
  }

  getAllLogs(level) {
    const logs = this.sushiMockWriter.mock.calls
      .map((m) => m[0])
      .concat(this.gofshMockWriter.mock.calls.map((m) => m[0]));
    if (level) {
      return logs.filter((entry) => RegExp(level).test(entry.level));
    } else {
      return logs;
    }
  }

  getLogAtIndex(index, level) {
    const logs = this.getAllLogs(level);
    const i = index < 0 ? logs.length + index : index;
    return logs[i];
  }

  getFirstLog(level) {
    return this.getLogAtIndex(0, level);
  }

  getLastLog(level) {
    return this.getLogAtIndex(-1, level);
  }

  getAllMessages(level) {
    return this.getAllLogs(level).map((l) => l.message);
  }

  getMessageAtIndex(index, level) {
    return this.getLogAtIndex(index, level)?.message;
  }

  getFirstMessage(level) {
    return this.getMessageAtIndex(0, level);
  }

  getLastMessage(level) {
    return this.getMessageAtIndex(-1, level);
  }

  reset() {
    this.sushiMockWriter.mockReset();
    this.gofshMockWriter.mockReset();
  }
}

export const loggerSpy = new LoggerSpy();
