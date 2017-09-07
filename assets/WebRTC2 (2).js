//Siganling client
var symplClient;
var remotePeer;
//The current peerconnection
var currentPeerConnection;
//Buffers ICE candidates
var candidateBuffer = [];

//The current game stream
var activeStream;
//The Data Channel used to transmit inputs
var sendChannel;

/*
* Input
*
*/
var checkRightClick=0;
var checkMouseMove=0;
var checkClick=0;

var rtcConfig = {
	
	"iceServers": [
		{ "urls":"stun:188.40.109.185:7917"},
		//{ "urls":"turn:188.40.109.185:7917",
		//	"username": "testuser1",
		//	"credential": "testpw1"
		//}
	],
	
	// iceCandidatePoolSize:10,
	bundlePolicy: "max-bundle"
	//rtcpMuxPolicy: "negotiate"
}

var dataChannelConfig = {   
	ordered : false, //can be set to true but needs testing
	maxRetransmits : 6, //can vary, but must not be to high as lost inputs get outdated prety fast  
	protocol : "udp",   
	reliable : false //unreliable is important for fast inputs
};
//maybe used later
//var certParams = {name: 'ECDSA', namedCurve: 'P-256'};

var rtcOptions = {
optional: [
	//{ DtlsSrtpKeyAgreement: true },
	//{'googIPv6': true}
	]
}

$(document).ready(function() {
	
	//Connect to server and start stream;
	$("#ConnectBtn").click(function(){
		
		$("#ConnectBtn").hide();
		$("#playerName").hide();

		startGame();
	});
});

function initGame(){
	
	window.mobileAndTabletcheck = function() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	};
	
	$('.left')[0].style.zIndex=100;
	$('.right')[0].style.zIndex=100;
	
	if(window.mobileAndTabletcheck()){
		var newjoystick	;
		var joystick	= new VirtualJoystick({
			container	: document.body,
			mouseSupport	: true,
			limitStickTravel : true,

			strokeStyle	: 'cyan'
		});
		joystick.addEventListener('touchStartValidation', function(event){
			var touch	= event.changedTouches[0];
			if( touch.pageX >= window.innerWidth/2 )	return false;
			return true
		});
		
		newjoystick	= new VirtualJoystick({
			container	:  document.body,
			limitStickTravel : true,
			mouseSupport	: true,
			strokeStyle	: 'orange'
		});
		newjoystick.addEventListener('touchStartValidation', function(event){
			var touch	= event.changedTouches[0];
			if( touch.pageX < window.innerWidth/2 )	return false;
			return true
			
		});
		// handleEvent('L',joystick.deltaX()+","+joystick.deltaY());
		newjoystick.addEventListener('touchStart', function(){
			
		})

		
		newjoystick.addEventListener('touchEnd', function(){
			
		})
		joystick.addEventListener('touchStart', function(){
			
			// handleEvent('L',joystick.deltaX()+","+joystick.deltaY());
		})
		joystick.addEventListener('touchEnd', function(){

		})
		joystick.addEventListener('touchMove', function(){
		})
		
		var previousDeltaX=0;
		var previousDeltaY=0;
		var previousNewDeltaX=0;
		var previousNewDeltaY=0;
		
		setInterval(function(){
			
			/*
			var outputEl	= $('.status')[0];
			
			//
			outputEl.innerHTML	= '<b>Result:<br> L : </b> '
			+ ' dx:'+Math.floor(joystick.deltaX())/100
			+ ' dy:'+Math.floor(joystick.deltaY())/100
			+ '<br><b>R:</b> dx:'+Math.floor(newjoystick.deltaX())/100
			+ ' dy:'+Math.floor(newjoystick.deltaY())/100
			// + (joystick.right()	? ' right'	: '')
			// + (joystick.up()	? ' up'		: '')
			// + (joystick.left()	? ' left'	: '')
			// + (joystick.down()	? ' down' 	: '')
			*/
			if(joystick.deltaX()!=previousDeltaX || joystick.deltaY()!=previousDeltaY){
				previousDeltaX=joystick.deltaX;
				previousDeltaY=joystick.deltaY;
				handleEvent('L',Math.floor(joystick.deltaX())/100+","+Math.floor(joystick.deltaY())/100);
			}
			if(newjoystick.deltaX()!=previousNewDeltaX || newjoystick.deltaY()!=previousNewDeltaY){
				previousNewDeltaX=newjoystick.deltaX;
				previousNewDeltaY=newjoystick.deltaY;
				handleEvent('R',Math.floor(newjoystick.deltaX())/100+","+Math.floor(newjoystick.deltaY())/100);
			}
		}, 1/30 * 1000);
		
	}
	
	$(".video-player").css("cursor","none");
	$(".video-player").mousedown(function(e){ 
		if( e.button == 2 ) {
			checkRightClick++;
			if(checkRightClick==1)
			handleEvent('MD',2);	
			else if(checkRightClick==5){
				checkRightClick=0;
			}
			//  return false; 
		} 
		//return true; 
	}); 
	
	$(".video-player").mouseup(function(e){ 
		//if( e.button == 2 ) {
		checkRightClick++;
		if(checkRightClick==1)
		handleEvent('MU',e.button);	
		else if(checkRightClick==5){
			checkRightClick=0;
		}
		//  return false; 
		//} 
	}); 
	
	
	$(".video-player").on("click",function(event){
		checkClick++;
		if(checkClick==1 && event.button==0){
			handleEvent('MD',0);			
		}
		else if(checkClick==5){
			checkClick=0;
		}
		
		event.preventDefault();
	});
	/*
	$(".video-player").on("mousemove",function(e){
		
		//var newMouseCoordinates=[Math.floor((originalMouseCoordinates[0]-e.pageX)/($(".video-player")[0].clientWidth*0.05))*0.1,Math.floor((originalMouseCoordinates[1]-e.pageY)/($(".video-player")[0].clientHeight*0.05))*0.1];
		var newMouseCoordinates=[Math.floor(originalMouseCoordinates[0]-e.pageX),Math.floor(originalMouseCoordinates[1]-e.pageY)];
		checkMouseMove++;
		if(checkMouseMove==1){
			handleEvent('m',newMouseCoordinates);
		}
		else if(checkMouseMove==5){
			checkMouseMove=0;
		}
	});
	*/
	
	$(document).on("keypress",function(event){
		handleEvent('kd',event.key);	
	});
	
	
	$(document).on("keyup",function(event){
		handleEvent('ku',event.key);		
	});
	document.oncontextmenu = function() {return false;};
}

function startGame(){
	
	initGame();
	createPeerConnection();
	initSymple();
}
/*
* Connects to the signaling server
*/
function initSymple()
{
	var gameURL = window.location.href.substr(0, window.location.href.indexOf(":",10))+':'+'4501';
	var clientConfig = {
		url: gameURL,		
	};
	clientConfig.peer={
			"user":$("#playerName").val(),
			"name":$("#playerName").val(),
			"group":"public"
		}
	//Init Client
	symplClient = new Symple.Client(clientConfig);
	
	symplClient.on('announce', function(peer) {
		console.log('Authentication success:', peer);
	});

	symplClient.on('presence', function(p) {
		console.log('Recv presence:', p)
	});
	
	symplClient.on('message', function(m){
		
		console.log('Recv message:', m)
		
		if (remotePeer && remotePeer.id != m.from.id) {
			
			console.log('Dropping message from unknown peer');
			return;
		}

		if (m.offer)
		{				
			console.log('Receive offer:', JSON.stringify(m.offer))

			remotePeer = m.from;	
			recvRemoteSDP(m.offer);
			
		}
		else if (m.answer) 
		{
			if(m.answer == "refused")
			{				
				alert('Connection refused');
			}
		}
		else if (m.candidate)
		{			
			console.log("Receive Candidate:", m.candidate);
			
			addCanditate(m.candidate);
		}		
		
	});

	/*
	* Signaling events
	*/
	symplClient.on('disconnect', function() {
		console.log('Disconnected from server')
	});

	symplClient.on('error', function(error, message) {
		console.log('Connection error:', error, message)
	});

	symplClient.on('addPeer', function(peer) {
		console.log('Adding peer:', peer)
		
		if(peer.name == "Video Server")
		{
		}
	});

	symplClient.on('removePeer', function(peer) {
		console.log('Removing peer:', peer)
		
		if (remotePeer && remotePeer.id == peer.id) {
			remotePeer = null;
		}
	});

	symplClient.connect();
	
}
/*
function sendLocalCandidate(canditate) {
	symplClient.send({
		to: remotePeer,
		type: 'message',
		candidate: canditate
	});
}
*/

/*
* Creates the WebRTC Peerconnection
*
*/
function createPeerConnection() {
	
	if (currentPeerConnection)
	throw 'The peer connection is already initialized';

	
	currentPeerConnection = new RTCPeerConnection(rtcConfig, rtcOptions);	
	
	//create input data channel
	sendChannel = currentPeerConnection.createDataChannel('data_channel', dataChannelConfig);  
	
	//data channel events
	sendChannel.onmessage = function(e){
		//if we want to receive sth from the server
		//console.log("Data Channel message:", e);
	};
	sendChannel.ondatachannel = function(event) {
		console.log("Data Channel " , event);
	}
	sendChannel.onopen = function(){
		console.log("Data Channel opened");
	}; 
	sendChannel.onclose = function(){
		console.log("Data Channel closed")
	}; 
	sendChannel.onerror = function(){
		console.log("Data Channel error!")
	}
	
	currentPeerConnection.onicecandidate = function(event) {
		if (event.candidate) {		
			//server does not need to know about local candidates
			//console.log("Add local Candidate:", event.candidate);	
			//sendLocalCandidate(event.candidate);
		} else {
			console.log("Candidate gathering complete");
		}
	};
	
	currentPeerConnection.ontrack  = function(event) {
		
		console.log("Remote stream added", event);
		
		//set incoming stream as source for the video object
		document.getElementById("StreamPlayer").srcObject = event.streams[0];
		
		activeStream = event.stream;
	};
	currentPeerConnection.onremovestream = function(event) {
		console.log('remote stream removed', event);
		//video.stop();
		document.getElementById("StreamPlayer").srcObject = '';
	};

	currentPeerConnection.onicegatheringstatechange  = function() { 
		console.log('onicegatheringstatechange :', currentPeerConnection.iceGatheringState);		
	};
}

/*
* Add an ICE candidate or buffer it if no remote description was received
*
*/
function addCanditate(candidate){
	if(!currentPeerConnection || !currentPeerConnection.remoteDescription || !currentPeerConnection.remoteDescription.type){
		
		candidateBuffer.push(candidate);		
		console.log("Buffer candidate: " + candidate);
	} else {
		recvRemoteCandidate(candidate);
	}	
}
/*
* Sends the local SDP to the server
*
*/
function sendLocalSDP(desc) {
	console.log('Send answer:', JSON.stringify(desc));
	symplClient.send({
		'to': remotePeer,
		'type': 'message',
		'answer': desc,
	});
}
/*
* Handles remote SDP from the server
*
*/
function recvRemoteSDP(desc) {
	
	console.log('receive remote sdp')
	
	if (!desc || !desc.type || !desc.sdp)
		throw 'Invalid remote SDP';

	currentPeerConnection.setRemoteDescription(
		new RTCSessionDescription(desc), function() {
			
			console.log("remote sdp success");
			
			if(desc.sdp.indexOf("a=mid:video") < 0)
			{
				//Set a var, or dow whatever you want Ranjan, this indicates that this client is just a virtuall controller
				console.log("Input only");
			}
			//Empty candidate buffer
			var i;
			for(i = 0; i < candidateBuffer.length; i++)	{
				recvRemoteCandidate(candidateBuffer[i]);
			}
			candidateBuffer = [];
			
			//send clients answer to the server
			sendAnswer();
		},
		function(message) {
			//An error has occured -> close connection
			console.error("sdp error: " + message);
		}
	);
	
}
/*
* Create local SDP and send it to the server
*
*/
function sendAnswer()
{
	currentPeerConnection.createAnswer(	
		function(desc) { // success
			
			//add b line if necessary
			if(desc.sdp.indexOf("b=AS:30") < 0)	{
				var StartIndex = desc.sdp.indexOf("m=application");
				StartIndex = desc.sdp.indexOf("\r\n" , StartIndex);
				
				var First = desc.sdp.slice(0,StartIndex);
				var Last = desc.sdp.slice(StartIndex);
				
				desc.sdp = First + "\r\nb=AS:30" + Last; //\r\nb=TIAS:30
			}
			
			//add bitrate settings
			desc.sdp = desc.sdp.replace("a=fmtp:96" , "a=fmtp:96 x-google-min-bitrate=1000\r\na=fmtp:96 x-google-start-bitrate=100000\r\na=fmtp:96 x-google-max-bitrate=5000000\r\na=fmtp:96");
			
			currentPeerConnection.setLocalDescription(desc);
			sendLocalSDP(desc);
		},
		function() { // error			
			console.error("sdp error: ");
		},
		null // mediaConstraints
	);
}
/*
* Send local SDP to the server
*
*/
function sendLocalCandidate(candidate) {
		
	symplClient.send({
		to: remotePeer,
		type: 'message',
		candidate: candidate
	});
}
/*
* Receive remote ICE candidate
*
*/
function recvRemoteCandidate(candidate) {
	
	console.log("Add Candidate:", candidate);
	
	if (!currentPeerConnection)
		throw 'The peer connection is not initialized';

	currentPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
/*
* Game stuff
*
*/
var sendStack="";

		
			var stack = [];
			var loading=0;
			var previousStack="";
		
		//send Game data to data channel through the player engine 
		function sendDataToChannel(data){
			
			sendChannel.send(data)
		}
		
		function updateStack(eventName,input){
			
			console.log('updateStack ' + eventName,input);
			
			stack[stack.length]=input;			
			if(eventName!="m"){
				sendStack+=eventName+""+input[eventName]+";";				
				sendDataToChannel(sendStack);
			
				clearStack();
			}
			if(eventName=="m"){
				loading++;					
				if(sendStack=="undefined")
					sendStack="";					
				previousStack=sendStack;
				
				sendStack+="MN"+input.mx+","+input.my+";";	
				function sendD(){
					if(sendStack!==previousStack && sendStack!==""){								
						sendDataToChannel(sendStack);
						clearStack();	
						clearInterval(interval);
					}
				}
				//send data in chunks instead of individual points
				 interval=setInterval(sendD,200);
			}
		}
		
		//handling events such as keypress, keyup, keydown, mousemove, mousclick
        function handleEvent(eventName,eventInput){
			
			
				
			var currentInput={ 
							   "ku":  "",
							   "kd":  "",
							   "mx" :  "",
							    "my" :  "",
							   "mc":  ""
							  };
			if(eventName!="m")
				currentInput[eventName]=eventInput;
			else{
				currentInput.mx=eventInput[0];
				currentInput.my=eventInput[1];
			}
			if(stack.length==0 || JSON.stringify(stack[stack.length-1])!==JSON.stringify(currentInput))				
				updateStack(eventName,currentInput);
		}
		
		//empty stack
		function clearStack(){
			stack=[];
			sendStack="";
			loading=0;
		}
    