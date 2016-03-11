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
  //
  //dir.root = io.path(config.copyfrom).type ==='absolute' ? config.copyfrom+'/' : io.cwd()+'/'+config.copyfrom
  //dir.index = io.path(config.index).type ==='absolute' ? config.index+'/' : io.cwd()+'/' + config.index
  //dir.dist = io.path(config.copyto).type ==='absolute' ? config.copyto+'/' : io.cwd()+'/' +config.copyto
  //io.c(dir.root,dir.dist,dir.index)

gulp.task('default', function () {
  //拷入common
  gulp.src(dir.root + "common/**/*.*")
    .pipe(gulp.dest(dir.dist + 'common/'))
    //拷入入口链接文件
  gulp.src(dir.index)
    .pipe(gulp.dest(dir.dist))

  var distIndex = dir.dist + require('path').relative(dir.root, dir.index)
    //  io.c(dir.dist+distIndex)
  if (config.pinyin) {
    setTimeout(function () {
      fs.readFile(distIndex, 'utf-8', function (err, data) {
        //中间斜杠也是仅优百通的考虑,不全面
        data = data.replace(/(<a.*?href=".*\/)(.*?)\.html"/ig, function () {
          return RegExp.$1 + tr(RegExp.$2, {
            lowercase: false
            , separator: ''
          }) + '.html"'
        })
        fs.writeFile(distIndex, data, function () {})
      })
    }, 2000)
  }
  //异步
  fs.readFile(dir.index, 'utf-8', function (err, data) {
    //  io.c(data)
    //  io.c($('<p>p</p>'))
    var html = data
      //需去掉注释

    var hrefs = html.match(/<a.*?href="(.*?)"/ig)
      //  io.c(hrefs)

    for (var i in hrefs) {

      //      if (i === '0') { //activity\layout1\actpay\actsucceed\actsucceed1 13; 35 APP ;0 首页 包括footer8链接
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
            path.basename = tr(path.basename, {
              lowercase: false
              , separator: ''
            })
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
                path.basename = tr(path.basename, {
                    lowercase: false
                    , separator: ''
                  })
                  //          path.basename = pinyin(path.basename,{//该插件有声调功能,但无首字母大写
                  //            style:pinyin.STYLE_NORMAL
                  //          }).join('')
              })))
              .pipe(gulp.dest(dir.dist + pathT))
          }
        }
      }
      //链接文件不存在
      else {
        io.ce('Error: 文件' + dir.index + '中,有链接未找到: ' + file + '"')

      }
      //      } //i=='0' app设置
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
