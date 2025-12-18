import Layout from "./Layout.jsx";

import Home from "./Home";

import Analyze from "./Analyze";

import Upload from "./Upload";

import Editor from "./Editor";

import Fonts from "./Fonts";

import MyGallery from "./MyGallery";

import Pricing from "./Pricing";

import CreativeHub from "./CreativeHub";

import Business from "./Business";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Analyze: Analyze,
    
    Upload: Upload,
    
    Editor: Editor,
    
    Fonts: Fonts,
    
    MyGallery: MyGallery,
    
    Pricing: Pricing,
    
    CreativeHub: CreativeHub,
    
    Business: Business,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Analyze" element={<Analyze />} />
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Editor" element={<Editor />} />
                
                <Route path="/Fonts" element={<Fonts />} />
                
                <Route path="/MyGallery" element={<MyGallery />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/CreativeHub" element={<CreativeHub />} />
                
                <Route path="/Business" element={<Business />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}