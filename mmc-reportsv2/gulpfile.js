'use strict';
/*global cp, mkdir*/
require('shelljs/global');

var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var watchify = require('watchify');
var _ = require('lodash');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var postCSS = require('gulp-postcss');
var postSCSS = require('postcss-scss');
var postCSSReporter = require('postcss-reporter');
var styleLint = require('stylelint');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var util = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var argv = require('yargs').argv;
var gulpEnv = require('gulp-env');
var childExec = require('child_process').exec;
var KarmaServer = require('karma').Server;

var env = {
  DIST: 'dist/'
};

var MODES = {
  'PROD': 'prod',
  'DEV': 'dev'
};

var RUNNING_MODE = MODES.DEV;

/**
 * bundler() returns a watchify object. Note the _.memoize, so subsequent calls
 * to bundler() will return the same watchify object.
 */
var bundler = _.memoize(function(watch) {
  // Add custom browserify options here.
  gulpEnv.set({
    AWS_SERVICES: 's3'
  });
  var options = {
    debug: true,
    paths: ['./node_modules', './src/'],
    noParse: [require.resolve('handsontable/dist/handsontable.full')]
  };

  // browserify needs these options for watchify to work.
  _.extend(options, watchify.args);
  var b = browserify('src/main.js', options);
  if (watch) {
    b = watchify(b);
    b.on('log', util.log);
  }

  return b;
});
/**
 * Used by 'version' task to include the version and build number
 * as part of a file.
 *
 * @param filename: The file to write to.
 * @param string: The attribe to write
 * @returns {"stream".Readable}
 */
function stringSrc(filename, string) {
  var src = require('stream').Readable({ objectMode: true });
  src._read = function() {
    this.push(new util.File({
      cwd: "",
      base: "",
      path: filename,
      contents: new Buffer(string)
    }));
    this.push(null);
  };
  return src;
}
/**
 * Allow to handle the Errors depending on the mode the task is been runned,
 * since we could be on PROD mode where the process must exit to stop
 * Jenkins execution.
 */
function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  delete args[0].stream;
  util.log.apply(null, args);
  // ON DEV Mode not stop the process
  if (RUNNING_MODE === MODES.PROD) {
    process.exit(1);
  } else {
    this.emit('end');
  }
}
/**
 * This was taken from
 * https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
 */
function bundle(callback, watch, makeSourcemap) {
  var stream = bundler(watch).bundle()
    .on('error', handleErrors)
    .pipe(source('bundle.js'))
    .pipe(buffer());

  if (makeSourcemap) {
    // Load map from browserify file.
    stream = stream.pipe(sourcemaps.init({ loadMaps: true }));
  }

  if (!watch) {
    stream = stream.pipe(uglify()).on('error', util.log);
  }

  if (makeSourcemap) {
    // Output .map file.
    stream = stream.pipe(sourcemaps.write('./'));
  }

  stream =  stream
    .pipe(gulp.dest(env.DIST))
    .on('end', callback)
    .pipe(browserSync.stream());

  return stream;
}

/**
 * Setup and init Browsersync. It also set running model equal to
 * DEV for sub-task who may depend on it to perform different operations.
 */
function setupAndWatch() {
  //var api = require('./api/api');
  var ghostMode = argv.ghostMode === 'off' ? false : true;

  RUNNING_MODE = MODES.DEV;

  browserSync.init({
    ghostMode: {
      clicks: ghostMode,
      forms: ghostMode,
      scroll: ghostMode
    },
    server: {
      baseDir: env.DIST,
      routes: {
        '/dist': env.DIST
      }
      /*middleware: function(req, res, next) {
        api(req, res, next);
      }*/
    }
  });
  bundler(true).on('update', function() {
    gulp.start('scripts');
    gulp.start('eslint');
  });
  gulp.watch('src/index.html', ['html']);
  gulp.watch('test/**/*.js', ['test']);
  gulp.watch('src/**/*.scss', ['scss', 'scss-lint']);
}
/**
 * Copy HTML resource to 'dist' folder, since it is a single
 * page application, it just include main index.html.
 */
gulp.task('html', function() {
  mkdir('-p', env.DIST);
  cp('-f', 'src/index.html', env.DIST);
  browserSync.reload();
});
/**
 * Minify HTML for better download performance, used on
 * 'prod' task.
 */
gulp.task('minify-html', function() {
  return gulp.src('src/index.html')
    .pipe(minifyHTML())
    .pipe(gulp.dest(env.DIST));
});
/**
 * Copy the required fonts files to 'dist' folder.
 */
gulp.task('fonts', function() {
  mkdir('-p', env.DIST);
  return gulp.src(['node_modules/font-awesome/fonts/fontawesome-webfont.*','node_modules/bootstrap/fonts/glyphicons-halflings-regular.*',
                   'fonts/*.*']).pipe(gulp.dest(env.DIST + '/fonts/'));
});
/**
 * Copy the required images to 'dist' folder.
 */
gulp.task('images', function() {
  mkdir('-p', env.DIST);
  cp('-r', 'src/img', env.DIST);
  // select2 requires those images at the root level,
  // need to review this and modify the correct path
  cp('-r', 'node_modules/select2/select2.png', env.DIST + '/css');
  cp('-r', 'node_modules/select2/select2x2.png', env.DIST + '/css');
  cp('-r', 'node_modules/select2/select2-spinner.gif', env.DIST + '/css');
  cp('-r', 'src/css/bootstrap.min.css', env.DIST + '/css');
    cp('-r', 'src/css/mediamorph.css', env.DIST + '/css');
	cp('-r', 'src/response', env.DIST);
	cp('-r', 'src/labels', env.DIST);
	cp('-r', 'fonts', env.DIST);
});
/**
 * Used for linting SCSS.
 * @see http://stylelint.io/
 */
gulp.task('scss-lint', function() {
  var processors = [
    styleLint(),
    postCSSReporter({
      clearMessages: true
    })
  ];

  return gulp.src(['!./src/**/*_variables.scss', './src/**/*.scss'])
    .pipe(postCSS(processors, {syntax: postSCSS}));
});

// Used for Watch to build CSS.
gulp.task('scss', function() {
  return gulp.src('src/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ precision: 8, includePaths: ['node_modules'] })).on('error', handleErrors)
    .pipe(autoprefixer())
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest(env.DIST + '/css'))
    .pipe(browserSync.stream());
});
/**
 * Used for Prod to build a minified version of CSS.
 */
gulp.task('minify-css', function() {
  return gulp.src('src/main.scss')
    .pipe(sass({ precision: 8, includePaths: ['node_modules'] })).on('error', function() {
      sass.logError.apply(this, arguments);
      process.exit(1);
    })
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest(env.DIST + '/css'))
    .pipe(browserSync.stream());
});
/**
 * Runs eslint rules based on the rules defined by the file .eslintrc.
 * @see http://eslint.org/
 */
gulp.task('eslint', function() {
  return gulp.src(['./src/**/*.js',
                   './test/**/*.js',
                   '!./src/handsontable/**/*.js',
                   '!./**/node_modules/**/*.js',
                   './api/**/*.js'])
    .pipe(plumber()) // Make gulp.watch still work after errors.
    .pipe(eslint())
    .pipe(eslint.format());
});
/**
 * Creates the main bundle.js file with a sourceMap file and
 * activates browsersync, mainly used in development mode.
 */
gulp.task('scripts', function(callback) {
  bundle(callback, true, true);
});
/**
 * Creates just the main bundle.js file, not sourceMap is created.
 */
gulp.task('compile', function(callback) {
  bundle(callback, false, false);
});

gulp.task('build', [
  'html',
  'fonts',
  'images',
  'scss',
  'scripts'
]);

gulp.task('lint', ['eslint']);

gulp.task('docs', function(done) {
  childExec('node ./node_modules/jsdoc/jsdoc.js -r -d ./docs/ ./src/', undefined, done);
});

/**
 * Allows to append a 'version' file with the information about build
 * and package.json#version, it is required when building the application
 * from Jenkins to append to the file the build information.
 */
gulp.task('version', function() {
  var pkg = require('./package.json');
  var build = 'build:' + argv.build;
  var version = 'version:' + pkg.version;
  return stringSrc("version", version + '|' + build)
    .pipe(gulp.dest(env.DIST));
});
/**
 * Exposes a single task to encapsulate the required sub-tasks to build the
 * production version.
 */
gulp.task('prod', function() {
  RUNNING_MODE = MODES.PROD;

  gulp.start('minify-html');
  gulp.start('fonts');
  gulp.start('images');
  gulp.start('minify-css');
  gulp.start('compile');
  gulp.start('eslint');
  gulp.start('scss-lint');
  gulp.start('test');
  gulp.start('version');
});
/**
 * Same as watch, but doesn't run tests and linters.
 */
gulp.task('dev', ['build'], function() {
  setupAndWatch();
});

// this allows you to debug with node-inspector
gulp.task('debug', ['build'], function() {
  setupAndWatch();
});

gulp.task('watch', ['build', 'test', 'scss-lint'], function() {
  setupAndWatch();
});

gulp.task('test', function(done) {
  var path = argv.path;
  var options = {
    configFile: __dirname + '/karma.conf.js'
  };

  if (path) {
    options.files = [
      './test/setup/**/*.js',
      './test/unit' + path
    ];
  } // else use default in config file

  /*var karmaServer = new KarmaServer(options, function(exitCode) {

    if (exitCode !== 0) {
      process.exit(exitCode);
    }

    done();
  });

  karmaServer.on('browser_error', function(browser, error) {
    console.log('A browser error occurred: ', browser, error);
    process.exit(1);
  });

  karmaServer.start();*/

});

gulp.task('default', ['watch']);
