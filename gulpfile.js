
var gulp = require('gulp');
var watch = require('gulp-watch');
var spritesmith = require('gulp.spritesmith');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var uncss = require('gulp-uncss');
var csso = require('gulp-csso');
var rigger = require('gulp-rigger');
var concat = require('gulp-concat');
var browserSync = require("browser-sync");
var gutil = require( 'gulp-util' );
var jsx = require('gulp-jsx');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var ftp = require( 'vinyl-ftp' ),
	reload = browserSync.reload;

gulp.task('compilehtml', function () {
	gulp.src('./src/*.html') //Выберем файлы по нужному пути
		  .pipe(rigger()) //Прогоним через rigger
		  .pipe(gulp.dest('./build/')) //Выплюнем их в папку build
		  .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});


/*
gulp.task('jsx', function() {
	gulp.src('./src/jsx/*.js')
		.pipe(plumber())
	    .pipe(jsx({
	      factory: 'React.createElement'
	    }))
	    .pipe(concat('app.js'))
	    .pipe(gulp.dest('./build/js/'))
	    .pipe(reload({stream: true}));
});*/

gulp.task("babel", function(){
    gulp.src('./src/jsx/*.js')
    	.pipe(plumber())
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
	    .pipe(concat('app.js'))
	    .pipe(gulp.dest('./build/js/'))
	    .pipe(reload({stream: true}));
});

//var uglyfly = require('gulp-uglyfly');
gulp.task('compilejs', function () {
  gulp.src('./src/js/*.js') //Выберем файлы по нужному пути
		  //.pipe(rigger()) //Прогоним через rigger
		  /*
		   .pipe(concat('libs.js')) //Выплюнем их в папку build
		   */
		   .pipe(plumber())
		  .pipe(gulp.dest('./build/js/')) //Выплюнем их в папку build
		  .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('createfolders', function () {

  "use strict";

  var fs = require('fs');
  var folders = [
	'src',
	'src/sprites',
	'src/scss',
	'src/less',
	'src/images',
	'src/fonts',
	'src/js',
	'src/parts',
	'build',
	'build/css',
	'build/css/imgs',
	'build/css/fonts',
	'build/js'
  ];
  var files = [
	'src/index.html',
	'src/parts/head.html',
	'src/parts/header.html',
	'src/parts/footer.html',
	'src/js/utils.js',
	'src/scss/main.scss'
  ];

  for (var i in folders) {
	(function () {
	  var path = folders[i];
	  fs.exists(path, function (res) {
		if (res) {
		  console.log(path + ' - found');
		} else {
		  fs.mkdir(path, function () {
			console.log(path + ' - create');
		  });
		}
	  });
	})();
  }

  for (var i in files) {
	(function () {
	  var path = files[i];
	  fs.exists(path, function (res) {
		if (res) {
		  console.log(path + ' - found');
		} else {
		  fs.open(path, 'w', function (e, fd) {
			console.log(path + ' - create');
			fs.close(fd);
		  });
		}
	  });
	})();
  }

});

gulp.task('sprite', function () {
  var spriteData =
		  gulp.src('./src/sprites/*.*') // путь, откуда берем картинки для спрайта
		  .pipe(spritesmith({
			padding: 2,
			imgName: 'sprite.png',
			cssName: 'sprite.scss',
			imgPath: 'imgs/sprite.png'
					//cssTemplate: 'sprite.tpl',
					/*
					 cssVarMap: function (sprite) {
					 var name = sprite.name.split('__');
					 if (name.length == 2) {
					 sprite.name = name[0] + ':' + name[1];
					 }
					 }
					 */
		  }));
  spriteData.img.pipe(gulp.dest('./build/css/imgs/')); // путь, куда сохраняем картинку
  spriteData.css.pipe(gulp.dest('./src/scss/')); // путь, куда сохраняем стили
});

var less = require('gulp-less');
gulp.task('compilecss', function () {
  gulp.src('./src/scss/*.scss') //Выберем наш main.scss
		  //.pipe(sourcemaps.init()) //То же самое что и с js
		  //.pipe(plumber())
		  .pipe(sass()) //Скомпилируем
		  .pipe(autoprefixer()) //Добавим вендорные префиксы
		  //.pipe(csso()) //Сожмем
		  //.pipe(sourcemaps.write())
		  .pipe(gulp.dest('./build/css')) //И в build
		  .pipe(reload({stream: true}));
  gulp.src('./src/css/*.css')
		  .pipe(gulp.dest('./build/css'));

  gulp.src('./src/less/*.less')
		  .pipe(less())
		  .pipe(gulp.dest('./build/css'));

});

gulp.task('updateimg', function () {
  console.log('updateimg');
  gulp.src('./src/images/*.*')
		  .pipe(gulp.dest('./build/css/imgs'));
});

var bowerMain = require('bower-main');
gulp.task('bowersync', function () {
  //return;
  var bowerMainJS = bowerMain('js', 'min.js');
  console.log(bowerMainJS.minified);
  gulp.src(bowerMainJS.minified)
		  .pipe(gulp.dest("./src/js"));
  /*
   var bowerMainCSS = bowerMain('less', 'less');
   console.log(bowerMainCSS.minified);
   gulp.src(bowerMainCSS.minified)
   .pipe(gulp.dest("./src/less"));
   */
});

gulp.task( 'deploy', function () {

	var conn = ftp.create( {
		host:     '',
		user:     '',
		password: '',
		parallel: 1,
		log:      gutil.log
	} );

	var globs = [
		'build/**'
	];

	return gulp.src( globs, { base: 'build', buffer: false } )
		.pipe( conn.newer( '/' ) ) // only upload newer files
		.pipe( conn.dest( '/' ) );

} );


gulp.task('watch', function () {
  watch(['./src/*.html', './src/*/*.html'], function (event, cb) {
	gulp.start('compilehtml');
  });
  watch(['./src/scss/*.scss', './src/css/*.css'], function (event, cb) {
	gulp.start('compilecss');
  });
  watch(['./src/sprites/*.*'], function (event, cb) {
	gulp.start('sprite');
  });
  watch(['./src/images/*.*'], function (event, cb) {
	gulp.start('updateimg');
  });
  watch(['./src/js/*.js'], function (event, cb) {
	gulp.start('compilejs');
  });
  watch(['./src/jsx/*.js'], function (event, cb) {
	gulp.start('babel');
  });
  watch(['./build/*.css'], function (event, cb) {
	reload();
  });
});


var config = {
	server: {
		baseDir: "./build"
	},
	tunnel: false,
	host: 'localhost',
	port: 9000,
	logPrefix: "Gulp"
};
gulp.task('webserver', function () {
	gulp.start('watch');
	browserSync(config);
});

gulp.task('default', ['webserver', 'updateimg', 'watch']);