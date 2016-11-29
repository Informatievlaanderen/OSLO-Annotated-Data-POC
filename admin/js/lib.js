var TYPE_LOCATION = ['Place', 'org:Site', 'dct:Location']
var TYPE_ORGANISATION = ['GovernmentOrganization', 'cpov:PublicOrganization', 'org:FormalOrganization']
var TYPE_SERVICE = ['GovernmentService', 'cpsv:PublicService']

// var dutchDays = 'Maandag,Dinsdag,Woensdag,Donderdag,Vrijdag,Zaterdag,Zondag'.split(',')
var days = 'Mo,Tu,We,Th,Fr,Sa,Su'.split(',')
var fullDays = 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'.split(',')

function createProp(prop, first) {
  switch (prop) {
    case 'openingHours':
      return first ? 'Mo,Tu,We,Th,Fr 09:00-17:00' : ''
    case 'location':
      return {
        '@type': 'Place',
        address: createProp('address'),
        addressCountry: null,
        addressLocality: null,
        addressRegion: null,
        description: null,
        email: null,
        name: null,
        openingHours: null,
        postalCode: null,
        streetAddress: null,
        telephone: null,
        url: null
      }
    case 'address':
      return {
        '@type': 'PostalAddress',
        addressCountry: null,
        addressLocality: null,
        addressRegion: null,
        postalCode: null,
        streetAddress: null
      }
    case 'cpsv:provides':
      return {
        '@type': 'GovernmentService',
        description: null,
        email: null,
        name: null,
        openingHours: null,
        telephone: null,
        url: null
      }
    case 'organization':
      return {
        '@type': 'GovernmentOrganization',
        description: null,
        email: null,
        name: null,
        telephone: null,
        url: null,
        'cpsv:provides': createProp('cpsv:provides'),
        location: [createProp('location')]
      }
  }
  return {
    '@type': prop
  }
}

function createList(props, len) {
  var list = createMatrix(len, props.length, '')
    // list.unshift(props)
  return list
}

function createMatrix(a, b, v) {
  var matrix = []
  for (var i = 0; i < a; i++) {
    matrix[i] = []
    for (var j = 0; j < b; j++) {
      matrix[i][j] = v
    }
  }
  return matrix
}

function reactiveTable(keys, data) {
  if (!data) {
    data = getTableData()
  }
  var base = toObject(keys)
  return data.map(d => Object.assign({}, base, d))
}

function toObject(arr) {
  var obj = {}
  for (var i = 0; i < arr.length - 1; i++) {
    obj[arr[i]] = null
  }
  return obj
}

function getTableData() {
  return localStorage['tableData'] ? JSON.parse(localStorage['tableData']) : [{}]
}

// Returns the items that match one of the types
function getOfType(a, types) {
  a = collection(a)
  types = collection(types)

  var result = []
  for (var i = 0; i < a.length; i++) {
    if (hasCommon(types, toType(a[i]))) {
      result.push(a[i])
    }
  }
  return result
}

function toType(a) {
  return collection(a && a['@type'])
}

function toGraph(a, extraTriples) {
  if (!a || a['@graph']) return a
  return {
    '@context': [{
        'cpov': 'http://data.europa.eu/m8g/',
        'cpsv': 'http://purl.org/vocab/cpsv#',
        'dct': 'http://purl.org/dc/terms/',
        'foaf': 'http://xmlns.com/foaf/0.1/',
        'locn': 'http://www.w3.org/ns/locn#',
        'org': 'http://www.w3.org/ns/org#',
        'owl': 'https://www.w3.org/2002/07/owl#',
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'schema': 'http://schema.org/',
        'vcard': 'https://www.w3.org/2006/vcard/ns#'
      },
      'http://schema.org'
    ],
    '@graph': collection(a).concat(extraTriples)
  }
}

function fromGraph(a) {
  if (!a || !a['@graph'] || !a['@graph'].length) return a

  // a = hideNamespace(a)

  var org = a['@graph'].find(isOrganisation) || {}
  var svc = a['@graph'].find(isService) || org['cpsv:provides'] || {}
  var cpovSvc = a['@graph'].find(isCpsvService) || {}

  return Object.assign(createProp('organization'), org, {
    'cpsv:provides': fromService(svc, cpovSvc),
    'org:hasSite': null,
    'locn:location': null
  })
}

function fromService(svc, cpovSvc) {
  var c = svc.availableChannel || {}
console.log(cpovSvc)
  return Object.assign(createProp('service'), {
    name: svc.name,
    description: svc.description,
    url: c.serviceUrl || svc.url,
    openingHours: (cpovSvc['cpsv:hasChannel'] || {}).openingHours || svc.openingHours || fromHoursAvailable(svc.hoursAvailable),
    telephone: c.servicePhone && c.servicePhone.telephone || svc.telephone
  }, svc)
}

function isOrganisation(a) {
  return hasCommon(toType(a), TYPE_ORGANISATION)
}

function isLocation(a) {
  return hasCommon(toType(a), TYPE_LOCATION)
}

function isService(a) {
  return hasCommon(toType(a), TYPE_SERVICE.slice(0, 1))
}

function isCpsvService(a) {
  return hasCommon(toType(a), ['cpsv:PublicService'])
}

// https://github.com/thgh/ld3/blob/gh-pages/src/mixins/Store.js
function hideNamespace(obj) {
  // Collapse @value
  if (typeof obj['@value'] !== 'undefined') {
    return obj['@value']
  }
  // Hide in current object
  for (let prop in obj) {
    if (prop.startsWith('schema:')) {
      obj[prop.slice(7)] = obj[prop]
      delete obj[prop]
    }
  }
  // Hide nested props
  for (let prop in obj) {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && Object.keys(obj[prop]).length > 1) {
      obj[prop] = hideNamespace(obj[prop])
    }
  }
  return obj
}

// openingHours <-> hourseAvailable
function fromHoursAvailable(a) {
  return a && a.map && a.map(h => {
    console.warn('not implemented')
  })
}

function toHoursAvailable(a) {
  return a && a.map && [].concat.apply([], a.map(h => {
    return beforeNum(h).split(',').map(day => ({
      '@type': 'OpeningHoursSpecification',
      'closes': startAtNum(h).split('-')[1],
      'dayOfWeek': toSchemaDay(day),
      'opens': startAtNum(h).split('-')[0]
    }))
  }))
}

function fromSchemaDay (day) {
  return days[fullDays.indexOf(day)]
}

function toSchemaDay (day) {
  return 'http://schema.org/' + fullDays[days.indexOf(day)]
}

// Assign an array of objects to an object
function assignArray(target, objects) {
  for (var i = objects.length - 1; i >= 0; i--) {
    Object.assign(target, objects[i])
  }
  return target
}

// Wraps everything in an array
function collection(a) {
  return Array.isArray(a) ? a : [a]
}

// Check if these arrays contain a common, non-empty element
function hasCommon(a, b) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] && b.indexOf(a[i]) !== -1) {
      return true
    }
  }
}

function reactive(d, keys) {
  return Object.assign({}, toObject(keys), d)
}

function inert(a) {
  return JSON.parse(JSON.stringify(a))
}

function empty(a) {
  if (!a || typeof a !== 'object') {
    return !a
  }
  for (var key in a) {
    if (!key.startsWith('@') && !empty(a[key])) {
      return false
    }
  }
  if (Object.keys(a).length === 1 && a['@id']) {
    return false
  }
  return true
}

function cleanEmpty(x) {
  for (var key in x) {
    if (empty(x[key])) {
      delete x[key]
    } else if (Array.isArray(x[key])) {
      x[key] = x[key].map(cleanEmpty)
    } else {
      for (var j in x[key]) {
        if (empty(x[key][j])) {
          delete x[key][j]
        }
      }
    }
  }
  return x
}

// Gets the substring up until the first digit
function beforeNum(str) {
  str = str || ''
  var match = str.match(/[0-9]/)
  return match ? str.slice(0, match.index).trim() : str
}

// Gets the substring starting at the first digit
function startAtNum(str) {
  str = str || ''
  var match = str.match(/[0-9]/)
  return match ? str.slice(match.index).trim() : ''
}


// Data fixers
function fixUrl(u) {
  if (u && u.indexOf('.') > 0) {
    if (u.indexOf(':/') < 3) {
      u = 'http://' + u
    }
    try {
      new URL(u)
      return u.toLowerCase().trim()
    } catch (e) {}
  }
  return null
}

function fixEmail(e) {
  if (e && e.indexOf('@') > 0) {
    return e.toLowerCase().trim()
  }
  return null
}

function fixTelephone(t) {
  // return t.replace(/[^0-9\+]/g, '')
  return t.replace(/\s/g, '')
}

// vatID helper
function digits(str) {
  return str.replace(/\D/g, '')
}

function countryCode(str) {
  return str.replace(/[^A-Z]/g, '').slice(0, 3)
}

function vatValid(str) {
  return digits(str).length === 10
}

function vatID(str) {
  return [countryCode(str), digits(str)].filter(Boolean).join(' ')
}

function vatIDkbo(str) {
  str = digits(str)
  return (str[0] === '0' ? '0' : str[0] + '_') + str.slice(1, 4) + '_' + str.slice(4, 7) + '_' + str.slice(7)
}

function vatIDnice(c, str) {
  str = digits(str || c)
  if (str.length < 9) {
    return c
  }
  if (str.length === 9) {
    str = '0' + str
  }
  if (str.length === 10) {
    str = str.slice(0, 4) + '.' + str.slice(4, 7) + '.' + str.slice(7)
    c = c || 'BE'
  }
  return [countryCode(c), str].filter(Boolean).join(' ')
}

/* Localstorage helper */

function ls(key, value) {
  if (typeof key === 'undefined') {
    return window.localStorage
  }
  if (typeof value === 'undefined') {
    return window.localStorage[key] && JSON.parse(window.localStorage[key])
  }
  window.localStorage[key] = JSON.stringify(value)
}

function lsDefault(key, value) {
  if (!key || typeof value === 'undefined') {
    return console.warn('lsDefault: key & value expected')
  }
  if (!ls(key)) {
    ls(key, value)
  }
}

/* HTTP */

function getJSON(url) {
  return window.fetch(url, {
      redirect: 'follow',
      headers: {
        Accept: 'application/json'
      }
    })
    .then(checkStatus)
    .then(streamJSON)
}

function putJSON(url, data) {
  return window.fetch(url, {
      method: 'put',
      body: JSON.stringify(data),
      redirect: 'follow',
      headers: {
        Accept: 'application/json'
      }
    })
    .then(checkStatus)
    .then(streamJSON)
}

function streamJSON(response) {
  return response.json()
}

function getTurtle(url) {
  return window.fetch(url, {
      redirect: 'follow',
      headers: {
        Accept: 'text/turtle'
      }
    })
    .then(checkStatus)
    .then(streamTurtle)
    .then(parseTurtle)
}

function streamTurtle(response) {
  return response.text()
}

function parseTurtle(data) {
  return new Promise(function(resolve, reject) {
    var store = superStore()
    parser.parse(data, function(error, triple, prefixes) {
      if (error) {
        return reject('streamTurtle trouble')
      }
      if (triple) {
        return store.addTriple(triple)
      }
      resolve(store)
    })
  })
}

function checkStatus(response) {
  if (response.status < 400) {
    return response
  }
  var error = new Error(response.statusText)
  error.status = response.status
  error.response = response
  throw error
}

/* Vue components */

var Sheet = {
  props: ['model'],
  methods: {
    change(c, source) {
      if (!c || !c.length) {
        return
      }
      // Apply changes
      for (var i = c.length - 1; i >= 0; i--) {
        this.$set(this.model.data[c[i][0]], c[i][1], c[i][3])
      }
      this.$emit('change', c)
        // Persist in storage
      localStorage['tableData'] = JSON.stringify(this.model.data)
    }
  },
  mounted() {
    console.time('mount table')
    this.hot = new Handsontable(this.$el, this.model)
    Handsontable.hooks.add('afterChange', this.change, this.hot)
    console.timeEnd('mount table')
  },
  beforeDestroy() {
    this.hot.destroy()
  },
  watch: {
    'model.data' () {
      console.log('render')
      this.hot.render()
    }
  },
  template: '<div></div>'
}


var crabClientCache

function crabClient() {
  return new Promise(function(resolve, reject) {
    if (crabClientCache) {
      return resolve(crabClientCache)
    } else if (crabClientCache !== false) {
      crabClientCache = false
      window['browser-soap'].createClient('/admin/crab.php?pa=/wscrab/WsCrab.svc?wsdl', function(err, client) {
        if (err) {
          return reject('createClient trouble')
        }
        crabClientCache = client
        return resolve(client)
      })
    }
    setTimeout(function() {
      crabClient().then(function(client) {
        resolve(client)
      })
    }, 1000)
  })
}

// Only request this once, result is always pretty much the same
var crabGemeentenCache

function crabGemeenten() {
  if (typeof crabGemeentenCache === 'undefined') {
    crabGemeentenCache = ls('crabGemeentenCache') || []
  }
  return new Promise(function(resolve, reject) {
    if (crabGemeentenCache && crabGemeentenCache.length) {
      return resolve(crabGemeentenCache)
    }
    crabClient().then(function(client) {
      client.ListGemeentenByGewestId({
        'tns:GewestId': 2
      }, function(err, data) {
        if (err) {
          return reject('ListGemeentenByGewestId trouble')
        }

        data = data.ListGemeentenByGewestIdResult[0].GemeenteItem

        data.sort((a, b) => a.GemeenteNaam.localeCompare(b.GemeenteNaam))
        ls('crabGemeentenCache', data)
        gemeenten = data.map(g => g.GemeenteNaam)
        if ($root) {
          $root.gemeenten = gemeenten
        }
        console.log('crabGemeenten: fetched', gemeenten.length, new Date())

        resolve(data)
      })
    })
  })
}
// Only request this once, result is always pretty much the same
function crabGemeenteId(gemeente) {
  return new Promise(function(resolve, reject) {
    crabGemeenten().then(function(gemeenten) {
      var g = gemeenten.find(g => g.GemeenteNaam === gemeente)
      if (g) {
        resolve(g.GemeenteId)
      }
    })
  })
}

// Cache the results in localStorage
var crabStreetsCache

function crabStreets(gemeenteId) {
  if (typeof crabStreetsCache === 'undefined') {
    crabStreetsCache = ls('crabStreetsCache') || {}
    console.log('crabStreets: Cached streets of', Object.keys(crabStreetsCache).length, 'localities')
  }
  if (typeof gemeenteId === 'string') {
    return crabStreetsByGemeenteNaam(gemeenteId)
  }
  return new Promise(function(resolve, reject) {
    if (crabStreetsCache[gemeenteId]) {
      return resolve(crabStreetsCache[gemeenteId])
    }
    if (!gemeenteId) {
      return reject(['ongeldig' + gemeenteId])
    }
    crabClient().then(function(client) {
      client.ListStraatnamenByGemeenteId({
        'tns:GemeenteId': gemeenteId
      }, function(err, data) {
        if (err) {
          return reject('ListStraatnamenByGemeenteId trouble')
        }
        var streets = data.ListStraatnamenByGemeenteIdResult[0].StraatnaamItem.map(s => s.Straatnaam)
        crabStreetsCache[gemeenteId] = streets
        ls('crabStreetsCache', crabStreetsCache)
        console.log('crabStreets: Cached streets of', Object.keys(crabStreetsCache).length, 'localities')
        resolve(streets)
      })
    })
  })
}

function crabStreetsByGemeenteNaam(gemeenteNaam) {
  return new Promise(function(resolve, reject) {
    crabGemeenteId(gemeenteNaam).then(function(gemeenteId) {
      crabStreets(gemeenteId).then(function(streets) {
        resolve(streets)
      })
    })
  })
}



function vatNumberRenderer(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);

  // if row contains negative number
  if (parseInt(value, 10) < 0) {
    // add class 'negative'
    td.className = 'make-me-red';
  }

  if (!value || value === '') {
    td.style.background = '#EEE';
  } else {
    if (value === 'Nissan') {
      td.style.fontStyle = 'italic';
    }
    td.style.background = '';
  }
}

// N3 stuff
var parser = N3.Parser();

function superStore() {
  var store = N3.Store();
  var store2 = N3.Store();
  var addTriple = function(triple) {
    if (triple.object.endsWith('@de') || triple.object.endsWith('@fr')) {
      store2.addTriple(triple);
    } else {
      store.addTriple(triple);
    }
  }

  var findFindAndGet = function(a, b, c) {
    var ref = store.find(a, b, c);
    if (!ref[0]) {
      return;
    }
    var triple = store.find(ref[0].object);
    if (!triple[0]) {
      triple = store2.find(ref[0].object);
      if (!triple[0]) {
        return;
      }
    }
    return N3.Util.getLiteralValue(triple[0].object);
  }

  var findAndGet = function(a, b, c) {
    var triple = store.find(a, b, c);
    if (!triple[0]) {
      triple = store2.find(a, b, c);
      if (!triple[0]) {
        return;
      }
    }
    return N3.Util.getLiteralValue(triple[0].object);
  };
  var findIRI = function(a, b, c) {
    var triple = store.find(a, b, c);
    if (!triple[0]) {
      triple = store2.find(a, b, c);
      if (!triple[0]) {
        return;
      }
    }
    return triple[0].object.substr(0, triple[0].object.indexOf('#'));
  }
  return {
    store,
    addTriple,
    findFindAndGet,
    findAndGet,
    findIRI
  }
}
//

function summarizeKbo(store) {
  var addressLine = store.findFindAndGet(null, 'http://www.w3.org/ns/locn#address');
  address = addressLine.match(/(.*)\s(\d+)(.*)\s?,\s?(\d\d\d\d) (.*)/);

  var name = store.findAndGet(null, 'http://www.w3.org/2004/02/skos/core#prefLabel') ||
    store.findAndGet(null, 'http://www.w3.org/2004/02/skos/core#altLabel')

  return {
    address: addressLine.replace(',', ',\n'),
    street: address[1],
    number: address[2],
    bus: address[3],
    streetAddress: address[1] + (address[2] ? ' ' + address[2] : '') + address[3],
    postalCode: address[4],
    addressLocality: address[5],
    orgType: store.findFindAndGet(null, 'http://www.w3.org/ns/regorg#orgType'),
    startDate: store.findAndGet(null, 'http://schema.org/startDate'),
    name: name
  }
}


/* Underscore */
// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  console.log('build throttle')
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

function randomName(text) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}
