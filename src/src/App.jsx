import React, { useState, useEffect, useRef } from 'react';

// Shared Initial Telemetry Consignments
const INITIAL_SHIPMENTS = [
  {
    id: "ST-849201",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98451 22104",
    recipientAddress: "Flat 402, Green Valley Apts, Indiranagar, Bengaluru",
    origin: "Bengaluru Logistics Hub (BLR-NORTH)",
    destination: "Indiranagar Delivery Hub",
    destinationCoords: { lat: 12.9784, lng: 77.6408 },
    currentCoords: { lat: 13.0358, lng: 77.5970 },
    totalDistanceKm: 18.5,
    remainingDistanceKm: 8.4, // Starts outside 5km threshold
    speedKmh: 48,
    status: "IN_TRANSIT",
    otp: "4821",
    etaMinutes: 14,
    assignedCourier: "Vikram Singh (ID: DRV-091)"
  },
  {
    id: "ST-592184",
    customerName: "Ananya Iyer",
    customerPhone: "+91 94432 88190",
    recipientAddress: "Plot 18, Cross Cut Road, Gandhipuram, Coimbatore",
    origin: "Coimbatore Sorting Hub (CJB-EAST)",
    destination: "Gandhipuram Sector 4",
    destinationCoords: { lat: 11.0168, lng: 76.9558 },
    currentCoords: { lat: 11.0195, lng: 76.9621 },
    totalDistanceKm: 24.0,
    remainingDistanceKm: 2.1, // Inside 5km doorstep threshold
    speedKmh: 26,
    status: "OUT_FOR_DELIVERY",
    otp: "9102",
    etaMinutes: 5,
    assignedCourier: "Suresh Kumar (ID: DRV-044)"
  }
];

export default function App() {
  const [userRole, setUserRole] = useState("customer"); // 'customer' | 'courier' | 'admin'
  const [selectedId, setSelectedId] = useState("ST-849201");
  const [showWaybill, setShowWaybill] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiChatLog, setAiChatLog] = useState([
    { sender: "ai", text: "ShipTrack Satellite Copilot online. Ask me about any consignment (e.g., 'Where is ST-849201?')." }
  ]);

  // Centralized State Persisted in LocalStorage
  const [shipments, setShipments] = useState(() => {
    const saved = localStorage.getItem("shiptrack_consignments");
    return saved ? JSON.parse(saved) : INITIAL_SHIPMENTS;
  });

  useEffect(() => {
    localStorage.setItem("shiptrack_consignments", JSON.stringify(shipments));
  }, [shipments]);

  // Unified GNSS Telemetry Ticker (Runs consistently for all personas)
  useEffect(() => {
    const ticker = setInterval(() => {
      setShipments(prevShipments =>
        prevShipments.map(item => {
          if (item.status === "DELIVERED" || item.remainingDistanceKm <= 0.05) {
            return item;
          }

          // Decrement distance realistically
          const nextDist = Math.max(0, +(item.remainingDistanceKm - 0.15).toFixed(2));
          const nextEta = Math.max(1, Math.round((nextDist / (item.speedKmh || 40)) * 60));

          // Incrementally nudge coordinates toward destination
          const latDelta = (item.destinationCoords.lat - item.currentCoords.lat) * 0.012;
          const lngDelta = (item.destinationCoords.lng - item.currentCoords.lng) * 0.012;

          let updatedStatus = item.status;
          if (nextDist <= 5.0 && item.status === "IN_TRANSIT") {
            updatedStatus = "OUT_FOR_DELIVERY";
          }

          return {
            ...item,
            remainingDistanceKm: nextDist,
            etaMinutes: nextEta,
            status: updatedStatus,
            currentCoords: {
              lat: +(item.currentCoords.lat + latDelta).toFixed(4),
              lng: +(item.currentCoords.lng + lngDelta).toFixed(4)
            }
          };
        })
      );
    }, 2500);
    return () => clearInterval(ticker);
  }, []);

  const activeShipment = shipments.find(s => s.id === selectedId) || shipments[0];

  // Delivery Handover Attempt with Geofence Gate
  const handleHandoverVerification = (enteredOtp) => {
    if (activeShipment.remainingDistanceKm > 5.0) {
      alert(`[SECURITY GEOFENCE LOCKOUT]\n\nVehicle is currently ${activeShipment.remainingDistanceKm} km from recipient doorstep.\nHandover authorization is strictly locked outside the 5 km boundary.`);
      return false;
    }
    if (enteredOtp.trim() !== activeShipment.otp) {
      alert("[HANDOVER REJECTED]\nInvalid recipient OTP code. Please verify with the customer.");
      return false;
    }

    setShipments(prev =>
      prev.map(s =>
        s.id === activeShipment.id
          ? { ...s, status: "DELIVERED", remainingDistanceKm: 0, speedKmh: 0, etaMinutes: 0 }
          : s
      )
    );
    alert(`[DELIVERY CONFIRMED]\nConsignment ${activeShipment.id} successfully completed and verified.`);
    return true;
  };

  // Satellite AI Handler
  const handleAiAsk = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userText = aiQuery;
    setAiChatLog(prev => [...prev, { sender: "user", text: userText }]);
    setAiQuery("");

    // Regex extraction for consignment IDs (e.g., ST-849201)
    const match = userText.match(/ST-\d{6}/i);
    setTimeout(() => {
      if (match) {
        const found = shipments.find(s => s.id.toUpperCase() === match[0].toUpperCase());
        if (found) {
          setAiChatLog(prev => [
            ...prev,
            {
              sender: "ai",
              text: `Satellite Fix for [${found.id}]: Status is ${found.status}. Speed: ${found.speedKmh} km/h. Location: ${found.currentCoords.lat}°N, ${found.currentCoords.lng}°E. Remaining Distance: ${found.remainingDistanceKm} km (~${found.etaMinutes} mins to destination).`
            }
          ]);
          return;
        }
      }
      setAiChatLog(prev => [
        ...prev,
        {
          sender: "ai",
          text: `ShipTrack query processed. Please specify an active consignment tag like 'ST-849201' or 'ST-592184' to retrieve live telemetry.`
        }
      ]);
    }, 400);
  };
  // RFC 4180 CSV Export
  const handleExportCsv = () => {
    const headers = ["Consignment_ID,Customer,Status,Remaining_KM,Speed_KMH,Current_Lat,Current_Lng,Assigned_Courier,OTP_Verified"];
    const rows = shipments.map(s =>
      `"${s.id}","${s.customerName}","${s.status}",${s.remainingDistanceKm},${s.speedKmh},${s.currentCoords.lat},${s.currentCoords.lng},"${s.assignedCourier}","${s.status === 'DELIVERED' ? 'YES' : 'PENDING'}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ShipTrack_Telemetry_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      {/* Top Global Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 font-black text-xl">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              ShipTrack <span className="text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-mono">GNSS TELEMETRY</span>
            </h1>
            <p className="text-xs text-slate-400">Continuous Satellite Radar & Geofence Gate</p>
          </div>
        </div>

        {/* Persona Switcher (RBAC) */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold px-2">Role:</span>
          {["customer", "courier", "admin"].map(role => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition ${
                userRole === role
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {role === "courier" ? "Delivery Staff" : role}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto p-4 md:p-6 flex-1 space-y-6">
        {/* Consignment Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-slate-400 font-bold">Active Tracking ID:</span>
            <div className="flex gap-2">
              {shipments.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
                    selectedId === s.id
                      ? "bg-sky-500/20 text-sky-300 border border-sky-400"
                      : "bg-slate-800 text-slate-400 border border-transparent hover:border-slate-700"
                  }`}
                >
                  {s.id}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWaybill(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition"
            >
              Print Waybill
            </button>
            {userRole === "admin" && (
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
              >
                Export CSV Ledger
              </button>
            )}
          </div>
        </div>
        {/* ======================================================== */}
        {/* ROLE 1: CUSTOMER VIEW                                    */}
        {/* ======================================================== */}
        {userRole === "customer" && (
          <div className="space-y-6">
            {/* STRICT NOTIFICATION: Only rendered for Customer within 5km */}
            {activeShipment.remainingDistanceKm <= 5.0 && activeShipment.status !== "DELIVERED" ? (
              <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-emerald-950/50 animate-pulse">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                    <h2 className="font-extrabold text-emerald-300 text-base md:text-lg">
                      DOORSTEP PROXIMITY ALERT: Vehicle Approaching!
                    </h2>
                  </div>
                  <p className="text-xs text-emerald-200/90 mt-1">
                    Your courier is strictly within the 5 km destination perimeter ({activeShipment.remainingDistanceKm} km away).
                    Estimated arrival in ~{activeShipment.etaMinutes} minutes.
                  </p>
                </div>
                <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-emerald-500 text-right">
                  <div className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">Secure Handover OTP</div>
                  <div className="text-2xl font-mono font-black text-emerald-300 tracking-wider">
                    {activeShipment.otp}
                  </div>
                  <div className="text-[10px] text-slate-400">Share only at the doorstep</div>
                </div>
              </div>
            ) : activeShipment.status !== "DELIVERED" ? (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                  In Highway Transit: Courier is {activeShipment.remainingDistanceKm} km away.
                </span>
                <span className="italic text-slate-500">
                  Doorstep notification & OTP unlock automatically when vehicle is &le; 5 km away.
                </span>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/40 border border-emerald-600/50 rounded-lg text-emerald-300 text-sm font-semibold flex items-center gap-2">
                This shipment was successfully delivered to your doorstep.
              </div>
            )}

            {/* Live Synchronized Highway Radar Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">GNSS Highway Telemetry Feed</h3>
                  <p className="text-xs text-slate-500 font-mono">Satellite: DGPS 3D Fix Active</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
                  activeShipment.status === "DELIVERED" ? "bg-emerald-900 text-emerald-200" : "bg-sky-900 text-sky-200"
                }`}>
                  {activeShipment.status}
                </span>
              </div>

              {/* 4 Shared Telemetry Telemetry Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Remaining Distance</div>
                  <div className="text-xl font-bold font-mono text-sky-400">{activeShipment.remainingDistanceKm} km</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Highway Speed</div>
                  <div className="text-xl font-bold font-mono text-slate-100">{activeShipment.speedKmh} km/h</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Latitude</div>
                  <div className="text-lg font-bold font-mono text-slate-200">{activeShipment.currentCoords.lat}° N</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Longitude</div>
                  <div className="text-lg font-bold font-mono text-slate-200">{activeShipment.currentCoords.lng}° E</div>
                </div>
              </div>
              {/* Milestone Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Progress ({activeShipment.origin})</span>
                  <span>{activeShipment.destination}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-sky-500 h-full transition-all duration-700"
                    style={{
                      width: activeShipment.status === "DELIVERED"
                        ? "100%"
                        : `${Math.min(95, Math.max(5, ((activeShipment.totalDistanceKm - activeShipment.remainingDistanceKm) / activeShipment.totalDistanceKm) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 2: COURIER / DELIVERY STAFF VIEW                     */}
        {/* ======================================================== */}
        {userRole === "courier" && (
          <CourierSection
            shipment={activeShipment}
            onVerify={handleHandoverVerification}
          />
        )}

        {/* ======================================================== */}
        {/* ROLE 3: ADMIN VIEW                                       */}
        {/* ======================================================== */}
        {userRole === "admin" && (
          <AdminSection shipments={shipments} />
        )}
      </main>

      {/* Floating Satellite AI Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showAiModal ? (
          <button
            onClick={() => setShowAiModal(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold transition transform hover:scale-105"
          >
            Satellite AI Copilot
          </button>
        ) : (
          <div className="bg-slate-900 border border-slate-700 w-80 md:w-96 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold text-sky-400">Satellite AI Telemetry Copilot</span>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-3 h-60 overflow-y-auto space-y-2 text-xs font-sans">
              {aiChatLog.map((chat, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded ${
                    chat.sender === "ai"
                      ? "bg-slate-950 border border-slate-800 text-slate-200"
                      : "bg-sky-950 border border-sky-800 text-sky-200 ml-6"
                  }`}
                >
                  {chat.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleAiAsk} className="p-2 border-t border-slate-800 flex gap-2 bg-slate-950">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask e.g. Where is ST-849201?"
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded text-xs font-semibold"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
      {/* Code-128 Printable Waybill Modal */}
      {showWaybill && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 p-6 rounded-lg max-w-md w-full font-mono text-xs space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h2 className="text-lg font-black tracking-tight">SHIPTRACK WAYBILL</h2>
                <p className="text-[10px] text-slate-600">Standard Code-128 Domestic Logistics</p>
              </div>
              <button
                onClick={() => setShowWaybill(false)}
                className="text-slate-500 hover:text-black text-base font-sans"
              >
                ✕
              </button>
            </div>

            {/* Simulated Code-128 Barcode */}
            <div className="text-center py-2 bg-slate-100 border rounded">
              <div className="tracking-[6px] text-2xl font-black font-mono select-none">
                ||| | |||| | ||| |||| | | |||
              </div>
              <div className="text-[10px] tracking-widest text-slate-700 mt-1 font-bold">
                *{activeShipment.id}*
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] border-b pb-3">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Origin</span>
                <span className="font-bold">{activeShipment.origin}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Destination</span>
                <span className="font-bold">{activeShipment.destination}</span>
              </div>
            </div>

            <div className="text-[11px] space-y-1">
              <div><span className="text-slate-500">Recipient:</span> {activeShipment.customerName}</div>
              <div><span className="text-slate-500">Address:</span> {activeShipment.recipientAddress}</div>
              <div><span className="text-slate-500">Contact:</span> {activeShipment.customerPhone}</div>
            </div>

            <div className="pt-2 flex justify-end gap-2 font-sans">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                Print Waybill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 p-4 text-center text-xs text-slate-500 font-mono">
        ShipTrack Real-Time GNSS Telemetry Engine &bull; Deployed at shiptrack-live.onrender.com
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// COURIER VIEW COMPONENT (Includes Geofence Lockout Gate)
// -------------------------------------------------------------
function CourierSection({ shipment, onVerify }) {
  const [inputOtp, setInputOtp] = useState("");
  const isOutsideGeofence = shipment.remainingDistanceKm > 5.0;

  return (
    <div className="space-y-6">
      {/* Geofence Status Header (NO customer notification shown here) */}
      <div className={`p-4 rounded-xl border ${
        isOutsideGeofence ? "bg-amber-950/30 border-amber-600/50" : "bg-emerald-950/30 border-emerald-500/50"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isOutsideGeofence ? "bg-amber-400" : "bg-emerald-400"}`}></span>
              <h3 className="font-bold text-sm">
                {isOutsideGeofence ? "GEOFENCE STATUS: LOCKED (OVER 5 KM AWAY)" : "GEOFENCE STATUS: UNLOCKED (DOORSTEP PROXIMITY)"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Current Telemetry: <span className="font-mono text-slate-200">{shipment.remainingDistanceKm} km</span> remaining | Coords: <span className="font-mono text-slate-200">{shipment.currentCoords.lat}°N, {shipment.currentCoords.lng}°E</span>
            </p>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded font-mono uppercase ${
            isOutsideGeofence ? "bg-amber-900/60 text-amber-200 border border-amber-700" : "bg-emerald-900/60 text-emerald-200 border border-emerald-700"
          }`}>
            {isOutsideGeofence ? "Handover Disabled" : "Handover Permitted"}
          </span>
        </div>
      </div>
      {/* Handover Action Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
          Doorstep Handover Verification
        </h3>

        {shipment.status === "DELIVERED" ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-700/60 rounded-lg text-emerald-300 text-center font-bold text-sm">
            Parcel Handover Complete & Cryptographically Verified
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              The recipient will provide a private 4-digit code upon arrival. The system validates this code in real time against geofence parameters.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                maxLength={4}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="4-digit OTP"
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-lg text-center tracking-widest text-slate-100 focus:outline-none focus:border-sky-500 w-36"
              />
              <button
                onClick={() => onVerify(inputOtp)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-sky-600/30"
              >
                Verify & Complete Handover
              </button>
            </div>
            {isOutsideGeofence && (
              <p className="text-[11px] text-amber-400/90 italic">
                * Note: Submitting will trigger an intentional geofence rejection error because remaining distance is &gt; 5 km.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// ADMIN VIEW COMPONENT (Fleet Ledger)
// -------------------------------------------------------------
function AdminSection({ shipments }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-200">Centralized Fleet Telemetry Ledger</h2>
          <p className="text-xs text-slate-500">Live multi-vehicle status monitoring and geofence compliance</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Consignment ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Status</th>
                <th className="p-3">Remaining Dist</th>
                <th className="p-3">Coordinates</th>
                <th className="p-3">Assigned Courier</th>
                <th className="p-3">Geofence Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {shipments.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-sky-400">{s.id}</td>
                  <td className="p-3 font-sans text-slate-200">{s.customerName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === "DELIVERED" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-sky-950 text-sky-300 border border-sky-800"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{s.remainingDistanceKm} km</td>
                  <td className="p-3 text-slate-400">{s.currentCoords.lat}°N, {s.currentCoords.lng}°E</td>
                  <td className="p-3 font-sans text-slate-300">{s.assignedCourier}</td>
                  <td className="p-3">
                    {s.remainingDistanceKm <= 5.0 ? (
                      <span className="text-emerald-400 font-bold">&le; 5km (Doorstep Zone)</span>
                    ) : (
                      <span className="text-amber-400">&gt; 5km (Highway Locked)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}