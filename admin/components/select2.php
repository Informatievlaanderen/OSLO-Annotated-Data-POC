<script type="text/x-template" id="select2-template">
  <select>
    <slot></slot>
  </select>
</script>
<script>
Vue.component('select2', {
  props: ['options', 'value'],
  template: '#select2-template',
  mounted: function() {
    if (!window.$) {
      return
    }
    var vm = this
    $(this.$el)
      .val(this.value)
      // init select2
      .select2({
        data: this.options,
        // width: 'resolve',
        theme: "bootstrap"
      })
      // emit event on change.
      .on('change', function(ev) {
        vm.$emit('input', this.value)
      })
    this.$nextTick(() => {
      this.$el.value = this.value
      $(this.$el).trigger('change')
    })
  },
  watch: {
    value: function(value) {
      // update value
      if (value && $(this.$el).select2('val') != value) {
        console.log('update', $(this.$el).select2('val'), 'to', value)
        this.$el.value = this.value
        $(this.$el).trigger('change')
      }
    },
    options: function(options) {
      console.log('select2 option count', options.length)
        // update options
        // $(this.$el).select2('destroy')
      $(this.$el).select2({
        data: Object.assign({}, options),
        // width: 'resolve',
        theme: "bootstrap"
      })
    }
  },
  destroyed: function() {
    $(this.$el).off().select2('destroy')
  }
})
</script>
