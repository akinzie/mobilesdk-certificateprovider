/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/Object','jquery.sap.script'],function(q,B){"use strict";var L=B.extend("sap.ui.core.util.LibraryInfo",{constructor:function(){B.apply(this);this._oLibInfos={}},destroy:function(){B.prototype.destroy.apply(this,arguments);this._oLibInfos={}},getInterface:function(){return this}});L.prototype._loadLibraryMetadata=function(l,c){l=l.replace(/\//g,".");if(this._oLibInfos[l]){q.sap.delayedCall(0,window,c,[this._oLibInfos[l]]);return}var u=q.sap.getModulePath(l,'/'),t=this;q.ajax({url:u+".library",dataType:"xml",error:function(x,s,e){q.sap.log.error("failed to load library details from '"+u+".library': "+s+", "+e);t._oLibInfos[l]={name:l,data:null,url:u};c(t._oLibInfos[l])},success:function(d,s,x){t._oLibInfos[l]={name:l,data:d,url:u};c(t._oLibInfos[l])}})};L.prototype._getLibraryInfo=function(l,c){this._loadLibraryMetadata(l,function(d){var r={libs:[],library:d.name,libraryUrl:d.url};if(d.data){var $=q(d.data);r.vendor=$.find("vendor").text();r.copyright=$.find("copyright").text();r.version=$.find("version").text();r.documentation=$.find("documentation").text()}c(r)})};L.prototype._getThirdPartyInfo=function(l,c){this._loadLibraryMetadata(l,function(d){var r={libs:[],library:d.name,libraryUrl:d.url};if(d.data){var $=q(d.data).find("appData").find("thirdparty").children();$.each(function(i,o){if(o.nodeName==="lib"){var a=q(o);var b=a.children("license");r.libs.push({displayName:a.attr("displayName"),homepage:a.attr("homepage"),license:{url:b.attr("url"),type:b.attr("type"),file:d.url+b.attr("file")}})}})}c(r)})};L.prototype._getDocuIndex=function(l,c){this._loadLibraryMetadata(l,function(d){var a=d.name,b=d.url,r={"docu":{},library:a,libraryUrl:b};if(!d.data){c(r);return}var D=q(d.data).find("appData").find("documentation");var u=D.attr("indexUrl");if(!u){c(r);return}if(D.attr("resolve")=="lib"){u=d.url+u}q.ajax({url:u,dataType:"json",error:function(x,s,e){q.sap.log.error("failed to load library docu from '"+u+"': "+s+", "+e);c(r)},success:function(d,s,x){d.library=a;d.libraryUrl=b;c(d)}})})};return L},true);
