# OUTRO - json.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\body-parser\lib\types\json.js
**SHA:** c3a763414e020117
**Timestamp:** 2026-08-26T19:32:08.371105
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: maybe make this configurable or part of "strict" option

### Ouro Bruto (primeiros 5000 chars)
```
/*!
 * body-parser
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

var bytes = require('bytes')
var contentType = require('content-type')
var createError = require('http-errors')
var debug = require('debug')('body-parser:json')
var read = require('../read')
var typeis = require('type-is')

/**
 * Module exports.
 */

module.exports = json

/**
 * RegExp to match the first non-space in a string.
 *
 * Allowed whitespace is defined in RFC 7159:
 *
 *    ws = *(
 *            %x20 /              ; Space
 *            %x09 /              ; Horizontal tab
 *            %x0A /              ; Line feed or New line
 *            %x0D )              ; Carriage return
 */

var FIRST_CHAR_REGEXP = /^[\x20\x09\x0a\x0d]*([^\x20\x09\x0a\x0d])/ // eslint-disable-line no-control-regex

var JSON_SYNTAX_CHAR = '#'
var JSON_SYNTAX_REGEXP = /#+/g

/**
 * Create a middleware to parse JSON bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */

function json (options) {
  var opts = options || {}

  var limit = typeof opts.limit !== 'number'
    ? bytes.parse(opts.limit || '100kb')
    : opts.limit
  var inflate = opts.inflate !== false
  var reviver = opts.reviver
  var strict = opts.strict !== false
  var type = opts.type || 'application/json'
  var verify = opts.verify || false

  if (verify !== false && typeof verify !== 'function') {
    throw new TypeError('option verify must be function')
  }

  // create the appropriate type checking function
  var shouldParse = typeof type !== 'function'
    ? typeChecker(type)
    : type

  function parse (body) {
    if (body.length === 0) {
      // special-case empty json body, as it's a common client-side mistake
      // TODO: maybe make this configurable or part of "strict" option
      return {}
    }

    if (strict) {
      var first = firstchar(body)

      if (first !== '{' && first !== '[') {
        debug('strict violation')
        throw createStrictSyntaxError(body, first)
      }
    }

    try {
      debug('parse json')
      return JSON.parse(body, reviver)
    } catch (e) {
      throw normalizeJsonSyntaxError(e, {
        message: e.message,
        stack: e.stack
      })
    }
  }

  return function jsonParser (req, res, next) {
    if (req._body) {
      debug('body already parsed')
      next()
      return
    }

    req.body = req.body || {}

    // skip requests without bodies
    if (!typeis.hasBody(req)) {
      debug('skip empty body')
      next()
      return
    }

    debug('content-type %j', req.headers['content-type'])

    // determine if request should be parsed
    if (!shouldParse(req)) {
      debug('skip parsing')
      next()
      return
    }

    // assert charset per RFC 7159 sec 8.1
    var charset = getCharset(req) || 'utf-8'
    if (charset.slice(0, 4) !== 'utf-') {
      debug('invalid charset')
      next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
        charset: charset,
        type: 'charset.unsupported'
      }))
      return
    }

    // read
    read(req, res, next, parse, debug, {
      encoding: charset,
      inflate: inflate,
      limit: limit,
      verify: verify
    })
  }
}

/**
 * Create strict violation syntax error matching native error.
 *
 * @param {string} str
 * @param {string} char
 * @return {Error}
 * @private
 */

function createStrictSyntaxError (str, char) {
  var index = str.indexOf(char)
  var partial = ''

  if (index !== -1) {
    partial = str.substring(0, index) + new Array(str.length - index + 1).join(JSON_SYNTAX_CHAR)
  }

  try {
    JSON.parse(partial); /* istanbul ignore next */ throw new SyntaxError('strict violation')
  } catch (e) {
    return normalizeJsonSyntaxError(e, {
      message: e.message.replace(JSON_SYNTAX_REGEXP, function (placeholder) {
        return str.substring(index, index + placeholder.length)
      }),
      stack: e.stack
    })
  }
}

/**
 * Get the first non-whitespace character in a string.
 *
 * @param {string} str
 * @return {function}
 * @private
 */

function firstchar (str) {
  var match = FIRST_CHAR_REGEXP.exec(str)

  return match
    ? match[1]
    : undefined
}

/**
 * Get the charset of a request.
 *
 * @param {object} req
 * @api private
 */

function getCharset (req) {
  try {
    return (contentType.parse(req).parameters.charset || '').toLowerCase()
  } catch (e) {
    return undefined
  }
}

/**
 * Normalize a SyntaxError for JSON.parse.
 *
 * @param {SyntaxError} error
 * @param {object} obj
 * @return {SyntaxError}
 */

function normalizeJsonSyntaxError (error, obj) {
  var keys = Object.getOwnPropertyNames(error)

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (key !== 'stack' && key !== 'message') {
      delete error[key]
    }
  }

  // replace stack before message for Node.js 0.10 and below
  error.stack = obj.stack.replace(error.message, obj.message)
  
```

---

# OUTRO - json.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\body-parser@2.3.0@@@1\lib\types\json.js
**SHA:** 88badae0fd93e54c
**Timestamp:** 2026-08-28T02:24:04.046321
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: maybe make this configurable or part of "strict" option
- // TODO: maybe make this configurable or part of "strict" option

### Ouro Bruto (primeiros 5000 chars)
```
/*!
 * body-parser
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

const debug = require('debug')('body-parser:json')
const read = require('../read')
const { normalizeOptions } = require('../utils')

/**
 * Module exports.
 */

module.exports = json

/**
 * RegExp to match the first non-space in a string.
 *
 * Allowed whitespace is defined in RFC 7159:
 *
 *    ws = *(
 *            %x20 /              ; Space
 *            %x09 /              ; Horizontal tab
 *            %x0A /              ; Line feed or New line
 *            %x0D )              ; Carriage return
 */
const FIRST_CHAR_REGEXP = /^[\x20\x09\x0a\x0d]*([^\x20\x09\x0a\x0d])/ // eslint-disable-line no-control-regex

const JSON_SYNTAX_CHAR = '#'
const JSON_SYNTAX_REGEXP = /#+/g

/**
 * Create a middleware to parse JSON bodies.
 *
 * @param {Object} [options]
 * @returns {Function}
 * @public
 */
function json (options) {
  const normalizedOptions = normalizeOptions(options, 'application/json')

  const parse = createJsonParser(options)

  const readOptions = {
    ...normalizedOptions,
    // assert charset per RFC 7159 sec 8.1
    isValidCharset: (charset) => charset.slice(0, 4) === 'utf-'
  }

  return function jsonParser (req, res, next) {
    read(req, res, next, parse, debug, readOptions)
  }
}

/**
 * Create a JSON parse function
 *
 * @param {object} [options]
 * @return {function}
 * @private
 */
function createJsonParser (options) {
  const reviver = options?.reviver
  const strict = options?.strict !== false

  if (strict) {
    return function parse (body) {
      if (body.length === 0) {
        // special-case empty json body, as it's a common client-side mistake
        // TODO: maybe make this configurable or part of "strict" option
        return {}
      }

      const first = firstchar(body)
      if (first !== '{' && first !== '[') {
        debug('strict violation')
        throw createStrictSyntaxError(body, first)
      }

      try {
        debug('parse json')
        return JSON.parse(body, reviver)
      } catch (e) {
        throw normalizeJsonSyntaxError(e, {
          message: e.message,
          stack: e.stack
        })
      }
    }
  }

  return function parse (body) {
    if (body.length === 0) {
      // special-case empty json body, as it's a common client-side mistake
      // TODO: maybe make this configurable or part of "strict" option
      return {}
    }

    try {
      debug('parse json')
      return JSON.parse(body, reviver)
    } catch (e) {
      throw normalizeJsonSyntaxError(e, {
        message: e.message,
        stack: e.stack
      })
    }
  }
}

/**
 * Create strict violation syntax error matching native error.
 *
 * @param {string} str
 * @param {string} char
 * @returns {Error}
 * @private
 */
function createStrictSyntaxError (str, char) {
  const index = str.indexOf(char)
  let partial = ''

  if (index !== -1) {
    partial = str.substring(0, index) + JSON_SYNTAX_CHAR.repeat(str.length - index)
  }

  try {
    JSON.parse(partial); /* istanbul ignore next */ throw new SyntaxError('strict violation')
  } catch (e) {
    return normalizeJsonSyntaxError(e, {
      message: e.message.replace(JSON_SYNTAX_REGEXP, function (placeholder) {
        return str.substring(index, index + placeholder.length)
      }),
      stack: e.stack
    })
  }
}

/**
 * Get the first non-whitespace character in a string.
 *
 * @param {string} str
 * @returns {string|undefined}
 * @private
 */
function firstchar (str) {
  const match = FIRST_CHAR_REGEXP.exec(str)

  return match
    ? match[1]
    : undefined
}

/**
 * Normalize a SyntaxError for JSON.parse.
 *
 * @param {SyntaxError} error
 * @param {Object} obj
 * @returns {SyntaxError}
 * @private
 */
function normalizeJsonSyntaxError (error, obj) {
  const keys = Object.getOwnPropertyNames(error)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key !== 'stack' && key !== 'message') {
      delete error[key]
    }
  }

  // replace stack before message for Node.js 0.10 and below
  error.stack = obj.stack.replace(error.message, obj.message)
  error.message = obj.message

  return error
}

```