import React from 'react';
import './GiselleBackground.css';

export default function GiselleBackground() {
  return (
    <div className="container-giselle-bg w-full h-full fixed inset-0 z-0 pointer-events-none">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
    </div>
  );
}