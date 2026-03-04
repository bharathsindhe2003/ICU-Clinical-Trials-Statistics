import * as echarts from "echarts";

// Bland-Altman Plot
// data: { pts: [{ x: avg_val, y: diff_val }, ...] }
function plotVDA1(plot, data, otherValues, xAxisLabel, yAxisLabel) {
  try {
    //   if (!plot || !data || !Array.isArray(data.pts) || data.pts.length === 0) return;
    const points = data.pts
      .filter((p) => p != null && p.x != null && p.y != null)
      .flatMap((p) => {
        const x = Number(p.x);
        if (!Number.isFinite(x)) return [];

        const yValues = String(p.y)
          .split(",")
          .map((v) => Number(v.trim()))
          .filter(Number.isFinite); // keeps +ve, -ve, ignores junk

        return yValues.map((y) => [x, y]);
      });

    if (points.length === 0) return;

    // const yValues = points.map((p) => p[1]);
    const xValues = points.map((p) => p[0]);

    // const n = yValues.length;
    const mean = otherValues["Mean"];
    // const sd = otherValues["Standard deviation σ"];

    const lowerLimit = data.clf.lloa;
    const upperLimit = data.clf.uloa;
    // console.log("UPPER LOWER", upperLimit, lowerLimit);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    // console.log("MIN MAX", minX, maxX);

    const chart = echarts.getInstanceByDom(plot) || echarts.init(plot, null, { renderer: "canvas" });

    const option = {
      // title: {
      //   text: "",
      //   left: "center",
      // },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        formatter(params) {
          if (!params || !params.length) return "";

          const lines = [];

          // Group all scatter points (multiple y-values for same x) into one line
          const scatterPoints = params.filter((p) => p && p.seriesType === "scatter" && p.value);

          if (scatterPoints.length) {
            const avg = scatterPoints[0].value[0];
            const diffs = scatterPoints.map((p) => p.value[1]).join(", ");
            lines.push(`Average: ${avg},<br/>Difference: ${diffs}`);
          }

          // Lines (mean and limits)
          params
            .filter((p) => p && p.seriesType === "line" && p.value != null)
            .forEach((p) => {
              const yVal = Array.isArray(p.value) ? p.value[1] : p.value;
              lines.push(`<b>${p.seriesName}</b>: ${yVal}`);
            });

          return lines.join("<br/>");
        },
      },
      grid: {
        top: "15%",
        left: "4%",
        right: "7%",
        bottom: "19%",
        containLabel: true,
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: 0,
        },
        {
          type: "slider",
          xAxisIndex: 0,
        },
        {
          type: "inside",
          yAxisIndex: 0,
        },
        {
          type: "slider",
          yAxisIndex: 0,
        },
      ],
      xAxis: {
        type: "value",
        name: xAxisLabel,
        nameLocation: "middle",
        nameGap: 30,
        min: minX,
        max: maxX,
        axisLine: {
          onZero: false,
        },
      },
      yAxis: {
        type: "value",
        name: yAxisLabel,
        nameLocation: "middle",
        nameGap: 40,
      },
      series: [
        {
          name: "Data",
          type: "scatter",
          symbolSize: 6,
          data: points,
          itemStyle: {
            color: "#1e88e5",
          },
        },
        {
          name: "Mean Difference",
          type: "line",
          data: [
            [minX, mean],
            [maxX, mean],
          ],
          showSymbol: false,
          lineStyle: {
            type: "solid",
            color: "#26a69a",
          },
        },
        {
          name: "+1.96 SD",
          type: "line",
          data: [
            [minX, upperLimit],
            [maxX, upperLimit],
          ],
          showSymbol: false,
          lineStyle: {
            type: "dashed",
            color: "#ef5350",
          },
        },
        {
          name: "-1.96 SD",
          type: "line",
          data: [
            [minX, lowerLimit],
            [maxX, lowerLimit],
          ],
          showSymbol: false,
          lineStyle: {
            type: "dashed",
            color: "#ef5350",
          },
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDA1:", error);
  }
}

// Correlation Plot
// data: { pts: [{ x: ref_val, y: meas_val }, ...] }
function plotVDA2(plot, data, xAxisLabel, yAxisLabel) {
  try {
    //   if (!plot || !data || !Array.isArray(data.pts) || data.pts.length === 0) return;

    const points = data.pts
      .filter((p) => p != null && p.x != null && p.y != null)
      .flatMap((p) => {
        const x = Number(p.x);
        if (!Number.isFinite(x)) return [];

        const yValues = String(p.y)
          .split(",")
          .map((v) => Number(v.trim()))
          .filter(Number.isFinite); // keeps +ve, -ve, ignores junk

        return yValues.map((y) => [x, y]);
      });

    if (points.length === 0) return;
    const allVals = [...points.map((p) => p[0]), ...points.map((p) => p[1])];
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);

    const chart = echarts.getInstanceByDom(plot) || echarts.init(plot, null, { renderer: "canvas" });

    const option = {
      // title: {
      //   text: "Correlation Plot",
      //   left: "center",
      // },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        formatter(params) {
          if (!params || !params.length) return "";

          const lines = [];

          // Group all scatter points (multiple y-values for same x) into one line
          const scatterPoints = params.filter((p) => p && p.seriesType === "scatter" && p.value);

          if (scatterPoints.length) {
            const ms = scatterPoints[0].value[0];
            const reg = scatterPoints.map((p) => p.value[1]).join(", ");
            lines.push(`Measure: ${ms},<br/>Reference: ${reg}`);
          }

          return lines.join("<br/>");
        },
      },
      grid: {
        top: "15%",
        left: "4%",
        right: "7%",
        bottom: "19%",
        containLabel: true,
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: 0,
        },
        {
          type: "slider",
          xAxisIndex: 0,
        },
        {
          type: "inside",
          yAxisIndex: 0,
        },
        {
          type: "slider",
          yAxisIndex: 0,
        },
      ],
      xAxis: {
        type: "value",
        name: xAxisLabel,
        nameLocation: "middle",
        nameGap: 30,
        min: minVal,
        max: maxVal,
      },
      yAxis: {
        type: "value",
        name: yAxisLabel,
        nameLocation: "middle",
        nameGap: 40,
        min: minVal,
        max: maxVal,
      },
      series: [
        {
          name: "Data",
          type: "scatter",
          symbolSize: 6,
          data: points,
          itemStyle: {
            color: "#1e88e5",
          },
        },
        {
          name: "Identity Line",
          type: "line",
          data: [
            [minVal, minVal],
            [maxVal, maxVal],
          ],
          showSymbol: false,
          lineStyle: {
            type: "dashed",
            color: "#91CC75",
          },
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDA2:", error);
  }
}

// Error Distribution (e.g. smoothed curve over error categories)
// data: { bins: [...], vals: [...] }
function plotVDA3(plot, data, xAxisLabel, yAxisLabel) {
  try {
    // Validate input
    if (!plot || !data || !Array.isArray(data.bins) || !Array.isArray(data.vals)) return;

    const bins = data.bins;
    // Each entry in vals is expected to be { me: "", sd: "" } or similar
    // Map each bin to its corresponding value (me) and error (sd)
    // If value > 0, bar to right; if < 0, bar to left
    // Show category labels on y-axis
    if (bins.length === 0 || data.vals.length === 0) return;

    // Prepare bar data for 'me' (blue) and 'sd' (orange)
    const meData = data.vals.map((v) => {
      if (typeof v === "object" && v !== null) {
        return Number(v.me) || 0;
      } else {
        return Number(v) || 0;
      }
    });
    const sdData = data.vals.map((v) => {
      if (typeof v === "object" && v !== null) {
        return Number(v.sd) || 0;
      } else {
        return 0;
      }
    });

    const chart = echarts.getInstanceByDom(plot) || echarts.init(plot, null, { renderer: "canvas" });

    const option = {
      tooltip: {
        trigger: "axis",
        textAlign: "left",
        extraCssText: "text-align:left;",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          // params is an array of series data
          const idx = params[0].dataIndex;
          const bin = bins[idx];
          const v = data.vals[idx];
          let me = v.me ? v.me : "-";
          let sd = v.sd ? v.sd : "-";
          let txt = `Category ${bin}`;
          txt += `<br/><span style='color:#1976d2'>Mean</span>: ${me}`;
          txt += `<br/><span style='color:#ff9800'>Standard Deviation</span>: ${sd}`;
          return txt;
        },
      },
      legend: {
        data: ["Mean", "Standard Deviation"],
        top: 10,
        right: 10,
        orient: "horizontal",
      },
      grid: {
        top: 50,
        right: 20,
        left: 60,
        bottom: 30,
      },
      xAxis: {
        type: "value",
        name: xAxisLabel,
        position: "bottom",
        splitLine: {
          lineStyle: {
            type: "dashed",
          },
        },
      },
      yAxis: {
        type: "category",
        name: yAxisLabel,
        axisLine: { show: true },
        axisLabel: { show: true },
        axisTick: { show: true },
        splitLine: { show: false },
        data: bins,
      },
      series: [
        {
          name: "Mean",
          type: "bar",
          // label: {
          //   show: true,
          //   position: "right",
          //   color: "#1976d2",
          //   formatter: function (params) {
          //     const v = data.vals[params.dataIndex];
          //     return v && typeof v === "object" ? v.me : v;
          //   },
          // },
          data: meData,
          itemStyle: {
            color: "#1976d2",
          },
        },
        {
          name: "Standard Deviation",
          type: "bar",
          // label: {
          //   show: true,
          //   position: "right",
          //   color: "#ff9800",
          //   formatter: function (params) {
          //     const v = data.vals[params.dataIndex];
          //     return v && typeof v === "object" ? v.sd : "";
          //   },
          // },
          data: sdData,
          itemStyle: {
            color: "#ff9800",
          },
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDA3:", error);
  }
}

// Error Histogram (bar chart over error bins)
// data: { bins: [...], vals: [...] }
function plotVDA4(plot, data, xAxisLabel, yAxisLabel) {
  try {
    //   if (!plot || !data || !Array.isArray(data.bins) || !Array.isArray(data.vals)) return;

    const bins = data.bins;
    const vals = data.vals.map((v) => Number(v) || 0);

    if (bins.length === 0 || vals.length === 0) return;

    const chart = echarts.getInstanceByDom(plot) || echarts.init(plot, null, { renderer: "canvas" });

    const option = {
      // title: {
      //   text: "Error Histogram",
      //   left: "center",
      // },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        top: "15%",
        left: "5%",
        right: "3%",
        bottom: "10%",
        // containLabel: true,
      },
      xAxis: {
        type: "category",
        name: xAxisLabel,
        nameLocation: "middle",
        data: bins,
        // axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: "value",
        name: yAxisLabel,
        nameLocation: "middle",
        nameGap: 40,
        min: 0,
      },
      series: [
        {
          name: yAxisLabel,
          type: "bar",
          data: vals,
          itemStyle: {
            color: "#ef5350",
          },
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDA4:", error);
  }
}

function plotVDA5(plot, data, xAxisLabel, yAxisLabel) {
  try {
    // if (!plot || !data || !data.categoryLabels || !data.svsBoxData || !data.icuBoxData || !data.svsIcuBoxData) return;
    const categoryLabels = data.categoryLabels || {};

    const svsBoxData = data.svsBoxData || [];
    const icuBoxData = data.icuBoxData || [];
    const svsIcuBoxData = data.svsIcuBoxData || [];

    const chart = echarts.getInstanceByDom(plot) || echarts.init(plot, null, { renderer: "canvas" });

    const option = {
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "shadow",
        },
        formatter(params) {
          if (!params || !params.data || !Array.isArray(params.data)) return "";

          const values = params.data;
          const category = params.name;

          const lines = [];
          lines.push(`<b>${params.seriesName}</b>`);
          if (category != null) {
            lines.push(`Category: ${category}`);
          }
          lines.push(`Minimum: ${values[0]}`);
          lines.push(`First quartile (Q1): ${values[1]}`);
          lines.push(`Median: ${values[2]}`);
          lines.push(`Third quartile (Q3): ${values[3]}`);
          lines.push(`Maximum: ${values[4]}`);

          return lines.join("<br/>");
        },
      },
      legend: {
        data: ["SVS", "ICU", "SVS+ICU"],
        top: 10,
        right: 10,
      },
      grid: {
        top: "15%",
        left: "8%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: yAxisLabel,
        nameLocation: "middle",
        nameGap: 30,
      },
      yAxis: {
        type: "category",
        name: xAxisLabel,
        nameLocation: "middle",
        nameGap: 40,
        data: categoryLabels,
        axisTick: { alignWithLabel: true },
      },
      series: [
        {
          name: "SVS",
          type: "boxplot",
          data: svsBoxData,
          itemStyle: {
            color: "#42a5f5",
            borderColor: "#1e88e5",
          },
        },
        {
          name: "ICU",
          type: "boxplot",
          data: icuBoxData,
          itemStyle: {
            color: "#9ccc65",
            borderColor: "#7cb342",
          },
        },
        {
          name: "SVS+ICU",
          type: "boxplot",
          data: svsIcuBoxData,
          itemStyle: {
            color: "#ffb74d",
            borderColor: "#fb8c00",
          },
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDA5:", error);
  }
}

export { plotVDA1, plotVDA2, plotVDA3, plotVDA4, plotVDA5 };
