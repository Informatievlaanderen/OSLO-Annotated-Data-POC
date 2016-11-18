
// add... mutates the object
// to... returns a new object

// Return a list of triples
function addSemantics(t) {
  return [].concat(
    addSlug(t),
    transformService(t),
    addSchemaorg(t),
    toCpovOrganization(t),
    addTypes(t),
    seeAlsoPredicates()
  ).filter(Boolean)
}

function addSlug(t) {
  if (!t['@id']) {
    t['@id'] = '_:' + slugify(t.name || 'org')
  }
  if (t.location && t.location.length) {
    for (var i = 0; i < t.location.length; i++) {
      t.location[i]['@id'] = t['@id'] + '-' + slugify(t.location[i].name || randomName())
    }
  }
}

function transformService(t) {
  if (!empty(t['cpsv:provides'])) {
    if (t['@id']) {
      t['cpsv:provides']['provider'] = { '@id': t['@id'] }
    }
    t['cpsv:provides']['@type'] = 'GovernmentService'
    providesToServiceChannel(t['cpsv:provides'])
  }
}

function providesToServiceChannel(t) {
  t.availableChannel = {
    '@type': 'ServiceChannel'
  }
  if (t.telephone) {
    t.availableChannel.servicePhone = {
        '@type': 'ContactPoint',
        'telephone': t.telephone
      }
      // delete t.telephone
  }
  if (t.url) {
    t.availableChannel.serviceUrl = t.url
      // delete t.url
  }
}

function addTypes(t) {
  t['@type'] = TYPE_ORGANISATION[0]
  t['cpsv:provides'] && (t['cpsv:provides']['@type'] = TYPE_SERVICE[0])
  for (var i = 0; i < t.location.length; i++) {
    t.location[i]['@type'] = TYPE_LOCATION[0]
  }
}

function toCpovOrganization(t) {
  return [{
    '@id': t['@id'] + '-core',
    '@type': ['cpov:PublicOrganization', 'org:FormalOrganization'],
    'rdfs:label': t.name,
    'dct:description': t.description,
    'foaf:homepage': reference(t.url),
    'cpsv:provides': reference(t['cpsv:provides']),
    'locn:location': t.location.map(toLocnLocation),
    'org:hasSite': t.location.map(toOrgHasSite)
  }, {
    '@id': t['@id'],
    'rdfs:seeAlso': reference(t['@id'] + '-core')
  }]
}

function toLocnLocation (t) {
  return t && {
    '@id': t['@id'],
    '@type': 'dct:Location',
    'locn:address': t.address && {
      '@id': t.address['@id'] ? t.address['@id'] + '-core' : null,
      '@type': 'locn:Address',
      'locn:thoroughfare': beforeNum(t.address.streetAddress),
      'locn:locatorDesignator': startAtNum(t.address.streetAddress),
      'locn:postName': t.address.addressLocality,
      'locn:adminUnitL1': t.address.addressCountry || 'BE'
    }
  }
}
function toOrgHasSite (t) {
  return t && {
    '@id': t['@id'],
    '@type': 'org:Site',
    'rdfs:label': t.name,
    'vcard:hasTelephone': hasTelephone(t.telephone),
    'foaf:page': t.url,
  }
}


function addSchemaorg(t) {
  if (t.location) {
    for (var i = 0; i < t.location.length; i++) {
      t.location[i]['@type'] = TYPE_LOCATION[0]
    }
  }
  if (t['cpsv:provides'] && t['cpsv:provides'].telephone) {
    t['cpsv:provides']['contactPoint'] = {
      '@type': 'ContactPoint',
      'vcard:hasTelephone': hasTelephone(t['cpsv:provides'].telephone)
    }
  }
  if (t['openingHours']) {
    t['dct:temporal'] = {
      'openingHours': t['openingHours']
    }
  }
  if (t.telephone) {
    t['vcard:hasTelephone'] = hasTelephone(t.telephone)
  }
  if (t.location) {
    for (var i = 0; i < t.location.length; i++) {
      addSchemaorg(t.location[i])
      if (t.location[i].address && t.location[i].address.addresscountry) {
        t.location[i].address.addressCountry = t.location[i].address.addresscountry
        delete t.location[i].address.addresscountry
      }
    }
  }
}

function hasTelephone(p) {
  return p && {
    '@id': 'tel:' + p
  }
}

function reference(p) {
  return p && typeof p === 'object' ? p['@id'] && {
    '@id': p['@id']
  } : {
    '@id': p
  }
}

function seeAlsoPredicates() {
  return [{
    '@id': 'foaf:page',
    'rdfs:seeAlso': { '@id': 'schema:url'}
  }, {
    '@id': 'cpsv:provides',
    'rdfs:seeAlso': { '@id': 'schema:provider'}
  }, {
    '@id': 'vcard:hasTelephone',
    'rdfs:seeAlso': { '@id': 'schema:telephone'}
  }, {
    '@id': 'locn:address',
    'rdfs:seeAlso': { '@id': 'schema:address'}
  }, {
    '@id': 'locn:thoroughfare',
    'rdfs:seeAlso': { '@id': 'schema:streetAddress'}
  }, {
    '@id': 'locn:locatorDesignator',
    'rdfs:seeAlso': { '@id': 'schema:streetAddress'}
  }, {
    '@id': 'locn:postName',
    'rdfs:seeAlso': { '@id': 'schema:addressLocality'}
  }, {
    '@id': 'locn:adminUnitL1',
    'rdfs:seeAlso': { '@id': 'schema:addressCountry'}
  }, {
    '@id': 'dct:description',
    'rdfs:seeAlso': { '@id': 'schema:description'}
  }, {
    '@id': pageUrl,
    '@type': 'ContactPage',
    'name': 'Contact'
  }]
}