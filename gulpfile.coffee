gulp = require 'gulp'

util = require 'gulp-util'
concat = require 'gulp-concat'
babel = require 'gulp-babel'
uglify = require 'gulp-uglify'

merge = require 'merge2'
browserify = require 'browserify'
babelify = require 'babelify'
source = require 'vinyl-source-stream'
buffer = require 'vinyl-buffer'

glob = require 'glob'
path = require 'path'

server = require 'gulp-webserver'


gulp.task 'server', (done)->
  gulp.src 'public'
    .pipe server
      host: 'localhost'
      port: 3000
      livereload: true


gulp.task 'scripts', (done)->

  bundle = (file)->

    dest = file.replace(/^assets\/scripts\//, '').split('/').slice(0, -1).join '/'
    opts = 
      debug: true
      paths: [ 'node_modules', 'assets' ]

    stream1 = gulp.src 'node_modules/createjs/builds/1.0.0/createjs.js'
    stream2 = browserify file, opts
      .transform 'babelify', { presets: ['env'] }
      .bundle()
      .on 'error', (err)-> util.log 'Browserify Error', err
      .pipe source path.basename file
      .pipe buffer()

    # http://yuheiy.hatenablog.com/entry/2016/12/11/215757
    # merge2はシーケンシャル処理できるから順序の問題はなさそう?
    merge(stream1, stream2)
      .pipe concat path.basename file
      .pipe uglify()
      .pipe gulp.dest "public/scripts/#{dest}"

  glob 'assets/scripts/**/*.{js,coffee}', (err, files)->
    files.map (file)-> bundle file

  done()


gulp.task 'watch', (done)->
  gulp.watch 'assets/scripts/**/*.{js,coffee}', gulp.series('scripts')
  done()


