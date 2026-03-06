import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Heading from "./UI/Heading";
import PLotVDA from "./UI/PlotVDA";
import LastUpdated from "./UI/LastUpdated";
import PlotECG from "./UI/PlotECG";
export default function Section3({ DISPLAY_MODE, selectedVital, onVitalChange, vdaMetrics, lastUpdated }) {
  const vitals = ["HR", "SPO2", "RR", "SBP", "DBP", "ECG"];
  const currentIndex = Math.max(0, vitals.indexOf(selectedVital));
  const reference_vitals = {
    HR: {
      "Medical Regulatory Standard": "ISO 80601-2-61:2017",
      "RMS Error": "< 4%",
    },
    SPO2: {
      "Medical Regulatory Standard": "ISO 80601-2-61:2017",
      "RMS Error": "< 4%",
    },
    RR: {
      "Medical Regulatory Standard": "IEC 60601-2-27",
      "RMS Error": "< 2bpm",
    },
    SBP: {},
    DBP: {},
  };
  return (
    <Box
      id="section3"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        pt: 4,
        mb: DISPLAY_MODE == 2 ? 4 : 2,
        border: 1,
        borderColor: "#b3e5fc",
        background: "linear-gradient(135deg, #ffffff 0%, #e0f7fa 60%, #ffffff 100%)",
        boxShadow: 4,
        borderRadius: 2,
      }}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translate(-50%, -50%)",
          px: 1.5,
          bgcolor: "background.paper",
          borderRadius: 2,
        }}>
        {/* First box: heading */}
        <Heading text="Vitals accuracy" size="h5" type="main" />
      </Box>
      {/* Row 1: single pie chart */}
      <Box
        sx={{
          display: "flex",
          //  display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: 1,
          borderColor: "#b3e5fc",
          borderRadius: 2,
          p: 2,
        }}>
        <Box sx={{ width: "100%", textAlign: "center", alignItems: "center", position: "relative" }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}>
            {/* spacer to keep layout stable; tabs are positioned overlapping the border */}
            <Box sx={{ flex: 1 }} />
          </Box>
          {/* Centered tabs overlapping the border of this inner container */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              px: 1,
              borderRadius: 2,
              zIndex: 3,
              boxShadow: 0,
            }}>
            <Tabs
              value={currentIndex}
              onChange={(_, newIndex) => {
                const val = vitals[newIndex] ?? vitals[0];
                onVitalChange({ target: { value: val } });
              }}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Vitals Tabs">
              {vitals.map((vital) => (
                <Tab key={vital} label={vital} />
              ))}
            </Tabs>
          </Box>
          {/* <Box sx={{ height: 20 }} /> */}
          <Box
            id="VDA"
            sx={{
              width: "100%",
              overflow: "hidden",
              mt: "2rem",
            }}>
            <Box
              sx={{
                display: "flex",
                width: `${vitals.length * 100}%`,
                transform: `translateX(-${currentIndex * (100 / vitals.length)}%)`,
                transition: "transform 350ms ease",
              }}>
              <Box sx={{ flex: `0 0 ${100 / vitals.length}%`, minWidth: 0 }}>
                <PLotVDA id={"VDAHR"} table_data={reference_vitals.HR} data={vdaMetrics?.HR} isVisible={selectedVital === "HR"} />
              </Box>
              <Box sx={{ flex: `0 0 ${100 / vitals.length}%`, minWidth: 0 }}>
                <PLotVDA id={"VDASPO2"} table_data={reference_vitals.SPO2} data={vdaMetrics?.SPO2} isVisible={selectedVital === "SPO2"} />
              </Box>
              <Box sx={{ flex: `0 0 ${100 / vitals.length}%`, minWidth: 0 }}>
                <PLotVDA id={"VDARR"} table_data={reference_vitals.RR} data={vdaMetrics?.RR} isVisible={selectedVital === "RR"} />
              </Box>
              <Box sx={{ flex: `0 0 ${100 / vitals.length}%`, minWidth: 0 }}>
                <PLotVDA id={"VDASBP"} table_data={reference_vitals.SBP} data={vdaMetrics?.SBP} isVisible={selectedVital === "SBP"} />
              </Box>
              <Box sx={{ flex: `0 0 ${100 / vitals.length}%`, minWidth: 0 }}>
                <PLotVDA id={"VDADBP"} table_data={reference_vitals.DBP} data={vdaMetrics?.DBP} isVisible={selectedVital === "DBP"} />
              </Box>
              <Box sx={{ flex: `0 0 ${100 / vitals.length}%`, minWidth: 0 }}>
                <PlotECG data={vdaMetrics?.ECG} isVisible={selectedVital === "ECG"} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <LastUpdated lastUpdated={lastUpdated} />
    </Box>
  );
}
