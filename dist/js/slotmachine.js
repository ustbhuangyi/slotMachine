(function ($) {
  var baseEasings = {};

  $.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (i, name) {
    baseEasings[name] = function (p) {
      return Math.pow(p, i + 2);
    };
  });

  $.extend(baseEasings, {
    Sine: function (p) {
      return 1 - Math.cos(p * Math.PI / 2);
    },
    Circ: function (p) {
      return 1 - Math.sqrt(1 - p * p);
    },
    Elastic: function (p) {
      return p === 0 || p === 1 ? p :
      -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
    },
    Back: function (p) {
      return p * p * (3 * p - 2);
    },
    Bounce: function (p) {
      var pow2,
        bounce = 4;

      while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) { }
      return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);

    }
  });

  $.each(baseEasings, function (name, easeIn) {
    $.easing["easeIn" + name] = easeIn;
    $.easing["easeOut" + name] = function (p) {
      return 1 - easeIn(1 - p);
    };
    $.easing["easeInOut" + name] = function (p) {
      return p < 0.5 ?
      easeIn(p * 2) / 2 :
      1 - easeIn(p * -2 + 2) / 2;
    };
  });

})(jQuery);

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define('format', factory);
  } else {
    root.__slot__ = root.__slot__ || {};
    root.__slot__.format = factory();
  }
})(this, function () {
  function format(source, opts) {
    var data = Array.prototype.slice.call(arguments, 1);
    var toString = Object.prototype.toString;
    if (data.length) {
      /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
      data = data.length == 1 ? (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) : data;
      return source.replace(/#\{(.+?)\}/g, function (match, key) {
        if (!data) return '';
        var filters = key.split("|");
        var replacer = data[filters[0]];
        // chrome 下 typeof /a/ == 'function'
        if ('[object Function]' == toString.call(replacer)) {
          replacer = replacer(filters[0] /*key*/);
        }
        for (var i = 1, len = filters.length; i < len; ++i) {
          var func = format.filters[filters[i]];
          if ('[object Function]' == toString.call(func)) {
            replacer = func(replacer);
          }
        }
        return (('undefined' == typeof replacer || replacer === null) ? '' : replacer);
      });
    }
    return source;
  }

  format.filters = {
    'escapeJs': function (str) {
      if (!str || 'string' != typeof str) return str;
      var ret = [];
      for (var i = 0, len = str.length; i < len; ++i) {
        var charCode = str.charCodeAt(i);
        if (charCode > 255) {
          ret.push(str.charAt(i));
        } else {
          ret.push('\\x' + charCode.toString(16));
        }
      }
      return ret.join('');
    },
    'escapeString': function (str) {
      if (!str || 'string' != typeof str) return str;
      return str.replace(/["'<>\\\/`]/g, function ($0) {
        return '&#' + $0.charCodeAt(0) + ';';
      });
    },
    'escapeUrl': function (str) {
      if (!str || 'string' != typeof str) return str;
      return encodeURIComponent(str);
    },
    'toInt': function (str) {
      return parseInt(str, 10) || 0;
    }
  };

  format.filters.js = format.filters.escapeJs;
  format.filters.e = format.filters.escapeString;
  format.filters.u = format.filters.escapeUrl;
  format.filters.i = format.filters.toInt;

  return format;
});

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define('imageloader', factory);
  } else {
    root.__slot__ = root.__slot__ || {};
    root.__slot__.imageloader = factory();
  }
})(this, function () {
  var __id = 0;

  function getId() {
    return ++__id;
  }

  function loadImage(images, callback, timeout) {

    var count = 0;
    var success = true;
    var isTimeout = false;
    var timeoutId;
    var items = [];
    for (var key in images) {
      if (!images.hasOwnProperty(key))
        continue;
      var item = images[key];

      if (typeof (item) == 'string') {
        item = images[key] = {
          src: item
        };
      }

      if (!item || !item.src)
        continue;

      count++;
      item.id = "__img_" + key + getId();
      item.img = window[item.id] = new Image();
      items.push(item);
    }

    if (!count) {
      callback(success);
    } else {
      for (var i = 0, len = items.length; i < len; i++) {
        doLoad(items[i]);
      }
      if (timeout) {
        timeoutId = setTimeout(onTimeout, timeout);
      }
    }

    function doLoad(item) {
      var img = item.img;
      var id = item.id;

      item.status = "loading";

      img.onload = function () {
        success = success && true;
        item.status = "loaded";
        done();
      };
      img.onerror = function () {
        success = false;
        item.status = "error";
        done();
      };
      img.src = item.src;

      function done() {
        img.onload = img.onerror = null;

        try {
          //IE doesn't support this
          delete window[id];
        }
        catch (e) {

        }
        if (!--count && !isTimeout) {
          clearTimeout(timeoutId);
          callback(success);
        }
      }
    }

    function onTimeout() {
      isTimeout = true;
      callback(false);
    }
  }

  return loadImage;
});

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

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    return define('animation', ['format', 'animation'], factory);
  } else {
    root.__slot__ = root.__slot__ || {};
    root.__slot__.animation = factory(root.__slot__.format, root.__slot__.animation);
  }
})(this, function (format, animation) {

  var NAMESPACE = 'lottery.';
  var WIDGET_NAME = 'slotmachine';

  var START_EVENT = 'start';
  var RUNNING_EVENT = 'running';
  var END_EVENT = 'end';

  var STATE_END = 0;
  var STATE_START = 1;
  var STATE_RUNNING = 2;

  var WHEEL_LEN = 3;

  var lightsMap = ['-420 -49', '-420 -675', '-420 -362'];
  var handleMap = ['-27 -23', '-253 -23', '-27 -289', '-245 -288', '-27 -289', '-253 -23', '-27 -23'];

  var FX_FAST = 'slotMachineBlurFast';
  var FX_SLOW = 'slotMachineBlurSlow';
  var FX_GRADIENT = 'slotMachineGradient';


  var slotMachineBlurFilterFastString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">' +
    '<filter id="slotMachineBlurFilterFast">' +
    '<feGaussianBlur stdDeviation="5" />' +
    '</filter>' +
    '</svg>#slotMachineBlurFilterFast';

  var slotMachineBlurFilterMediumString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">' +
    '<filter id="slotMachineBlurFilterMedium">' +
    '<feGaussianBlur stdDeviation="3" />' +
    '</filter>' +
    '</svg>#slotMachineBlurFilterMedium';

  var slotMachineBlurFilterSlowString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">' +
    '<filter id="slotMachineBlurFilterSlow">' +
    '<feGaussianBlur stdDeviation="1" />' +
    '</filter>' +
    '</svg>#slotMachineBlurFilterSlow';

  var slotMachineFadeMaskString = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="0" height="0">' +
    '<mask id="slotMachineFadeMask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">' +
    '<linearGradient id="slotMachineFadeGradient" gradientUnits="objectBoundingBox" x="0" y="0">' +
    '<stop stop-color="white" stop-opacity="0" offset="0"></stop>' +
    '<stop stop-color="white" stop-opacity="1" offset="0.25"></stop>' +
    '<stop stop-color="white" stop-opacity="1" offset="0.75"></stop>' +
    '<stop stop-color="white" stop-opacity="0" offset="1"></stop>' +
    '</linearGradient>' +
    '<rect x="0" y="-1" width="1" height="1" transform="rotate(90)" fill="url(#slotMachineFadeGradient)"></rect>' +
    '</mask>' +
    '</svg>#slotMachineFadeMask';

  $(document).ready(function () {
    $('body').append('<style>' +
    '.' + FX_FAST + '{-webkit-filter: blur(3px);-moz-filter: blur(3px);-o-filter: blur(3px);-ms-filter: blur(3px);filter: blur(3px);filter: url("data:image/svg+xml;utf8,' + slotMachineBlurFilterMediumString + '");filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="3")}' +
    '.' + FX_SLOW + '{-webkit-filter: blur(1px);-moz-filter: blur(1px);-o-filter: blur(1px);-ms-filter: blur(1px);filter: blur(1px);filter: url("data:image/svg+xml;utf8,' + slotMachineBlurFilterSlowString + '");filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="1")}' +
    '.' + FX_GRADIENT + '{' +
    '-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(0,0,0,0)), color-stop(25%, rgba(0,0,0,1)), color-stop(75%, rgba(0,0,0,1)), color-stop(100%, rgba(0,0,0,0)) );' +
    'mask: url("data:image/svg+xml;utf8,' + slotMachineFadeMaskString + '");' +
    '}' +
    '</style>');
  })


  $.widget(NAMESPACE + WIDGET_NAME, {
    options: {
      //奖品图
      prizeUrl: "image/slot-prize.png",
      //背景图
      bgUrl: "image/slot-bg.png",
      //奖品数量，一般为偶数
      count: 8,
      //加速时间,单位秒
      acceleration: 1,
      //减速时间，单位秒
      deceleration: 2,
      //匀速转动需要转的圈数
      runTimes: [1, 2, 3],
      //是否有把手
      handle: false,
      //是否有灯
      lights: false,
      //每个奖品的高度，也就是滚动的步长
      stepLen: 57,
      //老虎机模板
      tpl: [
        '<div class="lottery-slotmachine">',
        '<div style="background:url(#{bgUrl})" class="slot-bg">',
        '<div class="slot-icon handle handle-hook" style="display:none">',
        '</div>',
        '<div class="machine">',
        '<ul class="scene scene-hook">',
        '<li class="wheel wheel-hook"><img src="#{prizeUrl}"/></li>',
        '<li class="wheel wheel-hook"><img src="#{prizeUrl}"/></li>',
        '<li class="wheel wheel-hook"><img src="#{prizeUrl}"/></li>',
        '</ul>',
        '<div class="slot-icon lights lights-hook" style="display:none">',
        '</div>',
        '</div>',
        '<div class="start">',
        '<a hidefocus="true" href="#" class="btn slot-icon start-hook"></a>',
        '</div>',
        '</div>',
        '</div>'
      ].join(''),
      //抽奖按钮按下状态
      activeCls: 'btn-active',
      //抽奖按钮Hover状态
      hoverCls: 'btn-hover'
    },
    _create: function () {

      var opt = this.options;
      var ctx = this.element;

      ctx.html(format(opt.tpl, {
        bgUrl: opt.bgUrl,
        prizeUrl: opt.prizeUrl
      }));

      if (opt.lights) {
        this._setOption('lights', lightsMap);
      }
      if (opt.handle) {
        this._setOption('handle', handleMap);
      }

      this.$start = $('.start-hook', ctx);
      this.$wheels = $('.wheel-hook', ctx);
      this.$scene = $('.scene-hook', ctx);

      this._bindEvent();
    },
    _init: function () {
      var opt = this.options;
      var ctx = this.element;
      var count = opt.count;
      var stepLen = opt.stepLen;

      this.state = STATE_END;

      //老虎机转一圈的长度
      this.circleLen = count * stepLen + ((count + 1) / 2 | 0) * stepLen;

      for (var i = 0; i < WHEEL_LEN; i++) {
        this.$wheels.eq(i).css({"marginTop": -stepLen * i * 3});
      }

      //摇把
      if (opt.handle) {
        this.$handle = $('.handle-hook', ctx);
        this.$handle.show();
      }

      //彩灯
      if (opt.lights) {
        this.$lights = $('.lights-hook', ctx);
        this.$lights.show();
        //彩灯动画
        animation().changePosition(this.$lights[0], opt.lights).repeatForever().start(200);
      }
    },
    //事件绑定
    _bindEvent: function () {
      var me = this;
      var opt = me.options;
      me.$start.on('mousedown', function () {
        $(this).addClass(opt.activeCls);
      }).on('mouseover', function () {
        $(this).addClass(opt.hoverCls);
      }).on('mouseout', function () {
        $(this).removeClass(opt.hoverCls);
        $(this).removeClass(opt.activeCls);
      }).on('mouseup', function () {
        $(this).removeClass(opt.activeCls);
      }).on('click', function () {
        if (me.state > STATE_START)
          return false;
        me.state = STATE_START;
        me._trigger(START_EVENT);

        return false;
      });

    },
    //游戏开始，老虎机开始转
    _gameStart: function (id) {
      var opt = this.options;
      var len = WHEEL_LEN;
      //先产生最终停止的位置
      this.positions = [];
      //没中奖
      if (id === 0) {
        this._generateNotWinPositions();
      } else {
        while (len--) {
          this.positions.push(this._getPosition(id));
        }
      }

      if (opt.handle) {
        animation().changePosition(this.$handle[0], opt.handle).start(80);
      }

      //老虎机开始跑
      this._wheelRun(id);

      this._trigger(RUNNING_EVENT);
    },
    //生成未中奖的停止位置
    _generateNotWinPositions: function () {
      var opt = this.options;
      var count = opt.count;
      var len = WHEEL_LEN;

      //一半几率产生三个相同的logo，也是未中奖的一种形式
      if (Math.random() < 0.5) {
        var position = -(Math.random() * count / 2 | 0) * 3 * opt.stepLen;
        while (len--) {
          if (len === 0) { //让logo错开
            position -= opt.stepLen;
          }
          this.positions.push(position);
        }
      }
      //随机3个不同的数
      else {
        var hash = {};
        while (len--) {
          var id = Math.random() * count | 0 + 1;
          if (hash[id] === WHEEL_LEN - 1) {
            id = (id + 1) % count;
          }
          hash[id] ? hash[id]++ : (hash[id] = 1);
          this.positions.push(this._getPosition(id));
        }
      }
    },
    //得到老虎机停止位置
    _getPosition: function (id) {
      var opt = this.options;
      var stepLen = opt.stepLen;
      return -(id * stepLen + ((id - 1) / 2 | 0) * stepLen);
    },
    //老虎机开始转动
    _wheelRun: function () {
      var me = this;
      var opt = me.options;
      var acceleration = opt.acceleration;
      var deceleration = opt.deceleration;
      var runTimes = opt.runTimes.slice();
      var circleLen = me.circleLen;
      var refCount = WHEEL_LEN;

      me.$scene.addClass(FX_GRADIENT);

      for (var i = 0; i < WHEEL_LEN; i++) {
        (function (index) {
          //单个轮子
          var $wheel = me.$wheels.eq(index);
          //轮子初始位置
          var startPosition = parseInt($wheel.css('marginTop'));
          //记录每个轮子的位置
          var marginTop;
          //轮子需要匀速转动的圈数
          var rtimes = runTimes[index];
          //加速运动转动的距离
          var acDistance = circleLen;
          //匀速运动转动的距离
          var unDistance = acDistance * 2 * rtimes;
          //匀速运动的时间
          var uniform = acceleration * rtimes;
          //减速运动的距离
          var deDistance;
          //轮子最终停止的位置
          var finalPosition = me.positions[index];


          //加速转动
          animation().enterFrame(function (success, time) {
            var persent = Math.min(1, time / (acceleration * 1000));
            if (persent > 0.3 && !$wheel.hasClass(FX_SLOW)) {
              $wheel.addClass(FX_SLOW);
            }
            if (persent == 1) {
              //开始匀速转动
              marginTop = (startPosition - acDistance) % circleLen;
              $wheel.css('marginTop', marginTop);
              //记录下一阶段初始位置
              startPosition = marginTop;
              $wheel.removeClass(FX_SLOW).addClass(FX_FAST);
              success();
              return;
            }
            var offset = $.easing.easeInCubic(persent) * acDistance;
            marginTop = (startPosition - offset) % circleLen;
            $wheel.css('marginTop', marginTop);
          })
            //匀速转动
            .enterFrame(function (success, time) {
              var persent = Math.min(1, time / (uniform * 1000));
              var offset;
              if (persent == 1) {
                //开始减速速转动
                marginTop = (startPosition - unDistance) % circleLen;
                $wheel.css('marginTop', marginTop);
                //记录下一阶段初始位置
                startPosition = marginTop;
                offset = (startPosition - finalPosition + circleLen) % circleLen;
                deDistance = offset < circleLen / 4 ? offset + circleLen : offset;
                $wheel.removeClass(FX_FAST).addClass(FX_SLOW);
                success();
                return;
              }
              offset = $.easing.linear(persent) * unDistance;
              marginTop = (startPosition - offset) % circleLen;
              $wheel.css('marginTop', marginTop);
            })
            //减速转动
            .enterFrame(function (success, time) {
              var persent = Math.min(1, time / (deceleration * 1000));
              if (persent > 0.7 && $wheel.hasClass(FX_SLOW)) {
                $wheel.removeClass(FX_SLOW);
              }
              if (persent == 1) {
                //停止转动
                $wheel.css('marginTop', finalPosition);
                success();
                return;
              }
              var offset = $.easing.easeOutCubic(persent) * deDistance;
              marginTop = (startPosition - offset) % circleLen;
              $wheel.css('marginTop', marginTop);
            })
            //停止
            .then(function () {
              //3个都停止
              if (!--refCount) {
                me.$scene.removeClass(FX_GRADIENT);
                me.state = STATE_END;
                me._trigger(END_EVENT);
              }
            }).start();
        })(i);
      }
    },
    //供外部调用，设置中奖结果，并让老虎机转起来
    setResult: function (id) {
      if (this.state != STATE_START)
        return false;
      this.state = STATE_RUNNING;
      this._gameStart(id);
    },
    destroy: function () {
      $.Widget.prototype.destroy.call(this);
    }
  });
});
