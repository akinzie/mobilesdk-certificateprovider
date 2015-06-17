/*
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/Device','sap/ui/base/ManagedObject','sap/ui/thirdparty/sinon'],function(q,D,M,d){"use strict";if(!!D.browser.internet_explorer){q.sap.require("sap.ui.thirdparty.sinon-ie")}var f=M.extend("sap.ui.core.util.MockServer",{constructor:function(i,s,S){M.apply(this,arguments);f._aServers.push(this)},metadata:{properties:{rootUri:"string",requests:{type:"object[]",defaultValue:[]}}},_oServer:null,_aFilter:null,_oMockdata:null,_oMetadata:null,_sMetadataUrl:null,_sMockdataBaseUrl:null,_mEntitySets:null});f.prototype.start=function(){this._oServer=f._getInstance();this._aFilters=[];var r=this.getRequests();var l=r.length;for(var i=0;i<l;i++){var R=r[i];this._addRequestHandler(R.method,R.path,R.response)}};f.prototype.stop=function(){if(this.isStarted()){this._removeAllRequestHandlers();this._removeAllFilters();this._oServer=null}};f.prototype.isStarted=function(){return!!this._oServer};f.prototype._applyQueryOnCollection=function(F,Q,e){var a=Q.split('=');var o=a[1];if(o===""){return}if(o.lastIndexOf(',')===o.length){q.sap.log.error("The URI is violating the construction rules defined in the Data Services specification!");throw new Error("400")}switch(a[0]){case"$top":if(!(new RegExp(/^\d+$/).test(o))){q.sap.log.error("Invalid system query options value!");throw new Error("400")}F.results=F.results.slice(0,o);break;case"$skip":if(!(new RegExp(/^\d+$/).test(o))){q.sap.log.error("Invalid system query options value!");throw new Error("400")}F.results=F.results.slice(o,F.results.length);break;case"$orderby":F.results=this._getOdataQueryOrderby(F.results,o);break;case"$filter":F.results=this._recursiveOdataQueryFilter(F.results,o);break;case"$select":F.results=this._getOdataQuerySelect(F.results,o);break;case"$inlinecount":var c=this._getOdataInlineCount(F.results,o);if(c){F.__count=c}break;case"$expand":F.results=this._getOdataQueryExpand(F.results,o,e);break;case"$format":F.results=this._getOdataQueryFormat(F.results,o);break;default:q.sap.log.error("Invalid system query options value!");throw new Error("400")}};f.prototype._applyQueryOnEntry=function(e,Q,E){var a=Q.split('=');var o=a[1];if(o===""){return}if(o.lastIndexOf(',')===o.length){q.sap.log.error("The URI is violating the construction rules defined in the Data Services specification!");throw new Error("400")}switch(a[0]){case"$filter":return this._recursiveOdataQueryFilter([e],o)[0];case"$select":return this._getOdataQuerySelect([e],o)[0];case"$expand":return this._getOdataQueryExpand([e],o,E)[0];case"$format":return this._getOdataQueryFormat([e],o);default:q.sap.log.error("Invalid system query options value!");throw new Error("400")}};f.prototype._getOdataQueryOrderby=function(c,o){var p=o.split(',');var t=this;q.each(p,function(i,P){p[i]=t._trim(P)});var C=function compare(a,b){for(var i=0;i<p.length;i++){var s=p[i].split(' ');var S=1;if(s.length>1){switch(s[1]){case'asc':S=1;break;case'desc':S=-1;break;default:q.sap.log.error("Invalid sortorder '"+s[1]+"' detected!");throw new Error("400")}}var P,e;var h=s[0].indexOf("/");if(h!==-1){P=s[0].substring(h+1);e=s[0].substring(0,h);if(!a[e].hasOwnProperty(P)){q.sap.log.error("Property "+P+" not found!");throw new Error("400")}if(a[e][P]<b[e][P]){return-1*S}if(a[e][P]>b[e][P]){return 1*S}}else{P=s[0];if(!a.hasOwnProperty(P)){q.sap.log.error("Property "+P+" not found!");throw new Error("400")}if(a[P]<b[P]){return-1*S}if(a[P]>b[P]){return 1*S}}}return 0};return c.sort(C)};f.prototype._arrayUnique=function(b){var a=b.concat();for(var i=0;i<a.length;++i){for(var j=i+1;j<a.length;++j){if(a[i]===a[j]){a.splice(j--,1)}}}return a};f.prototype._getBracketIndices=function(s){var S=[];var r=false;var i,e=0;for(var c=0;c<s.length;c++){if(s[c]==='('){if(/[substringof|endswith|startswith]$/.test(s.substring(0,c))){r=true}else{S.push(s[c]);if(i===undefined){i=c}}}else if(s[c]===')'){if(!r){S.pop();e=c;if(S.length===0){return{start:i,end:e}}}else{r=false}}}return{start:i,end:e}};f.prototype._recursiveOdataQueryFilter=function(a,o){var I=this._getBracketIndices(o);if(I.start===0&&I.end===o.length-1){o=this._trim(o.substring(I.start+1,I.end));return this._recursiveOdataQueryFilter(a,o)}var r=/([^substringof|endswith|startswith]|^)\((.*)\)/,s,p;var O;if(r.test(o)){var b=o.substring(I.start,I.end+1);var c=new RegExp("(.*) +(or|and) +("+this._trim(this._escapeStringForRegExp(b))+".*)");if(I.start===0){c=new RegExp("("+this._trim(this._escapeStringForRegExp(b))+") +(or|and) +(.*)")}var e=c.exec(o);var E=e[1];O=e[2];var h=e[3];var S=this._recursiveOdataQueryFilter(a,E);if(O==="or"){s=this._recursiveOdataQueryFilter(a,h);return this._arrayUnique(S.concat(s))}if(O==="and"){return this._recursiveOdataQueryFilter(S,h)}}else{p=o.split(/ +and | or +/);if(p.length===1){if(o.match(/ +and | or +/)){throw new Error("400")}return this._getOdataQueryFilter(a,this._trim(o))}var R=this._recursiveOdataQueryFilter(a,p[0]);var j;for(var i=1;i<p.length;i++){j=new RegExp(this._trim(this._escapeStringForRegExp(p[i-1]))+" +(and|or) +"+this._trim(this._escapeStringForRegExp(p[i])));O=j.exec(o)[1];if(O==="or"){s=this._recursiveOdataQueryFilter(a,p[i]);R=this._arrayUnique(R.concat(s))}if(O==="and"){R=this._recursiveOdataQueryFilter(R,p[i])}}return R}};f.prototype._getOdataQueryFilter=function(a,o){if(a.length===0){return a}var r=new RegExp("(.*) (eq|ne|gt|lt|le|ge) (.*)");var b=new RegExp("(endswith|startswith|substringof)\\((.*)");var O=null;var c=r.exec(o);if(c){O=c[2]}else{c=b.exec(o);if(c){O=c[1]}else{throw new Error("400")}}var t=this;var G=function(v,V,p,s){var c,e,P;if(!v){c=r.exec(o);e=t._trim(c[V+1]);P=t._trim(c[p+1])}else{var h=new RegExp("(substringof|startswith|endswith)\\(([^,\\)]*),(.*)\\)");c=h.exec(o);e=t._trim(c[V+2]);P=t._trim(c[p+2])}if(e.indexOf("datetime")===0){e=t._getJsonDate(e)}else if(e==="true"){e=true}else if(e==="false"){e=false}else if(t._isValidNumber(e)){e=parseFloat(e)}else if((e.charAt(0)==="'")&&(e.charAt(e.length-1)==="'")){e=e.substr(1,e.length-2)}var C=P.indexOf("/");if(C!==-1){var i=P.substring(C+1);var j=P.substring(0,C);if(!a[0][j].hasOwnProperty(i)){q.sap.log.error("Property "+i+" not found!");throw new Error("400")}return s(P,e,j,i)}else{if(!a[0].hasOwnProperty(P)){q.sap.log.error("Property "+P+" not found for "+a[0].__metadata.type+"!");throw new Error("400")}return s(P,e)}};switch(O){case"substringof":return G(true,0,1,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P].indexOf(v)!==-1)}return(m[p].indexOf(v)!==-1)})});case"startswith":return G(true,1,0,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P].indexOf(v)===0)}return(m[p].indexOf(v)===0)})});case"endswith":return G(true,1,0,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P].indexOf(v)===(m[C][P].length-v.length))}return(m[p].indexOf(v)===(m[p].length-v.length))})});case"eq":return G(false,2,0,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P]===v)}return(m[p]===v)})});case"ne":return G(false,2,0,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P]!==v)}return(m[p]!==v)})});case"gt":return G(false,2,0,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P]>v)}return(m[p]>v)})});case"lt":return G(false,2,0,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P]<v)}return(m[p]<v)})});case"ge":return G(false,2,0,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P]>=v)}return(m[p]>=v)})});case"le":return G(false,2,0,function(p,v,C,P){return q.grep(a,function(m){if(C&&P){return(m[C][P]<=v)}return(m[p]<=v)})});default:q.sap.log.error("Invalid $filter operator '"+O+"'!");throw new Error("400")}};f.prototype._getOdataQuerySelect=function(a,o){var t=this;var p,c;var P=o.split(',');var s=[];var b;var C=function(P,e,b){if(e["__metadata"]){b["__metadata"]=e["__metadata"]}q.each(P,function(i,h){var j=h.indexOf("/");if(j!==-1){p=h.substring(j+1);c=h.substring(0,j);if(!b[c]){b[c]={}}b[c]=C([p],e[c],b[c])}else{if(e&&!e.hasOwnProperty(h)){q.sap.log.error("Resource not found for the selection clause '"+h+"'!");throw new Error("404")}b[h]=e[h]}});return b};if(q.inArray("*",P)!==-1){return a}q.each(P,function(i,e){P[i]=t._trim(e)});q.each(a,function(i,e){b={};s.push(C(P,e,b))});return s};f.prototype._getOdataInlineCount=function(a,o){var p=o.split(',');if(p.length!==1||(p[0]!=='none'&&p[0]!=='allpages')){q.sap.log.error("Invalid system query options value!");throw new Error("400")}if(p[0]==='none'){return}return a.length};f.prototype._getOdataQueryFormat=function(a,o){if(o!=='json'){q.sap.log.error("Unsupported format value. Only json format is supported!");throw new Error("400")}return a};f.prototype._getOdataQueryExpand=function(a,o,e){var t=this;var n=o.split(',');q.each(n,function(i,p){n[i]=t._trim(p)});var E=t._mEntitySets[e].navprops;q.each(a,function(i,r){q.each(n,function(i,N){var b=N.split("/");var s=b[0];if(!r[s]){throw new Error("404")}var c=r[s].results||r[s];if(!c||!!c.__deferred){c=q.extend(true,[],t._resolveNavigation(e,r,s))}else if(!q.isArray(c)){c=[c]}if(!!c&&b.length>1){var R=b.splice(1,b.length).join("/");c=t._getOdataQueryExpand(c,R,E[s].to.entitySet)}if(E[s].to.multiplicity==="*"){r[s]={results:c}}else{r[s]=c[0]?c[0]:{}}})});return a};f.prototype._refreshData=function(){this._loadMetadata(this._sMetadataUrl);this._mEntitySets=this._findEntitySets(this._oMetadata);if(!this._sMockdataBaseUrl){this._generateMockdata(this._mEntitySets,this._oMetadata)}else{if(!q.sap.endsWith(this._sMockdataBaseUrl,"/")&&!q.sap.endsWith(this._sMockdataBaseUrl,".json")){this._sMockdataBaseUrl+="/"}this._loadMockdata(this._mEntitySets,this._sMockdataBaseUrl)}};f.prototype._getRootUri=function(){var u=this.getRootUri();u=u&&/([^?#]*)([?#].*)?/.exec(u)[1];return u};f.prototype._loadMetadata=function(m){var o=q.sap.sjax({url:m,dataType:"xml"}).data;this._oMetadata=o;return o};f.prototype._findEntitySets=function(m){var e={};var p=q(m).find("Principal");var o=q(m).find("Dependent");q(m).find("EntitySet").each(function(i,E){var $=q(E);var a=/((.*)\.)?(.*)/.exec($.attr("EntityType"));e[$.attr("Name")]={"name":$.attr("Name"),"schema":a[2],"type":a[3],"keys":[],"keysType":{},"navprops":{}}});var r=function(R,F){var a=q(m).find("End[Role="+R+"]");var E;var s;q.each(a,function(i,v){if(!!q(v).attr("EntitySet")){E=q(v).attr("EntitySet")}else{s=q(v).attr("Multiplicity")}});var P=[];var b=(F)?p:o;q(b).each(function(i,c){if(R===(q(c).attr("Role"))){q(c).children("PropertyRef").each(function(i,h){P.push(q(h).attr("Name"))});return false}});return{"role":R,"entitySet":E,"propRef":P,"multiplicity":s}};q.each(e,function(E,a){var $=q(m).find("EntityType[Name="+a.type+"]");var k=q($).find("PropertyRef");q.each(k,function(i,P){var K=q(P).attr("Name");a.keys.push(K);a.keysType[K]=q($).find("Property[Name="+K+"]").attr("Type")});var n=q(m).find("EntityType[Name="+a.type+"] NavigationProperty");q.each(n,function(i,N){var b=q(N);a.navprops[b.attr("Name")]={"name":b.attr("Name"),"from":r(b.attr("FromRole"),true),"to":r(b.attr("ToRole"),false)}})});return e};f.prototype._findEntityTypes=function(m){var e={};q(m).find("EntityType").each(function(i,E){var $=q(E);e[$.attr("Name")]={"name":$.attr("Name"),"properties":[],"keys":[]};$.find("Property").each(function(i,p){var P=q(p);var t=P.attr("Type");e[$.attr("Name")].properties.push({"schema":t.substring(0,t.lastIndexOf(".")),"type":t.substring(t.lastIndexOf(".")+1),"name":P.attr("Name"),"precision":P.attr("Precision"),"scale":P.attr("Scale")})});$.find("PropertyRef").each(function(i,k){var K=q(k);var p=K.attr("Name");e[$.attr("Name")].keys.push(p)})});return e};f.prototype._findComplexTypes=function(m){var c={};q(m).find("ComplexType").each(function(i,C){var $=q(C);c[$.attr("Name")]={"name":$.attr("Name"),"properties":[]};$.find("Property").each(function(i,p){var P=q(p);var t=P.attr("Type");c[$.attr("Name")].properties.push({"schema":t.substring(0,t.lastIndexOf(".")),"type":t.substring(t.lastIndexOf(".")+1),"name":P.attr("Name"),"precision":P.attr("Precision"),"scale":P.attr("Scale")})})});return c};f.prototype._createKeysString=function(e,E){var t=this;var k="";if(E){q.each(e.keys,function(i,K){if(k){k+=","}var o=E[K];if(e.keysType[K]==="Edm.String"){o="'"+o+"'"}else if(e.keysType[K]==="Edm.DateTime"){o=t._getDateTime(o)}else if(e.keysType[K]==="Edm.Guid"){o="guid'"+o+"'"}if(e.keys.length===1){k+=o;return k}k+=K+"="+o})}return k};f.prototype._loadMockdata=function(e,b){var t=this,m={};this._oMockdata={};var l=function(u,E){var r=q.sap.sjax({url:u,dataType:"json"});if(r.success){if(!!r.data.d){if(!!r.data.d.results){m[E.name]=r.data.d.results}else{q.sap.log.error("The mockdata format for entity set \""+E.name+"\" invalid")}}else{m[E.name]=r.data}return true}else{if(r.status==="parsererror"){q.sap.log.error("The mockdata for entity set \""+E.name+"\" could not be loaded due to a parsing error!")}return false}};if(q.sap.endsWith(b,".json")){var r=q.sap.sjax({url:b,dataType:"json"});if(r.success){m=r.data}else{q.sap.log.warning("The mockdata for all the entity types could not be found at \""+b+"\"!")}}else{q.each(e,function(E,o){if(!m[o.type]||!m[o.name]){var s=b+o.name+".json";if(!l(s,o)){q.sap.log.warning("The mockdata for entity set \""+o.name+"\" could not be found at \""+b+"\"!");var a=b+o.type+".json";if(!l(a,o)){q.sap.log.warning("The mockdata for entity type \""+o.type+"\" could not be found at \""+b+"\"!");if(!!t._bGenerateMissingMockData){var c={};c[o.name]=o;m[o.type]=t._generateODataMockdataForEntitySet(c,t._oMetadata)[o.name]}}}}})}q.each(e,function(E,o){t._oMockdata[E]=[];if(m[o.name]){q.each(m[o.name],function(i,a){t._oMockdata[E].push(q.extend(true,{},a))})}else if(m[o.type]){q.each(m[o.type],function(i,a){t._oMockdata[E].push(q.extend(true,{},a))})}if(t._oMockdata[E].length>0){t._enhanceWithMetadata(o,t._oMockdata[E])}});return this._oMockdata};f.prototype._enhanceWithMetadata=function(e,m){if(m){var t=this,r=this._getRootUri(),E=e&&e.name;q.each(m,function(i,o){o.__metadata={id:r+E+"("+t._createKeysString(e,o)+")",type:e.schema+"."+e.type,uri:r+E+"("+t._createKeysString(e,o)+")"};q.each(e.navprops,function(k,n){o[k]={__deferred:{uri:r+E+"("+t._createKeysString(e,o)+")/"+k}}})})}};f.prototype._isRequestedKeysValid=function(e,r){if(r.length===1){var s=r[0].split('=');if(this._trim(s[0])!==e.keys[0]){r=[e.keys[0]+"="+r[0]]}}for(var i=0;i<r.length;i++){var k=this._trim(r[i].substring(0,r[i].indexOf('=')));var R=this._trim(r[i].substring(r[i].indexOf('=')+1));var F=R.charAt(0);var l=R.charAt(R.length-1);if(e.keysType[k]==="Edm.String"){if(F!=="'"||l!=="'"){return false}}else if(e.keysType[k]==="Edm.DateTime"){if(F==="'"||l!=="'"){return false}}else if(e.keysType[k]==="Edm.Guid"){if(F==="'"||l!=="'"){return false}}else{if(F==="'"||l==="'"){return false}}}return true};f.prototype._parseKeys=function(k,e){var r={};var p=k.split(",");var K,s,P;for(var i=0;i<p.length;i++){P=p[i].split("=");if(P.length===1&&e.keys.length===1){K=e.keys[0];s=P[0]}else{if(P.length===2){K=P[0];s=P[1]}}if(s.indexOf('\'')===0){r[K]=s.slice(1,s.length-1)}else{r[K]=s}}return r};f.prototype._generatePropertyValue=function(k,t,C,i){var I=i;if(!I){I=Math.floor(Math.random()*10000)+101}switch(t){case"String":return k+" "+I;case"DateTime":var a=new Date();a.setFullYear(2000+Math.floor(Math.random()*20));a.setDate(Math.floor(Math.random()*30));a.setMonth(Math.floor(Math.random()*12));a.setMilliseconds(0);return"/Date("+a.getTime()+")/";case"Int16":case"Int32":case"Int64":return Math.floor(Math.random()*10000);case"Decimal":return Math.floor(Math.random()*1000000)/100;case"Boolean":return Math.random()<0.5;case"Byte":return Math.floor(Math.random()*10);case"Double":return Math.random()*10;case"Single":return Math.random()*1000000000;case"SByte":return Math.floor(Math.random()*10);case"Time":return Math.floor(Math.random()*23)+":"+Math.floor(Math.random()*59)+":"+Math.floor(Math.random()*59);case"Guid":return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16)});case"Binary":var n=Math.floor(-2147483648+Math.random()*4294967295),m="";for(var b=0,e=n;b<32;b++,m+=String(e>>>31),e<<=1);return m;case"DateTimeOffset":default:return this._generateDataFromEntity(C[t],I)}};f.prototype._completeKey=function(e,k,E){if(E){for(var i=0;i<e.keys.length;i++){var K=e.keys[i];if(k[K]){if(!E[K]){switch(e.keysType[K]){case"Edm.DateTime":E[K]=this._getJsonDate(k[K]);break;case"Edm.Guid":E[K]=k[K].substring(5,k[K].length-1);break;default:E[K]=k[K]}}}else{if(!E[K]){E[K]=this._generatePropertyValue(K,e.keysType[K].substring(e.keysType[K].lastIndexOf('.')+1))}}}}};f.prototype._generateDataFromEntity=function(e,I,c){var E={};if(!e){return E}for(var i=0;i<e.properties.length;i++){var p=e.properties[i];E[p.name]=this._generatePropertyValue(p.name,p.type,c,I)}return E};f.prototype._generateDataFromEntitySet=function(e,E,c){var o=E[e.type];var m=[];for(var i=0;i<100;i++){m.push(this._generateDataFromEntity(o,i+1,c))}return m};f.prototype._generateMockdata=function(e,m){var t=this;var o={};q.each(e,function(E,a){var b={};b[a.name]=a;o[E]=t._generateODataMockdataForEntitySet(b,m)[E]});this._oMockdata=o};f.prototype._generateODataMockdataForEntitySet=function(e,m){var t=this,r=this._getRootUri(),o={};var E=this._findEntityTypes(m);var c=this._findComplexTypes(m);q.each(e,function(s,a){o[s]=t._generateDataFromEntitySet(a,E,c);q.each(o[s],function(i,b){b.__metadata={uri:r+s+"("+t._createKeysString(a,b)+")",type:a.schema+"."+a.type};q.each(a.navprops,function(k,n){b[k]={__deferred:{uri:r+s+"("+t._createKeysString(a,b)+")/"+k}}})})});return o};f.prototype._resolveNavigation=function(e,F,n){var E=this._mEntitySets[e];var N=E.navprops[n];if(!N){throw new Error("404")}var a=[];var p=N.from.propRef.length;if(p===0){if(N.to.multiplicity==="*"){return this._oMockdata[N.to.entitySet]}else{a.push(this._oMockdata[N.to.entitySet][0]);return a}}q.each(this._oMockdata[N.to.entitySet],function(I,t){var b=true;for(var i=0;i<p;i++){if(F[N.from.propRef[i]]!==t[N.to.propRef[i]]){b=false;break}}if(b){a.push(t)}});return a};f.prototype.simulate=function(m,v){var t=this;this._sMetadataUrl=m;if(!v||typeof v==="string"){this._sMockdataBaseUrl=v}else{this._sMockdataBaseUrl=v.sMockdataBaseUrl;this._bGenerateMissingMockData=v.bGenerateMissingMockData}this._refreshData();var h=function(x,H){if(x.requestHeaders["x-csrf-token"]==="Fetch"){H["X-CSRF-Token"]="42424242424242424242424242424242"}};var G=function(e,k){k=decodeURIComponent(k);var F;var E=t._mEntitySets[e];var K=E.keys;var b=k.split(',');if(b.length!==K.length||!t._isRequestedKeysValid(E,b)){return F}if(b.length===1&&!b[0].split('=')[1]){b=[K[0]+"="+b[0]]}q.each(t._oMockdata[e],function(I,o){for(var i=0;i<b.length;i++){var c=b[i].split('=');var s=t._trim(c[0]);if(q.inArray(s,K)===-1){return true}var n=t._trim(c[1]);var O=o[s];switch(E.keysType[s]){case"Edm.String":n=n.replace(/^\'|\'$/g,'');break;case"Edm.Time":case"Edm.DateTime":O=t._getDateTime(O);break;case"Edm.Int16":case"Edm.Int32":case"Edm.Int64":case"Edm.Decimal":case"Edm.Byte":case"Edm.Double":case"Edm.Single":case"Edm.SByte":if(!t._isValidNumber(n)){return false}n=parseFloat(n);break;case"Edm.Guid":n=n.replace(/^guid\'|\'$/g,'');break;case"Edm.Boolean":case"Edm.Binary":case"Edm.DateTimeOffset":default:n=n}if(O!==n){return true}}F={index:I,entry:o};return false});return F};var r=function(e,k,u){var s=e.name;var n;if(u){n=e.navprops[u]}if(n){s=n.to.entitySet}return s};var a=function(x,T,k,u){var e=JSON.parse(x.requestBody);if(e){var K={};if(k){K=t._parseKeys(k,t._mEntitySets[T])}t._completeKey(t._mEntitySets[T],K,e);t._enhanceWithMetadata(t._mEntitySets[T],[e]);return e}return null};var R=[];R.push({method:"GET",path:new RegExp("\\$metadata([?#].*)?"),response:function(x){q.sap.require("jquery.sap.xml");q.sap.log.debug("MockServer: incoming request for url: "+x.url);var H={"Content-Type":"application/xml;charset=utf-8"};h(x,H);x.respond(200,H,q.sap.serializeXML(t._oMetadata));q.sap.log.debug("MockServer: response sent with: 200, "+q.sap.serializeXML(t._oMetadata))}});R.push({method:"GET",path:new RegExp("$"),response:function(x){q.sap.log.debug("MockServer: incoming request for url: "+x.url);var H={"Content-Type":"application/json;charset=utf-8"};h(x,H);var e=[];q.each(t._mEntitySets,function(E,b){e.push(E)});var o={EntitySets:e};x.respond(200,H,JSON.stringify({d:o}));q.sap.log.debug("MockServer: response sent with: 200, "+JSON.stringify({d:o}))}});R.push({method:"POST",path:new RegExp("\\$batch([?#].*)?"),response:function(x){q.sap.log.debug("MockServer: incoming request for url: "+x.url);var b=function(U){switch(U){case 200:return"200 OK";case 204:return"204 No Content";case 201:return"201 Created";case 400:return"400 Bad Request";case 404:return"404 Not Found";default:break}};var B=function(A,U){var V=JSON.stringify(A.data)||"";if(U){return"HTTP/1.1 "+b(A.statusCode)+"\r\nContent-Type: "+U+"\r\nContent-Length: "+V.length+"\r\ndataserviceversion: 2.0\r\n\r\n"+V+"\r\n"}return"HTTP/1.1 "+b(A.statusCode)+"\r\nContent-Type: application/json\r\nContent-Length: "+V.length+"\r\ndataserviceversion: 2.0\r\n\r\n"+V+"\r\n"};var s=x.requestBody;var o=new RegExp("--batch_[a-z0-9-]*");var c=o.exec(s)[0];if(!!c){var e=[];var l=s.split(c);var S=x.url.split("$")[0];var n=new RegExp("PUT (.*) HTTP");var p=new RegExp("MERGE (.*) HTTP");var u=new RegExp("POST (.*) HTTP");var w=new RegExp("DELETE (.*) HTTP");var y=new RegExp("GET (.*) HTTP");for(var i=1;i<l.length-1;i++){var z=l[i];if(y.test(z)&&z.indexOf("multipart/mixed")===-1){if(n.test(z)||u.test(z)||w.test(z)){x.respond(400,null,"The Data Services Request could not be understood due to malformed syntax");q.sap.log.debug("MockServer: response sent with: 400");return}var A=q.sap.sjax({url:S+y.exec(z)[1],dataType:"json"});var C;if(y.exec(z)[1].indexOf('$count')!==-1){C=B(A,"text/plain")}else{C=B(A)}e.push("\r\nContent-Type: application/http\r\n"+"Content-Length: "+C.length+"\r\n"+"content-transfer-encoding: binary\r\n\r\n"+C)}else{var E=q.extend(true,{},t._oMockdata);var F=[];var H=function(U,L,V){var A=q.sap.sjax({type:V,url:S+U.exec(K)[1],dataType:"json",data:L});if(A.statusCode===400||A.statusCode===404){var P="\r\nHTTP/1.1 "+b(A.statusCode)+"\r\nContent-Type: application/json\r\nContent-Length: 0\r\n\r\n";throw new Error(P)}F.push(B(A))};var I=z.substring(z.indexOf("boundary=")+9,z.indexOf("\r\n\r\n"));var J=z.split("--"+I);try{for(var j=1;j<J.length-1;j++){var K=J[j];var L;if(y.test(K)){t._oMockdata=E;x.respond(400,null,"The Data Services Request could not be understood due to malformed syntax");q.sap.log.debug("MockServer: response sent with: 400");return}else if(n.test(K)){L=K.substring(K.indexOf("{"),K.lastIndexOf("}")+1).replace(/\\/g,'');H(n,L,'PUT')}else if(p.test(K)){L=K.substring(K.indexOf("{"),K.lastIndexOf("}")+1).replace(/\\/g,'');H(p,L,'MERGE')}else if(u.test(K)){L=K.substring(K.indexOf("{"),K.lastIndexOf("}")+1).replace(/\\/g,'');H(u,L,'POST')}else if(w.test(K)){H(w,null,'DELETE')}}var N="\r\nContent-Type: multipart/mixed; boundary=ejjeeffe1\r\n\r\n--ejjeeffe1";for(var k=0;k<F.length;k++){N+="\r\nContent-Type: application/http\r\n"+"Content-Length: "+F[k].length+"\r\n"+"content-transfer-encoding: binary\r\n\r\n"+F[k]+"--ejjeeffe1"}N+="--\r\n";e.push(N)}catch(O){t._oMockdata=E;var P="\r\nContent-Type: application/http\r\n"+"Content-Length: "+O.message.length+"\r\n"+"content-transfer-encoding: binary\r\n\r\n"+O.message;e.push(P)}}}var Q="--ejjeeffe0";for(var i=0;i<e.length;i++){Q+=e[i]+"--ejjeeffe0"}Q+="--";var T={'Content-Type':"multipart/mixed; boundary=ejjeeffe0"};h(x,T);x.respond(202,T,Q);q.sap.log.debug("MockServer: response sent with: 202, "+Q)}else{x.respond(202)}}});q.each(this._mEntitySets,function(E,o){R.push({method:"GET",path:new RegExp("("+E+")/\\$count/?(.*)?"),response:function(x,E,u){q.sap.log.debug("MockServer: incoming request for url: "+x.url);var H={"Content-Type":"text/plain;charset=utf-8"};h(x,H);var b=t._oMockdata[E];if(b){var F={results:q.extend(true,[],b)};if(u){var U=decodeURIComponent(u).replace("?","&").split("&");try{if(U.length>1){U=t._orderQueryOptions(U)}q.each(U,function(i,Q){t._applyQueryOnCollection(F,Q,E)})}catch(e){q.sap.log.error("MockServer: request failed due to invalid system query options value!");x.respond(parseInt(e.message||e.number,10));return}}x.respond(200,H,""+F.results.length);q.sap.log.debug("MockServer: response sent with: 200, "+F.results.length)}else{x.respond(404);q.sap.log.debug("MockServer: response sent with: 404")}}});R.push({method:"GET",path:new RegExp("("+E+")/?(\\?(.*))?"),response:function(x,E,u){q.sap.log.debug("MockServer: incoming request for url: "+x.url);var H={"Content-Type":"application/json;charset=utf-8"};h(x,H);var b=t._oMockdata[E];if(b){var F={results:q.extend(true,[],b)};if(u){var U=decodeURIComponent(u).replace("?","&").split("&");try{if(U.length>1){U=t._orderQueryOptions(U)}q.each(U,function(i,Q){t._applyQueryOnCollection(F,Q,E)})}catch(e){q.sap.log.error("MockServer: request failed due to invalid system query options value!");x.respond(parseInt(e.message||e.number,10));return}}x.respond(200,H,JSON.stringify({d:F}));q.sap.log.debug("MockServer: response sent with: 200, "+JSON.stringify({d:F}))}else{x.respond(404);q.sap.log.debug("MockServer: response sent with: 404")}}});R.push({method:"GET",path:new RegExp("("+E+")\\(([^/\\?#]+)\\)/?(\\?(.*))?"),response:function(x,E,k,u){q.sap.log.debug("MockServer: incoming request for url: "+x.url);var H={"Content-Type":"application/json;charset=utf-8"};var b=q.extend(true,{},G(E,k));if(!q.isEmptyObject(b)){if(u){var U=decodeURIComponent(u).replace("?","&").split("&");try{if(U.length>1){U=t._orderQueryOptions(U)}q.each(U,function(i,Q){b.entry=t._applyQueryOnEntry(b.entry,Q,E)})}catch(e){x.respond(parseInt(e.message||e.number,10));q.sap.log.debug("MockServer: response sent with: "+parseInt(e.message||e.number,10));return}}x.respond(200,H,JSON.stringify({d:b.entry}));q.sap.log.debug("MockServer: response sent with: 200, "+JSON.stringify({d:b.entry}))}else{x.respond(404);q.sap.log.debug("MockServer: response sent with: 404")}}});q.each(o.navprops,function(n,N){R.push({method:"GET",path:new RegExp("("+E+")\\(([^/\\?#]+)\\)/("+n+")/\\$count/?(.*)?"),response:function(x,E,k,s,u){q.sap.log.debug("MockServer: incoming request for url: "+x.url);var H={"Content-Type":"text/plain;charset=utf-8"};h(x,H);var b=G(E,k);if(b){var c,F={};try{c=t._resolveNavigation(E,b.entry,s);var i=t._mEntitySets[E].navprops[s].to.multiplicity;if(i==="*"){F={results:q.extend(true,[],c)}}else{F=q.extend(true,{},c[0])}if(c&&c.length!==0){if(u){var U=decodeURIComponent(u).replace("?","&").split("&");if(U.length>1){U=t._orderQueryOptions(U)}if(i==="*"){q.each(U,function(I,Q){t._applyQueryOnCollection(F,Q,t._mEntitySets[E].navprops[s].to.entitySet)})}else{q.each(U,function(I,Q){F=t._applyQueryOnEntry(F,Q,t._mEntitySets[E].navprops[s].to.entitySet)})}}}x.respond(200,H,""+F.results.length);q.sap.log.debug("MockServer: response sent with: 200, "+F.results.length);return}catch(e){x.respond(parseInt(e.message||e.number,10));q.sap.log.debug("MockServer: response sent with: "+parseInt(e.message||e.number,10));return}}else{x.respond(404);q.sap.log.debug("MockServer: response sent with: 404")}}});R.push({method:"GET",path:new RegExp("("+E+")\\(([^/\\?#]+)\\)/("+n+")/?(\\?(.*))?"),response:function(x,E,k,s,u){q.sap.log.debug("MockServer: incoming request for url: "+x.url);var H={"Content-Type":"application/json;charset=utf-8"};h(x,H);var b=G(E,k);if(b){var c,F={};try{c=t._resolveNavigation(E,b.entry,s);var i=t._mEntitySets[E].navprops[s].to.multiplicity;if(i==="*"){F={results:q.extend(true,[],c)}}else{F=q.extend(true,{},c[0])}if(c&&c.length!==0){if(u){var U=decodeURIComponent(u).replace("?","&").split("&");if(U.length>1){U=t._orderQueryOptions(U)}if(i==="*"){q.each(U,function(I,Q){t._applyQueryOnCollection(F,Q,t._mEntitySets[E].navprops[s].to.entitySet)})}else{q.each(U,function(I,Q){F=t._applyQueryOnEntry(F,Q,t._mEntitySets[E].navprops[s].to.entitySet)})}}}x.respond(200,H,JSON.stringify({d:F}));q.sap.log.debug("MockServer: response sent with: 200, "+JSON.stringify({d:F}));return}catch(e){x.respond(parseInt(e.message||e.number,10));q.sap.log.debug("MockServer: response sent with: "+parseInt(e.message||e.number,10));return}}x.respond(404);q.sap.log.debug("MockServer: response sent with: 404")}})});R.push({method:"POST",path:new RegExp("("+E+")(\\(([^/\\?#]+)\\)/?(.*)?)?"),response:function(x,E,b,k,n){if(x.requestHeaders["x-http-method"]==="MERGE"){return q.sap.sjax({type:'MERGE',url:x.url,data:x.requestBody})}q.sap.log.debug("MockServer: incoming create request for url: "+x.url);var s=null;var c=null;var i=405;var T=r(o,decodeURIComponent(k),n);if(T){var e=a(x,T,k,n);if(e){var u=t._getRootUri()+T+"("+t._createKeysString(t._mEntitySets[T],e)+")";s=JSON.stringify({d:e,uri:u});c={"Content-Type":"application/json;charset=utf-8"};t._oMockdata[T]=t._oMockdata[T].concat([e]);i=201}}x.respond(i,c,s);q.sap.log.debug("MockServer: response sent with: "+i+", "+s)}});R.push({method:"PUT",path:new RegExp("("+E+")\\(([^/\\?#]+)\\)/?(.*)?"),response:function(x,E,k,n){q.sap.log.debug("MockServer: incoming update request for url: "+x.url);var i=405;var s=null;var b=null;var T=r(o,decodeURIComponent(k),n);if(T){var e=a(x,T,k,n);if(e){b={"Content-Type":"application/json;charset=utf-8"};var c=G(E,k);if(c){t._oMockdata[E][c.index]=e}i=204}}x.respond(i,b,s);q.sap.log.debug("MockServer: response sent with: "+i+", "+s)}});R.push({method:"MERGE",path:new RegExp("("+E+")\\(([^/\\?#]+)\\)/?(.*)?"),response:function(x,E,k,n){q.sap.log.debug("MockServer: incoming merge update request for url: "+x.url);var i=405;var s=null;var b=null;var T=r(o,decodeURIComponent(k),n);if(T){var e=a(x,T,k,n);if(e){b={"Content-Type":"application/json;charset=utf-8"};var c=G(E,k);if(c){q.extend(t._oMockdata[E][c.index],e)}i=204}}x.respond(i,b,s);q.sap.log.debug("MockServer: response sent with: "+i+", "+s)}});R.push({method:"PATCH",path:new RegExp("("+E+")\\(([^/\\?#]+)\\)/?(.*)?"),response:function(x,E,k,n){q.sap.log.debug("MockServer: incoming patch update request for url: "+x.url);var i=405;var s=null;var b=null;var T=r(o,decodeURIComponent(k),n);if(T){var e=a(x,T,k,n);if(e){b={"Content-Type":"application/json;charset=utf-8"};var c=G(E,k);if(c){q.extend(t._oMockdata[E][c.index],e)}i=204}}x.respond(i,b,s);q.sap.log.debug("MockServer: response sent with: "+i+", "+s)}});R.push({method:"DELETE",path:new RegExp("("+E+")\\(([^/\\?#]+)\\)/?(.*)?"),response:function(x,E,k,u){q.sap.log.debug("MockServer: incoming delete request for url: "+x.url);var i=204;var e=G(E,k);if(e){t._oMockdata[E].splice(e.index,1)}else{i=400}x.respond(i,null,null);q.sap.log.debug("MockServer: response sent with: "+i)}})});this.setRequests(R)};f.prototype._orderQueryOptions=function(u){var F,i,s,t,o,S,e,a,O=[];q.each(u,function(I,Q){switch(Q.split('=')[0]){case"$top":t=q.inArray(Q,u);break;case"$skip":s=q.inArray(Q,u);break;case"$orderby":o=q.inArray(Q,u);break;case"$filter":F=q.inArray(Q,u);break;case"$select":S=q.inArray(Q,u);break;case"$inlinecount":i=q.inArray(Q,u);break;case"$expand":e=q.inArray(Q,u);break;case"$format":a=q.inArray(Q,u);break;default:if(Q.split('=')[0].indexOf('$')===0){q.sap.log.error("Invalid system query options value!");throw new Error("400")}}});if(F>=0){O.push(u[F])}if(i>=0){O.push(u[i])}if(o>=0){O.push(u[o])}if(s>=0){O.push(u[s])}if(t>=0){O.push(u[t])}if(e>=0){O.push(u[e])}if(S>=0){O.push(u[S])}if(a>=0){O.push(u[a])}return O};f.prototype._removeAllRequestHandlers=function(){var r=this.getRequests();var l=r.length;for(var i=0;i<l;i++){f._removeResponse(r[i].response)}};f.prototype._removeAllFilters=function(){for(var i=0;i<this._aFilters.length;i++){f._removeFilter(this._aFilters[i])}this._aFilters=null};f.prototype._addRequestHandler=function(m,p,r){m=m?m.toUpperCase():m;if(typeof m!=="string"){throw new Error("Error in request configuration: value of 'method' has to be a string")}if(!(typeof p==="string"||p instanceof RegExp)){throw new Error("Error in request configuration: value of 'path' has to be a string or a regular expression")}if(typeof r!=="function"){throw new Error("Error in request configuration: value of 'response' has to be a function")}var u=this._getRootUri();u=u&&new RegExp(this._escapeStringForRegExp(u));if(p&&!(p instanceof RegExp)){p=new RegExp(this._createRegExpPattern(p))}var R=this._createRegExp(u?u.source+p.source:p.source);this._addFilter(this._createFilter(m,R));this._oServer.respondWith(m,R,r);q.sap.log.debug("MockServer: adding "+m+" request handler for pattern "+R)};f.prototype._createRegExp=function(p){return new RegExp("^"+p+"$")};f.prototype._createRegExpPattern=function(p){return p.replace(/:([\w\d]+)/g,"([^\/]+)")};f.prototype._escapeStringForRegExp=function(s){return s.replace(/[\\\/\[\]\{\}\(\)\-\*\+\?\.\^\$\|]/g,"\\$&")};f.prototype._trim=function(s){return s&&s.replace(/^\s+|\s+$/g,"")};f.prototype._isValidNumber=function(s){return!isNaN(parseFloat(s))&&isFinite(s)};f.prototype._getDateTime=function(s){if(!s){return}return"datetime'"+new Date(Number(s.replace("/Date(",'').replace(")/",''))).toJSON().substring(0,19)+"'"};f.prototype._getJsonDate=function(S){if(!S){return}var n=function(s){var a=q.map(s.slice(0,-5).split(/\D/),function(i){return parseInt(i,10)||0});a[1]-=1;a=new Date(Date.UTC.apply(Date,a));var o=s.slice(-5);var b=parseInt(o,10)/100;if(o.slice(0,1)==="+"){b*=-1}a.setHours(a.getHours()+b);return a.getTime()};return"/Date("+n(S.substring("datetime'".length,S.length-1))+")/"};f.prototype._addFilter=function(F){this._aFilters.push(F);f._addFilter(F)};f.prototype._createFilter=function(r,R){return function(m,u,a,U,p){return r===m&&R.test(u)}};f.prototype.destroy=function(s){M.prototype.destroy.apply(this,arguments);this.stop();var S=f._aServers;var i=q.inArray(this,S);S.splice(i,1)};f._aFilters=[];f._oServer=null;f._aServers=[];f._getInstance=function(){if(!this._oServer){this._oServer=window.sinon.fakeServer.create();this._oServer.autoRespond=true}return this._oServer};f.config=function(c){var s=this._getInstance();s.autoRespond=c.autoRespond===false?false:true;s.autoRespondAfter=c.autoRespondAfter||0;s.fakeHTTPMethods=c.fakeHTTPMethods||false};f.respond=function(){this._getInstance().respond()};f.startAll=function(){for(var i=0;i<this._aServers.length;i++){this._aServers[i].start()}};f.stopAll=function(){for(var i=0;i<this._aServers.length;i++){this._aServers[i].stop()}this._getInstance().restore();this._oServer=null};f.destroyAll=function(){this.stopAll();for(var i=0;i<this._aServers.length;i++){this._aServers[i].destroy()}};f._addFilter=function(F){this._aFilters.push(F)};f._removeFilter=function(F){var i=q.inArray(F,this._aFilters);if(i!==-1){this._aFilters.splice(i,1)}return i!==-1};f._removeResponse=function(r){var R=this._oServer.responses;var l=R.length;for(var i=0;i<l;i++){if(R[i].response===r){R.splice(i,1);return true}}return false};window.sinon.FakeXMLHttpRequest.useFilters=true;window.sinon.FakeXMLHttpRequest.addFilter(function(m,u,a,U,p){var F=f._aFilters;for(var i=0;i<F.length;i++){var b=F[i];if(b(m,u,a,U,p)){return false}}return true});var g=function(F){if(/.*\.json$/i.test(F)){return"JSON"}if(/.*\.xml$/i.test(F)){return"XML"}if(/.*metadata$/i.test(F)){return"XML"}return null};window.sinon.FakeXMLHttpRequest.prototype.respondFile=function(s,h,F){var r=q.sap.sjax({url:F,dataType:"text"});if(!r.success){throw new Error("Could not load file from: "+F)}var o=r.data;var m=g(F);if(this["respond"+m]){this["respond"+m](s,h,o)}else{this.respond(s,h,o)}};window.sinon.FakeXMLHttpRequest.prototype.respondJSON=function(s,h,j){h=h||{};h["Content-Type"]=h["Content-Type"]||"application/json";this.respond(s,h,typeof j==="string"?j:JSON.stringify(j))};window.sinon.FakeXMLHttpRequest.prototype.respondXML=function(s,h,x){h=h||{};h["Content-Type"]=h["Content-Type"]||"application/xml";this.respond(s,h,x)};return f},true);
