
# BPM2017-proxy
BPM2017


##代理服务器地址：
    ip: 一般是192.168.191.1
    port: 8001
##服务器地址:
    ip: 一般是192.168.191.1
	port: 3000

##API
* 连接:  
    * 设置手机代理服务器地址
    * 发送get请求 ip:port/register/:mobile   返回一个json 例如 :
        ```json
            get 192.168.191.1:3000/register/15895889973
            
            return:

            {
                errno: 0     //0表示成功
                traffic：100 //剩余流量
            }
        ```
 
* 获取剩余流量:
    * 发送get请求 ip:port/traffic
        ```json
            get 192.168.191.1:3000/traffic
            
            return:

            {
                errno: 0     //0表示成功
                traffic：100 //剩余流量
            }
        ```
* 手动断开连接
    * 发送post请求 ip:port/close
       ```json
            get 192.168.191.1:3000/close
            
            return:

            {
                errno: 0     //0表示成功
            }
        ```
* 刷新流量
    * 发送post请求 ip:port/update
       ```json
            get 192.168.191.1:3000/update
            
            return:

            {
                errno: 0     //0表示成功
                traffic：100 //剩余流量
            }
        ```