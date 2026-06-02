import fs from "fs";

let f = fs.readFileSync("app/page.js", "utf8");

f = f.replace(/Twitter/g, "Bird");
f = f.replace(/Instagram/g, "Camera");
f = f.replace(/Github/g, "Code2");

f = f.replace(
  /  onClick="selectOption\('chutney', this, 'Gunpowder Ghee', 30\)"/g,
  "  onClick={(e) => selectOption('chutney', e.currentTarget, 'Gunpowder Ghee', 30)}"
);
f = f.replace(
  /  onClick="selectOption\('chutney', this, 'Double Sambar', 15\)"/g,
  "  onClick={(e) => selectOption('chutney', e.currentTarget, 'Double Sambar', 15)}"
);
f = f.replace(/  onClick="closeOrderModalOutside\(event\)"/g, "  onClick={closeOrderModalOutside}");
f = f.replace(/  onClick="closeOrderModal\(\)"/g, "  onClick={closeOrderModal}");
f = f.replace(/  onClick="runSimulatedFlight\(\)"/g, "  onClick={runSimulatedFlight}");
f = f.replace(
  /id="speedSlider" min="30" max="90" value="45"  onInput="updateSpeed\(this\.value\)"/g,
  'id="speedSlider" min="30" max="90" value={flightSpeed} onInput={(e) => updateSpeed(e.target.value)}'
);
f = f.replace(
  /<span className="slider-val" id="speedVal">Speed: 45 km\/h<\/span>/g,
  '<span className="slider-val" id="speedVal">{speedValText}</span>'
);
f = f.replace(
  /<div className="map-drone-marker" id="mapDrone" style=\{\{ left: "30px", top: "95px" \}\}>/g,
  '<div className="map-drone-marker" id="mapDrone" ref={mapDroneRef} style={{ left: "30px", top: "95px" }}>'
);
f = f.replace(
  /<span className="psr-val" id="summaryPayload">Masala Dosa \+ Classic Chutney<\/span>/g,
  '<span className="psr-val" id="summaryPayload">{summaryPayload}</span>'
);
f = f.replace(
  /<span className="psr-val" id="summaryTime">4 mins 45 secs<\/span>/g,
  '<span className="psr-val" id="summaryTime">{summaryTime}</span>'
);
f = f.replace(
  /<span className="total-price" id="summaryTotal">₹149<\/span>/g,
  '<span className="total-price" id="summaryTotal">{summaryTotal}</span>'
);
f = f.replace(/<Menu id="menuIcon" \/>/g, "<MenuIcon id=\"menuIcon\" />");
f = f.replace(
  /<span className="db-val" id="telemetryGPS">Connected<\/span>/g,
  '<span className="db-val" id="telemetryGPS">{telemetryGPS}</span>'
);
f = f.replace(
  /<span className="db-val" id="telemetryBattery">98\.2%<\/span>/g,
  '<span className="db-val" id="telemetryBattery">{telemetryBattery}</span>'
);
f = f.replace(
  /<span className="db-val" id="telemetryWind">2\.4 knots<\/span>/g,
  '<span className="db-val" id="telemetryWind">{telemetryWind}</span>'
);
f = f.replace(
  /<span className="db-val" id="telemetryTemp">190° C<\/span>/g,
  '<span className="db-val" id="telemetryTemp">{telemetryTemp}</span>'
);
f = f.replace(
  /<span className="progress-status" id="progressStatusText">[\s\S]*?<\/span>/,
  '<span className="progress-status" id="progressStatusText"><StatusIcon className={status.className} style={status.style} /> {status.text}</span>'
);
f = f.replace(
  /<span className="progress-time" id="progressTimeText">--:--<\/span>/g,
  '<span className="progress-time" id="progressTimeText">{progressTimeText}</span>'
);
f = f.replace(
  /<div className="progress-fill" id="progressBar"><\/div>/g,
  '<div className="progress-fill" id="progressBar" style={{ width: progressWidth }}></div>'
);
f = f.replace(
  /<button className="btn btn-primary btn-launch-final" id="launchBtn"  onClick=\{runSimulatedFlight\}>[\s\S]*?<\/button>/,
  '<button className="btn btn-primary btn-launch-final" id="launchBtn" onClick={runSimulatedFlight} disabled={launchDisabled} style={{ opacity: launchOpacity }}>{launchButtonMode === "launching" ? "Launching Drone..." : (<><Rocket /> Initialize Launch Sequence</>)}</button>'
);
f = f.replace(/stroke-width=/g, "strokeWidth=");
f = f.replace(/stroke-dasharray=/g, "strokeDasharray=");

fs.writeFileSync("app/page.js", f);
console.log("fixed page.js");
