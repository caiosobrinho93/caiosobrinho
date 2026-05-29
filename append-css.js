const fs = require('fs');

const cssToAppend = `
/* Frutiger Button Style */
.frutiger-button {
  cursor: pointer;
  position: relative;
  padding: 2px;
  border: 0;
  background: linear-gradient(#006caa, #00c3ff);
  box-shadow: 0px 4px 6px 0px #0008;
  transition: 0.3s all;
}
.frutiger-button:hover {
  box-shadow: 0px 6px 12px 0px #0009;
}
.frutiger-button:active {
  box-shadow: 0px 0px 0px 0px #0000;
}
.frutiger-inner {
  position: relative;
  inset: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 100%, #30f8f8 10%, #30f8f800 55%), linear-gradient(#00526a, #009dcd);
  overflow: hidden;
  transition: inherit;
  border-radius: inherit;
}
.frutiger-inner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(-65deg, #0000 40%, #fff7 50%, #0000 70%);
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: frutigerThing 3s ease infinite;
}
@keyframes frutigerThing {
  0% { background-position: 130%; opacity: 1; }
  to { background-position: -166%; opacity: 0; }
}
.frutiger-top-white {
  position: absolute;
  border-radius: inherit;
  inset: 0 -2em;
  background: radial-gradient(circle at 50% -150%, #fff 45%, #fff6 60%, #fff0 60%);
  transition: inherit;
}
.frutiger-inner::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  transition: inherit;
  box-shadow: inset 0px 2px 8px -2px #0000;
}
.frutiger-button:active .frutiger-inner::after {
  box-shadow: inset 0px 2px 8px -2px #000a;
}
.frutiger-text {
  position: relative;
  z-index: 1;
  color: white;
  transition: inherit;
}
`;

fs.appendFileSync('src/app/globals.css', cssToAppend);
console.log('CSS Re-Appended.');
