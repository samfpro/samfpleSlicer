class ConsoleLogger {
  constructor() {
    this.consoleLog = document.getElementById('consoleLog');
    this.wrapLogMethods();
  }

  wrapLogMethods() {
    const methods = ['log', 'error'];
    methods.forEach(method => {
      const originalMethod = console[method];
      console[method] = (...args) => {
        this.appendToConsole(args.join(' '), method);
        originalMethod.apply(console, args);
      };
    });
  }

  appendToConsole(message, type) {
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry', type);
    logEntry.textContent = message;
    this.consoleLog.prepend(logEntry);
  }
}

// Initialize the ConsoleLogger class
const consoleLogger = new ConsoleLogger();