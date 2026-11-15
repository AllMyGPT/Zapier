// El runtime de scripts de Bedrock expone `console` (salida en el log del servidor / content log).
declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
