<script type="text/x-template" id="opening-hour-template">
  <div class="form-group">
    <div class="float-sm-left col-form-label">
      <label class="form-check-inline" v-for="(day, d) in days">
        <input class="form-check-input" type="checkbox" :checked="active[d]" @change="change(d, active[d])">
      </label>
    </div>
    <input type="text" class="form-control control-inline" placeholder="Leeglaten voor hele dag" v-model="time">
  </div>
</script>
<script>
Vue.component('opening-hour', {
  props: ['parent', 'i'],
  computed: {
    hour: {
      get() {
        return this.parent.openingHours[this.i] || ''
      },
      set(v) {
        if (v) {
          this.$set(this.parent.openingHours, this.i, v)
        } else {
          this.parent.openingHours.splice(this.i, 1)
          this.parent.hoursAvailable && this.parent.hoursAvailable.splice(this.i, 1)
        }
      }
    },
    active() {
      return days.map(d => this.hour.indexOf(d) !== -1)
    },
    time: {
      get() {
        return startAtNum(this.hour)
      },
      set(t) {
        t = startAtNum(t)
        if (t) {
          var a = beforeNum(this.hour)
          this.hour = [a, t].filter(Boolean).join(' ')
        }
      }
    }
  },
  methods: {
    change(d, current) {
      var a = inert(this.active)
      a[d] = !a[d]
      var a = a.map((a, index) => a && days[index]).filter(Boolean).join(',')
      var t = startAtNum(this.hour)
      this.hour = [a, t].filter(Boolean).join(' ')
    }
  },
  template: '#opening-hour-template'
})
</script>
