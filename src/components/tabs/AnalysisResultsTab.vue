<template>
  <div class="custom-scroll h-100">
    <h5 class="mb-4">分析結果詳情</h5>

    <DetailItem title="總體 Moran's I 指數" value="0.6789" />
    <DetailItem title="顯著性 (P-value)" value="0.001" />
    <DetailItem title="空間聚集模式" value="顯著聚集" />

    <div class="row">
      <div class="col-md-6">
        <DetailItem title="高-高聚集區數量" :value="15" />
      </div>
      <div class="col-md-6">
        <DetailItem title="低-低聚集區數量" :value="8" />
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <DetailItem title="空間離群點 (高-低)" :value="3" />
      </div>
      <div class="col-md-6">
        <DetailItem title="空間離群點 (低-高)" :value="2" />
      </div>
    </div>
    
    <DetailItem title="隨機指標 A" value="75.23" />
    <DetailItem title="隨機指標 B" :value="42" />

    <!-- Chart Placeholders - Vertical Layout -->
    <div class="mt-4">
      <div class="card mb-3">
        <div class="card-header">
          <h6 class="mb-0 text-muted small text-uppercase">P值分佈圖</h6>
        </div>
        <div class="card-body p-2" style="height: 250px;">
          <div ref="pValueChartContainer" class="w-100 h-100"></div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header">
          <h6 class="mb-0 text-muted small text-uppercase">Moran 散佈圖</h6>
        </div>
        <div class="card-body p-2" style="height: 300px;">
          <div ref="moranScatterPlotContainer" class="w-100 h-100"></div>
        </div>
      </div>
    </div>

    <!-- Specific analysis details will be shown here based on selectedAnalysisId -->
    <!-- This part is managed by RightPanel.vue -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';
import DetailItem from '../common/DetailItem.vue';

export default {
  name: 'AnalysisResultsTab',
  components: {
    DetailItem
  },
  // Props that might still be needed if RightPanel passes selected analysis details:
  // props: {
  //   selectedAnalysis: { // Example: if RightPanel passes a full analysis object
  //     type: Object,
  //     default: null
  //   }
  // },
  // No emits needed from here for the moved cards.
  // emits: [], 
  setup() {
    const moranScatterPlotContainer = ref(null);
    const pValueChartContainer = ref(null);

    const drawPValueDistributionChart = () => {
      if (!pValueChartContainer.value) return;

      // Sample P-value data
      const pValues = Array.from({ length: 200 }, () => Math.random());

      const margin = { top: 20, right: 20, bottom: 40, left: 50 }; // Adjusted left margin for Y-axis label
      const containerRect = pValueChartContainer.value.getBoundingClientRect();
      const width = containerRect.width - margin.left - margin.right;
      const height = containerRect.height - margin.top - margin.bottom;

      d3.select(pValueChartContainer.value).select("svg").remove();

      const svg = d3.select(pValueChartContainer.value)
        .append("svg")
        .attr("width", containerRect.width)
        .attr("height", containerRect.height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // X scale for P-values
      const xScale = d3.scaleLinear()
        .domain([0, 1]) // P-values range from 0 to 1
        .range([0, width]);

      // Kernel Density Estimation function
      function kernelDensityEstimator(kernel, X) {
        return function(V) {
          return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
          });
        };
      }
      function epanechnikovKernel(bandwidth) {
        return function(u) {
          return Math.abs(u /= bandwidth) <= 1 ? 0.75 * (1 - u * u) / bandwidth : 0;
        };
      }

      const kde = kernelDensityEstimator(epanechnikovKernel(0.05), xScale.ticks(100)); // Bandwidth and evaluation points
      const density = kde(pValues);

      // Y scale for density
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(density, d => d[1])])
        .range([height, 0]);

      // X Axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 5)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("P-value");

      // Y Axis
      svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.left + 15) // Adjusted for new margin
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("密度 (Density)");

      // Density curve
      svg.append("path")
        .datum(density)
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
          .curve(d3.curveBasis)
          .x(d => xScale(d[0]))
          .y(d => yScale(d[1]))
        );
    };

    const drawMoranScatterPlot = () => {
      if (!moranScatterPlotContainer.value) return;

      // Sample data for Moran Scatter Plot
      const data = Array.from({ length: 50 }, () => ({
        x: Math.random() * 10,
        y: Math.random() * 10,
        value: Math.random() * 100
      }));

      const margin = { top: 20, right: 20, bottom: 40, left: 40 };
      const containerRect = moranScatterPlotContainer.value.getBoundingClientRect();
      const width = containerRect.width - margin.left - margin.right;
      const height = containerRect.height - margin.top - margin.bottom;

      // Clear previous SVG
      d3.select(moranScatterPlotContainer.value).select("svg").remove();

      const svg = d3.select(moranScatterPlotContainer.value)
        .append("svg")
        .attr("width", containerRect.width)
        .attr("height", containerRect.height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.x)])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([height, 0]);

      // Axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom -5)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .text("空間落後項 (Spatially Lagged Variable)");
        

      svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.left + 15)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .text("原始變數 (Original Variable)");

      // Points
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", 4)
        .style("fill", "steelblue")
        .style("opacity", 0.7);
        
      // Quadrant lines (optional - centered at mean, here at 5,5 for example)
      const meanX = 5; // Assuming mean of x is 5
      const meanY = 5; // Assuming mean of y is 5
      svg.append("line")
          .attr("x1", xScale(meanX))
          .attr("y1", 0)
          .attr("x2", xScale(meanX))
          .attr("y2", height)
          .attr("stroke", "grey")
          .attr("stroke-dasharray", "4");
      svg.append("line")
          .attr("x1", 0)
          .attr("y1", yScale(meanY))
          .attr("x2", width)
          .attr("y2", yScale(meanY))
          .attr("stroke", "grey")
          .attr("stroke-dasharray", "4");
    };

    onMounted(() => {
      drawPValueDistributionChart();
      drawMoranScatterPlot();
      // Optional: Redraw on resize if you implement a resize listener
    });

    return {
      moranScatterPlotContainer,
      pValueChartContainer
    };
  }
}
</script> 