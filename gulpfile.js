#!/usr/bin/env node
const gulp = require('gulp'),
  fs = require('graceful-fs'),
  jeditor = require('gulp-json-editor'),
  replace = require('gulp-replace'),
  through = require('through2'),
  request = require('request'),
  source = require('vinyl-source-stream'),
  streamify = require('gulp-streamify'),
  sh = require('shelljs'),
  yargs = require('yargs/yargs'),
  {hideBin} = require('yargs/helpers'),
  dotenv = require('dotenv'),
  packageNPM = require('./package.json');
let version = {
  version: packageNPM.version,
  code: versionToBundleCode(packageNPM.version),
};
dotenv.config();
const CONSOLE_COLORS = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m',
};
const APIGEOHUB = 'https://geohub.webmapp.it';
const APIOSM2CAI = 'https://osm2cai.cai.it';
const APICARG = 'https://carg.geosciences-ir.it/';
let API = APIGEOHUB;
const wrongInstanceVersion = [
  'fumaiolosentieri',
  'pec',
  'cammini',
  'camminiditalia',
  'camminiditaliadev',
  'ucvs',
  'gavorrano',
  'sicai',
];

function debug(message) {
  console.debug(CONSOLE_COLORS.Dim + '[DEBUG]   ' + CONSOLE_COLORS.Reset + ' ' + message);
}

function info(message) {
  console.info(CONSOLE_COLORS.FgCyan + '[INFO]    ' + CONSOLE_COLORS.Reset + ' ' + message);
}

function title(message) {
  console.info(CONSOLE_COLORS.FgMagenta + '[TITLE]   ' + CONSOLE_COLORS.Reset + ' ' + message);
}

function success(message) {
  console.info(
    CONSOLE_COLORS.FgGreen +
      CONSOLE_COLORS.Bright +
      '[SUCCESS] ' +
      ' ' +
      message +
      CONSOLE_COLORS.Reset,
  );
}

function log(message) {
  console.log(CONSOLE_COLORS.FgWhite + '[LOG]     ' + CONSOLE_COLORS.Reset + ' ' + message);
}

function warn(message) {
  console.warn(CONSOLE_COLORS.FgYellow + '[WARN]    ' + CONSOLE_COLORS.Reset + ' ' + message);
}

function error(message) {
  console.error(CONSOLE_COLORS.FgRed + '[ERROR]   ' + CONSOLE_COLORS.Reset + ' ' + message);
}

const argv = yargs(hideBin(process.argv))
  // .command(
  //   "set -g [id]",
  //   "set the development instance to use the specified configuration from the Geohub"
  // )
  .command('build', 'update the app code and apply the configuration')
  .command('build-android', 'update the android platform')
  .command('build-android-apk-debug', 'update the android platform and create a debug apk')
  .command(
    'deploy-android-apk-debug',
    'update the android platform, create a debug apk and deploy it to a running emulator/connected device',
  )
  .command(
    'build-android-apk',
    'update the android platform and create a signed release apk in the builds folder',
  )
  .command(
    'deploy-android-apk',
    'update the android platform, create a signed release apk in the builds folder and deploy it to a running emulator/connected device',
  )
  .command(
    'build-android-bundle',
    'update the android platform and create a signed release bundle for the store release',
  )
  .command('build-ios', 'update the ios platform')
  .command('upload-ios', 'update the ios platform and upload a build to the App Store Connect')
  .command(
    'release',
    'create a signed release bundle and upload the ios build to the App Store Connect',
  )
  .options({
    verbose: {
      demandOption: false,
      optional: true,
      default: false,
      describe: 'Show a more detailed output',
      type: 'boolean',
    },
    i: {
      alias: 'instance',
      demandOption: true,
      default: '',
      describe: 'Set the instance to work with',
      type: 'string',
    },
    g: {
      alias: 'geohubInstanceId',
      demandOption: true,
      default: '',
      describe: 'Set the geohub instance id to work with',
      type: 'string',
    },
    a: {
      alias: 'alias',
      demandOption: true,
      default: '',
      describe: 'Set the alias of the android key',
      type: 'string',
    },
    b: {
      alias: 'bundle',
      demandOption: true,
      default: '1',
      describe: 'Set the bundle version for the ios build',
      type: 'boolean',
    },
    s: {
      alias: 'shardName',
      demandOption: true,
      default: 'geohub',
      describe: 'Set the shard name to work with',
      type: 'string',
    },
    force: {
      demandOption: false,
      default: false,
      describe:
        'Force the update of the instance reinstalling npm, plugins and the capacitor project',
      type: 'string',
    },
  }).argv;

const instancesDir = 'instances/',
  verbose = argv.verbose ? true : false,
  outputRedirect = verbose ? '' : ' > /dev/null';

function copy(src, dest, options, force) {
  return new Promise((resolve, reject) => {
    if (verbose) debug('Running copy(' + src + ', ' + dest + ', ' + options + ', ' + force + ')');

    var toSkip = [];
    toSkip.push(src + '/**');
    toSkip.push('!' + src + '/node_modules');
    toSkip.push('!' + src + '/node_modules/**');
    toSkip.push('!' + src + '/platforms');
    toSkip.push('!' + src + '/platforms/**');
    toSkip.push('!' + src + '/www');
    toSkip.push('!' + src + '/www/**');
    toSkip.push('!' + src + '/plugins');
    toSkip.push('!' + src + '/plugins/**');

    for (let i = 0; i < options.length; i++) {
      toSkip.push(options[i]);
    }

    if (verbose) debug('Starting copy from ' + src + ' to ' + dest);

    gulp
      .src(toSkip)
      .pipe(gulp.dest(dest))
      .on('end', () => {
        if (force) {
          if (verbose) debug('Installing npm');
          sh.exec('npm install' + outputRedirect, {
            cwd: dest,
          });
        }
        if (verbose) debug('Copy completed from ' + src + ' to ' + dest);
        resolve();
      })
      .on('error', error => {
        if (verbose) debug('Error copying ' + src + ' to ' + dest);
        reject(error);
      })
      .on('data', () => {}); // Needed to make the stream continue correctly
  });
}

function getUrlFile(file, src, dest) {
  // console.log(file, src, dest);
  return new Promise((resolve, reject) => {
    if (verbose) debug('Downloading ' + src + ' to ' + dest + file);
    request({
      url: src,
      headers: {
        'User-Agent': 'request',
      },
    })
      .pipe(source(file))
      .pipe(gulp.dest(dest))
      .on('end', resolve)
      .on('error', reject);
  });
}

function abort(err) {
  error(err);
  error('------------------------- Aborting -------------------------');
}

function updateCapacitorConfigJson(instanceName, id, name) {
  if (verbose) {
    debug('updateCapacitorConfigJson');
    debug(instanceName, id, name);
  }
  return new Promise((resolve, reject) => {
    var dir = '';

    if (instanceName) dir = instancesDir + instanceName;
    else {
      reject('Instance name required. See gulp help');
      return;
    }

    var config = dir + '/capacitor.config.json';

    gulp
      .src(config)
      .pipe(replace(/\"appId\": *\"it.webmapp.webmapp\"/i, '"appId": "' + id + '"'))
      .pipe(replace(/\"appName\": *\"Webmapp\"/i, '"appName": "' + name + '"'))
      .pipe(gulp.dest(dir))
      .on('end', resolve)
      .on('error', reject);
  });
}

function updateIndex(instanceName, name) {
  return new Promise((resolve, reject) => {
    var dir = '';

    if (instanceName) {
      dir = instancesDir + instanceName + '/src';
    } else {
      reject('Instance name required. See gulp help');
      return;
    }

    var index = dir + '/index.html',
      edit = '<name>' + name + '</name>';

    gulp
      .src(index)
      .pipe(replace(/<title>([a-zA-Z0-9:;\.\s\(\)\-\,]*)<\/title>/i, edit))
      .pipe(gulp.dest(dir))
      .on('end', resolve)
      .on('error', reject);
  });
}

function create(instanceName, force) {
  return new Promise((resolve, reject) => {
    if (verbose) debug('Starting `create(' + instanceName + ')`');
    if (!instanceName) {
      reject('Instance name required. See gulp help');
      return;
    }

    if (!fs.existsSync(instancesDir + instanceName)) {
      if (verbose) debug('Creating `' + instancesDir + instanceName + '` folder');
      sh.exec('mkdir ' + instancesDir + instanceName);
    }
    var skip = [];

    if (fs.existsSync(instancesDir + instanceName + '/resources'))
      skip = ['!core/resources', '!core/resources/**'];

    copy('core', instancesDir + instanceName, skip, force).then(
      function () {
        if (verbose) debug('Copy completed');
        gulp
          .src(instancesDir + instanceName + '/package.json') // Seleziona il package.json dell'istanza
          .pipe(
            jeditor(function (json) {
              json.version = packageNPM.version; // Imposta la nuova versione
              return json; // Ritorna l'oggetto json modificato
            }),
          )
          .pipe(gulp.dest(instancesDir + instanceName)); // Salva il file modificato
        resolve();
      },
      function (err) {
        if (verbose) debug('Error copying core');
        reject(err);
      },
    );
  });
}

function update(instanceName, geohubInstanceId, shardName) {
  return new Promise((resolve, reject) => {
    if (!instanceName) {
      reject('Instance name required. See gulp help');
      return;
    }

    if (!geohubInstanceId) {
      reject('Instance name required. See gulp help');
      return;
    }

    let envJson;
    try {
      envJson = getJsonEnvironment();
    } catch (error) {
      reject("Errore nella lettura dell'environment: " + error.message);
      return;
    }

    envJson.appId = geohubInstanceId;
    envJson.shardName = shardName;

    var dir = instancesDir + instanceName,
      url = '';

    if (argv.url) url = argv.url;
    else {
      const shard = envJson.shards?.[shardName] ?? null;
      if (!shard) {
        reject(`Error: shard "${shardName}" not found in environment`);
        return;
      }
      url = shard?.origin + '/api/app/webmapp/' + geohubInstanceId;
      if (verbose) debug('Using default url: ' + url);
    }

    if (fs.existsSync(dir)) {
      var config = url + '/config.json',
        resources = url + '/resources/';

      if (verbose) debug('Using ' + config + ' configuration file');
      request({
        url: config,
        headers: {
          'User-Agent': 'request',
        },
      })
        .pipe(source(config))
        .pipe(
          streamify(
            jeditor(configJson => {
              var promises = [];

              if (verbose) debug('Config file downloaded');

              // Verifica se configJson è una stringa e in tal caso esegue il parsing
              if (typeof configJson === 'string') {
                try {
                  if (verbose) debug('configJson è una stringa, tentativo di parsing...');
                  configJson = JSON.parse(configJson);
                  if (verbose)
                    debug('configJson convertito con successo da stringa a oggetto JSON');
                } catch (e) {
                  const errorMsg = 'Errore nel parsing di configJson come stringa: ' + e;
                  if (verbose) debug(errorMsg);
                  reject(errorMsg);
                  return;
                }
              }

              // Verifica che configJson sia un oggetto e contenga APP
              if (!configJson || typeof configJson !== 'object') {
                const errorMsg =
                  'configJson non è un oggetto valido: ' + JSON.stringify(configJson);
                if (verbose) debug(errorMsg);
                reject(errorMsg);
                return;
              }

              if (!configJson.APP) {
                const errorMsg =
                  'Proprietà APP mancante in configJson: ' + JSON.stringify(configJson);
                if (verbose) debug(errorMsg);
                reject(errorMsg);
                return;
              }

              if (!configJson.APP.sku) {
                reject('Missing app id at ' + config);
                return;
              }

              if (!configJson.APP.name) {
                reject('Missing app name at ' + config);
                return;
              }

              promises = [
                getUrlFile('config.json', config, dir + '/'),
                getUrlFile('icon.png', resources + 'icon.png', dir + '/resources/'),
                getUrlFile('icon-only.png', resources + 'icon.png', dir + '/resources/'),
                getUrlFile('icon-foreground.png', resources + 'icon.png', dir + '/resources/'),
                getUrlFile('icon-background.png', resources + 'icon.png', dir + '/resources/'),
                getUrlFile('icon.png', resources + 'icon.png', dir + '/src/assets/icon/'),
                getUrlFile(
                  'homepage-logo.svg',
                  resources + 'logo_homepage.svg',
                  dir + '/src/assets/images/',
                ),
                new Promise((resolve, reject) => {
                  getUrlFile(
                    'notification_icon.png',
                    resources + 'icon_notify.png',
                    dir + '/resources/',
                  ).then(
                    () => {
                      resolve();
                    },
                    () => {
                      getUrlFile('icon.png', resources + 'icon.png', dir + '/resources/').then(
                        () => {
                          resolve();
                        },
                        () => {
                          reject();
                        },
                      );
                    },
                  );
                }),
                getUrlFile('splash.png', resources + 'splash.png', dir + '/resources/'),
                getUrlFile('splash-dark.png', resources + 'splash.png', dir + '/resources/'),
                updateCapacitorConfigJson(instanceName, configJson.APP.sku, configJson.APP.name),
                updateIndex(instanceName, configJson.APP.name),
              ];

              Promise.all(promises).then(() => {
                resolve({
                  id: configJson.APP.sku,
                  name: configJson.APP.name,
                });
              }, reject);
            }),
          ),
        )
        .on('error', function (err) {
          clearInstance();
          reject(err + '\nCheck if the instance exists in the server');
        })
        .on('data', () => {});
    } else {
      reject('Missing instance. See gulp help for more');
    }
    console.log(config);

    const env = `export const environment = ${JSON.stringify(envJson)};`;
    fs.writeFileSync(instancesDir + instanceName + '/src/environments/environment.ts', env);
  });
}

function clearInstance(instanceName) {
  if (instanceName) {
    var dir = instancesDir + instanceName;

    sh.exec('rm -rf ' + dir);
  }
}

function abort(err) {
  error(err);
  error('------------------------- Aborting -------------------------');
}

function checkBuildsFolder() {
  if (!fs.existsSync('builds/')) {
    if (verbose) debug('Creating builds folder...');
    sh.exec('mkdir builds');
  }
}

function updateResources(instanceName, platform) {
  if (platform === 'ios' || platform === 'android') {
    info('Generating splash screen and icon for platform ' + platform);

    if (platform === 'android') {
      sh.exec(
        'cordova-res ' +
          platform +
          ' --skip-config --copy --icon-source resources/notification_icon.png' +
          (platform === 'android'
            ? ' --icon-foreground-source resources/notification_icon.png --icon-background-source resources/notification_icon.png'
            : '') +
          outputRedirect,
        {
          cwd: instancesDir + instanceName,
        },
      );

      var sizes = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
      for (let size of sizes) {
        // sh.exec(
        //   "cp android/app/src/main/res/mipmap-" +
        //     size +
        //     "/ic_launcher.png android/app/src/main/res/drawable-port-" +
        //     size +
        //     "/ic_launcher.png" +
        //     outputRedirect,
        //   {
        //     cwd: instancesDir + instanceName,
        //   }
        // );
        sh.exec(
          'mv android/app/src/main/res/mipmap-' +
            size +
            '/ic_launcher.png android/app/src/main/res/mipmap-' +
            size +
            '/notification_icon.png' +
            outputRedirect,
          {
            cwd: instancesDir + instanceName,
          },
        );
        sh.exec(
          'cp android/app/src/main/res/mipmap-' +
            size +
            '/notification_icon.png android/app/src/main/res/drawable-port-' +
            size +
            '/notification_icon.png' +
            outputRedirect,
          {
            cwd: instancesDir + instanceName,
          },
        );
      }
    }

    sh.exec(
      'cordova-res ' +
        platform +
        ' --skip-config --copy' +
        (platform === 'android'
          ? ' --icon-foreground-source resources/icon.png --icon-background-source resources/icon.png'
          : '') +
        outputRedirect,
      {
        cwd: instancesDir + instanceName,
      },
    );

    info('Splash screen and icon generation completed');
  } else warning('No platform specified for resource regeneration, skipping');
}

function initCapacitor(instanceName, id, name) {
  info('Initializing capacitor project');
  sh.exec('npx cap init ' + name + ' ' + id + outputRedirect, {
    cwd: instancesDir + instanceName,
  });
  info('Capacitor project initialized');
}

function runIonicBuild(instanceName) {
  if (verbose) debug('Running ionic build');
  sh.exec('ionic build' + outputRedirect, {
    cwd: instancesDir + instanceName,
  });
  if (verbose) debug('Ionic build completed');
}

function addAndroidPlatform(instanceName, force) {
  if (force) {
    if (verbose) debug('Forcing android platform installation');
    sh.exec('rm -rf android' + outputRedirect, {
      cwd: instancesDir + instanceName,
    });
  }
  if (!fs.existsSync(instancesDir + instanceName + '/www')) runIonicBuild(instanceName);
  if (!fs.existsSync(instancesDir + instanceName + '/android')) {
    if (verbose) debug('Adding android platform');
    sh.exec('npx cap add android' + outputRedirect, {
      cwd: instancesDir + instanceName,
    });
    if (verbose) debug('Android platform added successfully');
  }
}

function updateAndroidPlatform(instanceName, appId, appName) {
  return new Promise((resolve, reject) => {
    runIonicBuild(instanceName);
    addAndroidPlatform(instanceName, argv.force);

    if (verbose) debug('Updating android platform');
    sh.exec('npx cap copy android' + outputRedirect, {
      cwd: instancesDir + instanceName,
    });

    var split = version.version.split('.'),
      versionCode = version.code;

    var promises = [];

    // build.gradle
    promises.push(
      new Promise((resolve, reject) => {
        gulp
          .src(instancesDir + instanceName + '/android/app/build.gradle')
          .pipe(replace(/versionCode ([0-9]*)/g, 'versionCode ' + versionCode))
          .pipe(replace(/versionName "([0-9\.]*)"/g, 'versionName "' + version.version + '"'))
          .pipe(gulp.dest(instancesDir + instanceName + '/android/app/'))
          .on('end', () => {
            if (verbose) debug('build.gradle updated successfully');
            resolve();
          })
          .on('error', reject);
      }),
    );

    // variables.gradle
    promises.push(
      new Promise((resolve, reject) => {
        gulp
          .src(instancesDir + instanceName + '/android/variables.gradle')
          .pipe(replace(/minSdkVersion = ([0-9]{2})/g, 'minSdkVersion = 28'))
          .pipe(replace(/compileSdkVersion = ([0-9]{2})/g, 'compileSdkVersion = 34'))
          .pipe(replace(/targetSdkVersion = ([0-9]{2})/g, 'targetSdkVersion = 34'))
          .pipe(gulp.dest(instancesDir + instanceName + '/android/'))
          .on('end', () => {
            if (verbose) debug('variables.gradle updated successfully');
            resolve();
          })
          .on('error', reject);
      }),
    );

    // AndroidManifest.xml
    promises.push(
      new Promise((resolve, reject) => {
        gulp
          .src(instancesDir + instanceName + '/android/app/src/main/AndroidManifest.xml')
          .pipe(
            replace(/<manifest ([^>]*) package="([^"]*)"/g, '<manifest $1 package="' + appId + '"'),
          )
          .pipe(
            replace(
              /android:name="[^"]*.MainActivity"/g,
              'android:name="' + appId + '.MainActivity"',
            ),
          )
          .pipe(addPermissionsIfNotPresent())
          .pipe(gulp.dest(instancesDir + instanceName + '/android/app/src/main/'))
          .on('end', () => {
            if (verbose) debug('AndroidManifest.xml updated successfully');
            resolve();
          })
          .on('error', reject);
      }),
    );

    // strings.xml
    promises.push(
      new Promise((resolve, reject) => {
        const stringXml = `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">${appName}</string>
    <string name="title_activity_main">${appName}</string>
    <string name="package_name">${appId}</string>
    <string name="custom_url_scheme">${appId}</string>
</resources>
        `;
        try {
          fs.writeFileSync(
            instancesDir + instanceName + '/android/app/src/main/res/values/strings.xml',
            stringXml,
          );
          if (verbose) debug('strings.xml updated successfully');
          resolve();
        } catch (err) {
          reject(err);
        }
      }),
    );

    Promise.all(promises).then(
      res => {
        if (verbose) debug('Android platform updated successfully');
        resolve();
      },
      err => {
        reject(err);
      },
    );
  });
}
function updateGradleVersion(instanceName, newVersion) {
  return new Promise((resolve, reject) => {
    const buildGradlePath = `${instancesDir}${instanceName}/android/build.gradle`;

    if (fs.existsSync(buildGradlePath)) {
      gulp
        .src(buildGradlePath)
        .pipe(
          replace(
            /classpath\s+['"]com\.android\.tools\.build:gradle:[^'"]+['"]/g,
            `classpath 'com.android.tools.build:gradle:${newVersion}'`,
          ),
        )
        .pipe(gulp.dest(`${instancesDir}${instanceName}/android/`))
        .on('end', () => {
          if (verbose) debug(`build.gradle updated successfully to version ${newVersion}`);
          resolve();
        })
        .on('error', err => {
          reject(`Error updating build.gradle: ${err}`);
        });
    } else {
      reject(`build.gradle not found for instance ${instanceName}`);
    }
  });
}

function build(instanceName, geohubInstanceId, shardName = 'geohub') {
  // setAPI(instanceName);
  return new Promise((resolve, reject) => {
    if (!instanceName) {
      reject('Instance name requred. See gulp help');
      return;
    }
    if (wrongInstanceVersion.includes(instanceName)) {
      info('Wrong version change it');
      version.code = +`1${version.code}`;
      version.version = `1${version.version}`;
    }
    if (!geohubInstanceId) {
      reject('Geohub instance id requred. See gulp help');
      return;
    }

    if (verbose) debug('Starting `build(' + instanceName + ',' + geohubInstanceId + ')`');
    if (verbose) debug('`build()`- running `create()`');
    var force = false;
    if (!!argv.force || !fs.existsSync(instancesDir + instanceName)) force = true;
    create(instanceName, force).then(
      function () {
        if (verbose) debug('`build()` - create completed');
        if (verbose) debug('`build()`- running `update()`');
        update(instanceName, geohubInstanceId, shardName).then(
          result => {
            if (verbose) debug('`build()` - update completed');
            if (verbose) debug('`build()` completed');

            resolve(result);
          },
          err => {
            if (verbose) debug('Error running `update()` in `build()`');
            reject(err);
          },
        );
      },
      err => {
        if (verbose) debug('Error running `create()` in `build()`');
        reject(err);
      },
    );
  });
}

function buildAndroid(instanceName, geohubInstanceId, shardName) {
  //setAPI(instanceName);
  return new Promise((resolve, reject) => {
    build(instanceName, geohubInstanceId, shardName).then(
      result => {
        if (!result.id) {
          abort('The app id could not be found');
          return;
        }
        if (!result.name) {
          abort('The app name could not be found');
          return;
        }
        initCapacitor(instanceName, result.id, result.name);
        updateAndroidPlatform(instanceName, result.id, result.name).then(
          () => {
            updateResources(instanceName, 'android');
            updateGradleVersion(instanceName, '8.1.1')
              .then(() => {
                resolve();
              })
              .catch(err => {
                abort(err);
                done();
              });
          },
          err => {
            reject(err);
          },
        );
      },
      err => {
        error(err);
        reject(err);
      },
    );
  });
}

function setAPI(instanceName) {
  if (instanceName === 'carg') {
    API = APICARG;
  }
}

function buildAndroidApk(instanceName, geohubInstanceId, type) {
  return new Promise((resolve, reject) => {
    if (type !== 'Debug' && type !== 'Release') {
      error('Cannot build ' + type + ' apk');
      reject('Cannot build ' + type + ' apk');
    }

    buildAndroid(instanceName, geohubInstanceId).then(
      () => {
        //setAPI(instanceName);
        if (verbose) debug('Assembling the ' + type + ' apk');
        var gradlecom = './gradlew tasks app:assemble';
        if (process.platform === 'win32') gradlecom = 'gradlew tasks app:assemble';
        sh.exec(gradlecom + type + outputRedirect, {
          cwd: instancesDir + instanceName + '/android',
        });
        if (verbose)
          debug(
            "on windows if BUILD FAILED add ANDROID_HOME variable in 'Environment Variables' as C:\\Users\\USER\\AppData\\Local\\Android\\Sdk",
          );
        debug(
          type +
            ' apk built in ' +
            instancesDir +
            instanceName +
            '/android/app/build/outputs/apk/' +
            type.toLowerCase() +
            '/app-' +
            type.toLowerCase() +
            '-unsigned.apk',
        );
        resolve();
      },
      err => {
        reject(err);
      },
    );
  });
}

function signAndroidApk(instanceName, alias) {
  info('Signing release apk...');
  if (
    fs.existsSync(
      'builds/' + instanceName + '/android/' + instanceName + '_' + version.version + '.apk',
    )
  ) {
    if (verbose) debug('Removing old existing incompatible builds');
    sh.exec(
      'rm builds/' +
        instanceName +
        '/android/' +
        instanceName +
        '_' +
        version.version +
        '.apk' +
        outputRedirect,
    );
  }
  if (verbose) debug('Moving release apk to builds directory');
  sh.exec(
    'cp ' +
      instancesDir +
      instanceName +
      '/android/app/build/outputs/apk/release/app-release-unsigned.apk builds/tmp/app-release-unsigned.apk',
  );
  if (verbose) debug('Checking instance in builds directory');
  if (!fs.existsSync('builds/' + instanceName)) sh.exec('mkdir builds/' + instanceName);
  if (!fs.existsSync('builds/' + instanceName + '/android'))
    sh.exec('mkdir builds/' + instanceName + '/android');
  if (verbose) debug('Signing the release apk');
  const password = process.env['PASS'] || '';
  sh.exec(
    'apksigner sign --in builds/tmp/app-release-unsigned.apk --out builds/' +
      instanceName +
      '/android/' +
      instanceName +
      '_' +
      version.version +
      '.apk --ks builds/keys/' +
      alias +
      '.keystore --ks-key-alias ' +
      alias +
      ' --ks-pass pass:' +
      password +
      ' --v4-signing-enabled false' +
      (verbose ? ' --verbose' : '') +
      outputRedirect,
  );
  info('OK');

  return 'builds/' + instanceName + '/android/' + instanceName + '_' + version.version + '.apk';
}

function checkKeystore(alias) {
  if (!fs.existsSync('builds/keys')) {
    abort('Missing keys folder. Please add it in the builds/ directory');
    return false;
  } else if (!fs.existsSync('builds/keys/' + alias + '.keystore')) {
    abort('Missing key in builds/keys directory. Please add it and try again');
    return false;
  }
  return true;
}

function buildSignedApk(instanceName, geohubInstanceId) {
  return new Promise((resolve, reject) => {
    var alias = argv.alias ? argv.alias : instanceName;

    if (!checkKeystore(alias)) return;

    if (verbose)
      debug(
        'Deploying the android debug apk for instance ' + instanceName + ' to an available device',
      );
    buildAndroidApk(instanceName, geohubInstanceId, 'Release').then(
      () => {
        checkBuildsFolder();

        if (fs.existsSync('builds/tmp')) sh.exec('rm -r builds/tmp');
        sh.exec('mkdir builds/tmp');

        var relativePath = signAndroidApk(instanceName, alias);

        if (verbose) debug('Cleaning temp files');
        sh.exec('rm -rf builds/tmp');

        resolve(relativePath);
      },
      err => {
        if (verbose) debug('Cleaning temp files');
        sh.exec('rm -rf builds/tmp');
        reject(err);
      },
    );
  });
}

function buildAndroidBundle(instanceName, geohubInstanceId, type) {
  return new Promise((resolve, reject) => {
    if (type !== 'Debug' && type !== 'Release') {
      error('Cannot build ' + type + ' app bundle');
      reject('Cannot build ' + type + ' app bundle');
    }

    buildAndroid(instanceName, geohubInstanceId).then(
      () => {
        if (verbose) debug('Assembling the debug apk');
        var gradlecom = './gradlew tasks app:bundle';
        if (process.platform === 'win32') gradlecom = 'gradlew tasks app:bundle';
        sh.exec(gradlecom + type + outputRedirect, {
          cwd: instancesDir + instanceName + '/android',
        });
        if (verbose)
          debug(
            "on windows if BUILD FAILED add ANDROID_HOME variable in 'Environment Variables' as C:\\Users\\USER\\AppData\\Local\\Android\\Sdk",
          );
        debug(
          type +
            ' android app bundle built in ' +
            instancesDir +
            instanceName +
            '/android/app/build/outputs/bundle/' +
            type.toLowerCase() +
            '/app-' +
            type.toLowerCase() +
            '.aab',
        );
        resolve();
      },
      err => {
        reject(err);
      },
    );
  });
}

function signAndroidBundle(instanceName, alias) {
  info('Signing release bundle...');
  if (
    fs.existsSync(
      'builds/' + instanceName + '/android/' + instanceName + '_' + version.version + '.aab',
    )
  ) {
    if (verbose) debug('Removing old existing incompatible builds');
    sh.exec(
      'rm builds/' +
        instanceName +
        '/android/' +
        instanceName +
        '_' +
        version.version +
        '.aab' +
        outputRedirect,
    );
  }
  if (verbose) debug('Moving release bundle to builds directory');
  sh.exec(
    'cp ' +
      instancesDir +
      instanceName +
      '/android/app/build/outputs/bundle/release/app-release.aab builds/tmp/app-release.aab',
  );
  if (verbose) debug('Checking instance in builds directory');
  if (!fs.existsSync('builds/' + instanceName)) sh.exec('mkdir builds/' + instanceName);
  if (!fs.existsSync('builds/' + instanceName + '/android'))
    sh.exec('mkdir builds/' + instanceName + '/android');
  if (verbose) debug('Signing the release bundle');
  sh.exec(
    'jarsigner -sigalg SHA1withRSA -digestalg SHA1 --keystore builds/keys/' +
      alias +
      '.keystore builds/tmp/app-release.aab ' +
      alias +
      ' -storepass T1tup4awmA!' +
      outputRedirect,
  );
  if (verbose) debug('Completing the bundle sign');
  sh.exec(
    'zipalign -v 4 builds/tmp/app-release.aab builds/' +
      instanceName +
      '/android/' +
      instanceName +
      '_' +
      version.version +
      '.aab' +
      outputRedirect,
  );
  info('OK');

  return 'builds/' + instanceName + '/android/' + instanceName + '_' + version.version + '.aab';
}

function buildSignedBundle(instanceName, geohubInstanceId) {
  return new Promise((resolve, reject) => {
    var alias = argv.alias ? argv.alias : instanceName;

    if (!checkKeystore(alias)) return;

    buildAndroidBundle(instanceName, geohubInstanceId, 'Release').then(
      () => {
        checkBuildsFolder();

        if (fs.existsSync('builds/tmp')) sh.exec('rm -r builds/tmp');
        sh.exec('mkdir builds/tmp');

        var relativePath = signAndroidBundle(instanceName, alias);

        if (verbose) debug('Cleaning temp files');
        sh.exec('rm -rf builds/tmp');

        resolve(relativePath);
      },
      err => {
        if (verbose) debug('Cleaning temp files');
        sh.exec('rm -rf builds/tmp');
        reject(err);
      },
    );
  });
}

function addIosPlatform(instanceName, force) {
  if (force) {
    if (verbose) debug('Forcing ios platform installation');
    sh.exec('rm -rf ios' + outputRedirect, {
      cwd: instancesDir + instanceName,
    });
  }
  if (!fs.existsSync(instancesDir + instanceName + '/www')) runIonicBuild(instanceName);
  if (!fs.existsSync(instancesDir + instanceName + '/ios')) {
    if (verbose) debug('Adding ios platform');
    sh.exec('npx cap add ios' + outputRedirect, {
      cwd: instancesDir + instanceName,
    });
    if (verbose) debug('Ios platform added successfully');
  }
}

function updateIosPlatform(instanceName, appId, appName) {
  return new Promise((resolve, reject) => {
    runIonicBuild(instanceName);
    addIosPlatform(instanceName, argv.force);

    if (verbose) debug('Updating ios platform');
    sh.exec('npx cap copy ios' + outputRedirect, {
      cwd: instancesDir + instanceName,
    });

    var promises = [],
      plistKeysConcatValue = '';
    const plistKeys = {
      NSCameraUsageDescription:
        'The app require access to your camera to let you take pictures from the app',
      NSLocationAlwaysUsageDescription:
        'The app require access to your location even when the screen is off to let you record a new path in the most precise way possible',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'The app require access to your location even when the screen is off to let you record a new path in the most precise way possible',
      NSLocationWhenInUseUsageDescription:
        'Our app uses your location to provide you with accurate navigation directions and personalized suggestions based on your current location when the app is open. This helps us enhance your experience by offering content and services relevant to your location',
      NSMicrophoneUsageDescription:
        'The app require access to your microphone to use the camera properly',
      NSMotionUsageDescription:
        'The app require access to your motions sensors to show your position and orientation in the map.',
      NSPhotoLibraryAddUsageDescription:
        'The app require the ability to add new pictures to your photo library to let you save pictures you take from the app itself',
      NSPhotoLibraryUsageDescription:
        'The app require access to your photo library to let you select some pictures directly from your library to use when submitting a new picture',
    };

    // Info.plist
    promises.push(
      new Promise((resolve, reject) => {
        var replacer = gulp
          .src(instancesDir + instanceName + '/ios/App/App/Info.plist')
          .pipe(
            replace(
              /<key>CFBundleDisplayName<\/key>([^<]*)<string>[^<]*<\/string>/g,
              '<key>CFBundleDisplayName</key>$1<string>' + appName + '</string>',
            ),
          )
          .pipe(
            replace(
              /<key>CFBundleShortVersionString<\/key>([^<]*)<string>[^<]*<\/string>/g,
              '<key>CFBundleShortVersionString</key>$1<string>' + version.version + '</string>',
            ),
          )
          .pipe(
            replace(
              new RegExp('<key>CFBundleTypeRole</key>[^<]*' + '<string>[^<]*</string>[^<]*', 'g'),
              '',
            ),
          )
          .pipe(
            replace(
              /<key>CFBundleURLTypes<\/key>[^<]*<array>[^<]*<dict>/g,
              `<key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleTypeRole</key>
      <string>Editor</string>
    `,
            ),
          )
          .pipe(
            replace(
              /<key>UIBackgroundModes<\/key>[^<]*<array>[^<]*<string>location<\/string>[^<]*<\/array>[^<]*/g,
              '',
            ),
          );

        for (let key in plistKeys) {
          replacer.pipe(
            replace(
              new RegExp('<key>' + key + '</key>([^<]*)<string>[^<]*</string>[^<]*', 'g'),
              '',
            ),
          );
          plistKeysConcatValue +=
            `
<key>` +
            key +
            `</key>
<string>` +
            plistKeys[key] +
            '</string>';
        }

        replacer
          .pipe(
            replace(
              /<key>CFBundleVersion<\/key>([^<]*)<string>[^<]*<\/string>/g,
              '<key>CFBundleVersion</key>$1<string>' +
                argv.bundle +
                '</string>' +
                plistKeysConcatValue +
                `
  <key>UIBackgroundModes</key>
  <array>
    <string>location</string>
  </array>`,
            ),
          )
          .pipe(gulp.dest(instancesDir + instanceName + '/ios/App/App/'))
          .on('end', () => {
            if (verbose) debug('Info.plist updated successfully');
            resolve();
          })
          .on('error', reject);
      }),
    );

    Promise.all(promises).then(
      res => {
        if (verbose) debug('Ios platform updated successfully');
        resolve();
      },
      err => {
        reject(err);
      },
    );
  });
}

function buildIos(instanceName, geohubInstanceId, shardName) {
  return new Promise((resolve, reject) => {
    //setAPI(instanceName);
    build(instanceName, geohubInstanceId, shardName).then(
      result => {
        if (!result.id) {
          abort('The app id could not be found');
          return;
        }
        if (!result.name) {
          abort('The app name could not be found');
          return;
        }
        initCapacitor(instanceName, result.id, result.name);
        updateIosPlatform(instanceName, result.id, result.name).then(
          () => {
            updateResources(instanceName, 'ios');
            resolve(result);
          },
          err => {
            reject(err);
          },
        );
      },
      err => {
        error(err);
        reject(err);
      },
    );
  });
}

function createExportOptionsPlist(instanceName, appId, provisioningProfile) {
  return new Promise((resolve, reject) => {
    if (!instanceName) {
      reject('Instance name required. See gulp help');
      return;
    }

    gulp
      .src('core/exportOptions.plist')
      .pipe(replace('{{WM_APP_ID}}', appId))
      .pipe(replace('{{WM_PROVISIONING_PROFILE}}', provisioningProfile))
      .pipe(gulp.dest('builds/' + instanceName + '/ios/tmp/'))
      .on('end', () => {
        if (verbose) debug('exportOptions.plist updated');
        resolve();
      })
      .on('error', reject)
      .on('data', () => {});
  });
}

function fixPodfile(instanceName) {
  if (fs.existsSync('instances/' + instanceName + '/ios/App/Podfile')) {
    if (verbose) debug('Adding fix code to podfile');
    var podfile = fs.readFileSync('instances/' + instanceName + '/ios/App/Podfile', 'utf8');
    var check = `post_install do |installer| 
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['EXPANDED_CODE_SIGN_IDENTITY'] = ""
      config.build_settings['CODE_SIGNING_REQUIRED'] = "NO"
      config.build_settings['CODE_SIGNING_ALLOWED'] = "NO"
    end
  end
end
`;
    if (podfile.indexOf('post_install do |installer|') === -1) podfile = check + '\n' + podfile;
    fs.writeFileSync('instances/' + instanceName + '/ios/App/Podfile', podfile);
    if (verbose) debug('Podfile now has the code');
    if (verbose) debug('Rerunning pod install');
    sh.exec('pod install' + outputRedirect, {
      cwd: 'instances/' + instanceName + '/ios/App',
    });
    if (verbose) debug('Pod reinstalled');
  }
}

function buildAndUploadIos(instanceName, appName, appId, useSpecificProvisioningProfile) {
  return new Promise((resolve, reject) => {
    var provisioningProfile = useSpecificProvisioningProfile
      ? appId.split('.').pop() + '_distribution'
      : 'webmapp_distribution';

    if (verbose) debug('Cleaning workspace');
    sh.exec(
      'xcodebuild -workspace "App.xcworkspace" -scheme App -sdk iphoneos -configuration Release clean' +
        outputRedirect,
      {
        cwd: 'instances/' + instanceName + '/ios/App',
      },
    );
    if (verbose) debug('Workspace cleaned');
    if (verbose) debug('Editing podfile to prevent archive errors');
    fixPodfile(instanceName);
    if (verbose) debug('Podfile edited succesfully');
    if (verbose) debug('Creating workspace archive');
    sh.exec(
      'xcodebuild -workspace "App.xcworkspace" -scheme App -sdk iphoneos -configuration Release archive -archivePath "../../../../builds/' +
        instanceName +
        '/ios/' +
        appName +
        '_' +
        version.version +
        '.xcarchive" CODE_SIGN_STYLE="Manual" DEVELOPMENT_TEAM="BSTW6XXE23" PROVISIONING_PROFILE_SPECIFIER="' +
        provisioningProfile +
        '" CODE_SIGN_IDENTITY="Apple Distribution: WEBMAPP SRL (BSTW6XXE23)"' +
        outputRedirect,
      {
        cwd: 'instances/' + instanceName + '/ios/App',
      },
    );
    if (verbose) debug('Archive created');
    if (verbose) debug('Exporting the .ipa');
    createExportOptionsPlist(instanceName, appId, provisioningProfile).then(
      () => {
        sh.exec(
          'xcodebuild -exportArchive -archivePath "./' +
            appName +
            '_' +
            version.version +
            '.xcarchive" -exportOptionsPlist "./tmp/exportOptions.plist" -exportPath "./tmp/" -allowProvisioningUpdates',
          {
            cwd: 'builds/' + instanceName + '/ios/',
          },
        );
        if (verbose) debug('.ipa exported');
        if (verbose) debug('Uploading exported .ipa');
        sh.exec(
          'xcrun altool --upload-app --type ios --file "./App.ipa" --apiKey PT5L38QV2W --apiIssuer "69a6de8e-f769-47e3-e053-5b8c7c11a4d1"' +
            (verbose ? ' --verbose' : ''),
          {
            cwd: 'builds/' + instanceName + '/ios/tmp/',
          },
        );
        info('Upload completed');
        resolve();
      },
      err => {
        reject(err);
      },
    );
  });
}

function uploadIos(instanceName, geohubInstanceId) {
  return new Promise((resolve, reject) => {
    buildIos(instanceName, geohubInstanceId).then(
      result => {
        buildAndUploadIos(instanceName, result.name, result.id, false).then(
          () => {
            resolve();
          },
          err => {
            reject();
          },
        );
      },
      err => {
        error(err);
        reject(err);
      },
    );
  });
}

/**
 * Update the configuration in the core for development purposes
 */
gulp.task('set', function (done) {
  abort('Command currently not supported');
  done();
  return;

  var config,
    instanceName = argv.instance,
    geohubInstanceId = argv.geohubInstanceId;

  if (instanceName) {
    if (instanceName.substring(0, 4) === 'http') config = instanceName;
    else if (geohubInstanceId) {
      config = API + '/api/app/webmapp/' + geohubInstanceId;
      console.log(config);
      if (verbose) debug('Using default url: ' + config);
    } else {
      abort('Missing geohub instance id. See gulp help');
      done();
      return;
    }
  } else {
    abort('Missing config. See gulp help');
    done();
    return;
  }

  let configName = '/config.json';

  if (config.split('.').pop() === 'json') configName = '';

  getUrlFile('config.json', config + configName, 'core/').then(
    function () {
      done();
    },
    function (err) {
      abort(err);
      done();
    },
  );
});

/**
 * Update the core and the configuration for the specified instance
 */
gulp.task('build', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '',
    shardName = argv.shardName ?? 'geohub';

  if (verbose) debug('Running build function for ' + instanceName);
  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }

  build(instanceName, geohubInstanceId, shardName).then(
    () => {
      done();
    },
    err => {
      abort(err);
      done();
    },
  );
});

/**
 * Build the android platform for the given instance
 */
gulp.task('build-android', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '',
    shardName = argv.shardName ? argv.shardName : 'geohub';

  if (verbose) debug('Building android platform for instance ' + instanceName);
  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }

  buildAndroid(instanceName, geohubInstanceId, shardName).then(
    () => {
      done();
    },
    err => {
      done();
    },
  );
});

/**
 * Build an android apk to use for debugging purposes
 */
gulp.task('build-android-apk-debug', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '';

  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }
  if (verbose) debug('Building the android debug apk for instance ' + instanceName);
  buildAndroidApk(instanceName, geohubInstanceId, 'Debug').then(
    () => {
      done();
    },
    err => {
      abort(err);
      done();
    },
  );
});

/**
 * Build and deploy an android apk to use for debugging purposes in a device/simulator
 */
gulp.task('deploy-android-apk-debug', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '';

  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }
  if (verbose)
    debug(
      'Deploying the android debug apk for instance ' + instanceName + ' to an available device',
    );
  buildAndroidApk(instanceName, geohubInstanceId, 'Debug').then(
    () => {
      if (verbose) debug('Deploying the apk to the device/simulator');
      sh.exec('adb install app/build/outputs/apk/debug/app-debug.apk', {
        cwd: instancesDir + instanceName + '/android',
      });
      if (verbose) debug('deploy completed');
      done();
    },
    err => {
      abort(err);
      done();
    },
  );
});

/**
 * Build the android apk to use when testing a prerelease version
 */
gulp.task('build-android-apk', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '';

  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }
  if (verbose) debug('Building the android release apk for instance ' + instanceName);
  buildSignedApk(instanceName, geohubInstanceId).then(
    () => {
      done();
    },
    err => {
      abort(err);
      done();
    },
  );
});

/**
 * Build and deploy the android apk to use when testing a prerelease version
 */
gulp.task('deploy-android-apk', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '';

  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }
  if (verbose)
    debug(
      'Deploying the android release apk for instance ' +
        instanceName +
        ' to an available device/simulator',
    );
  buildSignedApk(instanceName, geohubInstanceId).then(
    relativePath => {
      if (verbose) debug('Deploying the apk to the device/simulator');
      sh.exec('adb install ' + relativePath);
      if (verbose) debug('Deploy completed');
      done();
    },
    err => {
      abort(err);
      done();
    },
  );
});

/**
 * Build the android apk to use when testing a prerelease version
 */
gulp.task('build-android-bundle', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '';
  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }

  if (verbose) debug('Building the android release bundle for instance ' + instanceName);
  buildSignedBundle(instanceName, geohubInstanceId).then(
    () => {
      done();
    },
    err => {
      abort(err);
      done();
    },
  );
});

/**
 * Build the ios platform for the given instance
 */
gulp.task('build-ios', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '',
    shardName = argv.shardName ? argv.shardName : 'geohub';
  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }

  if (verbose) debug('Building iOS platform for instance ' + instanceName);
  buildIos(instanceName, geohubInstanceId, shardName).then(
    () => {
      done();
    },
    err => {
      abort(err);
      done();
    },
  );
});

/**
 * Build the ios platform for the given instance
 */
gulp.task('upload-ios', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '';

  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }

  if (verbose) debug('Building and uploading the iOS version for instance ' + instanceName);
  uploadIos(instanceName, geohubInstanceId).then(
    () => {
      done();
    },
    err => {
      abort(err);
      done();
    },
  );
});

/**
 * Perform all the needed operation to release the ios and android version of the specified app
 */
gulp.task('release', function (done) {
  var instanceName = argv.instance ? argv.instance : '',
    geohubInstanceId = argv.geohubInstanceId ? argv.geohubInstanceId : '';
  if (!instanceName) {
    abort('Instance name requred. See gulp help');
    done();
    return;
  }
  if (!geohubInstanceId) {
    abort('Geohub instance id requred. See gulp help');
    done();
    return;
  }

  title('Building and uploading the iOS version for instance ' + instanceName);
  uploadIos(instanceName, geohubInstanceId).then(
    () => {
      success(instanceName + ' ios version uploaded successfully');
      title('Building the android release app bundle for instance ' + instanceName);
      buildSignedBundle(instanceName, geohubInstanceId).then(
        () => {
          success(instanceName + ' android version built successfully');
          done();
        },
        err => {
          abort(err);
          done();
        },
      );
    },
    err => {
      abort(err);
      done();
    },
  );
});

function versionToBundleCode(versionString) {
  // Rimuovi i punti dalla stringa di versione e converte il risultato in un numero
  const parts = versionString.split('.');
  if (parts.length !== 3) {
    throw new Error('La stringa non ha il formato corretto.');
  }
  const major = parts[0].padStart(2, '0');
  const minor = parts[1].padStart(2, '0');
  const patch = parts[2].padStart(2, '0');
  return parseInt(major + minor + patch, 10);
}

function addPermissionsIfNotPresent() {
  const permissions = [
    'android.permission.READ_MEDIA_IMAGES',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
  ];

  return through.obj(function (file, encoding, callback) {
    let content = file.contents.toString();
    const permissionsToAdd = permissions
      .filter(permission => !content.includes(permission))
      .map(permission => `<uses-permission android:name="${permission}"/>`)
      .join('\n    ');
    if (permissionsToAdd) {
      // Aggiunge i permessi prima del tag di chiusura </manifest>
      content = content.replace(/<\/manifest>/, `    ${permissionsToAdd}\n</manifest>`);
    }

    file.contents = Buffer.from(content, encoding);
    this.push(file);
    callback();
  });
}

function getJsonEnvironment() {
  const envPath = 'core/src/environments/environment.ts';
  if (!fs.existsSync(envPath)) {
    throw new Error(`File ${envPath} non trovato.`);
  }

  // Leggiamo le shards e redirects dal file wm-types
  const wmTypesPath = 'core/src/app/shared/wm-types/src/environment.ts';
  if (!fs.existsSync(wmTypesPath)) {
    throw new Error(`File ${wmTypesPath} non trovato.`);
  }

  const wmTypesContent = fs.readFileSync(wmTypesPath, 'utf8');

  // Estraiamo le shards
  const shardsMatch = wmTypesContent.match(/export const shards: Shards = ({[\s\S]*?});/);
  if (!shardsMatch || !shardsMatch[1]) {
    throw new Error("Impossibile trovare l'oggetto shards nel file wm-types");
  }

  // Estraiamo i redirects
  const redirectsMatch = wmTypesContent.match(/export const redirects: Redirects = ({[\s\S]*?});/);
  if (!redirectsMatch || !redirectsMatch[1]) {
    throw new Error("Impossibile trovare l'oggetto redirects nel file wm-types");
  }

  const fileEnv = fs.readFileSync(envPath, 'utf8');
  const envMatch = fileEnv.match(/export const environment: Environment = ({[\s\S]*?});/);
  if (!envMatch || !envMatch[1]) {
    throw new Error("Impossibile trovare l'oggetto environment nel file");
  }

  if (verbose) {
    debug('Shards estratte: ' + shardsMatch[1].substring(0, 100) + '...');
    debug('Redirects estratti: ' + redirectsMatch[1].substring(0, 100) + '...');
    debug('Environment estratto: ' + envMatch[1]);
  }

  // Costruiamo l'oggetto environment sostituendo i riferimenti con i valori effettivi
  let envString = envMatch[1];
  envString = envString.replace(/\bshards,/g, 'shards: ' + shardsMatch[1] + ',');
  envString = envString.replace(/\bredirects,/g, 'redirects: ' + redirectsMatch[1] + ',');

  if (verbose) {
    debug("Environment finale prima dell'eval: " + envString);
  }

  const environment = eval('(' + envString + ')');

  if (verbose) {
    debug('Environment creato:');
    console.log(JSON.stringify(environment, null, 2));
  }

  return environment;
}
