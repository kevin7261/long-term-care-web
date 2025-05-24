<template>
  <div class="map-container" :class="{ 'vertical-layout': isVerticalLayout }">
    <template v-if="isVerticalLayout">
      <MapComponent
        v-model:zoom="zoom"
        :center="center"
        ref="mapRef"
      />
      <div 
        class="resizer vertical-resizer"
        @mousedown="handleDragStart(true)"
      ></div>
      <ControlPanel
        :error-message="errorMessage"
        :csv-data="csvData"
        :csv-headers="csvHeaders"
        :style="{ height: sidebarHeight + 'px' }"
        @button-click="handleButtonClick"
        @load-csv="loadCSV"
      />
    </template>
    <template v-else>
      <ControlPanel
        :error-message="errorMessage"
        :csv-data="csvData"
        :csv-headers="csvHeaders"
        :style="{ width: sidebarWidth + 'px' }"
        @button-click="handleButtonClick"
        @load-csv="loadCSV"
      />
      <div 
        class="resizer"
        @mousedown="handleDragStart(false)"
      ></div>
      <MapComponent
        v-model:zoom="zoom"
        :center="center"
        ref="mapRef"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import "leaflet/dist/leaflet.css"
import { useMapStore } from '../stores/mapStore'
import L from 'leaflet'
import MapComponent from './MapComponent.vue'
import ControlPanel from './ControlPanel.vue'

// Store
const mapStore = useMapStore()

// Layout state
const isVerticalLayout = ref(window.innerWidth < 1200)
const sidebarWidth = ref(300)
const sidebarHeight = ref(300)
const isDragging = ref(false)
const windowWidth = ref(window.innerWidth)

// Map state
const zoom = ref(13)
const center = ref([25.0330, 121.5654]) // 台北市中心
const mapRef = ref(null)
const crosshairMarker = ref(null)

// Computed properties
const csvData = computed(() => mapStore.filteredData)
const csvHeaders = computed(() => mapStore.csvHeaders)
const errorMessage = computed(() => mapStore.errorMessage)

// Crosshair icon
const crosshairIcon = L.divIcon({
  className: 'crosshair-icon',
  html: '<div class="crosshair"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})

// Event handlers
const handleButtonClick = () => {
  alert('按鈕被點擊了！')
}

const loadCSV = () => {
  mapStore.loadCSV()
}

// Resize handlers
const handleResize = () => {
  windowWidth.value = window.innerWidth
  isVerticalLayout.value = windowWidth.value < 1200
  
  if (isVerticalLayout.value) {
    const minHeight = window.innerHeight * 0.1
    const maxHeight = window.innerHeight * 0.9
    if (sidebarHeight.value < minHeight) {
      sidebarHeight.value = minHeight
    } else if (sidebarHeight.value > maxHeight) {
      sidebarHeight.value = maxHeight
    }
  } else {
    const minWidth = windowWidth.value * 0.1
    const maxWidth = windowWidth.value * 0.9
    if (sidebarWidth.value < minWidth) {
      sidebarWidth.value = minWidth
    } else if (sidebarWidth.value > maxWidth) {
      sidebarWidth.value = maxWidth
    }
  }
}

// Drag handlers
const handleDragStart = (isVertical = false) => {
  isDragging.value = true
  document.addEventListener('mousemove', (e) => handleDrag(e, isVertical))
  document.addEventListener('mouseup', handleDragEnd)
}

const handleDrag = (e, isVertical) => {
  if (isDragging.value) {
    if (isVertical) {
      const minHeight = window.innerHeight * 0.1
      const maxHeight = window.innerHeight * 0.9
      const newHeight = window.innerHeight - e.clientY
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        sidebarHeight.value = newHeight
      }
    } else {
      const minWidth = windowWidth.value * 0.1
      const maxWidth = windowWidth.value * 0.9
      const newWidth = e.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        sidebarWidth.value = newWidth
      }
    }
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', handleDragEnd)
}

// Map crosshair
watch(mapRef, (newMap) => {
  if (newMap && newMap.leafletObject) {
    if (crosshairMarker.value) {
      crosshairMarker.value.remove()
    }
    crosshairMarker.value = L.marker(center.value, {
      icon: crosshairIcon,
      interactive: false,
      zIndexOffset: 1000
    }).addTo(newMap.leafletObject)
  }
})

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script> 