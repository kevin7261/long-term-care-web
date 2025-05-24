<template>
  <div class="map-view">
    <ControlPanel />
    <MapComponent
      :zoom="zoom"
      :center="center"
      :bounds="bounds"
      @update:zoom="zoom = $event"
    />
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useMapStore } from '../stores/mapStore'
import ControlPanel from '../components/ControlPanel.vue'
import MapComponent from '../components/MapComponent.vue'

export default defineComponent({
  name: 'MapView',
  components: {
    ControlPanel,
    MapComponent
  },
  setup() {
    const mapStore = useMapStore()
    const zoom = ref(15)  // 調整縮放級別
    const center = ref([25.03, 121.50])  // 臺北市萬華區的大致中心點
    const bounds = ref(null)

    return {
      zoom,
      center,
      bounds
    }
  }
})
</script>

<style scoped>
.map-view {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style> 