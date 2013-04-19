// Just a basic server setup for this site
var Stack = require('stack'),
    Creationix = require('creationix'),
    Http = require('http'),
    Logger = require('./logger');

Http.createServer(Stack(
  Logger.log(),
  require('wheat')(__dirname +"/..")
)).listen(80);




