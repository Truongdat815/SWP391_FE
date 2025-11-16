
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import About from '../../components/About';
import Models from '../../components/Models';
import Specs from '../../components/Specs';
import StatisticsSection from '../../components/StatisticsSection';
import Accessories from '../../components/Accessories';
import ChargingStations from '../../components/ChargingStations';
import Footer from '../../components/Footer';
import { AnimatedSection } from '../../components/Animated';

function Home() {
  const location = useLocation();

  useEffect(() => {
    // Handle hash navigation when coming from other pages
    if (location.hash) {
      const hash = location.hash.substring(1); // Remove the # symbol
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const offset = 80; // Account for fixed navbar
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <AnimatedSection>
        <Hero />
      </AnimatedSection>
      
      {/* About Section */}
      <AnimatedSection delay={0.05}>
        <About />
      </AnimatedSection>
      
      {/* Models Section */}
      <AnimatedSection delay={0.1}>
        <Models />
      </AnimatedSection>
      
      {/* Specifications Section */}
      <AnimatedSection delay={0.15}>
        <Specs />
      </AnimatedSection>
      
      {/* Statistics Section */}
      <AnimatedSection delay={0.2}>
        <StatisticsSection />
      </AnimatedSection>
      
      {/* Accessories Section */}
      <AnimatedSection delay={0.25}>
        <Accessories />
      </AnimatedSection>
      
      {/* Charging Stations Section */}
      <AnimatedSection delay={0.3}>
        <ChargingStations />
      </AnimatedSection>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;