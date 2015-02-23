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
