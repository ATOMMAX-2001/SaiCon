//AUTHOR:S.ABILASH

const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const path = require('path');
const datastore = require('nedb');
const body = require('body-parser');

const userdb = new datastore('user.db');
//const usermessage = new datastore('message.db');

const app = express();	
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static(path.join(__dirname, 'public')));
app.use(body.urlencoded({extended:false}));
app.use(body.json());
userdb.loadDatabase();
//usermessage.loadDatabase();	

let count =0;
//credits:censor words given by Vishwa;
let censorWords=[
	'otha',
	'watha',
	'fuck',
	'bitch',
	'ass-hole',
	'asshole',
	'bastard',
	'omala',
	'soothu',
	'mayiru',
	'koothi',
	'punda',
	'kundi',
	'oombu',
	'dick',
	'pool',
	'baadu',
	'thevidiya'
];
let users=[];

app.get('/',(req,res) =>{
	res.sendFile(__dirname+'/welcome.html');
});

app.get('/room',(req,res) =>{
    res.sendFile(__dirname+'/index.html');    
});
let userName;
app.post('/',(req,res)=>{
	let sainame = req.body.username.trim();
	userName = sainame;
	userdb.find({name:userName},function(e,d){
		if(d.length==1){
			return res.redirect('/?user=notallowed');		
		}else{
			userdb.insert({name:sainame},function(e,d){
				return res.redirect('/room?user='+sainame);
			});
		}
	});
})

let userid;

io.on("connection",(socket) =>{
	if(users.indexOf(userName)>-1){
		io.emit('intruder',socket.id);
	}else{
		userid = socket.id;
		socket.id = userName;
		users.push(userName);	
	}
	
	count++;
	socket.on('user-count',()=>{
		io.emit('user-count',count);
	});
	socket.on('students-message',(data)=>{
		if(data.length!=0){
			let temp = data.toLowerCase().split();
			let tempMessage="";
			for(let i=0;i<temp.length;i++)
			{
				tempMessage=temp[i];
				for(let j=0;j<censorWords.length;j++)
				{
					 if(tempMessage!=temp[i].replace(censorWords[j],'*****')){
					 	tempMessage=temp[i].replace(censorWords[j],'*****');
					 	break;
					 }				
				}
			}
			io.emit('students-message',tempMessage,socket.id,userid);
		}
	});
function remove_user(username)
{
	userdb.remove({name:username},{});
}
	socket.on("disconnect",() => {
		count--;
		users.pop(socket.id);
		remove_user(socket.id);
		io.emit("user-leaving",count);
		socket.emit('user-leaving');		
	});

});

server.listen(process.env.PORT || 3000,()=> {
    console.log("server started on port 3000");
})
