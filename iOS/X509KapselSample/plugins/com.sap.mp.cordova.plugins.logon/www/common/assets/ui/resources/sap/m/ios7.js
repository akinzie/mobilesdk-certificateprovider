/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";sap.ui.base.EventProvider.extend("sap.m._Ios7",{constructor:function(){var I=sap.ui.Device.os.ios&&sap.ui.Device.os.version>=7&&sap.ui.Device.os.version<8&&sap.ui.Device.browser.name==="sf";sap.ui.base.EventProvider.apply(this);if(!I){return}this._bIntervallAttached=false;this._bInputIsOpen=false;this._bNavigationBarEventFired=false;var b=window.orientation===90||window.orientation===-90;if(b){this._attachNavigationBarPolling()}sap.ui.Device.orientation.attachHandler(this._onOrientationChange,this);this._onFocusin=q.proxy(this._onFocusin,this);document.addEventListener("focusin",this._onFocusin,true);this._onFocusout=q.proxy(this._onFocusout,this);document.addEventListener("focusout",this._onFocusout,true)}});sap.m._Ios7.prototype.getNavigationBarHeight=function(){if(!this._bNavigationBarEventFired){return 0}return this._iNavigationBarHeight};sap.m._Ios7.prototype._attachNavigationBarPolling=function(){if(!sap.ui.Device.system.phone||this._bIntervallAttached){return}sap.ui.getCore().attachIntervalTimer(this._detectNavigationBar,this);this._bIntervallAttached=true};sap.m._Ios7.prototype._detachNavigationBarPolling=function(){if(!sap.ui.Device.system.phone||!this._bIntervallAttached){return}sap.ui.getCore().detachIntervalTimer(this._detectNavigationBar,this);this._bIntervallAttached=false};sap.m._Ios7.prototype._detectNavigationBar=function(){var h=window.outerHeight-window.innerHeight;if(h===0||this._bInputIsOpen||this._bNavigationBarEventFired){this._iPreviousHeight=null;return}if(this._iPreviousHeight===window.innerHeight){window.scrollTo(0,0);var n=window.outerHeight-window.innerHeight;if(h!==n){return}this._iNavigationBarHeight=h;this._bNavigationBarEventFired=true;this.fireEvent("navigationBarShownInLandscape",{barHeight:h});this._detachNavigationBarPolling();this._iPreviousHeight=null}else{this._iPreviousHeight=window.innerHeight}};sap.m._Ios7.prototype.destroy=function(){sap.ui.base.EventProvider.prototype.destroy.apply(this,arguments);document.removeEventListener("focusin",this._onFocusin,true);document.removeEventListener("focusout",this._onFocusout,true)};sap.m._Ios7.prototype._onFocusin=function(e){var t=e.target.tagName;if(!sap.m._Ios7._rTagRegex.test(t)){return}this._inputTarget=e.target;this._detachNavigationBarPolling();this._bInputIsOpen=true;this.fireEvent("inputOpened")};sap.m._Ios7._rTagRegex=/INPUT|TEXTAREA|SELECT/;sap.m._Ios7.prototype._onFocusout=function(e){var t=e.srcElement.tagName,r=e.relatedTarget,R=(r&&(r.getAttribute("readonly")===null)&&(r.getAttribute("disabled")===null))?r.tagName:"";if(sap.m._Ios7._rTagRegex.test(t)&&!sap.m._Ios7._rTagRegex.test(R)){window.scrollTo(0,0);if(window.orientation===90||window.orientation===-90){this._attachNavigationBarPolling()}this._bInputIsOpen=false;this.fireEvent("inputClosed")}};sap.m._Ios7.prototype._onOrientationChange=function(e){var I=e.landscape;window.scrollTo(0,0);this._bNavigationBarEventFired=false;if(this._bInputIsOpen&&this._inputTarget&&this._inputTarget.blur){this._inputTarget.blur()}else if(I){this._attachNavigationBarPolling()}else if(!I){this._detachNavigationBarPolling()}};var i=new sap.m._Ios7();return i},true);
