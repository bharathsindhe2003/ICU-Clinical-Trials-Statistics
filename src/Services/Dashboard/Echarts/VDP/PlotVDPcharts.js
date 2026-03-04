import * as echarts from "echarts";

function plotVDPCOT(main_pie, { tgt, min_c }) {
  try {
    if (!main_pie) return;

    const target = Number(tgt) || 0;
    const completedRaw = Number(min_c) || 0;
    const completed = target > 0 ? Math.min(completedRaw, target) : completedRaw;
    const remaining = target > 0 ? Math.max(target - completed, 0) : 0;
    const percent = target > 0 ? Math.round((completed / target) * 100) : 0;

    // Palette used to color the completed portion by percent buckets (5% per bucket)
    const RANK_PALETTE = [
      "#C01919",
      "#BC211B",
      "#B9291D",
      "#B5311F",
      "#B23920",
      "#AE4122",
      "#AA4924",
      "#A75126",
      "#A35828",
      "#A0602A",
      "#9C682C",
      "#99702D",
      "#95782F",
      "#918031",
      "#8E8833",
      "#8A9035",
      "#879837",
      "#83A039",
      "#7FA83B",
      "#7CB03C",
      "#78B83E",
      "#75C040",
      "#71C742",
      "#6ECF44",
      "#6AD746",
      "#66DF48",
      "#63E749",
      "#5FEF4B",
      "#5CF74D",
      "#58FF4F",
    ];

    const bucketSize = 5; // percent per bucket
    const colorIndex = Math.min(Math.floor(percent / bucketSize), RANK_PALETTE.length - 1);
    const completedColor = RANK_PALETTE[colorIndex] || "#26a69a";

    const chart = echarts.getInstanceByDom(main_pie) || echarts.init(main_pie, null, { renderer: "canvas" });

    const option = {
      title: {
        text: `${percent}%`,
        subtext: "Completion of Trials",
        left: "center",
        top: "center",
        textStyle: {
          fontSize: 24,
          fontWeight: "bold",
        },
        subtextStyle: {
          fontSize: 12,
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      series: [
        {
          name: "Completion",
          type: "pie",
          radius: ["60%", "85%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: completed,
              name: "Completed",
              itemStyle: { color: completedColor },
            },
            {
              value: remaining,
              name: "Remaining",
              itemStyle: { color: "#e0f2f1" }, // very light teal
            },
          ],
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDPCOT:", error);
  }
}
function plotVDPVC(main_bar, { time_dist }) {
  try {
    if (!main_bar || !time_dist) return;

    const weekKeys = Object.keys(time_dist);

    const weekLabels = weekKeys.map((w, idx) => {
      const entry = time_dist[w];
      if (!entry || !entry.tmsp) return `Week ${idx + 1}`;

      const tmsp = entry.tmsp;

      // Helper to convert UNIX timestamp (seconds) to dd/mm/yyyy
      const formatDate = (ts) => {
        const date = new Date(Number(ts) * 1000); // convert seconds to milliseconds
        const d = String(date.getDate()).padStart(2, "0");

        // Array of month short names
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = months[date.getMonth()]; // get month short name

        return `${d}/${m}`;
      };

      if (typeof tmsp === "string") {
        if (tmsp.includes("-")) {
          const [start, end] = tmsp.split("-").map((t) => t.trim());
          return `${formatDate(start)} - ${formatDate(end)}`;
        } else if (tmsp.includes("<")) {
          return `< ${formatDate(tmsp.replace("<", "").trim())}`;
        } else if (tmsp.includes(">")) {
          return `> ${formatDate(tmsp.replace(">", "").trim())}`;
        } else {
          return formatDate(tmsp);
        }
      }
    });

    const values = weekKeys.map((w) => Number(time_dist[w].cnt) || 0);

    const chart = echarts.getInstanceByDom(main_bar) || echarts.init(main_bar, null, { renderer: "canvas" });

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "1%",
        right: "5%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        name: "Date",
        data: weekLabels,
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: "value",
        name: "Data Points",
        min: 0,
      },
      series: [
        {
          name: "Data Points",
          type: "bar",
          data: values,
          itemStyle: {
            color: "#1e88e5",
          },
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDPVC:", error);
  }
}

function plotVDPHR(small_pie_hr, data_hr) {
  try {
    if (!small_pie_hr || !data_hr) return;

    const normal = Number(data_hr.Normal) || 0;
    const brady = Number(data_hr.Bradycardia) || 0;
    const tachy = Number(data_hr.Tachycardia) || 0;
    const total = Number(data_hr.Total) || 0;
    const chart = echarts.getInstanceByDom(small_pie_hr) || echarts.init(small_pie_hr, null, { renderer: "canvas" });

    const option = {
      title: {
        text: `Total: ${total}`,
        left: "center",
        top: "center",
        textStyle: {
          fontSize: 14,
          fontWeight: "normal",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "bottom",
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 10,
        },
        data: ["Tachycardia (>100)", "Normal (60-100)", "Bradycardia (<60)"],
      },
      series: [
        {
          name: "Heart Rate",
          type: "pie",
          radius: ["60%", "85%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: brady, name: "Bradycardia (<60)", itemStyle: { color: "#90caf9" } },
            { value: normal, name: "Normal (60-100)", itemStyle: { color: "#26a69a" } },
            { value: tachy, name: "Tachycardia (>100)", itemStyle: { color: "#ef5350" } },
          ],
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDPHR:", error);
  }
}
function plotVDPSPO2(small_pie_spo2, data_spo2) {
  try {
    if (!small_pie_spo2 || !data_spo2) return;

    const normal = Number(data_spo2.Normal) || 0;
    const low = Number(data_spo2.Low) || 0;
    const total = Number(data_spo2.Total) || 0;
    const chart = echarts.getInstanceByDom(small_pie_spo2) || echarts.init(small_pie_spo2, null, { renderer: "canvas" });

    const option = {
      title: {
        text: `Total: ${total}`,
        left: "center",
        top: "center",

        textStyle: {
          fontSize: 14,
          fontWeight: "normal",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "bottom",
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 10,
        },
        data: ["Low (<95%)", "Normal (≥95%)"],
      },
      series: [
        {
          name: "SpO₂",
          type: "pie",
          radius: ["60%", "85%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: low, name: "Low (<95%)", itemStyle: { color: "#90caf9" } },
            { value: normal, name: "Normal (≥95%)", itemStyle: { color: "#26a69a" } },
          ],
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDPSPO2:", error);
  }
}
function plotVDPRR(small_pie_rr, data_rr) {
  try {
    if (!small_pie_rr || !data_rr) return;

    const eupnea = Number(data_rr.Eupnea) || 0;
    const brady = Number(data_rr.Bradypnea) || 0;
    const tachy = Number(data_rr.Tachypnea) || 0;
    const total = Number(data_rr.Total) || 0;
    const chart = echarts.getInstanceByDom(small_pie_rr) || echarts.init(small_pie_rr, null, { renderer: "canvas" });

    const option = {
      title: {
        text: `Total: ${total}`,
        left: "center",
        top: "center",

        textStyle: {
          fontSize: 14,
          fontWeight: "normal",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "bottom",
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 10,
        },
        data: ["Tachypnea (>20)", "Eupnea (12-20)", "Bradypnea (<12)"],
      },
      series: [
        {
          name: "Respiration Rate",
          type: "pie",
          radius: ["60%", "85%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: eupnea, name: "Eupnea (12-20)", itemStyle: { color: "#26a69a" } },
            { value: brady, name: "Bradypnea (<12)", itemStyle: { color: "#90caf9" } },
            { value: tachy, name: "Tachypnea (>20)", itemStyle: { color: "#ef5350" } },
          ],
        },
      ],
    };

    chart.setOption(option, true);
  } catch (error) {
    console.error("Error in plotVDPRR:", error);
  }
}
function plotVDPBP(small_pie_bp, data_bp) {
  if (!small_pie_bp || !data_bp) return;

  const low = Number(data_bp["Lower than normal"]) || 0;
  const normal = Number(data_bp.Normal) || 0;
  const elev = Number(data_bp.Elevated) || 0;
  const high1 = Number(data_bp["High (1)"]) || 0;
  const high2 = Number(data_bp["High (2)"]) || 0;
  const Total = Number(data_bp.Total) || 0;
  const chart = echarts.getInstanceByDom(small_pie_bp) || echarts.init(small_pie_bp, null, { renderer: "canvas" });

  const option = {
    title: {
      text: `Total: ${Total}`,
      left: "center",
      top: "center",

      textStyle: {
        fontSize: 14,
        fontWeight: "normal",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "bottom",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 10,
      },
      data: ["High (2)", "High (1)", "Elevated", "Normal", "Lower than normal"],
    },
    series: [
      {
        name: "Blood Pressure",
        type: "pie",
        radius: ["60%", "85%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: low, name: "Lower than normal", itemStyle: { color: "#90caf9" } },
          { value: normal, name: "Normal", itemStyle: { color: "#26a69a" } },
          { value: elev, name: "Elevated", itemStyle: { color: "#ffb74d" } },
          { value: high1, name: "High (1)", itemStyle: { color: "#ef5350" } },
          { value: high2, name: "High (2)", itemStyle: { color: "#c62828" } },
        ],
      },
    ],
  };

  chart.setOption(option, true);
}
export { plotVDPCOT, plotVDPVC, plotVDPHR, plotVDPSPO2, plotVDPRR, plotVDPBP };
