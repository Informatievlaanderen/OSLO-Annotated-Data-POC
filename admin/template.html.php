<!DOCTYPE html>
<html lang="nl">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>OSLO</title>
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
      <form @submit.prevent="save">
        <button class="btn btn-lg btn-success">Bewaren</button>
      </form>
    </header>
    <div class="container" style="max-width: 40em">
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


      <h2 class="h2-subtle h2-top">JSON-LD output</h2>
      <textarea v-model="stringified" class="form-control jsonld" :class="{valid:jsonldValid}"></textarea>

      <h2 class="h2-subtle h2-top">Internal Vue state</h2>
      <textarea class="form-control jsonld" :class="{valid:jsonldValid}" v-text="jsons"></textarea>
      </div>
  </div>

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
  var straten = []
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
    console.log('gemeenten cache', gemeenten.length)
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
   *
   * When stringifying, extra triples are derived from the basic data
   */
  var thing = Object.assign(toObject(props), nestedProps, fromGraph(JSON.parse(jsonld)))
  var $root = new Vue({
    el: '#app',
    data() {
      return {
        stratenCache: 'gemeentenaam',
        straten: straten,
        gemeenten: gemeenten,
        days: days,
        thing: thing,
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
      add(prop) {
        if (prop === null) {}
      },
      save() {
        if (!this.jsonldValid) {
          return alert('Cannot save')
        }
        putJSON('/admin/index.php', {
            jsonld: this.stringified
          })
          .then(data => {
            console.log(data)
          })
      },
      format() {
        this.stringified = JSON.stringify(JSON.parse(this.stringified), null, 2)
      }
    },
    mounted() {
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
          // console.log(x)
          // Fixers
          x.url = fixUrl(x.url)
          x.email = fixEmail(x.email)
          x.telephone = fixTelephone(x.telephone)
          fixAll(x)
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
