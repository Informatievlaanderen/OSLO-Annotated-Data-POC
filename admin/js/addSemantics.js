
// Return a list of triples
function addSemantics(t) {
  addSlug(t)
  transformService(t)
  addSchemaorg(t)
  addISAcore(t)
  addTypes(t)

  return [{
    "@id": "foaf:page",
    "rdfs:seeAlso": { "@id": "schema:url"}
  }, {
    "@id": "cpsv:provides",
    "rdfs:seeAlso": { "@id": "schema:provider"}
  }, {
    "@id": "vcard:hasTelephone",
    "rdfs:seeAlso": { "@id": "schema:telephone"}
  }, {
    "@id": "locn:address",
    "rdfs:seeAlso": { "@id": "schema:address"}
  }, {
    "@id": "locn:thoroughfare",
    "rdfs:seeAlso": { "@id": "schema:streetAddress"}
  }, {
    "@id": "locn:locatorDesignator",
    "rdfs:seeAlso": { "@id": "schema:streetAddress"}
  }, {
    "@id": "locn:postName",
    "rdfs:seeAlso": { "@id": "schema:addressLocality"}
  }, {
    "@id": "locn:adminUnitL1",
    "rdfs:seeAlso": { "@id": "schema:addressCountry"}
  }, {
    "@id": "dct:description",
    "rdfs:seeAlso": { "@id": "schema:description"}
  }]
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
    "@type": "ServiceChannel"
  }
  if (t.telephone) {
    t.availableChannel.servicePhone = {
        "@type": "ContactPoint",
        "telephone": t.telephone
      }
      // delete t.telephone
  }
  if (t.url) {
    t.availableChannel.serviceUrl = t.url
      // delete t.url
  }
}

function addTypes(t) {
  t['@type'] = TYPE_ORGANISATION
  t['cpsv:provides']['@type'] = TYPE_SERVICE
  for (var i = 0; i < t.location.length; i++) {
    t.location[i]['@type'] = TYPE_LOCATION
  }
}

function addISAcore(t) {
  addISAcoreBasics(t)
  if (t.url) {
    t['foaf:homepage'] = { '@id': t.url }
  }
  if (t.location && t.location.length) {
    t['org:hasSite'] = []
    for (var i = 0; i < t.location.length; i++) {
      if (!empty(t.location[i])) {
        t['org:hasSite'].push({ '@id': t.location[i]['@id'] })
        addISAcoreLocation(t.location[i])
      }
    }
  }
}

function addISAcoreBasics(t) {
  if (t.name) {
    t['dct:title'] = t.name
    t['rdfs:label'] = t.name
  }
  if (t.description) {
    t['dct:description'] = t.description
  }
  if (!empty(t.address)) {
    t['locn:address'] = {
      '@type': 'locn:Address',
      'locn:thoroughfare': beforeNum(t.address.streetAddress),
      'locn:locatorDesignator': startAtNum(t.address.streetAddress),
      'locn:postName': t.address.addressLocality,
      'locn:adminUnitL1': t.address.addressCountry || 'BE'
    }
  }
}

function addISAcoreLocation(t) {
  addISAcoreBasics(t)
  if (t.url) {
    t['foaf:page'] = { '@id': t.url }
  }
}

function addSchemaorg(t) {
  t['@type'] = TYPE_ORGANISATION[0]
  t['cpsv:provides'] && (t['cpsv:provides']['@type'] = TYPE_SERVICE[0])
  if (t.location) {
    for (var i = 0; i < t.location.length; i++) {
      t.location[i]['@type'] = TYPE_LOCATION[0]
    }
  }
  if (t['cpsv:provides'] && t['cpsv:provides'].telephone) {
    t['cpsv:provides']['schema:contactPoint'] = {
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
  return {
    '@type': ['Work', 'Voice'],
    'vcard:hasValue': 'tel:' + p
  }
}
