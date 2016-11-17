<script type="text/x-template" id="organization-template">
  <div class="card">
    <!-- <div class="card-type">dienst</div> -->
    <div class="card-header">
      <h4 class="card-title"><input type="text" v-model="org.name" class="form-control control-subtle" placeholder="Naam van de organisatie" autofocus></h4>
    </div>

    <div class="card-block form-group-reduce">
      <div class="card-addfields">
        <a href="#" v-if="!org.telephone&&!show.telephone" @click.prevent="add('telephone')">telefoon</a>
        <a href="#" v-if="!org.email&&!show.email" @click.prevent="add('email')">email</a>
        <a href="#" v-if="!org.url&&!show.url" @click.prevent="add('url')">url</a>
        <a href="#" v-if="!org.description&&!show.description" @click.prevent="add('description')">beschrijving</a>
      </div>
      <div class="form-group" :class="{'has-danger':errors.telephone}" v-if="org.telephone||show.telephone">
        <input type="text" class="form-control" v-model="org.telephone" placeholder="Telefoon">
      </div>
      <div class="form-group" :class="{'has-danger':errors.email}" v-if="org.email||show.email">
        <input type="text" class="form-control" v-model="org.email" placeholder="E-mail">
      </div>
      <div class="form-group" :class="{'has-danger':errors.url}" v-if="org.url||show.url">
        <input type="text" class="form-control" v-model="org.url" placeholder="URL">
      </div>
      <div class="form-group" :class="{'has-danger':errors.description}" v-if="org.description||show.description">
        <textarea v-model="org.description" class="form-control" placeholder="Korte beschrijving"></textarea>
      </div>
    </div>

    <hr style="margin: 0;" v-if="org.openingHours">

    <div class="card-block" v-if="org.openingHours">
      <div class="text-uppercase text-muted">Openingsuren</div>
      <div class="hour-days">Ma Di Wo Do Vr Za Zo</div>
      <opening-hour v-for="(_, i) in org.openingHours" :parent="org" :i="i"></opening-hour>
      <div class="form-group" @click.prevent="addM('org', 'openingHours')">
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
Vue.component('organization', {
  props: ['org'],
  computed: {
    errors () {
      var errors = {}
      errors.url = this.org.url ? !fixUrl(this.org.url) : 0
      errors.email = this.org.email ? !fixEmail(this.org.email) : 0
      errors.telephone = this.org.telephone ? !fixTelephone(this.org.telephone) : 0
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
  template: '#organization-template'
})
</script>
