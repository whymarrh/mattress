Rested [![Build Status](https://travis-ci.org/whymarrh/rested.png)](https://travis-ci.org/whymarrh/rested)
======

Rested is a small framework, a foundation if you will, on top of which you can build APIs. Rested is not a web framework, it is an API framework. It was/is based on [restify] and borrows heavily from it, but differs in some aspects. Despite it's name, Rested not will automatically create REST APIs for you &mdash; whether or not your API is actually RESTful depends on you.

Got ideas and/or feature requests? [Please file an issue.](https://github.com/whymarrh/rested/issues)

Things Rested does
------------------

a.k.a features!

- Content negoitation
- HTTP and HTTPS
- HTTP Basic Authentication
- Versioned routes

Niceties: Rested is built using [Promises].

Quick start
-----------

A server that simply echos "Hello world." (available as [examples/hello-world.js](examples/hello-world.js)):

```js
var Rested = require("rested");
var q = require("q");

var v1 = {
    "get": function (request, response) {
        response.write("Hello world.\n");
        return q(true);
    }
};

var media = {
    "text/plain": { 1: v1 }
};

Rested
.createServer({
    "routes": [{
        "path": "/hello",
        "media": media
    }]
})
.listen(8888, function () {
    console.log("Server listening on port 8888");
});
```

Running:

```bash
$ curl -i localhost:8888/hello -H "Accept: text/plain; v = 1"
```

Will output:

```
HTTP/1.1 200 OK
Content-Type: text/plain; version = 1; charset = utf-8
Date: Tue, 18 Feb 2014 03:07:07 GMT
Connection: keep-alive
Transfer-Encoding: chunked

Hello world.
```

License
-------

This software is released under the BSD 3-Clause License. See [LICENSE.md](LICENSE.md) for more information.

  [restify]:https://github.com/mcavage/node-restify
  [promises]:http://promisesaplus.com/
