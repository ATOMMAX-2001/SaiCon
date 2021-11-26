
const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();	
const server = http.createServer(app);
const io = new Server(server);

app.get('/',(req,res) =>{
    res.sendFile(__dirname+'/index.html');
});

let count =0;
//credit: vishwa (my friend) who gave all these words to me
let censorWords=[
        'otha',
	'watha',
	'fuck',
	'bitch',
	'ass-hole',
	'asshole',
	'bastard',
	'tha',
	'maala',
	'wamala',
	'omala',
	'soothu',
	'mayiru',
	'koothi',
	'punda',
	'kundi',
	'oombu',
	'dick',
	'pool'
];

io.on("connection",(socket) =>{
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
			io.emit('students-message',tempMessage,count);
		}
	});
	socket.on("disconnect",() => {
		count--;
		socket.on('user-count',(count)=>{
		io.emit('user-count',count);
		});
	});

});

server.listen(process.env.PORT || 3000,()=> {
    console.log("server started on port 3000");
})
