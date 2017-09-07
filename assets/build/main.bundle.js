

// Siganling client
let symplClient = void 0;
let remotePeer = void 0;
// The current peerconnection
let currentPeerConnection = void 0;
// Buffers ICE candidates
let candidateBuffer = [];

// The current game stream
let activeStream = void 0;
// The Data Channel used to transmit inputs
let sendChannel = void 0;

/*
* Input
*
*/
let checkRightClick = 0;
const checkMouseMove = 0;
let checkClick = 0;

const rtcConfig = {

  iceServers: [{ urls: 'stun:188.40.109.185:7917' }],

  // iceCandidatePoolSize:10,
  bundlePolicy: 'max-bundle',
  // rtcpMuxPolicy: "negotiate"
};

const dataChannelConfig = {
  ordered: false, // can be set to true but needs testing
  maxRetransmits: 6, // can lety, but must not be to high as lost inputs get outdated prety fast
  protocol: 'udp',
  reliable: false, // unreliable is important for fast inputs
};
// maybe used later
// let certParams = {name: 'ECDSA', namedCurve: 'P-256'};

const rtcOptions = {
  optional: [
    // { DtlsSrtpKeyAgreement: true },
    // {'googIPv6': true}
  ],
};

$(document).ready(() => {
  // helper function

  const RADIUS = 2;

  function degToRad(degrees) {
    const result = Math.PI / 180 * degrees;
    return result;
  }

  // setup of the canvas

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  const x = 50;
  const y = 50;

  function canvasDraw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.beginPath();
    ctx.arc(x, y, RADIUS, 0, degToRad(360), true);
    ctx.fill();
  }
  canvasDraw();

  // pointer lock object forking for cross browser

  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

  canvas.onclick = function () {
    // canvas.requestPointerLock();
  };

  // pointer lock event listeners


  // console.log(screen.width)
  // if(screen.width<1200){
  // alert("game switch")
  // $(".onlySmall").click();
  // }
  $('.connected').click(() => {
    canvas.requestPointerLock();
  });

  // Connect to server and start stream;
  $('.player1 #ConnectBtn').click(() => {
    $('#StreamPlayer').css('display', 'block');
    $('#ConnectBtn').hide();
    $('#playerName').hide();
    canvas.requestPointerLock();
    startGame();
  });
  $('.player2 #ConnectBtn').click(() => {
    $('#StreamPlayer').css('display', 'block');
    $('.player2').css('display', 'none');
    $('#ConnectBtn').hide();

    startGame();
  });
});
/** Function to initialize the game */
function initGame() {
  window.mobileAndTabletcheck = function () {
    let check = false;
    (function (a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    }(navigator.userAgent || navigator.vendor || window.opera));
    return check;
  };

  $('.left')[0].style.zIndex = 100;
  $('.right')[0].style.zIndex = 100;

  if (window.mobileAndTabletcheck()) {
    let newjoystick = void 0;
    const joystick = new VirtualJoystick({
      container: document.body,
      mouseSupport: true,
      limitStickTravel: true,

      strokeStyle: 'cyan',
    });
    joystick.addEventListener('touchStartValidation', (event) => {
      const touch = event.changedTouches[0];
      if (touch.pageX >= window.innerWidth / 2) return false;
      return true;
    });

    newjoystick = new VirtualJoystick({
      container: document.body,
      limitStickTravel: true,
      mouseSupport: true,
      strokeStyle: 'orange',
    });
    newjoystick.addEventListener('touchStartValidation', (event) => {
      const touch = event.changedTouches[0];
      if (touch.pageX < window.innerWidth / 2) return false;
      return true;
    });
    // handleEvent('L',joystick.deltaX()+","+joystick.deltaY());
    newjoystick.addEventListener('touchStart', () => {});

    newjoystick.addEventListener('touchEnd', () => {});
    joystick.addEventListener('touchStart', () => {

      // handleEvent('L',joystick.deltaX()+","+joystick.deltaY());
    });
    joystick.addEventListener('touchEnd', () => {});
    joystick.addEventListener('touchMove', () => {});

    let previousDeltaX = 0;
    let previousDeltaY = 0;
    let previousNewDeltaX = 0;
    let previousNewDeltaY = 0;

    setInterval(() => {
      if (joystick.deltaX() != previousDeltaX || joystick.deltaY() != previousDeltaY) {
        previousDeltaX = joystick.deltaX;
        previousDeltaY = joystick.deltaY;
        handleEvent('L', `${Math.floor(joystick.deltaX()) / 100},${Math.floor(joystick.deltaY()) / 100}`);
      }
      if (newjoystick.deltaX() != previousNewDeltaX || newjoystick.deltaY() != previousNewDeltaY) {
        previousNewDeltaX = newjoystick.deltaX;
        previousNewDeltaY = newjoystick.deltaY;
        handleEvent('R', `${Math.floor(newjoystick.deltaY()) / -100},${Math.floor(newjoystick.deltaX()) / 100}`);
      }
    }, 1 / 30 * 1000);
  }

  $('.video-player').css('cursor', 'none');
  $('.video-player').mousedown((e) => {
    if (e.button == 2) {
      checkRightClick++;
      if (checkRightClick == 1) handleEvent('MD', 2); else if (checkRightClick == 5) {
        checkRightClick = 0;
      }
      //  return false;
    }
    // return true;
  });

  $('.video-player').mouseup((e) => {
    // if( e.button == 2 ) {
    checkRightClick++;
    if (checkRightClick == 1) handleEvent('MU', e.button); else if (checkRightClick == 5) {
      checkRightClick = 0;
    }
    //  return false;
    // }
  });

  $('.video-player').on('click', (event) => {
    checkClick++;
    if (checkClick == 1 && event.button == 0) {
      handleEvent('MD', 0);
    } else if (checkClick == 5) {
      checkClick = 0;
    }

    event.preventDefault();
  });
  /*
 $(".video-player").on("mousemove",function(e){

 	//let newMouseCoordinates=[Math.floor((originalMouseCoordinates[0]-e.pageX)/($(".video-player")[0].clientWidth*0.05))*0.1,Math.floor((originalMouseCoordinates[1]-e.pageY)/($(".video-player")[0].clientHeight*0.05))*0.1];
 	let newMouseCoordinates=[Math.floor(originalMouseCoordinates[0]-e.pageX),Math.floor(originalMouseCoordinates[1]-e.pageY)];
 	checkMouseMove++;
 	if(checkMouseMove==1){
 		handleEvent('m',newMouseCoordinates);
 	}
 	else if(checkMouseMove==5){
 		checkMouseMove=0;
 	}
 });
 */

  $(document).on('keypress', (event) => {
    handleEvent('kd', event.key);
  });

  $(document).on('keyup', (event) => {
    handleEvent('ku', event.key);
  });
  document.oncontextmenu = function () {
    return false;
  };
}
function loadGameInit() {
  console.log('Loading');
  let ht = screen.height;
  let wt = screen.width;

  if (ht > wt) {
    const temp = wt;
    wt = ht;
    ht = temp;
  }
  $.ajax({
    url: 'loadGame',
    method: 'POST',
    data: { ht, wt },
    success: function success(response) {
      console.log('Load........');
      console.log(response);
    },
  });
  // $.ajax({
  // url:'login/Mridu;',
  // method:'GET',
  // success:function(response){
  // console.log('login........')
  // console.log(response);
  // }
  // });
}
function startGame() {
  loadGameInit();
  initGame();
  createPeerConnection();
  initSymple();
  changeToFullScreen();
}
/*
* Connects to the signaling server
*/
function initSymple() {
  const gameURL = `${window.location.href.substr(0, window.location.href.indexOf(':', 10))}:` + '4501';
  const clientConfig = {
    url: gameURL,
  };
  clientConfig.peer = {
    user: $('#playerName').val(),
    name: $('#playerName').val(),
    group: 'public',
  };
  $.post(`${window.location.href.substr(0, window.location.href.indexOf(':', 10))}:` + '4500' + '/setJoystick', { config: clientConfig.peer }, (res) => {
    // if(virtualJs!=res){
    // virtualJs=res;
    // console.log(virtualJs)
    // }
    console.log(res);
  });
  // Init Client
  symplClient = new Symple.Client(clientConfig);

  symplClient.on('announce', (peer) => {
    console.log('Authentication success:', peer);
  });

  symplClient.on('presence', (p) => {
    console.log('Recv presence:', p);
  });

  symplClient.on('message', (m) => {
    console.log('Recv message:', m);

    if (remotePeer && remotePeer.id != m.from.id) {
      console.log('Dropping message from unknown peer');
      return;
    }

    if (m.offer) {
      console.log('Receive offer:', JSON.stringify(m.offer));

      remotePeer = m.from;
      recvRemoteSDP(m.offer);
    } else if (m.answer) {
      alert('Unexpected answer for one-way streaming');
    } else if (m.candidate) {
      console.log('Receive Candidate:', m.candidate);

      addCanditate(m.candidate);
    }
  });

  /*
 * Signaling events
 */
  symplClient.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  symplClient.on('error', (error, message) => {
    console.log('Connection error:', error, message);
  });

  symplClient.on('addPeer', (peer) => {
    console.log('Adding peer:', peer);

    if (peer.name == 'Video Server') {}
  });

  symplClient.on('removePeer', (peer) => {
    console.log('Removing peer:', peer);

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
  if (currentPeerConnection) throw 'The peer connection is already initialized';

  currentPeerConnection = new RTCPeerConnection(rtcConfig, rtcOptions);

  // create input data channel
  sendChannel = currentPeerConnection.createDataChannel('data_channel', dataChannelConfig);

  // data channel events
  sendChannel.onmessage = function (e) {
    // if we want to receive sth from the server
    // console.log("Data Channel message:", e);
  };
  sendChannel.ondatachannel = function (event) {
    console.log('Data Channel ', event);
  };
  sendChannel.onopen = function () {
    $('.connected').css('display', 'block');
    console.log('Data Channel opened');
  };
  sendChannel.onclose = function () {
    console.log('Data Channel closed');
  };
  sendChannel.onerror = function () {
    console.log('Data Channel error!');
  };

  currentPeerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      // server does not need to know about local candidates
      // console.log("Add local Candidate:", event.candidate);
      // sendLocalCandidate(event.candidate);
    } else {
      console.log('Candidate gathering complete');
    }
  };

  currentPeerConnection.ontrack = function (event) {
    console.log('Remote stream added', event);

    // set incoming stream as source for the video object
    document.getElementById('StreamPlayer').srcObject = event.streams[0];

    activeStream = event.stream;
  };
  currentPeerConnection.onremovestream = function (event) {
    console.log('remote stream removed', event);
    // video.stop();
    document.getElementById('StreamPlayer').srcObject = '';
  };

  currentPeerConnection.onicegatheringstatechange = function () {
    console.log('onicegatheringstatechange :', currentPeerConnection.iceGatheringState);
  };
  setTimeout(() => {}, 10000);
}

/*
* Add an ICE candidate or buffer it if no remote description was received
*
*/
function addCanditate(candidate) {
  if (!currentPeerConnection || !currentPeerConnection.remoteDescription || !currentPeerConnection.remoteDescription.type) {
    candidateBuffer.push(candidate);
    console.log(`Buffer candidate: ${candidate}`);
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
    to: remotePeer,
    type: 'message',
    answer: desc,
  });
}
/*
* Handles remote SDP from the server
*
*/
function recvRemoteSDP(desc) {
  console.log('receive remote sdp');

  if (desc.sdp.indexOf('a=mid:video') < 0) {
    // Set a let, or dow whatever you want Ranjan, this indicates that this client is just a virtuall controller
    console.log('Input only');
  }

  if (!desc || !desc.type || !desc.sdp) throw 'Invalid remote SDP';

  currentPeerConnection.setRemoteDescription(new RTCSessionDescription(desc), () => {
    console.log('remote sdp success');

    // Empty candidate buffer
    let i = void 0;
    for (i = 0; i < candidateBuffer.length; i++) {
      recvRemoteCandidate(candidateBuffer[i]);
    }
    candidateBuffer = [];

    // send clients answer to the server
    sendAnswer();
  }, (message) => {
    // An error has occured -> close connection
    console.error(`sdp error: ${message}`);
  });
}
/*
* Create local SDP and send it to the server
*
*/
function sendAnswer() {
  currentPeerConnection.createAnswer((desc) => {
    // success

    // add b line if necessary
    if (desc.sdp.indexOf('b=AS:30') < 0) {
      let StartIndex = desc.sdp.indexOf('m=application');
      StartIndex = desc.sdp.indexOf('\r\n', StartIndex);

      const First = desc.sdp.slice(0, StartIndex);
      const Last = desc.sdp.slice(StartIndex);

      desc.sdp = `${First}\r\nb=AS:30${Last}`; // \r\nb=TIAS:30
    }

    // add bitrate settings
    desc.sdp = desc.sdp.replace('a=fmtp:96', 'a=fmtp:96 x-google-min-bitrate=1000\r\na=fmtp:96 x-google-start-bitrate=100000\r\na=fmtp:96 x-google-max-bitrate=5000000\r\na=fmtp:96');

    currentPeerConnection.setLocalDescription(desc);
    sendLocalSDP(desc);
  }, () => {
    // error
    console.error('sdp error: ');
  }, null, // mediaConstraints
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
    candidate,
  });
}
/*
* Receive remote ICE candidate
*
*/
function recvRemoteCandidate(candidate) {
  console.log('Add Candidate:', candidate);

  if (!currentPeerConnection) throw 'The peer connection is not initialized';

  currentPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
/*
* Game stuff
*
*/

let stack = [];
let loading = 0;
let previousStack = '';

// send Game data to data channel through the player engine
function sendDataToChannel(data) {
  console.log(data);
  sendChannel.send(data);
}

function updateStack(eventName, input) {
  //	console.log('updateStack ' + eventName,input);

  stack[stack.length] = input;
  if (eventName != 'm') {
    sendStack += `${eventName}${input[eventName]};`;
    sendDataToChannel(sendStack);

    clearStack();
  }
  if (eventName == 'm') {
    const sendD = function sendD() {
      if (sendStack !== previousStack && sendStack !== '') {
        sendDataToChannel(sendStack);
        clearStack();
        clearInterval(interval);
      }
    };
    // send data in chunks instead of individual points


    loading++;
    if (sendStack == 'undefined') sendStack = '';
    previousStack = sendStack;

    sendStack += `MN${input.mx},${input.my};`;
    interval = setInterval(sendD, 200);
  }
}

// handling events such as keypress, keyup, keydown, mousemove, mousclick
function handleEvent(eventName, eventInput) {
  const currentInput = {
    ku: '',
    kd: '',
    mx: '',
    my: '',
    mc: '',
  };
  if (eventName != 'm') currentInput[eventName] = eventInput; else {
    currentInput.mx = eventInput[0];
    currentInput.my = eventInput[1];
  }
  if (stack.length == 0 || JSON.stringify(stack[stack.length - 1]) !== JSON.stringify(currentInput)) updateStack(eventName, currentInput);
}

// empty stack
function clearStack() {
  stack = [];
  sendStack = '';
  loading = 0;
}
function switchToNormal() {}

function changeToFullScreen() {
  const docElm = document.body;
  $('.header').css('opacity', '0.2').css('position', 'absolute');
  $('.footer').css('opacity', '0.1').css('position', 'absolute').css('bottom', '0px');
  $('.video-player').css('height', '100vh');
  $('#locked').css('display', 'block');
  $('.menuDropdown').css('display', 'none');
  $('.menuDropdown').css('height', '0');
  $('#menuDown').css('display', 'block');
  $('#menuUp').css('display', 'none');
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen();
  } else if (docElm.mozRequestFullScreen) {
    docElm.mozRequestFullScreen();
  } else if (docElm.webkitRequestFullScreen) {
    docElm.webkitRequestFullScreen();
  } else if (docElm.msRequestFullscreen) {
    docElm.msRequestFullscreen();
  }
}
function changeToSmallScreen() {}
$(document).keyup((e) => {
  console.log(e.keyCode);
  if (e.keyCode == 9) {
    // escape key maps to keycode `27`
    switchToNormal();
  }
});
let fullScChange = 0;

if (document.addEventListener) {
  document.addEventListener('webkitfullscreenchange', exitHandler, false);
  document.addEventListener('mozfullscreenchange', exitHandler, false);
  document.addEventListener('fullscreenchange', exitHandler, false);
  document.addEventListener('MSFullscreenChange', exitHandler, false);
}

function exitHandler() {
  if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== null) {
    fullScChange++;
    /* Run code on exit */
    if (fullScChange % 2 == 0) {
      console.log('not ');
      $('.header').css('opacity', '0.9').css('position', 'relative').css('display', 'block');
      $('.footer').css('opacity', '0.9').css('position', 'relative').css('display', 'block');
      $('.video-player').css('height', '80vh');
      $('.onlyFull').css('display', 'none');
      $('.onlySmall').css('display', 'block');
      $('#locked').css('display', 'none');
      $('#unlocked').css('display', 'none');

      $('.footerText').css('display', 'none');
    } else {
      console.log('full');
      $('.onlyFull').css('display', 'block');
      $('.onlySmall').css('display', 'none');
      $('#locked').css('display', 'block');

      $('.footerText').css('display', 'block');
    }
  }
}
function lockFullScreen() {
  $('.header').css('display', 'none');

  $('.footer').css('display', 'none');
  $('#unlocked').css('display', 'block');
  const canvas = document.querySelector('canvas');

  // pointer lock object forking for cross browser

  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

  canvas.requestPointerLock();
}
function unlockFullScreen() {}

function showDropdown() {
  if ($('.menuDropdown').css('display') == 'none') {
    $('.menuDropdown').css('display', 'block');

    $('.menuDropdown').animate({ height: '200px' }, 300);
    $('#menuDown').css('display', 'none');
    $('#menuUp').css('display', 'block');
  } else {
    $('.menuDropdown').css('display', 'none');
    $('.menuDropdown').css('height', '0');
    $('#menuDown').css('display', 'block');
    $('#menuUp').css('display', 'none');
  }
}

window.addEventListener('click', (e) => {
  // if((e.target!=$(".menuDropdown")[0] && e.target!=$("#menuUp")[0]) && $(".menuDropdown").css("display")=="block" && e.target!=$("#menuDown")[0])
  // showDropdown();

  // }
});

function showQRCode() {
  // window.addEventListener('click',function(e){
  // if($("#QRCode").css("display")=="flex" && e.target!=("#QRCode") &&  e.target!=("li"))
  // $("#QRCode").css("display","none");
  // })
  $('#QRCode').css('display', 'flex');
  new QRCode(document.getElementById('QRCodeImg'), `${window.location.protocol}/${window.location.host}/joystick/index.html`);
  $('.exitQR').on('click', () => {
    $('#QRCode').css('display', 'none');
  });
}
