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
registerHelper(type, helper);
```

Where `helper` should be a function that takes as argument


