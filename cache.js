const redis  = require('redis');
var request = require('request');
const expire = 60;

var redis_config = {
    "host": "127.0.0.1",
    "port": 6379,
};

const redisObj = {
    client: null,
    observer:null,
    connect: function () {
        this.client = redis.createClient(redis_config);
        this.observer = redis.createClient(redis_config);

        this.client.on('error', function (err) {
            console.log('client Error ' + err);
        });
        this.client.on('ready', function () {
            console.log('client connection succeed');
        });
        this.observer.on('error', function (err) {
            console.log('observer Error ' + err);
        });
        this.observer.on('ready', function () {
            console.log('observer connection succeed');
        });
    },
    init: function () {
        this.connect(); // 创建连接
        this.observer.psubscribe('__keyevent@' + 0 +'__:expired');
        this.observer.on("pmessage", function (pattern, channel, expiredKey) {

            client.hgetall(expiredKey.substring(0,expiredKey.indexOf('c')), (err, obj) => {

                requestData = {
                    mobile:obj.mobile,
                    traffic:obj.traffic*1.0/(1024*1024),
                }
                console.log(requestData);
                request({
                    url: 'http://202.120.40.28:88/index.php?r=user/update-user-info',
                    method: "POST",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(requestData)
                }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        client.del(ip);
                        console.log(body);
                        console.log('del successfully');
                    }
                });
            });

        });
        const instance = this.client;

        // 主要重写了一下三个方法。可以根据需要定义。
        const get = instance.get;
        const set = instance.set;
        const setex = instance.setex;
        //const expire = instance.expire;

        instance.set = function (key, value, callback) {
            if (value != undefined) {
                set.call(instance, key, JSON.stringify(value), callback);
            }
        };

        instance.get = function (key, callback) {

            get.call(instance, key, (err, val) => {
                if (err) {
                    console.log('redis.get: ', key, err);
                }
                callback(null, JSON.parse(val));
            });

        };

        instance.setex = function (key, value, callback) {
            if (value !== undefined) {
                setex.call(instance, key, expire, JSON.stringify(value), callback);
            }
        };

        return instance;
    },
};

// 返回的是一个redis.client的实例
module.exports = redisObj.init();