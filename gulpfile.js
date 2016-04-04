var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var main_bower = require('main-bower-files');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var order = require('gulp-order');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sh = require('shelljs');
var annotate = require('gulp-ng-annotate');
var filter = require('gulp-filter');

var paths = {
    sass: ['./app/scss/**/*.scss'],
    js: ['./app/**/*.js'],
    index: ['./app/index.html'],
    templates: ['./app/pages/**/*.html', './app/common/**/*.html']
};

process.env.NODE_ENV = 'developer';

gulp.task('app', function () {
    gulp.src(paths.js)
        .pipe(concat('app.js'))
        .pipe(annotate({
            add: true
        }))
        //.pipe(sourcemaps.init())
        //.pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('./www/js/'));
        gutil.log(gutil.colors.green("App compiled"));
});

gulp.task('lib.js', function () {
    gulp.src(main_bower())
        .pipe(filter('*.js'))
        .pipe(order([
            'ionic*',
            '*'
        ]))
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('./www/js/'));
});

gulp.task('lib.css', function () {
    gulp.src(main_bower())
        .pipe(filter('*.css'))
        .pipe(concat('lib.min.css'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest('./www/css/'));
});

gulp.task('sass', function (done) {

    gulp.src(paths.sass)
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
        gutil.log(gutil.colors.green("Sass compiled"));
});

gulp.task('index', function () {

    gulp.src(paths.index)
        .pipe(gulp.dest('./www/'));
    gutil.log(gutil.colors.green("Index compiled"));
});

gulp.task('templates', function () {

    gulp.src(paths.templates)
        .pipe(rename({
            dirname: ''
        }))
        .pipe(gulp.dest('./www/templates/'));
        gutil.log(gutil.colors.green("Templates compiled"));
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.js, ['app']);
    gulp.watch(paths.index, ['index']);
    gulp.watch(paths.templates, ['templates']);
    gutil.log(gutil.colors.green("Watching..."));
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});

gulp.task('default', ['app', 'lib.js', 'sass', 'index', 'templates']);
gulp.task('dima', ['app', 'lib.js', 'sass', 'index', 'templates', 'watch']);
