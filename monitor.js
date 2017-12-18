const redis  = require('redis');
const util = require('./util')

var redis_config = {
    "host": "127.0.0.1",
    "port": 6379,
};

client = redis.createClient(redis_config);

exports.summary = 'a rule to hack response';

exports.beforeSendRequest = function* (requestDetail){
    console.log(requestDetail.requestData.byteLength);

    console.log(util.getIP(requestDetail._req));
}


exports.beforeSendResponse = function* (requestDetail, responseDetail) {
        console.log(responseDetail.response.body.byteLength);
}




