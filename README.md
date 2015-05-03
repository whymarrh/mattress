Mattress [![Build Status](https://travis-ci.org/whymarrh/mattress.svg)](https://travis-ci.org/whymarrh/mattress)
========

<img src="https://raw.github.com/whymarrh/mattress/master/imgs/mattress.png">

Mattress is a small framework, a foundation if you will, on top of which you can build APIs &ndash; Mattress is not a web framework, it is an API framework. It was and is based on [restify] and borrows heavily from it, but differs in some aspects. Despite it's name, Mattress will not automatically create REST APIs for you. Whether or not your API is actually RESTful depends on you.

Got ideas and/or feature requests? [Please file an issue.](https://github.com/whymarrh/mattress/issues)

  [restify]:https://github.com/mcavage/node-restify

Things Mattress does
--------------------

a.k.a features!

- Content negoitation
- HTTP and HTTPS
- HTTP Basic Authentication
- Versioned routes

Quick start
-----------

A server that simply echos "Hello world." (available as [examples/hello-world.js](examples/hello-world.js)):

```js
"use strict";

var Mattress = require("..");

var v1 = {
    "GET":
        function GET(request, response) {
            response.write("Hello world.\n");
            response.end();
        }
};

var media = {
    "text/plain": { "1": v1 }
};

Mattress
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

Running tests
-------------

```bash
$ grunt test
```

License
-------

This software is released under the ISC License. See [LICENSE.md](LICENSE.md) for more information.
