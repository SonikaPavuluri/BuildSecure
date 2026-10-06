import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, ShieldCheck, UserCheck, Search, PlusCircle, 
  Clock, CheckCircle2, AlertCircle, ArrowRight, Bot, Send, 
  MapPin, RefreshCw, X, Sparkles, Navigation, Phone, Calendar,
  ArrowUpRight, Check, Printer, KeyRound, ShieldAlert,
  Compass, Radio, Lock, LogOut, Cpu, Activity, Signal, Bell,
  User, Key
} from 'lucide-react';

const GPS_ROUTES = {
  "ST-849201": {
    origin: { name: "Coimbatore Logistics Hub", lat: 11.0168, lng: 76.9558 },
    destination: { name: "Bengaluru Tech Park, KA", lat: 12.9716, lng: 77.5946 },
    waypoints: [
      { name: "Coimbatore Origin Terminal", lat: 11.0168, lng: 76.9558, progress: 0 },
      { name: "Tiruppur Bypass Expressway", lat: 11.1085, lng: 77.3411, progress: 20 },
      { name: "Salem Toll Plaza & Sorting Hub", lat: 11.6643, lng: 78.1460, progress: 48 },
      { name: "Dharmapuri Corridor Transit Point", lat: 12.1211, lng: 78.1582, progress: 70 },
      { name: "Hosur Border Inter-State Depot", lat: 12.7409, lng: 77.8253, progress: 90 },
      { name: "Bengaluru Tech Park Delivery Gate", lat: 12.9716, lng: 77.5946, progress: 100 }
    ],
    totalDistanceKm: 365
  },
  "ST-592184": {
    origin: { name: "Chennai Central Hub", lat: 13.0827, lng: 80.2707 },
    destination: { name: "Madurai South, TN", lat: 9.9252, lng: 78.1198 },
    waypoints: [
      { name: "Chennai Sorting Facility", lat: 13.0827, lng: 80.2707, progress: 0 },
      { name: "Villupuram Highway Junction", lat: 11.9401, lng: 79.4861, progress: 35 },
      { name: "Trichy Tollway Bypass Hub", lat: 10.7905, lng: 78.7047, progress: 68 },
      { name: "Madurai Ring Road Hub", lat: 9.9252, lng: 78.1198, progress: 95 },
      { name: "Madurai South Doorstep Destination", lat: 9.9252, lng: 78.1198, progress: 100 }
    ],
    totalDistanceKm: 460
  }
};

const INITIAL_SHIPMENTS = [
  {
    id: "ST-849201",
    sender: "Rahul Sharma",
    senderId: "cust_1",
    receiver: "Anita Roy",
    receiverPhone: "+91 98451 22345",
    origin: "Coimbatore Logistics Hub",
    destination: "Bengaluru Tech Park, KA",
    status: "IN_TRANSIT",
    routeKey: "ST-849201",
    progressPct: 48,
    speedKmph: 64,
    vehicleReg: "TN-38-BZ-4921",
    assignedDriver: "Karthik Raja (Vehicle Unit 04)",
    deliveryOtp: "4821",
    telemetryMode: "AUTOMATED_GPS_SAT",
    lastPing: "Active (2s ago)",
    satellitesActive: 9
  },
  {
    id: "ST-592184",
    sender: "Rahul Sharma",
    senderId: "cust_1",
    receiver: "Kavita Nair",
    receiverPhone: "+91 94432 99011",
    origin: "Chennai Central Hub",
    destination: "Madurai South, TN",
    status: "OUT_FOR_DELIVERY",
    routeKey: "ST-592184",
    progressPct: 95,
    speedKmph: 28,
    vehicleReg: "TN-58-AX-9912",
    assignedDriver: "Suresh Babu (Electric Van 02)",
    deliveryOtp: "9102",
    telemetryMode: "AUTOMATED_GPS_SAT",
    lastPing: "Active (1s ago)",
    satellitesActive: 11
  }
];

export default function App() {
  // Authentication State (null = not logged in)
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  
  // Login Form States
  const [loginRole, setLoginRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'DELIVERY' | 'ADMIN'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(1800);

  // Application Data States
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [searchTrackingId, setSearchTrackingId] = useState('ST-849201');
  const [searchedShipment, setSearchedShipment] = useState(INITIAL_SHIPMENTS[0]);
  const [searchError, setSearchError] = useState(false);

  // Proximity Alert Toast State (5 km proximity notification)
  const [proximityAlert, setProximityAlert] = useState(null);

  // Handover Modal State
  const [handoverModalShipment, setHandoverModalShipment] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [securityError, setSecurityError] = useState('');

  // AI Assistant Chat State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: '🔒 Secure GPS Telemetry Assistant initialized. Ask for real-time coordinates or ETA for ST-849201.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // 1. Continuous Automated GPS Telemetry Engine (No Manual Courier Clicks Required)
  useEffect(() => {
    if (!authenticatedUser) return;

    const timer = setInterval(() => {
      setShipments(prevShipments => 
        prevShipments.map(item => {
          if (item.status === 'DELIVERED') return item;

          let nextProgress = item.progressPct + 0.15;
          let currentStatus = item.status;

          if (nextProgress >= 100) {
            nextProgress = 100;
          } else if (nextProgress >= 90 && currentStatus === 'IN_TRANSIT') {
            currentStatus = 'OUT_FOR_DELIVERY';
          }

          const varianceSpeed = Math.floor(55 + Math.sin(Date.now() / 2000) * 12);
          const updatedProgress = Math.min(100, parseFloat(nextProgress.toFixed(2)));

          // Check for 5 km proximity
          const route = GPS_ROUTES[item.routeKey];
          if (route) {
            const distanceRemainingKm = Math.max(0, Math.round(route.totalDistanceKm * (1 - updatedProgress / 100)));
            if (distanceRemainingKm <= 5 && distanceRemainingKm > 0 && !proximityAlert) {
              setProximityAlert({
                shipmentId: item.id,
                distanceRemainingKm,
                message: `Delivery vehicle for consignment ${item.id} is now ${distanceRemainingKm} km from your destination doorstep!`
              });
            }
          }

          return {
            ...item,
            progressPct: updatedProgress,
            status: currentStatus,
            speedKmph: updatedProgress >= 100 ? 0 : (updatedProgress >= 90 ? 28 : varianceSpeed),
            lastPing: 'Active (< 1s ago)'
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, [authenticatedUser, proximityAlert]);
  // Keep inspected shipment view synced with live telemetry
  useEffect(() => {
    if (searchedShipment) {
      const live = shipments.find(s => s.id === searchedShipment.id);
      if (live) setSearchedShipment(live);
    }
  }, [shipments]);

  // Session timer countdown
  useEffect(() => {
    if (!authenticatedUser) return;
    const sessionTimer = setInterval(() => {
      setSessionTimeRemaining(prev => {
        if (prev <= 1) {
          setAuthenticatedUser(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(sessionTimer);
  }, [authenticatedUser]);

  // Compute Current Geodetic Location
  const getCurrentLocationData = (shipment) => {
    const route = GPS_ROUTES[shipment.routeKey];
    if (!route) return { name: shipment.origin, lat: 0, lng: 0, distanceRemainingKm: 0, completedKm: 0, totalDistanceKm: 0 };

    const pct = shipment.progressPct;
    const waypoints = route.waypoints;
    
    let currentWp = waypoints[0];
    for (let i = 0; i < waypoints.length; i++) {
      if (pct >= waypoints[i].progress) {
        currentWp = waypoints[i];
      }
    }

    const distanceRemainingKm = Math.max(0, Math.round(route.totalDistanceKm * (1 - pct / 100)));
    return {
      currentCheckpointName: currentWp.name,
      lat: (currentWp.lat + (pct % 5) * 0.002).toFixed(4),
      lng: (currentWp.lng + (pct % 5) * 0.002).toFixed(4),
      distanceRemainingKm,
      completedKm: Math.round(route.totalDistanceKm * (pct / 100)),
      totalDistanceKm: route.totalDistanceKm
    };
  };

  // Login Authentication Handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }

    const sessionToken = 'SHP-SEC-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    if (loginRole === 'CUSTOMER') {
      setAuthenticatedUser({ id: 'cust_1', name: username, role: 'CUSTOMER', sessionToken });
    } else if (loginRole === 'DELIVERY') {
      setAuthenticatedUser({ id: 'drv_1', name: username || 'Karthik Raja', role: 'DELIVERY', sessionToken });
    } else {
      setAuthenticatedUser({ id: 'adm_1', name: username || 'Logistics Admin', role: 'ADMIN', sessionToken });
    }

    setSessionTimeRemaining(1800);
    setLoginError('');
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setUsername('');
    setPassword('');
    setProximityAlert(null);
  };

  // Preset Credentials Helper
  const fillPreset = (roleType, defaultName) => {
    setLoginRole(roleType);
    setUsername(defaultName);
    setPassword('securepass123');
    setLoginError('');
  };

  // Search Consignment Handler
  const handleSearch = (idToSearch) => {
    const query = (typeof idToSearch === 'string' ? idToSearch : searchTrackingId).trim().toUpperCase();
    if (!query) return;

    const found = shipments.find(s => s.id === query);
    if (found) {
      setSearchedShipment(found);
      setSearchError(false);
    } else {
      setSearchedShipment(null);
      setSearchError(true);
    }
  };

  // Security Handover Verification (Geofence + Handover OTP)
  const handleVerifyAndDeliver = (shipment) => {
    const loc = getCurrentLocationData(shipment);
    
    if (loc.distanceRemainingKm > 5 && shipment.progressPct < 90) {
      setSecurityError(`Geofence Lock Active: Vehicle is ${loc.distanceRemainingKm} km away. Delivery cannot be completed until the vehicle enters the destination geofence.`);
      return;
    }

    if (enteredOtp.trim() !== shipment.deliveryOtp) {
      setSecurityError(`Authentication Denied: Invalid recipient OTP. Please verify with the customer.`);
      return;
    }

    setShipments(shipments.map(s => {
      if (s.id === shipment.id) {
        return {
          ...s,
          status: 'DELIVERED',
          progressPct: 100,
          speedKmph: 0
        };
      }
      return s;
    }));
    setHandoverModalShipment(null);
    setEnteredOtp('');
    setSecurityError('');
  };

  // Grounded AI Query Parser
  const handleSendAiMessage = (queryText) => {
    const text = (queryText || chatInput).trim();
    if (!text) return;

    const newChat = [...chatMessages, { sender: 'user', text }];
    setChatMessages(newChat);
    setChatInput('');

    setTimeout(() => {
      const match = text.match(/ST-\d{6}/i);
      let reply = "";
      if (match) {
        const found = shipments.find(s => s.id.toUpperCase() === match[0].toUpperCase());
        if (found) {
          const loc = getCurrentLocationData(found);
          reply = `🛰️ **Live Automated GPS Telemetry (${found.id})**:\n` +
                  `• Status: **${found.status.replace(/_/g, ' ')}**\n` +
                  `• Geodetic Fix: ${loc.lat}° N, ${loc.lng}° E\n` +
                  `• Current Waypoint: **${loc.currentCheckpointName}**\n` +
                  `• Live Velocity: ${found.speedKmph} km/h (Active Telemetry)\n` +
                  `• Route Progress: ${loc.completedKm} km / ${loc.totalDistanceKm} km (${found.progressPct}%)\n` +
                  `• Distance to Destination: **${loc.distanceRemainingKm} km remaining**\n` +
                  `• Satellite Fix: Connected (${found.satellitesActive} DGPS Satellites)`;
        } else {
          reply = `⚠️ Access Guard: Consignment "${match[0]}" is not registered in the active database.`;
        }
      } else {
        reply = `I am grounded in live GPS telemetry. Ask *"Where is ST-849201?"* or check satellite fix status.`;
      }
      setChatMessages([...newChat, { sender: 'bot', text: reply }]);
    }, 300);
  };

  const activeLoc = searchedShipment ? getCurrentLocationData(searchedShipment) : null;

  // =========================================================================
  // SCREEN 0: AUTHENTICATION / LOGIN GATEWAY SCREEN
  // =========================================================================
  if (!authenticatedUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 mb-2">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">ShipTrack Security Portal</h1>
            <p className="text-xs text-slate-400">Automated Vehicle Satellite Telemetry & Access Control</p>
          </div>

          {/* Role Picker Buttons */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-slate-400 uppercase">Select Access Portal Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLoginRole('CUSTOMER')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-1 border ${
                  loginRole === 'CUSTOMER'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('DELIVERY')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-1 border ${
                  loginRole === 'DELIVERY'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Delivery Person</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('ADMIN')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-1 border ${
                  loginRole === 'ADMIN'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Username / Identifier</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder={loginRole === 'CUSTOMER' ? 'e.g. Rahul Sharma' : (loginRole === 'DELIVERY' ? 'e.g. Karthik Raja' : 'e.g. Admin Supervisor')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 font-mono transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 font-mono transition"
                />
              </div>
            </div>
            {loginError && (
              <div className="text-[11px] text-red-400 bg-red-950/60 border border-red-800 p-2.5 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate & Enter {loginRole.replace('_', ' ')} Portal</span>
            </button>
          </form>

          {/* Quick Demo Autofill Chips */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 block mb-2 font-mono">1-Click Demo Credentials:</span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillPreset('CUSTOMER', 'Rahul Sharma')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300"
              >
                Customer Demo
              </button>
              <button
                type="button"
                onClick={() => fillPreset('DELIVERY', 'Karthik Raja')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300"
              >
                Delivery Person Demo
              </button>
              <button
                type="button"
                onClick={() => fillPreset('ADMIN', 'Logistics Supervisor')}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300"
              >
                Admin Demo
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED APPLICATION INTERFACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 5 KM PROXIMITY NOTIFICATION TOAST BANNER */}
      {proximityAlert && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-3 shadow-2xl flex items-center justify-between border-b border-amber-400 sticky top-0 z-50 animate-pulse">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-white animate-bounce" />
              <div className="text-xs">
                <span className="font-black uppercase tracking-wider font-mono mr-2">🔔 5 KM PROXIMITY ALERT:</span>
                <span>{proximityAlert.message} (Recipient Handover OTP: <strong>{searchedShipment?.deliveryOtp}</strong>)</span>
              </div>
            </div>
            <button
              onClick={() => setProximityAlert(null)}
              className="bg-black/20 hover:bg-black/40 text-white rounded-lg p-1 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER & ROLE STATUS */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
              <Navigation className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">ShipTrack</span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full">
                  GPS-TELEMETRY • PS-05
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Automated Vehicle Satellite Tracking & Security</p>
            </div>
          </div>

          {/* ACTIVE USER SESSION BADGE & LOGOUT */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-[11px] font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Token: <strong className="text-slate-200">{authenticatedUser.sessionToken.slice(0, 14)}...</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400">{Math.floor(sessionTimeRemaining / 60)}m left</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-400">{authenticatedUser.name}</span>
              <span className="text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded-md">
                {authenticatedUser.role.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>
      /* SATELLITE STATUS BAR */
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>DGPS 3D FIX ACTIVE</span>
            </span>
            <span>•</span>
            <span className="text-slate-300">Continuous GNSS Hardware Telemetry</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">Zero Manual Courier Checkpoints Needed</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
            <Signal className="w-3.5 h-3.5 text-cyan-400" />
            <span>NMEA 0183 Protocol • 1.0 Hz Ping</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER (LOADS VIEW ACCORDING TO AUTHENTICATED ROLE) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* =========================================================================
            ROLE 1: CUSTOMER VIEW (MATCHES IMAGE 1 & IMAGE 2)
            ========================================================================= */}
        {authenticatedUser.role === 'CUSTOMER' && (
          <div className="space-y-6">
            
            {/* Search Bar + Quick Telemetry Chips */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchTrackingId}
                    onChange={(e) => setSearchTrackingId(e.target.value)}
                    placeholder="Enter Tracking Consignment ID (e.g. ST-849201)"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-cyan-600/20"
                >
                  Query Satellite Radar
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500 font-mono">Live Units on Transit:</span>
                  {shipments.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSearchTrackingId(s.id);
                        handleSearch(s.id);
                      }}
                      className={`px-3 py-1 rounded-lg border font-mono transition ${
                        searchedShipment?.id === s.id
                          ? 'bg-cyan-950 border-cyan-700 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.id} • {s.status.replace(/_/g, ' ')} ({s.progressPct}%)
                    </button>
                  ))}
                </div>

                {/* Instant 5 km Notification Trigger Button for Live Demo */}
                <button
                  onClick={() => {
                    setProximityAlert({
                      shipmentId: searchedShipment.id,
                      distanceRemainingKm: 4.8,
                      message: `Delivery vehicle for consignment ${searchedShipment.id} is now 4.8 km from your destination doorstep!`
                    });
                  }}
                  className="bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-300 px-3 py-1 rounded-lg font-mono text-[11px] flex items-center space-x-1"
                >
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>Simulate 5 km Doorstep Alert</span>
                </button>
              </div>
            </div>

            {searchError && (
              <div className="bg-red-950/60 border border-red-800 p-4 rounded-xl text-red-300 text-sm flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span>Access Denied: Consignment "{searchTrackingId}" was not found in GNSS telemetry registry.</span>
              </div>
            )}

            {/* SCREEN 1 & 2: SATELLITE RADAR & AUTOMATED CHECKPOINT AUDIT LOG */}
            {searchedShipment && activeLoc && (
              <div className="space-y-6">
                
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  
                  {/* Card Header (Matches Image 1) */}
                  <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-900/80">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-black font-mono tracking-tight text-white">{searchedShipment.id}</h2>
                        <span className="bg-cyan-950 text-cyan-400 border border-cyan-800/80 text-xs px-2.5 py-1 rounded-full font-bold">
                          {searchedShipment.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Vehicle Unit: <strong className="text-slate-200">{searchedShipment.vehicleReg}</strong> • Hardware GPS Transponder</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Recipient Verification OTP</span>
                        <span className="text-base font-mono font-black text-cyan-400 tracking-widest">{searchedShipment.deliveryOtp}</span>
                      </div>
                    </div>
                  </div>

                  {/* LIVE GEODETIC HIGHWAY RADAR TRACK (Matches Image 1) */}
                  <div className="p-6 bg-slate-950 space-y-6 border-b border-slate-800">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span className="text-xs font-mono font-bold uppercase text-slate-300">Live Geodetic Highway Radar</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                        ● GPS Live: {searchedShipment.speedKmph} km/h
                      </span>
                    </div>

                    <div className="relative py-4">
                      <div className="h-2 bg-slate-800 rounded-full w-full"></div>
                      
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 rounded-full absolute top-4 left-0 transition-all duration-700 shadow-lg shadow-cyan-500/50"
                        style={{ width: `${searchedShipment.progressPct}%` }}
                      ></div>

                      <div 
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 z-10 flex flex-col items-center"
                        style={{ left: `${searchedShipment.progressPct}%` }}
                      >
                        <div className="bg-cyan-500 text-slate-950 p-2 rounded-full shadow-xl shadow-cyan-500/80 ring-4 ring-cyan-950 animate-bounce">
                          <Truck className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Current Waypoint</span>
                        <span className="text-xs font-bold text-white mt-0.5 block truncate">{activeLoc.currentCheckpointName}</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Satellite Coordinates</span>
                        <span className="text-xs font-mono text-cyan-400 mt-0.5 block">{activeLoc.lat}° N, {activeLoc.lng}° E</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Distance Traversed</span>
                        <span className="text-xs font-bold text-white mt-0.5 block">{activeLoc.completedKm} km / {activeLoc.totalDistanceKm} km</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Remaining to Destination</span>
                        <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{activeLoc.distanceRemainingKm} km remaining</span>
                      </div>
                    </div>
                  </div>

                  {/* AUTOMATED HIGHWAY CHECKPOINT LOG (Matches Image 2) */}
                  <div className="p-6 bg-slate-900">
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>Automated Highway Checkpoint Log (Hardware GPS Verified)</span>
                    </h3>

                    <div className="space-y-4">
                      {GPS_ROUTES[searchedShipment.routeKey]?.waypoints.map((wp, index) => {
                        const isReached = searchedShipment.progressPct >= wp.progress;
                        return (
                          <div key={index} className="flex items-start space-x-3 text-xs">
                            <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] ${
                              isReached ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {isReached ? '✓' : index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className={`font-semibold ${isReached ? 'text-white' : 'text-slate-500'}`}>{wp.name}</span>
                                <span className="font-mono text-[11px] text-slate-500">{wp.lat}° N, {wp.lng}° E</span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                {isReached ? 'Passed via satellite geofence' : 'Upcoming highway waypoint'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
        {/* =========================================================================
            ROLE 2: DELIVERY PERSON VIEW (MATCHES IMAGE 3)
            ========================================================================= */}
        {authenticatedUser.role === 'DELIVERY' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400">Driver Telemetry Console</span>
                <h3 className="text-xl font-bold text-white mt-1">Operator: {authenticatedUser.name}</h3>
                <p className="text-xs text-slate-400">Hardware GPS Unit Active • Automated Location Broadcast</p>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full">
                OBD-II Telemetry Synced
              </span>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Active Delivery Vehicles & Shipments</h4>
              
              {shipments.map(shipment => {
                const loc = getCurrentLocationData(shipment);
                return (
                  <div key={shipment.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-white text-base">{shipment.id}</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                          {shipment.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">To: <strong className="text-slate-200">{shipment.receiver}</strong> ({shipment.destination})</p>
                      <p className="text-xs font-mono text-cyan-400">
                        GPS Fix: {loc.lat}° N, {loc.lng}° E ({loc.distanceRemainingKm} km to recipient geofence)
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setHandoverModalShipment(shipment);
                        setEnteredOtp('');
                        setSecurityError('');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Verify & Complete Handover</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ROLE 3: ADMIN FLEET OVERSIGHT (MATCHES IMAGE 4)
            ========================================================================= */}
        {authenticatedUser.role === 'ADMIN' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 font-mono">Active Satellite Pings</span>
                <p className="text-2xl font-black font-mono text-white mt-1">{shipments.length} Units</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 font-mono">Telemetry Protocol</span>
                <p className="text-2xl font-black font-mono text-cyan-400 mt-1">GNSS DGPS</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 font-mono">Geofence Violations</span>
                <p className="text-2xl font-black font-mono text-emerald-400 mt-1">0 Blocked</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 font-mono">Encryption Status</span>
                <p className="text-2xl font-black font-mono text-purple-400 mt-1">AES-GCM</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 font-mono text-xs font-bold text-slate-300">
                Master Automated GNSS Telemetry Ledger
              </div>
              <table className="w-full text-left text-xs font-mono text-slate-400">
                <thead className="bg-slate-950 text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Consignment ID</th>
                    <th className="p-3">Vehicle Plate</th>
                    <th className="p-3">Current Coordinates</th>
                    <th className="p-3">Speed</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Security State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {shipments.map(s => {
                    const loc = getCurrentLocationData(s);
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{s.id}</td>
                        <td className="p-3 text-cyan-400">{s.vehicleReg}</td>
                        <td className="p-3">{loc.lat}° N, {loc.lng}° E</td>
                        <td className="p-3 text-emerald-400">{s.speedKmph} km/h</td>
                        <td className="p-3">{s.progressPct}%</td>
                        <td className="p-3">
                          <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
                            LOCKED (OTP REQUIRED)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
      {/* SECURITY GEOFENCE & OTP HANDOVER MODAL */}
      {handoverModalShipment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Security Handover Protocol</h3>
              </div>
              <button onClick={() => setHandoverModalShipment(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-mono">Consignment: {handoverModalShipment.id}</span>
                <span className="text-slate-400 block font-mono">Recipient: {handoverModalShipment.receiver}</span>
                <span className="text-emerald-400 block font-mono">
                  Distance to Geofence: {getCurrentLocationData(handoverModalShipment).distanceRemainingKm} km
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Enter Customer Delivery OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit code"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono font-bold text-lg text-cyan-400 tracking-widest focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {securityError && (
                <div className="bg-red-950/80 border border-red-800 p-2.5 rounded-lg text-red-300 text-[11px]">
                  {securityError}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setHandoverModalShipment(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:bg-slate-800"
              >
                Abort
              </button>
              <button
                onClick={() => handleVerifyAndDeliver(handoverModalShipment)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30"
              >
                Cryptographic Handover Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SATELLITE AI ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isAiOpen ? (
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3.5 rounded-full shadow-2xl transition shadow-cyan-600/40"
          >
            <Bot className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wide">Satellite AI</span>
          </button>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[430px] overflow-hidden">
            <div className="bg-cyan-600 text-white p-3.5 flex justify-between items-center text-xs font-bold">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>GPS Telemetry Assistant</span>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs font-mono">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl whitespace-pre-line max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendAiMessage(); }} className="p-2.5 border-t border-slate-800 flex gap-1.5 bg-slate-950">
              <input
                type="text"
                placeholder="Where is ST-849201?..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              />
              <button type="submit" className="bg-cyan-600 text-white p-2.5 rounded-xl hover:bg-cyan-500">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}