// add... mutates the object
// to... returns a new object

// Return a list of triples
function addSemantics(t) {
  return [].concat(
    addSlug(t),
    toCpsvPublicService(t),
    toSchemaorgService(t),
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

function toCpsvPublicService(org) {
  var t = org['cpsv:provides']
  if (empty(t)) {
    return
  }
  return {
    '@id': org['@id'] + '-service-core',
    '@type': 'cpsv:PublicService',
    'dct:title': t.name,
    'dct:description': t.description,
    'cpsv:hasChannel': {
      '@id': '_:channel-contact',
      '@type': ['cpsv:Channel', 'schema:ContactPoint'],
      'openingHours': t.openingHours,
      'vcard:hasTelephone': toTelephone(t.telephone)
    },
    'schema:contactPoint': toReference('_:channel-contact')
  }
}

function toSchemaorgService(org) {
  var t = inert(org['cpsv:provides'])
  if (empty(t)) {
    return
  }

  // Extract from organization
  delete org['cpsv:provides']

  return [{
    '@id': org['@id'] + '-service',
    '@type': 'GovernmentService',
    name: t.name,
    description: t.description,
    provider: toReference(org),
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: {
        '@type': 'ContactPoint',
        telephone: fixTelephone(t.telephone)
          // 'contactOption' : 'TollFree',
          // 'areaServed': 'BE'
      },
      serviceUrl: t.url
    },
    hoursAvailable: toHoursAvailable(t.openingHours)
  }, {
    '@id': org['@id'] + '-service',
    'rdfs:seeAlso': toReference(org['@id'] + '-service-core')
  }]
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
    'foaf:homepage': toReference(t.url),
    'cpsv:provides': toReference(t['cpsv:provides']),
    'locn:location': t.location.map(toLocnLocation),
    'vcard:hasTelephone': toTelephone(t.telephone),
    'org:hasSite': t.location.map(toOrgHasSite)
  }, {
    '@id': t['@id'],
    'rdfs:seeAlso': toReference(t['@id'] + '-core')
  }].concat(t.location.map(toSeeAlsoLocation))
}

function toLocnLocation(t) {
  return t && {
    '@id': t['@id'] + '-core',
    '@type': 'dct:Location',
    'vcard:hasTelephone': toTelephone(t.telephone),
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

function toOrgHasSite(t) {
  return t && {
    '@id': t['@id'] + '-core',
    '@type': 'org:Site',
    'rdfs:label': t.name,
    'vcard:hasTelephone': toTelephone(t.telephone),
    'foaf:page': t.url,
  }
}

function toSeeAlsoLocation (t) {
  return t && {
    '@id': t['@id'],
    'rdfs:seeAlso': toReference(t['@id'] + '-core'),
  }
}

function addSchemaorg(t) {
  if (t['cpsv:provides'] && t['cpsv:provides'].telephone) {
    t['cpsv:provides']['contactPoint'] = {
      '@type': 'ContactPoint',
      'vcard:hasTelephone': toTelephone(t['cpsv:provides'].telephone)
    }
  }
  if (t['openingHours']) {
    t['dct:temporal'] = {
      'openingHours': t['openingHours']
    }
  }
  if (t.telephone) {
    t.telephone = fixTelephone(t.telephone)
  }
  if (t.location) {
    for (var i = 0; i < t.location.length; i++) {
      t.location[i]['@type'] = TYPE_LOCATION[0]
      addSchemaorg(t.location[i])
      if (t.location[i].address && t.location[i].address.addresscountry) {
        t.location[i].address.addressCountry = t.location[i].address.addresscountry
        delete t.location[i].address.addresscountry
      }
    }
  }
}

function toTelephone(p) {
  return p && {
    '@id': 'tel:' + fixTelephone(p)
  }
}

function toReference(p) {
  return p && typeof p === 'object' ? p['@id'] && {
    '@id': p['@id']
  } : {
    '@id': p
  }
}

function seeAlsoPredicates() {
  return [{
    '@id': 'foaf:page',
    'rdfs:seeAlso': { '@id': 'schema:url' }
  }, {
    '@id': 'cpsv:provides',
    'rdfs:seeAlso': { '@id': 'schema:provider' }
  }, {
    '@id': 'vcard:hasTelephone',
    'rdfs:seeAlso': { '@id': 'schema:telephone' }
  }, {
    '@id': 'locn:address',
    'rdfs:seeAlso': { '@id': 'schema:address' }
  }, {
    '@id': 'locn:thoroughfare',
    'rdfs:seeAlso': { '@id': 'schema:streetAddress' }
  }, {
    '@id': 'locn:locatorDesignator',
    'rdfs:seeAlso': { '@id': 'schema:streetAddress' }
  }, {
    '@id': 'locn:postName',
    'rdfs:seeAlso': { '@id': 'schema:addressLocality' }
  }, {
    '@id': 'locn:adminUnitL1',
    'rdfs:seeAlso': { '@id': 'schema:addressCountry' }
  }, {
    '@id': 'dct:description',
    'rdfs:seeAlso': { '@id': 'schema:description' }
  }, {
    '@id': pageUrl,
    '@type': 'ContactPage',
    'name': 'Contact'
  }]
}
