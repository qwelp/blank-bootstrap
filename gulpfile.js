'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
	jade = require('gulp-jade'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
	plumber = require('gulp-plumber'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
	gulpif = require("gulp-if"),
	spritesmith = require('gulp.spritesmith'),
	merge = require('merge-stream'),
	buffer = require('vinyl-buffer'),
	csso = require('gulp-csso'),
    reload = browserSync.reload;

var path = {
    build: {
        jade: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/images/',
        fonts: 'build/fonts/'
    },
    src: {
		jade: 'src/jade/**/*.jade',
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        jade: 'src/**/*.jade',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('sprite', function () {
	// Generate our spritesheet
	var spriteData = gulp.src('./src/images/sprites/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.css'
	}));

	var imgStream = spriteData.img
		.pipe(buffer())
		.pipe(imagemin())
		.pipe(gulp.dest('./build/images/'));
	var cssStream = spriteData.css
		.pipe(csso())
		.pipe(gulp.dest('./build/css/'));

	return merge(imgStream, cssStream);
});

gulp.task('css_type:build', function () {
	gulp.src('src/css/**/*.css')
		.pipe(gulp.dest('build/css/'))
});

gulp.task('js_type:build', function () {
	gulp.src('src/js/**/*.js')
		.pipe(gulp.dest('build/js/'))
});

gulp.task('jade:build', function() {

	gulp.src(["src/jade/**/*.jade", "!src/jade/**/_*.jade", "!./src/jade/templates/**/*" ])
		.pipe(jade({
			pretty: true
		}))
		.on('error', console.log)
		.pipe(gulp.dest(path.build.jade))
		.pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) 
        .pipe(rigger())
        .pipe(sourcemaps.init()) 
        .pipe(uglify()) 
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

var sassOptions = {
	errLogToConsole: true,
	includePaths: ['src/style/'],
	outputStyle: 'compressed',
	sourceMap: true
};

gulp.task('style:build', function () {
    gulp.src(path.src.style)
		.pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions))
        .pipe(prefixer())
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(["src/images/**/*.*", "!./src/images/sprites/**/*"])
		.pipe(buffer())
		.pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'jade:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'css_type:build',
    'js_type:build'
]);


gulp.task('watch', function(){
    watch([path.watch.jade], function(event, cb) {
        gulp.start('jade:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
	watch([path.watch.fonts], function(event, cb) {
        gulp.start('css_type:build');
    });
	watch([path.watch.fonts], function(event, cb) {
        gulp.start('js_type:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch', 'css_type:build', 'js_type:build']);