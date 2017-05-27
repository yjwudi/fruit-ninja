/**
 * a easy timeline manager
 * @version 1.0
 * @author dron
 */

var Ucren = require( "lib/ucren" );
var timerCache = {};
var timeline = {};

// var timer = timeline;
// <or>
// var timer = timeline.use( name ).init( 10 ); // to use a new timeline instance
// 
// var t = timer.createTask(...);
// t.stop();
// 
// timer.setTimeout(...);
// timer.setInterval(...);
// timer.getFPS();

function ClassTimer(){
    this.tasks = [];
    this.addingTasks = [];
    this.adding = 0;
}

/**
 * initialize timeline
 */
ClassTimer.prototype.init = function( ms ){
	var me = this;

	if( me.inited )
	    return ;
	else
		me.inited = 1;

	me.startTime = now();
	me.intervalTime = ms || 5;
	me.count = 0;

	me.intervalFn = function(){
	    me.count ++;
	    me.update( now() );
	};

	me.start();

	return me;
};


/**
 * create a task
 * @param  {Object} conf 	the config
 * @return {Task} 			a task instance
 */
ClassTimer.prototype.createTask = function( conf ){
	/* e.g. timer.createTask({
		start: 500, duration: 2000, data: [a, b, c,..], object: module, 
		onTimeUpdate: fn(time, a, b, c,..), onTimeStart: fn(a, b, c,..), onTimeEnd: fn(a, b, c,..),
		recycle: []
	}); */
	//这个createTask不是当前函数，而是下面那个，得到了一个task
	var task = createTask( conf );
	//unshift向数组开头添加元素
    this.addingTasks.unshift( task );
    this.adding = 1;

    if( conf.recycle )
    	this.taskList( conf.recycle, task );

    this.start();

    return task;
};

/**
 * use a array to recycle the task
 * @param  {Array} queue	be use for recycling task
 * @param  {Task} task 		a task instance		
 * @return {Array}			this queue
 */
ClassTimer.prototype.taskList = function( queue, task ){
	if( !queue.clear )
		queue.clear = function(){
			var i = this.length;
			while( i -- )
				task = this[i],
				task.stop(),
				this.splice( i, 1 );
			return this;
		};

	if( task )
	    queue.unshift( task );

	return queue;
};

/**
 * create a timer for once callback
 * @param {Function} fn 	callback function
 * @param {Number}   time 	time, unit: ms
 */
ClassTimer.prototype.setTimeout = function( fn, time ){
    // e.g. setTimeout(fn, time);
    return this.createTask({ start: time, duration: 0, onTimeStart: fn });
};

ClassTimer.prototype.setTimeout = function( fn1, fn2, time ){
    // e.g. setTimeout(fn, time);
    return this.createTask({ start: time, duration: 0, onTimeStart: fn1, onTimeUpdate:fn2 });
};

/**
 * create a timer for ongoing callback
 * @param {Function} fn 	callback function
 * @param {Number}   time 	time, unit: ms
 */
ClassTimer.prototype.setInterval = function( fn, time ){
    // e.g. setInterval(fn, time);
    /*
    setInterval() 方法可按照指定的周期（以毫秒计）来调用函数或计算表达式。
    setInterval() 方法会不停地调用函数，直到 clearInterval() 被调用或窗口被关闭
    */
    var timer = setInterval( fn, time );
    return {
    	stop: function(){
    	    clearInterval( timer );
    	}
    };
};

/**
 * get the current fps
 * @return {Number} fps number
 */
ClassTimer.prototype.getFPS = function(){
	var t = now(), c = this.count, fps = c / ( t - this.startTime ) * 1e3;
	if( c > 1e3 )
		this.count = 0,
		this.startTime = t;
	return fps;
};

// privates

ClassTimer.prototype.start = function(){
	//clearInterval() 方法可取消由 setInterval() 设置的 timeout
	//clearInterval() 方法的参数必须是由 setInterval() 返回的 ID 值。
	clearInterval( this.interval );
	this.interval = setInterval( this.intervalFn, this.intervalTime );
};

ClassTimer.prototype.stop = function(){
	clearInterval( this.interval );
};

ClassTimer.prototype.update = function( time ){
	var tasks = this.tasks, addingTasks = this.addingTasks, adding = this.adding;
	var i = tasks.length, t, task, start, duration, data;

	while( i -- ){
    	task = tasks[i];
    	start = task.start;
    	duration = task.duration;

    	if( time >= start ){

    		if( task.stopped ){
    			//从位置i开始删除1个元素
    		    tasks.splice( i, 1 );
    		    continue;
    		}

	    	checkStartTask( task );
	    	if( ( t = time - start ) < duration )
	    	    updateTask( task, t );
	    	else
	    		updateTask( task, duration ),
	    		task.onTimeEnd.apply( task.object, task.data.slice(1) ),
	    		tasks.splice( i, 1 );
    	}
	}

    if( adding )
    	tasks.unshift.apply( tasks, addingTasks ),
    	addingTasks.length = adding = 0;

    if( !tasks.length )
    	this.stop();
};

timeline.use = function( name ){
	var module;

	if( module = timerCache[ name ] )
	    return module;
	else
		module = timerCache[ name ] = new ClassTimer;

	return module;
};

/**
 * @functions
 */

var now = function(){
	return new Date().getTime();
};

var createTask = function( conf ){
	var object = conf.object || {};
	conf.start = conf.start || 0;
	return {
		//task的开始时间
		start: conf.start + now(),
		duration: conf.duration == -1 ? 86400000 : conf.duration,
		data: conf.data ? [ 0 ].concat( conf.data ) : [ 0 ],
		started: 0,
		object: object,
		//估计是开始时要执行的函数
		onTimeStart: conf.onTimeStart || object.onTimeStart || Ucren.nul,
		onTimeUpdate: conf.onTimeUpdate || object.onTimeUpdate || Ucren.nul,
		onTimeEnd: conf.onTimeEnd || object.onTimeEnd || Ucren.nul,
		stop: function(){
		    this.stopped = 1;
		}
	}
};

var updateTask = function( task, time ){
	var data = task.data;
	data[0] = time;
	//apply指调用onTimeUpdate方法，并传入参数
	task.onTimeUpdate.apply( task.object, data );
};

var checkStartTask = function( task ){
	if( !task.started )
		task.started = 1,
	    task.onTimeStart.apply( task.object, task.data.slice(1) ),
	    updateTask( task, 0 );
};

/**
 * for compatible the old version
 */
exports = timeline.use( "default" ).init( 10 );
exports.use = function( name ){
	if( Ucren.isIe )
	    exports;
	return timeline.use( name );
};