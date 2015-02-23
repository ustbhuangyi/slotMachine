(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define('timeline', factory);
  } else {
    root.__slot__ = root.__slot__ || {};
    root.__slot__.timeline = factory();
  }
})(this, function () {

  var DEFAULT_INTERVAL = 1000 / 60;

  var requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
        // if all else fails, use setTimeout
      function (callback) {
        return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
      };
  })();

  // handle multiple browsers for cancelAnimationFrame()
  var cancelAnimationFrame = (function () {
    return window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.oCancelAnimationFrame ||
      function (id) {
        window.clearTimeout(id);
      };
  })();

  function Timeline() {
    this.animationHandler = 0;
  }

  // declared onenterframe as an abstract method in Timeline
  // and implemented onenterframe in the concrete subclasses.
  Timeline.prototype.onenterframe = function (time) {
    // body...
  };

  Timeline.prototype.start = function (interval) {
    var me = this;
    var lastTick = 0;
    var startTime = +new Date();

    me.interval = interval || DEFAULT_INTERVAL;
    //this.onenterframe(new Date - startTime);
    me.startTime = startTime;
    me.stop();
    nextTick();

    function nextTick() {
      var now = +new Date();

      me.animationHandler = requestAnimationFrame(nextTick);

      if (now - lastTick >= me.interval) {
        me.onenterframe(now - startTime);
        lastTick = now;
      }
    }
  };

  Timeline.prototype.restart = function () {

    var me = this;
    if (!me.dur || !me.interval)
      return;

    var lastTick = 0;
    var interval = me.interval;
    var startTime = +new Date() - me.dur;

    me.startTime = startTime;
    me.stop();
    nextTick();

    function nextTick() {
      var now = +new Date();

      me.animationHandler = requestAnimationFrame(nextTick);

      if (now - lastTick >= interval) {
        me.onenterframe(now - startTime);
        lastTick = now;
      }
    }
  };

  Timeline.prototype.stop = function () {
    if (this.startTime) {
      this.dur = +new Date() - this.startTime;
    }
    cancelAnimationFrame(this.animationHandler);
  };


  return Timeline;
});
