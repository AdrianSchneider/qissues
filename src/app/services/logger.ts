interface Logger {
  debug: (string) => void;
  info:  (string) => void;
  warn:  (string) => void;
  error: (string) => void;
  trace?: (string) => void;
  silent?: (string) => void;
}

export default Logger;
