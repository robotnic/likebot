'use strict';


/*
 * Like bot is handling the following commands.
* There is no database backend, all data are in memory.
* For Production mode a db backend has to be written.

Commands:
like
{"type":0,"data":["xmpp.chat.message",{"to":"likebot@laos.buddycloud.com","type":"chat","content":"{\"type\":\"like\",\"id\":\"85da923c-3c08-46e8-87d4-dd78f1e1d49a\"}"}]}

list:
{"type":0,"data":["xmpp.chat.message",{"to":"likebot@laos.buddycloud.com","type":"chat","content":"{\"type\":\"list\",\"ids\":[\"c8031131-5222-4ad1-a0a6-7c5b5862af52\",\"0ae888cd-c222-4cc3-b304-88e1494ad956\",\"214964b6-94e4-4357-8a10-d80b334c0685\",\"42e2f143-7577-48c3-8c64-a86bca7eb22c\",\"76f38d64-5b7f-464c-9f75-f407b65f1316\",\"165318c8-5a79-4b7c-806f-05fb1fc42d30\",\"b95ebe06-31be-457f-8e74-e71530b10b2b\",\"1c92e38c-7444-4921-a84e-9e09e9e4f6e2\"]}"}]}

likers:
3:::{"type":0,"data":["xmpp.chat.message",{"to":"likebot@laos.buddycloud.com","type":"chat","content":"{\"type\":\"likers\",\"id\":\"85da923c-3c08-46e8-87d4-dd78f1e1d49a\"}"}]}


 */

var Client = require('node-xmpp-client')
  , ltx = require('ltx')


var component = "test"
  , client = new Client({
    jid: 'likebot@laos.buddycloud.com',
    password: 'likebot2015',
    host:'laos.buddycloud.com',
    reconnect: true
})


client.connection.socket.setKeepAlive(true, 10000)

var counters={};


var c  = 0
client.on('stanza', function(stanza) {

        console.log("-----------",stanza);

    if (stanza.is('message') ) {
        console.log('message',stanza.attrs.from,stanza.getChildText('body'));
        if(stanza.attrs.from.indexOf("/")!=-1){
            var from=stanza.attrs.from.substring(0,stanza.attrs.from.indexOf("/"));
            console.log(from);
        }
        makeanswer(from,stanza.getChildText('body'));
    }
})


function makeanswer(from,text){
    console.log(from,text);
    try{
    var request=JSON.parse(text);
    }catch(e){
        console.log(e);
        return;
    }
    var answer={};
        console.log("action",request);
        console.log("type",request.type);
        switch(request.type){
            case "like":
                var id=request.id;
                if(!counters[id]){
                    counters[id]=[];
                }
                if(counters[id].indexOf(from)==-1){
                    counters[id].push(from);
                    answer={type:"like",id:id,count:counters[id].length,like:"ok"};
                }else{
                    answer={type:"like",id:id,count:counters[id].length,like:"you alread like "+id};
                }
                break;
            case "likers":
                var id=request.id;
                answer={type:"likers",id:id,list:counters[id]}; 
                break;
            default:
                console.log("default");
              var answer={type:"list",counters:{}};
                var list=request.ids;
                console.log(list); 
                if(list){
                    for(var i=0;i<list.length;i++){
                        var id=list[i];
                        if(id){
                        console.log(id);
                        if(counters[id]){
                           answer.counters[id]=counters[id].length;
                        }
                        }
                    }
                }
                console.log(answer);
               break;



    }
                console.log(answer);
    sendMessage(from,JSON.stringify(answer));

}

function sendMessage(from,text){
        var reply = new ltx.Element('message', {
            to: from,
            type: 'chat'
        })
        reply.c('body').t(text)
        client.send(reply)
}

console.log("wait for server");
client.on('online', function() {
    console.log('Client is online')
     client.send(new ltx.Element('presence', { }));
})

client.on('offline', function () {
    console.log('Client is offline')
})


client.on('connect', function () {
    console.log('Client is connected')
})

client.on('reconnect', function () {
    console.log('Client reconnects …')
})

client.on('disconnect', function (e) {
    console.log('Client is disconnected', client.connection.reconnect, e)
})


client.on('error', function(e) {
    console.error(e)
    process.exit(1)
})

process.on('exit', function () {
    client.end()
})
