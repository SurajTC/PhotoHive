import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Photo from "./components/Photo";
import Shell from "./components/Shell";

export default function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/photos/:id" element={<Photo />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Shell>
    </Router>
  );
}
