import cron from 'node-cron';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_PATH = path.join(__dirname, '../health-check.log');

const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL ;
const WORKER_SERVICE_URL = process.env.WORKER_SERVICE_URL ;
const GATEWAY_URL = process.env.GATEWAY_URL ;

async function checkServiceHealth(name, url) {
  try {
    const res = await fetch(url);
    const data = await res.text();
    return { name, status: res.ok ? 'healthy' : 'unhealthy', data, timestamp: new Date().toISOString() };
  } catch (err) {
    return { name, status: 'unhealthy', error: err.message, timestamp: new Date().toISOString() };
  }
}

async function runHealthChecks() {
  const results = await Promise.all([
    checkServiceHealth('gateway', `${process.env.GATEWAY_URL || 'http://localhost:3000'}/health`),
    checkServiceHealth('admin', `${process.env.ADMIN_SERVICE_URL || 'http://localhost:3001'}/`),
    checkServiceHealth('user', `${process.env.USER_SERVICE_URL || 'http://localhost:3002'}/`),
    checkServiceHealth('worker', `${process.env.WORKER_SERVICE_URL || 'http://localhost:3003'}/`),
  ]);
  const logEntry = results.map(r => JSON.stringify(r)).join('\n') + '\n';
  fs.appendFileSync(LOG_PATH, logEntry);
  console.log('Health check results:', results);
}

// Schedule every 3 minutes
cron.schedule('*/3 * * * *', runHealthChecks);

// Run immediately on start
runHealthChecks(); 