# oembed.js

A browser-side consumer of the [oEmbed standard](http://www.oembed.com/).

Include a Youtube video on your site by

```html
<script src="/oembed.js"></script>
<oembed src="http://api.embed.ly/1/oembed?url=http%3A//www.amazon.com/Myths-Innovation-Scott-Berkun/dp/0596527055/"></oembed>
```

I've decided to add `<oembed>` tags to the markup, although I'm still
unsure about this decision, either 

  - it needs to be standardized and implemented in browsers
  - we use an existing tag (e.g. `<embed/>`) with a custom attribute
    identifying it as an OEmbed tag.

## How it works

Upon including the script - it iterates over all `<oembed>` elements in the
page and loads them from the specified URL.

The idea of oEmbed is that the consumer can customize how embeds are
shown - for example one might want to postpone the actual loading of
embedded resources until the user choses to click it. With oEmbed one
can provide a summary of the content before loading it.

Therefore I came up with the neat idea of specifying how oEmbeds are
rendered in the form of [underscore.js templates](http://documentcloud.github.com/underscore/#template).

## CORS policies
As of today there's no solution to embedding material from a provider that does not have the
embedding site's domain covered by its `Access-Control-Allow-Origin`.

One could use JSONP but the oEmbed standard only supports `xml` and `json`.

We simply expect sites to have `Access-Control-Allow-Origin` set properly. All sites ought to look
into this - with the web becoming more cross referenced, this is an issue. See http://enable-cors.org/.

## Still developing
This is not even an alpha version as of yet. I just thought that in the
true Github philosophy I'd publish the project while it's still born.

## Todo
  * Support for `jsonp`
  * Do cross-browser testing, and make sure silent dying works for really old ones.
  * Check if browser supports unknown elements, if not, replace the
    `<oembeds>` with DIV's.
  * Look into using/building on [html5shiv](https://github.com/aFarkas/html5shiv)
  * fix embedding of content type `rich` - somehow the included scripts
    don't get executed properly.
  * ~~way to bypass COR policy in case server doesn't add `Access-Control-Allow-Origin`~~
    There's real way around this, see CORS policies above.

## Authors
- Emil Stenqvist, @emilisto

## Psst
MIT license, it is.
