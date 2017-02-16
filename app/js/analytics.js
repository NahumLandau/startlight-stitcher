

var MP = {

	initMixPanel: function(token){

		(function(e,b){if(!b.__SV){var a,f,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
		for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=e.createElement("script");a.type="text/javascript";a.async=!0;a.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";f=e.getElementsByTagName("script")[0];f.parentNode.insertBefore(a,f)}})(document,window.mixpanel||[]);
		
		mixpanel.init(token, {api_host: "https://api.mixpanel.com"});
		console.log("mixpanel token", token)
	},	


	// User Data Analytics


	sendUserInfo: function(formAfterQuestions){

		if(MP.isMixPanel){
			var userProps  = {
				$name : app.user.fullName  || '',
				'FB ID' : app.user.FBuid  || '',
				$email : app.user.mail  || '',
				$phone : app.user.phone  || '',
				$first_name: app.user['First Name'] || '',
	      		$last_name: app.user['Last Name'] || '',
	      		'FB Gender': app.user['FB Gender'] || '',
	      		'FB Locale': app.user['FB Locale'] || '',
	      		'FB Link': app.user['FB Link'] || '',
	      		'FB Timezone': app.user['FB Timezone'] || '',
	      		'FB Photo URL': app.user['FB Photo URL'] || ''
			}

			mixpanel.people.set(userProps);	

			if(formAfterQuestions){
				mixpanel.identify(app.user.id);
				mixpanel.track("User Profile Updated");
			}
		}		

		if(MP.isMorpheus){

			var userProps  = {};
			addProperty('Name', app.user.fullName);
			addProperty('Email', app.user.mail);
			addProperty('Phone', app.user.phone);
			addProperty('FirstName', app.user['First Name']);
			addProperty('LastName', app.user['Last Name']);
			addProperty('Facebook', app.user.FBuid, 'ID');

			function addProperty(prop, value, child){
				if(value != "" && value != undefined){
					if(child){
						userProps[prop] = {child : value};
					}else{
						userProps[prop] = value
					}						
				}
			};	

			if(!$.isEmptyObject(userProps)){
				js2n.Morpheus.updateUserProfile(JSON.stringify(userProps));
				console.log("Morpheus.updateUserProfile" , JSON.stringify(userProps))
			}
		}		
	},



	// Feature Analytics


	StartStoryline: function(storylineName, questionsLength){

		var properties = {
			'Account ID' : MP.accountID,
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength
		}

		if(MP.isMorpheus){
			js2n.Morpheus.emit( "Start Questionnaire", JSON.stringify(properties));
			console.log("js2n.Morpheus.emit("+"\"Start Questionnaire\",", JSON.stringify(properties), ")");
		}
		if(MP.isMixPanel){
			mixpanel.register(MP.superProps);
			mixpanel.identify(app.user.id);
			console.log("Start Questionnaire",app.user.id)
			mixpanel.track("Start Questionnaire",properties);
		}
		
		
		// ga('send', 'event',GA.category , 'Start Questionnaire' ,GA.getLabel(properties));
	},

	CompleteStoryline: function(storylineName, questionsLength, introImagesLength, hasloginForm, hasFBLogin){

		var properties = {
			'Account ID' : MP.accountID,
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
			'Has intro screens' : introImagesLength > 0 ? 'yes' : 'no'
		}
		if(hasloginForm == false && hasFBLogin == false){
			properties['Has login'] = 'no';
		}else{
			properties['Has login'] = 'yes';
		}

		if(MP.isMorpheus){
			js2n.Morpheus.emit( "Complete Questionnaire", JSON.stringify(properties));
			console.log( "Complete Questionnaire", JSON.stringify(properties))
		}
		if(MP.isMixPanel){
			mixpanel.track("Complete Questionnaire",properties);
		}
		
		// ga('send', 'event', GA.category , 'Complete Questionnaire' ,GA.getLabel(properties));
	},

	StartLogin: function(storylineName, questionsLength, hasloginForm, hasFBLogin){
		var properties = {
			'Account ID' : MP.accountID,
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
		}

		properties['Login type'] = GA.getLoginType(hasloginForm, hasFBLogin);

		if(MP.isMorpheus){
			js2n.Morpheus.emit( "Start Login", JSON.stringify(properties));
			console.log("Start Login", JSON.stringify(properties))
		}
		if(MP.isMixPanel){
			mixpanel.track("Start Login",properties);
		}
		
		// ga('send', 'event', GA.category , 'Start Login' ,GA.getLabel(properties));
	},

	LoginSuccess: function(hasloginForm, hasFBLogin, storylineName, questionsLength){
		var properties = {
			'Account ID' : MP.accountID,
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
		}

		properties['Login type'] = GA.getLoginType(hasloginForm, hasFBLogin);

		if(MP.isMorpheus){
			js2n.Morpheus.emit( "Login Success", JSON.stringify(properties));
			console.log("Login Success", JSON.stringify(properties))
		}
		if(MP.isMixPanel){
			mixpanel.track("Login Success",properties);
		}
		
		// ga('send', 'event', GA.category , 'Login Success' ,GA.getLabel(properties));
	},

	LoginDenied: function(hasloginForm, hasFBLogin, storylineName, questionsLength, errorMsg){
		var properties = {
			'Account ID' : MP.accountID,
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
			'Error message' : errorMsg
		}
		
		properties['Login type'] = GA.getLoginType(hasloginForm, hasFBLogin);

		if(MP.isMorpheus){
			js2n.Morpheus.emit( "Login Denied", JSON.stringify(properties));
			console.log("Login Denied", JSON.stringify(properties))
		}
		if(MP.isMixPanel){
			mixpanel.track("Login Denied",properties);
		}
		
		// ga('send', 'event', GA.category , 'Login Denied' ,GA.getLabel(properties));
	},

	ViewScreen: function(screenName, questionNumber, introImageNumber, storylineName, questionsLength, screenNumber){
		var properties = {
			'Account ID' : MP.accountID,
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
			'Screen Name' : screenName, 
			'Question Number' : questionNumber, 
			'Intro Image Number' : introImageNumber, 
			'Screen Number' : screenNumber
		}

		if(MP.isMorpheus){
			js2n.Morpheus.emit( "View Screen", JSON.stringify(properties));
			console.log("js2n.Morpheus.emit("+"\"View Screen\",", JSON.stringify(properties), ")");
		}
		if(MP.isMixPanel){
			mixpanel.track("View Screen",properties);
		}
		
		// ga('send', 'event', GA.category , 'View Screen' ,GA.getLabel(properties));
	},

	getLoginType: function(formLogin, fbLogin){
		var loginType = '';

		if(formLogin == true && fbLogin == true){
			loginType = 'Custom Login + Facebook Login';

		}else if(formLogin == true && fbLogin == false){
			loginType = 'Custom Login';

		}else if(formLogin == false && fbLogin == true){
			loginType = 'Facebook Login';
		}
		return loginType;
	}



}