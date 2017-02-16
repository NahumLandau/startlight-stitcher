
var GA = {

	category : 'Questionnaire',

	init: function(accountID){

	  	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  	ga('create', accountID, 'auto');
	  	ga('send', 'pageview');

	  	GA.initialized = true;
	},	

	getLabel: function(props){
		var keys = Object.keys(props),
		label = '';

		for (var i = 0; i < keys.length; i++) {
			label += keys[i] + ' = ' + props[keys[i]] + ';';
		};
		return label;
	},

	StartStoryline: function(storylineName, questionsLength){

		var properties = {
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength
		}

		ga('send', 'event',GA.category , 'Start Questionnaire' ,GA.getLabel(properties));
	},

	CompleteStoryline: function(storylineName, questionsLength, introImagesLength, hasloginForm, hasFBLogin){

		var properties = {
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
			'Has intro screens' : introImagesLength > 0 ? 'yes' : 'no'
		}
		if(hasloginForm == false && hasFBLogin == false){
			properties['Has login'] = 'no';
		}else{
			properties['Has login'] = 'yes';
		}

		console.log(GA.getLabel(properties))
		ga('send', 'event', GA.category , 'Complete Questionnaire' ,GA.getLabel(properties));
	},

	StartLogin: function(storylineName, questionsLength, hasloginForm, hasFBLogin){
		var properties = {
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
		}

		properties['Login type'] = GA.getLoginType(hasloginForm, hasFBLogin);

		console.log(GA.getLabel(properties))
		ga('send', 'event', GA.category , 'Start Login' ,GA.getLabel(properties));
	},

	LoginSuccess: function(hasloginForm, hasFBLogin, storylineName, questionsLength){
		var properties = {
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
		}

		properties['Login type'] = GA.getLoginType(hasloginForm, hasFBLogin);

		console.log(GA.getLabel(properties))
		ga('send', 'event', GA.category , 'Login Success' ,GA.getLabel(properties));
	},

	LoginDenied: function(hasloginForm, hasFBLogin, storylineName, questionsLength, errorMsg){
		var properties = {
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
			'Error message' : errorMsg
		}
		
		properties['Login type'] = GA.getLoginType(hasloginForm, hasFBLogin);


		console.log(GA.getLabel(properties))
		ga('send', 'event', GA.category , 'Login Denied' ,GA.getLabel(properties));
	},

	ViewScreen: function(screenName, questionNumber, introImageNumber, storylineName, questionsLength, screenNumber){
		var properties = {
			'Questionnaire name' : storylineName, 
			'Number of Questionnaire Questions' : questionsLength, 
			'Screen Name' : screenName, 
			'Question Number' : questionNumber, 
			'Intro Image Number' : introImageNumber, 
			'Screen Number' : screenNumber
		}

		ga('send', 'event', GA.category , 'View Screen' ,GA.getLabel(properties));
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
