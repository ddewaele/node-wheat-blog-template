// A super simple logging middleware

var connect = require('connect');

module.exports.log = function() {
 
  return function handle(req, res, next) {
  
    connect.logger()(req,res,function() {});  
    //also works
    //var fn = connect.logger();
    //fn(req,res,function() {});

    //console.log("fn2 = " + connect.logger());
	//connect.logger(req,res,function() {});
    next();
  };
};




