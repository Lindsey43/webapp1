/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//------- App Javascript -------//

var app = {
    // Application Constructor
    initialize: function () {
        //this.bindEvents();
        this.onDeviceReady();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    //    bindEvents: function() {
    //        document.addEventListener('deviceready', this.onDeviceReady, false);
    //    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);



    }
};

// JavaScript Document content //
var pages = [],
    links = [];
var numLinks = 0;
var numPages = 0;
var geo;

document.addEventListener("deviceready", function () {
//document.addEventListener("DOMContentLoaded", function () {
    //device ready listener
    //------ Contacts --------//

    var options = new ContactFindOptions();
    options.filter = ""; //leaving this empty will find return all contacts
    options.multiple = true; //return multiple results
    var filter = ["displayName"]; //an array of fields to compare against the options.filter 
    navigator.contacts.find(filter, successFunc, errFunc, options);
    
    
    geo = document.querySelector('#geo');
    pages = document.querySelectorAll('[data-role="page"]');
    numPages = pages.length;
    links = document.querySelectorAll('[data-role="pagelink"]');
    numLinks = links.length;
    for (var i = 0; i < numLinks; i++) {
        //either add a touch or click listener
        if (detectTouchSupport()) {
            links[i].addEventListener("touchend", handleTouch, false);
        }
        links[i].addEventListener("click", handleNav, false);
    }
    //add the listener for the back button
    window.addEventListener("popstate", browserBackButton, false);
    loadPage(null);
});

//handle the touchend event
function handleTouch(ev) {
    ev.preventDefault();
    ev.stopImmediatePropagation();
    var touch = ev.changedTouches[0]; //this is the first object touched
    var newEvt = document.createEvent("MouseEvent");
    //old method works across browsers, though it is deprecated.
    newEvt.initMouseEvent("click", true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY);
    ev.currentTarget.dispatchEvent(newEvt);
    //send the touch to the click handler
}

//handle the click event
function handleNav(ev) {
    ev.preventDefault();
    var href = ev.target.href;
    var parts = href.split("#");
    //console.log("WE R HERE");
    loadPage(parts[1]);
    return false;
}

//Deal with history API and switching divs
function loadPage(url) {
    if (url == null) {
        //home page first call
        pages[0].style.display = 'block';
        history.replaceState(null, null, "#home");
    } else {

        for (var i = 0; i < numPages; i++) {
            if (pages[i].id == url) {

                if (pages[i].id == "two") {
                    //Call function reacting geolocation
                    console.log(pages[i].id);
                    getGeo();
                }
                pages[i].style.display = "block";
                history.pushState(null, null, "#" + url);
            } else {
                pages[i].style.display = "none";
            }
        }
        for (var t = 0; t < numLinks; t++) {
            links[t].className = "";
            if (links[t].href == location.href) {
                links[t].className = "activetab";
            }
        }
    }
}

//Need a listener for the popstate event to handle the back button
function browserBackButton(ev) {
    url = location.hash; //hash will include the "#"
    //update the visible div and the active tab
    for (var i = 0; i < numPages; i++) {
        if (("#" + pages[i].id) == url) {
            pages[i].style.display = "block";
        } else {
            pages[i].style.display = "none";
        }
    }
    for (var t = 0; t < numLinks; t++) {
        links[t].className = "";
        if (links[t].href == location.href) {
            links[t].className = "activetab";
        }
    }
}

//Test for browser support of touch events
function detectTouchSupport() {
    msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
    var touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
    return touchSupport;
}

//------ Geolocation Maps--------//

function getGeo() {
    if (navigator.geolocation) {
        //code goes here to find position
        var params = {
            enableHighAccuracy: false,
            timeout: 60000,
            maximumAge: 60000
        };

        navigator.geolocation.getCurrentPosition(reportPosition, gpsError, params);

        //to continually check the position (in case it changes) use
        // navigator.geolocation.watchPosition( reportPosition, gpsError, params)
    } else {
        //browser does not support geolocation api
        alert("Sorry, but your browser does not support location based awesomeness.")
    }
}

function reportPosition(position) {
    var locationHere = "http://maps.googleapis.com/maps/api/staticmap?sensor=false&center=" + position.coords.latitude + "," + position.coords.longitude + "&zoom=14&size=400x400&markers=color:red|label:Q|" + position.coords.latitude + "," + position.coords.longitude;
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 400;

    var imageObj = new Image();
    imageObj.src = locationHere;

    imageObj.onload = function () {
        context.drawImage(imageObj, 0, 0);
        geo.innerHTML = "";
        geo.appendChild(canvas);

    }
};

function gpsError(error) {
    var errors = {
        1: 'Permission denied',
        2: 'Position unavailable',
        3: 'Request timeout'
    };
    alert("Error: " + errors[error.code]);
}





function successFunc(matches) {
    //for( var i=0; i<matches.length; i++){
    //    console.log( matches[i].displayName );
    //  }

    var rand = matches[Math.floor(Math.random() * matches.length)];

    console.log(rand)



    var l = "";
    l += "<h2>" + rand.displayName + "</h2>";

    if (rand.emails && rand.emails.length) {
        l += "Email: " + rand.emails[0].value + "<br/>";
    }

    if (rand.phoneNumbers && rand.phoneNumbers.length) {
        l += "Phone: " + rand.phoneNumbers[0].value + "<br/>";
    }

    if (rand.photos && rand.photos.length) {
        l += "<p><img src='" + rand.photos[0].value + "'></p>";
    }

    document.querySelector("#showcontacts").innerHTML = l;
}

function errFunc(err){
    console.log("Error Text: "+err);
}