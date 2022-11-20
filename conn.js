const server=require('express')
const initOptions = {
    // initialization options;
};
const db= require('pg-promise')(initOptions)
const cn = 'postgres://zkhnlyuj:0uAnAFE-OGiQrTFJdhxPjdbz38Sp2xyb@peanut.db.elephantsql.com:5432/zkhnlyuj'
var num = 0
const route=server.Router()
var app = server()
app.use(server.urlencoded())
var data 
const { Client } = require('pg')
const client = new Client({
  user: 'zkhnlyuj',
  host: 'peanut.db.elephantsql.com',
  database: 'zkhnlyuj',
  password: '0uAnAFE-OGiQrTFJdhxPjdbz38Sp2xyb',
  port: 5432,
})
const dark = db(cn)
client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//console.log("Wrapping process : ", wrap)
app.get('/gettrans', async function(req, respon, next) {
  try {
	  //console.log(getTransact());
    await client.query('SELECT * from transact',(err, res)=>{
		respon.status(200).json(res.rows)
	});
	//res.status(200).json(posts);
  } catch (err) {
    console.error(`Error while getting quotes `, err.message);
    next(err);
  }
});
app.post('/regis', async function(request, res, next) {
	//const {idpengguna, namalengkap, namapengguna, katasandi, pixel}= request.body;
  try {
    console.log(request.body.idpengguna)
    await client.query('call registrasi( $1, $2 ,$3 ,$4 ,$5 )',[request.body.idpengguna, request.body.namalengkap, request.body.namapengguna, request.body.katasandi, request.body.pixel],(err, respon) => {
      res.status(200).send("Success!!!") 
   });
	//res.json(await registrasi(req.body));
  } catch (err) {
    console.error(`Error while getting quotes `, err.message);
    next(err);
  }
});
app.post('/deposit', async function(req, res, next) {
  try {
    await client.query('call deposit( $1, $2 ,$3 )',[req.body.idpengguna, req.body.transaksi, req.body.saldo],(err, respon) => {
      res.status(200).send("Success!!!") 
   });
  } catch (err) {
    console.error(`Error while getting quotes `, err.message);
    next(err);
  }
});
app.post('/withdrawl', async function(req, res, next) {
  try {
  
   if (req.body.saldo<=5000000){	  
     await client.query('call deposit( $1, $2 ,$3 )',[req.body.idpengguna, req.body.transaksi, req.body.saldo*-1],(err, respon) => {
      res.status(200).send("Success!!!") 
   });
  }
  } catch (err) {
    console.error(`Error while getting quotes `, err.message);
    next(err);
  }
});
async function myDraw (req, res){
	await client.query('call deposit( $1, $2 ,$3 )',[req.body.idpengguna, req.body.transaksi, req.body.saldo*-1],(err, respon) => {
    return  res.status(200).send("Success!!!") 
   });
}
app.post('/withdrawal', async function(req, res, next) {
  try {
      dark.task( 'mytask',async t => {
    // execute a chain of queries against the task context, and return the result:
       const sum = await t.one('select sum(balance) as total from transact where userid= $1 ', [req.body.idpengguna]);
	   num = parseInt(sum.total);
	   return num;
})
    .then(data => {
        // success, data = either {count} or {count, logs}
		data = num//|| req.body.saldo<=data
		console.log("Tampil data : ",data)
		if (req.body.saldo<=5000000 && req.body.saldo<=data ){	  
              myDraw(req, res)
         }
		else { res.send("Sorry!!!") } 
    })
  } catch (err) {
    console.error(`Error while getting quotes `, err.message);
    next(err);
  }
});
app.post('/login', async function(request, res, next) {
	//const {idpengguna, namalengkap, namapengguna, katasandi, pixel}= request.body;
  try {
    console.log(request.body.sandi)
    await client.query('select * from login($1)',[request.body.sandi],(err, respon) => {
      res.status(200).json("success!!!") 
   });
	//res.json(await registrasi(req.body));
  } catch (err) {
    console.error(`Error while getting quotes `, err.message);
    next(err);
  }
});
app.listen(8080);