<script type="text/x-template" id="service-template">
  <div class="card">
    <div class="card-header">
      <h4 class="card-title"><input type="text" v-model="svc.name" class="form-control control-subtle" placeholder="Naam van de dienst" autofocus></h4>
    </div>

    <div class="card-block form-group-reduce">
      <div class="card-addfields">
        <a href="#" v-if="!svc.telephone&&!show.telephone" @click.prevent="add('telephone')">telefoon</a>
        <a href="#" v-if="!svc.email&&!show.email" @click.prevent="add('email')">email</a>
        <a href="#" v-if="!svc.url&&!show.url" @click.prevent="add('url')">url</a>
        <a href="#" v-if="!svc.description&&!show.description" @click.prevent="add('description')">beschrijving</a>
        <a href="#" v-if="!svc.openingHours" @click.prevent="addM('svc', 'openingHours')">openingsuren</a>
      </div>
      <div class="form-group" :class="{'has-danger':errors.telephone}" v-if="svc.telephone||show.telephone">
        <input type="text" class="form-control" v-model="svc.telephone" placeholder="Telefoon">
      </div>
      <div class="form-group" :class="{'has-danger':errors.email}" v-if="svc.email||show.email">
        <input type="text" class="form-control" v-model="svc.email" placeholder="E-mail">
      </div>
      <div class="form-group" :class="{'has-danger':errors.url}" v-if="svc.url||show.url">
        <input type="text" class="form-control" v-model="svc.url" placeholder="URL">
      </div>
      <div class="form-group" :class="{'has-danger':errors.description}" v-if="svc.description||show.description">
        <textarea v-model="svc.description" class="form-control" placeholder="Korte beschrijving"></textarea>
      </div>
    </div>

    <hr style="margin: 0;" v-if="svc.openingHours">

    <div class="card-block" v-if="svc.openingHours">
      <div class="text-uppercase text-muted">Openingsuren</div>
      <div class="hour-days">Ma Di Wo Do Vr Za Zo</div>
      <opening-hour v-for="(h, i) in svc.openingHours" :i="i" :parent="svc"></opening-hour>
      <div class="form-group" @click.prevent="addM('svc', 'openingHours')">
        <div class="float-sm-left col-form-label">
          <label class="form-check-inline" v-for="(day, d) in days">
            <input class="form-check-input" type="checkbox">
          </label>
        </div>
        <button class="btn btn-secondary control-inline">Lijn toevoegen</button>
      </div>
    </div>
  </div>
</script>
<script>
Vue.component('service', {
  props: ['svc'],
  computed: {
    errors () {
      var errors = {}
      errors.url = this.svc.url ? !fixUrl(this.svc.url) : 0
      errors.email = this.svc.email ? !fixEmail(this.svc.email) : 0
      errors.telephone = this.svc.telephone ? !fixTelephone(this.svc.telephone) : 0
      return errors
    }
  },
  data () {
    return {
      show: {
        card: false,
        description: false,
        email: false,
        telephone: false,
        url: false
      }
    }
  },
  template: '#service-template'
})
</script>
