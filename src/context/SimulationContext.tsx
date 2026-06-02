"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface Drone {
  id: string;
  name: string;
  status: "Idle" | "Loading" | "In-Flight" | "Hovering" | "Returning";
  battery: number;
  speed: number;
  altitude: number;
  mission: string;
  x: number;
  y: number;
  heading: number;
}

export interface SimulationMetrics {
  activeDrones: number;
  deliveriesToday: number;
  avgDeliveryTime: string;
  thermalPreservation: number;
}

export type OrderStatus = 
  | "Idle"
  | "Prep"
  | "Loading"
  | "Takeoff"
  | "In-Transit"
  | "Hover-Drop"
  | "Delivered";

interface SimulationContextProps {
  fleet: Drone[];
  metrics: SimulationMetrics;
  orderStatus: OrderStatus;
  orderProgress: number;
  orderDronePos: { x: number; y: number };
  startLaunchSequence: (speedVal: number, baseName: string, chutneyName: string) => void;
  resetOrder: () => void;
  orderPayload: { base: string; chutney: string; speed: number };
}

const SimulationContext = createContext<SimulationContextProps | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State for Drone Fleet
  const [fleet, setFleet] = useState<Drone[]>([
    {
      id: "alpha",
      name: "Drone Alpha (UAV-09)",
      status: "In-Flight",
      battery: 88,
      speed: 48,
      altitude: 15,
      mission: "Delivering Masala Dosa to Balcony 4B",
      x: 35,
      y: 65,
      heading: 45,
    },
    {
      id: "beta",
      name: "Drone Beta (UAV-12)",
      status: "Idle",
      battery: 98,
      speed: 0,
      altitude: 0,
      mission: "Awaiting Next Dispatch",
      x: 20,
      y: 80,
      heading: 0,
    },
    {
      id: "gamma",
      name: "Drone Gamma (UAV-15)",
      status: "Returning",
      battery: 42,
      speed: 35,
      altitude: 18,
      mission: "Returning to Hub 2 (Recharge Required)",
      x: 65,
      y: 35,
      heading: 225,
    },
  ]);

  // 2. Initial State for Metrics
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    activeDrones: 2,
    deliveriesToday: 142,
    avgDeliveryTime: "4m 32s",
    thermalPreservation: 99.4,
  });

  // 3. User Active Order Simulation State
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("Idle");
  const [orderProgress, setOrderProgress] = useState(0);
  const [orderDronePos, setOrderDronePos] = useState({ x: 20, y: 80 });
  const [orderPayload, setOrderPayload] = useState({ base: "Masala Dosa", chutney: "Classic Trio", speed: 45 });

  const orderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const smoothMapIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 4. Periodic Telemetry Updates (every 3 seconds)
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      // Randomly tweak non-active drone parameters to feel alive
      setFleet((prevFleet) =>
        prevFleet.map((drone) => {
          if (drone.status === "Idle") {
            // Keep charging slowly
            return {
              ...drone,
              battery: Math.min(100, drone.battery + 1),
            };
          }

          const newBattery = Math.max(5, drone.battery - (drone.status === "In-Flight" ? 1.5 : 0.8));
          let newX = drone.x + (Math.random() - 0.5) * 4;
          let newY = drone.y + (Math.random() - 0.5) * 4;
          
          // Clamp inside 100x100 box
          newX = Math.max(10, Math.min(90, newX));
          newY = Math.max(10, Math.min(90, newY));

          return {
            ...drone,
            battery: parseFloat(newBattery.toFixed(1)),
            x: parseFloat(newX.toFixed(1)),
            y: parseFloat(newY.toFixed(1)),
            speed: drone.status === "In-Flight" ? Math.floor(45 + Math.random() * 10) : drone.speed,
            altitude: drone.status === "In-Flight" ? Math.floor(12 + Math.random() * 4) : drone.altitude,
          };
        })
      );

      // Randomly update metrics
      setMetrics((prev) => ({
        activeDrones: Math.floor(2 + Math.random() * 3),
        deliveriesToday: prev.deliveriesToday + (Math.random() > 0.3 ? 1 : 0),
        avgDeliveryTime: `${4}m ${Math.floor(20 + Math.random() * 20)}s`,
        thermalPreservation: parseFloat((99.1 + Math.random() * 0.7).toFixed(1)),
      }));
    }, 3000);

    return () => clearInterval(telemetryInterval);
  }, []);

  // 5. Quad Bezier interpolation formula for map animations
  const getBezierPoint = (t: number, p0: {x:number, y:number}, p1: {x:number, y:number}, p2: {x:number, y:number}) => {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) };
  };

  // 6. Launch Sequence Handler
  const startLaunchSequence = (speedVal: number, baseName: string, chutneyName: string) => {
    // Reset any ongoing order loops first
    if (orderIntervalRef.current) clearInterval(orderIntervalRef.current);
    if (smoothMapIntervalRef.current) clearInterval(smoothMapIntervalRef.current);

    setOrderPayload({ base: baseName, chutney: chutneyName, speed: speedVal });
    setOrderStatus("Prep");
    setOrderProgress(0);
    setOrderDronePos({ x: 20, y: 80 });

    const p0 = { x: 20, y: 80 }; // Hub Start
    const p1 = { x: 50, y: 20 }; // Control arc point
    const p2 = { x: 80, y: 20 }; // Customer coordinates

    let progress = 0;
    
    // Smooth frame animator for position (updating at 60fps)
    let t = 0;
    smoothMapIntervalRef.current = setInterval(() => {
      if (orderStatus === "In-Transit" || t > 0) {
        t = Math.min(1, t + 0.005 * (speedVal / 45)); // adjust animation speed
        const point = getBezierPoint(t, p0, p1, p2);
        setOrderDronePos(point);
        if (t >= 1) {
          if (smoothMapIntervalRef.current) clearInterval(smoothMapIntervalRef.current);
        }
      }
    }, 30);

    // Major status machine updates (runs every 1.5 - 2 seconds to transition states)
    const states: OrderStatus[] = ["Prep", "Loading", "Takeoff", "In-Transit", "Hover-Drop", "Delivered"];
    let stateIdx = 0;

    orderIntervalRef.current = setInterval(() => {
      progress += 16.6; // Increment roughly 100/6
      stateIdx += 1;
      
      const currentStatus = states[Math.min(stateIdx, states.length - 1)];
      setOrderStatus(currentStatus);
      setOrderProgress(Math.min(100, Math.round(progress)));

      if (currentStatus === "In-Transit") {
        t = 0.05; // Trigger mapping movement
      }

      if (currentStatus === "Delivered") {
        setOrderProgress(100);
        setOrderDronePos(p2);
        if (orderIntervalRef.current) clearInterval(orderIntervalRef.current);
        if (smoothMapIntervalRef.current) clearInterval(smoothMapIntervalRef.current);
      }
    }, 2500);
  };

  // 7. Reset State
  const resetOrder = () => {
    if (orderIntervalRef.current) clearInterval(orderIntervalRef.current);
    if (smoothMapIntervalRef.current) clearInterval(smoothMapIntervalRef.current);
    setOrderStatus("Idle");
    setOrderProgress(0);
    setOrderDronePos({ x: 20, y: 80 });
  };

  return (
    <SimulationContext.Provider
      value={{
        fleet,
        metrics,
        orderStatus,
        orderProgress,
        orderDronePos,
        startLaunchSequence,
        resetOrder,
        orderPayload,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
