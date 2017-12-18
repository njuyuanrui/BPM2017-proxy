var get_client_ip = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    //console.log(ip);
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }
    arr = ip.split(':');
    if(arr.length>0){
        ip = arr[arr.length-1];
    }

    return ip;
};


exports.getIP = get_client_ip;
