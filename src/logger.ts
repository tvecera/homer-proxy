import pino, { Logger } from 'pino';

const defaultLogFilePath = './logs/homer-proxy.log';
const defaultLogLevel = 'info';

let loggerInstance: Logger<never>;

/**
 * Creates a Pino logger instance with specified configuration.
 *
 * @param {string} logLevel - The default logging level for the logger.
 *                            This value is used if LOG_LEVEL is not set in the environment.
 * @returns A Pino logger instance configured with file and pretty printing targets.
 */
export default function getLogger(logLevel: string = defaultLogLevel) {
  if (!loggerInstance) {
    // Determine the log file path and log level, using environment variables if available.
    const logFilePath = process.env.LOG_FILE_PATH || defaultLogFilePath;
    const environmentLogLevel = process.env.LOG_LEVEL || logLevel;

    // Return the Pino logger configured with transport for both file logging and pretty printing.
    loggerInstance = pino(
      pino.transport({
        targets: [
          {
            // File transport configuration.
            target: 'pino/file',
            options: {
              destination: logFilePath, // Path to the log file.
              mkdir: true, // Automatically create the log directory if it doesn't exist.
              level: environmentLogLevel, // Logging level for the file transport.
            },
          },
          {
            // Pretty printing transport configuration for console output.
            target: 'pino-pretty',
            options: {
              colorize: true, // Colorize the output.
              destination: 1, // Standard output (console).
              level: environmentLogLevel, // Logging level for pretty printing.
            },
          },
        ],
      })
    );
  }

  return loggerInstance;
}
