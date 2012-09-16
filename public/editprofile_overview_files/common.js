//#Common Functionality to use site-wide

//*(Will use strict at some point hopefully)
//"use strict";*

//##Namespace for CrossLoop
var XL = {
  //Clones out an element in the DOM and returns an ID-less copy (all child elements have IDs removed as well)
  cloneTemplate: function(elem) {
    elem = $(elem).clone();

    elem.removeAttr("id");
    elem.find("*").each(function(index, elem) {
      $(elem).removeAttr("id");
    });
    return elem;
  },
  //Returns 3-char day name string
  getDayName: function(date) {
    switch(date.getDay()) {
      case 0:
        return "Sun";
      case 1:
        return "Mon";
      case 2:
        return "Tue";
      case 3:
        return "Wed";
      case 4:
        return "Thu";
      case 5:
        return "Fri";
      case 6:
        return "Sat";
    }

  },
  //Returns 3-char month name string
  getMonthName: function(date) {
    switch(date.getMonth()) {
    case 0:
      return "Jan";
    case 1:
      return "Feb";
    case 2:
      return "Mar";
    case 3:
      return "Apr";
    case 4:
      return "May";
    case 5:
      return "Jun";
    case 6:
      return "Jul";
    case 7:
      return "Aug";
    case 8:
      return "Sep";
    case 9:
      return "Oct";
    case 10:
      return "Nov";
    case 11:
      return "Dec";
    }
  },
  //Turns a set of get params into a proper object
  getObjFromUrlEncodedString: function(string) {
    string = decodeURIComponent(string);
    var o = {},
        parts = string.split("&"),
        partData,
        key,
        value,
        i = 0,
        j = parts.length;

    for(;i < j; i++) {
      partData = parts[i].split("=");
      key = partData[0];
      value = partData[1];
      o[key] = value;
    }

    return o;
  },
  //Empty object to hold keys bound at any given time
  boundKeys: {},
  //Binds a callback to a specific key, replacing existing binding if one exists
  bindKey: function(keyCode, callback) {
    XL.boundKeys[keyCode] = callback;
    $(document).keydown(XL.handleBoundKey);
  },
  //Unbinds whatever existing callback is bound (if any) from a specific key
  unbindKey: function(keyCode) {
    delete XL.boundKeys[keyCode];
    var count = 0,
        key;
    for(key in XL.boundKeys)
      count += 1;

    if(!count)
      $(document).unbind("keydown", XL.handleBoundKey);
  },
  //Actually routes the event listener through to use the callback
  handleBoundKey: function(evt) {
    var keyCode = evt.keyCode;
    if(XL.boundKeys[evt.keyCode]) {
      XL.boundKeys[keyCode]();
    }
  },
  //Passes callback value of key
  getAccountNote: function(key, callback) {
    $.get("/accountnote.htm", {key: key, cache_buster: $.now()}, callback);
  },
  //Sets key to value, callback gets value stored in key *(it it matches that passed in it was successful)*
  setAccountNote: function(key, value, callback) {
    $.get("/accountnote.htm", {key: key, value: value, cache_buster: $.now()}, callback);
  },
  //Sets key to value, callback gets value stored in key *(it it matches that passed in it was successful)*
  accountLog: function(logKey, logData, logValue, logType, logcallback) {
      if(typeof(logData) === 'object') {
          logData = $.toJSON(logData);
      }
      if(!logcallback)
        logcallback = function(){};
      $.get("/accountnote.htm", {logKey: logKey, logData: logData, logValue: logValue, logType: logType, cache_buster: $.now()}, logcallback);
  },
  //Returns deep-cloned object instance *(clearer usage than jQ I think)*
  cloneObject: function(original) {
    var newObject = {};
    $.extend(true, newObject, original);
    return newObject;
  },
  //Attempts to resize the frame to exactly contain its contents *(doesn't work across protocols, ie containing page is HTTP and iframe content is HTTPS)*
  resizeFrame: function(frame) {
    frame = $(frame);
    var contents = $(frame).contents();

    frame.height(contents.height());
  },
  //Returns string ready to append to query string
  //*(truthy noAmp flag denotes no ampersand in the returned string)*
  cacheBuster: function(noAmp) {
    var busterStr = "cache_buster=" + $.now();
    busterStr = ("undefined" === typeof noAmp) ?
      "&" + busterStr :
      busterStr;

    return busterStr;
  },
  //Removes error class from field itself, removes any previous errorMessage elements
  clearFieldError: function(field) {
    field = $(field);
    field.prev(".errorMessage").remove();
    field.removeClass("error");
  },
  //Sets error class on field itself, inserts errorMessage element with text from field's errorMessage attribute, or defaults to "Required"
  markFieldError: function(field) {
    field = $(field);
    if(field.is(":hidden") || field.hasClass("error"))
      return false;
    var pos = field.position();
    $('label[for="'+field.attr('id')+'"').addClass('error');
    $('<p class="errorMessage"></p>').insertBefore(field).text(field.attr("errorMessage") || "Required").css({top: pos.top + 5, left: pos.left});
    field.addClass("error");
  },
  //Inserts link tag in head of document, no cleanup nicety
  loadCss: function(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
  },
  //Validates field against numerous requirements based on class or HTML5 attributes. *(would like to shift to all HTML5 style at some point)*
  //Options object can take callback for failure.
  //Can only fail for one reason, after that additional validation rules are ignored *(less messaging for user is better, less confusion)*
  validateField: function(field, options) {
    var field = $(field),
        value = field.val() || "",
        oldFailure,
        failure,
        isValid = true;

    options = options || {};
    oldFailure = options.failure || $.noop;
    failure = function() {
      oldFailure();
      isValid = false;
    };

    //Handle non-select, non-checkbox required fields
    if(field.hasClass("required") && !field.is("select") && !field.is("[type=checkbox]") && !value.length) {
      failure();
    }
    //Verify string is email
    if(field.hasClass("email")) {
      rx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/gi;
      if(value.search(rx) == -1) {
        failure();
      }

    }
    //Handle required select fields
    if(field.hasClass("required") && field.is("select")) {
      if(value == "0" || value == "" || value == "-")
        failure();
    }

    //Handle required checkbox fields
    if(field.hasClass("required") && field.is("[type=checkbox]")) {
      if(!field.is(":checked"))
        failure();
    }

    //Handle minimum numeric value
    if(field.attr("min")) {
      var min = field.attr("min");
      if(parseFloat(value) < parseFloat(min))
        failure();
    }

    //Verify string is at least minLength
    if(field.attr("minLength")) {
      var minLength = field.attr("minLength");
      if(value.length < parseInt(minLength, 10))
        failure();
    }

    //Ensure field matches other field specified in *shouldmatch* attribute. Right now does *not* verify field is in same form...
    if(field.attr("shouldmatch")) {
      var matchField = $("[name=" + field.attr("shouldmatch") + "]");

      if(!matchField || matchField.val() != value)
        failure();
    }

    //Based on all rules, return bool for validity of field
    return isValid;
  },
  //Calls to obj[method] actually reference handler[method], optionally bound to obj
  //*NOTE*: Binding does **NOT** work with native objects
  deferMethod: function(obj, handler, method, bind) {
    obj[method] = function() {
      var context = bind ? this : handler;
      return handler[method].apply(context, arguments);
    };
  },
  //Calls to any methods on obj which existed on handler call the method on handler, bound to obj
  //*NOTE*: Binding does **NOT** work with native objects
  deferMethods: function(obj, handler, options) {
    var methodList = options.methodList,
        bind = options.bind;
    if(!methodList)
      $.each(handler, function(key, property) {
        if("function" === typeof property)
          XL.deferMethod(obj, handler, key, bind);
      });
    else
      $.each(methodList, function(index, methodName) {
        var property = handler[methodName];
        if(property && "function" === typeof property)
          XL.deferMethod(obj, handler, methodName, bind);
      });
  }
};

if("undefined" != typeof siteActivityDataAvailable) {
  XL.siteActivity = (function(originalData, timestamp){
    //private data
    var data = {},
        serverTime = timestamp,
        loadTime = $.now();

    //a key's value is {value: anyType, timestamp: time}
    $.extend(true, data, originalData);

    return {
      isAvailable: true,
      //sets key to val, adds timestamp
      set: function(key, val) {
        var now = $.now();
        data[key] = {
          value: val,
          timestamp: serverTime + (now - loadTime),
          isDirty: true
        };
      },
      get: function(key) {
        if("undefined" == typeof data[key])
          return undefined;
        return data[key].value;
      },
      //compares originalData to data and if any values or timestamps changed, updates server
      save: function() {
        var updateServer = false,
            datum,
            originalDatum,
            key;
        for(key in data) {
          datum = data[key];
          originalDatum = originalData[key];
          if("undefined" == typeof originalDatum || datum.isDirty) {
            updateServer = true;
            break;
          }
        }
        if(updateServer) {
          XL.setAccountNote("siteActivity", $.toJSON(data), function() {
            var key;
            for(key in data)
              delete data[key].isDirty;

            originalData = XL.cloneObject(data);
          });
        }
      },
      revert: function() {
        data = XL.cloneObject(originalData);
      }
    };
  })(siteActivityData, serverTimestamp);
}

function getUrlParameter( name, string ){
    var regexS = "([\\?&]|^)"+name+"=([^&#]*)",
        regex = new RegExp( regexS ),
        results;
    if(string) {
        results = regex.exec( string );
    }
    else
        results = regex.exec( window.location.href );
    if( results == null ){
        return "";
    }else{
        return results[2];
    }
}


function trim(stringToTrim) {
  return stringToTrim.replace(/^\s+|\s+$/g,"");
}


function getOS(ua){
    if(!ua)
        ua = navigator.userAgent.toString();
     var os = ua.match(/windows/i) ? "Windows" :
          (ua.match(/linux/i) ? "Linux" :
          (ua.match(/mac/i) ? "Mac" :
          ua.match(/unix/i)? "Unix" : "unknown"));
    return os;
}

function getBrowser(ua) {
    if(!ua)
        ua = navigator.userAgent.toString();
    var re_opera = /Opera.([0-9\.]*)/i,
        re_msie = /MSIE.([0-9\.]*)/i,
      re_firefox = /firefox/i,
      re_safari = /safari\/([\d\.]*)/i,
        re_chrome = /chrome/i;

    var browser = ua.match(re_opera) ? "Opera" :
          (ua.match(re_msie) ? "IE" :
                    (ua.match(re_chrome) ? "Chrome" :
                    (ua.match(re_firefox) ? "Firefox" :
          ua.match(re_safari)? "Safari" : "unknown")));

    return browser;
}

function getBrowserVersion(ua) {
    if(!ua)
        ua = navigator.userAgent.toString();
    var v = "",
        browser = "",
        re_opera = /Opera.([0-9\.]*)/i,
      re_msie = /MSIE.([0-9\.]*)/i,
      re_firefox = /firefox.[0-9\.]*/i,
      re_safari = /Version.[0-9\.]*/i,///safari\/([\d\.]*)/i
        re_chrome = /chrome.[0-9\.]*/i;

    if (ua.match(re_opera)) {
    browser = ua.match(re_opera);
        v = parseFloat(browser[1]);
  } else if (ua.match(re_msie)) {
    browser = ua.match(re_msie);
    v = parseFloat(browser[1]);
  } else if (ua.match(re_safari)) {
    browser = ua.match(re_safari).toString();
        v = browser.substring(browser.indexOf("/")+1, browser.length);
    }else if(ua.match(re_chrome)){
        browser = ua.match(re_chrome).toString();
        v = browser.substring(browser.indexOf("/")+1, browser.length);
    } else if (ua.match(re_firefox)) {
    browser = ua.match(re_firefox).toString();
        v = browser.substring(browser.indexOf("/")+1, browser.length);
    }

    return v;
}

function selectOption(id, value){
    var sel = document.getElementById(id);

    for (var i = 0; i < sel.length; i++){
        if (sel.options[i].value == value){
            sel.selectedIndex = i;
            break;
        }
    }
}

//footer fns
//used in footer and header
function homeUrl(){

    var url = document.URL,
        j,
        body;
    if (url.indexOf('http://') == 0){
        i = 7;
    }else if (url.indexOf('https://') == 0){
        i = 8;
    }else{
        alert("unexpected url: " + url);
    }
    j = url.indexOf('/', i);
    body = url.substring(i, j);
    i = body.indexOf(":8443");
    if (i != -1){
        body = body.substring(0, i) + ":8080";
    }else{
        i = body.indexOf(":443");
        if (i != -1)
            body = body.substring(0, i);
    }

    return 'http://' + body + '/';
}

//end footer fns

function chatNow(contactMeId, fname, lname){
    $.get("fx.htm?fx=checkpresence&id="+contactMeId, function(response) {
        if(response == 'present') {
            var helpeeChatURL = "https://"+document.domain+"/helpeechatnew.htm?helperID="+contactMeId;
            
            if(!XL.chatDialog) {
                $('body').append('<div id="chatDialogContent" class="dialog" style="width: 670px"><iframe style="border: none; width:670px; height: 500px" src="'+helpeeChatURL+'"></iframe></div>');
                XL.chatDialog = new XL.Dialog.Lightbox({box: $('#chatDialogContent'), title: "Chat with "+fname+" "+lname});
                XL.chatDialog.bind('afterClose', function() {
                    XL.chatDialog.box.remove();
                    XL.chatDialog = null;
                });
            }
            XL.chatDialog.open();
        } else {
            alert('This expert is no longer online.');
        }
    });
    return false;
}

function callServer(url, xmlHttp){
    callTomcat(url, xmlHttp, onResponse);
}

function callTomcat(url, xmlHttpContainer, onResponse){
    var xmlHttp = null;

    if (window.XMLHttpRequest){

        // code for IE7, Firefox, Opera, etc.
        xmlHttp = new XMLHttpRequest();
    }else if (window.ActiveXObject){
        // code for IE6, IE5
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlHttp != null){
        if (xmlHttpContainer != undefined)
            xmlHttpContainer[0] = xmlHttp;
        if (onResponse != undefined){
            xmlHttp.onreadystatechange = onResponse;
        }
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }
}

function onResponse(xmlHttp){

    try{
        if (xmlHttp[0].readyState == 4){ // 4 = "loaded"

            if (xmlHttp[0].status == 200){ // 200 = "OK"

                var reply = xmlHttp[0].responseText;

                if (reply == "not_present"){
                    window.location.href = window.location.href;
                    window.alert("This Helper is not available now!");
                }
            }
        }
    }catch(e){
        //alert(e.message);
    }
}

function removeBreakingChars(dataStr) {
    dataStr = dataStr.replace('"', '\"');
    dataStr = dataStr.replace("'", "\'");

    return dataStr;
}

function decorate_href(anchor, id, prompt, isHeader){  //used by search bar in header

    var searchElement = document.getElementById(id),
        str;
    searchElement.value = searchElement.value.replace(/"/g,"'");
    if (prompt != null && prompt == searchElement.value){
        searchElement.value = "";
    }

    str = "/search.htm?q=" + searchElement.value;

    //searching from Mac download page or on a Mac
    if((document.location.toString().indexOf("download.htm")!=-1 || navigator.userAgent.indexOf("Mac")!=-1) && document.location.toString().indexOf("macsupport=0")==-1){
        searchElement.value ==""? str="/search.htm?macsupport=1" : str+="&macsupport=1";
    }
    if(isHeader!=null && isHeader=="header"){
        str += "&src=header";
    }
    if(document.location.toString().indexOf("saconfirm.htm")>0){
        str+="&src=sa_acct_confirmed";
    }

    anchor.href = str;
}

function keyPressFn(e, id, isHeader){
    var pK = e && e.which ? e.which : window.event.keyCode,
        searchElement,
        str;
    if (pK == 13){
        searchElement = document.getElementById(id);
        searchElement.value = searchElement.value.replace(/"/g, "'");

        str = "/search.htm?q=" + searchElement.value;

        //searching from Mac download page or on a Mac
        //if(document.location.toString().indexOf("download.htm")>0 || navigator.userAgent.indexOf("Mac")!=-1){
        if((document.location.toString().indexOf("download.htm")!=-1 || navigator.userAgent.indexOf("Mac")!=-1) && document.location.toString().indexOf("macsupport=0")==-1){
            searchElement.value ==""? str="/search.htm?macsupport=1" : str+="&macsupport=1";
        }
        if(isHeader!=null && isHeader=="header"){
            str += "&src=header";
        }

        if(document.location.toString().indexOf("saconfirm.htm")>0){
            str+="&src=sa_acct_confirmed";
        }
        window.location.href = str;
    }
}

function checkEventKey(evt) {

    return (evt.which) ? evt.which : window.event? window.event.keyCode : false;
}

function filterNumber(event, input, limit) {
    var evt = window.event || event,
        kc = evt.keyCode,
        allowKeys = [8, 9, 13, 14, 35, 36, 37, 38, 39, 40, 46],
        //Regex for allowing Ctl/Cmd keys to enable select all/paste/copy/undo/redo
        withModifiersRegex = /a|c|v|z|y/i,
        charCode = checkEventKey(event),
        keyAsString = String.fromCharCode(charCode),
        i,j;

    // Always allow backspace tab, arrows, home/end keys, enter

    for(i = 0, j = allowKeys.length; i < j; i++) {
        if(allowKeys[i] == kc)
            return true;
    }

    if(!charCode)
        return false;
    if(input && limit && input.value.length == limit)
        return false;
    if((-1 !== keyAsString.search(withModifiersRegex)) && (event.ctrlKey || event.metaKey))
        return true;
    if(keyAsString.search(/[\d\.]/) === -1)
        return false;
    else
        return true;
}

function filterAlphanumeric(event) {
  var evt = event || window.event,
      charCode = checkEventKey(evt),
      keyAsString = String.fromCharCode(charCode);

  if(-1 === keyAsString.search(/[^a-zA-Z\_]/))
    return true;

  else return filterNumber(evt);
}

function filterURLChar(event) {
    var charCode = checkEventKey(event);
    if (charCode <= 13)
        return true;
    if(String.fromCharCode(charCode).match(/[\d\w_]/) == null)
        return false;
    else
        return true;
}

function removeNonNumeric(input) {
    var cleaned = input.value;
    //remove non-dash/number/dot
    cleaned = cleaned.replace(/[^0-9-.]/g,"").
    //remove dot after first occurrence
            replace(/(\.[^.]*)+\./g, "$1").
    //remove dashes after beginning
            replace(/(.+)\-/, "$1");
    input.value = cleaned;
}

function gotoFreeDownload(extraParams){
    if(!extraParams)
        extraParams = "";
    if(get_free_access_param == "" || mac_download_path == "" || win_download_path == "")
        return false;
    if (navigator.userAgent.indexOf("Mac")!=-1){
        document.location.href="/download.htm?get_free="+get_free_access_param+"&get_mac_free=true"+extraParams;
    }else{
        document.location.href="/download.htm?get_free="+get_free_access_param+"&get_win_free=true"+extraParams;
    }
    return false;
}

function startDownload(p) {
    return gotoFreeDownload(p);
}

function startFreeDownload(platform){
    if ((navigator.userAgent.indexOf("Mac")!=-1 && platform != "win") || platform == "mac"){
        startFreeMacDownload();
    }
    else{
        document.location.href=matchSSL(win_download_path);
    }
    return false;
}

function startFreeMacDownload() {
    document.location.href=matchSSL(mac_download_path);
    return false;
}

function startExpressDownload(){
    if (navigator.userAgent.indexOf("Mac")!=-1){
        $('body').append('<iframe height="1" width="1" style="visibility: hidden" src="'+matchSSL(mac_express_download_path)+'"></iframe>');
    }
    else{
        $('body').append('<iframe height="1" width="1" style="visibility: hidden" src="'+matchSSL(win_express_download_path)+'"></iframe>');
    }
    return false;
}

function startPremiumDownload(beta, platform){
    if ((navigator.userAgent.indexOf("Mac")!=-1 && platform != "win") || platform == "mac"){
        if(beta)
            $('body').append('<iframe height="1" width="1" style="visibility: hidden" src="'+matchSSL(mac_premium_beta_download_path)+'"></iframe>');
        else
            $('body').append('<iframe height="1" width="1" style="visibility: hidden" src="'+matchSSL(mac_premium_download_path)+'"></iframe>');
    }
    else{
        if(beta)
            $('body').append('<iframe height="1" width="1" style="visibility: hidden" src="'+matchSSL(win_premium_beta_download_path)+'"></iframe>');
        else
            $('body').append('<iframe height="1" width="1" style="visibility: hidden" src="'+matchSSL(win_premium_download_path)+'"></iframe>');
    }
    return false;
}

function matchSSL(url) {
    if(document.location.href.indexOf("https:") == 0) {
        url = url.replace(/http:/g, "https:");
    }
    return url;
}

//gets the height of the page (below the scrollbars, everything)
function getPageHeight() {
   var myHeight = 0;
   if(document.all){//IE
       myHeight = document.body.offsetHeight; //document.documentElement.clientHeight;
       if(document.documentElement.clientHeight > myHeight) myHeight = document.documentElement.clientHeight;
   }else if(document.body.document){
       myHeight = document.body.document.height;
   }else if( document.documentElement && ( document.documentElement.clientHeight ) ) { //FF
       myHeight = document.height;//this is the height of the doc. the below is the height of the window. //window.innerHeight;//document.documentElement.clientHeight;
       if(window.innerHeight>myHeight) myHeight = window.innerHeight;
   } else if( document.body && document.body.clientHeight ) {
        myHeight = document.body.clientHeight;
        if(window.innerHeight && window.innerHeight > myHeight) myHeight = window.innerHeight;
       //window.innerHeight
    }

   return myHeight;
}

//gets the height of the browser window
function getWinSize() {
   var winHeight = 0;
   if( typeof(window.innerHeight ) == 'number' ) {
        winHeight = window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientHeight ) ) {
        winHeight = document.documentElement.clientHeight;
    } else if( document.body && document.body.clientHeight ) {
        winHeight = document.body.clientHeight;
    }
     return winHeight;
}

function showSurveyTab(){
    var surveyTab = document.getElementById("surveyTab"),
        h = getWinSize();
    surveyTab.style.top = ((h/2)-80) +"px";
    //surveyTab.style.position ="fixed";
    surveyTab.style.left= "0";
    surveyTab.style.display = "block";
}

function checkEmail(email){
    if(email.value=="") {
        alert("You did not enter an email address for your login.");
        email.focus();
        return false;
    }

    return isEmailValid(email);
}

function isEmailValid(email){

    if(email.value.length == 0 || email.value == null ){
        alert("Please enter an email address");
        return false;
    }  else if (email.value.length > 64){
        alert("Your email address is too long.");
        email.focus();
        return false;
    }

    var re_pattern=new RegExp("^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\\.)+[A-Z]{2,4}$", "i");
    if (!re_pattern.test(email.value)) {
        alert("Please enter a valid email address");
        email.focus();
        return false;
    }

    return true;
}

var shortDays = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"],
    longDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    longMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    am_pm = ["am", "pm"];

function formatLongDate(t, withYear){
    var d = new Date();
    d.setTime(t);
    var day = d.getDate(),
        dayOfWeek = longDays[d.getDay()],
        month = longMonths[d.getMonth()];
    if(withYear)
        return dayOfWeek + ', ' + month + " " + day + " " + (d.getFullYear());
    else
        return dayOfWeek + ', ' + month + " " + day;
}

function formatShortDate(t){
    var d = new Date();
    d.setTime(t);
    var day = d.getDate(),
        dayOfWeek = shortDays[d.getDay()],
        month = shortMonths[d.getMonth()];
    return dayOfWeek + ", " + month + " " + day;
}

function formatDateTime(t) {
    var d = new Date();
    d.setTime(t);
    var str = '';
    var day = d.getDate(),
        dayOfWeek = shortDays[d.getDay()],
        month = shortMonths[d.getMonth()];
    str = (d.getMonth()+1) + "/" + day + "/" + d.getFullYear() + " ";
    var hour = d.getHours() % 12,
        sfx = am_pm[d.getHours() > 11 ? 1 : 0],
        minute = d.getMinutes();

    if (hour == 0)
        hour = 12;
    str += addZero(hour) + ":" + addZero(minute) + " " + sfx;
    return str;
}

function addZero(v){
    if (v < 10)
        return "0" + v;
    return v;
}

function formatTime(t){
    var d = new Date();
    d.setTime(t);
    var hour = d.getHours() % 12,
        sfx = am_pm[d.getHours() > 11 ? 1 : 0],
        minute = d.getMinutes();

    if (hour == 0)
        hour = 12;
    return addZero(hour) + ":" + addZero(minute) + " " + sfx;
}

function formatCurrency(amount) {
    amount = Math.round(amount*100)/100;
    if (amount % 1 == 0)
        amount = amount + ".00";
    else if (amount*10 % 1 == 0)
        amount = amount + "0";
    return amount;
}

function urlParseToArray(msg) {
    var nvPairs = msg.split("&"),
        paramList = [],
        nvPair,
        name,
        i;
    for (i = 0; i < nvPairs.length; i++)
    {
        nvPair = nvPairs[i].split("=");
        name = nvPair[0];

        if(nvPair.length > 1)
            paramList[name] = decodeURIComponent(nvPair[1]);
        else
            paramList[name] = "";
    }
    return paramList;
}

function enableDisable(id, on)
{
  var toggleElement = document.getElementById(id);
    if (on) {
        toggleElement.disabled=false;
        toggleElement.className = toggleElement.className.replace(" disabled", "");
    }
    else {
        toggleElement.disabled=true;
        toggleElement.className += " disabled";
    }
}

function clearSessionMsg() {
    $.post('/fx.htm', "fx=clearSessionMsg&time="+(new Date()).getTime());
    $('.messagePersistent').fadeOut();
}

function renderChatHistory(messages) {
    var html = "",
            message,
            messageBody,
            messageData,
            i,
            j;
    for (i = 0,j = messages.length; i < j; i++) {
        message = messages[i];
        if (message.persistenceClass != "88") {
            messageBody = message.body;
            if (messageBody.indexOf("xlmessage=") != -1) {
                messageData = XL.getObjFromUrlEncodedString(messageBody);
                if (messageData.xlmessage == "estimate") {
                    html += "<p class='alignCenter italic'>Estimated " + messageData.estimate_amount + "</p>";
                }
                if (messageData.xlmessage == "charge") {
                    html += "<p class='alignCenter italic'>Charged USD " + messageData.estimate_amount + "</p>";
                }
                if (messageData.xlmessage == "offer") {
                    html += "<p class='alignCenter italic'>Offered <a target='_blank' href='" + messageData.offerURL.split("?")[0] + "'>" + messageData.customerTitle + "</a></p>";
                }
                if (messageData.xlmessage == "helperClosing") {
                    html += "<p class='alignCenter italic'>Work order has been completed</p>";
                }
            }
            else if (messageBody.indexOf("accesscode=") != -1)
                html += "<p class='alignCenter italic'>Customer Started Screen Sharing</p>";
            else if (messageBody.indexOf("disconnect=true") != -1)
                    html += "<p class='alignCenter italic'>Customer Ended Screen Sharing</p>";
                else if (messageBody.length && messageBody.search(/\[fire\||typingindicator=|clientstatus=|accesscode=|disconnect=/) == -1)
                        html += '<p><b>' + message.username + ': ' + '</b>' + messageBody + '</p>';
        }
    }

    if (!html.length)
        html = "<p class='alignCenter'>No chats with</p>";

    return html;
}

// Using $ (test for it) load standard stuff

if("undefined" != typeof $) {
  (function($) {
    //Disables entire form **or** individual field
    $.fn.disable = function() {
      var selected = this;
      if(this.is("form")) {
        selected = this.find("input, textarea, select");
        this.find('input[type=submit]').each(function() {
          var w = $(this).width();
          var h = $(this).height();
          $(this).attr('tmpVal', $(this).val()).
                  val('').
                  css({
                    'background':'url(/images/ui/form/submitProgressIndicator.gif) no-repeat 50% 50% #37628A',
                    'width':w,
                    'height':h
                  });
        });
      }
      selected.attr("disabled", "disabled").blur();
      this.addClass("disabled");

      return this;
    };
    //Just like *$.fn.disable*, except doesn't *actually* disable, but adds classes to look as though it has
    $.fn.disableSubmit = function() {
      var selected = this,
          elem,
          w,
          h;
      if(this.is("form")) {
        selected = this.find("input, textarea, select");
        this.find('input.action[type=submit]').each(function() {
          elem = $(this);
          elem.attr('tmpVal', elem.val());
        });
      }
      selected.addClass("disabled");
      this.addClass("disabled");

      return this;
    };
    //Preload spinner, some browsers stop making get requests upon posting from a form
    var spinnerPreload = new Image;
        spinnerPreload.src = "/images/ui/form/submitProgressIndicator.gif";
    //Re-enable and remove any disabled classes added by *$.fn.disable*
    $.fn.enable = function() {
      var selected = this;
      if(this.is("form")) {
        selected = this.find("input, textarea, select");
              this.find('input[type=submit]').each(function() {
                  $(this).val($(this).attr('tmpVal'));
                  $(this).css({
                      'background':'url(/images/styling/bgBlueButton.png) repeat-x scroll 0 0 #37628A'
                  });
              });
      }
      selected.removeAttr("disabled").removeClass("disabled");
      this.removeClass("disabled");

      return this;
    };

    //Remove all errorMessage elements from form, and clear any error classes from fields
    $.fn.clearErrors = function() {
      if(this.is("form")) {
        var fields = this.find("input, textarea, select"),
            errorMessages = this.find(".errorMessage, .errors");

        fields.removeClass("error");
        errorMessages.remove();
      }
      return this;
    };

    //Error at top of form instead of inline per field. Useful for more general messaging or messaging for complex reasons (multiple fields need to jive correctly together, etc)
    $.fn.showFormError = function(message, elementToPrecede) {
      var form = $(this),
          elementToPrecede = elementToPrecede || form.find(".fieldAndLabel").first(),
          errorPara = $("<p>" + message + "</p>").addClass("errors");

      //remove any existing errors box
      form.find(".errors").remove();
      elementToPrecede.before(errorPara);
      form.find("input, textarea, select").not(":hidden").first().focus();
      return this;
    };
  })(jQuery);

    $(function() {
        $(".initShow").show();

        // Prevent annoying outlines on all links in some browsers
        $("a").live("click", function() {
           $(this).blur();
        });


        //Resets fields to defaultValue on domready
        $('.simpleForm input[type="text"], .simpleForm textarea').each(function() {
            var input = $(this),
                defaultValue;
            if((defaultValue = input.attr('title') || input.attr("placeholder")) && input.val() == '') {
                input.val(defaultValue);
            }
        });
        //Essentially, HTML5 placeholder text using *title* attribute if *placeholder* isn't available
        $('.simpleForm input[type=text], input[type=email], .simpleForm textarea').focus(function() {
            var input = $(this),
                defaultValue;
            if((defaultValue = input.attr('title') || input.attr("placeholder")) && input.val() != '') {
                if(input.val() == defaultValue)
                    input.val('');
            }
        });
        //Ditto on placeholder/title stuff
        $('.simpleForm input[type=text], input[type=email], .simpleForm textarea').blur(function() {
            var input = $(this),
                defaultValue;
            if((defaultValue = input.attr('title') || input.attr("placeholder")) && input.val() == '') {
                if(input.val() == "")
                    input.val(defaultValue);
            }
        });

        $('.subheaderElement').click(function() {
            if($(this).find('a').size() > 0) {
                document.location.href = $(this).find('a').attr('href');
                return false;
            }
        });

        $('.buttonLink').live('click', function() {
            var url = $(this).find('a').attr('href');
            var target = $(this).find('a').attr('target');
            if((target == 'new' || target == '_blank') && url)
                window.open(url);
            else if(url) {
                document.location.href = url;
            }
            return false;
        });

        //Mimics HTML5 numeric elements
        $("input.numeric").live("keyup", function() {
            var field = $(this),
                cleaned = field.val();

            cleaned = cleaned.replace(/[^\d\.]/,"").replace(/(\.\d{2}).+$/, "$1");
            field.val(cleaned);
        });

        //Handles all form submission, runs all fields through *validateField*, clears all errors on each pass
        $("form").live("submit", function(evt) {
          //evt.stopImmediatePropagation();
          var form = $(this),
              fields = form.find("input, textarea, select").filter(":visible"),
              errorFields = [],
              value,
              min,
              haltSubmit = false,
              rx,
              addlValidator,
              markFieldError = function(field) {
                if( -1 != $.inArray(field, errorFields))
                return false;
                XL.markFieldError(field);
                errorFields.push(field);
                haltSubmit = true;
              };

            form.clearErrors();
            //Trickery using jQ data...
            //If addlValidator sees errors, call markFieldError on field
            if((addlValidator = form.data("preValidator")))
              addlValidator(errorFields, markFieldError);

            fields.each(function(i, field) {
              XL.validateField(field, {
                failure: function() {
                  markFieldError(field);
                }
              });

            });

            //Trickery using jQ data...
            //If addlValidator sees errors, call markFieldError on field
            if((addlValidator = form.data("postValidator")))
              addlValidator(errorFields, markFieldError);

            //Autofocus first field with error
            if(errorFields.length) {
              errorFields[0].focus();
              return false;
            }

            //**Important**: Forms should *either* have "submitWaiter" class or "ajax" class, but *not both*.
            //  "submitWaiter" forms automatically apply `disableSubmit()` to the form, indicating fields are unusable, whereas
            //  "ajax" forms leave any disabling to the "ajaxSubmit" handler for the evenf of that name. "ajax" forms fire off this event after automatic form validation,
            //  and should, for instance, serialize any fields before disabling them. (jQ is unable to serialize disabled fields) "ajax" forms also can re-enable fields depending on the specific logic

            //Fake disable form
            if(form.hasClass("submitWaiter") && !form.hasClass("disabled")) {
              form.disableSubmit();
              return true;
            }

            //Forms with class *ajax* need to set up listeners for ajaxSubmit event
            if(form.hasClass("ajax")) {
              form.trigger("ajaxSubmit");
              return false;
            }

            return true;
        });

        $('input[maxLength], textarea[maxLength]').live('keyup change', function() {
            var maxLength = $(this).attr('maxLength');
            if($(this).val().length > maxLength)
                return false;
            else
                return true;
        });

        //Used for forms where you need entire fieldsets or similar to be toggleable between two sets of HTML
        $(".swapFieldsContainer .swapFieldsLink").live("click", function() {
          var link = $(this),
              currentFields = link.closest(".usedSwapFields"),
              form = currentFields.closest("form"),
              otherFields = link.closest(".swapFieldsContainer").find(".unusedSwapFields"),
              currentContent, otherContent;

          //remove errorMessages, error classes
          form.clearErrors();

          currentContent = currentFields.html();
          otherContent = otherFields.html();
          currentFields.html(otherContent);
          otherFields.html(currentContent);
          return false;
        });

        $('body').addClass(getBrowser());
    });

}

//Precaution for production slip-ups...
if(typeof console === "undefined") {
    console = { log: function() { }};
}
