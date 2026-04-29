const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

function readAndroidSdkDir(projectRoot) {
  const localPropertiesPath = path.join(
    projectRoot,
    'android',
    'local.properties',
  );

  if (!fs.existsSync(localPropertiesPath)) {
    return null;
  }

  const contents = fs.readFileSync(localPropertiesPath, 'utf8');
  const match = contents.match(/^sdk\.dir=(.+)$/m);

  if (!match) {
    return null;
  }

  return match[1].replace(/\\:/g, ':').replace(/\\\\/g, '\\').trim();
}

function prependPath(existingPath, segments) {
  return [...segments, existingPath].filter(Boolean).join(path.delimiter);
}

const projectRoot = path.resolve(__dirname, '..');
const sdkDir = readAndroidSdkDir(projectRoot);
const env = {...process.env};

if (sdkDir) {
  const platformTools = path.join(sdkDir, 'platform-tools');
  const emulator = path.join(sdkDir, 'emulator');
  const pathValue = prependPath(env.PATH || env.Path, [
    platformTools,
    emulator,
  ]);

  env.PATH = pathValue;
  env.Path = pathValue;
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(
  command,
  ['react-native', 'run-android', ...process.argv.slice(2)],
  {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  },
);

process.exit(result.status ?? 1);
