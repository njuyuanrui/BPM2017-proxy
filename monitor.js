const redis  = require('redis');
const util = require('./util')

var redis_config = {
    "host": "127.0.0.1",
    "port": 6379,
};

client = redis.createClient(redis_config);

exports.summary = 'a rule to hack response';

exports.beforeSendRequest = function* (requestDetail){
    IP = util.getIP(requestDetail._req);
    size = requestDetail.requestData.byteLength;

    client.hget(IP,'traffic', (err, val) => {
        console.log('request: ' + IP);

        if (val) {
            client.expire(IP, 100);
            if(val < size){
                client.hset(IP,'traffic',0);
                console.log('rest traffic: '+ 0);
                return {
                    response: {
                        statusCode: 200,
                        header: { 'content-type': 'text/html' },
                        body: 'traffic is insufficient'
                    }
                };
            }else{
                client.hset(IP,'traffic',val-size);
                console.log('rest traffic: '+ (val-size));
                return null;
            }

        } else {
            return {
                response: {
                    statusCode: 200,
                    header: { 'content-type': 'text/html' },
                    body: 'You are not connected'
                }
            };
        }
    });

}


exports.beforeSendResponse = function* (requestDetail, responseDetail) {

    IP = util.getIP(requestDetail._req);
    size = responseDetail.response.body.byteLength;

    client.hget(IP,'traffic', (err, val) => {
        console.log('request: ' + IP);

        if (val) {
            client.expire(IP, 100);
            if(val < size){
                client.hset(IP,'traffic',0);
                console.log('rest traffic: '+ 0);
                return {
                    response: {
                        statusCode: 200,
                        header: { 'content-type': 'text/html' },
                        body: 'traffic is insufficient'
                    }
                };
            }else{
                client.hset(IP,'traffic',val-size);
                console.log('rest traffic: '+ (val-size));
                return null;
            }

        } else {
            return {
                response: {
                    statusCode: 200,
                    header: { 'content-type': 'text/html' },
                    body: 'You are not connected'
                }
            };
        }
    });



}

// 0 enough ; 1 not enough ; 2 not connected
var checkTraffic = function(ip, size){
    client.hget(IP,'traffic', (err, val) => {
        console.log('request: ' + IP);

        if (val) {
            client.expire(IP, 100);
            if(val < size){
                client.hset(IP,'traffic',0);
                console.log('rest traffic: '+ 0);
                return 1;
            }else{
                client.hset(IP,'traffic',val-size);
                console.log('rest traffic: '+ (val-size));
                return 0;
            }

        } else {
            return 2
        }
    });

}




