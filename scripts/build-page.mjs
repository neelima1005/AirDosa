import fs from "fs";
import path from "path";

const html = fs.readFileSync("index.html", "utf8");
const bodyMatch = html.match(/<body>([\s\S]*?)<!-- ==========================================\s*15\. JAVASCRIPT/s);
if (!bodyMatch) throw new Error("body not found");

const iconNames = [
  "navigation",
  "menu",
  "sparkles",
  "rocket",
  "sliders",
  "flame",
  "radar",
  "thermometer-sun",
  "zap",
  "activity",
  "droplet",
  "gauge",
  "navigation-2",
  "send",
  "check",
  "x",
  "arrow-right",
  "twitter",
  "instagram",
  "github",
  "satellite",
  "battery-charging",
  "compass",
  "radio",
  "loader",
  "shield-alert",
  "check-circle",
];

function toPascalCase(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const lucideImports = [...new Set(iconNames.map(toPascalCase))];
const specialRenames = { Sliders: "SlidersHorizontal" };
const importList = lucideImports.map((name) => specialRenames[name] || name);

function styleStringToObject(styleStr) {
  const obj = {};
  styleStr.split(";").forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) return;
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    obj[camelKey] = value;
  });
  return obj;
}

function formatStyleObject(obj) {
  const entries = Object.entries(obj).map(
    ([k, v]) => `${k}: ${JSON.stringify(v)}`
  );
  return `{ ${entries.join(", ")} }`;
}

function convertIconTags(fragment) {
  return fragment.replace(
    /<i\s+data-lucide="([^"]+)"([^>]*)><\/i>/g,
    (_, iconName, rest) => {
      const pascal = specialRenames[toPascalCase(iconName)] || toPascalCase(iconName);
      const attrs = rest.trim();
      let className = "";
      let styleObj = null;
      const classMatch = attrs.match(/class="([^"]*)"/);
      if (classMatch) className = classMatch[1];
      const styleMatch = attrs.match(/style="([^"]*)"/);
      if (styleMatch) styleObj = styleStringToObject(styleMatch[1]);
      const idMatch = attrs.match(/id="([^"]*)"/);
      const idAttr = idMatch ? ` id="${idMatch[1]}"` : "";
      const classAttr = className ? ` className=${JSON.stringify(className)}` : "";
      const styleAttr = styleObj
        ? ` style={${formatStyleObject(styleObj)}}`
        : "";
      return `<${pascal}${idAttr}${classAttr}${styleAttr} />`;
    }
  );
}

function convertHtmlToJsx(fragment) {
  let jsx = fragment;
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, "{/*$1*/}");
  jsx = jsx.replace(/\sclass="/g, ' className="');
  jsx = jsx.replace(/\bonclick="/g, ' onClick="');
  jsx = jsx.replace(/\boninput="/g, ' onInput="');
  jsx = jsx.replace(/\bonmousemove="/g, ' onMouseMove="');
  jsx = jsx.replace(/\bonmouseleave="/g, ' onMouseLeave="');
  jsx = jsx.replace(/\bonsubmit="/g, ' onSubmit="');
  jsx = jsx.replace(/<img([^>]*?)>/g, "<img$1 />");
  jsx = jsx.replace(/<input([^>]*?)>/g, "<input$1 />");
  jsx = jsx.replace(/<br>/g, "<br />");
  jsx = jsx.replace(/style="([^"]*)"/g, (_, styleStr) => {
    return `style={${formatStyleObject(styleStringToObject(styleStr))}}`;
  });
  jsx = convertIconTags(jsx);
  jsx = jsx.replace(/src="dosa_drone_hero\.png"/g, 'src="/dosa_drone_hero.png"');
  return jsx;
}

const bodyJsx = convertHtmlToJsx(bodyMatch[1].trim());

const pageJs = `'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ${importList.join(",\n  ")}
} from 'lucide-react';

export default function Home() {
  const [navMenuActive, setNavMenuActive] = useState(false);
  const [menuIconName, setMenuIconName] = useState('menu');
  const [selectedBase, setSelectedBase] = useState('Masala Dosa');
  const [basePrice, setBasePrice] = useState(120);
  const [selectedChutney, setSelectedChutney] = useState('Classic Trio');
  const [chutneyPrice, setChutneyPrice] = useState(0);
  const [flightSpeed, setFlightSpeedState] = useState(45);
  const [speedValText, setSpeedValText] = useState('Speed: 45 km/h');
  const [summaryTotal, setSummaryTotal] = useState('₹149');
  const [summaryPayload, setSummaryPayload] = useState('Masala Dosa + Classic Chutney');
  const [summaryTime, setSummaryTime] = useState('4 mins 45 secs');
  const [orderModalActive, setOrderModalActive] = useState(false);
  const [telemetryGPS, setTelemetryGPS] = useState('Connected');
  const [telemetryBattery, setTelemetryBattery] = useState('98.2%');
  const [telemetryWind, setTelemetryWind] = useState('2.4 knots');
  const [telemetryTemp, setTelemetryTemp] = useState('190° C');
  const [progressWidth, setProgressWidth] = useState('0%');
  const [progressStatusKey, setProgressStatusKey] = useState('awaiting');
  const [progressTimeText, setProgressTimeText] = useState('--:--');
  const [launchDisabled, setLaunchDisabled] = useState(false);
  const [launchOpacity, setLaunchOpacity] = useState(1);
  const [launchButtonMode, setLaunchButtonMode] = useState('ready');

  const flightIntervalRef = useRef(null);
  const mapDroneRef = useRef(null);
  const canvasRef = useRef(null);

  const MenuIcon = menuIconName === 'x' ? X : Menu;

  const progressStatusContent = {
    awaiting: { Icon: Radio, text: 'Awaiting Launch Sequence', className: 'tb-pulse', style: {} },
    loading: { Icon: Loader, text: 'Pre-flight checks active...', className: 'tb-pulse', style: { animation: 'spin-clockwise 2s linear infinite' } },
    fired: { Icon: Rocket, text: 'Main Engines Fired. Dispatched!', className: 'tb-pulse pulse-orange', style: {} },
    dodge: { Icon: ShieldAlert, text: 'Dodging balcony clothesline...', className: 'tb-pulse pulse-magenta', style: {} },
    approach: { Icon: Navigation, text: 'Approaching target coordinates...', className: 'tb-pulse', style: {} },
    delivered: { Icon: CheckCircle, text: 'Dosa Delivered Hot to Balcony!', className: 'tb-pulse', style: { background: '#22c55e', boxShadow: '0 0 10px #22c55e' } },
  };

  const status = progressStatusContent[progressStatusKey];

  const openOrderModal = useCallback(() => {
    setOrderModalActive(true);
    document.body.style.overflow = 'hidden';
    setTelemetryGPS('LOCK-' + Math.floor(1000 + Math.random() * 9000));
    setTelemetryBattery((95 + Math.random() * 5).toFixed(1) + '%');
    setTelemetryWind((1 + Math.random() * 6).toFixed(1) + ' knots');
    setTelemetryTemp(Math.floor(180 + Math.random() * 20) + '° C');
  }, []);

  const resetModalDashboard = useCallback(() => {
    if (flightIntervalRef.current) {
      clearInterval(flightIntervalRef.current);
      flightIntervalRef.current = null;
    }
    setProgressWidth('0%');
    setProgressStatusKey('awaiting');
    setProgressTimeText('--:--');
    setLaunchDisabled(false);
    setLaunchOpacity(1);
    setLaunchButtonMode('ready');
  }, []);

  const closeOrderModal = useCallback(() => {
    setOrderModalActive(false);
    document.body.style.overflow = '';
    resetModalDashboard();
  }, [resetModalDashboard]);

  const closeOrderModalOutside = useCallback(
    (event) => {
      if (event.target.id === 'orderModal') {
        closeOrderModal();
      }
    },
    [closeOrderModal]
  );

  const recalculateTelemetry = useCallback((speed) => {
    const total = basePrice + chutneyPrice;
    setSummaryTotal(\`₹\${total}\`);
    setSummaryPayload(\`\${selectedBase} + \${selectedChutney}\`);

    const baseDistance = 3.5;
    const timeHours = baseDistance / speed;
    const timeMinutesDecimal = timeHours * 60;
    const minutes = Math.floor(timeMinutesDecimal);
    const seconds = Math.round((timeMinutesDecimal - minutes) * 60);
    setSummaryTime(\`\${minutes} min \${seconds} sec\`);

    const mapDrone = mapDroneRef.current;
    if (mapDrone) {
      const animationSpeed = (90 - speed + 10) / 15;
      mapDrone.style.animationDuration = \`\${animationSpeed}s\`;
      const mapProgressPercentage = (speed - 30) / 60;
      const leftVal = 30 + mapProgressPercentage * 160;
      const topVal = 95 - Math.sin(mapProgressPercentage * Math.PI) * 40;
      mapDrone.style.left = \`\${leftVal}px\`;
      mapDrone.style.top = \`\${topVal}px\`;
    }
  }, [basePrice, chutneyPrice, selectedBase, selectedChutney]);

  const selectOption = useCallback(
    (category, element, name, price) => {
      const chips = element.parentElement.querySelectorAll('.option-chip');
      chips.forEach((chip) => chip.classList.remove('selected'));
      element.classList.add('selected');

      if (category === 'base') {
        setSelectedBase(name);
        setBasePrice(price);
        recalculateTelemetry(flightSpeed);
      } else if (category === 'chutney') {
        setSelectedChutney(name);
        setChutneyPrice(price);
        recalculateTelemetry(flightSpeed);
      }
    },
    [flightSpeed, recalculateTelemetry]
  );

  const updateSpeed = useCallback(
    (speed) => {
      const parsed = parseInt(speed, 10);
      setFlightSpeedState(parsed);
      setSpeedValText(\`Speed: \${parsed} km/h\`);
      recalculateTelemetry(parsed);
    },
    [recalculateTelemetry]
  );

  const runSimulatedFlight = useCallback(() => {
    setLaunchDisabled(true);
    setLaunchOpacity(0.5);
    setLaunchButtonMode('launching');

    let progress = 0;
    let timeRemaining = 20;

    setProgressStatusKey('loading');

    setTimeout(() => {
      setProgressStatusKey('fired');

      flightIntervalRef.current = setInterval(() => {
        progress += 5;
        timeRemaining -= 1;

        if (progress <= 100) {
          setProgressWidth(\`\${progress}%\`);
          setProgressTimeText(
            \`ETA 00:\${timeRemaining < 10 ? '0' + timeRemaining : timeRemaining}\`
          );

          setTelemetryBattery(
            (98 - progress * 0.1 + Math.random() * 0.5).toFixed(1) + '%'
          );
          setTelemetryWind((2 + Math.random() * 4).toFixed(1) + ' knots');

          if (progress === 40) {
            setProgressStatusKey('dodge');
          } else if (progress === 70) {
            setProgressStatusKey('approach');
          }
        } else {
          clearInterval(flightIntervalRef.current);
          flightIntervalRef.current = null;
          setProgressStatusKey('delivered');
          setProgressTimeText('00:00');

          setTimeout(() => {
            alert(
              "🏆 Congratulations! AirDosa Quadcopter 'dosa-fleet-9' has successfully landed on your coordinates. Crispy, golden breakfast is served!"
            );
            closeOrderModal();
          }, 800);
        }
      }, 500);
    }, 1500);
  }, [closeOrderModal]);

  const tiltCard = useCallback((event, card) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (y - centerY) / 12;
    const tiltY = -(x - centerX) / 12;
    card.style.transform = \`perspective(1000px) rotateX(\${tiltX}deg) rotateY(\${tiltY}deg) translateY(-8px) scale(1.02)\`;
  }, []);

  const resetCard = useCallback((card) => {
    card.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
  }, []);

  const toggleMenu = useCallback(() => {
    setNavMenuActive((prev) => {
      const next = !prev;
      setMenuIconName(next ? 'x' : 'menu');
      return next;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setNavMenuActive(false);
    setMenuIconName('menu');
  }, []);

  useEffect(() => {
    const header = document.getElementById('mainHeader');
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll);

    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    revealElements.forEach((element) => revealObserver.observe(element));

    return () => {
      window.removeEventListener('scroll', onScroll);
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 65;
    let mouse = { x: null, y: null, radius: 140 };
    let animationFrameId;

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.color =
          Math.random() > 0.5
            ? 'rgba(255, 136, 0, 0.25)'
            : 'rgba(0, 242, 254, 0.25)';
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        if (mouse.x != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x += (dx / distance) * force * 0.5;
            this.y += (dy / distance) * force * 0.5;
          }
        }
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = \`rgba(255, 255, 255, \${opacity})\`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animateParticles);
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseout', onMouseOut);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (flightIntervalRef.current) {
        clearInterval(flightIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
${bodyJsx
  .replace('<canvas id="particleCanvas"></canvas>', '<canvas id="particleCanvas" ref={canvasRef}></canvas>')
  .replace(
    'className="nav-menu" id="navMenu"',
    'className={`nav-menu${navMenuActive ? " active" : ""}`} id="navMenu"'
  )
  .replace(
    '<i data-lucide="menu" id="menuIcon"></i>',
    '<MenuIcon id="menuIcon" />'
  )
  .replace(
    'id="menuToggle" aria-label="Toggle Navigation Menu"',
    'id="menuToggle" aria-label="Toggle Navigation Menu" onClick={toggleMenu}'
  )
  .replace(/onclick="openOrderModal\(\)"/g, 'onClick={openOrderModal}')
  .replace(/onclick="selectOption\('base', this, 'Masala Dosa', 120\)"/g, "onClick={(e) => selectOption('base', e.currentTarget, 'Masala Dosa', 120)}")
  .replace(/onclick="selectOption\('base', this, 'Ghee Roast', 140\)"/g, "onClick={(e) => selectOption('base', e.currentTarget, 'Ghee Roast', 140)}")
  .replace(/onclick="selectOption\('base', this, 'Cheese Chilli', 160\)"/g, "onClick={(e) => selectOption('base', e.currentTarget, 'Cheese Chilli', 160)}")
  .replace(/onclick="selectOption\('chutney', this, 'Classic Trio', 0\)"/g, "onClick={(e) => selectOption('chutney', e.currentTarget, 'Classic Trio', 0)}")
  .replace(/onclick="selectOption\('chutney', this, 'Gunpowder Ghee', 30\)"/g, "onClick={(e) => selectOption('chutney', e.currentTarget, 'Gunpowder Ghee', 30)}")
  .replace(/onclick="selectOption\('chutney', this, 'Double Sambar', 15\)"/g, "onClick={(e) => selectOption('chutney', e.currentTarget, 'Double Sambar', 15)}")
  .replace(
    'id="speedSlider" min="30" max="90" value="45" onInput="updateSpeed(this.value)"',
    'id="speedSlider" min="30" max="90" value={flightSpeed} onInput={(e) => updateSpeed(e.target.value)}'
  )
  .replace('<span class="slider-val" id="speedVal">Speed: 45 km/h</span>', '<span class="slider-val" id="speedVal">{speedValText}</span>')
  .replace(
    '<div class="map-drone-marker" id="mapDrone" style={{ left: "30px", top: "95px" }}>',
    '<div class="map-drone-marker" id="mapDrone" ref={mapDroneRef} style={{ left: "30px", top: "95px" }}>'
  )
  .replace('<span class="psr-val" id="summaryPayload">Masala Dosa + Classic Chutney</span>', '<span class="psr-val" id="summaryPayload">{summaryPayload}</span>')
  .replace('<span class="psr-val" id="summaryTime">4 mins 45 secs</span>', '<span class="psr-val" id="summaryTime">{summaryTime}</span>')
  .replace('<span class="total-price" id="summaryTotal">₹149</span>', '<span class="total-price" id="summaryTotal">{summaryTotal}</span>')
  .replace(
    'onsubmit="event.preventDefault(); alert(\'Subscribed to flight logs successfully!\');"',
    "onSubmit={(e) => { e.preventDefault(); alert('Subscribed to flight logs successfully!'); }}"
  )
  .replace(
    '<div class="modal-overlay" id="orderModal" onClick="closeOrderModalOutside(event)">',
    '<div className={`modal-overlay${orderModalActive ? " active" : ""}`} id="orderModal" onClick={closeOrderModalOutside}>'
  )
  .replace('className="modal-overlay"', 'className={`modal-overlay${orderModalActive ? " active" : ""}`}')
  .replace('<button class="modal-close" onClick="closeOrderModal()"', '<button className="modal-close" onClick={closeOrderModal}')
  .replace('<span class="db-val" id="telemetryGPS">Connected</span>', '<span className="db-val" id="telemetryGPS">{telemetryGPS}</span>')
  .replace('<span class="db-val" id="telemetryBattery">98.2%</span>', '<span className="db-val" id="telemetryBattery">{telemetryBattery}</span>')
  .replace('<span class="db-val" id="telemetryWind">2.4 knots</span>', '<span className="db-val" id="telemetryWind">{telemetryWind}</span>')
  .replace('<span class="db-val" id="telemetryTemp">190° C</span>', '<span className="db-val" id="telemetryTemp">{telemetryTemp}</span>')
  .replace(
    /<span class="progress-status" id="progressStatusText">[\s\S]*?<\/span>/,
    '<span className="progress-status" id="progressStatusText"><status.Icon className={status.className} style={status.style} /> {status.text}</span>'
  )
  .replace('<span class="progress-time" id="progressTimeText">--:--</span>', '<span className="progress-time" id="progressTimeText">{progressTimeText}</span>')
  .replace('<div class="progress-fill" id="progressBar"></div>', '<div className="progress-fill" id="progressBar" style={{ width: progressWidth }}></div>')
  .replace(
    '<button class="btn btn-primary btn-launch-final" id="launchBtn" onClick="runSimulatedFlight()">',
    '<button className="btn btn-primary btn-launch-final" id="launchBtn" onClick={runSimulatedFlight} disabled={launchDisabled} style={{ opacity: launchOpacity }}>'
  )
  .replace(
    /<i data-lucide="rocket"><\/i>\s*Initialize Launch Sequence/,
    '{launchButtonMode === "launching" ? "Launching Drone..." : (<><Rocket /> Initialize Launch Sequence</>)}'
  )
  .replace(/onMouseMove="tiltCard\(event, this\)"/g, 'onMouseMove={(e) => tiltCard(e, e.currentTarget)}')
  .replace(/onMouseLeave="resetCard\(this\)"/g, 'onMouseLeave={(e) => resetCard(e.currentTarget)}')
  .replace(/class="/g, 'className="')
  .replace(/<a href="#features" className="nav-link"/g, '<a href="#features" className="nav-link" onClick={closeMenu}')
  .replace(/<a href="#configurator" className="nav-link"/g, '<a href="#configurator" className="nav-link" onClick={closeMenu}')
  .replace(/<a href="#pricing" className="nav-link"/g, '<a href="#pricing" className="nav-link" onClick={closeMenu}')
  .replace(/<a href="#safety" className="nav-link"/g, '<a href="#safety" className="nav-link" onClick={closeMenu}')
  .split('\n')
  .map((line) => '      ' + line)
  .join('\n')}
    </>
  );
}
`;

fs.writeFileSync(path.join("app", "page.js"), pageJs);
console.log("Generated app/page.js");
