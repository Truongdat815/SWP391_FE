
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Models from '../components/Models';
import Specs from '../components/Specs';
import NewsSection from '../components/NewsSection';
import StatisticsSection from '../components/StatisticsSection';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* About Section */}
      <About />
      
      {/* Models Section */}
      <Models />
      
      {/* Specifications Section */}
      <Specs />
      
      {/* News Section */}
      <NewsSection />
      
      {/* Statistics Section */}
      <StatisticsSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;