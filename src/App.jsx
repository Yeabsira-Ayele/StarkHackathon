import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CampaignList from "./pages/CampaignList";
import CampaignDetail from "./pages/CampaignDetail";

export default function App() {
    return (
    <Router>
        <Routes>
        <Route path="/" element={<CampaignList />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        </Routes>
    </Router>
    );
}