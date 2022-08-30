const fs = require('fs');
const qs = require('qs');
const mysql = require('mysql');
const url = require("url");
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'casestudy3',
    charset: 'utf8_general_ci'
});
connection.connect(function (err) {
    if (err) {
        throw err.stack;
    }
    else
        console.log("connect success");
})
class Appcontrol {
    showlogin(req, res) {
        fs.readFile('./views/login.html','utf8',(err,data)=>{
            if (err) {
                throw new Error(err);
            }
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.write(data)
            res.end();
        })
    }
     async showHomeadmin(req, res) {

            const sql = 'SELECT * FROM averagescore'
             await connection.query(sql, (err, data) => {
                if (err) {
                    throw new Error(err);
                }
                let html =''
                data.forEach(item => {
                    html += '<tr>';
                    html += `<td> ${item.idstudent}</td>`;
                    html += `<td> ${item.studentname}</td>`;
                    html += `<td> ${item.className}</td>`;
                    html += `<td> ${item.TB}</td>`;
                    html += `<td><a href="/update?id=${item.idstudent}" class="edit" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i></a>
<a href="/delete?id=${item.idstudent}" class="delete" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i></a> 
<a href="/showallscore?id=${item.idstudent}"><button class = "btn btn-primary btn-sm">chi tiết</button>  </a>
</td>`;
                    html += '</tr>';
                })
                 fs.readFile('./views/homeadmin.html', 'utf8', (err, datahtml) => {
                     if (err) {
                         throw new Error(err);
                     }
                     datahtml = datahtml.replace('{showlist}',html)
                     res.writeHead(200, {'Content-Type': 'text/html'});
                     res.write(datahtml);
                     res.end();
                 })

            })
    }
    showHomeuser(req, res){
        fs.readFile('./views/homeuser.html', 'utf8', (err, data) => {
            if (err) {
                throw new Error(err);
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        })
    }
    async checkLogin(req, res) {
        let data ='';
        req.on('data', function(chunk){
            data += chunk;
        })
        req.on('end', async function () {
            let datacheck = qs.parse(data);
            console.log(datacheck)

            if (datacheck.username == 'admin' && datacheck.password == 'admin') {
                res.writeHead(301,{'location':'./homeadmin'})
                res.end();
            } else {
                //let result;
                const sql = `SELECT * FROM students`;
                await connection.query(sql, (err, data) => {
                    if (err) {
                        console.log(err)
                    }
                    data.forEach(item => {
                            if (item.idstudent == datacheck.username && item.DOB == datacheck.password) {
                                res.writeHead(301,{'location':'./homeuser'})
                                res.end()
                            }
                        })
                });
            }


        })

    }
    async showallscore(req, res) {
        let index = +qs.parse(url.parse(req.url).query).id
        const sql = `SELECT * FROM GradeofStudent WHERE idstudent = ${index}`
        await connection.query(sql, (err, data) => {
            if (err) {
                throw new Error(err);
            }
            let html =''
            data.forEach(item => {
                html += '<tr>';
                html += `<td> ${item.idstudent}</td>`;
                html += `<td> ${item.studentname}</td>`;
                html += `<td> ${item.className}</td>`;
                html += `<td> ${item.subjectname}</td>`;
                html += `<td> ${item.score}</td>`;
                html += '</tr>';
            })
            fs.readFile('./views/adminviews/showallscore.html', 'utf8', (err, datahtml) => {
                if (err) {
                    throw new Error(err);
                }
                datahtml = datahtml.replace('{showlist}',html)
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(datahtml);
                res.end();
            })

        })



    }

}

module.exports = Appcontrol