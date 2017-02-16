
var test = "nahum";
var app = {

	isLocalhost: location.host === "localhost",
	currentQuestion: 1,
	currentFlipedQuestion: 'front',
	questionsCount: 3,
	isFlipping : false,
	currentFlippedDeg: 0,
	ENV : "pro",
	window_width: null,
	window_height: null,
	slideWidth: null,
	swipeInitialized: false,
	thisDataItemID: 0,
	nowAtForm: false,
	devicePosition: null, 
	
	/*
	screenSizeSettings: function(width, height){
		console.log('width: '+ width+', height: ' + height)
		if(app.window_width < width && app.window_height > height){
			console.log('in if - new_width: '+ width+', new_height: ' + height + ', app_width: '+ app.window_width+', app_height: ' + app.window_height)
			app.window_width = app.slideWidth = width;
			app.startApp('landscape', width);
		}else{
			console.log('in else - new_width: '+ width+', new_height: ' + height + ', app_width: '+ app.window_width+', app_height: ' + app.window_height)
			app.window_width = app.slideWidth = width;
			app.startApp('portrait', width);
		}
	},
	*/
	onReady : function(){
		app.getUserJson();
		
		$(window).resize(function(){
			var imageType;
		    if(this.resizeTO) clearTimeout(this.resizeTO);
		    app.thisDataItemID = $('#swiper_pages li.hover').attr('data-index');
		    $( ".swiper_img_div" ).css("display", "none");
		    if(app.devicePosition == 'landscape')
			{
				imageType = ".swiper_img_landscape";
			}
			else if(app.devicePosition == 'portrait')
			{
				imageType = ".swiper_img";
			}
		    $(imageType+'[data-item-id='+app.thisDataItemID+']').parent().css("display", "block");
		    /*
		    this.resizeTO = setTimeout(function() {
		        $(this).trigger('resizeEnd');
		    }, 500);
		});
		$(window).bind('resizeEnd', function(){
			*/
			//$( ".swiper_img[data-item-id="+$thisDataItemID+"]" ).css("display", "block");
			var $thisDataItemID = app.thisDataItemID;
			var width = $(this).width();
			var height = $(this).height();
			//console.log('42:in resize - width: '+ width+', height: ' + height);
			//app.screenSizeSettings(width, height);
			/*
			$( ".swiper_img_div" ).each(function( index ) {
				var indicator = $(this).css("transform");
				if(indicator == 'matrix(1, 0, 0, 1, 0, 0)' || indicator == 'none'){
					$thisDataItemID = $(this).children().attr("data-item-id");
				}
				else if(indicator == 'matrix(1, 0, 0, 1, -180, 0)' && $(this).next().css("transform") == 'matrix(1, 0, 0, 1, 598, 0)')
				{
					$thisDataItemID = $(this).next().children().attr("data-item-id");
				}
			});
			*/
			
			if(app.window_width < width && app.window_height > height){
				//console.log('45:in if - app_width: '+ app.window_width+', app_height: ' + app.window_height);
				app.slideWidth = width;
				app.devicePosition = 'landscape';
				app.startApp('landscape', width, $thisDataItemID);
				$('.form_screen').addClass('landscape');
			}else if(app.window_width == width && $('.form_screen').hasClass('landscape')){
				return;
			}else{
				//console.log('49:in else - app_width: '+ app.window_width+', app_height: ' + app.window_height);
				app.slideWidth = width;
				app.devicePosition = 'portrait';
				app.startApp('portrait', width, $thisDataItemID);
				$('.form_screen').removeClass('landscape');
			}
			app.window_width = width;
			app.window_height = height;
			//console.log('55:new properties - app_width: '+ app.window_width+', app_height: ' + app.window_height + ', app.slideWidth: ' + app.slideWidth);
		});
		
		
		$('.send_form_btn a').on('click', this.validateForm);
		$('.form_container input').on('keydown', function(){
			$('.show_errors').hide();
			$('.form_container input').removeClass('error');
		});
		$('#agree_terms').on('change', function(){
			if($(this).is(':checked')){
				$(this).removeClass('error');
			}
		});
		$('.sign_in_fb').on('click', this.loginToFB);
		

		if(app.isLocalhost || app.ENV == "dev"){
			$('#name').val('nahum');
			$('#phone').val('1234567');
			$('#mail').val('nahum@slash.co.il');
			$('#agree_terms').attr('checked', true);
		}
	},

	getUserJson : function(){
		// json.extensions.slash_settings
		if(app.isLocalhost){
			var jsonFileName = getParameterByName('json');
			if(jsonFileName != ''){
	
				$.ajax({
					url: '//199.203.217.171/storyline/2.0/admin/api/getJson.php',
					type: 'GET',
					dataType: 'jsonp',
					data: {json: jsonFileName},
					success: function(json){
						if(json.images_for_swipe[0] != null){
							app.setUserJson(json);
						}else{
							app.setDefaultSwipe();
						}
					}
				});
				
			}else{
				app.setDefaultSwipe();
			}
		} else {
			window.Applicaster.question.getQuestion()
			.then(function (question) {	       
				app.setUserJson(question.extensions.slash_settings);
			})
			.catch(function (reason) {
			    console.log(reason);
			    app.setDefaultSwipe();
			});
		}
	},

	setUserJson : function(json){

		var images_swipe = '';

		for(var i = 0; i < json.images_for_swipe.length; i++){
			var $this = json.images_for_swipe[i];
			images_swipe += createSwipeImageForm($this.portrait, $this.landscape);
		}

		$('.swiper').append(images_swipe);

		app.setStartBtn();

		console.log (json.settings.form_ending_screen_text);

		$('.container, .introduction_screen').css('background-color', json.settings.form_bg_color);
		$('.form_bg').css('background-image', 'url("'+json.settings.background_image+'")');
		$('.start_btn a, .send_form_btn a').css('background-color', json.settings.form_btn_color);
		$('.start_btn a').html(json.settings.form_btn_start_text);
		$('.thank_text').html(json.settings.form_ending_screen_text);
		
		var style = '<style>';
		style += '.input-field input:focus {border-bottom: 1px solid '+json.settings.form_btn_color+' !important;box-shadow: 0 1px 0 0 '+json.settings.form_btn_color+' !important;}';
		style += '.input-field input:focus + label {color: '+json.settings.form_btn_color+' !important;}';
		style += '.input-field input[type="checkbox"]:checked + label:before{border-right: 2px solid '+json.settings.form_btn_color+' !important;border-bottom: 2px solid '+json.settings.form_btn_color+' !important;}';
		style += '.input-field input[type="checkbox"] + label a {color: '+json.settings.form_btn_color+' !important;}';
		style += '</style>';
		$('head').append(style);



		$('label[for=name]').html(json.registration_form.form_label_for_name);
		$('label[for=phone]').html(json.registration_form.form_label_for_phone);
		$('label[for=mail]').html(json.registration_form.form_label_for_email);
		if(json.registration_form.form_label_for_link_to_terms == "")
		{
			$('label[for=agree_terms]').html('I agree the <a href="http://www.google.com" target="_blank">terms.</a>');
		}
		else
		{
			$('label[for=agree_terms]').html('<a target="_blank">'+json.registration_form.form_label_for_link_to_terms+'</a>');
		}
		$('label[for=agree_terms]').find('a').attr('href', json.registration_form.form_link_to_terms);
		$('.send_form_btn a').html(json.registration_form.form_btn_send_text);
		
		app.questions = json.question_urls;
		app.errorMsg = json.registration_form.form_error_text;
		console.log(app.errorMsg);
	},


	setDefaultSwipe : function(){
		var images_swipe = '';
		for(var i = 1; i < 6; i++)
		{
			images_swipe += '<div class="swiper_img_div"><img src="images/0' + i + '.jpg" class="swiper_img" /><img src="images/landscape_0' + i + '.jpg" class="swiper_img_landscape" /></div>';
		}
		$('.swiper').append(images_swipe);
		app.setStartBtn();
		
	},

	setStartBtn: function(){
		var btn = $('<div class="start_btn"><a class="waves-effect waves-light btn">Start</a></div>');
		$('#swiper_container').append(btn);
		$('.start_btn').on('click', this.showFormScreen);

		$('.container').imagesLoaded()
		  	.always( function( instance ) {
		    	app.startApp();
		  	});

		
	},

	startApp : function(devicePosition, new_window_width, activeItemID){
		//console.log('devicePosition: '+devicePosition+', new_window_width: '+new_window_width);
		var imageType;
		var initialPositionX = 0;
		var swipeDistanceX = 0;
		var currentPage = 0;
		var slideDirection = 0;
		var maxPages = 0;
		var slideWidth = (new_window_width == undefined) ? $(window).width() : new_window_width;
		//console.log('slideWidth: '+slideWidth+', new_window_width: '+new_window_width+' - '+ typeof new_window_width);
		var maxPerspective = (new_window_width == undefined) ? $(window).width() : new_window_width;
		var maxBrightness = 0; // 0.2
		var maxAngle = 45;
		var maxScale = 1.2;
		
		if(app.devicePosition == 'landscape')
		{
			imageType = ".swiper_img_landscape";
			$(".swiper_img_landscape").show();
			$(".swiper_img").hide();
		}
		else if(app.devicePosition == 'portrait')
		{
			imageType = ".swiper_img";
			$(".swiper_img_landscape").hide();
			$(".swiper_img").show();
		}
		var checkBeforeCss = true;
		$( imageType ).each(function( index ) {
			
			if(activeItemID == undefined)
			{
				if (index == 0) {
					$(this).css("-webkit-transform", "perspective("+maxPerspective+"px) rotateY(0deg) scale(1)");
				} else {
					$(this).css("-webkit-transform", "perspective("+maxPerspective+"px) rotateY(-"+maxAngle+"deg) scale("+maxScale+")");
				}
			}
			else
			{
				if(activeItemID == index || index == 0)
				{
					$(this).css("-webkit-transform", "perspective("+maxPerspective+"px) rotateY(0deg) scale(1)");
					if(activeItemID == index) checkBeforeCss = false;
				}
				else 
				{
					if(checkBeforeCss)
					{
						$(this).css("-webkit-transform", "perspective("+maxPerspective+"px) rotateY(0deg) scale(1)");
					}
					else if(!checkBeforeCss)
					{
						$(this).css("-webkit-transform", "perspective("+maxPerspective+"px) rotateY(-"+maxAngle+"deg) scale("+maxScale+")");
					}
				}
			}
			
			$(this).attr("data-item-id", index);
			maxPages = index;
		});
		
		var checkBefore = true;
		$( ".swiper_img_div" ).each(function( index ) {
			if(activeItemID == undefined)
			{
				if (index == 0) {
				} else {
					$(this).css("-webkit-transform", "translate("+slideWidth+"px, 0px)");
				}
			}
			else
			{
				if(activeItemID == index)
				{
					$(this).css("-webkit-transform", "translate("+(0)+"px, 0px)");
					//$(this).css("display", "block");
					checkBefore = false;
					currentPage = parseInt(activeItemID);
				}
				else if(activeItemID != index && checkBefore == true)
				{
					//$(this).css("display", "none");
					$(this).css("-webkit-transform", "translate("+(-slideWidth/2)+"px, 0px)").css("display", "block");
					//$(this).css("display", "block");
				}
				else if(activeItemID != index && checkBefore == false)
				{
					//$(this).css("display", "none");
					$(this).css("-webkit-transform", "translate("+slideWidth+"px, 0px)").css("display", "block");
					//$(this).css("display", "block");
				}
			}
		});
		
		
		if(!app.swipeInitialized){
			app.swipeInitialized = true;
		}else{
			$("#swiper_container").swipe("destroy");
		}
		
		/*---------------------------------------*/
		$("#swiper_container").swipe( {
			swipeStatus:function(event, phase, direction, distance, duration, fingers)
			{
				var swipingImg;
				var backgroundImg;
				
				if (slideDirection == "right") {
					swipingImg = $(imageType+"[data-item-id='"+(currentPage)+"']");
					backgroundImg = $(imageType+"[data-item-id='"+(currentPage-1)+"']");
				} else if (slideDirection == "left") {
					swipingImg = $(imageType+"[data-item-id='"+(currentPage+1)+"']");
					backgroundImg = $(imageType+"[data-item-id='"+(currentPage)+"']");
				}
	
				var slideTransform = "";
				var slideLeft;
				var backgroundNextTransform = "";
				var backgorundImageLeft;
				var backgorundImageBrightness;
	
				if (phase == "start") {
	
					initialPositionX = (!event.pageX) ? event.changedTouches[0].clientX : event.pageX;
					
				} else if (phase == "end") {
					
					if (currentPage == maxPages && slideDirection == "left") {
						slideDirection = "";
						$(backgroundImg).parent().css("-webkit-transform", "translate(0px, 0px)");
						return;
					}
	
					$(swipingImg).parent().css("-webkit-transition", "all 0.4s ease-out");
					$(backgroundImg).parent().css("-webkit-transition", "all 0.4s ease-out");
	
					if (slideDirection == "left") {
						if (swipeDistanceX < -100) {
							slideTransform = "perspective("+maxPerspective+"px) rotateY( 0deg ) scale(1)";
							$(swipingImg).parent().css("-webkit-transform", "translate("+0+"px, 0px)");
							$(backgroundImg).parent().css("-webkit-transform", "translate("+(-slideWidth/2)+"px, 0px)");
							$(backgroundImg).parent().css("-webkit-filter", "brightness("+maxBrightness+")");
							currentPage ++;
							var $this = $("ul").find("[data-index='" + currentPage + "']").addClass('hover');
							$this.prev().removeClass('hover');
						} else {
							slideTransform = "perspective("+maxPerspective+"px) rotateY(-"+maxAngle+"deg) scale("+maxScale+")";
							$(swipingImg).parent().css("-webkit-transform", "translate("+slideWidth+"px, 0px)");
							$(backgroundImg).parent().css("-webkit-transform", "translate("+(0)+"px, 0px)");
							$(backgroundImg).parent().css("-webkit-filter", "brightness(1)");
						}
	
					} else if (slideDirection == "right") {
						if (swipeDistanceX < 100 || currentPage == 0) {
							slideTransform = "perspective("+maxPerspective+"px) rotateY( 0deg ) scale(1)";
							$(swipingImg).parent().css("-webkit-transform", "translate("+0+"px, 0px)");
							$(backgroundImg).parent().css("-webkit-transform", "translate("+(-slideWidth/2)+"px, 0px)");
							$(backgroundImg).parent().css("-webkit-filter", "brightness("+maxBrightness+")");
						} else {
							slideTransform = "perspective("+maxPerspective+"px) rotateY(-"+maxAngle+"deg) scale("+maxScale+")";
							$(swipingImg).parent().css("-webkit-transform", "translate("+slideWidth+"px, 0px)");
							$(backgroundImg).parent().css("-webkit-transform", "translate("+(0)+"px, 0px)");
							$(backgroundImg).parent().css("-webkit-filter", "brightness(1)");
							currentPage --;
							var $this = $("ul").find("[data-index='" + currentPage + "']").addClass('hover');
							$this.next().removeClass('hover');
						}
	
					}
					slideDirection = "";

					if(currentPage  >= maxPages){
						setTimeout(function(){
							$('.start_btn').show();
							setTimeout(function(){
								if(currentPage >= maxPages){
									$('.start_btn').find('a').css('opacity',1);
									$('#swiper_pages').hide();
								}							
							},1000);
						},500);
						
						
					}else{
						// setTimeout(function(){
						// 	$('.start_btn').find('a').css('opacity',0)
						// 	setTimeout(function(){
						// 		if(currentPage < maxPages){
						// 			$('.start_btn').hide();
						// 		}							
						// 	},0)
						// },500)
						
					}
					
				} else if (phase == "move") {
					swipeDistanceX =  (event.pageX == 0 || event.pageX == undefined) ? event.changedTouches[0].clientX -initialPositionX : event.pageX -initialPositionX;
					//$("#tracer").html('initialPositionX: ' +initialPositionX+ '<br/>'+'event.changedTouches[0].clientX: ' +event.changedTouches[0].clientX+ '<br/>'+'swipeDistanceX: ' +swipeDistanceX+ '<br/>');
					if (slideDirection == "") {
						if (swipeDistanceX > 0) {
							slideDirection = "right";
						} else {
							slideDirection = "left";
						}
						
					}
					
					//$("#tracer").html ("maxPages: "+maxPages);
					if (currentPage == maxPages && slideDirection == "left") {
	
						var left = (swipeDistanceX/slideWidth)*slideWidth;
						left *= 0.25;
						left = Math.floor(left);
						if (left > 0) {
							left = 0;
						}
	
						$(backgroundImg).parent().css("-webkit-transform", "translate("+left+"px, 0px)");						
						return;
	
					} else {
						$(swipingImg).parent().css("-webkit-transition", "all 0.1s ease-out");
						$(backgroundImg).parent().css("-webkit-transition", "all 0.1s ease-out");

						var angle = (-swipeDistanceX/slideWidth)*maxAngle+(slideDirection == "left" ? -maxAngle : 0);
						if (angle < -maxAngle) {
							angle = -maxAngle;
						}
						if (angle > 0) {
							angle = 0;
						}
						angle = Math.floor(angle);
						var scale = (swipeDistanceX/slideWidth)*(maxScale-1)+(slideDirection == "left" ? maxScale : 0);
						if (scale < 1) {
							scale = 1;
						}
						if (scale > maxScale) {
							scale = maxScale;
						}
						scale = Math.floor(scale*10)/10;
	
						slideLeft = (swipeDistanceX/slideWidth)*slideWidth+(slideDirection == "left" ? slideWidth : 0);
						if (slideLeft < 0) {
							slideLeft = 0;
						}
						if (slideLeft > slideWidth) {
							slideLeft = slideWidth;
						}
						slideLeft = Math.floor(slideLeft);
						if (slideDirection == "right" && currentPage == 0) {
							slideLeft = 0;
						}
	
						backgorundImageLeft = -(slideWidth-slideLeft)/2;
						backgorundImageBrightness = 1-((slideWidth-slideLeft)/slideWidth)*(1-maxBrightness);
	
						backgorundImageBrightness = Math.floor(backgorundImageBrightness*100)/100;
						
						slideTransform = "perspective("+maxPerspective+"px) rotateY("+angle+"deg) scale("+scale+")";
						backgroundNextTransform = "perspective("+maxPerspective+"px) rotateY("+angle+"deg) scale("+scale+")";
					}
					
				}
	
				if (slideTransform != "") {
					$(swipingImg).css("-webkit-transform", slideTransform);
					if (typeof (slideLeft) != "undefined") {
						$(swipingImg).parent().css("-webkit-transform", "translate("+slideLeft+"px, 0px)");
					}
				}
				if (backgroundNextTransform != "") {
					$(backgroundImg).parent().css("-webkit-transform", "translate("+backgorundImageLeft+"px, 0px)");
					$(backgroundImg).parent().css("-webkit-filter", "brightness("+backgorundImageBrightness+")");
				}
	
			},
			threshold: 0
		});
		
		if(new_window_width == undefined)
		{
			var counter_slide = maxPages;
			if(counter_slide > 0)
			{
				
				while(counter_slide >= 0)
				{
					$('#swiper_pages ul').prepend('<li data-index="'+counter_slide+'"><span></span></li>');
					if(counter_slide == 0)
					{
						$("ul").find("[data-index='" + counter_slide + "']").addClass('hover');
					}
					counter_slide--;
				}
			}
		}
		
		setTimeout(function(){
			app.setSwipeImagesCenterAlign();
			$('.loader').fadeOut(function(){
				if(!app.nowAtForm) $('.introduction_screen').show().animate({opacity:1, visibility:'visible'},400);
				$('.swiper img').animate({opacity:1, visibility:'visible'});
			});

			setTimeout(function(){
				$('.screen:not(".thank_page"):not(".introduction_screen")').show();
			},500);
			
		},1000);
		
	},
	
	setSwipeVerticalAlign: function(){
		var imageSizes = [];
		$('.swiper_img_div').each(function(index, el) {
			imageSizes.push($(el).height());
		});

		var minImageHeight = Math.max.apply(Math, imageSizes);
		var alignTop = (($(window).height() - minImageHeight) /2);
		$('#wrapper').css('top', alignTop);
	},

	setSwipeImagesCenterAlign: function(){
		console.log('in')
		$('.swiper_img_div img').each(function(index, el) {
			var imageWidth = $(el).width();
			var screenWidth  = app.window_width;
			//$(el).css('left', -(imageWidth - screenWidth) /2);
			$(el).css('left', 0);
		});
	},

	setQuestion: function(){

		if(app.currentQuestion <= app.questionsCount && !app.isFlipping){

			app.isFlipping = true;

			if(app.isLocalhost){
				app.questions = [
					'http://localhost/projects/Applicaster/starlight/grid/1.1/template/index.html',
					// 'http://localhost/projects/Applicaster/starlight/round/1.1/template/index.html',
					// 'http://localhost/projects/Applicaster/starlight/list/1.1/template/index.html'
				];
			}

			var showParam = app.isLocalhost ? '?'+btoa('show_answered_indication')+'=1' : '&' + btoa('show_answered_indication') +'=1';
			var questionSelector = app.currentFlipedQuestion == 'front' ? 'front' : 'back';
			$('.' + questionSelector + ' iframe').attr('src', app.questions[app.currentQuestion-1].link_to_question + showParam);

			// Flip the question
			setTimeout(function(){
				$('.flip-container .flipper').css({'-webkit-transform': 'rotateY('+app.getRotateDeg()+'deg)'});
				// alert($('.flip-container .flipper').css('transform'))

				setTimeout(function(){
					app.isFlipping = false;
				},1600);			
			},app.currentQuestion == 1 ? 0 : 5000);		
						
			// Add 1 to counter
			app.currentQuestion ++;

			// Set the currnet side in the flip
			app.currentFlipedQuestion = app.currentFlipedQuestion == 'front' ? 'back' : 'front';			

		}else{
			// If the question is flipping now, try every 250ms to load the new question
			if(app.currentQuestion <= app.questionsCount && app.isFlipping){
				setTimeout(function(){
					app.setQuestion();
				},250);

			}else if(app.currentQuestion > app.questionsCount){
				setTimeout(function(){
					app.showThankPage();
				},5000);
			}
		}		
	},

	showThankPage: function(){
		var questionSelector = app.currentFlipedQuestion == 'front' ? 'front' : 'back';
		$('.' + questionSelector + ' iframe').remove();
		$('.thank_page').show().appendTo('.' + questionSelector + ' .question').css('opacity', 1);
		$('.flip-container .flipper').css({transform: 'rotateY('+app.getRotateDeg()+'deg)'});
	},

	showFormScreen: function(){
		$('.introduction_screen').css({'-webkit-transform': 'translate(0,'+(-($('.form_screen').height()+50))+'px)', 'transform': 'translate(0,'+(-($('.form_screen').height()+50))+'px)',opacity:0});
		app.nowAtForm = true;
		
		$('.screen:not(".thank_page"):not(".introduction_screen")').show().css('opacity',1);
		app.setQuestion();
	},

	getRotateDeg: function(){
		var currDeg = app.currentFlippedDeg;
		app.currentFlippedDeg = (app.currentFlippedDeg + 180);
		return currDeg;
	},

	validateForm: function(fnc){
		var hasError 		= false;

		app.user = {};
		app.user.fullName 	= $('#name').val();
		app.user.phone 		= $('#phone').val(); 
		app.user.mail 		= $('#mail').val(); 
		app.user.FBuid  	= "";
		app.user.FBName  	= "";		
		app.user.token 		= ""; 
		
		app.showFormError( "",'',"");

		if(!hasError && app.user.fullName  == ""){
			app.showFormError( "#name",'input',null);
			hasError = true;
		}

		if(!hasError && (app.user.phone  == "" || !validatePhoneOrCellular(app.user.phone))){
			app.showFormError( "#phone",'input',null);
			hasError = true;
		}

		if(!hasError && (app.user.mail  == "" || !validateEmail(app.user.mail))){
			app.showFormError( "#mail",'input',null);
			hasError = true;
		}

		if(!hasError && !$('#agree_terms').is(':checked')){
			app.showFormError( "#agree_terms",'input',null);
			hasError = true;
		}

		if (!hasError) {

			$('.show_errors').hide();
			$('.form_container input').removeClass('error');
			// app.setQuestion();
			// setTimeout(function(){
				$('.form_screen').css({'-webkit-transform': 'translate(0,'+(-($('.form_screen').height()+50))+'px)', 'transform': 'translate(0,'+(-($('.form_screen').height()+50))+'px)',opacity: 0});
			// },1000)			
		}
	},

	loginToFB: function(){
		app.user = {};
		app.user.fullName 	= "";
		app.user.phone 		= ""; 
		app.user.mail 		= ""; 
		app.user.FBuid  	= "";
		app.user.FBName  	= "";	

		if(window.Applicaster != undefined && window.Applicaster != null ){
			if(window.Applicaster.JS2Native != undefined && window.Applicaster.JS2Native != null){

				Applicaster.JS2Native.FB.login(function (response) {
			      	// alert("response: " + JSON.stringify(response));
			      	if(response.status == "unkown"){
			      		// alert("Please approve the Facebook application");
			      		app.showFormError( null, null ,'Please approve the Facebook application');
			      	}
			      	app.user.token = response.token;

			      	$.get('https://graph.facebook.com/me/?access_token=' + app.user.token , function(data) {
			      		app.user.FBuid = data.id;
			      		app.user.fullName = data.first_name +" " + data.last_name;
			      		trace(app.user.fullName);

			      		$('.form_screen').css({'-webkit-transform': 'translate(0,'+(-($('.form_screen').height()+50))+'px)', 'transform': 'translate(0,'+(-($('.form_screen').height()+50))+'px)',opacity: 0});
					});	

			    });	
			}
		}
	},

	showFormError: function(selector, type, msg){
		msg = msg == null ? app.errorMsg : msg;  // Client Text From JSON
		console.log(msg);
		$('.show_errors').show().find('span').html(msg);
		$('.form_container input').removeClass('error');
		$(selector).addClass('error');
	},

	getUSerRegisterinfo: function(){
		return app.user;
	}
};

$(document).ready(function(){
	$('.introduction_screen, .swiper img').hide().css('opacity',0);
	app.onReady();
	app.window_width = $(window).width();
	app.window_height = $(window).height();
	if(app.window_width > app.window_height)
	{
		$('.form_screen').addClass('landscape');
		app.devicePosition = 'landscape';
	}
	else
	{
		app.devicePosition = 'portrait';
	}
});

function validatePhoneOrCellular (val) {
    var regEx = /^[0-9-]+$/;
    return (regEx.test(val));
}

function validateEmail (val) {
    var emailRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return (emailRegex.test(val));
}

function getParameterByName(name){
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function createSwipeImageForm(url_portrait, url_landscape){
	if(url_portrait != null && url_landscape != null)
	{
		var markup = '<div class="swiper_img_div">';
		if(url_portrait == '') url_portrait = 'images/portrait_holder.png';
		markup += '<img src="' + url_portrait + '" class="swiper_img" />';
		if(url_landscape == '') url_landscape = 'images/landscape_holder.png';
		markup += '<img src="' + url_landscape + '" class="swiper_img_landscape" />';
		markup += '</div>';
		return markup;
	}
}

function trace(str) {
	if (getQuerystringParamValue("debug") == "1") {
		$("body").append ("<div style='color: white;background-color:red;position:fixed;top:0;z-index:999999999;'>"+str+"</div>");
	}
}


window.onerror = function(errorMsg, fileLocation, lineNumber) {
	var errorStr = "Javascript error!";
	errorStr += "\nError: "+errorMsg;
	errorStr += "\nFile: "+fileLocation;
	errorStr += "\nline: "+lineNumber;
	trace (errorStr);
};

function getQuerystringParamValue (param) {
    var queryStr = window.location.search.substring(1);
    var queryArr = queryStr.split("&");
    for (var i=0; i<queryArr.length; i++) {
        var key = queryArr[i].split("=")[0];
        var val = queryArr[i].split("=")[1];
        if (key == param) {
            return val;
        }
    }
    return null;
}