//
/// Setup the Symple server

var Symple  = require('symple');
var bodyParser = require('body-parser');
var http = require("http");
var fs = require('fs'); 
var parse = require('csv-parse');
var rdp = require('node-rdp');
var request = require('request');
var path    = require('path');
var pemFile = path.resolve(__dirname, 'key.pem');
 
 var exec = require('ssh-exec')	
 
 // // Load the AWS SDK for Node.js
// var AWS = require('aws-sdk');
// // Load credentials and set region from JSON file
// AWS.config.loadFromPath('./config.json');

// // Create EC2 service object
// var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

// var params = {
   // KeyName: 'primary-key-pair'
// };

// // Create the instance
// ec2.createKeyPair(params, function(err, data) {
   // if (err) {
     // // console.log("Error", err);
   // } else {
    // //  console.log(JSON.stringify(data));
	// fs.writeFile("key.pem", JSON.stringify(data), function(err) {
    // if(err) {
        // return console.log(err);
    // }

    // console.log("The file was saved!");
// }); 
   // }
   
   
   // node-rdp -a 13.85.15.183:3389 -u DOMAIN\ue4user -p World1234567
// });
 // rdp({
  // address: '13.85.15.183:3389',
  // username: 'ue4user',
  // password: 'World1234567',
   // enableDrives: '*',
   // enablePos:true,
   // launchWorkingDirectory:'C:'
// }).then(function(res) {
	// console.log(res)
	  // setTimeout(function() {
    // // by forcing the rejection of the deferred, the connection will be terminated 
    // console.error('Timeout expired, force-killing the connection')
    // deferred.reject();
  // }, 1000 * 60);
  // console.log('At this, point, the connection has terminated.');
// });
 // exec('ls -lh', {
  // user: 'ue4user',
  // host: '54.255.120.211',
  // port: 22,
  // key:fs.readFileSync(pemFile),
  // password: 'World123',
// }).pipe(process.stdout);
// process.stdin
  // .pipe(exec('echo try typing something; cat -', {
  // user: 'ue4user',
  // host: '175.41.157.41',
  // port: 3389,
  // key:fs.readFileSync(pemFile),
  // password: 'World123',
// }))
  // .pipe(process.stdout)

/*
var http    = require('http');


function handler(request,response){
  console.log(request.url);
  if(request.url == '/losadGame')
  {
    loadGameInit();
    console.log("Loading game");
  }
  else{
    console.log('Not Working!!!')
  }
}

var server  = http.createServer(handler);
server.listen(8080,function(){
  console.log('Server is listening at 8080');
});
*/

var sy = new Symple();
sy.loadConfig(__dirname + '/symple.json'); // see config.json for options
sy.init();
console.log('Symple server listening on port ' + sy.config.port);


//
/// Setup the demo client web server

var express = require('express'),
  path = require('path'),
  app = express(),
  joystick='-',
  user="",
  ipData=[],
  ipCounter=0;
  serverPort = parseInt(sy.config.port)
  clientPort = 4500;//serverPort - 1;

app.set('port', clientPort);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/');
app.use(express.static(__dirname + '/assets'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.render('index', {
    port: serverPort,
    peer: {
      user: 'demo',
      name: 'Demo User',
      group: 'public'
    }
  });
});

app.get('/login/:user', function(req, res) {
	
});


app.post('/setJoystick', function(req, res) {
    joystick = req.body.config;
	res.send(req.body); 
});

app.get('/getVirtualJoystickOutput', function(req, res) {
  res.send(joystick);  
});

app.post('/load/:user', function (req, res) {
  
 if(req.params.user!=user)
		ipCounter++;
    user = req.params.user;
	if(csvData[ipCounter]){
		loadGameInit(req.body.ht,req.body.wt,csvData[ipCounter])
		res.send(req.body.ht); 
	}
	else
		res.send('SERVER BUSY')
  
  
});

app.post('/loadGame', function (req, res) {
console.log("starting")
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}
console.log("configuring")
// Configure the request
var options = {
    url: 'http://13.85.15.183:4500/startGame',
    method: 'POST',
    headers: headers,
    form: {"ht":req.body.ht,"wt":req.body.wt}
}
console.log("requesting")
// Start the request
request(options, function (error, response, body) {
	console.log(response)
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body)
    }
	res.send(body)
})
		//loadGameInit(req.body.ht,req.body.wt)
		// var post_data={"ht":req.body.ht,"wt":req.body.wt};
		// var options = {
		  // host: '13.85.15.183',
		  // port: 4500,
		  // path: '/startGame',
		  // method: 'POST',
		  // headers: {
          // 'Content-Type': 'application/json',
          // 'Content-Length': Buffer.byteLength(post_data)
        // },
		 // data:post_data
		// };
		// // var options = {
  // // host: 'www.google.com',
  // // port: 80,
  // // path: '/upload',
  // // method: 'POST'
// // };

// var request = http.request(options, function(response) {
  // response.on('data', function (chunk) {
    // console.log('BODY: ' + chunk);
  // });
// });

// request.on('error', function(e) {
// console.log(e)})

		 // http.post("http://13.85.15.183:4500/startGame",{"ht":req.body.ht,"wt":req.body.wt}, function(resp){
		  // resp.on('data', function(chunk){
			// //do something with chunk
			// console.log(chunk)
		  // });
		// }).on("error", function(e){
		  // console.log("Got error: " + e.message);
		// });
		// res.send(req.body.ht); 

		// http.post(options, function(resp){
		  // resp.on('data', function(chunk){
			// //do something with chunk
			// console.log(chunk)
		  // });
		// }).on("error", function(e){
		  // console.log("Got error: " + e.message);
		// });
		// res.send(req.body.ht); 

  
});


app.listen(app.get('port'), function () {
  console.log('Web server listening on port ' + app.get('port'));
});

var exec    = require('child_process').execFile;
var execbat = require('child_process').exec;

function loadGameInit(wt,ht){
    console.log('height:'+ht+'...'+'weight:'+wt);
    execbat('taskkill /f /im "GameStreaming.exe"', (error, stdout, stderr) => {
     exec('../WindowsNoEditor/GameStreaming.exe' ,['ResX='+ht+' ResY='+wt], (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
    });
    
    console.log('Done') 
}
var csvData=[];
fs.createReadStream('ip.csv')
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
       // console.log(csvrow);

        //do something with csvrow
        csvData.push(csvrow);        
    })
    .on('end',function() {
      //do something wiht csvData
      console.log(csvData);
    });