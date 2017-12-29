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
    // IP = util.getIP(requestDetail._req);
    //
    // console.log(requestDetail._req.socket._bytesDispatched);
    return false;
}


exports.beforeSendRequest = function* (requestDetail){

    IP = util.getIP(requestDetail._req);

    if(requestDetail.url.indexOf('sina.com')>0){
        response =  {
            response: {
                statusCode: 200,
                header: {'Content-Type': 'text/html'},
                body: "<html>\n" +
                "<head><style type=\"text/css\">.block{height: 880px;line-height:880px;text-align: center;}</style>\n" +
                "</head><body><div class=\"block\" ><font size=\"7\" face=\"arial\" color=\"#A23400\">This sensitive site has been blocked!</div></body></html>"
            }
        };
        return response;
    }


    if(requestDetail.url.indexOf('192.168.191.1')>0){
        const newRequestOptions = requestDetail.requestOptions;
        newRequestOptions.headers['resIp'] = IP;
        return {
            requestOptions: newRequestOptions
        };
    }
    return null;
}


exports.beforeSendResponse = function* (requestDetail, responseDetail) {

    IP = util.getIP(requestDetail._req);
    size  = responseDetail._res.headers['Content-Length'];
    if(!size) size = 0;

    response = -1;

    client.hget(IP,'traffic', (err, val) => {
        client.expire(IP+"canary", 100);
        val = parseInt(val);
        console.log('response: ' + IP + "size "+ size + "val :" + val);

        if (val>=0) {
            if(val < size){
                client.hset(IP,'traffic',0);
                console.log('lack of traffic ');

                response =  {
                    response: {
                        statusCode: 200,
                        header: {'Content-Type': 'text/html'},
                        body: "<html>\n" +
                        "<head><style type=\"text/css\">.block{height: 880px;line-height:880px;text-align: center;}</style>\n" +
                        "</head><body><div class=\"block\" ><font size=\"7\" face=\"arial\" color=\"#A23400\">Lack of traffic~</div></body></html>"
                    }
                };
            }else{
                client.hset(IP,'traffic',val-size);
                console.log('success ' + (val-size));
                response = null;
            }

        } else {
            console.log(IP + " haven't log in! ");
            response = {
                response: {
                    statusCode: 200,
                    header: {'Content-Type': 'text/html'},
                    body: "<html>\n" +
                    "<head><style type=\"text/css\">.block{height: 880px;line-height:880px;text-align: center;}</style>\n" +
                    "</head><body><div class=\"block\" ><font size=\"7\" face=\"arial\" color=\"#A23400\">You need to log in with your phone number</div></body></html>"
                }
            };
        }
    });


    while(response === -1){
        sleep(10);
    }

    return response;
}




