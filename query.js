#!/usr/bin/env node

/**
 * MiniMax Coding Plan Helper
 * CLI tool for setting up and querying MiniMax Coding Plan usage
 */

import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import https from 'https';

const API_HOST = 'https://api.minimaxi.com';
const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');

// ============ Setup Functions ============

function getSettings() {
  try {
    return JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
  } catch {
    return { env: {}, permissions: { allow: [], deny: [] }, enabledPlugins: {} };
  }
}

function saveSettings(settings) {
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

function setup(token) {
  if (!token || !token.startsWith('sk-cp-')) {
    console.error('Error: Invalid token format. Token should start with "sk-cp-"');
    console.error('');
    console.error('Usage: npx @yakumoryo/minimax-plan-usage setup <your-token>');
    console.error('');
    console.error('Example:');
    console.error('  npx @yakumoryo/minimax-plan-usage setup sk-cp-YOUR_TOKEN_HERE');
    process.exit(1);
  }

  const settings = getSettings();

  if (!settings.env) settings.env = {};

  settings.env.ANTHROPIC_AUTH_TOKEN = token;
  settings.env.ANTHROPIC_BASE_URL = `${API_HOST}/anthropic`;

  if (!settings.env.ANTHROPIC_MODEL) settings.env.ANTHROPIC_MODEL = 'MiniMax-M2.7';
  if (!settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL) settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = 'MiniMax-M2.7';
  if (!settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL) settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL = 'MiniMax-M2.7';
  if (!settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL) settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL = 'MiniMax-M2.7';

  if (!settings.permissions) {
    settings.permissions = { allow: ['Bash(*)', 'Read(*)', 'Write(*)', 'Edit(*)'], deny: [] };
  }

  if (!settings.enabledPlugins) settings.enabledPlugins = {};

  saveSettings(settings);

  console.log('');
  console.log('✅ MiniMax Coding Plan configured successfully!');
  console.log('');
  console.log('Settings updated:');
  console.log(`  ANTHROPIC_AUTH_TOKEN: ${token.slice(0, 20)}...`);
  console.log(`  ANTHROPIC_BASE_URL: ${API_HOST}/anthropic`);
  console.log('');
  console.log('Restart Claude Code to apply changes, then run:');
  console.log('  npx @yakumoryo/minimax-plan-usage query');
}

// ============ Query Functions ============

function queryUsage() {
  return new Promise((resolve, reject) => {
    const apiUrl = `${API_HOST}/v1/api/openplatform/coding_plan/remains`;
    let authToken = process.env.ANTHROPIC_AUTH_TOKEN;

    // Fallback to settings.json if env var not set
    if (!authToken) {
      try {
        const settings = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
        authToken = settings.env?.ANTHROPIC_AUTH_TOKEN;
      } catch {}
    }

    if (!authToken) {
      return reject(new Error('ANTHROPIC_AUTH_TOKEN not set. Run: npx @yakumoryo/minimax-plan-usage setup <token>'));
    }

    const parsedUrl = new URL(apiUrl);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => { data += chunk; });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          if (res.statusCode === 401) {
            return reject(new Error('认证失败，请检查 ANTHROPIC_AUTH_TOKEN 是否正确'));
          }
          return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }

        try {
          const json = JSON.parse(data);
          if (!json.model_remains || json.model_remains.length === 0) {
            console.log('无可用用量数据');
            return resolve();
          }

          const m = json.model_remains[0];
          const remaining = m.current_interval_usage_count;
          const total = m.current_interval_total_count;
          const used = total - remaining;
          const percentage = Math.round((used / total) * 100);

          const remainingMs = m.remains_time;
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

          const resetTime = new Date(m.end_time).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
          });

          const weeklyRemaining = m.current_weekly_usage_count;
          const weeklyTotal = m.current_weekly_total_count;
          const weeklyUsed = weeklyTotal - weeklyRemaining;
          const weeklyPercentage = Math.floor((weeklyUsed / weeklyTotal) * 100);
          const weeklyRemainingMs = m.weekly_remains_time;
          const weeklyDays = Math.floor(weeklyRemainingMs / (1000 * 60 * 60 * 24));
          const weeklyHours = Math.floor((weeklyRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

          const weeklyResetTime = new Date(m.weekly_end_time).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
          });

          const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
          const timeText = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
          const weeklyBar = '█'.repeat(Math.floor(weeklyPercentage / 10)) + '░'.repeat(10 - Math.floor(weeklyPercentage / 10));
          const weeklyTimeText = weeklyDays > 0 ? `${weeklyDays}天${weeklyHours}小时` : `${weeklyHours}小时`;

          console.log('');
          console.log('MiniMax Coding Plan 用量状态');
          console.log('----------------------------------------');
          console.log(`模型: ${m.model_name}`);
          console.log(`已用(5h): ${used.toLocaleString()} / ${total.toLocaleString()}`);
          console.log(`进度: [${bar}] ${percentage}%`);
          console.log(`剩余(5h): ${remaining.toLocaleString()} 次`);
          console.log(`重置: ${resetTime} (约${timeText})`);
          console.log('----------------------------------------');
          console.log(`周用量: ${weeklyUsed.toLocaleString()} / ${weeklyTotal.toLocaleString()}`);
          console.log(`周进度: [${weeklyBar}] ${weeklyPercentage}%`);
          console.log(`周重置: ${weeklyResetTime} (约${weeklyTimeText})`);
          console.log('----------------------------------------');
          console.log('');

        } catch (e) {
          return reject(new Error(`解析响应失败: ${e.message}`));
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNABORTED') {
        return reject(new Error('请求超时，请检查网络连接'));
      }
      reject(error);
    });

    req.end();
  });
}

// ============ CLI Routing ============

const command = process.argv[2];

if (command === 'setup') {
  const token = process.argv[3];
  setup(token);
} else if (command === 'query') {
  console.log('MiniMax API Host:', API_HOST);
  queryUsage()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('查询失败:', error.message);
      process.exit(1);
    });
} else {
  console.log('MiniMax Coding Plan Helper');
  console.log('');
  console.log('Usage:');
  console.log('  npx @yakumoryo/minimax-plan-usage setup <your-token>  # 配置API Key');
  console.log('  npx @yakumoryo/minimax-plan-usage query               # 查询用量');
  console.log('');
  console.log('Examples:');
  console.log('  npx @yakumoryo/minimax-plan-usage setup sk-cp-YOUR_TOKEN_HERE');
  console.log('  npx @yakumoryo/minimax-plan-usage query');
}
