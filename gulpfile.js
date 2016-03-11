var io = require('io-global')
  , config = require('./config')
  , fs = require('fs')
  , gulp = require('gulp')
  , rename = require('gulp-rename')
  //,pinyin = require('pinyin')





, tr = require('transliteration').slugify
  , gulpIf = require('gulp-if')
  //,replace = require('gulp-replace')






, path = require('path')

var pathChange = function (str) {
  //  io.c(io.path(io.path(str).type==='absolute'? str+'/' : io.cwd()+'/'+str).all)

  return io.path(io.path(str).type === 'absolute' ? str + '/' : io.cwd() + '/' + str).all
}

var dir = {}
dir.root = pathChange(config.copyfrom)
dir.index = pathChange(config.index).replace(/\/$/, '')
dir.dist = pathChange(config.copyto)

//html文件名如是中文,替换
var basename = function (basename) {
  var t = basename.split('')
    , tAll = '';
  for (var num in t) {
    //匹配中文 ,由于transliteration 会将非中文的字符,如空格,横杠转成无,所以直接rename较伤
    tAll += /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(t[num]) ? tr(t[num], {
      lowercase: false
      , separator: ''
    }) : t[num]
  }
  return tAll
}



gulp.task('default', function () {
  //拷入common
  gulp.src(dir.root + "common/**/*.*")
    .pipe(gulp.dest(dir.dist + 'common/'))

  //拷入入口链接文件
  var distIndex = dir.dist + require('path').relative(dir.root, dir.index)
  fs.readFile(dir.index, 'utf-8', function (err, data) {
      if (config.pinyin) {
        //中间斜杠也是仅优百通的考虑,不全面
        data = data.replace(/(<a.*?href=".*\/)(.*?)\.html"/ig, function () {
          var t1 = RegExp.$1
            , t3 = '';
          var t2 = RegExp.$2.split('')
          for (var num in t2) {
            //中文才转 ,由于transliteration 会将非中文的字符,如空格,横杠转成无……
            t3 += /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(t2[num]) ? tr(t2[num], {
              lowercase: false
              , separator: ''
            }) : t2[num]
          }

          return t1 + t3 + '.html"'

        })
      }
      fs.writeFile(distIndex, data, function () {})
    })
    //  return

  //异步
  fs.readFile(dir.index, 'utf-8', function (err, data) {
    //  io.c(data)
    //  io.c($('<p>p</p>'))
    var html = data
      //需去掉注释

    var hrefs = html.match(/<a.*?href="(.*?)"/ig)
      //  io.c(hrefs)

    for (var i in hrefs) {

      //            if (i === '0') { //activity\layout1\actpay\actsucceed\actsucceed1 13; 35 APP ;0 首页 包括footer8链接
      //    io.c(i,typeof i,hrefs[i]) //string

      //按第一步遍历,直接生成拷贝
      var t = hrefs[i].match(/<a.*href="(.*)"/)[1]
        , file = dir.root + t
        , root = io.path(t).dir
        //    io.c(file)

      if (io.isExist(file)) {

        //若只一步,这里应该有**/**
        //精确匹配时,x/y.html,而非* ,如果没找到,就抛出,无法用try/catch,但可以用on('error',function(e))来捕获
        gulp.src(file)
          //    .on('error',function(e){
          //      //本来应用t,但(因异步?)会计算成最后一个链接,因此得去error信息中提取
          ////     io.c(e,Object.prototype.toString.call(e),e.toString())//'[Object Error]'
          ////      e.toString().match(/glob: (.*)/)
          //      io.ce('Error: 文件' + dir.index+'中,有链接未找到: '+ e.toString().replace(/Error: File not found with singular glob: (.*)/,'$1') +'"')
          //    })
          .pipe(gulpIf(config.pinyin, rename(function (path) {
            path.basename = basename(path.basename)
          })))
          .pipe(gulp.dest(dir.dist + root))


        //    io.c(t)

        //第二步遍历, 继续读css 为优百通项目专门做的优化
        var two = fs.readFileSync(dir.root + t, 'utf-8')
        var as = two.match(/<link.*?href=".*?"/ig)
          //    io.c(as)
        for (var k in as) {
          //找到res/css common/css 才处理,否则跳过, 免得match()[1] 错
          if (as[k].match(/<link.*href="(.*)res\/css\/.*"/i)) {
            as[k].match(/<link.*href="(.*)res\/css\/.*"/i)
              //        var t1 = RegExp.$1,t2 = RegExp.$2
            pathT = io.path(root + RegExp.$1).all
              //        io.c(io.path(dir.dist+root+t1).all)

            //拷贝res下资源
            gulp.src(dir.root + pathT + "res/**/*.*")
              .pipe(gulp.dest(dir.dist + pathT + 'res/'))
              //拷贝res外一层的html文件
              //        io.c(gulp.src(dir.root+pathT+'*.html'))
            gulp.src(dir.root + pathT + '*.html')
              .pipe(gulpIf(config.pinyin, rename(function (path) {
                path.basename = basename(path.basename)
              })))
              .pipe(gulp.dest(dir.dist + pathT))
          }
        }
      }
      //链接文件不存在
      else {
        io.ce('Error: 文件' + dir.index + '中,有链接未找到: ' + file + '"')

      }
      //            } //i=='0' app设置
    }


  })
})



/*
bug:
* activity\layout1\actpay\actsucceed\actsucceed1 res没有拿到
经查是因为组合页未引入res的缘故  --当时以为是异步的问题,改了同步,或许没必要
* 部分结构不大一样的文件夹,未测试,如member\layout1\PayMethod 似也可归入上个问题

已解决:
* lite\parts\footer\footer8 等大量未引入html,是因无该链接的缘故,但是从模块角度,我们希望有此html

*/
