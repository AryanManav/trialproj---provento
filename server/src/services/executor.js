import vm from 'node:vm';
import util from 'node:util';
import { config } from '../config.js';

/**
 * Safely stringifies arguments passed to console methods.
 */
function formatArgs(args) {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'undefined') return 'undefined';
      try {
        return util.inspect(arg, {
          depth: 4,
          colors: false,
          maxArrayLength: 50,
          compact: false,
        });
      } catch (err) {
        return String(arg);
      }
    })
    .join(' ');
}

/**
 * Executes JavaScript code in a sandboxed VM context with execution timeout and captured logs.
 *
 * @param {string} code - The JavaScript code to execute.
 * @param {number} [timeoutMs] - Maximum execution time in milliseconds.
 * @returns {Promise<{ success: boolean, output: string, error: string|null, executionTimeMs: number }>}
 */
export async function executeCode(code, timeoutMs = config.maxExecutionTimeMs) {
  const startTime = Date.now();
  const logs = [];
  let truncated = false;

  const pushLog = (type, args) => {
    if (logs.length > 500) {
      if (!truncated) {
        logs.push('[Output limit reached. Further logs truncated.]');
        truncated = true;
      }
      return;
    }
    const line = formatArgs(args);
    logs.push(line);
  };

  // Build a secure sandbox environment with common standard JS utilities
  const sandbox = {
    console: {
      log: (...args) => pushLog('log', args),
      info: (...args) => pushLog('info', args),
      warn: (...args) => pushLog('warn', args),
      error: (...args) => pushLog('error', args),
      dir: (...args) => pushLog('dir', args),
      table: (...args) => pushLog('table', args),
    },
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    URIError,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Promise,
    Symbol,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURI,
    decodeURI,
    encodeURIComponent,
    decodeURIComponent,
  };

  const context = vm.createContext(sandbox);

  try {
    const script = new vm.Script(code, {
      displayErrors: true,
    });

    const result = script.runInContext(context, {
      timeout: timeoutMs,
      displayErrors: true,
      breakOnSigint: true,
    });

    // If code evaluates to a Promise, wait for it with timeout
    if (result && typeof result.then === 'function') {
      const promiseResult = await Promise.race([
        result,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Execution timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);
      if (logs.length === 0 && promiseResult !== undefined) {
        logs.push(formatArgs([promiseResult]));
      }
    } else if (logs.length === 0 && result !== undefined) {
      logs.push(formatArgs([result]));
    }

    const executionTimeMs = Date.now() - startTime;
    let output = logs.join('\n');
    if (output.length > config.maxOutputLength) {
      output = output.substring(0, config.maxOutputLength) + '\n... [Output truncated]';
    }

    return {
      success: true,
      output: output || '(No output produced)',
      error: null,
      executionTimeMs,
    };
  } catch (err) {
    const executionTimeMs = Date.now() - startTime;
    const isTimeout =
      err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' ||
      err.message.includes('timed out');

    const errorMessage = isTimeout
      ? `Execution Timeout: Code took longer than ${timeoutMs}ms to complete.`
      : `${err.name}: ${err.message}`;

    return {
      success: false,
      output: logs.join('\n'),
      error: errorMessage,
      executionTimeMs,
    };
  }
}
