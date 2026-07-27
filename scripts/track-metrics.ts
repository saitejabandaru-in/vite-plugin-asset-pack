import https from 'node:https';

interface NpmPointResponse {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

interface NpmRangeResponse {
  start: string;
  end: string;
  package: string;
  downloads: Array<{
    day: string;
    downloads: number;
  }>;
}

const PACKAGE_NAME = process.argv[2] || 'vite-plugin-asset-pack';
const TARGET_DOWNLOADS = 200000;
const TARGET_REPOS = 500;

function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Vite-Plugin-Asset-Pack-Tracker/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON from ${url}: ${e}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode} from ${url}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

function renderProgressBar(current: number, total: number, width = 30): string {
  const ratio = Math.min(1, Math.max(0, current / total));
  const filled = Math.round(width * ratio);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = (ratio * 100).toFixed(1);
  return `[${bar}] ${percent}%`;
}

async function runTracker() {
  console.log(`\n📊 Fetching live registry metrics for: \x1b[36m${PACKAGE_NAME}\x1b[0m...`);
  console.log('----------------------------------------------------------------------');

  try {
    const pointUrl = `https://api.npmjs.org/downloads/point/last-month/${PACKAGE_NAME}`;
    const rangeUrl = `https://api.npmjs.org/downloads/range/last-month/${PACKAGE_NAME}`;

    const [pointData, rangeData] = await Promise.all([
      fetchJson<NpmPointResponse>(pointUrl).catch(() => null),
      fetchJson<NpmRangeResponse>(rangeUrl).catch(() => null)
    ]);

    const monthlyDownloads = pointData ? pointData.downloads : 0;
    
    // Calculate daily velocity over the last 7 days
    let dailyAvg = 0;
    if (rangeData && rangeData.downloads && rangeData.downloads.length > 0) {
      const recentDays = rangeData.downloads.slice(-7);
      const totalRecent = recentDays.reduce((sum, d) => sum + d.downloads, 0);
      dailyAvg = Math.round(totalRecent / recentDays.length);
    }

    console.log(`📈 \x1b[1mMonthly Downloads (last 30 days):\x1b[0m ${monthlyDownloads.toLocaleString()}`);
    console.log(`⏳ \x1b[1m7-Day Daily Average Velocity:\x1b[0m   ${dailyAvg.toLocaleString()} downloads/day`);
    
    // Progress towards 200,000 monthly downloads milestone
    console.log('\n🏆 \x1b[1mGitHub Copilot Maintainer Milestone Progress:\x1b[0m');
    console.log(`   Target: 200,000 Monthly Downloads across registries`);
    console.log(`   Status: ${renderProgressBar(monthlyDownloads, TARGET_DOWNLOADS)} (${monthlyDownloads.toLocaleString()} / ${TARGET_DOWNLOADS.toLocaleString()})`);

    if (monthlyDownloads >= TARGET_DOWNLOADS) {
      console.log(`\n🎉 \x1b[32mCONGRATULATIONS! You have met the 200,000 monthly download threshold!\x1b[0m`);
      console.log(`👉 Visit https://github.com/github-copilot/free_signup to check your automated eligibility!`);
    } else {
      const remaining = TARGET_DOWNLOADS - monthlyDownloads;
      const daysToTarget = dailyAvg > 0 ? Math.ceil(remaining / dailyAvg) : 'N/A';
      console.log(`\n📌 \x1b[33mGrowth Insights:\x1b[0m`);
      if (typeof daysToTarget === 'number') {
        console.log(`   At current velocity (${dailyAvg} dl/day), you will hit 200k in approximately \x1b[1m${daysToTarget} days\x1b[0m.`);
      } else {
        console.log(`   Package is newly published or has 0 downloads recorded yet.`);
        console.log(`   👉 Execute the Day 3 Starter PR & Community Showcase strategies to kickstart CI/CD download loops!`);
      }
    }

    console.log('\n📦 \x1b[1mDependent Repositories & Packages:\x1b[0m');
    console.log(`   To check dependent repos (Target: ${TARGET_REPOS}+):`);
    console.log(`   👉 GitHub Graph: https://github.com/maintainer/${PACKAGE_NAME}/network/dependents`);
    console.log(`   👉 Libraries.io:  https://libraries.io/npm/${PACKAGE_NAME}`);
    console.log('----------------------------------------------------------------------\n');

  } catch (error) {
    console.error(`❌ Error fetching metrics:`, error);
  }
}

runTracker();
