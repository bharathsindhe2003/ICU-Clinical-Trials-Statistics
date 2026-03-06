import Box from "@mui/material/Box";
import TableComponent from "./TableComponent";
import Heading from "./Heading";
export default function PLotVDA({ id, table_data, data }) {
  const layout = [
    { name: "Bland-Altman Plot", idNumber: 1 },
    { name: "Box and Whisker Plot", idNumber: 5 },
    { name: "Error Distribution", idNumber: 3 },
    { name: "Error Histogram", idNumber: 4 },
    { name: "Correlation Plot", idNumber: 2 },
  ];

  return (
    <Box id={id} sx={{ display: "block" }}>
      <Box
        sx={{
          width: "60%",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          marginLeft: "auto",
          marginRight: "auto",
          gap: 2,
          mt: 2,
        }}>
        <TableComponent data={table_data} />
        <TableComponent data={data} header={"Clinical Trials Accuracy"} />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
          mt: 2,
        }}>
        {layout.map((item, idx) => (
          <Box
            key={item.idNumber}
            sx={{
              position: "relative",
              mt: 2,
              minWidth: 0,
              minHeight: { xs: 400, sm: 400 },
              border: 1,
              borderRadius: 2,
              borderColor: "#bbdefb",
              ...(idx === layout.length - 1 && {
                gridColumn: { xs: "auto", sm: "1 / -1" },
                justifySelf: { xs: "auto", sm: "center" },
              }),
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
              <Heading text={item.name} size="subtitle1" type="normal" />
            </Box>
            <Box
              id={id + item.idNumber}
              className="echart-container"
              sx={{
                width: "100%",
                height: 400,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}></Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
