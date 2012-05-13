//
// oembed.js
//
// Library to consume oembed providers specified directly in the HTML code as
//
//    <oembed src="http://yoursite.org/oembed.json?id=1324" />
//
//
//  Authors:
//
//    Emil Stenqvist <emsten@gmail.com>
//

///////////////////////////////
//
// We use some code from HTML5 Shiv (https://github.com/aFarkas/html5shiv) for
// feature detection and stylesheet addition
//
;(function(window, document) {

  if(!window.OEmbed) window.OEmbed = {};

  /** Detect whether the browser supports unknown elements */

  OEmbed.supportsUnknownElements = (function() {
    var a = document.createElement('a');

    a.innerHTML = '<xyz></xyz>';

    var supportsUnknownElements = a.childNodes.length == 1 || (function() {
      // assign a false positive if unable to shiv
      try {
        (document.createElement)('a');
      } catch(e) {
        return true;
      }
      var frag = document.createDocumentFragment();
      return (
        typeof frag.cloneNode == 'undefined' ||
        typeof frag.createDocumentFragment == 'undefined' ||
        typeof frag.createElement == 'undefined'
      );
    }());

    return supportsUnknownElements;

  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a style sheet with the given CSS text and adds it to the document.
   * @private
   * @param {Document} ownerDocument The document.
   * @param {String} cssText The CSS text.
   * @returns {StyleSheet} The style element.
   */
  OEmbed.addStyleSheet = function(ownerDocument, cssText) {
    var p = ownerDocument.createElement('p'),
        parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

    p.innerHTML = 'x<style>' + cssText + '</style>';
    return parent.insertBefore(p.lastChild, parent.firstChild);
  }

  // TODO: use shivMethods as well to enable use of createElement('oembed')

}(this, document));

//
// End of HTML5 inclusion
//
///////////////////////////////////



/////////////////////////////////////////////////////////////
//
// We use a small subset of underscore.js.
//
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {
  var _ = {};

  var slice = Array.prototype.slice,
      nativeForEach = Array.prototype.forEach;

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };



  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // End of underscore borrowed code
  ///////////////////////////////

  if(!window.OEmbed) window.OEmbed = {};
  window.OEmbed._ = _;

  //
  // OEmbed.documentReady
  //
  // Non-jQuery equivalent of the famous $(document).ready(cb)
  //
  OEmbed.documentReady = function(cb) {
    if(document.addEventListener) {   // Mozilla, Opera, Webkit are all happy with this
      document.addEventListener("DOMContentLoaded", function() {
        document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
        cb.call(document);
      }, false);
    }
    else if(document.attachEvent) {   // IE is different...
      document.attachEvent("onreadystatechange", function() {
        if(document.readyState === "complete") {
          document.detachEvent("onreadystatechange", arguments.callee);
          cb.call(document);
        }
      });
    }
  };


  //
  // OEmbed.debug
  //
  // Since oembed.js should die silently for incompatible browsers, we use this
  // debug function to let the developer know what's going on.
  OEmbed.debug = function() {
    console.debug.apply(null, arguments);
  };

  //
  // OEmbed.XML
  //
  // Cross-browser compatible XML parser
  //
  OEmbed.XML = {
    parse: function(str) {
      var xmlDoc = null;

      if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(str, "text/xml");
      }
      else // Internet Explorer
      {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(str);
      }

      return xmlDoc;
    }
  };


  //
  // OEmbed.XHR
  //
  // Cross-browser compatible XMLHttpRequest
  //
  OEmbed.XHR = function() { };
  _.extend(OEmbed.XHR.prototype, {
    makeXHR: function() {
      var xhr = null;

      if (typeof XMLHttpRequest != 'undefined') {
          xhr = new XMLHttpRequest();
      }
      try {
          xhr = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
          try {
              xhr = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (e) {}
      }

      if(!xhr) throw "Browser incompatible, couldn't find XHR object";

      return xhr;
    },

    get: function(url, opts) {

      opts = opts || {};
      opts.success = opts.success || function() {};
      opts.error = opts.error || function() {};

      var xhr = this.makeXHR();

      xhr.open('GET', url, true /* async */ );
      xhr.onreadystatechange = function() {

        if(xhr.readyState === xhr.DONE) {
          opts.success.call(xhr, xhr.responseText, xhr.status, xhr);
        }

      };
      xhr.send(null);
    }
  });

  ////////////////////////


}());


////////////////////////////
//
// OEmbed implementation
//
(function() {

  var OEmbed = window.OEmbed;
  var _ = OEmbed._;
  var debug = OEmbed.debug;

  var TYPES = [ 'photo', 'link', 'video', 'rich' ];

  ////////////////////////
  //
  // OEmbed object
  //

  var OEmbedElement = OEmbed.OEmbedElement = function(el) {
    this.el  = el;
    this.src = el.getAttribute('src');
  };

  // FIXME FIXME
  // - error management: if a step fails - silently quit processing
  _.extend(OEmbedElement.prototype, {
    el: null,
    src: null,

    _load: function(cb) {
      var self = this;

      // Use cached data if already loaded
      if(this._oembedData) {
        cb.call(this, this._oembedData);
        return;
      }

      if(!this.src) {
        debug('no src on element %o', this.el);
        return;
      }

      // We assume that provider allows all Origins
      // FIXME: provide fallback method through JSONP or eq. for XML
      var xhr = new OEmbed.XHR();

      xhr.get(this.src, {
        success: function(data, status, req) {
          var type = req.getResponseHeader('content-type'),
              oembedData = null;

          switch(type) {
            case 'text/xml':
              oembedData = self._parseXml(data, req);
              break;
            case 'application/json':
              oembedData = self._parseJson(data, req);
              break;
          }

          if(!self._validate(oembedData)) {
            debug('unable to fetch data');
            return;
          }

          self._oembedData = oembedData;
          cb.call(self, oembedData);
        }
      });
    },

    // TODO: add validation according to spec
    _validate: function(data) {
      return !!data;
    },

    _parseXml: function(data, req) {
      var obj = {},
          xml = OEmbed.XML.parse(data);

      var oembed = xml.getElementsByTagName('oembed')[0];
      if(!oembed) return null;

      var n = oembed.childNodes.length;
      for(var i = 0; i < n; i++) {
        var child = oembed.childNodes[i];
        obj[child.tagName] = child.textContent;
      }


      return obj;
    },
    _parseJson: function(data, req) {
      return JSON.parse(data);
    },

    render: function() {

      this._load(function(data) {
        if(TYPES.indexOf(data.type) < 0) {
          debug('no such type: ' + data.type);
          return;
        }

        // TODO: add width and height of oembed element
        var template = OEmbed._templates[data.type];
        if(!template) return;

        // FIXME: something iffy up here: doesn't work with ifixit.json but with
        // slideshare.json ,something with the JavaScript not being executed.

        // this.el.innerHTML = template(data);
        // if(data.type === 'rich') {
        //   $('<div/>')
        //     .attr('id', 'ifixit')
        //     .appendTo('#stuff')
        //     .html(template(data));
        //   return;
        // }

        if(data.width) this.el.style['min-width'] = data.width;
        if(data.height) this.el.style['min-height'] = data.height;

        this.el.innerHTML = template(data);

      });
    }

  });

  _.extend(OEmbed, {
    shivDocument: function() {

      var oembeds = document.getElementsByTagName('oembed');
      for(var el in oembeds) {
        el = oembeds[el];
        if(el instanceof HTMLElement) {
          if(!el.oembed) el.oembed = new OEmbedElement(el);

          // FIXME: refactor so data is not loaded again
          el.oembed.render();
        }
      }
    },

    _templates: {
      'photo': _.template('\
        <p class="oembed-descr">An embedded photo from <a href="<%= provider_url %>"><%= provider_name %></a></p>\
        <div class="oembed-content"><img width="<%= width %>" height="<%= height %>" src="<%= url %>" alt="<%= title %>" /></div> \
      '),
      'video': _.template('\
        <p class="oembed-descr">Embedded video from <a href="<%= provider_url %>"><%= provider_name %></a></p>\
        <div class="oembed-content"><%= html %></div>\
      '),
      'link': _.template('\
        <p class="oembed-descr">An embedded link from <a href="<%= provider_url %>"><%= provider_name %></a></p>\
        <div class="oembed-content"><a href="<%= url %>"><%= title %></a></div>\
      '),
      'rich': _.template('\
        <p class="oembed-descr">Embedded content from <a href="<%= provider_url %>"><%= provider_name %></a></p>\
        <div class="oembed-content"><%= html %></oembed>\
      '),

    },

    registerTemplate: function(type, template) {
      if(TYPES.indexOf(type) < 0) return;

      OEmbed._templates[type] = _.template(template);
      OEmbed.shivDocument();
    }

  });

  // Default CSS for <oembed/> element
  var oembedCss = '\
    oembed { \
        display: inline-block; \
        padding: 10px; \
        margin: 10px; \
    }\
    oembed p.oembed-descr { \
        font-size: 13px; \
        border-bottom: 1px solid #aaa; \
        text-color: #555; \
    }\
    oembed p.oembed-descr a, oembed p.oembed-descr a:active, oembed p.oembed-descr a:visited { \
        color: #555; \
        font-weight: 600;\
        text-decoration: none;\
    }\
    oembed p.oembed-descr a:hover { \
        color: #000; \
    }\
    oembed .oembed-content { \
        margin-left: 10px; \
    }\
  ';


  /////////////////////////////
  //
  // Bootstrapping: Load all oembed elements
  //

  // TODO: make OEmbed work even for browsers that don't support custom elements
  if(!OEmbed.supportsUnknownElements) {
    debug('browser does not support custom elements');
    return;
  }

  document.createElement('oembed');

  OEmbed.documentReady(function() {

    OEmbed.addStyleSheet(document, oembedCss);
    OEmbed.shivDocument();

  });

}());
