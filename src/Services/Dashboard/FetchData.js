import { database, storage } from "../Firebase/config.js";
import { ref, query, limitToLast, get } from "firebase/database";
import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
import { orderByKey } from "firebase/database";
import * as echarts from "echarts";
import { plotVDPCOT, plotVDPVC, plotVDPHR, plotVDPSPO2, plotVDPRR, plotVDPBP } from "./Echarts/VDP/PlotVDPcharts.js";
import { plotPCDNOP, plotPCDADMF } from "./Echarts/PCD/PlotPCDcharts.js";
import { plotVDA1, plotVDA2, plotVDA3, plotVDA4, plotVDA5 } from "./Echarts/VCA/PlotVDAChart.js";
export default async function FetchDatafromFB(setSelectedVital, setLastUpdated, DISPLAY_MODE) {
  try {
    const path = DISPLAY_MODE === 0 ? "/dash_stats_1" : "/dash_stats";
    const dashStatsQuery = query(ref(database, path), orderByKey(), limitToLast(1));

    const ecgFolderRef = storageRef(storage, "ecg/");
    // eslint-disable-next-line no-unused-vars
    const [snapshot, ecgList] = await Promise.all([
      get(dashStatsQuery),
      // listAll(ecgFolderRef)
    ]);

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
async function computeSection3Data(data, setSelectedVital) {
  async function getPdfUrl(path) {
    if (!path) return null;

    const cleanPath = path.trim();

    // console.log("🔍 Checking file:", JSON.stringify(cleanPath));

    try {
      const fileRef = storageRef(storage, cleanPath);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (e) {
      if (e.code === "storage/object-not-found") {
        console.log("❌ File DOES NOT exist:", cleanPath);
        return null;
      }

      console.error("🔥 Unexpected error:", e);
      return null;
    }
  }
  try {
    // Plot table data for selected vital
    const VDA_HR = {
      Mean: data?.acc_metrics?.hr?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.hr?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.hr?.table?.ci,
      "P value": data?.acc_metrics?.hr?.table?.pv,
    };
    const VDA_SPO2 = {
      Mean: data?.acc_metrics?.spo2?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.spo2?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.spo2?.table?.ci,
      "P value": data?.acc_metrics?.spo2?.table?.pv,
    };
    const VDA_RR = {
      Mean: data?.acc_metrics?.rr?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.rr?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.rr?.table?.ci,
      "P value": data?.acc_metrics?.rr?.table?.pv,
    };
    const VDA_SBP = {
      Mean: data?.acc_metrics?.sbp?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.sbp?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.sbp?.table?.ci,
      "P value": data?.acc_metrics?.sbp?.table?.pv,
    };
    const VDA_DBP = {
      Mean: data?.acc_metrics?.dbp?.table?.me,
      "Standard deviation σ": data?.acc_metrics?.dbp?.table?.sd,
      "Confidence Interval (for mean error)": data?.acc_metrics?.dbp?.table?.ci,
      "P value": data?.acc_metrics?.dbp?.table?.pv,
    };

    // Build VDA_ECG as { Normal: { uuid1: {...}, uuid2: {...} }, ... } with download URLs
    const VDA_ECG = { Normal: {}, Tachycardia: {}, Bradycardia: {} };
    const rawECG = data?.acc_metrics?.ecglst || {};
    const ecgTypes = Object.keys(rawECG);
    const ecgPromises = [];
    ecgTypes.forEach((type) => {
      const uuidData = rawECG[type] || {};
      const typeText = type === "nrml" ? "Normal" : type === "tcrda" ? "Tachycardia" : type === "brda" ? "Bradycardia" : null;
      if (!typeText) return;
      Object.keys(uuidData).forEach((uuid) => {
        ecgPromises.push(
          (async () => {
            const svsPath = uuidData[uuid].svs; // Already includes .pdf
            const icuPath = uuidData[uuid].icu; // Already includes .pdf
            console.log("Fetching PDF URLs for", uuid, "SVS:", svsPath, "ICU:", icuPath);
            const [svsUrl, icuUrl] = await Promise.all([getPdfUrl(svsPath), getPdfUrl(icuPath)]);
            VDA_ECG[typeText][uuid] = {
              svs_pdfURL: svsUrl,
              icu_pdfURL: icuUrl,
            };
          })(),
        );
      });
    });
    await Promise.all(ecgPromises);

    setSelectedVital({
      HR: VDA_HR,
      SPO2: VDA_SPO2,
      RR: VDA_RR,
      SBP: VDA_SBP,
      DBP: VDA_DBP,
      ECG: VDA_ECG,
    });
    // Plot charts

    // HR
    const vda_chart_hr1 = document.getElementById("VDAHR1");
    const vda_chart_hr2 = document.getElementById("VDAHR2");
    const vda_chart_hr3 = document.getElementById("VDAHR3");
    const vda_chart_hr4 = document.getElementById("VDAHR4");
    const vda_chart_hr5 = document.getElementById("VDAHR5");
    plotVDA1(vda_chart_hr1, data?.acc_metrics?.hr?.plots?.ba, VDA_HR, "heart Rate in bpm", "Error");
    plotVDA2(vda_chart_hr2, data?.acc_metrics?.hr?.plots?.corr, "Measured Heart Rate", "Reference Heart Rate");
    plotVDA3(vda_chart_hr3, data?.acc_metrics?.hr?.plots?.ed, "", "Heart Rate in bpm");
    plotVDA4(vda_chart_hr4, data?.acc_metrics?.hr?.plots?.eh, "Error in bpm", "Samples");
    plotVDA5(vda_chart_hr5, data?.acc_metrics?.hr?.plots?.bwp, "Error in bpm", "Samples");

    // SPO2
    const vda_chart_spo21 = document.getElementById("VDASPO21");
    const vda_chart_spo22 = document.getElementById("VDASPO22");
    const vda_chart_spo23 = document.getElementById("VDASPO23");
    const vda_chart_spo24 = document.getElementById("VDASPO24");
    const vda_chart_spo25 = document.getElementById("VDASPO25");
    plotVDA1(vda_chart_spo21, data?.acc_metrics?.spo2?.plots?.ba, VDA_SPO2, "SPO2 in %", "Error");
    plotVDA2(vda_chart_spo22, data?.acc_metrics?.spo2?.plots?.corr, "Measured SPO2", "Reference SPO2");
    plotVDA3(vda_chart_spo23, data?.acc_metrics?.spo2?.plots?.ed, "", "SPO2");
    plotVDA4(vda_chart_spo24, data?.acc_metrics?.spo2?.plots?.eh, "Error in %", "Samples");
    plotVDA5(vda_chart_spo25, data?.acc_metrics?.spo2?.plots?.bwp, "Error in %", "Samples");

    // RR
    const vda_chart_rr1 = document.getElementById("VDARR1");
    const vda_chart_rr2 = document.getElementById("VDARR2");
    const vda_chart_rr3 = document.getElementById("VDARR3");
    const vda_chart_rr4 = document.getElementById("VDARR4");
    const vda_chart_rr5 = document.getElementById("VDARR5");
    plotVDA1(vda_chart_rr1, data?.acc_metrics?.rr?.plots?.ba, VDA_RR, "Respiratory Rate in bpm", "Error");
    plotVDA2(vda_chart_rr2, data?.acc_metrics?.rr?.plots?.corr, "Measured Respiratory Rate", "Reference Respiratory Rate");
    plotVDA3(vda_chart_rr3, data?.acc_metrics?.rr?.plots?.ed, "", "Respiratory Rate in bpm");
    plotVDA4(vda_chart_rr4, data?.acc_metrics?.rr?.plots?.eh, "Error in bpm", "Samples");
    plotVDA5(vda_chart_rr5, data?.acc_metrics?.rr?.plots?.bwp, "Error in bpm", "Samples");

    // SBP
    const vda_chart_sbp1 = document.getElementById("VDASBP1");
    const vda_chart_sbp2 = document.getElementById("VDASBP2");
    const vda_chart_sbp3 = document.getElementById("VDASBP3");
    const vda_chart_sbp4 = document.getElementById("VDASBP4");
    const vda_chart_sbp5 = document.getElementById("VDASBP5");
    plotVDA1(vda_chart_sbp1, data?.acc_metrics?.sbp?.plots?.ba, VDA_SBP, "Refrence SBP", "Error in mmHg");
    plotVDA2(vda_chart_sbp2, data?.acc_metrics?.sbp?.plots?.corr, "Measured SBP", "Reference SBP");
    plotVDA3(vda_chart_sbp3, data?.acc_metrics?.sbp?.plots?.ed, "", "SBP in mmHg");
    plotVDA4(vda_chart_sbp4, data?.acc_metrics?.sbp?.plots?.eh, "Error in mmHg", "Samples");
    plotVDA5(vda_chart_sbp5, data?.acc_metrics?.sbp?.plots?.bwp, "Error in mmHg", "Samples");

    // DBP
    const vda_chart_dbp1 = document.getElementById("VDADBP1");
    const vda_chart_dbp2 = document.getElementById("VDADBP2");
    const vda_chart_dbp3 = document.getElementById("VDADBP3");
    const vda_chart_dbp4 = document.getElementById("VDADBP4");
    const vda_chart_dbp5 = document.getElementById("VDADBP5");
    plotVDA1(vda_chart_dbp1, data?.acc_metrics?.dbp?.plots?.ba, VDA_DBP, "Reference DBP", "Error in mmHg");
    plotVDA2(vda_chart_dbp2, data?.acc_metrics?.dbp?.plots?.corr, "Measured DBP", "Reference DBP");
    plotVDA3(vda_chart_dbp3, data?.acc_metrics?.dbp?.plots?.ed, "", "DBP in mmHg");
    plotVDA4(vda_chart_dbp4, data?.acc_metrics?.dbp?.plots?.eh, "Error in mmHg", "Samples");
    plotVDA5(vda_chart_dbp5, data?.acc_metrics?.dbp?.plots?.bwp, "Error in mmHg", "Samples");
  } catch (error) {
    console.error("Error in computeSection3Data:", error);
  }
}
