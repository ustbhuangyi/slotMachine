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
