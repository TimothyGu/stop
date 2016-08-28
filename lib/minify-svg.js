'use strict';

var barrage = require('barrage');
var Svgo = require('svgo');
var chalk = require('chalk');
var prettyBytes = require('pretty-bytes');
var figures = require('figures');
var arrow = ' ' + figures.arrowRight + ' ';

function formatSize(size, tag) {
  return chalk.green(prettyBytes(size)) + ' ' + chalk.gray('(' + tag + ')');
}

module.exports = minifySVG;
function minifySVG(options) {
  options = options || {};
  var silent = options.silent;
  var filter = options.filter;
  var svgo = new Svgo(options);
  var stream = new barrage.Transform({objectMode: true});
  stream._transform = function (page, _, cb) {
    if (page.headers['content-type'].indexOf('image/svg+xml') === -1 || filter && !filter(page.url)) {
      stream.push(page);
      cb();
      return;
    }

    if (!silent) {
      console.log(chalk.blue('minfing ') + page.url);
    }
    var before = page.body.length;
    svgo.optimize(page.body.toString(), function (result) {
      if (result.error) return cb(new Error(result.error));

      page.body = new Buffer(result.data);
      var after = page.body.length;
      if (!silent) {
        console.log(formatSize(before, 'source') + arrow + formatSize(after, 'minify'));
      }
      stream.push(page);
      cb();
    });
  };
  return stream;
}
