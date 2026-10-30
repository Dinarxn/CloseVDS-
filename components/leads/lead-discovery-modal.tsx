"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { api, ApiClientError } from "@/lib/api-client";

export interface LeadDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_NICHES = [
  "Dentist",
  "Restaurant",
  "Salon",
  "Gym",
  "Real Estate",
  "Lawyer",
  "Clinic",
  "Marketing Agency",
];

const EXAMPLE_LOCATIONS = [
  "London",
  "Dubai",
  "New York",
  "Toronto",
  "Mumbai",
  "Abu Dhabi",
  "Sydney",
];

export function LeadDiscoveryModal({ isOpen, onClose }: LeadDiscoveryModalProps) {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [batchSize, setBatchSize] = useState("10");
  const [provider, setProvider] = useState<"osm" | "geoapify">("osm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
    }
  }, [isOpen]);

  const handleQueueDiscovery = async () => {
    const trimmedNiche = niche.trim();
    const trimmedLocation = location.trim();

    if (!trimmedNiche || !trimmedLocation) {
      setStatusMessage({
        type: "error",
        text: "Please provide both a business niche and geographic location.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const payload: {
        niche: string;
        location: string;
        limit: number;
        countryCode?: string;
        provider: "osm" | "geoapify";
      } = {
        niche: trimmedNiche,
        location: trimmedLocation,
        limit: parseInt(batchSize, 10) || 10,
        provider,
      };

      const trimmedCountry = countryCode.trim().toUpperCase();
      if (trimmedCountry) {
        payload.countryCode = trimmedCountry;
      }

      const response = await api.post<{
        data: { discovered: number; candidates: Array<{ businessName: string }> };
      }>("/lead-discovery/query", payload);

      const count = response?.data?.discovered || 0;
      setStatusMessage({
        type: "success",
        text: `Successfully discovered and queued ${count} candidate businesses into your leads workspace.`,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.code === "PROVIDER_UNAVAILABLE" || err.statusCode === 503) {
          setStatusMessage({
            type: "info",
            text: "Lead discovery provider is unavailable or in safe standby mode.",
          });
        } else {
          setStatusMessage({
            type: "error",
            text: err.message || "Failed to execute lead discovery query.",
          });
        }
      } else {
        setStatusMessage({
          type: "error",
          text: "Network error while connecting to discovery service.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Global Lead Discovery"
      description="Target any business vertical across any city, region, or country worldwide."
      className="sm:max-w-xl !bg-[#0A0A0E] !border-white/[0.12] !rounded-2xl !p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)]"
    >
      <div className="relative space-y-3.5">
        {/* Intelligence Telemetry Banner Box */}
        <div className="relative overflow-hidden p-3 rounded-xl bg-[#111116] border border-white/[0.08]">
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7D39EB]/10 border border-[#7D39EB]/25 flex items-center justify-center text-[#7D39EB] shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white tracking-tight">
                    Worldwide Multi-Niche Engine
                  </span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#C6FF33]/10 border border-[#C6FF33]/30 text-[9px] font-mono text-[#C6FF33] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_6px_#C6FF33]" />
                    STANDBY
                  </span>
                </div>
                <p className="text-[11px] text-[#8E8E9F] mt-0.5">
                  Zero-restriction prospect search with 4-factor deduplication
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0A0A0E] border border-white/[0.08] text-[10px] font-mono text-[#8E8E9F]">
              <span>Coverage:</span>
              <span className="text-white font-semibold">190+ Countries</span>
            </div>
          </div>
        </div>

        {statusMessage && (
          <Alert
            variant={
              statusMessage.type === "error"
                ? "destructive"
                : statusMessage.type === "info"
                ? "warning"
                : "default"
            }
            title={
              statusMessage.type === "error"
                ? "Discovery Notice"
                : statusMessage.type === "info"
                ? "Provider Standby"
                : "Discovery Completed"
            }
          >
            {statusMessage.text}
          </Alert>
        )}

        <div className="space-y-3">
          {/* Business / Niche Input Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="modal-discovery-niche"
                className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F] flex items-center gap-1.5"
              >
                <span>Target Niche / Industry</span>
                <span className="text-[#C6FF33]">• Any Vertical</span>
              </label>
              <span className="text-[10px] font-mono text-[#565668]">Free-text input</span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8E8E9F]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="modal-discovery-niche"
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Dentist, Restaurant, Luxury Salon, Commercial Real Estate..."
                disabled={isSubmitting}
                className="w-full h-9 pl-9 pr-8 bg-[#111116] text-white text-xs rounded-lg border border-white/[0.08] hover:border-white/[0.16] focus:border-[#7D39EB]/60 focus:ring-1 focus:ring-[#7D39EB] placeholder-[#8E8E9F] transition-colors font-sans"
              />
              {niche && !isSubmitting && (
                <button
                  type="button"
                  onClick={() => setNiche("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8E8E9F] hover:text-white transition-colors cursor-pointer"
                  title="Clear niche"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
              <span className="text-[10px] font-mono text-[#565668] uppercase tracking-wider mr-0.5">
                Presets:
              </span>
              {EXAMPLE_NICHES.map((item) => {
                const isSelected = niche.trim().toLowerCase() === item.toLowerCase();
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNiche(item)}
                    disabled={isSubmitting}
                    className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer font-sans ${
                      isSelected
                        ? "bg-[#7D39EB] text-white font-semibold border-[#7D39EB] shadow-[0_0_12px_rgba(125,57,235,0.4)]"
                        : "bg-[#111116] hover:bg-[#171720] text-[#CBCBD6] hover:text-white border-white/[0.08] hover:border-white/[0.16]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location and Country Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="modal-discovery-location"
                  className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F] flex items-center gap-1.5"
                >
                  <span>Location / Market</span>
                  <span className="text-[#C6FF33]">• Global</span>
                </label>
                <span className="text-[10px] font-mono text-[#565668]">City, state, or country</span>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8E8E9F]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  id="modal-discovery-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. London, Dubai, Toronto, Mumbai, New York..."
                  disabled={isSubmitting}
                  className="w-full h-9 pl-9 pr-8 bg-[#111116] text-white text-xs rounded-lg border border-white/[0.08] hover:border-white/[0.16] focus:border-[#7D39EB]/60 focus:ring-1 focus:ring-[#7D39EB] placeholder-[#8E8E9F] transition-colors font-sans"
                />
                {location && !isSubmitting && (
                  <button
                    type="button"
                    onClick={() => setLocation("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8E8E9F] hover:text-white transition-colors cursor-pointer"
                    title="Clear location"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Location Presets */}
              <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                <span className="text-[10px] font-mono text-[#565668] uppercase tracking-wider mr-0.5">
                  Presets:
                </span>
                {EXAMPLE_LOCATIONS.map((loc) => {
                  const isSelected = location.trim().toLowerCase() === loc.toLowerCase();
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      disabled={isSubmitting}
                      className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer font-sans ${
                        isSelected
                          ? "bg-[#7D39EB] text-white font-semibold border-[#7D39EB] shadow-[0_0_12px_rgba(125,57,235,0.4)]"
                          : "bg-[#111116] hover:bg-[#171720] text-[#CBCBD6] hover:text-white border-white/[0.08] hover:border-white/[0.16]"
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Country Code Column */}
            <div className="sm:col-span-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="modal-discovery-country"
                  className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F]"
                >
                  Country Code
                </label>
                <span className="text-[10px] font-mono text-[#565668]">Optional</span>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#8E8E9F]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <input
                  id="modal-discovery-country"
                  type="text"
                  value={countryCode}
                  maxLength={2}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                  placeholder="US, GB, AE"
                  disabled={isSubmitting}
                  className="w-full h-9 pl-8.5 pr-2.5 bg-[#111116] text-white text-xs rounded-lg border border-white/[0.08] hover:border-white/[0.16] focus:border-[#7D39EB]/60 focus:ring-1 focus:ring-[#7D39EB] placeholder-[#8E8E9F] transition-colors font-mono uppercase tracking-wider"
                />
              </div>
              <p className="text-[10px] font-mono text-[#565668] leading-tight">
                2-letter ISO code
              </p>
            </div>
          </div>

          {/* Discovery Engine / Provider - Segmented Tactile Selector */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F] flex items-center gap-1.5">
                <span>Discovery Engine / Provider</span>
                <span className="text-[#C6FF33]">• Multi-Source</span>
              </label>
              <span className="text-[10px] font-mono text-[#565668]">Server-side integration</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: "osm" as const,
                  title: "OpenStreetMap",
                  desc: "Global POI Engine",
                  disabled: false,
                  badge: null,
                },
                {
                  value: "geoapify" as const,
                  title: "Geoapify",
                  desc: "Commercial Places",
                  disabled: false,
                  badge: null,
                },
                {
                  value: "google" as const,
                  title: "Google Places",
                  desc: "Coming Soon",
                  disabled: true,
                  badge: "SOON",
                },
              ].map((option) => {
                const isSelected = !option.disabled && provider === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (option.disabled || option.value === "google") return;
                      setProvider(option.value);
                    }}
                    disabled={isSubmitting || option.disabled}
                    aria-disabled={option.disabled ? "true" : undefined}
                    className={`relative p-2.5 rounded-lg border text-left transition-colors select-none ${
                      option.disabled
                        ? "bg-[#111116] border-white/[0.04] text-[#565668] cursor-not-allowed opacity-50"
                        : isSelected
                        ? "bg-[#7D39EB]/15 border-[#7D39EB]/50 text-white shadow-xs cursor-pointer"
                        : "bg-[#111116] hover:bg-[#171720] border-white/[0.08] hover:border-white/[0.16] text-[#CBCBD6] hover:text-white cursor-pointer"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_6px_#C6FF33]" />
                    )}
                    {option.badge && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#8E8E9F]">
                        {option.badge}
                      </span>
                    )}
                    <div
                      className={`text-xs font-semibold tracking-tight ${
                        option.disabled ? "text-[#565668]" : "text-white"
                      }`}
                    >
                      {option.title}
                    </div>
                    <div className="text-[10px] font-mono text-[#8E8E9F] mt-0.5">
                      {option.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Limit / Batch Size - Segmented Tactile Selector */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F] flex items-center gap-1.5">
                <span>Result Limit / Candidate Batch</span>
                <span className="text-[#565668]">• Deduplicated</span>
              </label>
              <span className="text-[10px] font-mono text-[#565668]">MVP cap: 50/day</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "10", title: "10 Prospects", desc: "Fast test query" },
                { value: "25", title: "25 Prospects", desc: "Standard batch" },
                { value: "50", title: "50 Prospects", desc: "Deep discovery cap" },
              ].map((option) => {
                const isSelected = batchSize === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setBatchSize(option.value)}
                    disabled={isSubmitting}
                    className={`relative p-2.5 rounded-lg border text-left transition-colors cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#7D39EB]/15 border-[#7D39EB]/50 text-white shadow-xs"
                        : "bg-[#111116] hover:bg-[#171720] border-white/[0.08] hover:border-white/[0.16] text-[#CBCBD6] hover:text-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_6px_#C6FF33]" />
                    )}
                    <div className="text-xs font-semibold tracking-tight text-white">
                      {option.title}
                    </div>
                    <div className="text-[10px] font-mono text-[#8E8E9F] mt-0.5">
                      {option.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Telemetry Query Preview Box */}
          <div className="p-2.5 rounded-lg bg-[#111116] border border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#8E8E9F]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shrink-0 shadow-[0_0_6px_#C6FF33]" />
              <span className="text-[#565668]">Query:</span>
              <span className="text-white font-sans truncate">
                {niche.trim() || "<Target Niche>"}
              </span>
              <span className="text-[#565668]">in</span>
              <span className="text-white font-sans truncate">
                {location.trim() || "<Location>"}
                {countryCode.trim() ? ` (${countryCode.trim().toUpperCase()})` : ""}
              </span>
            </div>
            <div className="shrink-0 pl-2 flex items-center gap-2 text-[10px] text-[#8E8E9F]">
              <span>
                Engine:{" "}
                <span className="text-[#C6FF33] font-semibold font-mono">
                  {provider === "osm" ? "OSM" : "Geoapify"}
                </span>
              </span>
              <span className="text-[#565668]">|</span>
              <span>
                Batch:{" "}
                <span className="text-[#C6FF33] font-semibold">{batchSize} candidates</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8.5 px-3.5 rounded-lg text-xs font-medium text-[#8E8E9F] hover:text-white bg-[#111116] hover:bg-[#171720] border border-white/[0.08] hover:border-white/[0.16] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleQueueDiscovery}
            disabled={isSubmitting}
            className="h-8.5 px-3.5 rounded-lg text-xs font-semibold text-white bg-[#7D39EB] hover:bg-[#6C2FD1] shadow-[0_0_20px_-4px_rgba(125,57,235,0.4)] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Dispatching Discovery...</span>
              </>
            ) : (
              <>
                <span>Queue Discovery</span>
                <span className="text-xs">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
