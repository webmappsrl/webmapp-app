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

function copy(src, dest, options, force) {
  return new Promise((resolve, reject) => {
    if (verbose)
      debug(
        "Running copy(" +
          src +
          ", " +
          dest +
          ", " +
          options +
          ", " +
          force +
          ")"
      );

    var toSkip = [];
    toSkip.push(src + "/**");
    if (!force) {
      toSkip.push("!" + src + "/node_modules");
      toSkip.push("!" + src + "/node_modules/**");
    }
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
        if (force) {
          if (verbose) debug("Installing npm");
          sh.exec("npm install" + outputRedirect, {
            cwd: dest,
          });
        }
        if (verbose) debug("Copy completed from " + src + " to " + dest);
        resolve();
      })
      .on("error", (error) => {
        if (verbose) debug("Error copying " + src + " to " + dest);
        reject(error);
      })
      .on("data", () => {}); // Needed to make the stream continue correctly
  });
}

function getUrlFile(file, src, dest) {
  return new Promise((resolve, reject) => {
    if (verbose) debug("Downloading " + src + " to " + dest + file);
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

function updateCapacitorConfigJson(instanceName, id, name) {
  return new Promise((resolve, reject) => {
    var dir = "";

    if (instanceName) dir = instancesDir + instanceName;
    else {
      reject("Instance name required. See gulp --help");
      return;
    }

    var config = dir + "/capacitor.config.json";

    gulp
      .src(config)
      .pipe(
        replace(/\"appId\": *\"it.webmapp.webmapp\"/i, '"appId": "' + id + '"')
      )
      .pipe(replace(/\"appName\": *\"Webmapp\"/i, '"appName": "' + name + '"'))
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

function create(instanceName, force) {
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

    copy("core", instancesDir + instanceName, skip, force).then(
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

function update(instanceName) {
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

              promises = [
                getUrlFile("config.json", config, dir + "/"),
                getUrlFile(
                  "icon.png",
                  resources + "icon.png",
                  dir + "/resources/"
                ),
                getUrlFile(
                  "icon.png",
                  resources + "icon.png",
                  dir + "/src/assets/icon/"
                ),
                getUrlFile(
                  "splash.png",
                  resources + "splash.png",
                  dir + "/resources/"
                ),
                updateCapacitorConfigJson(
                  instanceName,
                  configJson.APP.id,
                  configJson.APP.name
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

function abort(err) {
  error(err);
  error("------------------------- Aborting -------------------------");
}

function build(instanceName, force) {
  return new Promise((resolve, reject) => {
    if (verbose) debug("Starting `build(" + instanceName + ")`");
    if (verbose) debug("`build()`- running `create()`");
    var force = false;
    if (!!argv.force || !fs.existsSync(instancesDir + instanceName))
      force = true;
    create(instanceName, force).then(
      function () {
        if (verbose) debug("`build()` - create completed");
        if (verbose) debug("`build()`- running `update()`");
        update(instanceName, force).then(
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
