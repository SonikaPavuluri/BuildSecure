import React, { useState } from 'react';
import { 
  Package, Truck, ShieldCheck, UserCheck, Search, PlusCircle, 
  Clock, CheckCircle2, AlertCircle, ArrowRight, Bot, Send, 
  MapPin, RefreshCw, X, Sparkles, Navigation, Phone, Calendar,
  ArrowUpRight, Check
} from 'lucide-react';

const INITIAL_SHIPMENTS = [
  {
    id: "ST-849201",
    sender: "Rahul Sharma (You)",
    senderId: "cust_1",
    receiver: "Anita Roy",
    receiverPhone: "+91 98451 22345",
    origin: "Coimbatore Warehouse Hub",
    destination: "Bengaluru Tech Park, KA",
    status: "IN_TRANSIT",
    currentLocation: "Salem Transit Hub",
    assignedDriver: "Karthik Raja",
    assignedDriverId: "drv_1",
    driverPhone: "+91 98940 11223",
    createdAt: "04 Oct 2026, 10:30 AM",
    estimatedDelivery: "06 Oct 2026, 05:00 PM",
    updates: [
      { status: "ORDER_PLACED", location: "Coimbatore Hub", note: "Consignment registered by sender", timestamp: "04 Oct, 10:30 AM" },
      { status: "PICKED_UP", location: "Coimbatore Hub", note: "Package received & barcoded", timestamp: "04 Oct, 02:15 PM" },
      { status: "IN_TRANSIT", location: "Salem Transit Hub", note: "Dispatched via Express Linehaul #42", timestamp: "05 Oct, 06:45 AM" }
    ]
  },
  {
    id: "ST-592184",
    sender: "Rahul Sharma (You)",
    senderId: "cust_1",
    receiver: "Kavita Nair",
    receiverPhone: "+91 94432 99011",
    origin: "Chennai Central Hub",
    destination: "Madurai South, TN",
    status: "OUT_FOR_DELIVERY",
    currentLocation: "Madurai Main Depot",
    assignedDriver: "Karthik Raja",
    assignedDriverId: "drv_1",
    driverPhone: "+91 98940 11223",
    createdAt: "03 Oct 2026, 08:00 AM",
    estimatedDelivery: "Today, 02:00 PM",
    updates: [
      { status: "ORDER_PLACED", location: "Chennai Hub", note: "Booking accepted", timestamp: "03 Oct, 08:00 AM" },
      { status: "PICKED_UP", location: "Chennai Hub", note: "Loaded into regional truck", timestamp: "03 Oct, 01:20 PM" },
      { status: "IN_TRANSIT", location: "Trichy Bypass Hub", note: "Passed transit weigh-station", timestamp: "04 Oct, 03:00 PM" },
      { status: "OUT_FOR_DELIVERY", location: "Madurai Main Depot", note: "Courier Karthik out for doorstep delivery", timestamp: "05 Oct, 09:10 AM" }
    ]
  },
  {
    id: "ST-103982",
    sender: "Sunil Enterprises",
    senderId: "cust_2",
    receiver: "Deepak Verma",
    receiverPhone: "+91 97711 00293",
    origin: "Mumbai Docklands",
    destination: "Pune Industrial Area, MH",
    status: "ORDER_PLACED",
    currentLocation: "Mumbai Origin Hub",
    assignedDriver: "Unassigned",
    assignedDriverId: null,
    driverPhone: "N/A",
    createdAt: "05 Oct 2026, 09:00 AM",
    estimatedDelivery: "07 Oct 2026, 06:00 PM",
    updates: [
      { status: "ORDER_PLACED", location: "Mumbai Docklands", note: "Order placed, awaiting courier dispatch assignment", timestamp: "05 Oct, 09:00 AM" }
    ]
  }
];

const AVAILABLE_DRIVERS = [
  { id: "drv_1", name: "Karthik Raja", phone: "+91 98940 11223", area: "South Zone TN" },
  { id: "drv_2", name: "Suresh Babu", phone: "+91 99440 44556", area: "Bengaluru West" },
  { id: "drv_3", name: "Pooja Pillai", phone: "+91 97890 88990", area: "Chennai Metro" }
];

export default function App() {
  const [role, setRole] = useState('CUSTOMER');
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [activeTab, setActiveTab] = useState('track');
  const [searchTrackingId, setSearchTrackingId] = useState('ST-849201');
  const [searchedShipment, setSearchedShipment] = useState(INITIAL_SHIPMENTS[0]);
  const [searchError, setSearchError] = useState(false);

  // New Shipment Form State
  const [newShipment, setNewShipment] = useState({
    receiver: '',
    receiverPhone: '',
    origin: 'Coimbatore Hub',
    destination: ''
  });

  // Modal State for Delivery updates
  const [selectedForStatusUpdate, setSelectedForStatusUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_TRANSIT');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateNote, setUpdateNote] = useState('');

  // AI Assistant Chat State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: '👋 Hello! I am your ShipTrack AI Assistant. Click a prompt below or ask about any shipment.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Handle Search
  const handleSearch = (trackingIdToSearch) => {
    const query = (typeof trackingIdToSearch === 'string' ? trackingIdToSearch : searchTrackingId).trim();
    if (!query) return;

    const found = shipments.find(s => s.id.toLowerCase() === query.toLowerCase());
    if (found) {
      setSearchedShipment(found);
      setSearchError(false);
    } else {
      setSearchedShipment(null);
      setSearchError(true);
    }
  };

  // Create Shipment
  const handleCreateShipment = (e) => {
    e.preventDefault();
    const id = `ST-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdItem = {
      id,
      sender: "Rahul Sharma (You)",
      senderId: "cust_1",
      receiver: newShipment.receiver,
      receiverPhone: newShipment.receiverPhone,
      origin: newShipment.origin,
      destination: newShipment.destination,
      status: "ORDER_PLACED",
      currentLocation: newShipment.origin,
      assignedDriver: "Unassigned",
      assignedDriverId: null,
      driverPhone: "N/A",
      createdAt: "Today, Just now",
      estimatedDelivery: "Estimated within 48 Hours",
      updates: [
        { status: "ORDER_PLACED", location: newShipment.origin, note: "Consignment registered by customer", timestamp: "Today, Just now" }
      ]
    };

    setShipments([createdItem, ...shipments]);
    setNewShipment({ receiver: '', receiverPhone: '', origin: 'Coimbatore Hub', destination: '' });
    setSearchedShipment(createdItem);
    setSearchTrackingId(id);
    setActiveTab('track');
  };

  // Admin Assign Driver
  const handleAssignDriver = (shipmentId, driverId) => {
    const driver = AVAILABLE_DRIVERS.find(d => d.id === driverId);
    setShipments(shipments.map(s => {
      if (s.id === shipmentId) {
        return {
          ...s,
          assignedDriver: driver ? driver.name : "Unassigned",
          assignedDriverId: driverId,
          driverPhone: driver ? driver.phone : "N/A",
          updates: [
            ...s.updates,
            { status: s.status, location: s.currentLocation, note: `Courier ${driver?.name} assigned by Logistics Admin`, timestamp: "Just now" }
          ]
        };
      }
      return s;
    }));
  };

  // Delivery Agent Status Update
  const handleSaveStatusUpdate = () => {
    if (!selectedForStatusUpdate) return;
    setShipments(shipments.map(s => {
      if (s.id === selectedForStatusUpdate.id) {
        return {
          ...s,
          status: newStatus,
          currentLocation: updateLocation || s.currentLocation,
          updates: [
            ...s.updates,
            { status: newStatus, location: updateLocation || s.currentLocation, note: updateNote || `Checkpoint update: ${newStatus}`, timestamp: "Just now" }
          ]
        };
      }
      return s;
    }));
    // Also update current tracking card if actively viewed
    if (searchedShipment && searchedShipment.id === selectedForStatusUpdate.id) {
      setSearchedShipment({
        ...searchedShipment,
        status: newStatus,
        currentLocation: updateLocation || searchedShipment.currentLocation,
        updates: [
          ...searchedShipment.updates,
          { status: newStatus, location: updateLocation || searchedShipment.currentLocation, note: updateNote || `Checkpoint update: ${newStatus}`, timestamp: "Just now" }
        ]
      });
    }
    setSelectedForStatusUpdate(null);
    setUpdateLocation('');
    setUpdateNote('');
  };

  // AI Assistant Chat Handler
  const handleSendAiMessage = (queryText) => {
    const userText = (queryText || chatInput).trim();
    if (!userText) return;

    const newChat = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newChat);
    setChatInput('');

    setTimeout(() => {
      const match = userText.match(/ST-\d{6}/i);
      let reply = "";
      if (match) {
        const found = shipments.find(s => s.id.toLowerCase() === match[0].toLowerCase());
        if (found) {
          reply = `📦 Consignment **${found.id}** is currently **${found.status.replace(/_/g, ' ')}** at **${found.currentLocation}**.\n\n` +
                  `• Assigned Courier: ${found.assignedDriver} (${found.driverPhone})\n` +
                  `• Destination: ${found.destination}\n` +
                  `• ETA: ${found.estimatedDelivery}\n` +
                  `• Latest Checkpoint: "${found.updates[found.updates.length - 1]?.note}"`;
        } else {
          reply = `⚠️ I could not locate any active shipment matching "${match[0]}". Please verify the tracking number.`;
        }
      } else if (userText.toLowerCase().includes('status') || userText.toLowerCase().includes('orders') || userText.toLowerCase().includes('my')) {
        const myActive = shipments.filter(s => s.senderId === 'cust_1');
        reply = `You have **${myActive.length} shipments** on record. Your latest order **${myActive[0]?.id}** is **${myActive[0]?.status.replace(/_/g, ' ')}** en route to ${myActive[0]?.destination}.`;
      } else if (userText.toLowerCase().includes('delay') || userText.toLowerCase().includes('help')) {
        reply = `All active express deliveries in South Zone are operating normally on schedule. Standard transit timeline is 24–48 hours from dispatch.`;
      } else {
        reply = `I can instantly answer questions about any shipment! Try clicking on **ST-849201** or ask *"Where is my package?"*`;
      }
      setChatMessages([...newChat, { sender: 'bot', text: reply }]);
    }, 350);
  };

  // Status visual configurations
  const getStatusBadge = (status) => {
    const config = {
      ORDER_PLACED: "bg-blue-50 text-blue-700 border-blue-200",
      PICKED_UP: "bg-amber-50 text-amber-700 border-amber-200",
      IN_TRANSIT: "bg-purple-50 text-purple-700 border-purple-200",
      OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
      DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };
    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-xs ${config[status] || "bg-gray-100 text-gray-800"}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  // Step Calculation for Visual Timeline Bar
  const getStepProgress = (status) => {
    switch (status) {
      case 'ORDER_PLACED': return 1;
      case 'PICKED_UP': return 2;
      case 'IN_TRANSIT': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Main Navigation */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  ShipTrack
                </span>
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  PS-05
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Delivery & Shipment Logistics</p>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => { setRole('CUSTOMER'); setActiveTab('track'); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'CUSTOMER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => setRole('DELIVERY')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'DELIVERY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery Staff</span>
            </button>
            <button
              onClick={() => setRole('ADMIN')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'ADMIN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Helper Banner */}
      <div className="bg-indigo-50 border-b border-indigo-100 py-2.5 px-4 text-xs text-indigo-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Active Testing Role:</strong> You are currently viewing as <strong>{role}</strong>. Switch roles anytime from the top-right navbar to test different permissions!
            </span>
          </div>
          <button 
            onClick={() => setIsAiOpen(true)}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
          >
            <span>Ask AI Assistant</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* -------------------- ROLE 1: CUSTOMER VIEW -------------------- */}
        {role === 'CUSTOMER' && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 space-x-8 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('track')}
                className={`pb-3.5 border-b-2 flex items-center space-x-2 transition ${
                  activeTab === 'track' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Live Consignment Tracker</span>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`pb-3.5 border-b-2 flex items-center space-x-2 transition ${
                  activeTab === 'create' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book New Consignment</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3.5 border-b-2 flex items-center space-x-2 transition ${
                  activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>My Consignment Ledger ({shipments.filter(s => s.senderId === 'cust_1').length})</span>
              </button>
            </div>

            {/* TAB: TRACK */}
            {activeTab === 'track' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Search Bar + Quick Click Samples */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter 8-digit tracking number (e.g. ST-849201)"
                        value={searchTrackingId}
                        onChange={(e) => setSearchTrackingId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm"
                    >
                      Locate
                    </button>
                  </form>

                  {/* 1-Click Interactive Demo Pill Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-medium">Quick Demo Samples:</span>
                    {shipments.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSearchTrackingId(s.id);
                          handleSearch(s.id);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition ${
                          searchedShipment?.id === s.id 
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-800 font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                      >
                        {s.id} ({s.status.replace(/_/g, ' ')})
                      </button>
                    ))}
                  </div>
                </div>

                {searchError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>No active shipment was found matching tracking ID <strong>"{searchTrackingId}"</strong>.</span>
                  </div>
                )}

                {searchedShipment && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400">WAYBILL / TRACKING NUMBER</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{searchedShipment.id}</h2>
                      </div>
                      <div className="flex it items-center gap-2">
                        {getStatusBadge(searchedShipment.status)}
                      </div>
                    </div>

                    {/* Visual 4-Step Milestone Progress Bar */}
                    <div className="py-2">
                      <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                        <div 
                          className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
                          style={{ width: `${((getStepProgress(searchedShipment.status) - 1) / 3) * 100}%` }}
                        ></div>

                        {[
                          { title: "Booked", step: 1 },
                          { title: "Picked Up", step: 2 },
                          { title: "In Transit", step: 3 },
                          { title: "Delivered", step: 4 }
                        ].map((m) => {
                          const isDone = getStepProgress(searchedShipment.status) >= m.step;
                          const isCurrent = getStepProgress(searchedShipment.status) === m.step;
                          return (
                            <div key={m.step} className="relative z-10 flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                isDone ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                              } ${isCurrent ? 'ring-4 ring-indigo-200 animate-pulse' : ''}`}>
                                {isDone ? <Check className="w-4 h-4" /> : m.step}
                              </div>
                              <span className={`text-[11px] mt-1.5 font-semibold ${isDone ? 'text-indigo-900 font-bold' : 'text-slate-400'}`}>
                                {m.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Logistics Card Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Destination</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{searchedShipment.destination}</p>
                        <p className="text-slate-500 mt-0.5">Recipient: {searchedShipment.receiver}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Assigned Delivery Courier</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{searchedShipment.assignedDriver}</p>
                        <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{searchedShipment.driverPhone}</span>
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Estimated Doorstep ETA</span>
                        <p className="font-bold text-indigo-700 text-sm mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{searchedShipment.estimatedDelivery}</span>
                        </p>
                        <p className="text-slate-500 mt-0.5">Current Hub: {searchedShipment.currentLocation}</p>
                      </div>
                    </div>

                    {/* Checkpoint Audit Logs */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Live Checkpoint Audit Logs</span>
                      </h4>
                      <div className="relative pl-6 space-y-6 border-l-2 border-indigo-200 ml-2">
                        {searchedShipment.updates.map((update, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[31px] top-0.5 bg-indigo-600 text-white p-1 rounded-full shadow-xs">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold text-slate-800">{update.status.replace(/_/g, ' ')}</div>
                              <span className="text-xs text-slate-400 font-mono">{update.timestamp}</span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{update.location}</span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60 inline-block">
                              {update.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CREATE */}
            {activeTab === 'create' && (
              <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                    <PlusCircle className="w-5 h-5 text-indigo-600" />
                    <span>Create & Register New Shipment</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Enter parcel details to generate a unique consignment code.</p>
                </div>
                
                <form onSubmit={handleCreateShipment} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={newShipment.receiver}
                      onChange={(e) => setNewShipment({ ...newShipment, receiver: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Phone Number</label>
                    <input
                      required
                      type="text"
                      placeholder="+91 XXXXX XXXXX"
                      value={newShipment.receiverPhone}
                      onChange={(e) => setNewShipment({ ...newShipment, receiverPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Origin City / Facility Hub</label>
                      <input
                        type="text"
                        value={newShipment.origin}
                        onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Destination Address</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Madurai South, TN"
                        value={newShipment.destination}
                        onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold py-3 rounded-xl shadow-md transition">
                    Generate Consignment & Tracking ID
                  </button>
                </form>
              </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shipments.filter(s => s.senderId === 'cust_1').map(shipment => (
                  <div key={shipment.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-indigo-300 transition">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-indigo-600 text-base">{shipment.id}</span>
                      {getStatusBadge(shipment.status)}
                    </div>
                    <div className="text-xs text-slate-600 space-y-1.5">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Destination: <strong>{shipment.destination}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Created: {shipment.createdAt}</span>
                      </div>
                      <div className="text-slate-500">
                        Current Checkpoint: <strong className="text-slate-700">{shipment.currentLocation}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSearchTrackingId(shipment.id);
                        setSearchedShipment(shipment);
                        setActiveTab('track');
                      }}
                      className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center space-x-1 pt-1"
                    >
                      <span>Open Interactive Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------- ROLE 2: DELIVERY STAFF VIEW -------------------- */}
        {role === 'DELIVERY' && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Driver Duty Portal</span>
                <h3 className="text-lg font-black text-slate-900">On-Duty Courier: Karthik Raja</h3>
                <p className="text-xs text-slate-500">Driver ID: drv_1 • Route: South Zone Linehaul • Contact: +91 98940 11223</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full font-bold">
                Shift Active • 2 Orders Assigned
              </span>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Delivery Parcels</h4>
              <span className="text-xs text-slate-400">Click button to push checkpoint milestone</span>
            </div>

            <div className="grid gap-4">
              {shipments.filter(s => s.assignedDriverId === 'drv_1').map(shipment => (
                <div key={shipment.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-black text-slate-900 text-base">{shipment.id}</span>
                      {getStatusBadge(shipment.status)}
                    </div>
                    <p className="text-xs text-slate-700">Recipient: <strong>{shipment.receiver}</strong> ({shipment.destination})</p>
                    <p className="text-xs text-slate-500">Last Reported Checkpoint: <strong>{shipment.currentLocation}</strong></p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedForStatusUpdate(shipment);
                      setNewStatus(shipment.status);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-xs transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Push Milestone Update</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- ROLE 3: ADMIN CONSOLE VIEW -------------------- */}
        {role === 'ADMIN' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-400">Total Consignments</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{shipments.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-400">Awaiting Courier</span>
                <p className="text-3xl font-black text-amber-600 mt-1">{shipments.filter(s => !s.assignedDriverId).length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-400">In Active Transit</span>
                <p className="text-3xl font-black text-purple-600 mt-1">{shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY').length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-400">Delivered</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">{shipments.filter(s => s.status === 'DELIVERED').length}</p>
              </div>
            </div>

            {/* Master Shipment Management Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm">System Consignments Master Ledger</h3>
                <span className="text-xs text-slate-400 font-mono">Live Sync</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Consignment ID</th>
                      <th className="p-3.5">Sender</th>
                      <th className="p-3.5">Destination</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Assigned Courier</th>
                      <th className="p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shipments.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{s.id}</td>
                        <td className="p-3.5">{s.sender}</td>
                        <td className="p-3.5">{s.destination}</td>
                        <td className="p-3.5">{getStatusBadge(s.status)}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{s.assignedDriver}</td>
                        <td className="p-3.5">
                          <select
                            value={s.assignedDriverId || ""}
                            onChange={(e) => handleAssignDriver(s.id, e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Assign Driver</option>
                            {AVAILABLE_DRIVERS.map(d => (
                              <option key={d.id} value={d.id}>{d.name} ({d.area})</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DELIVERY STATUS UPDATE MODAL */}
      {selectedForStatusUpdate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Update Checkpoint: {selectedForStatusUpdate.id}</h3>
              <button onClick={() => setSelectedForStatusUpdate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Milestone Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                >
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Checkpoint Location</label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore Toll Plaza Hub"
                  value={updateLocation}
                  onChange={(e) => setUpdateLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Courier Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Scanned, verified & loaded into transit vehicle"
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setSelectedForStatusUpdate(null)} 
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStatusUpdate} 
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
              >
                Save & Broadcast Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CONTEXT-AWARE AI ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isAiOpen ? (
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Bot className="w-5 h-5" />
            <span className="text-xs font-black tracking-wide">AI Assistant</span>
          </button>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[420px] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-3.5 flex justify-between items-center text-xs font-bold">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>ShipTrack AI Assistant</span>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click Prompt Pills for users */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1.5 overflow-x-auto text-[11px]">
              <button 
                onClick={() => handleSendAiMessage("Where is package ST-849201?")} 
                className="bg-white border border-slate-200 text-indigo-700 px-2 py-0.5 rounded-md hover:bg-indigo-50 shrink-0 font-medium"
              >
                Track ST-849201
              </button>
              <button 
                onClick={() => handleSendAiMessage("Show my active order status")} 
                className="bg-white border border-slate-200 text-indigo-700 px-2 py-0.5 rounded-md hover:bg-indigo-50 shrink-0 font-medium"
              >
                My Orders
              </button>
            </div>

            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl whitespace-pre-line max-w-[85%] ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendAiMessage(); }} className="p-2.5 border-t border-slate-200 flex gap-1.5">
              <input
                type="text"
                placeholder="Ask about ST-849201..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}