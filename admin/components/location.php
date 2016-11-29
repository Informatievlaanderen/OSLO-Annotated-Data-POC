<script type="text/x-template" id="location-template">
  <div class="card">
    <!-- <div class="card-type">locatie</div> -->
    <div class="card-header" @click="show.card=1">
      <i class="fa-chevron-left glyphicon glyphicon-phone"></i>
      <img class="card-delete" src="css/icons/ic_delete_forever_black_24px.svg" @click.stop="$emit('rm')">
      <h4 class="card-title"><input type="text" v-model="l.name" class="form-control control-subtle" placeholder="Naam van de locatie" autofocus></h4>
      <h6 class="card-subtitle text-muted" v-if="!show.card&&l.address&&l.address.addressLocality">{{ l.address.streetAddress }}, {{l.address.addressLocality}}</h6>
    </div>
    <div v-show="show.card">
      <div class="card-block form-group-reduce">
        <div class="card-addfields">
          <a href="#" v-if="!l.telephone&&!show.telephone" @click.prevent="add('telephone')">telefoon</a>
          <a href="#" v-if="!l.url&&!show.url" @click.prevent="add('url')">url</a>
          <a href="#" v-if="!l.openingHours" @click.prevent="addM('l', 'openingHours')">openingsuren</a>
        </div>
        <div class="form-group" :class="{'has-danger':errors.telephone}" v-if="l.telephone||show.telephone">
          <input type="text" class="form-control" v-model="l.telephone" placeholder="Telefoon">
        </div>
        <div class="form-group" :class="{'has-danger':errors.url}" v-if="l.url||show.url">
          <input type="text" class="form-control" v-model="l.url" placeholder="URL">
        </div>
      </div>

      <hr style="margin: 0;">

      <div class="card-block" v-if="l.address">
        <p class="text-uppercase text-muted">Adres</p>
        <div class="form-group row">
          <div class="col-sm-9">
            <select2 v-if="selectLocality" :options="$root.gemeenten" v-model="l.address.addressLocality" class="form-control">
              <option disabled :value="null">Kies een gemeente</option>
            </select2>
            <input v-else type="text" v-model="l.address.addressLocality" class="form-control" placeholder="Stad/gemeente">
          </div>
          <div class="col-sm-3">
            <input type="text" class="form-control" v-model="l.address.postalCode" placeholder="Postcode">
          </div>
        </div>
        <div class="row">
          <div class="col-sm-9">
            <select2 v-if="straten.length" :options="straten" v-model="street" class="form-control">
              <option disabled :value="null">Kies een straat</option>
            </select2>
            <input v-else type="text" v-model="street" class="form-control" placeholder="Stad/gemeente">
          </div>
          <div class="col-sm-3">
            <input type="text" class="form-control" v-model="number" placeholder="nummer">
          </div>
        </div>
      </div>
      <div class="card-block add" v-else>
        <a href="#" @click.prevent="addM('l', 'address')" class="card-link">Adres invullen</a>
      </div>

      <hr style="margin: 0;" v-if="l.openingHours">

      <div class="card-block" v-if="l.openingHours">
        <div class="text-uppercase text-muted">Openingsuren</div>
        <div class="hour-days">Ma Di Wo Do Vr Za Zo</div>
        <opening-hour v-for="(h, i) in l.openingHours" :i="i" :parent="l"></opening-hour>
        <div class="form-group" @click.prevent="addM('l', 'openingHours')">
          <div class="float-sm-left col-form-label">
            <label class="form-check-inline" v-for="(day, d) in days">
              <input class="form-check-input" type="checkbox">
            </label>
          </div>
          <button class="btn btn-secondary control-inline">Lijn toevoegen</button>
        </div>
      </div>
    </div>
  </div>
</script>
<script>
Vue.component('location', {
  props: ['l'],
  data() {
    if (empty(this.l.address)) {
      console.log('location: address is missing')
      this.l.address = createProp('address')
    }
    return {
      number: startAtNum(this.l.address.streetAddress),
      street: beforeNum(this.l.address.streetAddress),
      straten: [],
      show: {
        card: false,
        telephone: false,
        url: false
      }
    }
  },
  computed: {
    errors () {
      var errors = {}
      errors.url = this.l.url ? !fixUrl(this.l.url) : 0
      errors.telephone = this.l.telephone ? !fixTelephone(this.l.telephone) : 0
      return errors
    },
    // Only show locality selector if empty or known locality
    selectLocality () {
      return this.$root.gemeenten.length &&
        (!this.l.address.addressLocality || this.$root.gemeenten.indexOf(this.l.address.addressLocality) !== -1) &&
        (!this.l.address.addressCountry || this.l.address.addressCountry === 'BE')
    }
  },
  methods: {
    updateStreets () {
      if (!this.l.address || !this.l.address.addressLocality) {
        return
      }
      crabStreets(this.l.address.addressLocality).then((straten) => {
        this.straten = straten
        console.log('location: has', straten.length, 'streets for', this.l.address.addressLocality)
      })
    }
  },
  mounted () {
    this.updateStreets()
  },
  watch: {
    'street' () {
      this.l.address.streetAddress = [this.street, this.number].filter(Boolean).join(' ')
    },
    'number' () {
      this.l.address.streetAddress = [this.street, this.number].filter(Boolean).join(' ')
    },
    'l.address.addressLocality' (locality) {
      this.updateStreets(locality)
    },
    'l.address.streetAddress' () {
      this.number = startAtNum(this.l.address.streetAddress)
      this.street = beforeNum(this.l.address.streetAddress)
    }
  },
  template: '#location-template'
})
</script>
