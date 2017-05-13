 //引入gulp
var gulp = require('gulp');

//引入webserver插件
var webserver = require('gulp-webserver'); 

gulp.task('webserver', function(){
gulp.src('./')
    .pipe(webserver({
        port: 8888,//端口
        open: 'http://localhost/index.html',//域名
        liveload: true,//实时刷新代码。不用f5刷新
    }))
});