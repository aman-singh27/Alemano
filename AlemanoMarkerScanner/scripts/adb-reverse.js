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

const projectRoot = path.resolve(__dirname, '..');
const sdkDir = readAndroidSdkDir(projectRoot);

if (!sdkDir) {
  console.error(
    'Could not determine the Android SDK directory from android/local.properties.',
  );
  process.exit(1);
}

const adbPath = path.join(sdkDir, 'platform-tools', 'adb.exe');
const result = spawnSync(adbPath, ['reverse', 'tcp:8081', 'tcp:8081'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
