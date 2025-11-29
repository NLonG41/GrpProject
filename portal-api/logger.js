import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const REQUEST_LOG = path.join(LOG_DIR, "requests.log");
const AUDIT_LOG = path.join(LOG_DIR, "audit.log");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const writeLine = (filePath, line) => {
  fs.appendFile(filePath, `${line}\n`, (err) => {
    if (err) {
      console.error("[LOGGER] failed to write log file", err);
    }
  });
};

const timestamp = () => new Date().toISOString();

export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  const userId = req.header("x-user-id") || "anonymous";
  const baseMsg = `[${timestamp()}] user=${userId} method=${req.method} url=${req.originalUrl}`;

  console.log(`[REQ] ${baseMsg}`);
  writeLine(REQUEST_LOG, `[REQ] ${baseMsg} body=${JSON.stringify(req.body || {})}`);

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    const statusLine = `[RES] ${baseMsg} status=${res.statusCode} duration=${duration}ms`;
    console.log(statusLine);
    writeLine(REQUEST_LOG, statusLine);
  });

  next();
};

export const auditLog = ({ action, entityId, entityType, payload }, req) => {
  const userId = req?.header("x-user-id") || "anonymous";
  const line = `[${timestamp()}] user=${userId} action=${action} entityType=${entityType} entityId=${entityId ?? "n/a"} payload=${JSON.stringify(payload || {})}`;
  console.log(`[AUDIT] ${line}`);
  writeLine(AUDIT_LOG, `[AUDIT] ${line}`);
};


