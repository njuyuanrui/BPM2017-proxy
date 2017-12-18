var request = require('request');

// ===================redis=====================
const cache = require('./cache');


// ===================AnyProxy=====================
const AnyProxy = require('anyproxy');
const options = {
    port: 8001,
    rule: require('./monitor'),
    webInterface: {
        enable: true,
        webPort: 8002,
        wsPort: 8003,
    },
    throttle: 10000,
    forceProxyHttps: false,
    silent: false
};

const proxyServer = new AnyProxy.ProxyServer(options);
proxyServer.on('ready', function(){
    console.log('ready!');
});
proxyServer.on('error', function(){
    console.log('error!');
});
proxyServer.start();


// ===================Register Server=====================

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var util = require('./util')

var path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/register/:mobile', function(req, res, next) {
    result = {
        errno: 0,
    }
    mobile = req.params.mobile;

    request('http://127.0.0.1:1234/index.php?r=user/get-user-info-by-mobile&mobile='+mobile, function (error, response, body) {
        record = JSON.parse(body);
        traffic =  record['traffic'];
        result['traffic'] = traffic;
        cache.hmset(util.getIP(req), 'mobile',mobile, 'traffic',record['traffic'], (err, res) => {
            console.log('set'+ mobile + ' '+ traffic + " ip: " + util.getIP(req));
            cache.expire(mobile, 100);
        });
        res.send(JSON.stringify(result));
    })

});

app.get('/traffic/:mobile', function(req, res, next) {
    ip = util.getIP(req);
    result = {
        errno:0,
        traffic:-1,
    }

    cache.hget(ip,'traffic', (err, val) => {
        if (val) {
            cache.expire(ip, 100);
            result.traffic=val;
            data = JSON.stringify(result);
            res.send(data);
        } else {
            res.send("no connection");
        }
    });


});

app.post('/close', jsonParser, function(req, res) {

    ip = util.getIP(req);

    result = {
        errno:0,
    };

    cache.hgetall(ip, (err, obj) => {

        if (obj) {
            requestData = {
                mobile:obj.mobile,
                traffic:obj.traffic,
            }
            console.log(requestData);
            request({
                url: 'http://localhost:1234/index.php?r=user/update-user-info',
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(requestData)
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    cache.del(ip);
                    console.log(body);
                    console.log('del successfully');
                    res.send(JSON.stringify(result));
                }
            });
        } else {
            res.send("no connection");
        }
    });


});

app.post('/update', jsonParser, function(req, res, next) {
    ip = util.getIP(req);

    result = {
        errno:0,
    };

    cache.hgetall(ip, (err, obj) => {

        if (obj) {
            mobileID =obj.mobile;
            requestData = {
                mobile : mobileID,
                traffic : obj.traffic,
            }
            request({
                url: 'http://localhost:1234/index.php?r=user/update-and-get-user-info',
                method: "POST",
                json: true,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData)
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    traffic = body.traffic;
                    cache.hmset(ip,'mobile',mobileID,'traffic', traffic, (err, resp) => {
                        console.log('hmset'+ip+' '+ mobileID + ' '+ traffic);
                        cache.expire(ip, 100);
                        result.traffic=traffic;
                        console.log('upd successfully');
                        res.send(result);
                    });

                }
            });
        } else {
            res.send("no connection");
        }
    });
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;



// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');


// var index = require('./routes/index');

// view engine setup

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));



// error handler

