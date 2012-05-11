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

}());

(function() {

  var OEmbed = window.OEmbed;
  var _ = OEmbed._;

  var debug = function() {
    console.debug.apply(null, arguments);
  };

  ///////////////////////////

  var XML = OEmbed.XML = {
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

  ///////////////////////////
  //
  // XHR
  // Object for making browser-independent XMLHttpRequests
  //

  var XHR = OEmbed.XHR = function() { };
  _.extend(XHR.prototype, {
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

    load: function() {
      var self = this;

      if(!this.src) {
        debug('no src on element %o', this.el);
        return;
      }

      // We assume that provider allows all Origins
      // FIXME: provide fallback method through JSONP or eq. for XML
      var xhr = new XHR();

      xhr.get(this.src, {
        success: function(data, status, req) {
          var type = req.getResponseHeader('content-type'),
              oembedData = null;

          switch(type) {
            case 'text/xml':
              oembedData = self.parseXml(data, req);
              break;
            case 'application/json':
              oembedData = self.parseJson(data, req);
              break;
          }

          if(oembedData && self.validate(oembedData)) {
            self.render(oembedData);
          }
        }
      });
    },

    // TODO: add validation according to spec
    validate: function(data) {
      return !!data;
    },

    parseXml: function(data, req) {
      var obj = {},
          xml = XML.parse(data);

      var oembed = xml.getElementsByTagName('oembed')[0];
      if(!oembed) return null;

      var n = oembed.childNodes.length;
      for(var i = 0; i < n; i++) {
        var child = oembed.childNodes[i];
        obj[child.tagName] = child.textContent;
      }


      return obj;
    },
    parseJson: function(data, req) {
      return JSON.parse(data);
    },

    render: function(data) {
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

      this.el.innerHTML = template(data);
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
          el.oembed.load();
        }
      }
    },

    _templates: {
      'photo': _.template('\
        <h1><%= title %></h1> \
        <p>An embedded photo "<%= title %>" from <%= provider_name %></p>\
        <img width="<%= width %>" height="<%= height %>" src="<%= url %>" alt="<%= title %>" /> \
      '),
      'video': _.template('\
        <p>An embedded video "<%= title %>" from <%= provider_name %></p>\
        <%= html %> \
      '),
      'link': _.template('\
        <p>An embedded link "<%= title %>" from <%= provider_name %></p>\
        <a href="<%= url %>"><%= title %></a>\
      '),
      'rich': _.template('\
        <p>Embedded rich content "<%= title %>" from <%= provider_name %></p>\
        <%= html %>\
      '),

    },

    registerTemplate: function(type, template) {
      if(TYPES.indexOf(type) < 0) return;

      OEmbed._templates[type] = _.template(template);
      OEmbed.shivDocument();
    }

  });


  /////////////////////////////
  //
  // Bootstrapping: Load all oembed elements
  //

  document.createElement('oembed');

  // TODO: remove all jQuery dependencies
  $(document).ready(function() {
    OEmbed.shivDocument();
  });

  // TODO: check if browser supports unknown elements
  // TODO: add default styles, e.g. `display: block`, etc.
  // TODO: extend HTMLElement to create a completely custom DOM element
  // TODO: way to bypass COR policy in case server doesn't add Access-Control-Allow-Origin


}());
