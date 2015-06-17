/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./ListItemBase','./library','sap/ui/core/EnabledPropagator','sap/ui/core/IconPool'],function(q,L,l,E,I){"use strict";var S=L.extend("sap.m.StandardListItem",{metadata:{library:"sap.m",properties:{title:{type:"string",group:"Misc",defaultValue:null},description:{type:"string",group:"Misc",defaultValue:null},icon:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},iconInset:{type:"boolean",group:"Appearance",defaultValue:true},iconDensityAware:{type:"boolean",group:"Misc",defaultValue:true},activeIcon:{type:"sap.ui.core.URI",group:"Misc",defaultValue:null},info:{type:"string",group:"Misc",defaultValue:null},infoState:{type:"sap.ui.core.ValueState",group:"Misc",defaultValue:sap.ui.core.ValueState.None},adaptTitleSize:{type:"boolean",group:"Appearance",defaultValue:true}}}});S.prototype.exit=function(){if(this._image){this._image.destroy()}L.prototype.exit.apply(this,arguments)};S.prototype._getImage=function(i,s,a,b){var o=this._image;if(o){o.setSrc(a);if(o instanceof sap.m.Image){o.setDensityAware(b)}}else{o=I.createControlByURI({id:i,src:a,densityAware:b},sap.m.Image).setParent(this,null,true)}if(o instanceof sap.m.Image){o.addStyleClass(s,true)}else{o.addStyleClass(s+"Icon",true)}this._image=o;return this._image};S.prototype._activeHandlingInheritor=function(){var i=sap.ui.getCore().byId(this.getId()+"-img");if(i instanceof sap.ui.core.Icon){i.$().toggleClass("sapMSLIIconActive",this._active)}if(i&&this.getActiveIcon()){i.setSrc(this.getActiveIcon())}};S.prototype._inactiveHandlingInheritor=function(){var i=sap.ui.getCore().byId(this.getId()+"-img");if(i instanceof sap.ui.core.Icon){i.$().toggleClass("sapMSLIIconActive",this._active)}if(i){i.setSrc(this.getIcon())}};return S},true);
