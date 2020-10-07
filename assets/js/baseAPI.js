//js中预过滤器方法
$.ajaxPrefilter(function (options){
    //options  就是发ajax的配置项
    //1.设置一个统一的根路径
    options.url = "http://ajax.frontend.itheima.net" + options.url;
})