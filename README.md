# item-lite

## 功能
针对优百通项目定制,为其构建精简化的子项目.  
子项目只涉及到优百通项目中的某些部分,这个程序帮助把子项目所需要的文件提取出来,形成一个新的文件夹,特别适用于需要精间的场景,如app.  
需要一个入口文件,它包含了子项目所有需要的页面的链接

## 安装
* 安装[node](https://nodejs.org/)  
下载 4.4.0 版即可,傻瓜式安装  
* npm重定向到淘宝镜像(该步骤可选)  
npm下载可能受限,翻墙也较慢.推荐国内使用cnpm,在命令行下输入  
`$ npm install -g cnpm --registry=https://registry.npm.taobao.org` 
* 下载 全局gulp  
打开命令行, `$ npm install gulpjs/gulp#4.0 -g` ($符表系统命令,而非代码,不用敲入)
* 下载 item-lite  
选好安装目录,如 C:/item-lite ,cd到该目录下,执行命令行 `$ npm install item-lite`  
* 下载依赖项   
继续命令行 `$ npm install`  

## 使用  
* 配置  
进入config.json文件,填写"copyfrom","index","copyto"  
其中,copyform是优百通项目地址,index是子项目地址,如index.html,wudu.html,它包含了该子项目所有页面的a链接,copyto是拷贝后生成的位置,建议使用绝对路径  
 `"pinyin":true/false`  是否开启拼音模式,该模式会将中文名的html按拼音重命名,入口文件不重命名   
* 使用  
完成以上步骤后,在item-lite目录下用命令行输入 `$ gulp` ,即可开始构建.

## 其它
请反馈bug.


