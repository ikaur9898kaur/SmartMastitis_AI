import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataSourceBadge } from '../components/DataSourceBadge';
import {
  Battery, Wifi, RefreshCw, Radio, HardDrive, AlertTriangle, CheckCircle2
} from 'lucide-react';

export const IotDevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDevices = () => {
    setLoading(true);
    api.getDevices()
      .then(res => {
        setDevices(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const onlineCount = devices.filter(d => d.status === 'ONLINE').length;
  const offlineCount = devices.filter(d => d.status === 'OFFLINE').length;
  const warningCount = devices.filter(d => d.status !== 'ONLINE' && d.status !== 'OFFLINE').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              IOT SENSOR FLEET
            </span>
            <span className="text-xs text-slate-400">• ESP32 / WI-FI / REST / BLE / LoRa</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            IoT Edge Device Fleet Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status, battery levels, connectivity, and firmware tracking for on-animal and facility sensors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDevices}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh Fleet</span>
          </button>
          <DataSourceBadge source="sensor" label="HARDWARE HEARTBEAT" size="md" />
        </div>
      </div>

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Total Deployed Units:</span>
          <div className="text-2xl font-black text-white font-mono">{devices.length}</div>
          <span className="text-slate-500 text-[11px] mt-1 block">Edge Microcontrollers</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Online & Active:</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{onlineCount}</div>
          <span className="text-emerald-500 text-[11px] mt-1 block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Transmitting Telemetry
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Attention Required:</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{warningCount}</div>
          <span className="text-amber-500 text-[11px] mt-1 block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Calibration / Low Batt
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <span className="text-slate-400 block mb-1">Offline Units:</span>
          <div className="text-2xl font-black text-red-400 font-mono">{offlineCount}</div>
          <span className="text-red-500 text-[11px] mt-1 block">Connection Loss</span>
        </div>
      </div>

      {/* Device Inventory List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Device Inventory ({devices.length} Units)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Auto-Heartbeat Interval: 60s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(d => (
            <div key={d.device_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-3 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-base font-black text-white">{d.device_id}</h3>
                  </div>
                  <span className="text-slate-400 text-[11px] block mt-0.5">{d.device_type}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                  d.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  d.status === 'OFFLINE' ? 'bg-red-950 text-red-300 border border-red-800' :
                  'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {d.status}
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300 pt-2 border-t border-slate-800">
                {d.connected_animal && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Attached Animal:</span>
                    <strong className="text-white font-mono">{d.connected_animal}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Zone / Location:</span>
                  <strong className="text-slate-200">{d.location}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Power Source:</span>
                  <strong className="text-slate-200">{d.power_source}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Firmware:</span>
                  <span className="font-mono text-slate-400">{d.firmware_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Calibration:</span>
                  <span className="text-emerald-400 font-semibold">{d.calibration_status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <Battery className={`w-3.5 h-3.5 ${d.battery > 50 ? 'text-emerald-400' : (d.battery > 20 ? 'text-amber-400' : 'text-red-400')}`} />
                  <span>Battery: {d.battery}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Signal: {d.signal_strength}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
