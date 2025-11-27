"use client";

import { useState, useEffect, useRef } from "react";
import { Wifi, Lock, Signal, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WifiNetwork {
  ssid: string;
  signalStrength: number; // 1-4
  isSecure: boolean;
  isConnected: boolean;
}

export function WifiMenu({ onClose }: { onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [passwordInputNetwork, setPasswordInputNetwork] = useState<
    string | null
  >(null);
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("#wifi-toggle-btn")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    // Simulate scanning for networks
    const timer = setTimeout(() => {
      const storedSSID =
        localStorage.getItem("wifi-connected-ssid") || "Muneeb's WiFi";

      const initialNetworks = [
        {
          ssid: "Muneeb's WiFi",
          signalStrength: 4,
          isSecure: true,
          isConnected: false,
        },
        {
          ssid: "Free Public WiFi",
          signalStrength: 3,
          isSecure: false,
          isConnected: false,
        },
        {
          ssid: "Neighbor's Network",
          signalStrength: 2,
          isSecure: true,
          isConnected: false,
        },
        {
          ssid: "Hidden Network",
          signalStrength: 1,
          isSecure: true,
          isConnected: false,
        },
        {
          ssid: "5G Tower Test",
          signalStrength: 4,
          isSecure: true,
          isConnected: false,
        },
      ];

      // Update isConnected based on stored SSID
      const networksWithStatus = initialNetworks.map((n) => ({
        ...n,
        isConnected: n.ssid === storedSSID,
      }));

      // Sort: Connected first
      const sortedNetworks = networksWithStatus.sort((a, b) => {
        if (a.isConnected === b.isConnected) return 0;
        return a.isConnected ? -1 : 1;
      });

      setNetworks(sortedNetworks);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const connectToNetwork = (ssid: string) => {
    setConnectingTo(ssid);
    setPasswordInputNetwork(null);
    setPassword("");
    setIsError(false);

    setTimeout(() => {
      const updatedNetworks = networks.map((n) => ({
        ...n,
        isConnected: n.ssid === ssid,
      }));

      // Sort: Connected first
      updatedNetworks.sort((a, b) => {
        if (a.isConnected === b.isConnected) return 0;
        return a.isConnected ? -1 : 1;
      });

      setNetworks(updatedNetworks);
      setConnectingTo(null);
      localStorage.setItem("wifi-connected-ssid", ssid);
    }, 2000);
  };

  const handleConnect = (ssid: string) => {
    const network = networks.find((n) => n.ssid === ssid);
    if (network?.isConnected) return;

    // If it's Muneeb's WiFi (saved) or not secure, connect directly
    if (ssid === "Muneeb's WiFi" || !network?.isSecure) {
      connectToNetwork(ssid);
    } else {
      // Otherwise show password input
      setPasswordInputNetwork(ssid);
      setPassword("");
      setIsError(false);
    }
  };

  const handlePasswordSubmit = () => {
    // Always fail for other networks
    setIsError(true);
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-12 right-2 w-[300px] bg-[#f0f0f0] border border-[#999] shadow-2xl rounded-t-lg overflow-hidden z-[10000] font-sans text-sm select-none"
      style={{
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      }}
    >
      <div className="bg-[#dfeaf3] p-3 border-b border-[#aebcd0] flex justify-between items-center">
        <span className="font-bold text-[#1e395b]">
          Currently connected to:
        </span>
      </div>

      <div className="bg-white min-h-[300px] max-h-[400px] overflow-y-auto p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Searching for networks...</span>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {networks.map((network) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={network.ssid}
                  className={`group p-2 rounded border border-transparent hover:bg-[#e8f3fd] hover:border-[#bce4f9] cursor-pointer transition-colors ${
                    network.isConnected || selectedNetwork === network.ssid
                      ? "bg-[#e8f3fd] border-[#bce4f9]"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedNetwork(
                      selectedNetwork === network.ssid ? null : network.ssid
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Signal
                        className={`w-5 h-5 ${
                          network.signalStrength < 3
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1e395b]">
                          {network.ssid}
                        </span>
                        <span className="text-xs text-gray-500">
                          {network.isConnected
                            ? "Connected"
                            : network.isSecure
                            ? "Secured"
                            : "Open"}
                        </span>
                      </div>
                    </div>
                    {network.isConnected && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    {connectingTo === network.ssid && (
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </div>

                  {!network.isConnected &&
                    connectingTo !== network.ssid &&
                    selectedNetwork === network.ssid && (
                      <div
                        className="mt-2 pl-7 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {passwordInputNetwork === network.ssid ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-[#1e395b]">
                                Security key:
                              </label>
                              <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  setIsError(false);
                                }}
                                className="w-full px-1 py-0.5 border border-[#8db2e3] text-sm focus:outline-none focus:border-[#1e395b]"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handlePasswordSubmit();
                                }}
                              />
                              {isError && (
                                <span className="text-xs text-red-600">
                                  Network security key is incorrect.
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-0.5 bg-[#f0f0f0] border border-[#8db2e3] rounded hover:bg-[#eef6fb] text-[#1e395b] text-xs"
                                onClick={handlePasswordSubmit}
                              >
                                OK
                              </button>
                              <button
                                className="px-3 py-0.5 bg-[#f0f0f0] border border-[#8db2e3] rounded hover:bg-[#eef6fb] text-[#1e395b] text-xs"
                                onClick={() => setPasswordInputNetwork(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              className="px-4 py-1 bg-white border border-[#8db2e3] rounded hover:bg-[#eef6fb] text-[#1e395b]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConnect(network.ssid);
                              }}
                            >
                              Connect
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="bg-[#f0f0f0] p-3 border-t border-[#d9d9d9] flex justify-between items-center text-[#1e528e] hover:underline cursor-pointer"></div>

      {/* Click outside handler is managed by parent or overlay */}
    </div>
  );
}
