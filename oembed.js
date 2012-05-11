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

(function($, _) {

  //////////////////////
  //
  // Utility functions: I wrote this starting with jQuery,
  // so this pretty much mirrors jQuery's API.

  var Util = {

    // TODO: rewrite without jQuery
    ajax: function(url, opts) {

      opts = opts || {};

      $.ajax(url, {
        success: opts.success || function() {},
        error: opts.error || function() {},
      });

    },
    // TODO: rewrite without using _
    extend: function() {
      return _.extend.apply(null, arguments);
    },

    // TODO: rewrite without jQuery
    ready: function(cb) {
      $(document).ready(cb);
    }
  };

  ///////////////////////////


  ///////////////////////////
  //
  // XHR
  // Object for making browser-independent XMLHttpRequests
  //
  var XHR = function() {
  };

  XHR.prototype.makeXHR = function() {
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
  }

  XHR.prototype.get = function(url, opts) {

    opts = opts || {};
    opts.success = opts.success || function() {};
    opts.error = opts.error || function() {};

    var xhr = this.makeXHR();

    // FIXME: what is true for?
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {

      console.log('readystatechange: %o', xhr);

      if(xhr.readyState === 4) {
        // Parse data
        //opts.success.call(xhr, {}, 123, xhr);
      }

    };
  };

  ////////////////////////


  ////////////////////////
  //
  // OEmbed object
  //

  var OEmbed = function(el) {
    this.el  = el;
    this.src = el.getAttribute('src');

    if(this.src) this.load();
  };

  window.OEmbed = OEmbed;

  Util.extend(OEmbed.prototype, {
    el: null,
    src: null,

    load: function() {

      var self = this;

      // We assume that provider allows all Origins
      Util.ajax(this.src, {
        success: function(data, status, req) {
          var type = req.getResponseHeader('content-type');

          switch(type) {
            case 'text/xml':
              self.parseXml(data, req);
              break;
            case 'application/json':
              self.parseJson(data, req);
              break;
            default:
              console.debug('unknown content type: %s for element %o', type, self.el);
              break;
          }
        },
        error: function() {
          console.log('oembed "%s" failed: %o', self.src, arguments);
        }
      });

    },

    _load: function(data) {

    },
    parseXml: function(data, req) {
      var obj = {};

      $('oembed', data).children().each(function(child) {
        obj[this.tagName] = this.textContent;
      });

      console.log(obj);
    },
    parseJson: function(data, req) {
      return data;

    }
  });

  /////////////////////////////
  //
  // Load all oembed elements
  //
  Util.ready(function() {

    var oembeds = document.getElementsByTagName('oembed');
    for(var el in oembeds) {
      el = oembeds[el];
      if(el instanceof HTMLElement) new OEmbed(el);
    }

  });


}(jQuery, _));
