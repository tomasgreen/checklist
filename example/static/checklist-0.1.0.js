(function() {
	'use strict';
	var _animationEndEvents = 'webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationend',
		_animationStartEvents = 'webkitAnimationStart mozAnimationStart msAnimationStart oAnimationStart animationstart',
		_isTouchDevice = 'ontouchstart' in document.documentElement;
	/*
	 27-31 ulla
	 29-30 sara
	*/
	function _guid(todo, cb) {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		var id = s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
		cb(todo, id);
	}

	function _trim(str) {
		return str.replace(' ').replace(/(<([^>]+)>)/ig, "");
	}

	function _extend(sup, obj) {
		obj.prototype = Object.create(sup.prototype);
		obj.prototype.constructor = obj;
		return obj;
	}

	function _removeChildren(el) {
		if (!el || !el.firstChild) return;
		el.removeChild(el.firstChild);
		_removeChildren(el);
	}

	function _createElement(type, attr, parent, html) {
		var el, cls, id, arr;
		if (!attr) attr = {};
		if (type.indexOf('.') !== -1) {
			arr = type.split('.');
			type = arr[0];
			arr.shift();
			attr.class = arr.join(' ');
		}
		if (type.indexOf('#') !== -1) {
			arr = type.split('#');
			type = arr[0];
			attr.id = arr[1];
		}
		el = document.createElement(type);
		for (var i in attr) el.setAttribute(i, attr[i]);
		if (parent) parent.appendChild(el);
		if (html) el.innerHTML = html;
		return el;
	}

	function _removeNode(element) {
		if (!element || !element.parentNode) return;
		element.parentNode.removeChild(element);
		return undefined;
	}

	function _isTouchEvent(e) {
		return (e.toString().toLowerCase() == '[object touchevent]');
	}

	function _stopEventPropagation(e) {
		if (typeof e.stopPropagation === 'function') {
			e.stopPropagation();
			e.preventDefault();
		} else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
			window.event.cancelBubble = true;
		}
	}

	function _tapOn(el, func) {
		if (!_isTouchDevice) {
			_on(el, 'click', func);
			return;
		}
		var t = false;
		_on(el, 'touchstart', function(ev) {
			t = true;
		});
		_on(el, 'touchend', function(ev) {
			if (t) {
				func(ev);
				_stopEventPropagation(ev);
			}
		});
		_on(el, 'touchcancel touchleave touchmove', function(ev) {
			t = false;
		});
	}

	function _tapOff(el, func) {
		_off(el, 'touchstart touchend touchcancel click', func);
	}

	function _each(o, func) {
		if (!o || (o.length === 0 && o != window)) return;
		if (!o.length) func(o);
		else Array.prototype.forEach.call(o, function(el, i) {
			func(el);
		});
	}

	function _one(el, events, func, useCapture) {
		_on(el, events, function(ev) {
			func(ev);
			_off(el, events, func);
		}, useCapture);
	}

	function _on(els, events, func, useCapture) {
		_each(els, function(el) {
			var ev = events.split(' ');
			for (var e in ev) el.addEventListener(ev[e], func, useCapture);
		});
	}

	function _off(els, events, func) {
		_each(els, function(el) {
			var ev = events.split(' ');
			for (var e in ev) el.removeEventListener(ev[e], func);
		});
	}

	function _attr(els, attrib, value) {
		_each(els, function(el) {
			el.setAttribute(attrib, value);
		});
	}

	function _setOptions(opt) {
		if (opt === undefined) opt = {};
		var o = {};
		for (var i in defaults) o[i] = (opt[i] !== undefined) ? opt[i] : defaults[i];
		return o;
	}

	function _addClass(els, cls) {
		_each(els, function(el) {
			if (el.classList) {
				var arr = cls.split(' ');
				for (var i in arr) el.classList.add(arr[i]);
			} else el.className += ' ' + cls;
		});
	}

	function _removeClass(els, cls) {
		_each(els, function(el) {
			if (el.classList) {
				var arr = cls.split(' ');
				for (var i in arr) el.classList.remove(arr[i]);
			} else el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		});
	}

	function _animateCSS(el, cls, start, end) {
		if (start) _one(el, _animationEndEvents, start);
		_one(el, _animationEndEvents, function(ev) {
			_removeClass(el, cls);
			if (end) end(ev);
		});
		_addClass(el, cls);
	}

	function _findParent(el, cls) {
		if (!el || !cls) return null;
		if (_hasClass(el, cls)) return el;
		return _findParent(el.parentNode, cls);
	}

	function _hasClass(el, cls) {
		if (el.classList) return el.classList.contains(cls);
		else return new RegExp('(^| )' + cls + '( |$)', 'gi').test(el.className);
	}

	function _getData(el) {
		var t = el.querySelector('.todo-text');
		return {
			todo_id: el.getAttribute('todo-id'),
			done: (el.getAttribute('done') === 'true'),
			text: t.innerHTML
		};
	}

	/* ************************************
	############## MY PLUGIN ##############
	************************************ */

	var defaults = {
		iconChecked: '<span class="fa fa-check-square-o"></span>',
		iconUnchecked: '<span class="fa fa-square-o"></span>',
		iconDelete: '<span class="fa fa-trash-o"></span>',
		iconAdd: '<span class="fa fa-plus"></span>',
		onDelete: null,
		onInsert: null,
		onDone: null,
		onUpdate: null,
		placeholder: 'Write here',
		guidFunction: _guid
	};

	var Base = function(container, data, options) {
		this.container = container;
		this.opt = _setOptions(options);

		this.insertEl = _createElement('div.todo-insert', null, this.container);
		this.insertTextEl = _createElement('div.todo-text', {
			contenteditable: true,
			placeholder: this.opt.placeholder
		}, this.insertEl);
		this.listEl = _createElement('div.todo-list', null, this.container);
		if (data) {
			for (var i in data) {
				this.insert(data[i]);
			}
		}
		_on(this.insertTextEl, 'keydown', this.insertEvent.bind(this));
	};
	Base.prototype.insert = function(todo) {
		if (todo.todo_id === undefined) this.opt.guidFunction(todo, this.insertWithId.bind(this));
		else this.insertWithId();
	};
	Base.prototype.insertWithId = function(todo, id) {
		if (id) todo.todo_id = id;
		var el = _createElement('div.todo', {
			'done': todo.done,
			'todo-id': todo.todo_id
		});
		var c = _createElement('div.todo-checker', null, el, todo.done ? this.opt.iconChecked : this.opt.iconUnchecked);
		var t = _createElement('div.todo-text', {
			contenteditable: true
		}, el, todo.text);
		var d = _createElement('div.todo-delete', null, el, this.opt.iconDelete);

		_tapOn(c, this.checkEvent.bind(this));
		_tapOn(d, this.deleteEvent.bind(this));
		_on(t, 'blur', this.updateEvent.bind(this));
		this.listEl.insertBefore(el, this.listEl.firstChild);
		if (this.opt.onInsert) this.opt.onInsert(el, todo);
		_animateCSS(el, 'checklist-flipInX');
	};
	Base.prototype.delete = function(todo) {
		var el = this.listEl.querySelector('[todo-id="' + todo.todo_id + '"]');
		if (!el) return;

		_animateCSS(el, 'checklist-flipOutX', null, function(ev) {
			_removeNode(el);
			if (this.opt.onDelete) this.opt.onDelete(el, todo);
		});
	};
	Base.prototype.update = function(todo) {
		var el = this.listEl.querySelector('[todo-id="' + todo.todo_id + '"]');
		if (!el) return;
		var c = e.querySelector('.todo-checker');
		_attr(el, 'done', todo.done);
		el.innerHTML = todo.text;
		c.innerHTML = (todo.done) ? this.opt.iconChecked : this.opt.iconUnchecked;
		_animateCSS(el, 'checklist-pulse');
	};
	Base.prototype.insertEvent = function(ev) {
		var text = this.insertTextEl.innerHTML;
		if (!ev.shiftKey && ev.keyCode == 13 && _trim(text) !== '') {
			var todo = {
				text: text,
				done: false
			};
			this.insert(todo);
			this.insertTextEl.innerHTML = '';
			_stopEventPropagation(ev);
		}
	};
	Base.prototype.checkEvent = function(ev) {
		var el = _findParent(ev.srcElement, 'todo');
		var c = el.querySelector('.todo-checker');
		var todo = _getData(el);
		todo.done = !todo.done;
		c.innerHTML = (todo.done) ? this.opt.iconChecked : this.opt.iconUnchecked;
		_attr(el, 'done', todo.done);

		if (this.opt.onUpdate) this.opt.onUpdate(el, todo);
	};
	Base.prototype.updateEvent = function(ev) {
		var el = _findParent(ev.srcElement, 'todo');
		var todo = _getData(el);
		if (this.opt.onUpdate) this.opt.onUpdate(el, todo);
		_animateCSS(el, 'checklist-pulse');
	};
	Base.prototype.deleteEvent = function(ev) {
		console.log(ev);
		var el = _findParent(ev.srcElement, 'todo');
		var todo = _getData(el);
		var _this = this;
		_animateCSS(el, 'checklist-flipOutX', null, function(ev) {
			if (_this.opt.onDelete) _this.opt.onDelete(el, todo);
			_removeNode(el);
		});
		_stopEventPropagation(ev);
	};
	var BaseExtended = _extend(Base, function(container, data, options) {
		Base.call(this, container, data, options);
	});

	this.Checklist = function(container, data, options) {
		var instance = new BaseExtended(container, data, options);
		return instance;
	};

	this.Checklist.globals = defaults;

}).call(this);
