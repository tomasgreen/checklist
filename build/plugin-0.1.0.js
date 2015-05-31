(function () {
	'use strict';

	function _extend(sup, obj) {
		obj.prototype = Object.create(sup.prototype);
		obj.prototype.constructor = obj;
		return obj;
	}

	function _setOptions(opt) {
		if (opt === undefined) opt = {};
		var o = {};
		for (var i in defaults) o[i] = (opt[i] !== undefined) ? opt[i] : defaults[i];
		return o;
	}


	/* ************************************
	############## MY PLUGIN ##############
	************************************ */

	var defaults = {

	};

	var Base = function (options) {
		this.opt = _setOptions(options);
	};

	var BaseExtended = _extend(Base, function (options) {

		Base.call(this, options);
	});

	this.PluginName = function (options) {
		var instance = new BaseExtended(options);
		return instance;
	};

	this.PluginName.globals = defaults;

}).call(this);