"use client";

import { useState, useEffect } from "react";
import { addPallet, updatePallet } from "./actions";
import {
  useBarcodeScanner,
  warehouseValidators,
} from "../../../../addons/barcode-scanner";

type PalletData = {
  id?: string;
  licensePlate: string;
  location?: string;
  partNumber?: string;
  partDescription?: string;
  pieceCount?: number;
};

type PalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  orgSlug: string;
  mode: "add" | "edit";
  initialData?: PalletData;
};

export function PalletModal({
  isOpen,
  onClose,
  deliveryId,
  orgSlug,
  mode,
  initialData,
}: PalletModalProps) {
  const [licensePlate, setLicensePlate] = useState("");
  const [location, setLocation] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [partDescription, setPartDescription] = useState("");
  const [pieceCount, setPieceCount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize barcode scanner
  const {
    scan,
    isScanning,
    error: scanError,
    clearError,
  } = useBarcodeScanner();

  // Pre-fill form when editing or duplicating
  useEffect(() => {
    if (initialData) {
      // Pre-fill with initial data (for both edit and duplicate)
      setLicensePlate(initialData.licensePlate || "");
      setLocation(initialData.location || "");
      setPartNumber(initialData.partNumber || "");
      setPartDescription(initialData.partDescription || "");
      setPieceCount(
        initialData.pieceCount ? String(initialData.pieceCount) : ""
      );
    } else {
      // Clear form when no initial data (new pallet)
      setLicensePlate("");
      setLocation("");
      setPartNumber("");
      setPartDescription("");
      setPieceCount("");
    }
  }, [mode, initialData, isOpen]);

  const handleScanLP = async () => {
    try {
      // Clear any previous scan errors
      clearError();

      // Start barcode scan with license plate focus
      const result = await scan({
        formats: ["CODE_128", "QR_CODE"], // LP codes are usually CODE_128, but include QR as fallback
        timeout: 15000, // 15 second timeout
        hapticFeedback: true,
        camera: { facingMode: "environment" }, // Use rear camera for warehouse scanning
      });

      // Validate the scanned data as a license plate
      if (warehouseValidators.licensePlate(result.data)) {
        setLicensePlate(result.data.toUpperCase());
      } else {
        // If not a valid LP format, still set it but warn user
        setLicensePlate(result.data.toUpperCase());
        alert(
          `Scanned: ${result.data}\n\nNote: This doesn't match expected license plate format, but has been entered. Expected format: 6-8 alphanumeric characters.`
        );
      }
    } catch (scanError: any) {
      // Handle different types of scan errors
      console.log("Scan failed:", scanError.message);

      if (scanError.code === "SCAN_CANCELLED") {
        // User cancelled, no need to show error
        return;
      } else if (scanError.code === "PERMISSION_DENIED") {
        alert(
          "Camera permission required for scanning. Please enable camera access and try again."
        );
      } else if (scanError.code === "TIMEOUT") {
        alert(
          "Scan timed out. Please try again or enter the license plate manually."
        );
      } else {
        alert(
          `Scan failed: ${
            scanError.userMessage || scanError.message
          }\n\nYou can enter the license plate manually.`
        );
      }
    }
  };

  const handleScanLocation = () => {
    // Generate location for demo - TODO: integrate with location selector
    const zone = ["A", "B", "C"][Math.floor(Math.random() * 3)];
    const aisle = String(Math.floor(Math.random() * 20) + 1).padStart(2, "0");
    const position = Math.floor(Math.random() * 8) + 1;
    const scannedLocation = `${zone}-${aisle}-${position}`;
    setLocation(scannedLocation);

    if ("vibrate" in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleSubmit = async () => {
    // Require at least one field to be filled
    const hasLicensePlate = licensePlate.trim();
    const hasLocation = location.trim();
    const hasPartNumber = partNumber.trim();
    const hasPartDescription = partDescription.trim();
    const hasPieceCount = pieceCount.trim();

    if (
      !hasLicensePlate &&
      !hasLocation &&
      !hasPartNumber &&
      !hasPartDescription &&
      !hasPieceCount
    ) {
      alert(
        "Please enter at least one piece of information about the pallet (License Plate, Location, Part Number, Part Description, or Piece Count)"
      );
      return;
    }

    setIsLoading(true);
    try {
      const pieceData = {
        partNumber: partNumber.trim() || undefined,
        partDescription: partDescription.trim() || undefined,
        pieceCount: pieceCount.trim() ? parseInt(pieceCount) : undefined,
      };

      let result;
      if (mode === "add") {
        result = await addPallet(
          deliveryId,
          licensePlate,
          orgSlug,
          location || undefined,
          pieceData
        );
      } else {
        result = await updatePallet(initialData!.id!, orgSlug, {
          licensePlate,
          location: location || undefined,
          partNumber: pieceData.partNumber,
          partDescription: pieceData.partDescription,
          pieceCount: pieceData.pieceCount,
        });
      }

      // Check if server action returned an error object
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }

      // Haptic feedback if available
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }

      onClose();
      window.location.reload();
    } catch (error) {
      // Show error but keep form open with all data intact
      let errorMessage = "An error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(
        `Error ${
          mode === "add" ? "adding" : "updating"
        } pallet: ${errorMessage}`
      );
      setIsLoading(false);
      // Don't close modal, don't clear form data
      return;
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const title = mode === "add" ? "Add Pallet" : "Edit Pallet";
  const submitText = mode === "add" ? "📦 ADD PALLET" : "✓ UPDATE PALLET";
  const loadingText = mode === "add" ? "ADDING..." : "UPDATING...";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "320px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          transform: "scale(1)",
          transition: "transform 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px 20px",
            borderBottom: "1px solid #eee",
            position: "relative",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              margin: 0,
              textAlign: "center",
            }}
          >
            {title}
          </h2>
          <button
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "none",
              border: "none",
              fontSize: "24px",
              color: "#666",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "all 0.2s",
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* License Plate field */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              License Plate (LP) - Optional
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="123456"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "white",
                }}
              />
              <button
                onClick={handleScanLP}
                disabled={isScanning}
                style={{
                  padding: "12px",
                  border: "none",
                  borderRadius: "12px",
                  background: isScanning ? "#90CAF9" : "#6b7280",
                  color: "white",
                  cursor: isScanning ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  transition: "all 0.2s",
                  minWidth: "48px",
                  fontWeight: "bold",
                }}
                title={
                  isScanning ? "Scanning..." : "Scan license plate with camera"
                }
              >
                {isScanning ? "📹" : "📷"}
              </button>
            </div>
          </div>

          {/* Part Number field */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              Part Number (Optional)
            </label>
            <input
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="2912-20"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.2s",
                background: "white",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Part Description field */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              Part Description (Optional)
            </label>
            <input
              type="text"
              value={partDescription}
              onChange={(e) => setPartDescription(e.target.value)}
              placeholder="Mitre saws"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.2s",
                background: "white",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Piece Count field */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              Piece Count (Optional)
            </label>
            <input
              type="number"
              value={pieceCount}
              onChange={(e) => setPieceCount(e.target.value)}
              placeholder="12"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.2s",
                background: "white",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Storage Location field */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              Storage Location (Optional)
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "white",
                }}
              />
              <button
                onClick={handleScanLocation}
                style={{
                  padding: "12px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#6b7280",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "all 0.2s",
                  minWidth: "48px",
                  fontWeight: "bold",
                }}
              >
                📍
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 20px 20px 20px" }}>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: "100%",
              height: "56px",
              background: isLoading ? "#90CAF9" : "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "16px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {isLoading ? loadingText : submitText}
          </button>
        </div>

        {/* Backdrop hint */}
        <div
          style={{
            fontSize: "12px",
            color: "#999",
            textAlign: "center",
            padding: "10px 20px",
            borderTop: "1px solid #eee",
          }}
        >
          Tap outside to close
        </div>
      </div>
    </div>
  );
}
