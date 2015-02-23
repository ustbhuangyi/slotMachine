(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define('animation', ['timeline', 'imageloader'], factory);
  } else {
    root.__slot__ = root.__slot__ || {};
    root.__slot__.animation = factory(root.__slot__.timeline, root.__slot__.imageloader);
  }
})(this, function (Timeline, loadImage) {

  var STATE_UNINITED = 0;
  var STATE_INITED = 1;
  var STATE_STOP = 2;

  var TIMELINE = 1;

  function next(callback) {
    callback && callback();
  }

  function Animation() {
    this.taskQueue = [];
    this.timeline = new Timeline();
    this.state = STATE_UNINITED;
    this.index = 0;
  }

  Animation.prototype = {
    loadImage: function (imglist) {
      if (typeof imglist === 'string') {
        imglist = [imglist];
      }
      return this._add(function (success) {
        //load image
        loadImage(imglist.slice(), success);
        imglist = null;
      });
    },
    changePosition: function (ele, positions) {
      var len = positions.length;
      var index = 0;
      var last = false;
      var me = this;
      return this._add(len ? function (success, time) {
        index = (time / me.interval) | 0;
        last = index >= len - 1;
        index = Math.min(index, len - 1);
        //change posistions
        var position = positions[index].split(" ");
        ele.style.backgroundPosition = position[0] + "px " + position[1] + "px";
        if (last) {
          success();
        }
      } : next, TIMELINE);
    },
    changeSrc: function (ele, imglist) {
      var len = imglist.length;
      var index = 0;
      var last = false;
      var me = this;
      return this._add(len ? function (success, time) {
        index = (time / me.interval) | 0;
        last = index >= len - 1;
        index = Math.min(index, len - 1);
        //change src
        ele.src = imglist[index];
        if (last) {
          success();
        }
      } : next, TIMELINE);
    },
    then: function (callback) {
      return this._add(function (success) {
        callback();
        success();
      });
    },
    enterFrame: function (callback) {
      return this._add(callback, TIMELINE);
    },
    repeat: function (times) {
      var me = this;
      return this._add(function () {
        if (times) {
          if (!--times) {
            var item = me.taskQueue[me.index];
            me.index++;
            item.wait ? setTimeout(function () {
              me._next();
            }, item.wait) : me._next();
          }
          else {
            me.index--;
            me._next();
          }
        }
        else {
          me.index--;
          me._next();
        }

      });
    },
    repeatForever: function () {
      return this.repeat();
    },
    start: function (interval) {
      if (this.state == STATE_INITED)
        return this;
      this.state = STATE_INITED;
      var queue = this.taskQueue;
      if (!queue.length)
        return this;
      this.interval = interval;
      this._next();
      return this;

    },
    pause: function () {
      this.state = STATE_STOP;
      this.timeline.stop();
      return this;
    },
    wait: function (time) {
      var queue = this.taskQueue;
      if (queue && queue.length) {
        queue[queue.length - 1].wait = time;
      }
      return this;
    },
    dispose: function () {
      this.taskQueue = null;
      this.timeline && this.timeline.stop();
      this.timeline = null;
      this.state = STATE_UNINITED;
    },
    _add: function (task, type) {
      this.taskQueue.push({task: task, type: type});
      return this;
    },
    _next: function () {
      if (!this.taskQueue || this.state == STATE_STOP)
        return;
      if (this.index == this.taskQueue.length) {
        this.dispose();
        return;
      }
      var item = this.taskQueue[this.index];
      if (item.type == TIMELINE) {
        this._enterframe(item.task);
      }
      else {
        this._excuteTask(item.task);
      }
    },
    _excuteTask: function (task) {
      var me = this;
      task(function () {
        if (!me.taskQueue)
          return;
        var item = me.taskQueue[me.index];
        me.index++;
        item.wait ? setTimeout(function () {
          me._next();
        }, item.wait) : me._next();

      });
    },
    _enterframe: function (task) {
      var me = this;

      this.timeline.onenterframe = enter;
      this.timeline.start(this.interval);

      function enter(time) {
        task(function () {
          if (!me.taskQueue)
            return;
          var item = me.taskQueue[me.index];
          me.timeline.stop();
          me.index++;
          item.wait ? setTimeout(function () {
            me._next();
          }, item.wait) : me._next();
        }, time);
      }
    },
    constructor: Animation
  }

  return function () {
    return new Animation();
  };
});
