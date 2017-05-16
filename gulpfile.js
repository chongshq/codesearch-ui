//引入webserver插件
var webserver = require('gulp-webserver'); 
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var notify = require('gulp-notify');
var cleancss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var assetRev = require('gulp-asset-rev');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var livereload = require('gulp-livereload');

gulp.task('clean', function(cb) {
     del(['dist'], cb)
 });
gulp.task('minifyCss', function() {
    return gulp.src('css/*')
        // .pipe(assetRev())
        // .pipe(cleancss({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({ message: 'CSS文件压缩完毕' }));
});

gulp.task('server', function(){
    gulp.start('webserver','watch')
});
gulp.task('webserver', function(){
    gulp.src('./')
        .pipe(webserver({
            port: 8888,//端口
            open: 'http://localhost/index.html',//域名
            liveload: true,//实时刷新代码。不用f5刷新
        }))
});

gulp.task('minifyJs', function() {
return gulp.src('js/app/*.js')
    // .pipe(assetRev())
    // .pipe(uglify())
    .pipe(gulp.dest('dist/js/app'))
    .pipe(notify({ message: 'js文件混缩完毕' }));
});
gulp.task('scripts', function() {
return gulp.src('js/lib/*.js')
    // .pipe(assetRev())
    // .pipe(uglify())
    .pipe(gulp.dest('dist/js/lib'))
    .pipe(notify({ message: 'js文件打包完毕' }));
});

gulp.task('minifyHtml',function() {
return gulp.src('**/*.html')
        // .pipe(assetRev())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'HTML文件压缩完毕' }));
});

gulp.task('images', function() {
     return gulp.src('img/**/*')
         .pipe(cache(imagemin({
             optimizationLevel: 3,
             progressive: true,
             interlaced: true
         })))
         .pipe(gulp.dest('dist/img'))
         .pipe(notify({
             message: 'Images task complete'
         }));
 });

 gulp.task('fonts', function() {
     return gulp.src('fonts/**/*')
         .pipe(gulp.dest('dist/fonts'))
         .pipe(notify({
             message: 'fonts task complete'
         }));
 });
 gulp.task('watch', function() {
     // 监听html文件变化
    gulp.watch('partials/*.html', function(){
        gulp.run('minifyHtml');
    });
//监听CSS文件变化
    gulp.watch('css/*.css', function(){
        gulp.run('minifyCss','minifyHtml');
    });
//监听JS文件变化
    gulp.watch('js/app/*.js', function(){
        gulp.run('minifyJs','minifyHtml');
    });

    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', livereload.changed);
 });

gulp.task('default',function(){
    gulp.start('minifyCss', 'minifyJs', 'scripts' ,'minifyHtml','images','fonts');

});