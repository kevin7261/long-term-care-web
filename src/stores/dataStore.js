import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import {
  loadCommunityCareCenterData,
  loadCLevelUnitData,
  loadRespiteCareCPlusUnitData,
  loadPublicElderlyWelfareInstitutionData,
  loadElderlyWelfareInstitutionData,
  loadCommunityIntegrationServiceCenterData,
  loadGeneralNursingHomeData,
  loadResidentialLongTermCareData,
  load66Data,
  load142Data,
  load25Data,
  load41Data,
  loadHospitalClinicData,
  loadHealthcareFacilityPharmacyData,
  loadPopulation3LevelsGeoJson,
  loadIncomeGeoJson,
  loadConvenienceStoreData,
  loadMRTStationGeoJson,
  loadBusStopGeoJson,
  loadTaipeiDistrictGeoJson,
} from '../utils/dataProcessor.js';

// 主要數據存儲定義 (Main Data Store Definition)
export const useDataStore = defineStore(
  'data',
  () => {
    const layers = ref([
      {
        groupName: '數據分析',
        groupLayers: [
          {
            layerId: 'analysis-layer',
            layerName: '數據分析圖層',
            visible: true, // 預設開啟
            isLoading: false,
            isLoaded: true, // 始終載入
            type: 'analysis',
            shape: 'mixed',
            colorName: 'red',
            geoJsonData: {
              type: 'FeatureCollection',
              features: []
            },
            summaryData: {
              totalCount: 0,
              type: '分析點',
              description: '共 0 個分析點，每個點包含 2 公里分析範圍',
              lastUpdated: new Date().toISOString(),
              coverage: '0 平方公里'
            },
            tableData: [],
            legendData: null,
            loader: null, // 不需要載入器
            fileName: null,
            fieldName: null,
            isAnalysisLayer: true, // 標記為分析圖層
          },
        ],
      },
      {
        groupName: '老人福利機構',
        groupLayers: [
          {
            layerId: '公辦民營老人福利機構',
            layerName: '公辦民營老人福利機構',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadPublicElderlyWelfareInstitutionData,
            fileName: '臺北市公辦民營老人福利機構一覽表_coord.csv',
            fieldName: null,
          },
          {
            layerId: '老人福利機構',
            layerName: '老人福利機構',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadElderlyWelfareInstitutionData,
            fileName: '臺北市老人福利機構名冊1140201_coord.csv',
            fieldName: null,
          },
          {
            layerId: '一般護理之家',
            layerName: '一般護理之家',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadGeneralNursingHomeData,
            fileName: '台北市政府衛生局/臺北市立案一般護理之家一覽表_coord.csv',
            fieldName: null,
          },
        ],
      },
      {
        groupName: '社區式長照',
        groupLayers: [
          {
            layerId: '社區照顧關懷據點',
            layerName: '社區照顧關懷據點',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadCommunityCareCenterData,
            fileName: '114年度臺北市社區照顧關懷據點㇐覽表_coord.csv',
            fieldName: null,
          },
          {
            layerId: '社區整體照顧服務體系C級單位',
            layerName: '社區整體照顧服務體系C級單位',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadCLevelUnitData,
            fileName: '114年臺北市社區整體照顧服務體系C級單位一覽表_coord.csv',
            fieldName: null,
          },
          {
            layerId: '社區照顧關懷據點辦理社區喘息服務(C+單位)',
            layerName: '社區照顧關懷據點辦理社區喘息服務(C+單位)',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadRespiteCareCPlusUnitData,
            fileName:
              '臺北市政府社會局114年度社區照顧關懷據點辦理社區喘息服務(C+單位)一覽表_coord.csv',
            fieldName: null,
          },
          {
            layerId: '社區整合型服務中心(A單位)',
            layerName: '社區整合型服務中心(A單位)',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadCommunityIntegrationServiceCenterData,
            fileName: '台北市政府衛生局/臺北市社區整合型服務中心(A單位)一覽表_coord.csv',
            fieldName: null,
          },
        ],
      },
      {
        groupName: '住宿式長照',
        groupLayers: [
          {
            layerId: '住宿式長照機構',
            layerName: '住宿式長照機構',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadResidentialLongTermCareData,
            fileName: '台北市政府衛生局/臺北市立案住宿式長照機構一覽表_coord.csv',
            fieldName: null,
          },
        ],
      },
      {
        groupName: '喘息服務',
        groupLayers: [
          {
            layerId: '社區式喘息(GA03/GA04/GA06)及社區式短照(SC03/SC04/SC06)服務單位',
            layerName: '社區式喘息(GA03/GA04/GA06)及社區式短照(SC03/SC04/SC06)服務單位',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: load41Data,
            fileName:
              '台北市政府衛生局/臺北市政府衛生局長照2.0社區式喘息(GA03_GA04_GA06)及社區式短照(SC03_SC04_SC06)服務單位一覽表_41_coord.csv',
            fieldName: null,
          },
          {
            layerId: '住宿式喘息(GA05)及住宿式短照(SC05)服務單位',
            layerName: '住宿式喘息(GA05)及住宿式短照(SC05)服務單位',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: load66Data,
            fileName:
              '台北市政府衛生局/臺北市政府衛生局長照2.0住宿式喘息(GA05)及住宿式短照(SC05)服務單位一覽表_66_coord.csv',
            fieldName: null,
          },
          {
            layerId: '巷弄長照站喘息(C+)(GA07)及巷弄長照站短照(SC07)服務單位',
            layerName: '巷弄長照站喘息(C+)(GA07)及巷弄長照站短照(SC07)服務單位',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: load25Data,
            fileName:
              '台北市政府衛生局/臺北市政府衛生局長照2.0巷弄長照站喘息(C+)(GA07)及巷弄長照站短照(SC07)服務 單位一覽表_25_coord.csv',
            fieldName: null,
          },
          {
            layerId: '居家式喘息(GA09)及居家式短照(SC09)服務單位',
            layerName: '居家式喘息(GA09)及居家式短照(SC09)服務單位',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'orange',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: load142Data,
            fileName:
              '台北市政府衛生局/臺北市政府衛生局長照2.0居家式喘息(GA09)及居家式短照(SC09)服務單位一覽表_142_coord.csv',
            fieldName: null,
          },
        ],
      },
      {
        groupName: '基礎設施',
        groupLayers: [
          {
            layerId: '醫院',
            layerName: '醫院',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'lime',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadHospitalClinicData,
            fileName: '112年12月醫療院所分布圖_全國_醫院_coord.csv',
            fieldName: null,
          },
          {
            layerId: '診所',
            layerName: '診所',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'lime',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadHospitalClinicData,
            fileName: '112年12月醫療院所分布圖_全國_診所_coord.csv',
            fieldName: null,
          },
          {
            layerId: '健保特約藥局',
            layerName: '健保特約藥局',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: 'circle',
            colorName: 'green',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadHealthcareFacilityPharmacyData,
            fileName: '健保特約醫事機構-藥局_coord.csv',
            fieldName: null,
          },
          {
            layerId: '四大超商',
            layerName: '四大超商',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: null,
            colorName: 'cyan',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadConvenienceStoreData,
            fileName: '全國5大超商資料集_coord.csv',
            fieldName: null,
          },
          {
            layerId: '捷運站點',
            layerName: '捷運站點',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: null,
            colorName: 'blue',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadMRTStationGeoJson,
            fileName: 'TpeMrtStations_TWD97_FIDCODE.geojson',
            fieldName: null,
          },
          {
            layerId: '公車站點',
            layerName: '公車站點',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: null,
            colorName: 'blue',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadBusStopGeoJson,
            fileName: 'busstop.geojson',
            fieldName: null,
          },
        ],
      },
      {
        groupName: '地理統計資料',
        groupLayers: [
          {
            layerId: '人口統計-14歲以下',
            layerName: '人口統計-14歲以下',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'polygon',
            shape: null,
            colorName: 'deeppurple',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadPopulation3LevelsGeoJson,
            fileName: '113年12月行政區三段年齡組性別人口統計_村里_WGS84_臺北市.geojson',
            fieldName: 'A0A14_CNT',
          },
          {
            layerId: '人口統計-15~64歲',
            layerName: '人口統計-15~64歲',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'polygon',
            shape: null,
            colorName: 'deeppurple',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadPopulation3LevelsGeoJson,
            fileName: '113年12月行政區三段年齡組性別人口統計_村里_WGS84_臺北市.geojson',
            fieldName: 'A15A64_CNT',
          },
          {
            layerId: '人口統計-65歲以上',
            layerName: '人口統計-65歲以上',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'polygon',
            shape: null,
            colorName: 'deeppurple',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadPopulation3LevelsGeoJson,
            fileName: '113年12月行政區三段年齡組性別人口統計_村里_WGS84_臺北市.geojson',
            fieldName: 'A65UP_CNT',
          },
          {
            layerId: '綜稅綜合所得總額-中位數',
            layerName: '綜稅綜合所得總額-中位數',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'polygon',
            shape: null,
            colorName: 'purple',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadIncomeGeoJson,
            fileName: '臺北市_村里_綜稅綜合所得總額.geojson',
            fieldName: '中位數',
          },
          {
            layerId: '綜稅綜合所得總額-平均數',
            layerName: '綜稅綜合所得總額-平均數',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'polygon',
            shape: null,
            colorName: 'purple',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadIncomeGeoJson,
            fileName: '臺北市_村里_綜稅綜合所得總額.geojson',
            fieldName: '平均數',
          },
        ],
      },
      {
        groupName: '基礎地理資料',
        groupLayers: [
          {
            layerId: '行政區界',
            layerName: '行政區界',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'polygon',
            shape: null,
            colorName: 'brown',
            geoJsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            loader: loadTaipeiDistrictGeoJson,
            fileName: '臺北市區界圖_20220915.geojson',
            fieldName: 'A0A14_CNT',
          },
        ],
      },
    ]);

    // 在新的分組結構中搜尋指定 ID 的圖層
    const findLayerById = (layerId) => {
      for (const group of layers.value) {
        for (const layer of group.groupLayers) {
          if (layer.layerId === layerId) {
            return layer;
          }
        }
      }
      return null;
    };

    // 從分組結構中提取所有圖層的扁平陣列
    const getAllLayers = () => {
      const allLayers = [];
      for (const group of layers.value) {
        allLayers.push(...group.groupLayers);
      }
      return allLayers;
    };

    // 控制圖層的顯示/隱藏，並在需要時自動載入資料
    const toggleLayerVisibility = async (layerId) => {
      console.log('🔧 DataStore: toggleLayerVisibility 被調用', layerId);
      const layer = findLayerById(layerId);
      if (!layer) {
        console.error(`Layer with id "${layerId}" not found.`);
        return;
      }

      console.log('🔧 DataStore: 找到圖層', layer.layerName, '當前狀態:', layer.visible);
      // 切換可見性狀態
      layer.visible = !layer.visible;
      console.log('🔧 DataStore: 新狀態:', layer.visible);

      // 如果圖層被開啟且尚未載入，則載入資料（分析圖層除外）
      if (layer.visible && !layer.isLoaded && !layer.isLoading && !layer.isAnalysisLayer) {
        try {
          layer.isLoading = true;
          const result = await layer.loader(layer);

          // 將載入的資料直接存儲在圖層物件中
          layer.geoJsonData = result.geoJsonData;
          layer.tableData = result.tableData;
          layer.summaryData = result.summaryData;
          layer.legendData = result.legendData || null;
          layer.isLoaded = true;

          // 🔄 強制觸發響應式更新
          console.log(
            `✅ 圖層 "${layer.layerName}" 載入完成 (${result.geoJsonData?.features?.length || 0} 筆資料)`
          );
          console.log(`📊 圖層摘要資料:`, layer.summaryData);
        } catch (error) {
          console.error(`Failed to load data for layer "${layer.layerName}":`, error);
          layer.visible = false; // 載入失敗時恢復可見性狀態
        } finally {
          layer.isLoading = false;
        }
      }
    };

    // ------------------------------------------------------------
    // 選中的地圖物件
    const selectedFeature = ref(null);

    const setSelectedFeature = (feature) => {
      selectedFeature.value = feature;
    };

    const clearSelectedFeature = () => {
      selectedFeature.value = null;
    };

    // 🧮 計算兩點間距離 (Calculate Distance Between Two Points)
    // 使用 Haversine 公式計算地球表面兩點間的距離（公尺）
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371000; // 地球半徑（公尺）
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // 距離（公尺）
    };

    // 🔍 計算範圍內的點物件 (Calculate Points Within Range)
    const calculatePointsInRange = (centerLat, centerLng, radiusMeters = 2000) => {
      const pointsInRange = [];

      // 獲取所有可見且已載入的點類型圖層
      const visiblePointLayers = getAllLayers().filter(layer =>
        layer.visible &&
        layer.isLoaded &&
        layer.type === 'point' &&
        !layer.isAnalysisLayer &&
        layer.geoJsonData
      );

      console.log('🔍 檢查可見的點圖層:', visiblePointLayers.map(l => l.layerName));

      visiblePointLayers.forEach(layer => {
        if (layer.geoJsonData && layer.geoJsonData.features) {
          layer.geoJsonData.features.forEach(feature => {
            if (feature.geometry.type === 'Point') {
              const [lng, lat] = feature.geometry.coordinates;
              const distance = calculateDistance(centerLat, centerLng, lat, lng);

              if (distance <= radiusMeters) {
                pointsInRange.push({
                  layerId: layer.layerId,
                  layerName: layer.layerName,
                  featureId: feature.properties.id || feature.properties.name || '未知',
                  name: feature.properties.name || feature.properties.id || '未命名',
                  lat: lat,
                  lng: lng,
                  distance: Math.round(distance), // 四捨五入到公尺
                  properties: feature.properties
                });
              }
            }
          });
        }
      });

      // 按距離排序
      pointsInRange.sort((a, b) => a.distance - b.distance);

      console.log(`🎯 在 ${radiusMeters/1000}公里範圍內找到 ${pointsInRange.length} 個點物件`);
      return pointsInRange;
    };

        // 分析圖層管理方法
    const updateAnalysisLayerData = (analysisLayer) => {
      // 獲取所有分析點
      const analysisPoints = analysisLayer.geoJsonData.features.filter(
        f => f.properties.type === 'analysis-point'
      );

      // 更新 summaryData
      analysisLayer.summaryData = {
        totalCount: analysisPoints.length,
        type: '分析點',
        description: `共 ${analysisPoints.length} 個分析點，每個點包含 2 公里分析範圍`,
        lastUpdated: new Date().toISOString(),
        coverage: `${analysisPoints.length * 12.57} 平方公里（假設無重疊）` // 每個圓圈約 12.57 平方公里
      };

      // 更新 tableData
      analysisLayer.tableData = analysisPoints.map((feature, index) => ({
        '#': feature.properties.id,
        '編號': index + 1,
        '名稱': feature.properties.name,
        '緯度': feature.properties.lat.toFixed(6),
        '經度': feature.properties.lng.toFixed(6),
        '分析半徑': '2 公里',
        '覆蓋面積': '12.57 平方公里',
        '建立時間': new Date(feature.properties.id).toLocaleString('zh-TW'),
        '狀態': '已建立',
        '範圍內點數': feature.properties.pointsInRange ? feature.properties.pointsInRange.length : 0,
        id: feature.properties.id,
        layerId: 'analysis-layer'
      }));
    };

    const addAnalysisPoint = (lat, lng) => {
      const analysisLayer = findLayerById('analysis-layer');
      if (!analysisLayer) return;

      const pointId = Date.now(); // 使用時間戳作為唯一ID
      const pointNumber = analysisLayer.geoJsonData.features.filter(
        f => f.properties.type === 'analysis-point'
      ).length + 1;

      // 🎯 計算範圍內的點物件
      const pointsInRange = calculatePointsInRange(lat, lng, 2000);

      // 📊 統計各圖層的點數
      const layerStats = {};
      pointsInRange.forEach(point => {
        if (!layerStats[point.layerName]) {
          layerStats[point.layerName] = 0;
        }
        layerStats[point.layerName]++;
      });

      // 創建分析點要素
      const pointFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          id: pointId,
          layerId: 'analysis-layer', // 添加圖層ID
          type: 'analysis-point',
          name: `分析點 ${pointNumber}`,
          lat: lat,
          lng: lng,
          radius: 2000, // 2公里半徑
          pointsInRange: pointsInRange, // 存儲範圍內的點物件清單
          layerStats: layerStats, // 存儲各圖層統計
          // 添加 propertyData 供 PropertiesTab 使用
          propertyData: {
            '分析點名稱': `分析點 ${pointNumber}`,
            '緯度': lat.toFixed(6),
            '經度': lng.toFixed(6),
            '分析半徑': '2 公里',
            '覆蓋面積': '12.57 平方公里',
            '範圍內總點數': pointsInRange.length,
            ...Object.fromEntries(
              Object.entries(layerStats).map(([layerName, count]) =>
                [`${layerName}數量`, count]
              )
            ),
            '建立時間': new Date().toLocaleString('zh-TW'),
            '狀態': '已建立'
          }
        }
      };

      // 創建圓圈要素
      const circleFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          id: pointId + '_circle',
          layerId: 'analysis-layer', // 添加圖層ID
          type: 'analysis-circle',
          parentId: pointId,
          name: `分析範圍 ${pointNumber}`,
          radius: 2000,
          pointsInRange: pointsInRange, // 也在圓圈中存儲範圍內的點物件
          // 添加 propertyData 供 PropertiesTab 使用
          propertyData: {
            '分析範圍名稱': `分析範圍 ${pointNumber}`,
            '中心緯度': lat.toFixed(6),
            '中心經度': lng.toFixed(6),
            '半徑': '2 公里',
            '面積': '12.57 平方公里',
            '範圍內總點數': pointsInRange.length,
            '關聯分析點': `分析點 ${pointNumber}`,
          }
        }
      };

      // 添加到分析圖層
      analysisLayer.geoJsonData.features.push(pointFeature, circleFeature);

      // 更新圖層統計和表格數據
      updateAnalysisLayerData(analysisLayer);

      console.log('📍 添加分析點到圖層系統:', {
        lat,
        lng,
        pointId,
        pointsInRange: pointsInRange.length,
        layerStats
      });

      // 🎯 輸出範圍內點物件的詳細信息
      if (pointsInRange.length > 0) {
        console.log('🎯 範圍內的點物件:', pointsInRange);
      }

      return {
        pointId,
        pointsInRange,
        layerStats
      };
    };

    const clearAnalysisLayer = () => {
      const analysisLayer = findLayerById('analysis-layer');
      if (analysisLayer) {
        analysisLayer.geoJsonData.features = [];

        // 更新圖層統計和表格數據
        updateAnalysisLayerData(analysisLayer);

        console.log('🗑️ 清除分析圖層數據');
      }
    };

    // 🗑️ 刪除單個分析點 (Delete Single Analysis Point)
    const deleteAnalysisPoint = (pointId) => {
      const analysisLayer = findLayerById('analysis-layer');
      if (!analysisLayer || !analysisLayer.geoJsonData) return;

      // 過濾掉指定的分析點和其對應的圓圈
      analysisLayer.geoJsonData.features = analysisLayer.geoJsonData.features.filter(
        feature => {
          const isTargetPoint = feature.properties.type === 'analysis-point' && feature.properties.id === pointId;
          const isTargetCircle = feature.properties.type === 'analysis-circle' && feature.properties.parentId === pointId;
          return !isTargetPoint && !isTargetCircle;
        }
      );

      // 更新圖層統計和表格數據
      updateAnalysisLayerData(analysisLayer);

      console.log('🗑️ 刪除分析點:', pointId);
    };

    return {
      layers,
      findLayerById, // 根據 ID 尋找圖層
      getAllLayers, // 獲取所有圖層的扁平陣列
      toggleLayerVisibility,
      selectedFeature,
      setSelectedFeature,
      clearSelectedFeature,
      addAnalysisPoint, // 添加分析點
      clearAnalysisLayer, // 清除分析圖層
      deleteAnalysisPoint, // 刪除單個分析點
      calculatePointsInRange, // 計算範圍內的點物件
      calculateDistance, // 計算兩點間距離
      visibleLayers: computed(() => getAllLayers().filter((layer) => layer.visible)),
      loadingLayers: computed(() => getAllLayers().filter((layer) => layer.isLoading)),
    };
  },
  {
    persist: true,
  }
);
