
import React from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import About from '../../components/About';
import Models from '../../components/Models';
import Specs from '../../components/Specs';
import NewsSection from '../../components/NewsSection';
import StatisticsSection from '../../components/StatisticsSection';
import Footer from '../../components/Footer';
import { AnimatedSection } from '../../components/Animated';

function Home() {
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
      
      {/* News Section */}
      <AnimatedSection delay={0.2}>
        <NewsSection />
      </AnimatedSection>
      
      {/* Statistics Section */}
      <AnimatedSection delay={0.25}>
        <StatisticsSection />
      </AnimatedSection>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;