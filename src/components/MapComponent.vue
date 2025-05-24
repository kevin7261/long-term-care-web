<template>
  <div class="map-wrapper">
    <l-map
      ref="mapRef"
      :zoom="zoom"
      @update:zoom="$emit('update:zoom', $event)"
      :center="center"
      :bounds="bounds"
      :use-global-leaflet="false"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />
      <l-marker
        v-for="(point, index) in mapPoints"
        :key="index"
        :lat-lng="point.position"
      >
        <l-popup>
          <div>
            <strong>{{ point.name }}</strong><br>
            <small>{{ point.address }}</small><br>
            <small>電話：{{ point.phone }}</small><br>
            <small>區域：{{ point.district }}</small>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet"

export default defineComponent({
  name: 'MapComponent',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup
  },
  props: {
    zoom: {
      type: Number,
      required: true
    },
    center: {
      type: Array,
      required: true
    },
    bounds: {
      type: Object,
      default: null
    },
    mapPoints: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:zoom'],
  expose: ['leafletObject']
})
</script>

<style scoped>
.map-wrapper {
  flex: 1;
  position: relative;
  height: 100%;
  min-height: 0;
}

:deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  z-index: 1;
}

:deep(.leaflet-control-container) {
  z-index: 2;
}
</style> 