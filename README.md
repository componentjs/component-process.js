# Component Process

Creates a running [component](https://github.com/component/component) process to watch, rebuild, lint, and output interesting information such as production size and dependency tree. The idea is that you type commands into the process via `stdin`. Since there is no startup time everytime you type a command, commands will be executed very quickly.

This is a development repository for [component-watcher](https://github.com/component/watcher.js). This version is opinionated, so I'm not sure how much of it will/should go into any official `component` repositories.

Note that this is built just well enough to run my app. Some stuff won't work right now like the `files` builder or "regular" components that don't use locals. Things might be inconvenient for now like requiring the use of generators.

## API

You can either run this project as a binary or include it in your app. When `require()`d, it will automatically start watching for file changes.

A cool way to setup your app for development is to use this as a client-side watcher and use something like `nodemon` as a server-side watcher. `require('component-process')` in your app, then set your `package.json` to:

```json
{
  "scripts": {
    "start": "npm install; nodemon"
  }
}
```
So assuming you setup the configurations correctly, once someone clones your app, they can type `npm start` immediately and never touch the command line again. All dependencies (server and client) will be automatically installed, and restarts and rebuilds will occur on file changes.

### command(name, [options], [callback])

```js
var command = require('component-process');
command('resolve');
```

Run the command `name` with `options` and an optional `callback`.

### .config

The configuration for this process. To use your own file, set the `COMPONENT_PROCESS_CONFIG` environmental variable.

Please check [config.json](https://github.com/jonathanong/component-process.js/tree/master/config.json) for the configuration options.

### Events

Some commands emit events. For example, you can listen to `command.on('release')` to hook into the `release` event. Check out the source code for events.

### Implementable Methods

Some methods are implementable. These methods are:

- `.resolve=` - custom resolver
- `.bundle=` - custom bundler
- `.scripts=` - custom `scripts` builder
- `.styles=` - custom `styles` builder
- `.files=` - custom `files` builder

View [methods/](https://github.com/jonathanong/component-process.js/tree/master/lib/methods) for the API signature.

### Custom Commands

You can create your own custom commands by setting one as `command.commands[name] = function* () {}`. Right now, only generators or synchronous functions are supported.

### Middleware

The process includes middleware for Node and Koa. Simply use these middleware in your app and the builds will be served from memory. If a build or resolve is in progress, then the request will serve the next build.

```js
var app = koa();
app.use(require('component-process').koa());
```

## Commands

Most commands are aliased by the first letter. For example, `resolve` is aliased as `r`.

### resolve

Resolves the dependency tree then rebuilds all the assets as well as lints.

![](http://i.imgur.com/DSIZ0TO.png)

### scripts

Builds just the `.js` files.

![](http://i.imgur.com/7iXSpL7.png)

### styles

Builds just the `.css` files.

![](http://i.imgur.com/O2jeMvx.png)

Note that by default, the `styles` builder uses `autoprefixer`, which is why these builds take an extra `250ms`.

### files

Executes the `files` builder.

### lint

Lint the project. Assumes your project has a `.jshintignore` for minimum annoyance.

### ls

List the dependency tree of the component.

![](http://i.imgur.com/rzfreIs.png)

### rm

Deletes the `components/` folder, reinstalls everything, then resolves.

### size

Internally builds a production version of the app and returns the minified as well as gzipped sizes for comparison.

![](http://i.imgur.com/3ZZckuL.png)

### release

Creates a production version of the assets by appending a md5 hash to the filenames.

![](http://i.imgur.com/2PUVBRm.png)

### outdated

Check for any outdated pinned dependencies. Does not check semver ranges.

![](http://i.imgur.com/YapBVNq.png)

### pin

Pin loose dependencies with a local version. Ex. converts `*`s into versions. If a version was pinned, a rebuild will occur afterwards.

![](http://i.imgur.com/qxeZAoz.png)

### update

Update pinned dependencies to the latest version. If any updates occured, a rebuild will occur afterwards.

![](http://i.imgur.com/uDBZ8zy.png)

## License

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
