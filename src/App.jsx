import "./App.css";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
function App() {
  const DISPLAY_MODE = 2;

  return (
    <>
      <ToastContainer position="top-center" />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard DISPLAY_MODE={DISPLAY_MODE} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
