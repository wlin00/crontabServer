const Websocket = require('ws');
const ws = new Websocket.Server({port:8080},()=>{
    console.log('server start')
})

ws.on('connection',(client)=>{
    client.send('欢迎光临');
    
    client.on('message',(msg)=>{
        console.log('msg from client' + msg)
    })

    client.on('close',()=>{
        console.log('connection close')
    })
})