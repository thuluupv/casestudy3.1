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
                    html += `<td><a href="/update?id=${item.idstudent}"><button class = "btn btn-danger btn-sm">Sửa HS</button></a>
<a href="/delete?id=${item.idstudent}"><button class = "btn btn-primary btn-sm">Xoá HS</button></a>  
<a href="/showallscore?id=${item.idstudent}"><button class = "btn btn-link btn-sm">chi tiết</button>  </a>
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
                    html += `<td><a href="/update?id=${item.idstudent}" class="edit" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i></a>
<a href="/delete?id=${item.idstudent}"><button class = "btn btn-primary btn-sm">xoá</button></a>  
<a href="/showallscore?id=${item.idstudent}"><button class = "btn btn-primary btn-sm">chi tiết</button>  </a>
</td>`;
                    html += '</tr>';
                })
            } else {
                html += "<tr>";
                html += `<td colspan="4" class="text-center">Không có dữ liệu</td>`;
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
                            let html =''
                            data.forEach(item => {
                                html += '<tr>';
                                html += `<td> ${item.idstudent}</td>`;
                                html += `<td> ${item.studentname}</td>`;
                                html += `<td> ${item.className}</td>`;
                                html += `<td> ${item.TB}</td>`;
                                html += `<td><a href="/update?id=${item.idstudent}" class="edit" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i></a>
<a href="/delete?id=${item.idstudent}"><button class = "btn btn-primary btn-sm">xoá</button></a>
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


                    })
                }


            })

        }
        async deletestudent(req, res) {
            let index = +qs.parse(url.parse(req.url).query).id
            console.log(index)
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


    }



module.exports = Appcontrol