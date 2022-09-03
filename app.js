const http = require('http');
const fs = require('fs')
const url = require('url');
const mysql = require('mysql');
const qs = require('qs');
const Appcontrol = require('./controller/appcontrol');
const port = 8088;
const {Server} = require('socket.io')
let appcontrol = new Appcontrol();
//let namechat = require('./controller/appcontrol');
let mimeTypes = {
    jpg: "images/jpg",
    png: "images/png",
    js: "text/javascript",
    css: "text/css",
    svg: "image/svg+xml",
    ttf: "font/ttf",
    woff: "font/woff",
    woff2: "font/woff2",
    eot: "application/vnd.ms-fontobject",
};
let server = http.createServer((req, res) => {
    let urlpath = url.parse(req.url).pathname;
    if (req.method === 'GET') {
        const filesDefences = urlpath.match(
            /\.js|\.css|\.png|\.svg|\.jpg|\.ttf|\.woff|\.woff2|\.eot/
        );
        if (filesDefences) {
            const extension = mimeTypes[filesDefences[0].toString().split(".")[1]];
            res.writeHead(200, {"content-type": extension});
            fs.createReadStream(__dirname + "/" + req.url).pipe(res);
        } else {
        switch (urlpath) {
            case '/login':
                appcontrol.showlogin(req, res);
                break;
            case '/homeuser':
                appcontrol.showHomeuser(req, res);
                break;
            case '/homeadmin':
                appcontrol.showHomeadmin(req, res);
                break;
            case '/showallscore':
                appcontrol.showallscore(req, res);
                break;
            case '/students/search':
                appcontrol.searchstudent(req, res);
                break;
            case '/addnewstudent':
                appcontrol.addnewstudent(req, res);
                break;
            case '/delete':
                appcontrol.deletestudent(req, res);
                break;
            case '/update':
                appcontrol.showupdatestudent(req, res);
                break;
            case '/chat':
                appcontrol.chatStudent(req, res,server);
                break;
            case '/chatStudent':
                appcontrol.chatStudent(req, res,server);
                break;
            default:
                res.end();
        } }
    } else {
        switch (urlpath) {
            case '/login': {
                appcontrol.checkLogin(req, res);
                break;
            }
            case '/update': {
                appcontrol.updatestudent(req, res);
                break;
            }

        }
    }

})

server.listen(port, () => {
    console.log('server is running')
})
const io = new Server(server);
io.on('connection', (socket) => {

    socket.on('on-chat' , message =>{
        io.emit('chat all' , message);
    })
    socket.on('disconnect', (data) => {
        let message = data+ " disconnected"
        socket.broadcast.emit('user-disconnect', message)
        // namechatlist.splice(namechatlist[0],namechatlist.length)
    })
})
