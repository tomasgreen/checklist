(function() {
	'use strict';

	document.addEventListener('DOMContentLoaded', function() {
		var el = document.getElementById('checklist1');
		var data = [{
			text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
			done: false
		}, {
			text: 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
			done: true
		}, {
			text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
			done: false
		}, {
			text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			done: false
		}];
		var options = {};
		options.onUpdate = function(el, data) {
			console.log(data);
		};
		options.onDelete = function(el, data) {
			console.log(data);
		};
		options.onInsert = function(el, data) {
			console.log(data);
		};
		var a = new Checklist(el, null, options);
		a.insert(data[2]);
	});

}).call(this); /* not added */
