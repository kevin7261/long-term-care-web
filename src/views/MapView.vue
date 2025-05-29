<template>
  <div class="map-container">
    <l-map
      ref="map"
      :zoom="zoom"
      :center="center"
      @ready="onMapReady"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />
      
      <l-geo-json
        v-if="geoJsonData"
        :geojson="geoJsonData"
        :options-style="geoJsonStyle"
      >
        <l-popup>
          <div>
            <h3>{{ selectedFeature?.properties?.name }}</h3>
            <p>中位數: {{ selectedFeature?.properties?.median }}</p>
          </div>
        </l-popup>
      </l-geo-json>
    </l-map>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { LMap, LTileLayer, LGeoJson, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';

// 地圖配置
const zoom = ref(8);
const center = ref([23.5, 121]);
const map = ref(null);
const geoJsonData = ref(null);
const selectedFeature = ref(null);

// 顏色函數
const getColor = (value) => {
  return value > 100 ? '#800026' :
         value > 80  ? '#BD0026' :
         value > 60  ? '#E31A1C' :
         value > 40  ? '#FC4E2A' :
         value > 20  ? '#FD8D3C' :
         value > 10  ? '#FEB24C' :
         value > 5   ? '#FED976' :
                      '#FFEDA0';
};

// GeoJSON 樣式
const geoJsonStyle = (feature) => {
  const value = feature.properties.median;
  return {
    fillColor: getColor(value),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
};

// 地圖準備就緒
const onMapReady = (map) => {
  console.log('Map is ready:', map);
};

// 載入 GeoJSON 數據
const loadGeoJSON = async () => {
  try {
    const response = await fetch('/data/taiwan.geojson');
    const data = await response.json();
    geoJsonData.value = data;
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
  }
};

// 組件掛載後載入數據
onMounted(() => {
  loadGeoJSON();
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}
</style> 