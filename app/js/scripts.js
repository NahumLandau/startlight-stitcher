var test = "nahum";

function trace(str) {
    if (getQuerystringParamValue("debug") == "1") {
        var date = new Date();
        var strDate = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        strDate = '';
        if ($(".container").find('.tracer').get(0) == undefined) {
            $(".container").prepend("<div class='tracer' style='color: white;background-color:red;position:realtive;top:65;z-index:999999999;width:100%;'>" + str + "      " + strDate + "</div>")
        } else {
            $(".container").find('.tracer').last().after("<div class='tracer' style='color: white;background-color:red;position:realtive;top:65;z-index:999999999;width:100%;'>" + str + "      " + strDate + "</div>");
        }

    }
}

function sendError(additionalParams, errorMsg, fileLocation, lineNumber) {

    try {
        var lineNumberNum = 0;
        if (!isNaN(lineNumber)) {
            lineNumberNum = new Number(lineNumber);
        }
        if (window.location.href.indexOf("localhost") == -1) {

            var dataToSend = { fileLocation: window.location.href, errorMsg: htmlEncode(errorMsg), jsFileLocation: fileLocation, lineNumber: lineNumber };
            var scriptPath = "https://www.slash.co.il/apps/1/slider/?pageType=SendErrorReport";
            scriptPath += "&" + additionalParams;

            $.ajax({
                url: scriptPath,
                dataType: "jsonp",
                type: "GET",
                data: dataToSend,
                success: function(data) {},
                cache: false
            });
        }
    } catch (e) {
        console.log(e);
    }
}

window.onerror = function(errorMsg, fileLocation, lineNumber) {
    var errorStr = "Javascript error!";
    errorStr += "\nError: " + errorMsg;
    errorStr += "\nFile: " + fileLocation;
    errorStr += "\nline: " + lineNumber;
    trace(errorStr);
    // sendError ("", errorMsg, fileLocation, lineNumber);
};

var app = {

    isLocalhost: (location.host === "localhost"),
    currentQuestion: 1,
    currentFlipedQuestion: 'front',
    questionsCount: 3,
    isFlipping: false,
    currentFlippedDeg: 180,
    ENV: "pro",
    window_width: null,
    window_height: null,
    slideWidth: null,
    swipeInitialized: false,
    thisDataItemID: 0,
    nowAtForm: false,
    devicePosition: null,
    isClosed: false,
    // userInfoCookieName: 'user_info',
    userAnswersCookieName: 'user_answers_info',
    // userRegistered: (getCookie('user_info') != null),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    currentGAViewScreen: 0,
    userAnalytics: 'none',
    user: {},
    answerTrackCookie: 'answers_track',
    userAnswers: {

    },

    onReady: function() {
        app.getUserJson();
        app.setUserID();

        app.userInfoCookieName = app.getUserCookieName();

        $(window).resize(function() {

            var imageType;
            var closedScreenType;

            if (this.resizeTO) clearTimeout(this.resizeTO);

            app.thisDataItemID = $('#swiper_pages li.hover').attr('data-index');
            $(".swiper_img_div").css("display", "none");


            if (app.devicePosition == 'landscape') {
                imageType = ".swiper_img_landscape";
            } else if (app.devicePosition == 'portrait') {
                imageType = ".swiper_img";
            }

            $(imageType + '[data-item-id=' + app.thisDataItemID + ']').parent().css("display", "block");


            var $thisDataItemID = app.thisDataItemID;
            var width = $(this).width();
            var height = $(this).height();

            if (app.window_width < width && app.window_height > height) {
                app.slideWidth = width;
                app.devicePosition = 'landscape';
                if (!app.isClosed) {
                    app.startApp('landscape', width, $thisDataItemID, false);
                } else {
                    app.showQuestionClosed(null, null, 'landscape');
                }
                $('.form_screen').addClass('landscape');

            } else if (app.window_width == width && $('.form_screen').hasClass('landscape')) {
                return;

            } else if (app.window_width > width && app.window_height < height) {
                app.slideWidth = width;
                app.devicePosition = 'portrait';
                if (!app.isClosed) {
                    app.startApp('portrait', width, $thisDataItemID, false);
                } else {
                    app.showQuestionClosed(null, null, 'portrait');
                }
                $('.form_screen').removeClass('landscape');
            }

            app.window_width = width;
            app.window_height = height;
        });


        $('.send_form_btn a').on('click', this.validateForm);
        $('.form_container input').on('keydown', function() {
            $('.show_errors').hide();
            $('.form_container input').removeClass('error');
        });
        $('#agree_terms').on('change', function() {
            if ($(this).is(':checked')) {
                $(this).removeClass('error');
            }
        });
        $('.sign_in_fb').on('click', this.loginToFB);


        if (app.isLocalhost || app.ENV == "dev") {
            $('#name').val('nahum');
            $('#phone').val('1234567');
            $('#mail').val('nahum@slash.co.il');
            $('#agree_terms').attr('checked', true);
        }

        if (getQuerystringParamValue("debug") == '1') {
            function checkApplicatserScriptLoadingTime() {
                setTimeout(function() {
                    if (Applicaster != undefined && js2n != undefined) {
                        //trace('Applicaster scripts loaded')
                    } else {
                        checkApplicatserScriptLoadingTime()
                    }
                }, 250)
            }
            checkApplicatserScriptLoadingTime();

        }
    },

    getUserJson: function() {

        if (app.isLocalhost || (location.host.indexOf('199.203.217') != -1)) {
            var jsonFileName = getParameterByName('json');

            if (jsonFileName == "" || jsonFileName == undefined || jsonFileName == null) {
                jsonFileName = 'default';
            }

            $.ajax({
                // url: '//199.203.217.171/storyline/2.0/admin/api/getJson.php',
                url: '../editor/json/' + jsonFileName + '.json',
                type: 'GET',
                dataType: 'json',
                data: {},
                success: function(json) {

                    app.json = json;
                    app.appliSettings = {
                        text: 'localhost'
                    }


                    app.stitcherInfo = json;
                    app.stitcherInfo.question_key = '12345601';
                    app.setUserJson(json);
                    if (json.images_for_swipe[0] != null) {
                        app.setDefaultSwipe();
                    }

                }
            });

        } else {

            window.Applicaster.question.getQuestion()
                .then(function(question) {
                    //trace("json Loaded")   

                    app.appliSettings = question;
                    app.json = question.extensions.slash_settings;

                    app.stitcherInfo = question;
                    app.setUserJson(question.extensions.slash_settings);
                })
                .catch(function(reason) {
                    // alert(reason);
                    // sendError ("Could not applicaster data: "+reason, "Could not applicaster data", "Questionnaire", 182);
                });
        }
    },

    setUserJson: function(json) {

        if (json.settings.question_status == "closed") {
            app.isClosed = true;
            $('.closed_screen').find('.closed_bg_portrait').css('background-image', 'url(' + json.settings.background_image.portrait + ')');
            $('.closed_screen').find('.closed_bg_landscape').css('background-image', 'url(' + json.settings.background_image.landscape + ')');
            app.showQuestionClosed(json.settings.closed_text, json.settings.closed_text_color, app.devicePosition);
            return;
        }


        var images_swipe = '';

        for (var i = 0; i < json.images_for_swipe.length; i++) {
            var $this = json.images_for_swipe[i];
            images_swipe += createSwipeImageForm($this.portrait, $this.landscape);
        }

        $('.swiper').append(images_swipe);

        app.showForm = json.registration_form.show_form != undefined ? json.registration_form.show_form : true;
        app.showFBLogin = json.registration_form.show_FB_login != undefined ? json.registration_form.show_FB_login : true;
        // app.showFBLogin = false;
        app.showFormBeforeQuestions = json.registration_form.show_form_before_questions != undefined ? json.registration_form.show_form_before_questions : false;
        app.isRtl = json.settings.is_rtl != undefined ? json.settings.is_rtl : false;

        app.mpID = json.settings.mixpanel_token;
        app.gaID = 'UA-71620615-1';
        app.userAnalytics = json.registration_form.user_analytics;


        var cookieParsed = JSON.parse(getCookie(app.userInfoCookieName));
        if (cookieParsed != null) {
            app.userRegistered = (cookieParsed.fullName != undefined);
        } else {
            app.userRegistered = false;
        }

        app.setStartBtn(json.images_for_swipe.length == 1);


        $('.form_bg').find('.form_bg_portrait').attr('src', json.settings.background_image.portrait);
        $('.form_bg').find('.form_bg_landscape').attr('src', json.settings.background_image.landscape);

        $('.start_btn a, .send_form_btn a, .questions_counter').css('background-color', json.settings.form_btn_color);
        $('.send_form_btn a').css('background-color', json.registration_form.form_fields_color);
        $('.start_btn a').html(json.settings.form_btn_start_text);
        $('.thank_text').html(json.settings.form_ending_screen_text);


        $('.popup_header').css('background-color', json.settings.form_btn_color);
        if (app.isIOS) {
            $('.popup_header').css({ height: 55, 'padding-top': 20 });
            $('.popup iframe').css('padding-top', 70);
        }

        if (app.isRtl) {
            $('.thank_text').css('direction', 'rtl');
        }

        var style = '<style>';
        style += '.input-field input:focus {border-bottom: 1px solid ' + json.registration_form.form_fields_color + ' !important;box-shadow: 0 1px 0 0 ' + json.registration_form.form_fields_color + ' !important;}';
        style += '.input-field input:focus + label {color: ' + json.registration_form.form_fields_color + ' !important;}';
        style += '.input-field input[type="checkbox"]:checked + label:before{border-right: 2px solid ' + json.registration_form.form_fields_color + ' !important;border-bottom: 2px solid ' + json.registration_form.form_fields_color + ' !important;}';
        style += '.input-field a {color: ' + json.registration_form.form_fields_color + ' !important;}';
        style += '.input-field input {border-bottom: 1px solid ' + json.registration_form.form_fields_color + ';}';
        style += '.input-field label{color:' + json.registration_form.form_fields_color + '}';
        style += '</style>';

        $('head').append(style);

        $('.or_element .line hr').css('border', '1px solid ' + json.registration_form.form_fields_color);
        $('.or_element .text').css('color', json.registration_form.form_fields_color);



        if (app.mpID == undefined) {
            console.warn("MixPanel ID is Missing.")
        }

        $('label[for=name]').html(json.registration_form.form_label_for_name);
        $('label[for=phone]').html(json.registration_form.form_label_for_phone);
        $('label[for=mail]').html(json.registration_form.form_label_for_email);

        if (json.registration_form.form_label_for_link_to_terms == "") {
            $('label[for=agree_terms]').attr('data-href', 'http://www.google.com').html('I agree the terms.</a>');
        } else {
            $('label[for=agree_terms]').after('<a target="_blank" style="position: relative;top: 4px;">' + json.registration_form.form_label_for_link_to_terms + '</a>');
        }
        var regLink = json.registration_form.form_link_to_terms;
        regLink = (regLink.indexOf("http") == -1) ? "http://" + regLink : regLink;

        $('label[for=agree_terms]').next().attr('data-href', regLink).on('click', function() {
            $('.popup iframe').attr('src', regLink).parent().toggle();
            $('.popup_header').toggle();
        });
        $('.popup_header').on('click', function() {
            $('.popup iframe').attr('src', '').parent().toggle();
            $('.popup_header').toggle();
        })

        $('.form_description span').html(json.registration_form.form_description);
        $('.form_description').css('color', json.registration_form.form_description_color);


        $('.send_form_btn a').html(json.registration_form.form_btn_send_text);

        if (!json.settings.show_questions_counter) {
            $('.flip-container').css('height', '100%');
            $('.questions_counter').hide();
        }


        app.questions = json.question_urls;
        if (app.isLocalhost) {
            app.questions = [
                // {link_to_question: 'http://localhost/projects/Applicaster/starlight/grid/1.3/template/index.html?json=01'},
                // {link_to_question: 'http://localhost/projects/Applicaster/starlight/list/1.3/template/index.html?json=05'},
                // {link_to_question: 'http://localhost/projects/Applicaster/starlight/round/1.1/template/index.html?json=02'},
                // {link_to_question: 'http://localhost/projects/Applicaster/starlight/slider/1.1/template/index.html?json=02'},
                { link_to_question: 'http://localhost/projects/Applicaster/starlight/grid/1.3/template/index.html?json=01', id: 123 },
                { link_to_question: 'http://localhost/projects/Applicaster/starlight/grid/1.3/template/index.html?json=02', id: 456 },
                { link_to_question: 'http://localhost/projects/Applicaster/starlight/grid/1.3/template/index.html?json=03', id: 789 },
                { link_to_question: 'http://localhost/projects/Applicaster/starlight/grid/1.3/template/index.html?json=04', id: 852 },
            ];
        }
        app.questionsCount = app.questions.length;

        app.errorMsg = json.registration_form.form_error_text;
    },


    setDefaultSwipe: function() {
        var images_swipe = '';
        for (var i = 1; i < 4; i++) {
            images_swipe += '<div class="swiper_img_div"><img src="images/0' + i + '.jpg" class="swiper_img" /><img src="images/landscape_0' + i + '.jpg" class="swiper_img_landscape" /></div>';
        }
        $('.swiper').append(images_swipe);

        app.setStartBtn(false);



    },

    getUserCookieName: function() {
        // var appDetails =  JSON.parse(atob(getQuerystringParamValue("appli-payload")));
        var appDetails = JSON.parse(atob(decodeURIComponent(getQuerystringParamValue("appli-payload"))));
        var appID = appDetails.questionUrl.substr(appDetails.questionUrl.lastIndexOf('/') + 1, appDetails.questionUrl.indexOf("json"));
        appID = appID.replace(".json", "");
        return appID;
    },

    setStartBtn: function(showBtnImmediatly) {

        var btn = $('<div class="start_btn"><a class="waves-effect waves-light btn">Start</a></div>');
        if (app.isRtl) btn.css('direction', 'rtl');
        $('#swiper_container').append(btn);

        if (showBtnImmediatly) {
            setTimeout(function() {
                $('.start_btn').show();
                $('.start_btn a , .start_page_text').css('opacity', 1);
            }, 250);
        }

        app.setFormInputs();
        app.setStartText();

        $('.start_btn').on('click', function() {

            if (app.userAnalytics == 'none') {
                app.SkipToQuestionsScreen();

            } else if (app.userAnalytics == 'mixpanel' && app.mpID == '') {
                app.SkipToQuestionsScreen();

            } else if (app.userRegistered || (app.showForm == false && app.showFBLogin == false)) {
                app.SkipToQuestionsScreen();

            } else if (!app.showFormBeforeQuestions) {
                if (getCookie("stitcher_id_" + app.stitcherInfo.question_key) == 'form') {
                    app.showFormScreen('.questions_screen');
                    $('.introduction_screen').fadeOut();
                } else {
                    app.SkipToQuestionsScreen();
                    app.appendFormAfterQuestions();
                }

            } else {
                app.showFormScreen('.introduction_screen');
            }
        });

        $('.container').imagesLoaded()
            .always(function(instance) {
                //trace('Images Loaded')
                app.startApp();
            });
    },

    setStartText: function() {
        var textDiv = '<div class="start_page_text"></div>';
        $('.start_btn').prepend(textDiv);

        var startText = app.isLocalhost ? app.stitcherInfo.settings.start_page_text : app.stitcherInfo.extensions.slash_settings.settings.start_page_text;
        var startColor = app.isLocalhost ? app.stitcherInfo.settings.start_page_color : app.stitcherInfo.extensions.slash_settings.settings.start_page_color;
        $('.start_page_text').html(startText).css('color', startColor);

    },

    getBackgroundBlur: function(url) {

        if (url != undefined && url != "") {
            var blurPosition = url.lastIndexOf('/') + 1;
            url = url.slice(0, blurPosition) + 'blur_' + url.slice(blurPosition + Math.abs(0));
            return url;
        }

        return url;
    },

    startApp: function(devicePosition, new_window_width, activeItemID, isFirstCall) {

        var imageType;
        var initialPositionX = 0;
        var swipeDistanceX = 0;
        var currentPage = 0;
        var slideDirection = 0;
        var maxPages = 0;
        var slideWidth = (new_window_width == undefined) ? $(window).width() : new_window_width;
        var maxPerspective = (new_window_width == undefined) ? $(window).width() : new_window_width;
        var maxBrightness = 0;
        var maxAngle = 45;
        var maxScale = 1.2;
        var gaSlideSent = 1;

        if (app.devicePosition == 'landscape') {
            imageType = ".swiper_img_landscape";
            $(".swiper_img_landscape, .form_bg_landscape").show();
            $(".swiper_img, .form_bg_portrait").hide();
        } else if (app.devicePosition == 'portrait') {
            imageType = ".swiper_img";
            $(".swiper_img_landscape, .form_bg_landscape, .closed_bg_landscape").hide();
            $(".swiper_img, .form_bg_portrait, .closed_bg_portrait").show();
        }
        var checkBeforeCss = true;
        $(imageType).each(function(index) {

            if (activeItemID == undefined) {
                if (index == 0) {
                    $(this).css("-webkit-transform", "perspective(" + maxPerspective + "px) rotateY(0deg) scale(1)");
                } else {
                    $(this).css("-webkit-transform", "perspective(" + maxPerspective + "px) rotateY(-" + maxAngle + "deg) scale(" + maxScale + ")");
                }
            } else {
                if (activeItemID == index || index == 0) {
                    $(this).css("-webkit-transform", "perspective(" + maxPerspective + "px) rotateY(0deg) scale(1)");
                    if (activeItemID == index) checkBeforeCss = false;
                } else {
                    if (checkBeforeCss) {
                        $(this).css("-webkit-transform", "perspective(" + maxPerspective + "px) rotateY(0deg) scale(1)");
                    } else if (!checkBeforeCss) {
                        $(this).css("-webkit-transform", "perspective(" + maxPerspective + "px) rotateY(-" + maxAngle + "deg) scale(" + maxScale + ")");
                    }
                }
            }

            $(this).attr("data-item-id", index);
            maxPages = index;
        });

        var checkBefore = true;
        $(".swiper_img_div").each(function(index) {
            if (activeItemID == undefined) {
                if (index == 0) {} else {
                    $(this).css("-webkit-transform", "translate(" + slideWidth + "px, 0px)");
                }
            } else {
                if (activeItemID == index) {
                    $(this).css("-webkit-transform", "translate(" + (0) + "px, 0px)");
                    checkBefore = false;
                    currentPage = parseInt(activeItemID);
                } else if (activeItemID != index && checkBefore == true) {
                    $(this).css("-webkit-transform", "translate(" + (-slideWidth / 2) + "px, 0px)").css("display", "block");
                } else if (activeItemID != index && checkBefore == false) {
                    $(this).css("-webkit-transform", "translate(" + slideWidth + "px, 0px)").css("display", "block");
                }
            }
        });


        if (!app.swipeInitialized) {
            app.swipeInitialized = true;
        } else {
            $("#swiper_container").swipe("destroy");
        }

        /*---------------------------------------*/

        $("#swiper_container").swipe({
            swipeStatus: function(event, phase, direction, distance, duration, fingers) {
                var swipingImg;
                var backgroundImg;

                if (slideDirection == "right") {
                    swipingImg = $(imageType + "[data-item-id='" + (currentPage) + "']");
                    backgroundImg = $(imageType + "[data-item-id='" + (currentPage - 1) + "']");
                } else if (slideDirection == "left") {
                    swipingImg = $(imageType + "[data-item-id='" + (currentPage + 1) + "']");
                    backgroundImg = $(imageType + "[data-item-id='" + (currentPage) + "']");
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
                            slideTransform = "perspective(" + maxPerspective + "px) rotateY( 0deg ) scale(1)";
                            $(swipingImg).parent().css("-webkit-transform", "translate(" + 0 + "px, 0px)");
                            $(backgroundImg).parent().css("-webkit-transform", "translate(" + (-slideWidth / 2) + "px, 0px)");
                            $(backgroundImg).parent().css("-webkit-filter", "brightness(" + maxBrightness + ")");
                            currentPage++;
                            var $this = $("ul").find("[data-index='" + currentPage + "']").addClass('hover');
                            $this.prev().removeClass('hover');
                        } else {
                            slideTransform = "perspective(" + maxPerspective + "px) rotateY(-" + maxAngle + "deg) scale(" + maxScale + ")";
                            $(swipingImg).parent().css("-webkit-transform", "translate(" + slideWidth + "px, 0px)");
                            $(backgroundImg).parent().css("-webkit-transform", "translate(" + (0) + "px, 0px)");
                            $(backgroundImg).parent().css("-webkit-filter", "brightness(1)");
                        }

                    } else if (slideDirection == "right") {
                        if (swipeDistanceX < 100 || currentPage == 0) {
                            slideTransform = "perspective(" + maxPerspective + "px) rotateY( 0deg ) scale(1)";
                            $(swipingImg).parent().css("-webkit-transform", "translate(" + 0 + "px, 0px)");
                            $(backgroundImg).parent().css("-webkit-transform", "translate(" + (-slideWidth / 2) + "px, 0px)");
                            $(backgroundImg).parent().css("-webkit-filter", "brightness(" + maxBrightness + ")");
                        } else {
                            slideTransform = "perspective(" + maxPerspective + "px) rotateY(-" + maxAngle + "deg) scale(" + maxScale + ")";
                            $(swipingImg).parent().css("-webkit-transform", "translate(" + slideWidth + "px, 0px)");
                            $(backgroundImg).parent().css("-webkit-transform", "translate(" + (0) + "px, 0px)");
                            $(backgroundImg).parent().css("-webkit-filter", "brightness(1)");
                            currentPage--;
                            var $this = $("ul").find("[data-index='" + currentPage + "']").addClass('hover');
                            $this.next().removeClass('hover');
                        }

                    }
                    slideDirection = "";

                    if ((currentPage + 1) > gaSlideSent && isFirstCall != false) {
                        app.GACallMethod('ViewScreen', ['Intro Screen', '', (currentPage + 1), app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);

                        app.MPCallMethod('ViewScreen', ['Intro Screen', '', (currentPage + 1), app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);

                        gaSlideSent++;
                    }

                    if (currentPage >= maxPages) {

                        setTimeout(function() {
                            $('.start_btn').show();
                            setTimeout(function() {
                                if (currentPage >= maxPages) {
                                    $('.start_btn a, .start_page_text').css('opacity', 1);
                                    $('#swiper_pages').hide();
                                }
                            }, 1000);
                        }, 500);


                    } else {

                    }

                } else if (phase == "move") {
                    swipeDistanceX = (event.pageX == 0 || event.pageX == undefined) ? event.changedTouches[0].clientX - initialPositionX : event.pageX - initialPositionX;
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

                        var left = (swipeDistanceX / slideWidth) * slideWidth;
                        left *= 0.25;
                        left = Math.floor(left);
                        if (left > 0) {
                            left = 0;
                        }

                        $(backgroundImg).parent().css("-webkit-transform", "translate(" + left + "px, 0px)");
                        return;

                    } else {
                        $(swipingImg).parent().css("-webkit-transition", "all 0.1s ease-out");
                        $(backgroundImg).parent().css("-webkit-transition", "all 0.1s ease-out");

                        var angle = (-swipeDistanceX / slideWidth) * maxAngle + (slideDirection == "left" ? -maxAngle : 0);
                        if (angle < -maxAngle) {
                            angle = -maxAngle;
                        }
                        if (angle > 0) {
                            angle = 0;
                        }
                        angle = Math.floor(angle);
                        var scale = (swipeDistanceX / slideWidth) * (maxScale - 1) + (slideDirection == "left" ? maxScale : 0);
                        if (scale < 1) {
                            scale = 1;
                        }
                        if (scale > maxScale) {
                            scale = maxScale;
                        }
                        scale = Math.floor(scale * 10) / 10;

                        slideLeft = (swipeDistanceX / slideWidth) * slideWidth + (slideDirection == "left" ? slideWidth : 0);
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

                        backgorundImageLeft = -(slideWidth - slideLeft) / 2;
                        backgorundImageBrightness = 1 - ((slideWidth - slideLeft) / slideWidth) * (1 - maxBrightness);

                        backgorundImageBrightness = Math.floor(backgorundImageBrightness * 100) / 100;

                        slideTransform = "perspective(" + maxPerspective + "px) rotateY(" + angle + "deg) scale(" + scale + ")";
                        backgroundNextTransform = "perspective(" + maxPerspective + "px) rotateY(" + angle + "deg) scale(" + scale + ")";
                    }

                }

                if (slideTransform != "") {
                    $(swipingImg).css("-webkit-transform", slideTransform);
                    if (typeof(slideLeft) != "undefined") {
                        $(swipingImg).parent().css("-webkit-transform", "translate(" + slideLeft + "px, 0px)");
                    }
                }
                if (backgroundNextTransform != "") {
                    $(backgroundImg).parent().css("-webkit-transform", "translate(" + backgorundImageLeft + "px, 0px)");
                    $(backgroundImg).parent().css("-webkit-filter", "brightness(" + backgorundImageBrightness + ")");
                }

            },
            threshold: 0
        });

        if (new_window_width == undefined) {
            var counter_slide = maxPages;
            if (counter_slide > 0) {

                while (counter_slide >= 0) {
                    $('#swiper_pages ul').prepend('<li data-index="' + counter_slide + '"><span></span></li>');
                    if (counter_slide == 0) {
                        $("ul").find("[data-index='" + counter_slide + "']").addClass('hover');
                    }
                    counter_slide--;
                }
            }
        }

        setTimeout(function() {

            $('.introduction_screen').show()
            if (!app.centerCreated) {
                app.centerSwipeImages();
            }

            setTimeout(function() {
                //trace("show app")
                $('.loader').fadeOut(function() {

                    if (isFirstCall != false) {
                        app.GACallMethod('StartStoryline', [app.appliSettings.text, app.json.question_urls.length]);
                        app.GACallMethod('ViewScreen', ['Intro Screen', '', 1, app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);

                        app.MPCallMethod('StartStoryline', [app.appliSettings.text, app.json.question_urls.length]);
                        setTimeout(function() {
                            app.MPCallMethod('ViewScreen', ['Intro Screen', '', 1, app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);
                        }, app.morpheusTimeBetweenCommands);

                    }


                    if (!app.nowAtForm) $('.introduction_screen').animate({ opacity: 1, visibility: 'visible' }, 400);
                    $('.swiper img').animate({ opacity: 1, visibility: 'visible' });

                    if (app.userRegistered || app.showForm == false || !app.showFormBeforeQuestions || app.userAnalytics == 'none' || (app.userAnalytics == 'mixpanel' && app.mpID == '')) {
                        app.setQuestions();
                        if (app.userRegistered) {
                            app.user = JSON.parse(getCookie(app.userInfoCookieName));
                            app.userAnswers = JSON.parse(getCookie(app.userAnswersCookieName));
                        }

                    }
                });
            }, 500)


            setTimeout(function() {
                $('.screen:not(".thank_page"):not(".introduction_screen")').show();
            }, 500);

        }, 1000);

    },

    setSwipeVerticalAlign: function() {
        var imageSizes = [];
        $('.swiper_img_div').each(function(index, el) {
            imageSizes.push($(el).height());
        });

        var minImageHeight = Math.max.apply(Math, imageSizes);
        var alignTop = (($(window).height() - minImageHeight) / 2);
        $('#wrapper').css('top', alignTop);
    },

    getCurrentGAViewScreen: function() {
        app.currentGAViewScreen++;
        return app.currentGAViewScreen;
    },

    setQuestions: function() {

        app.questionParams = app.isLocalhost ? '&show_answered_indication=1' : '&show_answered_indication=1';
        app.questionParams += '&' + 'is_under_stitcher=1';
        app.questionParams += '&' + 'mp_id=' + app.mpID || '';
        app.questionParams += '&' + 'user_analytics=' + app.userAnalytics;
        app.questionParams += '&' + 'debug=' + getQuerystringParamValue("debug") || 0;
        app.questionParams += '&' + 'show_counter=' + app.json.settings.show_questions_counter;


        var trackCookie = getCookie("stitcher_id_" + app.stitcherInfo.question_key);
        if (trackCookie != null && trackCookie != "") {
            if (trackCookie != 'thank_page' && trackCookie != 'form') {
                app.currentQuestion = trackCookie;
                app.startingTrack = trackCookie;
            }
        }

        if (trackCookie == 'thank_page') {
            app.showThankPage('front');
            $('.flip-container').css('height', '100%');
            $('.questions_counter').hide();

            if (isUnderWebView()) {
                setTimeout(function() {
                    js2n.WebView.close();
                }, 4000);
            }

            return;
        }

        if (trackCookie == 'form') {
            return;
        }


        if (app.questionsCount > app.currentQuestion - 1) {
            $('.front iframe').attr('src', app.questions[(app.currentQuestion - 1)].link_to_question + app.questionParams);
        }
        if (app.questionsCount > app.currentQuestion) {
            $('.back iframe').attr('src', app.questions[app.currentQuestion].link_to_question + app.questionParams);
        }

    },

    moveToNextQuestion: function() {

        if (app.currentQuestion <= app.questionsCount && !app.isFlipping) {

            app.GACallMethod('ViewScreen', ['Question Screen', app.currentQuestion, '', app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);
            app.MPCallMethod('ViewScreen', ['Question Screen', app.currentQuestion, '', app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);

            app.saveUserAnswersTrack(app.currentQuestion);
            app.currentQuestion++;
            app.isFlipping = true;
            setTimeout(function() {

                $('.flip-container .flipper').css({ '-webkit-transform': 'rotateY(' + app.getRotateDeg() + 'deg)' });
                app.currentFlipedQuestion = app.currentFlipedQuestion == 'front' ? 'back' : 'front';
                app.startNextQuestion();

                setTimeout(function() {

                    app.isFlipping = false;

                    var nextFlip = app.currentFlipedQuestion == 'front' ? 'back' : 'front';
                    if (app.questions[app.currentQuestion - 1] != undefined) {
                        $('.' + nextFlip + ' iframe').attr('src', app.questions[app.currentQuestion - 1].link_to_question + app.questionParams);
                    } else {
                        app.showThankPage(app.currentFlipedQuestion == 'front' ? 'back' : 'front');
                    }

                }, 1600);

            }, 6000);

        } else if (app.currentQuestion <= app.questionsCount && app.isFlipping) {
            setTimeout(function() {
                app.moveToNextQuestion();
            }, 250)
        } else {
            setTimeout(function() {
                app.showThankPage(app.currentFlipedQuestion == 'front' ? 'back' : 'front', true);
                $('.flip-container .flipper').css({ '-webkit-transform': 'rotateY(' + app.getRotateDeg() + 'deg)' });

                $('.flip-container').css('height', '100%');
                $('.questions_counter').hide();


                app.GACallMethod('ViewScreen', ['Thank You Screen', '', '', app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);
                app.GACallMethod('CompleteStoryline', [app.appliSettings.text, app.json.question_urls.length, app.json.images_for_swipe.length, app.json.registration_form.show_form, app.json.registration_form.show_FB_login]);

                app.MPCallMethod('ViewScreen', ['Thank You Screen', '', '', app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);
                setTimeout(function() {
                    app.MPCallMethod('CompleteStoryline', [app.appliSettings.text, app.json.question_urls.length, app.json.images_for_swipe.length, app.json.registration_form.show_form, app.json.registration_form.show_FB_login]);
                }, app.morpheusTimeBetweenCommands);

               
                     if (isUnderWebView()) {                         
                        setTimeout(function() {
                            if(getCookie("stitcher_id_" + app.stitcherInfo.question_key) == 'thank_page'){
                                js2n.WebView.close();
                            }
                        }, 3000);
                        
                    }
               

            }, 6000)

        }
    },

    startNextQuestion: function() {

        var question = $('.' + app.currentFlipedQuestion + ' iframe')[0].contentWindow;

        // $('.questions_counter span').html((app.currentQuestion == 1 ? 1 : app.currentQuestion-1) + " / " + app.questionsCount);
        $('.questions_counter span').html(app.getQuestionCounter());

        if (question != null) {
            if (question.startQuestionFromStitcher != undefined) {
                question.startQuestionFromStitcher();

                // setTimeout(function(){
                // 	app.setIosScrollByQuestionHeight($('.' + app.currentFlipedQuestion + ' iframe'));
                // }, 1000);

                setTimeout(function() {
                    app.setIosScrollByQuestionHeight($('.' + app.currentFlipedQuestion + ' iframe'));
                }, 5000);

                setTimeout(function() {
                    app.setIosScrollByQuestionHeight($('.' + app.currentFlipedQuestion + ' iframe'));
                }, 10000);
            }

        }
    },

    showQuestionClosed: function(closedText, textColor, devicePosition) {

        if (closedText != null && textColor != null) {
            $('.closed_text').html(closedText).css('color', textColor);
        }

        if (devicePosition == 'portrait') {
            $('.closed_bg_portrait').show();
            $('.closed_bg_landscape').hide();
        } else {
            $('.closed_bg_portrait').hide();
            $('.closed_bg_landscape').show();
        }


        setTimeout(function() {
            $('.loader').fadeOut(function() {
                $('.closed_screen').show().animate({ opacity: 1 }, 400);
            });

            if (isUnderWebView()) {
                setTimeout(function() {
                    js2n.WebView.close();
                }, 3000);
            }
        }, 500)
    },

    getQuestionCounter: function() {

        var currentQ;
        if (app.currentQuestion == 1) {
            currentQ = 1;
        } else if (app.currentQuestion == app.startingTrack) {
            currentQ = app.startingTrack;
        } else {
            currentQ = app.currentQuestion - 1;
        }
        return currentQ + " / " + app.questionsCount;

    },

    saveUserAnswersTrack: function(questionNumber) {
        console.log("saveUserAnswersTrack: ", questionNumber)
            // var questionID = app.questions[questionNumber-1].id;
        var questionarieID = app.stitcherInfo.question_key;
        var cookie = "stitcher_id_" + questionarieID;
        if (questionarieID != undefined) {
            if (getCookie(cookie) == null) {
                setCookie(cookie, (questionNumber), 4800);
            } else {
                if ((questionNumber) > parseInt(getCookie(cookie)) || questionNumber == 'form' || questionNumber == 'thank_page') {
                    setCookie(cookie, (questionNumber), 4800);
                }
            }
        }

    },

    setIosScrollByQuestionHeight: function(questionSelector) {
        var question = questionSelector.contents();
        var questionsHeight = question.find('.container').height();
        var stitcherHeight = $(window).height();
        var questionIsSlider = (questionSelector.attr('src').indexOf('slider') != -1);

        // trace("1: "+questionsHeight +" , "+ stitcherHeight);
        // console.log(questionsHeight, "<=", stitcherHeight)
        if ((questionsHeight <= stitcherHeight) && !questionIsSlider) {
            question.find('body').on('touchstart, touchend, touchmove', function(event) {
                event.preventDefault();
                return false;
            })
        } else {
            question.find('body').unbind('touchstart, touchend, touchmove');
        }
    },

    onQuestionAnswered: function() {
        if (app.currentQuestion == 1 || app.currentQuestion == app.startingTrack) {
            app.currentQuestion++;
            app.GACallMethod('LoginSuccess', [app.json.registration_form.show_form, app.json.registration_form.show_FB_login, app.appliSettings.text, app.json.question_urls.length]);
            app.MPCallMethod('LoginSuccess', [app.json.registration_form.show_form, app.json.registration_form.show_FB_login, app.appliSettings.text, app.json.question_urls.length]);
        }
        app.moveToNextQuestion();
    },

    showThankPage: function(flipSide, complete) {

        if (!app.showFormBeforeQuestions && !app.userRegistered && app.userAnalytics != 'none') {
            if (complete) {
                $('.form_screen').css({ '-webkit-transform': 'translate(0,0)', 'transform': 'translate(0,0)', opacity: 1 });
                app.showFormScreen('.questions_screen');
            }

        } else {
            $('.' + flipSide + ' iframe').remove();
            $('.thank_page').show().appendTo('.' + flipSide + ' .question').css('opacity', 1);
            app.saveUserAnswersTrack('thank_page');


            setTimeout(function() {
                $('.thank_page').on('touchstart, touchend, touchmove', function(event) {
                    event.preventDefault();
                    return false;
                })
            }, 10)

            // if (isUnderWebView()) {
            //     setTimeout(function() {
            //         js2n.WebView.close();
            //     }, 3000);
            // }
        }
    },

    setFormInputs: function() {

        if (app.showForm) {
            if (app.json.registration_form.show_name != undefined) {
                $('#name').parent().css('display', app.json.registration_form.show_name == true ? 'block' : 'none');
            }
            if (app.json.registration_form.show_phone != undefined) {
                $('#phone').parent().css('display', app.json.registration_form.show_phone == true ? 'block' : 'none');
            }
            if (app.json.registration_form.show_mail != undefined) {
                $('#mail').parent().css('display', app.json.registration_form.show_mail == true ? 'block' : 'none');
            }
            if (app.json.registration_form.show_terms != undefined) {
                $('#agree_terms').parent().css('display', app.json.registration_form.show_terms == true ? 'block' : 'none');
            }
        } else {
            $('.form_container').hide();
        }

        if (!app.showFBLogin) {
            $('.sign_in_fb').hide();
        }

        if (app.showForm && app.showFBLogin) {
            $('.or_element').show();
        } else {
            $('.or_element').hide();
        }

        if (app.isRtl) {
            $('.form_container').css('direction', 'rtl');

            $('head').append('<style>.input-field input[type="checkbox"] + label a{right: 50px;position:absolute;}</style>');
            $('head').append('<style>[type="checkbox"] + label[for="agree_terms"] {left: 23px;}</style>');
            $('head').append('<style>[type="checkbox"] + label:before{right:23px;}</style>');
        }

        // .form_screen,
        $(' .popup, .popup iframe').on('touchstart, touchend, touchmove', function(event) {

            event.preventDefault();
            return false;
        })

    },

    morpheusTimeBetweenCommands: 1000,

    showFormScreen: function(currentScreenSelector) {
        $(currentScreenSelector).css({ '-webkit-transform': 'translate(0,' + (-($('.form_screen').height() + 50)) + 'px)', 'transform': 'translate(0,' + (-($('.form_screen').height() + 50)) + 'px)', opacity: 0 });
        app.nowAtForm = true;

        $('.screen:not(".thank_page"):not(".introduction_screen")').show().css('opacity', 1);

        if (currentScreenSelector == '.questions_screen') {
            app.saveUserAnswersTrack('form')
        } else {
            app.setQuestions();
        }


        app.GACallMethod('StartLogin', [app.appliSettings.text, app.json.question_urls.length, app.json.registration_form.show_form, app.json.registration_form.show_FB_login]);
        app.GACallMethod('ViewScreen', ['Login Screen', '', '', app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);

        app.MPCallMethod('StartLogin', [app.appliSettings.text, app.json.question_urls.length, app.json.registration_form.show_form, app.json.registration_form.show_FB_login]);
        setTimeout(function() {
            app.MPCallMethod('ViewScreen', ['Login Screen', '', '', app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);
        }, app.morpheusTimeBetweenCommands);


    },

    SkipToQuestionsScreen: function() {

        $('.introduction_screen, .form_screen').css({ '-webkit-transform': 'translate(0,' + (-($('.form_screen').height() + 50)) + 'px)', 'transform': 'translate(0,' + (-($('.form_screen').height() + 50)) + 'px)', opacity: 0 });

        if (app.showFormBeforeQuestions) {
            app.nowAtForm = true;
        }

        $('.screen:not(".thank_page"):not(".introduction_screen")').show().css('opacity', 1);

        app.onFormSubmited(true);
    },

    appendFormAfterQuestions: function() {
        $('.form_screen').insertBefore('.thank_page');
    },

    getRotateDeg: function() {
        var currDeg = app.currentFlippedDeg;
        app.currentFlippedDeg = (app.currentFlippedDeg + 180);
        return currDeg;
    },

    validateForm: function(fnc) {


        var hasError = false;

        app.user.fullName = $('#name').val();
        app.user.phone = $('#phone').val();
        app.user.mail = $('#mail').val();
        app.user.FBuid = "";
        app.user.FBName = "";
        app.user.token = "";

        app.showFormError("", '', "");

        if (!hasError && app.user.fullName == "" && app.json.registration_form.show_name == true) {
            app.showFormError("#name", 'input', null, "Missing field");
            hasError = true;
        }

        if (!hasError && (app.user.phone == "" || !validatePhoneOrCellular(app.user.phone)) && app.json.registration_form.show_phone == true) {
            var gaMessage = app.user.phone == "" ? "Missing field" : "Wrong field format";
            app.showFormError("#phone", 'input', null, gaMessage);
            hasError = true;
        }

        if (!hasError && (app.user.mail == "" || !validateEmail(app.user.mail)) && app.json.registration_form.show_mail == true) {
            var gaMessage = app.user.mail == "" ? "Missing field" : "Wrong field format";
            app.showFormError("#mail", 'input', null, gaMessage);
            hasError = true;
        }

        if (!hasError && !$('#agree_terms').is(':checked') && app.json.registration_form.show_terms == true) {
            app.showFormError("#agree_terms", 'input', null, "Terms not approved");
            hasError = true;
        }

        if (!hasError) {

            $('.show_errors').hide();
            $('.form_container input').removeClass('error');

            app.onFormSubmited();

        }
    },

    onFormSubmited: function(formSkiped) {
        app.setUserInfo();

        $('.form_screen').css({ '-webkit-transform': 'translate(0,' + (-($('.form_screen').height() + 50)) + 'px)', 'transform': 'translate(0,' + (-($('.form_screen').height() + 50)) + 'px)', opacity: 0 });

        if (app.showFormBeforeQuestions || formSkiped) {
            if (app.currentQuestion <= app.questionsCount) {
                app.startNextQuestion();
                app.GACallMethod('ViewScreen', ['Question Screen', 1, '', app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);

                app.MPCallMethod('ViewScreen', ['Question Screen', 1, '', app.appliSettings.text, app.json.question_urls.length, app.getCurrentGAViewScreen()]);

            }

        } else {
            $('.thank_page').css('opacity', 1).show();
            app.saveUserAnswersTrack('thank_page');

            if (isUnderWebView()) {
                setTimeout(function() {
                    js2n.WebView.close();
                }, 3000);
            }
        }
    },

    setUserID: function() {
        var cookieParsed = JSON.parse(getCookie(app.userInfoCookieName));
        app.user.id = cookieParsed != null ? cookieParsed.id : undefined;

        if (!app.userRegistered && app.user.id == undefined) {
            app.user.id = guid();
        }
    },

    setUserInfo: function() {

        // app.setUserID();

        setCookie(app.userInfoCookieName, JSON.stringify(app.user), 24 * 30 * 12);
        setCookie(app.userAnswersCookieName, JSON.stringify(app.userAnswers), 24 * 30 * 12);

        app.MPCallMethod('sendUserInfo', [!app.showFormBeforeQuestions && app.nowAtForm]);
    },

    loginToFB: function() {

        app.user.fullName = "";
        app.user.phone = "";
        app.user.mail = "";
        app.user.FBuid = "";
        app.user.FBName = "";

        if (window.Applicaster != undefined && window.Applicaster != null) {
            if (window.Applicaster.JS2Native != undefined && window.Applicaster.JS2Native != null) {

                Applicaster.JS2Native.FB.login(function(response) {
                    if (response.status == "unkown") {
                        app.showFormError(null, null, 'Please approve the Facebook application', 'FB error message');
                    }
                    app.user.token = response.token;

                    $.get('https://graph.facebook.com/me/?access_token=' + app.user.token, function(data) {
                        app.user.FBuid = data.id;
                        app.user.fullName = data.first_name + " " + data.last_name;

                        // mixpanel properties per fb user
                        app.user['First Name'] = data.first_name;
                        app.user['Last Name'] = data.last_name;
                        app.user['FB Gender'] = data.gender;
                        app.user['FB Locale'] = data.locale;
                        app.user['FB Link'] = data.link;
                        app.user['FB Timezone'] = data.timezone;
                        app.user['FB Photo URL'] = 'http://graph.facebook.com/' + app.user.FBuid + '/picture?type=square';

                        app.onFormSubmited();
                    });
                });
            }
        }
    },

    showFormError: function(selector, type, msg, gaMessage) {
        msg = msg == null ? app.errorMsg : msg; // Client Text From JSON
        $('.show_errors').show().find('span').html(msg);
        $('.form_container input').removeClass('error');
        $(selector).addClass('error');

        if (gaMessage) {
            app.GACallMethod('LoginDenied', [app.json.registration_form.show_form, app.json.registration_form.show_FB_login, app.json.question_urls.length, app.appliSettings.text, gaMessage]);

            app.MPCallMethod('LoginDenied', [app.json.registration_form.show_form, app.json.registration_form.show_FB_login, app.json.question_urls.length, app.appliSettings.text, gaMessage]);

        }
    },

    getUSerRegisterinfo: function() {
        var userInfo = JSON.parse(getCookie(app.userInfoCookieName));
        return userInfo;
    },

    getGameDuration: function(propName, currGameDuration) {
        if (app.userAnswers[propName] == undefined) {
            app.userAnswers[propName] = { duration: 0, answersCorrect: 0 };
        }
        app.userAnswers[propName].duration = (app.userAnswers[propName].duration + currGameDuration);
        setCookie(app.userAnswersCookieName, JSON.stringify(app.userAnswers), 24 * 30 * 12);
        return app.userAnswers[propName].duration;
    },

    getAnswersCorrect: function(propName, answerCorrect) {
        if (app.userAnswers[propName] == undefined) {
            app.userAnswers[propName] = { duration: 0, answersCorrect: 0 };
        }
        if (answerCorrect) {
            app.userAnswers[propName].answersCorrect++;
        }
        return app.userAnswers[propName].answersCorrect;

    },

    mpUserGuid: guid(),

    getStitcherInfo: function() {
        return app.stitcherInfo;
    },

    centerSwipeImages: function() {

        $('.swiper_img_div').each(function(index, el) {
            if (app.devicePosition == 'portrait') {
                $(el).find('.swiper_img').css('margin-left', -($(el).find('.swiper_img').width() / 2));
                $(el).find('.swiper_img_landscape').css('margin-top', -($(el).find('.swiper_img').height() / 2));

            } else {
                $(el).find('.swiper_img_landscape').css('margin-top', -($(el).find('.swiper_img_landscape').height() / 2))
                $(el).find('.swiper_img').css('margin-left', -($(el).find('.swiper_img_landscape').width() / 2));
            }
        });

        app.centerCreated = true;

    },

    MPCallMethod: function(eventMethod, properties) {


        MP.isMixPanel = app.userAnalytics == 'mixpanel';
        MP.isMorpheus = app.userAnalytics == 'morpheus';
        MP.accountID = app.stitcherInfo.account_id;

        if (app.userAnalytics == 'none') {
            return;
        }

        if (app.userAnalytics == 'mixpanel') {
            if (typeof MP == 'undefined' || app.mpID == undefined) {
                return;
            }

            if (typeof mixpanel == 'undefined') {
                MP.initMixPanel(app.mpID || '');
            }
        }


        if (window.MP[eventMethod]) {
            window.MP[eventMethod].apply(window.MP[eventMethod], properties);
        }
    },

    GACallMethod: function(eventMethod, properties) {

        if (typeof GA == 'undefined' || app.gaID == undefined) {
            return;
        }

        if (typeof GA.initialized == 'undefined') {
            GA.init(app.gaID || '');
        }
        if (window.GA[eventMethod]) {
            window.GA[eventMethod].apply(window.GA[eventMethod], properties);
        }
    }

};

function onDomLoaded() {
    //trace('DOM Loaded')
    setTimeout(function() {
        if (app.jqueryLoaded) {
            $('.introduction_screen, .swiper img').hide().css('opacity', 0);
            //trace("jquery Loaded");
            app.onReady();
            app.window_width = $(window).width();
            app.window_height = $(window).height();
            if (app.window_width > app.window_height) {
                $('.form_screen').addClass('landscape');
                app.devicePosition = 'landscape';
            } else {
                app.devicePosition = 'portrait';
            }
        } else {
            onDomLoaded();
            l
        }
    }, 250)
}
$(document).ready(function() {
    app.jqueryLoaded = true;
    // $('.introduction_screen, .swiper img').hide().css('opacity',0);
    // trace("jquery Ready");
    // app.onReady();
    // app.window_width = $(window).width();
    // app.window_height = $(window).height();
    // if(app.window_width > app.window_height)
    // {
    // 	$('.form_screen').addClass('landscape');
    // 	app.devicePosition = 'landscape';
    // }
    // else
    // {
    // 	app.devicePosition = 'portrait';
    // }
});

function validatePhoneOrCellular(val) {
    var regEx = /^[0-9-]+$/;
    return (regEx.test(val));
}

function validateEmail(val) {
    var emailRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return (emailRegex.test(val));
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function createSwipeImageForm(url_portrait, url_landscape) {
    if (url_portrait != null && url_landscape != null) {
        var markup = '<div class="swiper_img_div">';
        if (url_portrait == '') url_portrait = 'images/portrait_holder.png';
        markup += '<img src="' + url_portrait + '" class="swiper_img" />';
        if (url_landscape == '') url_landscape = 'images/landscape_holder.png';
        markup += '<img src="' + url_landscape + '" class="swiper_img_landscape" />';
        markup += '</div>';
        return markup;
    }
}



function getQuerystringParamValue(param) {
    var queryStr = window.location.search.substring(1);
    var queryArr = queryStr.split("&");
    for (var i = 0; i < queryArr.length; i++) {
        var key = queryArr[i].split("=")[0];
        var val = queryArr[i].split("=")[1];
        if (key == param) {
            return val;
        }
    }
    return null;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}



function setCookie(cookieName, cookieValue, expirationInHours) {
    var exdate = new Date();
    exdate.setTime(exdate.getTime() + ((expirationInHours * 60) * 60 * 1000));
    var c_value = escape(cookieValue) + ((expirationInHours == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = cookieName + "=" + c_value;
}

function removeCookie(cookieName) {
    setCookie(cookieName, "", -24);
}

function getCookie(cookieName) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == cookieName) {
            return unescape(y);
        }
    }
    return null;
}

function isUnderWebView() {
    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1;
    var isIos = /iphone|ipod|ipad/.test(ua) && !window.MSStream;

    if (isAndroid) {
        if (ua.indexOf('; wv') > -1) {
            return true;
        }
        return false;
    } else if (isIos) {
        if (ua.indexOf('safari') == -1) {
            return true;
        }
        return false;
    } else {
        return false;
    }
}




function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}