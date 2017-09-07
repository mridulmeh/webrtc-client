var sendStack="";

//Initializing the Symple Game Data handling Constructor
    Symple.game = Symple.Class.extend({
		//initializing the game with the player
		init:function(player){
			this.player = player;
			this.stack = [];
			this.loading=0;
			this.previousStack="";
		},
		//send Game data to data channel through the player engine 
		sendDataToChannel:function(data){
			
			this.player.engine.sendChannel.send(data)
		},
		
		updateStack :function(eventName,input){			
			this.stack[this.stack.length]=input;			
			if(eventName!="m"){
				sendStack+=eventName+""+input[eventName]+";";				
				this.sendDataToChannel(sendStack);
			
				this.clearStack();
			}
			if(eventName=="m"){
				this.loading++;					
				if(sendStack=="undefined")
					sendStack="";					
				previousStack=sendStack;
				
				sendStack+="MN"+input.mx+","+input.my+";";	
				function sendD(thisE){
					if(sendStack!==previousStack && sendStack!==""){								
						thisE.sendDataToChannel(sendStack);
						thisE.clearStack();	
						clearInterval(this.interval);
					}
				}
				//send data in chunks instead of individual points
				 this.interval=setInterval(sendD,200,this);
			}
		},
		//handling events such as keypress, keyup, keydown, mousemove, mousclick
        handleEvent : function(eventName,eventInput){
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
			if(this.stack.length==0 || JSON.stringify(this.stack[this.stack.length-1])!==JSON.stringify(currentInput))				
				this.updateStack(eventName,currentInput);
		},
		
		//empty stack
		clearStack: function(){
			this.stack=[];
			sendStack="";
			this.loading=0;
		}
    })
	
	
