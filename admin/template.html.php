<!DOCTYPE html>
<html lang="nl">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>OSLO Annotated Data POC</title>
  <meta name="theme-color" content="#099">

  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex, nofollow">

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.5/css/bootstrap.min.css" integrity="sha384-AysaV+vQoT3kOAXZkl02PThvDr8HYKPZhNT5h/CXfBThSRXQ6jW5DO2ekP5ViFdi" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/select2@4.0.3/dist/css/select2.min.css">
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/select2-bootstrap-theme@0.1.0-beta.9/dist/select2-bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="/admin/css/main.css">
  </head>
</head>

<body>
  <div id="app" v-cloak>
    <header>
      <a href="/" class="btn btn-lg btn-primary">Home</a>
      <div class="header-fixed">
        <button type="button" class="btn btn-lg btn-success" @click.prevent="save">Bewaren</button>
        <p>{{ message }}</p>
      </div>
    </header>
    <main class="container" style="width: 40em">
      <h1>OSLO Annotated Data POC</h1>
      <h2 class="h2-subtle">Organisatie</h2>
      <organization :org="thing"></organization>

      <h2 class="h2-subtle">Dienst</h2>
      <service :svc="thing['cpsv:provides']"></service>

      <h2 class="h2-subtle">Locaties / kantoren</h2>
      <location v-for="l in thing.location" :l="l"></location>
      <div class="card card-add" @click="addM('thing', 'location')">
        <div class="card-header">
          <h4 class="card-title">Locatie toevoegen</h4>
        </div>
      </div>

      <p style="margin-top:10em;">
        Met deze knop kan je de empty state zien, wijzigingen worden pas doorgevoerd als je op "Bewaren" klikt.
        <br><button type="button" class="btn btn-danger" @click="reset">Reset naar empty state</button>
      </p>

      <h2 class="h2-subtle h2-top">JSON-LD output</h2>
      <textarea v-model="stringified" class="form-control jsonld" :class="{valid:jsonldValid}"></textarea>

      <h2 class="h2-subtle h2-top">Internal Vue state for debugging</h2>
      <textarea class="form-control jsonld" :class="{valid:jsonldValid}" v-text="jsons"></textarea>
      </div>
  </main>

  <!-- using string template here to work around HTML <option> placement restriction -->
  <script type="text/x-template" id="demo-template">
    <div>
      <p>Selected: {{ selected }}</p>
      <select2 :options="options" v-model="selected">
        <option disabled value="0">Select one</option>
      </select2>
    </div>
  </script>

  <script src="https://unpkg.com/jquery@3.1.1"></script>
  <script src="https://unpkg.com/select2@4.0.3"></script>
  <script src="/admin/js/vue.min.js"></script>
  <script src="/admin/js/n3-browser.min.js"></script>
  <script src="/admin/js/browser-soap.min.js"></script>

  <script src="/admin/js/lib.js"></script>

  <!-- Vue components -->
  <?php require 'components/organization.php' ?>
  <?php require 'components/service.php' ?>
  <?php require 'components/location.php' ?>
  <?php require 'components/opening-hour.php' ?>
  <?php require 'components/select2.php' ?>
  <script>
  // ls('crabStreetsCache', false)
  // ls('crabGemeentenCache', false)
  var gemeenten = ls('crabGemeentenCache')
  if (!gemeenten || !gemeenten.length) {
    gemeenten = []
    crabGemeenten().then(function (gemeenten) {
      if ($root) {
        $root.gemeenten = gemeenten
      }
    })
  } else {
    gemeenten = gemeenten.map(g => g.GemeenteNaam)
    console.log('template: Cached', gemeenten.length, 'localities')
  }
  var jsonld = <?php echo json_encode($jsonld) ?>;
  // var days = 'Maandag,Disndag,Woensdag,Donderdag,Vrijdag,Zaterdag,Zondag'.split(',')
  var days = 'Mo,Tu,We,Th,Fr,Sa,Su'.split(',')
  var props = ['url', 'email', 'telephone', 'name', 'description', 'vatID', 'openingHours', '@id']
  var nestedProps = {
    'cpsv:provides': createProp('cpsv:provides'),
    location: [createProp('location')]
  }
  Vue.mixin({
    data() {
      return {
        days: days
      }
    },
    methods: {
      add(field) {
        this.show[field] = true
        if (this.base) {
          this.$set(this[this.base], field, null)
        }
      },
      addM(thing, prop) {
        if (!this[thing][prop] || !this[thing][prop].length) {
          this.$set(this[thing], prop, [createProp(prop, true)])
        } else {
          this[thing][prop].push(createProp(prop))
        }
      }
    }
  })

  /* 
   * The idea here is to walk the graph and get 1 thing containing basic data
   * Locations are saved in thing.location
   * Service is saved in thing.cpsv:provides
   *
   * When stringifying, extra triples are derived from the basic data
   */
  var thing = fromGraph(JSON.parse(jsonld))

  // Make everything reactive
  if (thing['cpsv:provides']) {
    thing['cpsv:provides'] = Object.assign(createProp('cpsv:provides'), thing['cpsv:provides'])
  }
  if (thing.location) {
    for (var i = 0; i < thing.location.length; i++) {
      thing.location[i] =  Object.assign(createProp('location'), thing.location[i])
      thing.location[i].address =  Object.assign(createProp('address'), thing.location[i].address)
    }
  }

  thing = Object.assign(toObject(props), nestedProps, thing)
  var $root = new Vue({
    el: '#app',
    data() {
      return {
        gemeenten: gemeenten,
        thing: thing,
        message: '',
        stringified: jsonld,
        jsonldValid: true
      }
    },
    computed: {
      locations() {
        return getOfType(Object.values(this.thing), 'GovernmentOrganization')
      },
      jsonldValid() {
        try {
          var x = JSON.parse(this.stringified)
          return x && typeof x === 'object'
        } catch (e) {}
        return false
      },
      jsons() {
        return JSON.stringify(this.thing, null, 2)
      },
      errors() {
        var errors = {}
        errors.url = this.thing.url ? !fixUrl(this.thing.url) : 0
        errors.email = this.thing.email ? !fixEmail(this.thing.email) : 0
        errors.telephone = this.thing.telephone ? !fixTelephone(this.thing.telephone) : 0
        return errors
      }
    },
    methods: {
      reset() {
        this.thing = Object.assign(toObject(props), nestedProps)
        window.scrollTo(0, 0)
      },
      setMessage(msg) {
        clearTimeout(this.messageTimeout)
        this.message = msg
        this.messageTimeout = setTimeout(() => this.message = this.message === msg ? '' : this.message, 3000)
      },
      save() {
        this.message = ''
        if (!this.jsonldValid) {
          return this.setMessage('Ongeldige JSON-LD kan niet bewaard worden')
        }
        putJSON('/admin/index.php', {
            jsonld: this.stringified
          })
          .then(data => {
            console.log(data)
            this.setMessage('Wijzigingen bewaard')
          })
          .catch(data => {
            console.log(data)
            this.setMessage('Er trad een fout op')
          })
      }
    },
    watch: {
      // stringified (x, y) {
      //  console.log('str')
      //  if (x === y) {
      //    return
      //  }
      //  try  {
      //    var x = JSON.parse(x)
      //    if (x && typeof x === 'object') {
      //      for (var key in x) {
      //        if (x[key] && this.thing[key] !== x[key]) {
      //          console.log('str set', key)
      //          this.$set(this.thing, key, x[key])
      //        }
      //      }
      //    }
      //  } catch(e) {}
      // }
      thing: {
        deep: true,
        handler (x, y) {
          x = inert(x)
          // Fixers
          x.url = fixUrl(x.url)
          x.email = fixEmail(x.email)
          x.telephone = fixTelephone(x.telephone)
          addSemantics(x)
          // Filter out empty values
          cleanEmpty(x)
          x = toGraph(x)
          x = JSON.stringify(x, null, 2)
          if (x !== this.stringified) {
            this.stringified = x
          }
        }
      }
    }
  })
  </script>
</body>

</html>
