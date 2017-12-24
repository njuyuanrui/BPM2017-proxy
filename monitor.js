const redis  = require('redis');
const util = require('./util')
var sleep = require('system-sleep');

var redis_config = {
    "host": "127.0.0.1",
    "port": 6379,
};

client = redis.createClient(redis_config);

exports.summary = 'a rule to hack response';


exports.beforeDealHttpsRequest = function* (requestDetail){
    IP = util.getIP(requestDetail._req);

    console.log(IP + "==================beforeDealHttpsRequest ");
    return true;
}


exports.beforeSendRequest = function* (requestDetail){
    IP = util.getIP(requestDetail._req);

    if(IP === '127.0.0.1'){
        return null;
    }

    size = requestDetail.requestData.byteLength;

    if(requestDetail.url.indexOf('192.168.191.1')>0){
        const newRequestOptions = requestDetail.requestOptions;
        newRequestOptions.headers['resIp'] = IP;
        return {
            requestOptions: newRequestOptions
        };
    }

    response = -1;

    client.hget(IP,'traffic', (err, val) => {
        client.expire(IP, 100);
        console.log(IP + "@@@@@@@@@@@@ in hget function and val : " + val);
        console.log('request: ' + IP);

        if (val) {
            console.log(IP + "#################### return val ");
            client.expire(IP, 100);
            if(val < size){
                client.hset(IP,'traffic',0);
                console.log('rest traffic: '+ 0);

                response =  {
                    response: {
                        statusCode: 200,
                        header: { 'content-type': 'text/html' },
                        body: 'traffic is insufficient'
                    }
                };
            }else{
                client.hset(IP,'traffic',val-size);
                console.log('rest traffic: '+ (val-size));
                response = null;
            }

        } else {
            console.log(IP + "#################### return else ");
            response = {
                response: {
                    statusCode: 200,
                    header: {'Content-Type': 'text/html'},
                    body: "<html>\n" +
                    "<head><style type=\"text/css\">.block{height: 880px;line-height:880px;text-align: center;}</style>\n" +
                    "</head><body><div class=\"block\" ><font size=\"6\" face=\"arial\" color=\"#A23400\">You need to log in with your phone number~</div></body></html>"
                }
            };
        }
    });

    while(response === -1){
        sleep(10);
    }
    return response;

}


exports.beforeSendResponse = function* (requestDetail, responseDetail) {

    IP = util.getIP(requestDetail._req);
    size = responseDetail.response.body.byteLength;
    console.log("before response##################");

    if(IP === '127.0.0.1'){
        return null;
    }

    if(requestDetail.url.indexOf('192.168.191.1')>0){
        return null;
    }

    client.hget(IP,'traffic', (err, val) => {
        console.log(IP + "==================beforeSendResponse get val " + val);

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




