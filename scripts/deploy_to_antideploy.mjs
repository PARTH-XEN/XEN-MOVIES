import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

async function deploy() {
  const configFile = path.join(os.homedir(), '.antideploy', 'config.json');
  if (!fs.existsSync(configFile)) {
    throw new Error('Antideploy config file not found.');
  }

  const { token } = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const appConfig = JSON.parse(fs.readFileSync('.antideploy.json', 'utf8'));
  const appId = appConfig.applicationId;

  console.log('1. Building frontend production bundle (Vite)...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('2. Creating project.tar.gz archive...');
  if (fs.existsSync('project.tar.gz')) {
    fs.unlinkSync('project.tar.gz');
  }

  // Tar may warn about file changes during archiving - ignore exit code 1 if archive was created
  try {
    execSync('tar -czf project.tar.gz --exclude=node_modules --exclude=.git --exclude=xenmovies.db --exclude=xenmovies.db-wal --exclude=xenmovies.db-shm --exclude=project.tar.gz .', { stdio: 'pipe' });
  } catch (err) {
    // Exit code 1 with "file changed as we read it" is ok if archive exists
    if (!fs.existsSync('project.tar.gz')) {
      throw err;
    }
  }

  const stats = fs.statSync('project.tar.gz');
  console.log(`Archive created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  console.log(`3. Uploading archive to Antideploy (app: ${appId})...`);
  const fileBuffer = fs.readFileSync('project.tar.gz');
  const blob = new Blob([fileBuffer], { type: 'application/gzip' });

  const form = new FormData();
  form.append('archive', blob, 'project.tar.gz');

  const res = await fetch(`https://antideploy.com/api/v1/deploy?applicationId=${appId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form
  });

  const text = await res.text();
  console.log(`Deploy response HTTP ${res.status}:`, text);

  if (!res.ok) {
    throw new Error(`Deployment failed: ${res.status} ${text}`);
  }

  const data = JSON.parse(text);
  const taskId = data.taskId;
  console.log(`Task ID: ${taskId}`);

  console.log('4. Monitoring deployment progress...');
  let finished = false;
  let counter = 0;

  while (!finished && counter < 60) {
    counter++;
    await new Promise(r => setTimeout(r, 6000));
    try {
      const poll = await fetch(`https://antideploy.com/api/v1/deployments/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!poll.ok) {
        console.log(`Poll HTTP error: ${poll.status}`);
        continue;
      }
      const pData = await poll.json();
      console.log(`Status [${counter}]: ${pData.status}, Finished: ${pData.finished}`);
      if (pData.finished) {
        finished = true;
        if (pData.status === 'success' || pData.status === 'done') {
          console.log(' Deployment successful and live at https://xenmovies.antideploy.app !');
        } else {
          console.log('Deployment status:', pData.status, 'Error:', pData.error);
        }
      }
    } catch (e) {
      console.log('Poll err:', e.message);
    }
  }

  if (fs.existsSync('project.tar.gz')) {
    fs.unlinkSync('project.tar.gz');
  }
}

deploy().catch(err => {
  console.error('Deploy error:', err);
  process.exit(1);
});

