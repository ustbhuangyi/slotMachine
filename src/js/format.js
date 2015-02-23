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
