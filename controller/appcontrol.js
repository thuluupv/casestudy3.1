const fs = require('fs');
const qs = require('qs');
const mysql = require('mysql');
const url = require("url");
const cookie = require('cookie');
const {serialize} = require("cookie");
const http = require('http');
let checkLoginadmin = false;
let checkLoginuser = false;
let indexupdate;
let namechat ='';
let namechatlist = [];
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
        let cookieUserLogin = {
            username:'',
            password:''
        }
        if(req.headers.cookie){
            let cookies = cookie.parse(req.headers.cookie)
            if (cookies && cookies.user){
                cookieUserLogin = JSON.parse(cookies.user)
                // if(cookieUserLogin.sessionId){
                //     let datasession = fs.readFileSync('./session/' + cookieUserLogin.sessionId +'.txt','utf8');
                //     let userCurrentLogin = JSON.parse(datasession)
                //     if(userCurrentLogin.username === cookieUserLogin.username &&
                //     userCurrentLogin.password === cookieUserLogin.password){
                //         res.writeHead(301,{location:'/homeadmin'})
                //         res.end();
                //     }
                // }
            }
        }

        fs.readFile('./views/login.html','utf8',(err,data)=>{
            if (err) {
                throw new Error(err);
            }
            data = data.replace('{username}',cookieUserLogin.username);
            data = data.replace('{password}',cookieUserLogin.password);
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.write(data)
            res.end();
        })
    }

     async showHomeadmin(req, res) {
        if (checkLoginadmin){
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
                    html += `<td><a href="/update?id=${item.idstudent}"><button class = "btn btn-danger btn-sm">S???a HS</button></a>
<a href="/delete?id=${item.idstudent}"><button class = "btn btn-primary btn-sm">Xo?? HS</button></a>  
<a href="/showallscore?id=${item.idstudent}"><button class = "btn btn-link btn-sm">chi ti???t</button>  </a>
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
        } else {
            res.writeHead(301, {'location': '/login'});
            res.end();
        }


    }
    async showHomeuser(req, res){
if (checkLoginuser){
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
            html += `<td> 
<a href="/showallscore?id=${item.idstudent}"><button class = "btn btn-link btn-sm">chi ti???t</button>  </a>
</td>`;
            html += '</tr>';
        })
        fs.readFile('./views/homeuser.html', 'utf8', (err, datahtml) => {
            if (err) {
                throw new Error(err);
            }
            datahtml = datahtml.replace('{showlist}',html)
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(datahtml);
            res.end();
        })
    })
}else{
    res.writeHead(301, {'location': '/login'});
    res.end();
}
    }


    async checkLogin(req, res) {
        let data ='';
        req.on('data', function(chunk){
            data += chunk;
        })
        req.on('end', async function () {
            let datacheck = qs.parse(data);

            let sessionLogin = {
                username: datacheck.username,
                password: datacheck.password
            }
            let namefile = Date.now()
            let datasession = JSON.stringify(sessionLogin)

            if (datacheck.username === 'admin' && datacheck.password === 'admin') {
                namechat = 'Gi??o vi??n';
                namechatlist.push(namechat);
                let datacookie = {
                    username: datacheck.username,
                    password: datacheck.password,
                    sessionId: namefile
                }
                const setcookie = cookie.serialize('user', JSON.stringify(datacookie));
                res.setHeader('Set-Cookie',setcookie)

                fs.writeFileSync('./session/'+ namefile + '.txt', datasession)
                res.writeHead(301,{'location':'./homeadmin'})
                res.end();
                checkLoginadmin = true;
            } else {
                const sql = `SELECT * FROM students`;
                await connection.query(sql, (err, data) => {
                    if (err) {
                        console.log(err)
                    }
                    data.forEach(item => {
                            if (item.idstudent == datacheck.username && item.DOB == datacheck.password) {
                                namechat = item.studentName;
                                namechatlist.push(namechat);
                                let datacookie = {
                                    username: datacheck.username,
                                    password: datacheck.password,
                                    sessionId: namefile
                                }
                                const setcookie = cookie.serialize('user', JSON.stringify(datacookie));
                                res.setHeader('Set-Cookie',setcookie)

                                fs.writeFileSync('./session/'+ namefile + '.txt', datasession)
                                res.writeHead(301,{'location':'./homeuser'})
                                res.end()
                                checkLoginuser = true;
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
    async searchstudent(req, res) {
            let keyword = qs.parse(url.parse(req.url).query).keyword;
        const sql = `SELECT * FROM averagescore where studentname like '%${keyword}%'`
        await connection.query(sql, (err, data) => {
            if (err) {
                throw new Error(err);
            }
            let studentlist = data
            let html = '';
            if (studentlist.length > 0) {
                studentlist.forEach((item) => {
                    html += '<tr>';
                    html += `<td> ${item.idstudent}</td>`;
                    html += `<td> ${item.studentname}</td>`;
                    html += `<td> ${item.className}</td>`;
                    html += `<td> ${item.TB}</td>`;
                    html += `<td><a href="/update?id=${item.idstudent}"><button class = "btn btn-danger btn-sm">S???a HS</button></a>
<a href="/delete?id=${item.idstudent}"><button class = "btn btn-primary btn-sm">Xo?? HS</button></a>  
<a href="/showallscore?id=${item.idstudent}"><button class = "btn btn-link btn-sm">chi ti???t</button>  </a>
</td>`;
                    html += '</tr>';
                })
            } else {
                html += "<tr>";
                html += `<td colspan="4" class="text-center">Kh??ng c?? d??? li???u</td>`;
                html += "</tr>";
            }

           let dataml = fs.readFileSync('./views/homeadmin.html', 'utf8' )
                dataml = dataml.replace('{showlist}', html)
                dataml = dataml.replace(' <input type="text" name="keyword" placeholder="Enter your name" class="form-control">', `<input type="text" name="keyword" value="${keyword}" placeholder="Enter your name" class="form-control">`)
                res.writeHead(200, {'Content-Type': 'text/html'})
                res.write(dataml)
                res.end();
            }
        )
        }
        async addnewstudent(req, res){
            let newid = qs.parse(url.parse(req.url).query).id;
            let newname = qs.parse(url.parse(req.url).query).name;
            let newdob = qs.parse(url.parse(req.url).query).dob;
            let newclassname = qs.parse(url.parse(req.url).query).classname;
            let newmath = qs.parse(url.parse(req.url).query).math;
            let newlitter = qs.parse(url.parse(req.url).query).litter;
            let newenglish = qs.parse(url.parse(req.url).query).english;

            const sql1 = `insert into students values (${newid},'${newname}','${newdob}','${newclassname}')`
            await connection.query(sql1, (err,data) => {
                if (err) {
                    throw new Error(err)
                }else{
                    let sql2 = `insert into Grades values (1,${newid},${newmath}),(2,${newid},${newlitter}),(3,${newid},${newenglish});`
                    connection.query(sql2, (err, data) => {
                        const sql3 = 'SELECT * FROM averagescore'
                         connection.query(sql3, (err, data) => {
                            if (err) {
                                throw new Error(err);
                            }
                             res.writeHead(301, {'location': '/homeadmin'})
                             res.end();
                         })
                    })
                }
            })
        }
        async deletestudent(req, res) {
            let index = +qs.parse(url.parse(req.url).query).id
            const sql = `DELETE FROM Students WHERE idstudent = ${index}`
            await connection.query(sql, (err, data) => {
                if (err) {
                    throw new Error(err);
                } else {
                    res.writeHead(301, {'location':'/homeadmin'})
                    res.end();
                }
            })
        }
        showupdatestudent(req, res) {
        indexupdate = +qs.parse(url.parse(req.url).query).id;
        let datas = fs.readFileSync('./views/adminviews/updatestudent.html', 'utf8');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(datas);
        res.end();

        }
        async updatestudent(req, res) {
            let data ='';
            req.on('data', function(chunk){
                data += chunk;
            })
            req.on('end', async function () {
                let datacheck = qs.parse(data);
                console.log(datacheck)
                let newname = datacheck.name;
                let newdob = datacheck.dob;
                let newclassname = datacheck.classname;
                let newmath = datacheck.math;
                let newlitter = datacheck.litter;
                let newenglish = datacheck.english;

                const sql1 = `UPDATE students SET studentName = '${newname}', DOB = '${newdob}', className = '${newclassname}' where idstudent = ${indexupdate}`
                await connection.query(sql1, function(err,data){
                    if (err) {
                        console.log(err.message)}
                    else {
                        const sql2 = `UPDATE Grades SET score = '${newmath}' where idstudent = ${indexupdate} and idsubject = 1`
                        connection.query(sql2, function(err,data){
                            if (err) {
                                console.log(err.message)
                            }
                            else {
                                const sql3 = `UPDATE Grades SET score = '${newlitter}' where idstudent = ${indexupdate} and idsubject = 2`
                                connection.query(sql2, function(err,data) {
                                    if (err) {
                                        console.log(err.message)
                                    }
                                    else {
                                        const sql4 = `UPDATE Grades SET score = '${newenglish}' where idstudent = ${indexupdate} and idsubject = 3`
                                        connection.query(sql4, function(err,data) {
                                            if (err) {
                                                console.log(err.message)
                                            }
                                            else {
                                                res.writeHead(301,{'location':'/homeadmin'})
                                                res.end()
                                            }
                                    })
                                    }
                                })
                            }
                        })
                    }
                })
            })
        }
    }
module.exports = Appcontrol