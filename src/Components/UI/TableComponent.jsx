import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function TableComponent({ data, header }) {
  const rows = data ? Object.entries(data) : [];
  let displayHeader = header;
  let tableRows = rows;
  let headerRow = null;

  if (!header && rows.length > 0) {
    // Use the first row as the header if no header prop is provided
    const [firstLabel, firstValue] = rows[0];
    headerRow = [firstLabel, firstValue];
    tableRows = rows.slice(1);
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: "100%" }} size="small" aria-label="vitals accuracy table">
        <TableHead>
          {displayHeader ? (
            <TableRow>
              <TableCell colSpan={2} align="center" sx={{ backgroundColor: "#222", color: "white", fontWeight: "bold", fontSize: 16 }}>
                {displayHeader}
              </TableCell>
            </TableRow>
          ) : headerRow ? (
            <TableRow sx={{ backgroundColor: "gray" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>{headerRow[0]}</TableCell>
              <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                {headerRow[1]}
              </TableCell>
            </TableRow>
          ) : null}
        </TableHead>
        <TableBody>
          {tableRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} align="center">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            tableRows.map(([label, value]) => (
              <TableRow key={label}>
                <TableCell component="th" scope="row">
                  {label}
                </TableCell>
                <TableCell align="right">{value}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
