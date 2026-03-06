import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
        px: 2,
        py: 1,
        borderRadius: 2,
        background: "transparent",
        color: "text.secondary",
      }}>
      <Typography variant="body2" color="text.secondary">
        © Copyright Samasti Health Technologies Ltd. All Rights Reserved
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Version 0.1.8
      </Typography>
    </Box>
  );
}
