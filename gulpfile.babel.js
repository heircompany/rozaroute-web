'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import { output as pagespeed } from 'psi';

import browserify from 'browserify';
import babelify from 'babelify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Optimize images
gulp.task('images', () =>
  gulp
    .src('app/images/**/*')
    .pipe(
      $.cache(
        $.imagemin({
          progressive: true,
          interlaced: true
        })
      )
    )
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({ title: 'images' }))
);

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp
    .src(
      [
        'app/*',
        '!app/*.html',
        'node_modules/apache-server-configs/dist/.htaccess'
      ],
      {
        dot: true
      }
    )
    .pipe(gulp.dest('dist'))
    .pipe($.size({ title: 'copy' }))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return (
    gulp
      .src(['app/styles/**/*.scss', 'app/styles/**/*.css'])
      .pipe($.newer('.tmp/styles'))
      .pipe($.sourcemaps.init())
      .pipe(
        $.sass({
          precision: 10
        }).on('error', $.sass.logError)
      )
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe(gulp.dest('.tmp/styles'))
      // Concatenate and minify styles
      .pipe($.if('*.css', $.cssnano()))
      .pipe($.size({ title: 'styles' }))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest('dist/styles'))
      .pipe(gulp.dest('.tmp/styles'))
  );
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
gulp.task('scripts', () =>
  gulp
    .src([
      // Note: Since we are not using useref in the scripts build pipeline,
      //       you need to explicitly list your scripts here in the right order
      //       to be correctly concatenated
      'app/scripts/**/*.js'
    ])
    .pipe($.newer('.tmp/scripts'))
    .pipe($.sourcemaps.init())
    .pipe(
      $.babel({
        presets: ['env']
      })
    )
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe($.concat('main.min.js'))
    .pipe($.uglify())
    // Output files
    .pipe($.size({ title: 'scripts' }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(gulp.dest('.tmp/scripts'))
);

gulp.task('scripts', () => {
  const b = browserify({
    entries: 'app/scripts/main.js',
    transform: babelify,
    debug: true
  });

  return b
    .bundle()
    .pipe(source('bundle.js'))
    .pipe($.plumber())
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(reload({ stream: true }));
});

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return (
    gulp
      .src('app/**/*.html')
      .pipe(
        $.useref({
          searchPath: '{.tmp,app}',
          noAssets: true
        })
      )
      // Minify any HTML
      .pipe(
        $.if(
          '*.html',
          $.htmlmin({
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true
          })
        )
      )
      // Output files
      .pipe($.if('*.html', $.size({ title: 'html', showFiles: true })))
      .pipe(gulp.dest('dist'))
  );
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], { dot: true }));

// Watch files for changes & reload
gulp.task('serve', ['scripts', 'styles'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'RR',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app'],
    port: 3000
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['scripts', reload]);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'RR',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 3001
  })
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence('styles', ['html', 'scripts', 'images', 'copy'], cb)
);

// Run PageSpeed Insights
gulp.task('pagespeed', cb =>
  // Update the below URL to the public URL of your site
  pagespeed(
    'rozaroute.com',
    {
      strategy: 'mobile'
      // By default we use the PageSpeed Insights free (no API key) tier.
      // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
      // key: 'YOUR_API_KEY'
    },
    cb
  )
);

// Load custom tasks from the `tasks` directory
// Run: `npm install --save-dev require-dir` from the command-line
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
