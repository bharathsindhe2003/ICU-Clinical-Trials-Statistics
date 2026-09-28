import { database } from "../Firebase/config.js";
import { ref, query, limitToLast, get } from "firebase/database";
import { orderByKey } from "firebase/database";
import * as echarts from "echarts";
import { plotVDPCOT, plotVDPVC, plotVDPHR, plotVDPSPO2, plotVDPRR, plotVDPBP } from "./Echarts/VDP/PlotVDPcharts.js";
import { plotPCDNOP, plotPCDADMF } from "./Echarts/PCD/PlotPCDcharts.js";
import { plotVDA1, plotVDA2, plotVDA3, plotVDA4, plotVDA5 } from "./Echarts/VCA/PlotVDAChart.js";

const VITAL_CHART_CONFIG = {
  HR: {
    idPrefix: "VDAHR",
    xAxisLabel1: "heart Rate in bpm",
    yAxisLabel1: "Error",
    xAxisLabel2: "Measured Heart Rate",
    yAxisLabel2: "Reference Heart Rate",
    xAxisLabel3: "",
    yAxisLabel3: "Heart Rate in bpm",
    xAxisLabel4: "Error in bpm",
    yAxisLabel4: "Samples",
    xAxisLabel5: "Error in bpm",
    yAxisLabel5: "Samples",
  },
  SPO2: {
    idPrefix: "VDASPO2",
    xAxisLabel1: "SPO2 in %",
    yAxisLabel1: "Error",
    xAxisLabel2: "Measured SPO2",
    yAxisLabel2: "Reference SPO2",
    xAxisLabel3: "",
    yAxisLabel3: "SPO2",
    xAxisLabel4: "Error in %",
    yAxisLabel4: "Samples",
    xAxisLabel5: "Error in %",
    yAxisLabel5: "Samples",
  },
  RR: {
    idPrefix: "VDARR",
    xAxisLabel1: "Respiratory Rate in bpm",
    yAxisLabel1: "Error",
    xAxisLabel2: "Measured Respiratory Rate",
    yAxisLabel2: "Reference Respiratory Rate",
    xAxisLabel3: "",
    yAxisLabel3: "Respiratory Rate in bpm",
    xAxisLabel4: "Error in bpm",
    yAxisLabel4: "Samples",
    xAxisLabel5: "Error in bpm",
    yAxisLabel5: "Samples",
  },
  SBP: {
    idPrefix: "VDASBP",
    xAxisLabel1: "Refrence SBP",
    yAxisLabel1: "Error in mmHg",
    xAxisLabel2: "Measured SBP",
    yAxisLabel2: "Reference SBP",
    xAxisLabel3: "",
    yAxisLabel3: "SBP in mmHg",
    xAxisLabel4: "Error in mmHg",
    yAxisLabel4: "Samples",
    xAxisLabel5: "Error in mmHg",
    yAxisLabel5: "Samples",
  },
  DBP: {
    idPrefix: "VDADBP",
    xAxisLabel1: "Reference DBP",
    yAxisLabel1: "Error in mmHg",
    xAxisLabel2: "Measured DBP",
    yAxisLabel2: "Reference DBP",
    xAxisLabel3: "",
    yAxisLabel3: "DBP in mmHg",
    xAxisLabel4: "Error in mmHg",
    yAxisLabel4: "Samples",
    xAxisLabel5: "Error in mmHg",
    yAxisLabel5: "Samples",
  },
};
export default async function FetchDatafromFB(setSelectedVital, setLastUpdated, DISPLAY_MODE) {
  try {
    const path = DISPLAY_MODE === 0 ? "/dash_stats_1" : "/dash_stats";
    const dashStatsQuery = query(ref(database, path), orderByKey(), limitToLast(1));

    const snapshot = await get(dashStatsQuery);

    const snapshotVal = snapshot.val();
    const maxKey = Object.keys(snapshotVal)[0]; // since we limited to last 1, this is the only key
    const data = snapshotVal[maxKey];

    // Firebase key looks like a Unix timestamp in seconds (e.g., 1769587560)
    const tsSeconds = Number(maxKey);
    let formatted = String(maxKey);

    if (!Number.isNaN(tsSeconds)) {
      const dateTime = new Date(tsSeconds * 1000); // convert seconds to ms
      const pad = (n) => String(n).padStart(2, "0");
      const day = pad(dateTime.getDate());
      const month = pad(dateTime.getMonth() + 1);
      const year = String(dateTime.getFullYear()).slice(-2);
      const hours = pad(dateTime.getHours());
      const minutes = pad(dateTime.getMinutes());
      formatted = `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    setLastUpdated(formatted);
    computeSection1Data(data);
    computeSection2Data(data);
    computeSection3Data(data, setSelectedVital);

    // Ensure charts stay responsive on window resize
    setupChartsResizeListener();

    return data;
  } catch (error) {
    console.error("Error fetching data from Firebase:", error);
    return;
  }
}

function setupChartsResizeListener() {
  // Attach only once per page load
  if (window.__echartsResizeListenerAttached) return;
  window.__echartsResizeListenerAttached = true;

  const handleResize = () => {
    const containers = document.querySelectorAll(".echart-container");
    containers.forEach((el) => {
      const chart = echarts.getInstanceByDom(el);
      if (chart) {
        chart.resize();
      }
    });
  };

  window.addEventListener("resize", handleResize);
  // Trigger once so charts fit initial layout after render
  handleResize();
}

function computeSection1Data(data) {
  try {
    const tgt = data?.ovr?.tgt ?? 2000; // target value (defaults to 2000)
    const min_c = data?.ovr?.min_c; // min completion value for least-complete vital
    const time_dist = data?.ovr?.time_dist; // time distribution data perweek
    const main_pie = document.getElementById("VDPCOT");
    plotVDPCOT(main_pie, { tgt, min_c });

    const main_bar = document.getElementById("VDPVC");
    plotVDPVC(main_bar, { time_dist });

    const data_hr = {
      Normal: data?.v_cats?.hr?.norm, // count of normal heart rate readings
      Bradycardia: data?.v_cats?.hr?.brady, // count of bradycardia readings
      Tachycardia: data?.v_cats?.hr?.tachy, // count of tachycardia readings
      Total: data?.v_cats?.hr?.tot, // total heart rate readings
    };
    const small_pie_hr = document.getElementById("VDPHR");
    plotVDPHR(small_pie_hr, data_hr);

    const data_spo2 = {
      Normal: data?.v_cats?.spo2?.norm, // count of normal SpO2 readings
      Low: data?.v_cats?.spo2?.low, // count of low SpO2 readings
      Total: data?.v_cats?.spo2?.tot, // total SpO2 readings
    };
    const small_pie_spo2 = document.getElementById("VDPSPO2");
    plotVDPSPO2(small_pie_spo2, data_spo2);

    const data_rr = {
      Eupnea: data?.v_cats?.rr?.eup, // count of normal respiratory rate readings
      Bradypnea: data?.v_cats?.rr?.brady, // count of bradypnea readings
      Tachypnea: data?.v_cats?.rr?.tachy, // count of tachypnea readings
      Total: data?.v_cats?.rr?.tot, // total respiratory rate readings
    };
    const small_pie_rr = document.getElementById("VDPRR");
    plotVDPRR(small_pie_rr, data_rr);

    const data_bp = {
      "Lower than normal": data?.v_cats?.bp?.low, // count of low blood pressure readings
      Normal: data?.v_cats?.bp?.norm, // count of normal blood pressure readings
      Elevated: data?.v_cats?.bp?.elv, // count of elevated blood pressure readings
      "High (1)": data?.v_cats?.bp?.h1, // count of high stage 1 blood pressure readings
      "High (2)": data?.v_cats?.bp?.h2, // count of high stage 2 blood pressure readings
      Total: data?.v_cats?.bp?.tot, // total blood pressure readings
    };
    const small_pie_bp = document.getElementById("VDPBP");
    plotVDPBP(small_pie_bp, data_bp);
  } catch (error) {
    console.error("Error in computeSection1Data:", error);
  }
}
function computeSection2Data(data) {
  try {
    // Placeholder for Section 2 data computation logic
    const data_nop = {
      Male: data?.cohort?.m_count,
      Female: data?.cohort?.f_count,
      Total: data?.cohort?.m_count + data?.cohort?.f_count,
    };
    const main_pie = document.getElementById("PCDNOP");
    plotPCDNOP(main_pie, data_nop);

    const data_adm = {
      "< 40 ages": data?.cohort?.age_dist?.m?.g1, // count of males under 40
      "40-49 ages": data?.cohort?.age_dist?.m?.g2, //  count of males 40-49
      "50-59 ages": data?.cohort?.age_dist?.m?.g3, // count of males 50-59
      "60-69 ages": data?.cohort?.age_dist?.m?.g4, // count of males 60-69
      "70-79 ages": data?.cohort?.age_dist?.m?.g5, // count of males 70-79
      "> 79 ages": data?.cohort?.age_dist?.m?.g6, // count of males over 79
    };
    const data_adf = {
      "< 40 ages": data?.cohort?.age_dist?.f?.g1, // count of females under 40
      "40-49 ages": data?.cohort?.age_dist?.f?.g2, // count of females 40-49
      "50-59 ages": data?.cohort?.age_dist?.f?.g3, // count of females 50-59
      "60-69 ages": data?.cohort?.age_dist?.f?.g4, // count of females 60-69
      "70-79 ages": data?.cohort?.age_dist?.f?.g5, // count of females 70-79
      "> 79 ages": data?.cohort?.age_dist?.f?.g6, // count of females over 79
    };
    const main_bar = document.getElementById("PCDADMF");
    plotPCDADMF(main_bar, data_adm, data_adf);
  } catch (error) {
    console.error("Error in computeSection2Data:", error);
  }
}
export function renderSection3Charts(selectedVital, vdaMetrics) {
  if (!selectedVital || selectedVital === "ECG" || !vdaMetrics?.[selectedVital]?.plots) return;

  const config = VITAL_CHART_CONFIG[selectedVital];
  const metric = vdaMetrics[selectedVital];
  if (!config || !metric) return;

  const chart1 = document.getElementById(`${config.idPrefix}1`);
  const chart2 = document.getElementById(`${config.idPrefix}2`);
  const chart3 = document.getElementById(`${config.idPrefix}3`);
  const chart4 = document.getElementById(`${config.idPrefix}4`);
  const chart5 = document.getElementById(`${config.idPrefix}5`);

  plotVDA1(chart1, metric.plots?.ba, metric.table, config.xAxisLabel1, config.yAxisLabel1);
  plotVDA2(chart2, metric.plots?.corr, config.xAxisLabel2, config.yAxisLabel2);
  plotVDA3(chart3, metric.plots?.ed, config.xAxisLabel3, config.yAxisLabel3);
  plotVDA4(chart4, metric.plots?.eh, config.xAxisLabel4, config.yAxisLabel4);
  plotVDA5(chart5, metric.plots?.bwp, config.xAxisLabel5);
}

async function computeSection3Data(data, setSelectedVital) {
  try {
    // Plot table data for selected vital
    const VDA_HR = {
      Mean: data?.acc_metrics?.hr?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.hr?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.hr?.table?.ci,
      "P value": data?.acc_metrics?.hr?.table?.pv,
      "RMS Error": data?.acc_metrics?.hr?.table?.rms,
      "Proportion of samples within ±4 BPM": data?.acc_metrics?.hr?.table?.prop,
    };
    const VDA_SPO2 = {
      Mean: data?.acc_metrics?.spo2?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.spo2?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.spo2?.table?.ci,
      "P value": data?.acc_metrics?.spo2?.table?.pv,
      "RMS Error": data?.acc_metrics?.spo2?.table?.rms,
      "Proportion of samples within ±4 %": data?.acc_metrics?.spo2?.table?.prop,
    };
    const VDA_RR = {
      Mean: data?.acc_metrics?.rr?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.rr?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.rr?.table?.ci,
      "P value": data?.acc_metrics?.rr?.table?.pv,
      "RMS Error": data?.acc_metrics?.rr?.table?.rms,
      "Proportion of samples within ±2 BPM ": data?.acc_metrics?.rr?.table?.prop,
    };
    const VDA_SBP = {
      Mean: data?.acc_metrics?.sbp?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.sbp?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.sbp?.table?.ci,
      "P value": data?.acc_metrics?.sbp?.table?.pv,
      "RMS Error": data?.acc_metrics?.sbp?.table?.rms,
      "Proportion of samples within ±8 mmHg": data?.acc_metrics?.sbp?.table?.prop,
    };
    const VDA_DBP = {
      Mean: data?.acc_metrics?.dbp?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.dbp?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.dbp?.table?.ci,
      "P value": data?.acc_metrics?.dbp?.table?.pv,
      "RMS Error": data?.acc_metrics?.dbp?.table?.rms,
      "Proportion of samples within ±8 mmHg": data?.acc_metrics?.dbp?.table?.prop,
    };

    // function normalizeDriveImageUrl(url) {
    //   if (!url || typeof url !== "string") return url;
    //   const trimmed = url.trim();
    //   const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    //   if (fileIdMatch) {
    //     return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    //   }
    //   return trimmed;
    // }

    // Build VDA_ECG as { Normal: { uuid1: {...}, uuid2: {...} }, ... } with download URLs
    const VDA_ECG = { Normal: {}, Tachycardia: {}, Bradycardia: {} };
    const rawECG = data?.acc_metrics?.ecglst || {};
    const ecgTypes = Object.keys(rawECG);
    ecgTypes.forEach((type) => {
      const uuidData = rawECG[type] || {};
      const typeText = type === "nrml" ? "Normal" : type === "tcrda" ? "Tachycardia" : type === "brda" ? "Bradycardia" : null;
      if (!typeText) return;
      Object.keys(uuidData).forEach((uuid) => {
        const svsPath = uuidData[uuid].svs; // Already includes .pdf
        const icuPath = uuidData[uuid].icu; // Already includes .pdf
        //const ecgPath = normalizeDriveImageUrl(uuidData[uuid].ecgm);
        const ecgPath = uuidData[uuid].ecgm;
        // console.log("Fetching PDF URLs for", uuid, "SVS:", svsPath, "ICU:", icuPath, "ECG:", ecgPath);
        VDA_ECG[typeText][uuid] = {
          svs_pdfURL: svsPath,
          icu_pdfURL: icuPath,
          ecg_pdfURL: ecgPath,
        };
      });
    });

    setSelectedVital({
      HR: {
        table: VDA_HR,
        plots: data?.acc_metrics?.hr?.plots,
      },
      SPO2: {
        table: VDA_SPO2,
        plots: data?.acc_metrics?.spo2?.plots,
      },
      RR: {
        table: VDA_RR,
        plots: data?.acc_metrics?.rr?.plots,
      },
      SBP: {
        table: VDA_SBP,
        plots: data?.acc_metrics?.sbp?.plots,
      },
      DBP: {
        table: VDA_DBP,
        plots: data?.acc_metrics?.dbp?.plots,
      },
      ECG: VDA_ECG,
    });
  } catch (error) {
    console.error("Error in computeSection3Data:", error);
  }
}
