#!/usr/bin/env node

/**
 * MiniMax Usage Query Script
 * Reads ANTHROPIC_BASE_URL to determine API endpoint
 * Uses ANTHROPIC_AUTH_TOKEN as the API key
 */

import https from 'https';

const baseUrl = process.env.ANTHROPIC_BASE_URL || '';
const authToken = process.env.ANTHROPIC_AUTH_TOKEN || '';

if (!authToken) {
  console.error('Error: ANTHROPIC_AUTH_TOKEN is not set');
  console.error('');
  console.error('Set the environment variable and retry:');
  console.error('  export ANTHROPIC_AUTH_TOKEN="your-token-here"');
  process.exit(1);
}

let apiHost = 'https://api.minimaxi.com';

if (baseUrl.includes('minimax.io')) {
  apiHost = 'https://minimax.io';
} else {
  apiHost = 'https://api.minimaxi.com';
}

const apiUrl = `${apiHost}/v1/api/openplatform/coding_plan/remains`;

console.log(`MiniMax API Host: ${apiHost}`);
console.log('');

const queryUsage = () => {
  return new Promise((resolve, reject) => {
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

      res.on('data', (chunk) => {
        data += chunk;
      });

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

          // 找到 MiniMax-M* 模型的用量
          const m = json.model_remains.find(item => item.model_name === 'MiniMax-M*');
          if (!m) {
            console.log('未找到 MiniMax-M* 用量数据');
            return resolve();
          }

          const total = m.current_interval_total_count;
          const used = m.current_interval_usage_count;
          const remaining = total - used;
          const percentage = Math.round((used / total) * 100);

          const remainingMs = m.remains_time;
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

          const resetTime = new Date(m.end_time).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

          const weeklyTotal = m.current_weekly_total_count;
          const weeklyUsed = m.current_weekly_usage_count;
          const weeklyRemaining = weeklyTotal - weeklyUsed;
          const weeklyPercentage = weeklyTotal > 0 ? Math.floor((weeklyUsed / weeklyTotal) * 100) : 0;
          const weeklyRemainingMs = m.weekly_remains_time;
          const weeklyDays = Math.floor(weeklyRemainingMs / (1000 * 60 * 60 * 24));
          const weeklyHours = Math.floor((weeklyRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

          const weeklyResetTime = new Date(m.weekly_end_time).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

          const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
          const timeText = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
          const weeklyBar = '█'.repeat(Math.floor(weeklyPercentage / 10)) + '░'.repeat(10 - Math.floor(weeklyPercentage / 10));
          const weeklyTimeText = weeklyDays > 0 ? `${weeklyDays}天${weeklyHours}小时` : `${weeklyHours}小时`;

          console.log('MiniMax Coding Plan 用量状态');
          console.log('----------------------------------------');
          console.log(`模型: ${m.model_name}`);
          console.log(`已用(5h): ${used.toLocaleString()} / ${total.toLocaleString()}`);
          console.log(`进度: [${bar}] ${percentage}%`);
          console.log(`剩余(5h): ${remaining.toLocaleString()} 次`);
          console.log(`重置: ${resetTime} (约${timeText})`);
          console.log('----------------------------------------');
          if (weeklyTotal > 0) {
            console.log(`周用量: ${weeklyUsed.toLocaleString()} / ${weeklyTotal.toLocaleString()}`);
            console.log(`周进度: [${weeklyBar}] ${weeklyPercentage}%`);
            console.log(`周重置: ${weeklyResetTime} (约${weeklyTimeText})`);
            console.log('----------------------------------------');
          }

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
};

queryUsage().catch((error) => {
  console.error('查询失败:', error.message);
  process.exit(1);
});
