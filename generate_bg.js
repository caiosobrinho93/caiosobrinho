const fs = require('fs');
const bg = JSON.parse(fs.readFileSync('temp_bg.json'));
let css = bg.cssCode;
css = css.replace('.container', '.container-giselle-bg');
// Modify CSS to make sure it covers the screen fully
css = css.replace('height: 200px;', 'height: 100vh;');
fs.writeFileSync('src/components/GiselleBackground.css', css);

const tsx = `import React from 'react';
import './GiselleBackground.css';

export default function GiselleBackground() {
  return (
    <div className="container-giselle-bg w-full h-full fixed inset-0 z-0 pointer-events-none">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
    </div>
  );
}`;
fs.writeFileSync('src/components/GiselleBackground.tsx', tsx);
