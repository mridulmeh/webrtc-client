/*
* Connects to the signaling server
*///Siganling client
var symplClient;
var playerConfig;
var remotePeer;
//The current peerconnection
var currentPeerConnection;
//Buffers ICE candidates
var candidateBuffer = [];

//The current game stream
var activeStream;
//The Data Channel used to transmit inputs
var sendChannel;
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
console.log(window.location.href.substr(0, window.location.href.indexOf(":",10)))
$.get(window.location.href.substr(0, window.location.href.indexOf(":",10))+':'+'4500'+"/getVirtualJoystickOutput",function(res){
						// if(virtualJs!=res){
							// virtualJs=res;
							// console.log(virtualJs)
							// }
							playerConfig=res;
					})
					$(document).ready(function() {
					createPeerConnection();
	initSymple();
					})
function initSymple()
{
	$.get(window.location.href.substr(0, window.location.href.indexOf(":",10))+':'+'4500'+"/getJoystick",function(res){
						// if(virtualJs!=res){
							// virtualJs=res;
							// console.log(virtualJs)
							// }
							console.log(res)
					})
	var gameURL = window.location.href.substr(0, window.location.href.indexOf(":",10))+':'+'4501';
	var clientConfig = {
		url: gameURL,		
	};
	clientConfig.peer=playerConfig
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
			alert('Unexpected answer for one-way streaming');
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
		$(".connected").css("display","block")
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
	console.log(desc.sdp.indexOf("a=mid:video"))
	if(desc.sdp.indexOf("a=mid:video") < 0)
	{
		//Set a var, or dow whatever you want Ranjan, this indicates that this client is just a virtuall controller
		console.log("Input only");
	}
	
	if (!desc || !desc.type || !desc.sdp)
		throw 'Invalid remote SDP';

	currentPeerConnection.setRemoteDescription(
		new RTCSessionDescription(desc), function() {
			
			console.log("remote sdp success");
			
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
function sendDataToChannel(data){
			console.log(data)
			sendChannel.send(data)
		}