Add `<oembed />` tags in the HTML code.

Include `oembed.js` in the `<head>` - will load all oembeds in
body.

Works as a "shiv" for oembed tags.

Register custom representations for different types:

	- photo
	- video
	- link
	- rich

```
registerTemplate(type, helper);
```

Look into using this html5shiv (https://github.com/aFarkas/html5shiv)
