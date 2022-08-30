const http = require('http');
const fs = require('fs')
const url = require('url');
const mysql = require('mysql');
const qs = require('qs');
const Appcontrol = require('./controller/appcontrol');
const port = 8088;
let appcontrol = new Appcontrol();

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '12345',
//     database: 'casestudy3',
//     charset: 'utf8_general_ci'
// });
//
// connection.connect(function (err) {
//     if (err) {
//         throw err.stack;
//     }
//     else
//         console.log("connect success");
// })

let server = http.createServer((req, res)=> {
    let urlpath = url.parse(req.url).pathname;
    if (req.method === 'GET'){
        switch (urlpath) {
            case '/login': appcontrol.showlogin(req, res);
                break;
            case '/homeuser': appcontrol.showHomeuser(req, res);
                break;
            case '/homeadmin': appcontrol.showHomeadmin(req, res);
            break;
            case '/showallscore': appcontrol.showallscore(req, res);
                break;
            case '/students/search': appcontrol.searchstudent(req, res);
            break;
            case '/addnewstudent': appcontrol.addnewstudent(req, res);
            break;
            case '/delete': appcontrol.deletestudent(req, res);
            break;
        }

    }
    else {
        switch (urlpath) {
            case '/login':{
                appcontrol.checkLogin(req, res);
                break;
            }

        }
    }

})
server.listen(port,()=> {
    console.log('server is running')
})