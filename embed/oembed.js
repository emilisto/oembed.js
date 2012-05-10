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

  var OEmbed = function(el) {
    this.el  = el;
    this.src = $(el).attr('src');

		console.log('new oembed!');
    if(this.src) this.load();
  };

  window.OEmbed = OEmbed;

  _.extend(OEmbed.prototype, {
    el: null,
    src: null,

    load: function() {

			var self = this;

			// We assume that provider allows all Origins
			$.ajax(this.src, {
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

  // Load all oembed elements
  $(document).ready(function() {
    $('oembed').each(function() {
      new OEmbed(this);
    });
  });


}(jQuery, _));
