'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Navigation,
  Menu,
  Sparkles,
  Rocket,
  SlidersHorizontal,
  Flame,
  Radar,
  ThermometerSun,
  Zap,
  Activity,
  Droplet,
  Gauge,
  Navigation2,
  Send,
  Check,
  X,
  ArrowRight,
  Bird,
  Camera,
  Code2,
  Satellite,
  BatteryCharging,
  Compass,
  Radio,
  Loader,
  ShieldAlert,
  CheckCircle
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
  const StatusIcon = status.Icon;

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

  const recalculateTelemetry = useCallback((speed, overrides = {}) => {
    const bp = overrides.basePrice ?? basePrice;
    const cp = overrides.chutneyPrice ?? chutneyPrice;
    const sb = overrides.selectedBase ?? selectedBase;
    const sc = overrides.selectedChutney ?? selectedChutney;
    const total = bp + cp;
    setSummaryTotal(`₹${total}`);
    setSummaryPayload(`${sb} + ${sc}`);

    const baseDistance = 3.5;
    const timeHours = baseDistance / speed;
    const timeMinutesDecimal = timeHours * 60;
    const minutes = Math.floor(timeMinutesDecimal);
    const seconds = Math.round((timeMinutesDecimal - minutes) * 60);
    setSummaryTime(`${minutes} min ${seconds} sec`);

    const mapDrone = mapDroneRef.current;
    if (mapDrone) {
      const animationSpeed = (90 - speed + 10) / 15;
      mapDrone.style.animationDuration = `${animationSpeed}s`;
      const mapProgressPercentage = (speed - 30) / 60;
      const leftVal = 30 + mapProgressPercentage * 160;
      const topVal = 95 - Math.sin(mapProgressPercentage * Math.PI) * 40;
      mapDrone.style.left = `${leftVal}px`;
      mapDrone.style.top = `${topVal}px`;
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
        recalculateTelemetry(flightSpeed, { selectedBase: name, basePrice: price });
      } else if (category === 'chutney') {
        setSelectedChutney(name);
        setChutneyPrice(price);
        recalculateTelemetry(flightSpeed, { selectedChutney: name, chutneyPrice: price });
      }
    },
    [flightSpeed, recalculateTelemetry]
  );

  const updateSpeed = useCallback(
    (speed) => {
      const parsed = parseInt(speed, 10);
      setFlightSpeedState(parsed);
      setSpeedValText(`Speed: ${parsed} km/h`);
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
          setProgressWidth(`${progress}%`);
          setProgressTimeText(
            `ETA 00:${timeRemaining < 10 ? '0' + timeRemaining : timeRemaining}`
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
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale(1.02)`;
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
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
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
      {/* Interactive Background Particle Canvas */}
          <canvas id="particleCanvas" ref={canvasRef}></canvas>
      
          {/* Ambient Glowing Blurs */}
          <div className="ambient-glow" style={{ top: "10%", left: "-10%", width: "45vw", height: "45vw", background: "radial-gradient(circle, rgba(255, 94, 0, 0.08) 0%, transparent 70%)" }}></div>
          <div className="ambient-glow" style={{ top: "40%", right: "-10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(0, 242, 254, 0.08) 0%, transparent 70%)" }}></div>
          <div className="ambient-glow" style={{ bottom: "10%", left: "10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)" }}></div>
      
          {/* ==========================================
             HEADER / NAVIGATION BAR
             ========================================== */}
          <header className="header" id="mainHeader">
              <div className="container nav-wrapper">
                  <a href="#" className="logo">
                      <Navigation />
                      Air<span>Dosa</span>
                  </a>
                  
                  <nav>
                      <ul className={`nav-menu${navMenuActive ? " active" : ""}`} id="navMenu">
                          <li><a href="#features" className="nav-link" onClick={closeMenu}>Features</a></li>
                          <li><a href="#configurator" className="nav-link" onClick={closeMenu}>Flight Customizer</a></li>
                          <li><a href="#pricing" className="nav-link" onClick={closeMenu}>Pricing</a></li>
                          <li><a href="#safety" className="nav-link" onClick={closeMenu}>Technology</a></li>
                      </ul>
                  </nav>
      
                  <div className="nav-actions">
                      <button className="btn btn-secondary btn-nav"  onClick={openOrderModal}>Order Console</button>
                      <button className="menu-toggle" id="menuToggle" aria-label="Toggle Navigation Menu" onClick={toggleMenu}>
                          <MenuIcon id="menuIcon" />
                      </button>
                  </div>
              </div>
          </header>
      
          {/* ==========================================
             HERO SECTION
             ========================================== */}
          <section className="hero">
              <div className="container hero-grid">
                  
                  {/* Hero Left Side */}
                  <div className="hero-content">
                      <div className="badge">
                          <Sparkles />
                          India&apos;s First AI Dosa Drone Fleet
                      </div>
                      <h1 className="hero-title">
                          Crispy Dosas.<br />
                          <span className="grad-primary">Delivered by Drones.</span><br />
                          In <span className="grad-secondary">5 Minutes.</span>
                      </h1>
                      <p className="hero-tagline">
                          Experience India&apos;s first AI-navigated, thermal-insulated dosa delivery network. From our smart-tava directly to your balcony—steaming hot, perfectly crispy.
                      </p>
                      <div className="hero-ctas">
                          <button className="btn btn-primary"  onClick={openOrderModal}>
                              <Rocket />
                              Launch AirDosa
                          </button>
                          <a href="#configurator" className="btn btn-secondary">
                              <SlidersHorizontal />
                              Customize Flight
                          </a>
                      </div>
                      <div className="hero-stats">
                          <div className="stat-item">
                              <span className="stat-val">5.4 Min</span>
                              <span className="stat-lbl">Avg Delivery Time</span>
                          </div>
                          <div className="stat-item" style={{ borderLeft: "1px solid var(--border-glass)", paddingLeft: "2rem" }}>
                              <span className="stat-val">65° C</span>
                              <span className="stat-lbl">Active Pod Heat</span>
                          </div>
                          <div className="stat-item" style={{ borderLeft: "1px solid var(--border-glass)", paddingLeft: "2rem" }}>
                              <span className="stat-val">4.9 / 5</span>
                              <span className="stat-lbl">Customer Rating</span>
                          </div>
                      </div>
                  </div>
      
                  {/* Hero Right Side: Futuristic Drone Display */}
                  <div className="hero-visual">
                      <div className="visual-container">
                          {/* Rotating HUD elements */}
                          <div className="tech-ring ring-outer"></div>
                          <div className="tech-ring ring-inner"></div>
                          <div className="radar-sweep"></div>
                          
                          {/* Floating Telemetry Badges */}
                          <div className="telemetry-badge tb-1">
                              <span className="tb-pulse"></span>
                              <span>Altitude: 12m</span>
                          </div>
                          <div className="telemetry-badge tb-2">
                              <span className="tb-pulse pulse-orange"></span>
                              <span>Dosa Temp: 68°C</span>
                          </div>
                          <div className="telemetry-badge tb-3">
                              <span className="tb-pulse pulse-magenta"></span>
                              <span>Air-Speed: 45 km/h</span>
                          </div>
      
                          {/* Drone Image Frame (Stunning Photorealistic 3D Render Image) */}
                          <div className="drone-showcase">
                              <img src="/dosa_drone_hero.png" alt="AirDosa AI Delivery Drone" className="hero-drone-image" />
                              <div className="hologram-grid-overlay"></div>
                              <div className="hologram-scanline-bar"></div>
      
                              {/* Steaming thermal pod overlay */}
                              <div className="thermal-pod-container">
                                  <div className="steam-particles">
                                      <span className="steam-dot"></span>
                                      <span className="steam-dot"></span>
                                      <span className="steam-dot"></span>
                                  </div>
                                  <div className="thermal-pod">
                                      <Flame />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
      
              </div>
          </section>
      
          {/* ==========================================
             FEATURES SECTION ("THE AIRDOSA TECH")
             ========================================== */}
          <section className="section-padding" id="features">
              <div className="container">
                  <div className="section-header reveal">
                      <span className="badge badge-cyan">Advanced Aerospace Tech</span>
                      <h2 className="section-title">Freshness Meets <span>Aerodynamics</span></h2>
                      <p className="section-desc">Our custom-engineered drone fleet combines bleeding-edge culinary tech with satellite-level navigation to solve the ultimate Indian delivery challenge.</p>
                  </div>
      
                  <div className="features-grid">
                      
                      {/* Card 1 */}
                      <div className="feature-card glass-panel reveal reveal-delay-1"  onMouseMove={(e) => tiltCard(e, e.currentTarget)}  onMouseLeave={(e) => resetCard(e.currentTarget)}>
                          <div className="feature-card-glow"></div>
                          <div className="feature-icon-wrapper feature-icon-1">
                              <Radar />
                          </div>
                          <h3>AI Obstacle Avoidance</h3>
                          <p>Powered by active LiDAR and real-time computer vision networks, our drones navigate crowded Indian residential wires, kites, and balcony clothing lines with ease.</p>
                      </div>
      
                      {/* Card 2 */}
                      <div className="feature-card glass-panel reveal reveal-delay-2"  onMouseMove={(e) => tiltCard(e, e.currentTarget)}  onMouseLeave={(e) => resetCard(e.currentTarget)}>
                          <div className="feature-card-glow" style={{ background: "var(--primary-gradient)" }}></div>
                          <div className="feature-icon-wrapper feature-icon-2">
                              <ThermometerSun />
                          </div>
                          <h3>Active Induction Pods</h3>
                          <p>Designed with micro-induction coils that radiate heat and custom vents that allow steam condensation to escape. Your crispy dosa stays exactly 100% crispy, never soggy.</p>
                      </div>
      
                      {/* Card 3 */}
                      <div className="feature-card glass-panel reveal reveal-delay-3"  onMouseMove={(e) => tiltCard(e, e.currentTarget)}  onMouseLeave={(e) => resetCard(e.currentTarget)}>
                          <div className="feature-card-glow" style={{ background: "var(--accent-gradient)" }}></div>
                          <div className="feature-icon-wrapper feature-icon-3">
                              <Zap />
                          </div>
                          <h3>Hyperlocal Launchers</h3>
                          <p>Dispatched from dynamic rooftop micro-hubs spread across urban neighborhoods. Once ordered, the nearest drone launches in 45 seconds with direct-to-coordinate routing.</p>
                      </div>
      
                  </div>
              </div>
          </section>
      
          {/* ==========================================
             INTERACTIVE DOSA CONFIGURATOR / "BUILD YOUR FLIGHT"
             ========================================== */}
          <section className="section-padding" id="configurator">
              <div className="container">
                  <div className="section-header reveal">
                      <span className="badge">Telemetry Console</span>
                      <h2 className="section-title">Customize <span>Your Flight</span></h2>
                      <p className="section-desc">Tune your dosa specifications, calibrate the flight dynamics, and calculate telemetry estimates prior to orbital delivery launch.</p>
                  </div>
      
                  {/* Glass Configurator Box */}
                  <div className="configurator-panel glass-panel reveal">
                      
                      {/* Left: Controls */}
                      <div className="config-controls">
                          {/* Step 1: Base */}
                          <div>
                              <h4 className="config-group-title"><Activity /> 1. Select Dosa Base</h4>
                              <div className="options-grid">
                                  <div className="option-chip selected"  onClick={(e) => selectOption('base', e.currentTarget, 'Masala Dosa', 120)}>
                                      <span className="option-icon">🥔</span>
                                      <span className="option-name">Masala Dosa</span>
                                      <span className="option-price">₹120</span>
                                  </div>
                                  <div className="option-chip"  onClick={(e) => selectOption('base', e.currentTarget, 'Ghee Roast', 140)}>
                                      <span className="option-icon">🧈</span>
                                      <span className="option-name">Ghee Roast</span>
                                      <span className="option-price">₹140</span>
                                  </div>
                                  <div className="option-chip"  onClick={(e) => selectOption('base', e.currentTarget, 'Cheese Chilli', 160)}>
                                      <span className="option-icon">🧀</span>
                                      <span className="option-name">Cheese Chilli</span>
                                      <span className="option-price">₹160</span>
                                  </div>
                              </div>
                          </div>
      
                          {/* Step 2: Chutney Payload */}
                          <div>
                              <h4 className="config-group-title"><Droplet /> 2. Chutney Calibration</h4>
                              <div className="options-grid">
                                  <div className="option-chip selected"  onClick={(e) => selectOption('chutney', e.currentTarget, 'Classic Trio', 0)}>
                                      <span className="option-icon">🥥</span>
                                      <span className="option-name">Classic Trio</span>
                                      <span className="option-price">+₹0</span>
                                  </div>
                                  <div className="option-chip"  onClick={(e) => selectOption('chutney', e.currentTarget, 'Gunpowder Ghee', 30)}>
                                      <span className="option-icon">🌶️</span>
                                      <span className="option-name">Podi & Ghee</span>
                                      <span className="option-price">+₹30</span>
                                  </div>
                                  <div className="option-chip"  onClick={(e) => selectOption('chutney', e.currentTarget, 'Double Sambar', 15)}>
                                      <span className="option-icon">🥣</span>
                                      <span className="option-name">Extra Sambar</span>
                                      <span className="option-price">+₹15</span>
                                  </div>
                              </div>
                          </div>
      
                          {/* Step 3: Speed & Altitude slider */}
                          <div className="slider-wrapper">
                              <div className="slider-header">
                                  <span className="slider-lbl">Drone Delivery Propulsion</span>
                                  <span className="slider-val" id="speedVal">{speedValText}</span>
                              </div>
                              <input type="range" className="custom-range" id="speedSlider" min="30" max="90" value={flightSpeed} onInput={(e) => updateSpeed(e.target.value)} />
                              
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                                  <span>Eco Mode (Standard)</span>
                                  <span>Sonic Jetstream (Hyper-Fast)</span>
                              </div>
                          </div>
                      </div>
      
                      {/* Right: Preview Display */}
                      <div className="config-preview-panel">
                          <div>
                              <h4 className="config-group-title" style={{ marginBottom: "1.25rem" }}><Gauge /> Flight Telemetry</h4>
                              
                              {/* Mini Flight Map Simulation */}
                              <div className="flight-tracker-map">
                                  <div className="radar-sweep-map"></div>
                                  <svg className="flight-path-svg">
                                      <path id="flightPath" d="M 30 110 Q 120 20 220 110" fill="none" stroke="rgba(0, 242, 254, 0.3)" strokeWidth="2" strokeDasharray="5,5"/>
                                  </svg>
                                  {/* Animated drone cursor */}
                                  <div className="map-drone-marker" id="mapDrone" ref={mapDroneRef} style={{ left: "30px", top: "95px" }}>
                                      <Navigation2 />
                                  </div>
                              </div>
      
                              {/* Stats Rows */}
                              <div className="preview-summary">
                                  <div className="preview-stat-row">
                                      <span className="psr-lbl">Calibrated Payload</span>
                                      <span className="psr-val" id="summaryPayload">{summaryPayload}</span>
                                  </div>
                                  <div className="preview-stat-row">
                                      <span className="psr-lbl">Calculated Flight Time</span>
                                      <span className="psr-val" id="summaryTime">{summaryTime}</span>
                                  </div>
                                  <div className="preview-stat-row">
                                      <span className="psr-lbl">Thermal Integrity</span>
                                      <span className="psr-val val-orange">99.4% Crispy</span>
                                  </div>
                              </div>
                          </div>
      
                          {/* Total cost */}
                          <div className="preview-total">
                              <span className="total-price" id="summaryTotal">{summaryTotal}</span>
                              <button className="btn btn-primary btn-pricing" style={{ width: "100%" }}  onClick={openOrderModal}>
                                  <Send />
                                  Initiate Launch
                              </button>
                          </div>
                      </div>
      
                  </div>
              </div>
          </section>
      
          {/* ==========================================
             PRICING SECTION
             ========================================== */}
          <section className="section-padding" id="pricing">
              <div className="container">
                  <div className="section-header reveal">
                      <span className="badge badge-cyan">Affordable Subscriptions</span>
                      <h2 className="section-title">Calibrated <span>Pricing Models</span></h2>
                      <p className="section-desc">Whether you want a quick instant-breakfast flight or high-frequency automated delivery, we have optimized plans for your appetite.</p>
                  </div>
      
                  <div className="pricing-grid">
                      
                      {/* Plan 1 */}
                      <div className="pricing-card glass-panel reveal reveal-delay-1">
                          <div className="pricing-header">
                              <h3 className="plan-title">Single Launch</h3>
                              <p className="plan-desc">Best for immediate cravings and one-off premium breakfast launches.</p>
                              <div className="pricing-rate">
                                  <span className="rate-currency">₹</span>
                                  <span className="rate-price">149</span>
                                  <span className="rate-period">/ flight</span>
                              </div>
                          </div>
      
                          <ul className="pricing-features-list">
                              <li><Check /> Standard Drone Dispatch</li>
                              <li><Check /> 1 Dosa Payload Limit</li>
                              <li><Check /> 65°C Thermal-Insulated Pod</li>
                              <li><Check /> Live Satellite Flight Tracking</li>
                              <li style={{ color: "var(--text-dim)", textDecoration: "line-through" }}><X /> Priority Rooftop Launch Clearances</li>
                          </ul>
      
                          <button className="btn btn-secondary btn-pricing"  onClick={openOrderModal}>Launch Ride</button>
                      </div>
      
                      {/* Plan 2 (Popular / Gold) */}
                      <div className="pricing-card glass-panel pricing-card-popular reveal reveal-delay-2">
                          <div className="pricing-popular-banner">Most Popular</div>
                          <div className="pricing-header">
                              <h3 className="plan-title">AirDosa Gold</h3>
                              <p className="plan-desc">For true South Indian food tech aficionados demanding daily crisps.</p>
                              <div className="pricing-rate">
                                  <span className="rate-currency">₹</span>
                                  <span className="rate-price">899</span>
                                  <span className="rate-period">/ month</span>
                              </div>
                          </div>
      
                          <ul className="pricing-features-list">
                              <li><Check /> Unlimited Free Deliveries</li>
                              <li><Check /> 2x Heavy-Payload Drones</li>
                              <li><Check /> Active Heat Pod Control (65°C - 80°C)</li>
                              <li><Check /> Priority Air-Traffic Slots</li>
                              <li><Check /> Experimental &quot;Cyber-Masala&quot; Menu Access</li>
                          </ul>
      
                          <button className="btn btn-primary btn-pricing"  onClick={openOrderModal}>Get AirDosa Gold</button>
                      </div>
      
                  </div>
              </div>
          </section>
      
          {/* ==========================================
             FOOTER
             ========================================== */}
          <footer className="footer">
              <div className="container">
                  <div className="footer-grid">
                      
                      {/* Col 1: Brand */}
                      <div className="footer-brand">
                          <a href="#" className="footer-logo">
                              <Navigation />
                              Air<span>Dosa</span>
                          </a>
                          <p>Next-generation aerospace food technology bringing hot crispy dosas right to your balcony within minutes.</p>
                      </div>
      
                      {/* Col 2: Navigation Links */}
                      <div>
                          <h5 className="footer-title">Flight Hub</h5>
                          <ul className="footer-links">
                              <li><a href="#features">Aerospace Features</a></li>
                              <li><a href="#configurator">Flight Customizer</a></li>
                              <li><a href="#pricing">Launch Pricing</a></li>
                          </ul>
                      </div>
      
                      {/* Col 3: Safety & Tech */}
                      <div>
                          <h5 className="footer-title">Technology</h5>
                          <ul className="footer-links">
                              <li><a href="#">Obstacle LiDAR AI</a></li>
                              <li><a href="#">Thermal Preservation</a></li>
                              <li><a href="#">Safety & Regulations</a></li>
                          </ul>
                      </div>
      
                      {/* Col 4: Newsletter */}
                      <div className="footer-newsletter">
                          <h5 className="footer-title">Telemetry Updates</h5>
                          <p>Subscribe to our grid logs for new local launchpads and exclusive discounts.</p>
                          <form className="newsletter-form"  onSubmit="event.preventDefault(); alert('Subscribed to flight logs successfully!');">
                              <input type="email" className="newsletter-input" placeholder="Enter security-auth email..." required />
                              <button type="submit" className="btn-newsletter" aria-label="Subscribe to updates">
                                  <ArrowRight />
                              </button>
                          </form>
                      </div>
      
                  </div>
      
                  <div className="footer-bottom">
                      <p className="copyright">&copy; 2026 AirDosa Tech Labs Inc. All orbital coordinates protected. Made with crispiness.</p>
                      <div className="footer-socials">
                          <a href="#" className="social-link" aria-label="Bird"><Bird /></a>
                          <a href="#" className="social-link" aria-label="Camera"><Camera /></a>
                          <a href="#" className="social-link" aria-label="GitHub"><Code2 /></a>
                      </div>
                  </div>
              </div>
          </footer>
      
          {/* ==========================================
             FLOATING "ORDER NOW" BUTTON
             ========================================== */}
          <button className="floating-order-btn"  onClick={openOrderModal} aria-label="Quick order panel">
              <Navigation />
              Order Now
          </button>
      
          {/* ==========================================
             FLIGHT CONTROL CENTER / ORDER MODAL
             ========================================== */}
          <div className={`modal-overlay${orderModalActive ? " active" : ""}`} id="orderModal"  onClick={closeOrderModalOutside}>
              <div className="modal-content glass-panel">
                  <button className="modal-close"  onClick={closeOrderModal} aria-label="Close modal">
                      <X />
                  </button>
                  
                  <h3 className="modal-title">Flight Control <span>Center</span></h3>
                  
                  {/* Telemetry screen inside modal */}
                  <div className="dashboard-grid">
                      
                      <div className="db-card db-card-1">
                          <div className="db-card-icon"><Satellite /></div>
                          <div className="db-card-info">
                              <span className="db-lbl">Satellite Uplink</span>
                              <span className="db-val" id="telemetryGPS">{telemetryGPS}</span>
                          </div>
                      </div>
      
                      <div className="db-card db-card-2">
                          <div className="db-card-icon"><BatteryCharging /></div>
                          <div className="db-card-info">
                              <span className="db-lbl">Drone Battery</span>
                              <span className="db-val" id="telemetryBattery">{telemetryBattery}</span>
                          </div>
                      </div>
      
                      <div className="db-card db-card-3">
                          <div className="db-card-icon"><Compass /></div>
                          <div className="db-card-info">
                              <span className="db-lbl">Wind Drift</span>
                              <span className="db-val" id="telemetryWind">{telemetryWind}</span>
                          </div>
                      </div>
      
                      <div className="db-card db-card-4">
                          <div className="db-card-icon"><Flame /></div>
                          <div className="db-card-info">
                              <span className="db-lbl">Core Tava Temp</span>
                              <span className="db-val" id="telemetryTemp">{telemetryTemp}</span>
                          </div>
                      </div>
      
                  </div>
      
                  {/* Delivery Progress Animation UI */}
                  <div className="progress-container">
                      <div className="progress-header">
                          <span className="progress-status" id="progressStatusText"><StatusIcon className={status.className} style={status.style} /> {status.text}</span>
                          <span className="progress-time" id="progressTimeText">{progressTimeText}</span>
                      </div>
                      <div className="progress-track">
                          <div className="progress-fill" id="progressBar" style={{ width: progressWidth }}></div>
                      </div>
                  </div>
      
                  {/* Form/Launch Trigger Button */}
                  <div className="modal-form-area" id="modalFormArea">
                      <p style={{ textAlign: "center", marginBottom: "2rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                          Confirming will assign the nearest quadcopter drone to compile and carry your selected dosa payload straight to your geo-coordinates.
                      </p>
                      <button className="btn btn-primary btn-launch-final" id="launchBtn" onClick={runSimulatedFlight} disabled={launchDisabled} style={{ opacity: launchOpacity }}>{launchButtonMode === "launching" ? "Launching Drone..." : (<><Rocket /> Initialize Launch Sequence</>)}</button>
                  </div>
              </div>
          </div>
    </>
  );
}
