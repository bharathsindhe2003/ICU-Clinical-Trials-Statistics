import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { useMemo, useState } from "react";

const CROP_PRESETS = {
  fit: { label: "Fit", scale: 1, x: 0, y: 0 },
  center: { label: "Center crop", scale: 1.2, x: 0, y: 0 },
  top: { label: "Top crop", scale: 1.35, x: 0, y: 14 },
  bottom: { label: "Bottom crop", scale: 1.35, x: 0, y: -14 },
  left: { label: "Left crop", scale: 1.25, x: 10, y: 0 },
  right: { label: "Right crop", scale: 1.25, x: -10, y: 0 },
};

function clampZoom(value) {
  return Math.min(2.5, Math.max(0.8, value));
}

const VIEWPORT_HEIGHT = { xs: 320, sm: 380, md: 460 };

function PDFViewport({ title, url, type }) {
  const defaultCropMode = "fit";
  const defaultZoom = type === 1 ? 2 : 1;
  const defaultRotation = type === 2 ? -90 : 0;
  const [loading, setLoading] = useState(Boolean(url));
  const [zoom, setZoom] = useState(defaultZoom);
  const [rotation, setRotation] = useState(defaultRotation);
  const [cropMode, setCropMode] = useState(defaultCropMode);

  const cropPreset = CROP_PRESETS[cropMode] ?? CROP_PRESETS.fit;
  const effectiveScale = clampZoom(zoom * cropPreset.scale);
  const transform = useMemo(() => `translate(${cropPreset.x}%, ${cropPreset.y}%) scale(${effectiveScale}) rotate(${rotation}deg)`, [cropPreset.x, cropPreset.y, effectiveScale, rotation]);

  if (!url) {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 360,
          borderRadius: 3,
          border: "1px dashed #b3e5fc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f7fbfd",
        }}>
        <Typography variant="body2" color="text.secondary">
          PDF not available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        borderRadius: 3,
        border: "1px solid #d3edf7",
        bgcolor: "#f8fcfe",
        overflow: "hidden",
      }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1}
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: "1px solid #d3edf7",
          bgcolor: "#eef8fc",
          alignItems: { xs: "stretch", lg: "center" },
          justifyContent: "space-between",
        }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Tooltip title="Zoom out">
            <span>
              <IconButton size="small" onClick={() => setZoom((current) => clampZoom(current - 0.1))}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant="caption" sx={{ minWidth: 44, textAlign: "center" }}>
            {Math.round(effectiveScale * 100)}%
          </Typography>
          <Tooltip title="Zoom in">
            <span>
              <IconButton size="small" onClick={() => setZoom((current) => clampZoom(current + 0.1))}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />
          <Tooltip title="Rotate left">
            <span>
              <IconButton size="small" onClick={() => setRotation((current) => current - 90)}>
                <RotateLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rotate right">
            <span>
              <IconButton size="small" onClick={() => setRotation((current) => current + 90)}>
                <RotateRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {type !== 1 && (
            <Select size="small" value={cropMode} onChange={(event) => setCropMode(event.target.value)} sx={{ minWidth: 132, bgcolor: "#fff", height: 34 }}>
              {Object.entries(CROP_PRESETS).map(([value, preset]) => (
                <MenuItem key={value} value={value}>
                  {preset.label}
                </MenuItem>
              ))}
            </Select>
          )}
          <Tooltip title="Reset view">
            <span>
              <IconButton
                size="small"
                onClick={() => {
                  setZoom(1);
                  setRotation(defaultRotation);
                  setCropMode(defaultCropMode);
                }}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Button size="small" endIcon={<OpenInNewIcon fontSize="small" />} href={url} target="_blank" rel="noreferrer noopener">
            Open
          </Button>
        </Stack>
      </Stack>
      <Box
        sx={{
          position: "relative",
          height: VIEWPORT_HEIGHT,
          overflow: "hidden",
          bgcolor: "#dfeef6",
        }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "rgba(248, 252, 254, 0.7)",
            }}>
            <CircularProgress />
          </Box>
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}>
          <iframe
            src={url}
            style={{
              border: 0,
              width: "100%",
              height: "100%",
              transform,
              transformOrigin: type === 1 ? "center bottom" : "center center",
              visibility: loading ? "hidden" : "visible",
              transition: "transform 220ms ease",
              overflow: "auto",
            }}
            title={`${title}-pdf`}
            onLoad={() => setLoading(false)}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function ECG({ pdfData, isVisible }) {
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [page, setPage] = useState(0);
  const uuids = useMemo(() => Object.keys(pdfData ?? {}), [pdfData]);
  const PAGE_SIZE = 6;
  const maxPage = Math.ceil(uuids.length / PAGE_SIZE) - 1;
  const safePage = Math.min(page, Math.max(maxPage, 0));
  const visibleUuids = useMemo(() => uuids.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE), [safePage, uuids]);
  const firstUuid = uuids[0] ?? null;
  const firstVisibleUuid = visibleUuids[0] ?? firstUuid;
  const activeUuid = selectedUuid && pdfData?.[selectedUuid] ? selectedUuid : firstVisibleUuid;

  if (!isVisible) return <></>;

  if (!pdfData || uuids.length === 0) {
    return <Box>No Data</Box>;
  }

  return (
    <Box sx={{ width: "100%", overflowY: "hidden", overflowX: "auto", overscrollBehavior: "contain" }}>
      {/* Navigation and preview row */}
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, mb: 3, justifyContent: "center" }}>
        {/* Left navigation button */}
        <Box
          sx={{ cursor: safePage > 0 ? "pointer" : "not-allowed", fontSize: 32, px: 1, color: safePage > 0 ? "primary.main" : "grey.400", userSelect: "none" }}
          onClick={() => safePage > 0 && setPage(safePage - 1)}>
          {"<"}
        </Box>
        {/* Previews for visible UUIDs */}
        <Box sx={{ display: "flex", flexDirection: "row", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
          {visibleUuids.map((uuid, idx) => (
            <Box
              key={uuid}
              component="button"
              sx={{
                cursor: "pointer",
                border: activeUuid === uuid ? 2 : 1,
                borderColor: activeUuid === uuid ? "primary.main" : "#b3e5fc",
                borderRadius: 2,
                p: 1,
                bgcolor: activeUuid === uuid ? "#e3f2fd" : "#fafafa",
                minWidth: 25,
                outline: "none",
                boxShadow: activeUuid === uuid ? 2 : 0,
                transition: "box-shadow 0.2s",
                "&:hover": {
                  boxShadow: 4,
                  bgcolor: "#e3f2fd",
                },
              }}
              onClick={() => {
                setSelectedUuid(uuid);
              }}>
              <Box sx={{ overflow: "hidden", width: "100%" }}>{idx + 1}</Box>
            </Box>
          ))}
        </Box>
        {/* Right navigation button */}
        <Box
          sx={{ cursor: safePage < maxPage ? "pointer" : "not-allowed", fontSize: 32, px: 1, color: safePage < maxPage ? "primary.main" : "grey.400", userSelect: "none" }}
          onClick={() => safePage < maxPage && setPage(safePage + 1)}>
          {">"}
        </Box>
      </Box>
      {/* Show full PDFs for selected UUID */}
      <Box sx={{ width: "100%", overscrollBehavior: "contain" }}>
        {activeUuid && pdfData[activeUuid] && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              justifyContent: "center",
              alignItems: "stretch",
              mt: 2,
              width: "100%",
            }}>
            <PDFViewport key={`svs-${activeUuid}`} url={pdfData[activeUuid].svs_pdfURL} type={0} />
            <PDFViewport key={`icu-${activeUuid}`} url={pdfData[activeUuid].icu_pdfURL} type={3} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
