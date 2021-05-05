#!/usr/bin/env node

const gulp = require("gulp"),
  fs = require("graceful-fs"),
  symlink = require("gulp-symlink"),
  jeditor = require("gulp-json-editor"),
  replace = require("gulp-replace"),
  request = require("request"),
  source = require("vinyl-source-stream"),
  streamify = require("gulp-streamify"),
  sh = require("shelljs"),
  yargs = require("yargs/yargs"),
  { hideBin } = require("yargs/helpers"),
  version = require("./core/version.json");

const CONSOLE_COLORS = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};

function debug(message) {
  console.debug(
    CONSOLE_COLORS.Dim + "[DEBUG]   " + CONSOLE_COLORS.Reset + " " + message
  );
}

function info(message) {
  console.info(
    CONSOLE_COLORS.FgCyan + "[INFO]    " + CONSOLE_COLORS.Reset + " " + message
  );
}

function title(message) {
  console.info(
    CONSOLE_COLORS.FgMagenta +
      "[INFO]    " +
      CONSOLE_COLORS.Reset +
      " " +
      message
  );
}

function success(message) {
  console.info(
    CONSOLE_COLORS.FgGreen +
      CONSOLE_COLORS.Bright +
      "[SUCCESS] " +
      " " +
      message +
      CONSOLE_COLORS.Reset
  );
}

function log(message) {
  console.log(
    CONSOLE_COLORS.FgWhite + "[LOG]     " + CONSOLE_COLORS.Reset + " " + message
  );
}

function warn(message) {
  console.warn(
    CONSOLE_COLORS.FgYellow +
      "[WARN]    " +
      CONSOLE_COLORS.Reset +
      " " +
      message
  );
}

function error(message) {
  console.error(
    CONSOLE_COLORS.FgRed + "[ERROR]   " + CONSOLE_COLORS.Reset + " " + message
  );
}

const argv = yargs(hideBin(process.argv)).options({
  verbose: {
    demandOption: false,
    default: false,
    describe: "Show a verbose output",
    type: "boolean",
  },
  i: {
    alias: "instance",
    demandOption: true,
    default: "",
    describe: "Set the instance to work with",
    type: "string",
  },
}).argv;

const instancesDir = "instances/",
  verbose = argv.verbose ? true : false,
  outputRedirect = verbose ? "" : " > /dev/null";

function node_modules_link(dest) {
  return new Promise((resolve, reject) => {
    if (verbose) debug("Running node_modules_link(" + dest + ")");

    return gulp
      .src("core/node_modules")
      .pipe(
        symlink(dest + "/node_modules", {
          force: true,
        })
      )
      .on("end", () => {
        if (verbose) debug("node_modules link created");
        resolve();
      })
      .on("error", (err) => {
        if (verbose) debug(err);
        reject();
      })
      .on("data", () => {}); // Needed to make the stream continue correctly
  });
}

function copy(src, dest, options) {
  return new Promise((resolve, reject) => {
    if (verbose)
      debug("Running copy(" + src + ", " + dest + ", " + options + ")");

    node_modules_link(dest).then(
      () => {
        if (verbose) debug("node_modules_link done");

        var toSkip = [];
        toSkip.push(src + "/**");
        toSkip.push("!" + src + "/node_modules");
        toSkip.push("!" + src + "/node_modules/**");
        toSkip.push("!" + src + "/platforms");
        toSkip.push("!" + src + "/platforms/**");
        toSkip.push("!" + src + "/www");
        toSkip.push("!" + src + "/www/**");
        toSkip.push("!" + src + "/plugins");
        toSkip.push("!" + src + "/plugins/**");

        for (let i = 0; i < options.length; i++) {
          toSkip.push(options[i]);
        }

        if (verbose) debug("Starting copy from " + src + " to " + dest);

        gulp
          .src(toSkip)
          .pipe(gulp.dest(dest))
          .on("end", () => {
            if (verbose) debug("Copy completed from " + src + " to " + dest);
            resolve();
          })
          .on("error", (error) => {
            if (verbose) debug("Error copying " + src + " to " + dest);
            reject(error);
          })
          .on("data", () => {}); // Needed to make the stream continue correctly
      },
      (err) => {
        if (verbose) debug("Error in node_modules_link");
        reject(err);
      }
    );
  });
}

function getUrlFile(file, src, dest) {
  return new Promise((resolve, reject) => {
    if (verbose) debug("Downloading " + src + file + " to " + dest + file);
    request({
      url: src,
      headers: {
        "User-Agent": "request",
      },
    })
      .pipe(source(file))
      .pipe(gulp.dest(dest))
      .on("end", resolve)
      .on("error", reject);
  });
}

function updateConfigXML(instanceName, id, name, host) {
  return new Promise((resolve, reject) => {
    var dir = "";

    if (instanceName) dir = instancesDir + instanceName;
    else {
      reject("Instance name required. See gulp --help");
      return;
    }

    var config = dir + "/config.xml";

    var edit_widget =
        '<widget id="' + id + '" version="' + version.version + '"',
      edit_name = "<name>" + name + "</name>",
      deeplinks_capabilities = host
        ? `<config-file parent="com.apple.developer.associated-domains" target="*-Debug.plist">
            <array>
                <string>applinks:` +
          host +
          `</string>
            </array>
        </config-file>
        <config-file parent="com.apple.developer.associated-domains" target="*-Release.plist">
            <array>
                <string>applinks:` +
          host +
          `</string>
            </array>
        </config-file>`
        : undefined;

    gulp
      .src(config)
      .pipe(
        replace(
          /<widget (id=")([a-zA-Z0-9:;\.\s\(\)\-\,]*)(") (version=")([a-zA-Z0-9:;\.\s\(\)\-\,]*)(")/i,
          edit_widget
        )
      )
      .pipe(replace(/(<name\b[^>]*>)[^<>]*(<\/name>)/i, edit_name))
      .pipe(
        replace(
          /<platform name="ios">/i,
          `<platform name="ios">
      ` + deeplinks_capabilities
        )
      )
      .pipe(gulp.dest(dir))
      .on("end", resolve)
      .on("error", reject);
  });
}

function updateIndex(instanceName, name) {
  return new Promise((resolve, reject) => {
    var dir = "";

    if (instanceName) {
      dir = instancesDir + instanceName + "/src";
    } else {
      reject("Instance name required. See gulp --help");
      return;
    }

    var index = dir + "/index.html",
      edit = "<name>" + name + "</name>";

    gulp
      .src(index)
      .pipe(replace(/<title>([a-zA-Z0-9:;\.\s\(\)\-\,]*)<\/title>/i, edit))
      .pipe(gulp.dest(dir))
      .on("end", resolve)
      .on("error", reject);
  });
}

function create(instanceName) {
  return new Promise((resolve, reject) => {
    if (verbose) debug("Starting `create(" + instanceName + ")`");
    if (!instanceName) {
      reject("Instance name required. See gulp --help");
      return;
    }

    if (!fs.existsSync(instancesDir + instanceName)) {
      if (verbose)
        debug("Creating `" + instancesDir + instanceName + "` folder");
      sh.exec("mkdir " + instancesDir + instanceName);
    }

    var skip = [];

    if (fs.existsSync(instancesDir + instanceName + "/resources"))
      skip = ["!core/resources", "!core/resources/**"];

    copy("core", instancesDir + instanceName, skip).then(
      function () {
        if (verbose) debug("Copy completed");
        resolve();
      },
      function (err) {
        if (verbose) debug("Error copying core");
        reject(err);
      }
    );
  });
}

function update(instanceName, postInstall) {
  return new Promise((resolve, reject) => {
    if (!instanceName) {
      reject("Instance name required. See gulp --help");
      return;
    }

    var dir = instancesDir + instanceName,
      url = "";

    if (argv.url) {
      url = argv.url;
    } else {
      url = "https://k.webmapp.it/" + instanceName + "/";
      if (verbose) debug("Using default url: " + url);
    }

    if (fs.existsSync(dir)) {
      var config = url + "/config.json",
        resources = url + "/resources/";

      if (verbose) debug("Using " + config + " configuration file");
      request({
        url: config,
        headers: {
          "User-Agent": "request",
        },
      })
        .pipe(source(config))
        .pipe(
          streamify(
            jeditor((configJson) => {
              var promises = [];

              if (verbose) debug("Config file downloaded");

              if (!configJson.APP.id) {
                reject("Missing app id at " + config);
                return;
              }
              if (!configJson.APP.name) {
                reject("Missing app name at " + config);
                return;
              }

              var split = configJson.APP.id.split(".");
              split.splice(0, 2);
              var deeplinkName = split.join(".").toLowerCase(),
                host =
                  configJson.SHARE && configJson.SHARE.deeplinksHost
                    ? configJson.SHARE.deeplinksHost
                    : undefined;
              if (postInstall) {
                if (verbose) debug("Performing post install operations");
                if (host) {
                  if (verbose) debug("Installing deeplinks plugin");
                  sh.exec(
                    "ionic cordova plugin add ionic-plugin-deeplinks@1.0.22 --variable URL_SCHEME=" +
                      deeplinkName +
                      " --variable DEEPLINK_SCHEME=https --variable DEEPLINK_HOST=" +
                      host +
                      " --variable ANDROID_PATH_PREFIX=/" +
                      outputRedirect,
                    {
                      cwd: dir,
                    }
                  );
                  if (verbose) debug("Deeplinks plugin installed successfully");
                }

                if (configJson.AUTH) {
                  if (
                    configJson.AUTH.facebook &&
                    configJson.AUTH.facebook.id &&
                    configJson.AUTH.facebook.name
                  ) {
                    if (verbose) debug("Installing facebook plugin");
                    var facebookId = configJson.AUTH.facebook.id,
                      appName = configJson.AUTH.facebook.name;
                    sh.exec(
                      'ionic cordova plugin add cordova-plugin-facebook4 --variable APP_ID="' +
                        facebookId +
                        '" --variable APP_NAME="' +
                        appName +
                        '"' +
                        outputRedirect,
                      {
                        cwd: dir,
                      }
                    );
                    if (verbose)
                      debug("Facebook plugin installed successfully");
                  }
                  if (
                    configJson.AUTH.google &&
                    configJson.AUTH.google.id &&
                    configJson.AUTH.google.name
                  ) {
                    if (verbose) debug("Installing googleplus plugin");
                    var webAppId = configJson.AUTH.google.id,
                      clientId = configJson.AUTH.google.iosId
                        ? configJson.AUTH.google.iosId
                        : configJson.AUTH.google.id,
                      appName = configJson.AUTH.google.name;
                    clientId = clientId.split(".").reverse().join(".");
                    sh.exec(
                      'ionic cordova plugin add cordova-plugin-googleplus --variable REVERSED_CLIENT_ID="' +
                        clientId +
                        '" --variable WEB_APPLICATION_CLIENT_ID="' +
                        webAppId +
                        '"' +
                        outputRedirect,
                      {
                        cwd: dir,
                      }
                    );
                    if (verbose)
                      debug("Googleplus plugin installed successfully");
                  }
                }
              }

              getUrlFile(
                "logo.png",
                resources + "logo.png",
                dir + "/src/assets/images/"
              );

              promises = [
                getUrlFile("config.json", config, dir + "/"),
                getUrlFile(
                  "icon.png",
                  resources + "icon.png",
                  dir + "/resources/"
                ),
                getUrlFile(
                  "favicon.png",
                  resources + "icon.png",
                  dir + "/src/assets/icon/"
                ),
                getUrlFile(
                  "splash.png",
                  resources + "splash.png",
                  dir + "/resources/"
                ),
                updateConfigXML(
                  instanceName,
                  configJson.APP.id,
                  configJson.APP.name,
                  host
                ),
                updateIndex(instanceName, configJson.APP.name),
              ];

              Promise.all(promises).then(resolve, reject);
            })
          )
        )
        .on("error", function (err) {
          clearInstance();
          reject(err + "\nCheck if the instance exists in the server");
        })
        .on("data", () => {});
    } else {
      reject("Missing instance. See gulp --help for more");
    }
  });
}

function clearInstance(instanceName) {
  if (instanceName) {
    var dir = instancesDir + instanceName;

    sh.exec("rm -rf " + dir);
  }
}

function fixInAppBrowser() {
  return new Promise((resolve, reject) => {
    gulp
      .src(
        "core/platforms/browser/www/plugins/cordova-plugin-inappbrowser/www/inappbrowser.js"
      )
      .pipe(
        replace(
          "if (window.parent && !!window.parent.ripple) {",
          "{ // if (window.parent && !!window.parent.ripple) {"
        )
      )
      .pipe(
        replace(
          "module.exports = window.open.bind(window);",
          "// module.exports = window.open.bind(window);"
        )
      )
      .pipe(replace("return;", "// return;"))
      .pipe(
        gulp.dest(
          "core/platforms/browser/www/plugins/cordova-plugin-inappbrowser/www/"
        )
      )
      .on("end", resolve)
      .on("error", reject);
  });
}

function createExportOptionsPlist(instanceName, appId, provisioningProfile) {
  return new Promise((resolve, reject) => {
    if (!instanceName) {
      reject("Instance name required. See gulp --help");
      return;
    }

    gulp
      .src("core/exportOptions.plist")
      .pipe(replace("{{WM_APP_ID}}", appId))
      .pipe(replace("{{WM_PROVISIONING_PROFILE}}", provisioningProfile))
      .pipe(gulp.dest("builds/" + instanceName + "/ios/tmp/"))
      .on("end", () => {
        if (verbose) debug("exportOptions.plist updated");
        resolve();
      })
      .on("error", reject)
      .on("data", () => {});
  });
}

function updateBundleVersion(instanceName, appVersion, bundleVersion, appName) {
  return new Promise((resolve, reject) => {
    gulp
      .src(
        "instances/" +
          instanceName +
          "/platforms/ios/" +
          appName +
          "/" +
          appName +
          "-Info.plist"
      )
      .pipe(
        replace(
          /<key>CFBundleVersion<\/key>[\n\s]+<string>[0-9\.]*<\/string>/gm,
          "<key>CFBundleVersion</key>\n    <string>" +
            appVersion +
            "." +
            bundleVersion +
            "</string>"
        )
      )
      .pipe(
        gulp.dest(
          "instances/" + instanceName + "/platforms/ios/" + appName + "/"
        )
      )
      .on("end", resolve)
      .on("error", reject);
  });
}

function abort(err) {
  error(err);
  error("------------------------- Aborting -------------------------");
}

function build(instanceName) {
  return new Promise((resolve, reject) => {
    if (verbose) debug("Starting `build(" + instanceName + ")`");
    if (verbose) debug("`build()`- running `create()`");
    var postInstall = false;
    if (!!argv.force || !fs.existsSync(instancesDir + instanceName))
      postInstall = true;
    create(instanceName).then(
      function () {
        if (verbose) debug("`build()` - create completed");
        if (verbose) debug("`build()`- running `update()`");
        update(instanceName, postInstall).then(
          function () {
            if (verbose) debug("`build()` - update completed");
            if (verbose) debug("`build()` completed");
            resolve();
          },
          function (err) {
            if (verbose) debug("Error running `update()` in `build()`");
            reject(err);
          }
        );
      },
      function (err) {
        if (verbose) debug("Error running `create()` in `build()`");
        reject(err);
      }
    );
  });
}

function addAndroid(instanceName) {
  if (!fs.existsSync("instances/" + instanceName + "/platforms/android")) {
    info("Adding platform android...");
    sh.exec("ionic cordova platform add android" + outputRedirect, {
      cwd: "instances/" + instanceName,
    });
    /**
     * Make sure the npm installation is still valid. Sometimes plugins installation
     * break the npm installation for to me unknown reasons
     */
    if (verbose)
      debug("Reinstalling npm to fix npm installation breaking plugins");
    sh.exec("npm install" + outputRedirect, {
      cwd: "core/",
    });
    info("OK");
  }
}

function addIos(instanceName) {
  if (!fs.existsSync("instances/" + instanceName + "/platforms/ios")) {
    info("Adding platform ios...");
    sh.exec("ionic cordova platform add ios" + outputRedirect, {
      cwd: "instances/" + instanceName,
    });
    /**
     * Make sure the npm installation is still valid. Sometimes plugins installation
     * break the npm installation for to me unknown reasons
     */
    if (verbose)
      debug("Reinstalling npm to fix npm installation breaking plugins");
    sh.exec("npm install" + outputRedirect, {
      cwd: "core/",
    });
    info("OK");
  }
}

function addBrowser() {
  if (!fs.existsSync("core/platforms/browser")) {
    if (verbose) debug("Adding platform android...");
    sh.exec("ionic cordova platform add browser", {
      cwd: "core/",
    });
    /**
     * Make sure the npm installation is still valid. Sometimes plugins installation
     * break the npm installation for to me unknown reasons
     */
    if (verbose)
      debug("Reinstalling npm to fix npm installation breaking plugins");
    sh.exec("npm install" + outputRedirect, {
      cwd: "core/",
    });
  }
}

function buildAndroid(instanceName) {
  info("Building android...");
  sh.exec("ionic cordova build android --prod --release" + outputRedirect, {
    cwd: "instances/" + instanceName,
  });
  info("OK");
}

function prepareIos(instanceName) {
  if (verbose) debug("Starting `prepareIos()`");
  sh.exec("ionic cordova prepare ios --prod" + outputRedirect, {
    cwd: "instances/" + instanceName,
  });
  if (verbose) debug("`prepareIos()` completed");
}

function fixPodfile(instanceName) {
  if (fs.existsSync("instances/" + instanceName + "/platforms/ios/Podfile")) {
    if (verbose) debug("Fixing podfile");
    if (verbose) debug("Adding fix code to podfile");
    var podfile = fs.readFileSync(
      "instances/" + instanceName + "/platforms/ios/Podfile",
      "utf8"
    );
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
    if (podfile.indexOf("post_install do |installer|") === -1)
      podfile = check + "\n" + podfile;
    fs.writeFileSync(
      "instances/" + instanceName + "/platforms/ios/Podfile",
      podfile
    );
    if (verbose) debug("Podfile now has the code");
    if (verbose) debug("Rerunning pod install");
    sh.exec("pod install" + outputRedirect, {
      cwd: "instances/" + instanceName + "/platforms/ios/",
    });
    if (verbose) debug("Pod reinstalled");
  }
}

function buildIos(
  instanceName,
  appName,
  appId,
  useWorkspace,
  useSpecificProvisioningProfile
) {
  return new Promise((resolve, reject) => {
    var provisioningProfile = useSpecificProvisioningProfile
      ? appId.split(".").pop() + "_distribution"
      : "webmapp_distribution";
    if (useWorkspace) {
      if (verbose) debug("Using workspace");
      if (verbose) debug("Cleaning workspace");
      sh.exec(
        'xcodebuild -workspace "' +
          appName +
          '.xcworkspace" -scheme "' +
          appName +
          '" -sdk iphoneos -configuration Release clean' +
          outputRedirect,
        {
          cwd: "instances/" + instanceName + "/platforms/ios",
        }
      );
      if (verbose) debug("Workspace cleaned");
      if (verbose) debug("Editing podfile to prevent archive errors");
      fixPodfile(instanceName);
      if (verbose) debug("Podfile edited succesfully");
      if (verbose) debug("Creating workspace archive");
      sh.exec(
        'xcodebuild -workspace "' +
          appName +
          '.xcworkspace" -scheme "' +
          appName +
          '" -sdk iphoneos -configuration Release archive -archivePath "../../../../builds/' +
          instanceName +
          "/ios/" +
          appName +
          "_" +
          version.version +
          '.xcarchive" CODE_SIGN_STYLE="Manual" DEVELOPMENT_TEAM="BSTW6XXE23" PROVISIONING_PROFILE_SPECIFIER="' +
          provisioningProfile +
          '" CODE_SIGN_IDENTITY="Apple Distribution: WEBMAPP SRL (BSTW6XXE23)"' +
          outputRedirect,
        {
          cwd: "instances/" + instanceName + "/platforms/ios",
        }
      );
    } else {
      if (verbose) debug("Using project");
      if (verbose) debug("Cleaning project");
      sh.exec(
        'xcodebuild -project "' +
          appName +
          '.xcodeproj" -scheme "' +
          appName +
          '" -sdk iphoneos -configuration Release clean' +
          outputRedirect,
        {
          cwd: "instances/" + instanceName + "/platforms/ios",
        }
      );
      if (verbose) debug("Project cleaned");
      if (verbose) debug("Creating project archive");
      sh.exec(
        'xcodebuild -project "' +
          appName +
          '.xcodeproj" -scheme "' +
          appName +
          '" -sdk iphoneos -configuration Release archive -archivePath "../../../../builds/' +
          instanceName +
          "/ios/" +
          appName +
          "_" +
          version.version +
          '.xcarchive" CODE_SIGN_STYLE="Manual" DEVELOPMENT_TEAM="BSTW6XXE23" PROVISIONING_PROFILE_SPECIFIER="' +
          provisioningProfile +
          '" CODE_SIGN_IDENTITY="Apple Distribution: WEBMAPP SRL (BSTW6XXE23)"' +
          outputRedirect,
        {
          cwd: "instances/" + instanceName + "/platforms/ios",
        }
      );
    }
    if (verbose) debug("Archive created");
    if (verbose) debug("Exporting the .ipa");
    createExportOptionsPlist(instanceName, appId, provisioningProfile).then(
      () => {
        sh.exec(
          'xcodebuild -exportArchive -archivePath "./' +
            appName +
            "_" +
            version.version +
            '.xcarchive" -exportOptionsPlist "./tmp/exportOptions.plist" -exportPath "./tmp/" -allowProvisioningUpdates',
          {
            cwd: "builds/" + instanceName + "/ios/",
          }
        );
        if (verbose) debug(".ipa exported");
        if (verbose) debug("Uploading exported .ipa");
        sh.exec(
          'xcrun altool --upload-app --type ios --file "./' +
            appName +
            '.ipa" --apiKey PT5L38QV2W --apiIssuer "69a6de8e-f769-47e3-e053-5b8c7c11a4d1"' +
            (verbose ? " --verbose" : ""),
          {
            cwd: "builds/" + instanceName + "/ios/tmp/",
          }
        );
        info("Upload completed");
        resolve();
      },
      (err) => {
        reject(err);
      }
    );
  });
}

function signAndroidApk(instanceName, alias) {
  info("Signing release apk...");
  if (
    fs.existsSync(
      "builds/" +
        instanceName +
        "/android/" +
        instanceName +
        "_" +
        version.version +
        ".apk"
    )
  ) {
    if (verbose) debug("Removing old existing incompatible builds");
    sh.exec(
      "rm builds/" +
        instanceName +
        "/android/" +
        instanceName +
        "_" +
        version.version +
        ".apk" +
        outputRedirect
    );
  }
  if (verbose) debug("Moving release apk to builds directory");
  sh.exec(
    "cp instances/" +
      instanceName +
      "/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk builds/tmp/app-release-unsigned.apk"
  );
  if (verbose) debug("Signing the release apk");
  sh.exec(
    "jarsigner -sigalg SHA1withRSA -digestalg SHA1 --keystore builds/keys/" +
      alias +
      ".keystore builds/tmp/app-release-unsigned.apk " +
      alias +
      " -storepass T1tup4awmA!" +
      outputRedirect
  );
  if (verbose) debug("Checking instance in builds directory");
  if (!fs.existsSync("builds/" + instanceName))
    sh.exec("mkdir builds/" + instanceName);
  if (!fs.existsSync("builds/" + instanceName + "/android"))
    sh.exec("mkdir builds/" + instanceName + "/android");
  if (verbose) debug("Completing the apk sign");
  sh.exec(
    "~/Library/Android/sdk/build-tools/29.0.0/zipalign -v 4 builds/tmp/app-release-unsigned.apk builds/" +
      instanceName +
      "/android/" +
      instanceName +
      "_" +
      version.version +
      ".apk" +
      outputRedirect
  );
  info("OK");
}

function checkBuildsFolder() {
  if (!fs.existsSync("builds/")) {
    if (verbose) debug("Creating builds folder...");
    sh.exec("mkdir builds");
  }
}

function buildAndroidTask(instanceName, alias) {
  return new Promise((resolve, reject) => {
    if (!alias) alias = instanceName;
    checkBuildsFolder();

    if (!fs.existsSync("builds/android_keys"))
      abort("Missing key folder. Please add it in the builds/ directory");
    else if (!fs.existsSync("builds/android_keys/" + alias + ".keystore"))
      abort(
        "Missing key in builds/android_keys directory. Please add it and try again"
      );
    else {
      if (fs.existsSync("builds/tmp")) sh.exec("rm -r builds/tmp");
      sh.exec("mkdir builds/tmp");

      info("Updating instance...");
      build(instanceName).then(
        () => {
          info("OK");

          addAndroid(instanceName);
          buildAndroid(instanceName);
          signAndroidApk(instanceName, alias);

          if (verbose) debug("Cleaning temp files");
          sh.exec("rm -rf builds/tmp");

          resolve();
        },
        (err) => {
          if (verbose) debug("Cleaning temp files");
          sh.exec("rm -rf builds/tmp");
          reject(err);
        }
      );
    }
  });
}

function buildIosTask(instanceName, bundleVersion) {
  return new Promise((resolve, reject) => {
    var clean = () => {
      if (verbose) debug("Cleaning temp folders...");
      if (fs.existsSync("builds/" + instanceName + "/ios/tmp"))
        sh.exec("rm -r builds/" + instanceName + "/ios/tmp");
    };

    info("Building ios...");
    if (verbose) debug("`build()`");
    build(instanceName).then(
      () => {
        if (verbose) debug("`addIos()`");
        addIos(instanceName);
        if (verbose) debug("`prepareIos()`");
        prepareIos(instanceName);

        checkBuildsFolder();
        if (!fs.existsSync("builds/" + instanceName))
          sh.exec("mkdir builds/" + instanceName);
        if (!fs.existsSync("builds/" + instanceName + "/ios"))
          sh.exec("mkdir builds/" + instanceName + "/ios");
        if (!fs.existsSync("builds/" + instanceName + "/ios/tmp"))
          sh.exec("mkdir builds/" + instanceName + "/ios/tmp");
        info("OK");

        info("Retrieving app informations...");
        var config = require("./instances/" + instanceName + "/config.json");
        if (config && config.APP && config.APP.name && config.APP.id) {
          var appName = config.APP.name,
            appId = config.APP.id,
            useSpecificProvisioningProfile =
              config.SHARE && !!config.SHARE.deeplinksHost ? true : false,
            promise,
            useWorkspace = false;

          if (
            config.AUTH &&
            ((config.AUTH.facebook &&
              config.AUTH.facebook.id &&
              config.AUTH.facebook.name) ||
              (config.AUTH.google &&
                config.AUTH.google.id &&
                config.AUTH.google.name))
          )
            useWorkspace = true;

          if (bundleVersion) {
            promise = updateBundleVersion(
              instanceName,
              version.version,
              bundleVersion,
              appName
            );
          } else promise = Promise.resolve();

          promise.then(
            () => {
              info("OK");
              info("Building and uploading ios...");
              buildIos(
                instanceName,
                appName,
                appId,
                useWorkspace,
                useSpecificProvisioningProfile
              ).then(() => {
                clean();
                info("OK");
                resolve();
              });
            },
            (err) => {
              clean();
              reject(err);
            }
          );
        } else {
          clean();
          reject("No app info found. Please check the app configuration");
        }
      },
      (err) => {
        clean();
        reject(err);
      }
    );
  });
}

/**
 * Update the core and the configuration for the specified instance
 */
gulp.task("build", function (done) {
  var instanceName = argv.instance ? argv.instance : "";

  if (verbose) debug("Running build function for " + instanceName);

  build(instanceName).then(
    () => {
      done();
    },
    (err) => {
      abort(err);
      done();
    }
  );
});

/**
 * Update the configuration in the core for development purposes
 */
gulp.task("set", function (done) {
  var config,
    instanceName = argv.instance;

  if (instanceName) {
    if (instanceName.substring(0, 4) === "http") config = instanceName;
    else {
      config = "https://k.webmapp.it/" + instanceName;
      if (verbose) debug("Using default url: " + config);
    }
  } else {
    abort("Missing config. See gulp --help");
    done();
    return;
  }

  let configName = "/config.json";

  if (config.split(".").pop() === "json") configName = "";

  getUrlFile("config.json", config + configName, "core/").then(
    function () {
      done();
    },
    function (err) {
      abort(err);
      done();
    }
  );
});

/**
 * Build the webapp production zip file
 */
gulp.task("build-webapp", function (done) {
  addBrowser();

  info("Cleaning old builds...");
  sh.exec("rm -rf www" + outputRedirect, {
    cwd: "core/platforms/browser",
  });
  sh.exec("rm -rf www" + outputRedirect, {
    cwd: "core/",
  });
  info("OK");
  info("Building browser...");
  sh.exec("ionic cordova build browser --prod --release" + outputRedirect, {
    cwd: "core/",
  });
  info("OK");

  info("Removing inappbrowser problematic code...");
  fixInAppBrowser().then(
    function () {
      info("OK");

      info("Removing old zip...");
      sh.exec("rm builds/core.zip" + outputRedirect);
      info("OK");

      info("Creating zip...");
      sh.exec("cp -r www core" + outputRedirect, {
        cwd: "core/platforms/browser/",
      });
      sh.exec("zip -r core.zip core" + outputRedirect, {
        cwd: "core/platforms/browser/",
      });
      sh.exec(
        "mv core/platforms/browser/core.zip builds/core.zip" + outputRedirect
      );
      info("OK");

      info("Cleaning temp files...");
      sh.exec("rm -rf core log" + outputRedirect, {
        cwd: "core/platforms/browser/",
      });
      info("OK");
      done();
    },
    function (err) {
      abort("\nAn error occurred while fixing inAppBrowser plugin\n" + err);
      done();
    }
  );
});

/**
 * Update the specified instance and build the production android apk in builds/[instance]_[version].apk
 */
gulp.task("build-android", function (done) {
  var instanceName = argv.instance ? argv.instance : undefined,
    alias = argv.keycode ? argv.keycode : instanceName;

  if (!instanceName) {
    abort("Missing instance name. See gulp --help");
    return;
  }

  if (instanceName.indexOf("test") !== -1) alias = "test";

  buildAndroidTask(instanceName, alias).then(
    () => {
      done();
    },
    (err) => {
      error(err);
      done();
    }
  );
});

/**
 * Update the specified instance, build the ios in production mode and upload the build to appstoreconnect
 */
gulp.task("build-ios", function (done) {
  var instanceName = argv.instance ? argv.instance : "";

  if (!instanceName) {
    error("Missing instance name. See gulp --help");
    done();
    return;
  }

  buildIosTask(instanceName, argv.bundleVersion).then(
    () => {
      done();
    },
    (err) => {
      error(err);
      done();
    }
  );
});

/**
 * Build the apk and deploy the ios version for the specified instances
 */
gulp.task("deploy", async function (done) {
  var instanceNames = argv.instance ? argv.instance : "",
    bundleVersion = argv.bundleVersion ? argv.bundleVersion : "";

  if (!instanceNames) {
    error("Missing instance name. See gulp --help");
    done();
    return;
  }

  checkBuildsFolder();

  var instances = instanceNames.split(",");

  for (var i in instances) {
    title("Processing " + instances[i] + "...");
    title("Processing android platform...");
    await buildIosTask(instances[i], bundleVersion);
    title("Android platform done");
    title("Processing Android platform...");
    await buildAndroidTask(instances[i]);
    title("Android platform done");
    success(instances[i] + " done!");
  }

  success(
    "Operation completed sucessfully: " + instances.length + " deploys done"
  );
  done();
});

gulp.task("test", function (done) {
  // <h1>Unit Test Results</h1>;
  title("Running tests...");
  sh.exec("npm run test");
  gulp
    .src("unit_tests/index.html")
    .pipe(
      replace(
        /(<h1>Unit Test Results<\/h1>)/gi,
        '$1<h2><a href="coverage/index.html">Coverage status</a></h2>'
      )
    )
    .pipe(gulp.dest("unit_tests/"))
    .on("end", () => {
      done();
      success("Unit tests completed");
    })
    .on("error", (err) => {
      error(err);
      done();
    });
});
