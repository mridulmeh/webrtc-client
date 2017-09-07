var config={};
function virtualJoystickOutput(gamePadConfig){
	
       config=gamePadConfig;
	   
}

function receiveInput(inVal){
	config.sendDataToChannel(inVal)
}

        // A $( document ).ready() block.
        $( document ).ready(function() {
           setImage();
        });

       

        function width(){
            return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
        }
        function height(){
            return window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
        }

        function setImage(){
            if(width() < height()){
                alert('Please view in landscape mode only!!');
                $('#baseImg').hide();
            }else{
                $('#baseImg').show();
                $('#baseImg').height(height());
                $('#baseImg').width(width());

                var stickWidth = $('#Left_Stick')[0].getBoundingClientRect().width;
                var positionLS,positionRS;

                var widthLS = $('#Left_Stick')[0].getBBox().x/2;
                widthLS += $('#Left_Stick')[0].getBoundingClientRect().left ;

                var widthRS = $('#Left_Stick')[0].getBBox().x/2;
                widthRS += $('#Right_Stick')[0].getBoundingClientRect().left;
                console.log(stickWidth);
                switch (true) {
                    case stickWidth >= 200:
                        positionLS = {left: (widthLS * 1.165 )+'px', top: height() * 0.445 + 'px'};
                        positionRS = {left: (widthRS * 1.07)+'px', top: height() * 0.625 + 'px'};
                        break;
                    case stickWidth < 200 && stickWidth >= 185:
                        positionLS = {left: (widthLS * 1.09 )+'px', top: height() * 0.445 + 'px'};
                        positionRS = {left: (widthRS * 1.04)+'px', top: height() * 0.625 + 'px'};
                        break;
                    case stickWidth < 185 && stickWidth >= 170:
                        positionLS = {left: (widthLS * 1.07 )+'px', top: height() * 0.445 + 'px'};
                        positionRS = {left: (widthRS * 1.035)+'px', top: height() * 0.625 + 'px'};
                        break;
                    case stickWidth < 170 && stickWidth >= 155:
                        positionLS = {left: (widthLS * 1.09)+'px', top: height() * 0.443 + 'px'};
                        positionRS = {left: (widthRS * 1.03)+'px', top: height() * 0.625 + 'px'};
                        break;
                    case stickWidth < 155 && stickWidth >= 140:
                        positionLS = {left: (widthLS * 1.035 )+'px', top: height() * 0.445 + 'px'};
                        positionRS = {left: (widthRS * 1.017)+'px', top: height() * 0.625 + 'px'};
                        break;
                    case stickWidth < 140 && stickWidth >= 125:
                        positionLS = {left: (widthLS * 1.022 )+'px', top: height() * 0.445 + 'px'};
                        positionRS = {left: (widthRS * 1.01)+'px', top: height() * 0.625 + 'px'};
                        break;
                    case stickWidth < 125 && stickWidth >= 110:
                        positionLS = {left: (widthLS )+'px', top: height() * 0.443 + 'px'};
                        positionRS = {left: (widthRS )+'px', top: height() * 0.625 + 'px'};
                        break;
                    case stickWidth < 110 && stickWidth >= 80:
                        positionLS = {left: (widthLS * 0.975 )+'px', top: height() * 0.443 + 'px'};
                        positionRS = {left: (widthRS *0.980)+'px', top: height() * 0.625 + 'px'};
                        break;
                    case stickWidth < 80:
                        positionLS = {left: (widthLS * 0.963 )+'px', top: height() * 0.443 + 'px'};
                        positionRS = {left: (widthRS * 0.967)+'px', top: height() * 0.625 + 'px'};
                        break;                  
                }

                var Left_Stick =  nipplejs.create({
                    zone: document.getElementById('leftStickNipple'),
                    mode: 'static',
                    position: positionLS,
                    size: stickWidth 
                    // color: 'red'
                });
                
                var Right_Stick =  nipplejs.create({
                    zone: document.getElementById('rightStickNipple'),
                    mode: 'static',
                    position: positionRS,
                    size: stickWidth 
                    // color: 'red'
                });
            }
            
            
        }

 function X_button_clicked(ele){
            $('#X_button_highlight').finish().show();
            $('#X_button_highlight').hide('fast');
			receiveInput(0)
        }

        function Y_button_clicked(ele){
            $('#Y_button_highlight').finish().show();
            $('#Y_button_highlight').hide('fast');
			receiveInput(1)
        }

        function A_button_clicked(ele){
            $('#A_button_highlight').finish().show();
            $('#A_button_highlight').hide('fast');
			receiveInput(2)
        }

        function B_button_clicked(ele){
            $('#B_button_highlight').finish().show();
            $('#B_button_highlight').hide('fast');
			receiveInput(3)
        }

        function up_clicked(){
            $('#Up_').finish().css('fill-opacity','1');
            $("#Up_").animate({'fill-opacity': "0"});
            // $('#up_clicked').css('fill-opacity','0')
			receiveInput(0)
        }

        function down_clicked(){
            $('#Down_').finish().css('fill-opacity','1');
            $("#Down_").animate({'fill-opacity': "0"});
			receiveInput(0)
            // $('#up_clicked').css('fill-opacity','0')
        }

        function right_clicked(){
            $('#Right_').finish().css('fill-opacity','1');
            $("#Right_").animate({'fill-opacity': "0"});
			receiveInput(0)
            // $('#up_clicked').css('fill-opacity','0')
        }

        function left_clicked(){
            $('#Left_').finish().css('fill-opacity','1');
            $("#Left_").animate({'fill-opacity': "0"});
			receiveInput(0)
            // $('#up_clicked').css('fill-opacity','0')
        }

        function switcher_key_clicked(){
            $('#Switcher_Pressed').finish().show();
            $('#Switcher_Pressed').hide('fast');
			receiveInput(0)
        }

        function menu_key_clicked(){
            $('#Menu_Pressed').finish().show();
            $('#Menu_Pressed').hide('fast');
			receiveInput(0)
        }

        function LT_Clicked(ele){
            $(ele).find('path').attr('fill','#e5e5e5');
            $(ele).find('path').finish().hide().show('fast');
            $(ele).find('path').attr('fill','#1A1A1A');
			receiveInput(0)
        }

        function RT_Clicked(ele){
            $(ele).find('path').attr('fill','#e5e5e5');
            $(ele).find('path').finish().hide().show('fast');
            $(ele).find('path').attr('fill','#1A1A1A');
			receiveInput(0)
        }
