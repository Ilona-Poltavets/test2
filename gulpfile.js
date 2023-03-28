const gulp = require('gulp');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const newer = require('gulp-newer');
const sass = require('gulp-sass')(require('sass'));
const ts = require('gulp-typescript');
const browserSync = require('browser-sync').create();
const del = require('del');

const paths = {
    html: {
        src: 'src/*.html',
        dest: 'dist/'
    },
    styles: {
        src: ['src/styles/**/*.sass', 'src/styles/**/*.scss', 'src/styles/**/*.less', 'src/styles/**/*.css'],
        dest: 'dist/css/'
    },
    scripts: {
        src: ['src/scripts/**/*.js', 'src/scripts/**/*.ts'],
        dest: 'dist/js/'
    },
    images: {
        src: 'src/images/*',
        dest: 'dist/images/'
    }
}

function clean() {
    return del(['dist/*', '!dist/images','!dist/fonts','!dist/fontawesome']);
}

function html() {
    return gulp.src(paths.html.src)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(size())
        .pipe(gulp.dest(paths.html.dest))
}

function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        // .pipe(less())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(rename({
            basename: 'style',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(size())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        // .pipe(ts({
        //     noImplicitAny: true,
        //     outFile: 'main.min.js'
        // }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('script.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(size())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

function images() {
    return gulp.src(paths.images.src)
        .pipe(newer(paths.images.src))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(paths.images.dest))
}

function watch() {
    browserSync.init({
        server: "./dist/"
    });
    gulp.watch(paths.html.dest).on('change', browserSync.reload)
    gulp.watch(paths.html.src, html);
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.images.src, images);
}

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, images), watch);

exports.build = build;
exports.default = build;