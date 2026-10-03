import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';

// Dataset Oficial Fallback de Planta LMP
const DEFAULT_FALLBACK_STATE = {
  plant: "Planta LMP Baroid / YPF",
  version: "3.0",
  lastUpdated: new Date().toISOString(),
  sectors: [
    {
      id: "principal",
      name: "Zona de Productos Químicos",
      type: "dual",
      warehouseDimensions: {
        solidos: { rows: 6, columns: ["A", "B", "C", "E", "G", "H", "J", "K", "L", "M"] },
        liquidos: { rows: 6, columns: ["B", "C", "E", "H", "J", "K", "L", "M"] }
      }
    }
  ],
  activeSectorId: "principal",
  warehouseDimensions: {
    solidos: { rows: 6, columns: ["A", "B", "C", "E", "G", "H", "J", "K", "L", "M"] },
    liquidos: { rows: 6, columns: ["B", "C", "E", "H", "J", "K", "L", "M"] }
  },
  productCatalog: [
    { name: "LIME FG", type: "solido", defaultPackage: "Bolsa 20 kg", unitWeight: 20, unit: "KG", color: "#1D4ED8" },
    { name: "GELTONE® II", type: "solido", defaultPackage: "Bolsa 22.68 kg", unitWeight: 22.68, unit: "KG", color: "#15803D" },
    { name: "BARABLOK™ 400 NA", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#374151" },
    { name: "Cloruro de Calcio (CaCl₂)", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#C2410C" },
    { name: "RM-63™", type: "liquido", defaultPackage: "Tambor 208 L", unitWeight: 208, unit: "LT", color: "#0E7490" },
    { name: "DRILTREAT®", type: "liquido", defaultPackage: "IBC Tote 1000 L", unitWeight: 1000, unit: "LT", color: "#4338CA" },
    { name: "INVERMUL® LA", type: "liquido", defaultPackage: "IBC Tote 1000 L", unitWeight: 1000, unit: "LT", color: "#7E22CE" },
    { name: "EZ MUL® LA", type: "liquido", defaultPackage: "IBC Tote 1000 L", unitWeight: 1000, unit: "LT", color: "#BE185D" },
    { name: "BARACARB®-DF FINE", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#475569" }
  ],
  pallets: []
};

const ALL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const getShortProductName = (name) => {
  if (!name) return "";
  if (name.includes("Cloruro de Calcio") || name.includes("CaCl₂")) return "CaCl₂ Calcio";
  if (name.includes("BARABLOK")) return "BARABLOK™ 400";
  if (name.includes("BARACARB")) return "BARACARB® FINE";
  if (name.includes("INVERMUL")) return "INVERMUL® LA";
  if (name.includes("EZ MUL")) return "EZ MUL® LA";
  if (name.includes("GELTONE")) return "GELTONE® II";
  if (name.includes("DRILTREAT")) return "DRILTREAT®";
  if (name.includes("RM-63")) return "RM-63™";
  if (name.includes("LIME")) return "LIME FG";
  return name;
};

const WarehouseLotsSystem = ({ isEditing, lang = 'es', setLang, darkMode, setDarkMode }) => {
  // 1. Estado persistente con Dual-Ring Vault
  const [data, setData] = useState(() => {
    let saved = localStorage.getItem("lmp_warehouse_state");
    if (!saved) {
      saved = localStorage.getItem("lmp_warehouse_state_vault") || localStorage.getItem("baroid_warehouse_backup_persistent");
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          // Filtrar cualquier pestaña no deseada (ej. Equipo 1211) y asegurar "Zona de Productos Químicos"
          if (Array.isArray(parsed.sectors)) {
            parsed.sectors = parsed.sectors
              .filter(s => !s.name?.toLowerCase().includes("1211") && !s.id?.toLowerCase().includes("1211"))
              .map(s => {
                if (s.id === "principal" || s.name?.toLowerCase().includes("nave principal")) {
                  return { ...s, name: "Zona de Productos Químicos" };
                }
                return s;
              });
            if (parsed.sectors.length === 0) {
              parsed.sectors = DEFAULT_FALLBACK_STATE.sectors;
            }
          } else {
            parsed.sectors = DEFAULT_FALLBACK_STATE.sectors;
          }
          if (parsed.pallets && Array.isArray(parsed.pallets)) {
            parsed.pallets = parsed.pallets.filter(p => !p.sectorId?.toLowerCase().includes("1211"));
          }
          return parsed;
        }
      } catch (e) {
        console.error("Error reading saved warehouse state:", e);
      }
    }
    return DEFAULT_FALLBACK_STATE;
  });

  const [activeSectorId, setActiveSectorId] = useState(data.activeSectorId || "principal");
  const [selectedPallet, setSelectedPallet] = useState(null);
  const [copiedPallet, setCopiedPallet] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); // { type: 'lot' | 'product' | 'partial', value: string }
  const [zoomLevel, setZoomLevel] = useState(1);
  const [undoStack, setUndoStack] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  // Modales
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [receptionTarget, setReceptionTarget] = useState(null);
  const [showPalletActionModal, setShowPalletActionModal] = useState(false);
  const [actionPallet, setActionPallet] = useState(null);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [showNewSectorModal, setShowNewSectorModal] = useState(false);

  // Refs de scroll horizontal
  const solidsScrollRef = useRef(null);
  const liquidsScrollRef = useRef(null);

  // Auto-Toast Helper
  const showToast = (text, type = "info") => {
    setToastMsg({ text, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // Persistencia Dual-Ring Vault en cada cambio de data
  const persistData = (nextData, pushUndo = true) => {
    if (pushUndo) {
      setUndoStack(prev => [...prev.slice(-19), JSON.stringify(data)]);
    }
    nextData.lastUpdated = new Date().toISOString();
    setData(nextData);

    const serialized = JSON.stringify(nextData);
    try {
      localStorage.setItem("lmp_warehouse_state", serialized);
      localStorage.setItem("lmp_warehouse_state_vault", serialized);
      localStorage.setItem("baroid_warehouse_backup_persistent", serialized);
    } catch (err) {
      console.error("Error saving warehouse state to vault:", err);
    }
  };

  const undoLastAction = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(prevStack => prevStack.slice(0, -1));
    try {
      const parsed = JSON.parse(prev);
      setData(parsed);
      const serialized = JSON.stringify(parsed);
      localStorage.setItem("lmp_warehouse_state", serialized);
      localStorage.setItem("lmp_warehouse_state_vault", serialized);
      localStorage.setItem("baroid_warehouse_backup_persistent", serialized);
      showToast("Último movimiento deshecho.", "warning");
    } catch (e) {
      console.error("Undo error:", e);
    }
  };

  const fileInputRef = useRef(null);

  // Importar Inventario desde Archivo JSON
  const handleImportInventoryJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported || !Array.isArray(imported.pallets)) {
          showToast("❌ El archivo no contiene un formato válido (falta lista de pallets).", "error");
          return;
        }

        // Normalización preventiva de nombres de productos oficiales Baroid
        const normalizedPallets = imported.pallets.map(p => {
          let prodName = p.product || "";
          if (prodName.includes("Calcio") || prodName.includes("CaCl")) prodName = "Cloruro de Calcio (CaCl₂)";
          else if (prodName.includes("BARABLOK")) prodName = "BARABLOK™ 400 NA";
          else if (prodName.includes("BARACARB")) prodName = "BARACARB®-DF FINE";
          else if (prodName.includes("INVERMUL")) prodName = "INVERMUL® LA";
          else if (prodName.includes("EZ MUL")) prodName = "EZ MUL® LA";
          else if (prodName.includes("DRILTREAT")) prodName = "DRILTREAT®";
          else if (prodName.includes("GELTONE")) prodName = "GELTONE® II";
          else if (prodName.includes("RM-63")) prodName = "RM-63™";
          else if (prodName.includes("LIME")) prodName = "LIME FG";

          return {
            ...p,
            product: prodName,
            sectorId: p.sectorId || "principal"
          };
        });

        const nextData = {
          ...data,
          ...imported,
          pallets: normalizedPallets,
          sectors: imported.sectors || data.sectors,
          productCatalog: imported.productCatalog || data.productCatalog,
          warehouseDimensions: imported.warehouseDimensions || data.warehouseDimensions
        };

        persistData(nextData);
        showToast(`✅ Inventario cargado con éxito: ${normalizedPallets.length} pallets y lotes importados.`, "success");
      } catch (err) {
        console.error("Error importando JSON:", err);
        showToast("❌ Error al procesar el archivo JSON.", "error");
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = '';
  };

  // Exportar Copia de Seguridad JSON
  const handleExportInventoryJson = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LMP_Inventario_Almacen_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("📥 Copia de seguridad JSON descargada.", "success");
  };

  // Vaciar Almacén (Empezar de Cero)
  const handleClearWarehouse = () => {
    if (confirm("¿Estás seguro de que deseas vaciar todos los lotes del almacén para comenzar desde cero? Podrás deshacer esta acción con Ctrl+Z.")) {
      const nextData = {
        ...data,
        pallets: []
      };
      persistData(nextData);
      showToast("🗑️ Almacén vaciado. Listo para nuevo inventario.", "info");
    }
  };

  // Sector actual
  const currentSector = useMemo(() => {
    return (data.sectors && data.sectors.find(s => s.id === activeSectorId)) || data.sectors[0] || {
      id: "principal",
      name: "Nave Principal",
      type: "dual"
    };
  }, [data.sectors, activeSectorId]);

  // KPIs
  const { totalSlots, occupiedCount, freeSlots, occPct, freeSolids, freeLiquids } = useMemo(() => {
    let tSlots = 108;
    let sOccupied = 0;
    let lOccupied = 0;
    let sSlots = 60;
    let lSlots = 48;

    if (currentSector.id === "principal") {
      const sDims = data.warehouseDimensions?.solidos || { rows: 6, columns: ["A", "B", "C", "E", "G", "H", "J", "K", "L", "M"] };
      const lDims = data.warehouseDimensions?.liquidos || { rows: 6, columns: ["B", "C", "E", "H", "J", "K", "L", "M"] };
      sSlots = (sDims.rows || 6) * (sDims.columns?.length || 10);
      lSlots = (lDims.rows || 6) * (lDims.columns?.length || 8);
      tSlots = sSlots + lSlots;
      sOccupied = data.pallets.filter(p => (p.sectorId || "principal") === "principal" && p.zone === "solidos" && p.quantity > 0).length;
      lOccupied = data.pallets.filter(p => (p.sectorId || "principal") === "principal" && p.zone === "liquidos" && p.quantity > 0).length;
    } else {
      const nRows = currentSector.rows || 6;
      const nCols = currentSector.columns ? currentSector.columns.length : 6;
      tSlots = nRows * nCols;
      const occ = data.pallets.filter(p => (p.sectorId || "principal") === currentSector.id && p.quantity > 0).length;
      if (currentSector.type === "liquidos") {
        lSlots = tSlots;
        lOccupied = occ;
        sSlots = 0;
      } else {
        sSlots = tSlots;
        sOccupied = occ;
        lSlots = 0;
      }
    }

    const occ = sOccupied + lOccupied;
    const free = Math.max(0, tSlots - occ);
    const pct = tSlots > 0 ? Math.round((occ / tSlots) * 100) : 0;
    return {
      totalSlots: tSlots,
      occupiedCount: occ,
      freeSlots: free,
      occPct: pct,
      freeSolids: Math.max(0, sSlots - sOccupied),
      freeLiquids: Math.max(0, lSlots - lOccupied)
    };
  }, [data, currentSector]);

  // Desplazamiento por Flechas (1 Columna = 116px)
  const scrollBays = (zoneKey, direction) => {
    const ref = zoneKey === "solidos" ? solidsScrollRef.current : liquidsScrollRef.current;
    if (!ref) return;
    const delta = direction === "left" ? -116 : 116;
    ref.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Eliminar Sector Personalizado
  const handleDeleteSector = (sectorId) => {
    if (sectorId === "principal") return;
    const sec = data.sectors.find(s => s.id === sectorId);
    if (!window.confirm(`¿Eliminar la pestaña "${sec?.name || sectorId}" y sus pallets asignados?`)) return;
    const nextSectors = data.sectors.filter(s => s.id !== sectorId);
    const nextPallets = data.pallets.filter(p => (p.sectorId || "principal") !== sectorId);
    persistData({ ...data, sectors: nextSectors, pallets: nextPallets });
    if (activeSectorId === sectorId) {
      setActiveSectorId("principal");
    }
    showToast(`Pestaña "${sec?.name || ''}" eliminada`, "info");
  };

  // Selección de Pallet
  const handlePalletClick = (pallet, zone, col, row) => {
    if (!pallet) {
      // 1 Clic en Celda Vacía -> Abrir Recepción Inmediata
      if (copiedPallet) {
        // Pegar de portapapeles
        const newPallet = {
          ...copiedPallet,
          id: `PAL-${zone.substring(0,3).toUpperCase()}-${col}${row}-${Date.now().toString().slice(-4)}`,
          zone,
          col,
          row,
          sectorId: activeSectorId
        };
        const nextPallets = data.pallets.filter(p => !(p.zone === zone && p.col === col && p.row === row && (p.sectorId || "principal") === activeSectorId));
        nextPallets.push(newPallet);
        persistData({ ...data, pallets: nextPallets });
        showToast(`✓ Pallet pegado en ${col}${row} (${newPallet.product})`, "success");
      } else {
        setReceptionTarget({ zone, col, row, sectorId: activeSectorId });
        setShowReceptionModal(true);
      }
      return;
    }

    // 1 Clic en Pallet Ocupado -> Seleccionar (para Ctrl+C / Supr)
    setSelectedPallet(pallet);
    showToast(`✓ Pallet seleccionado en ${col}${row} (${pallet.product}). Copiar: Ctrl+C | Consumir: Doble clic.`, "info");
  };

  // Doble Clic en Pallet Ocupado -> Abrir Modal de Consumo
  const handlePalletDblClick = (pallet) => {
    if (!pallet) return;
    setActionPallet(pallet);
    setShowPalletActionModal(true);
  };

  // Copiar Pallet
  const handleCopyPallet = (pallet, e) => {
    if (e) e.stopPropagation();
    setCopiedPallet(pallet);
    showToast(`📋 Pallet copiado (${pallet.product} L: ${pallet.lot}). Haz clic en cualquier celda libre para pegar.`, "info");
  };

  // Eliminar / Vaciar Pallet
  const handleDeletePallet = (pallet, e) => {
    if (e) e.stopPropagation();
    if (confirm(`¿Vaciar / eliminar pallet de ${pallet.product} (Lote: ${pallet.lot}) en ${pallet.col}${pallet.row}?`)) {
      const nextPallets = data.pallets.filter(p => p.id !== pallet.id);
      persistData({ ...data, pallets: nextPallets });
      showToast(`✓ Pallet en ${pallet.col}${pallet.row} vaciado a 0.`, "warning");
    }
  };

  // Toggle Resaltar Parciales
  const togglePartialFilter = () => {
    if (activeFilter && activeFilter.type === "partial") {
      setActiveFilter(null);
      showToast("Filtro de parciales desactivado.", "info");
    } else {
      setActiveFilter({ type: "partial", value: "partial" });
      const partialsCount = data.pallets.filter(p => {
        const isPart = p.status === "partial" || (p.capacityNominal && Number(p.quantity) < Number(p.capacityNominal));
        return (p.sectorId || "principal") === activeSectorId && isPart;
      }).length;
      showToast(`✨ Resaltando ${partialsCount} pallets parciales / remanentes.`, "info");
    }
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoLastAction();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedPallet) {
        e.preventDefault();
        handleCopyPallet(selectedPallet);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPallet, undoStack, data]);

  // Resumen acumulado por producto y lote
  const stockSummary = useMemo(() => {
    const map = {};
    data.pallets.forEach(p => {
      if ((p.sectorId || "principal") !== activeSectorId || !p.quantity || p.quantity <= 0) return;
      if (!map[p.product]) {
        map[p.product] = {
          name: p.product,
          totalQty: 0,
          unit: p.unit || "KG",
          lots: {}
        };
      }
      map[p.product].totalQty += Number(p.quantity);
      map[p.product].lots[p.lot] = (map[p.product].lots[p.lot] || 0) + Number(p.quantity);
    });
    return Object.values(map);
  }, [data.pallets, activeSectorId]);

  // Exportar CSV Excel
  const exportCsv = () => {
    const activePallets = data.pallets.filter(p => Number(p.quantity) > 0 && (p.sectorId || "principal") === activeSectorId);
    if (activePallets.length === 0) {
      showToast("No hay pallets con stock en este sector para exportar.", "warning");
      return;
    }
    const rows = [];
    rows.push("=== RESUMEN DE STOCK CONSOLIDADO POR PRODUCTO Y LOTE ===");
    rows.push(["Producto", "Lote", "Stock Total", "Unidad"].join(";"));
    stockSummary.forEach(prod => {
      Object.keys(prod.lots).forEach(lot => {
        rows.push([`"${prod.name}"`, `"${lot}"`, String(prod.lots[lot]).replace('.', ','), prod.unit].join(";"));
      });
    });
    rows.push("");
    rows.push("=== DETALLE FISICO POR POSICION ===");
    rows.push(["Posicion", "Zona", "Producto", "Lote", "Cantidad", "Unidad", "Estado"].join(";"));
    activePallets.forEach(p => {
      const isPart = p.status === "partial" || (p.capacityNominal && Number(p.quantity) < Number(p.capacityNominal));
      rows.push([`${p.col}${p.row}`, p.zone, `"${p.product}"`, `"${p.lot}"`, String(p.quantity).replace('.', ','), p.unit, isPart ? "PARCIAL" : "COMPLETO"].join(";"));
    });

    const csvContent = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Stock_Lotes_${currentSector.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    showToast("✓ Archivo Excel CSV descargado con éxito.", "success");
  };

  // Render Pallet Card Individual
  const renderPalletCard = (zone, col, row) => {
    const pallet = data.pallets.find(p =>
      (p.sectorId || "principal") === activeSectorId &&
      p.zone === zone &&
      p.col === col &&
      p.row === row &&
      p.quantity > 0
    );

    const isSelected = selectedPallet && selectedPallet.id === pallet?.id;
    const isCopied = copiedPallet && copiedPallet.id === pallet?.id;

    if (!pallet) {
      return (
        <div
          key={`${zone}-${col}-${row}`}
          onClick={() => handlePalletClick(null, zone, col, row)}
          className={`w-[98px] min-w-[98px] max-w-[98px] h-[80px] min-h-[80px] max-h-[80px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            copiedPallet
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 animate-pulse hover:bg-blue-100 hover:scale-105'
              : 'bg-slate-50/80 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 hover:border-halliburton-red hover:bg-red-50/10 text-slate-400 dark:text-slate-500'
          }`}
          title={copiedPallet ? `Pegar pallet copiado en ${col}${row}` : `Clic: Ingresar pallet en ${col}${row}`}
        >
          {copiedPallet ? (
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 uppercase tracking-wider">
              <Icon name="copy" size={12} /> Pegar {col}{row}
            </span>
          ) : (
            <span className="text-xs font-black tracking-wider text-slate-400 dark:text-slate-600">
              + {col}{row}
            </span>
          )}
        </div>
      );
    }

    const cap = Number(pallet.capacityNominal) || Number(pallet.quantity) || 1000;
    const isPartial = pallet.status === "partial" || (cap > 0 && Number(pallet.quantity) < cap);
    const pct = cap > 0 ? Math.min(100, Math.round((Number(pallet.quantity) / cap) * 100)) : 100;

    // Lógica de resaltado y atenuación en escala de grises
    let isDimmed = false;
    let isHighlighted = false;

    if (activeFilter) {
      if (activeFilter.type === "partial") {
        if (isPartial) isHighlighted = true;
        else isDimmed = true;
      } else if (activeFilter.type === "lot") {
        if (pallet.lot === activeFilter.value) isHighlighted = true;
        else isDimmed = true;
      } else if (activeFilter.type === "product") {
        if (pallet.product === activeFilter.value) isHighlighted = true;
        else isDimmed = true;
      }
    }

    const prodDef = data.productCatalog.find(p => p.name === pallet.product);
    const bgColor = prodDef ? prodDef.color : "#991B1B";
    const shortName = getShortProductName(pallet.product);

    return (
      <div
        key={pallet.id}
        onClick={() => handlePalletClick(pallet, zone, col, row)}
        onDoubleClick={() => handlePalletDblClick(pallet)}
        style={{ backgroundColor: bgColor }}
        className={`w-[98px] min-w-[98px] max-w-[98px] h-[80px] min-h-[80px] max-h-[80px] rounded-xl relative p-1 pt-3.5 flex flex-col items-center justify-center cursor-pointer select-none transition-all overflow-hidden ${
          isSelected ? 'ring-4 ring-sky-400 ring-offset-2 z-20 shadow-xl scale-105' : 'shadow-md hover:scale-102 hover:shadow-lg'
        } ${isPartial ? 'border-2 border-dashed border-amber-400 shadow-[inset_0_0_10px_rgba(245,158,11,0.3)]' : 'border border-white/20'} ${
          isDimmed ? 'opacity-20 grayscale contrast-75 scale-95' : ''
        } ${isHighlighted ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 z-30 shadow-2xl animate-pulse' : ''}`}
        title={`${pallet.product} | Lote: ${pallet.lot} | Cantidad: ${pallet.quantity} ${pallet.unit}${isPartial ? ` (PARCIAL: ${pct}%)` : ''} | Posición: ${col}${row}`}
      >
        {/* Botón Copiar (Esquina Sup. Izquierda) */}
        <button
          type="button"
          onClick={(e) => handleCopyPallet(pallet, e)}
          className="absolute top-1 left-1 w-[18px] h-[18px] rounded-md bg-slate-900/60 backdrop-blur-sm border border-white/40 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-blue-600 hover:scale-110 transition-all z-10"
          title="Copiar pallet (Ctrl+C)"
        >
          <Icon name="copy" size={10} />
        </button>

        {/* Botón Eliminar / Vaciar (Esquina Sup. Derecha - Cruz Roja) */}
        <button
          type="button"
          onClick={(e) => handleDeletePallet(pallet, e)}
          className="absolute top-1 right-1 w-[18px] h-[18px] rounded-md bg-red-600 border border-white/60 text-white flex items-center justify-center opacity-85 hover:opacity-100 hover:bg-red-700 hover:scale-110 transition-all z-10 shadow-sm"
          title="Eliminar / Vaciar pallet a 0"
        >
          <Icon name="x" size={11} />
        </button>

        {/* Contenido Central: Nombre, Cantidad y Lote */}
        <div className="flex flex-col items-center justify-center text-center w-full gap-0.5 leading-none">
          <span className="text-[9.5px] font-black uppercase text-white tracking-tight drop-shadow max-w-[96%] overflow-hidden line-clamp-2 text-center" style={{ lineHeight: '1.05' }}>
            {shortName}
          </span>
          <span className="text-[11px] font-black text-white font-mono tracking-tight drop-shadow">
            {Number(pallet.quantity).toLocaleString("es-AR")} {pallet.unit}
          </span>
          <span className="text-[9px] font-black text-amber-200 font-mono tracking-tight drop-shadow">
            L: {pallet.lot}
          </span>
          {isPartial && (
            <span className="bg-amber-500 text-slate-950 text-[7.5px] font-black px-1 py-0.5 rounded uppercase tracking-wider shadow-sm mt-0.5">
              ⚠️ {pct}%
            </span>
          )}
        </div>

        {/* Barra de nivel ámbar para parciales */}
        {isPartial && (
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-amber-400 shadow-[0_0_6px_#f59e0b]"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    );
  };

  // Dimensiones del sector activo
  const sDims = currentSector.id === "principal"
    ? (data.warehouseDimensions?.solidos || { rows: 6, columns: ["A", "B", "C", "E", "G", "H", "J", "K", "L", "M"] })
    : { rows: currentSector.rows || 6, columns: currentSector.columns || ["A","B","C","D"] };

  const lDims = currentSector.id === "principal"
    ? (data.warehouseDimensions?.liquidos || { rows: 6, columns: ["B", "C", "E", "H", "J", "K", "L", "M"] })
    : { rows: currentSector.rows || 6, columns: currentSector.columns || ["A","B","C","D"] };

  return (
    <div className="space-y-4 text-left font-sans">
      
      {/* Toast Notificación */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 text-white shadow-2xl border-l-4 border-halliburton-red animate-slide-in">
          <Icon name="info" size={16} className="text-halliburton-red" />
          <span className="text-xs font-bold">{toastMsg.text}</span>
        </div>
      )}

      {/* Banner de Portapapeles (Activo cuando hay un pallet copiado) */}
      {copiedPallet && (
        <div className="p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/40 rounded-2xl flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Icon name="copy" size={16} />
            </div>
            <div>
              <span className="font-black text-blue-400 uppercase tracking-wider">Modo Copiar Activo:</span>
              <span className="font-bold text-white ml-2">{copiedPallet.product}</span> &bull; Lote <span className="font-black text-amber-400">{copiedPallet.lot}</span> ({copiedPallet.quantity} {copiedPallet.unit})
              <span className="text-zinc-400 ml-2 italic text-[11px]">Haz clic en cualquier celda libre (+) para pegar.</span>
            </div>
          </div>
          <button
            onClick={() => setCopiedPallet(null)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-wider"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Barra de Herramientas y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-5 bg-halliburton-red rounded-full"></div>
            <h2 className="text-xl lg:text-2xl font-black uppercase italic leading-none tracking-tight text-zinc-800 dark:text-white">
              Mapa de Zona de Productos
            </h2>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 pl-4 uppercase tracking-wider mt-0.5">
            Monitoreo y control de lotes &bull; {currentSector.name}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón Ingreso Pallet */}
          <button
            onClick={() => { setReceptionTarget(null); setShowReceptionModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <Icon name="plus-circle" size={14} />
            <span>Ingreso Pallet</span>
          </button>

          {/* Botón Resaltar Parciales / Remanentes */}
          <button
            onClick={togglePartialFilter}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm ${
              activeFilter?.type === "partial"
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/30'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}
            title="Resaltar únicamente pallets con saldo parcial y atenuar completos en escala de grises"
          >
            <Icon name="sparkles" size={14} />
            <span>{activeFilter?.type === "partial" ? "Mostrando Parciales" : "Resaltar Parciales"}</span>
          </button>

          {/* Badge de Filtro Activo */}
          {activeFilter && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs font-black text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>{activeFilter.type === "partial" ? "Solo Parciales" : `Filtro: ${activeFilter.value}`}</span>
              <button onClick={() => setActiveFilter(null)} className="ml-1 text-zinc-400 hover:text-white">&times;</button>
            </div>
          )}

          {/* Cargar Inventario JSON */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportInventoryJson}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
            title="Cargar inventario desde archivo JSON en este equipo"
          >
            <Icon name="upload" size={14} className="text-halliburton-red" />
            <span>Cargar JSON</span>
          </button>

          {/* Respaldar JSON */}
          <button
            onClick={handleExportInventoryJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
            title="Descargar copia de seguridad completa del inventario (JSON)"
          >
            <Icon name="download" size={14} />
            <span className="hidden sm:inline">Respaldar</span>
          </button>

          {/* Vaciar Almacén */}
          {data.pallets.filter(p => (p.sectorId || 'principal') === activeSectorId && p.quantity > 0).length > 0 && (
            <button
              onClick={handleClearWarehouse}
              className="flex items-center gap-1 px-2.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-halliburton-red rounded-xl text-xs font-bold transition-all"
              title="Vaciar todos los lotes para comenzar de cero"
            >
              <Icon name="trash-2" size={13} />
              <span className="hidden xl:inline text-[11px]">Vaciar</span>
            </button>
          )}

          {/* Botón Deshacer (Ctrl+Z) */}
          <button
            onClick={undoLastAction}
            disabled={undoStack.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-all"
            title="Deshacer último movimiento (Ctrl+Z)"
          >
            <Icon name="rotate-ccw" size={14} />
            <span>Deshacer</span>
          </button>

          {/* Zoom */}
          <div className="flex items-center bg-zinc-100 dark:bg-slate-800/80 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700">
            <button onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.05))} className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white" title="Reducir zoom">
              <Icon name="minus" size={12} />
            </button>
            <span className="text-[10px] font-black px-1.5 text-zinc-600 dark:text-zinc-300">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(prev => Math.min(1.25, prev + 0.05))} className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white" title="Aumentar zoom">
              <Icon name="plus" size={12} />
            </button>
          </div>

          {/* Idioma ES / EN (Integrado sin superposiciones) */}
          {setLang && (
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
              title={lang === 'es' ? "Switch to English" : "Cambiar a Español"}
            >
              <Icon name="globe" size={13} className="text-halliburton-red" />
              <span>{lang.toUpperCase()}</span>
            </button>
          )}

          {/* Modo Oscuro / Claro Toggle */}
          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-all shadow-sm"
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              <Icon name={darkMode ? "sun" : "moon"} size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Pestañas de Sectores */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar-thick pb-1">
          {data.sectors.map(sec => {
            const count = data.pallets.filter(p => (p.sectorId || "principal") === sec.id && p.quantity > 0).length;
            const isActive = sec.id === activeSectorId;
            return (
              <button
                key={sec.id}
                onClick={() => { setActiveSectorId(sec.id); setSelectedPallet(null); setActiveFilter(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-halliburton-red text-white shadow-md'
                    : 'bg-white dark:bg-slate-800/60 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{sec.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-slate-700 text-zinc-500 dark:text-zinc-300'}`}>
                  {count}
                </span>
                {sec.id !== "principal" && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSector(sec.id);
                    }}
                    className="ml-1 opacity-60 hover:opacity-100 hover:text-red-300 font-black cursor-pointer text-sm leading-none"
                    title={`Cerrar / eliminar pestaña "${sec.name}"`}
                  >
                    &times;
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowNewSectorModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all"
        >
          <Icon name="plus" size={14} className="text-halliburton-red" />
          <span>Nueva Pestaña</span>
        </button>
      </div>

      {/* KPIs Compactos: Capacidad de Pedido y Ocupación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* KPI 1: Espacios Libres para Pedido */}
        <div className="p-3.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Icon name="package-plus" size={20} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">Capacidad de Pedido</span>
              <div className="text-xl font-black italic tracking-tight text-emerald-500 leading-tight">
                {freeSlots} Libres
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-xs hidden sm:block">
            <div className="w-full bg-zinc-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalSlots > 0 ? (freeSlots / totalSlots) * 100 : 0}%` }}></div>
            </div>
            <div className="text-[9px] text-zinc-400 font-bold mt-1 text-right">
              Capacidad disponible para solicitar
            </div>
          </div>
        </div>

        {/* KPI 2: Ocupación Actual */}
        <div className="p-3.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-halliburton-red/10 text-halliburton-red flex items-center justify-center shrink-0">
              <Icon name="layers" size={20} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">Ocupación Actual</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black italic tracking-tight text-zinc-800 dark:text-white leading-tight">
                  {occupiedCount} / {totalSlots}
                </span>
                <span className="text-xs font-black text-zinc-400">({occPct}%)</span>
              </div>
            </div>
          </div>
          {currentSector.id === "principal" && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 shrink-0">
              <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 font-black">Sólidos: <strong className="text-zinc-700 dark:text-zinc-200">{freeSolids} Libres</strong></span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-500 font-black">Líquidos: <strong className="text-zinc-700 dark:text-zinc-200">{freeLiquids} Libres</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* CUERPO PRINCIPAL: BAHÍAS DEL ALMACÉN (IZQ) + STOCK CONSOLIDADO (DER) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        
        {/* Columna Izquierda: Grillas de Almacén */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4 min-w-0">
          
          {/* Banner de Bienvenida / Almacén Limpio */}
          {occupiedCount === 0 && (
            <div className="p-4 bg-zinc-50 dark:bg-slate-800/40 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-zinc-500 dark:text-zinc-300">
                  <Icon name="package" size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-200">
                    Almacén Limpio (Sin Lotes Asignados)
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    El mapa está listo para operar. Puedes cargar tu inventario desde archivo JSON o ingresar pallets haciendo un clic en cualquier posición vacía.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <Icon name="upload" size={14} />
                  <span>Cargar Inventario (JSON)</span>
                </button>
              </div>
            </div>
          )}

          {/* ZONA SÓLIDOS */}
          {(currentSector.id === "principal" || currentSector.type === "solidos" || currentSector.type === "mixto") && (
            <div className="p-4 lg:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 font-black text-xs uppercase tracking-wider">
                    {currentSector.id === "principal" ? "ZONA SÓLIDOS" : currentSector.name.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    Polvos y Arcillas ({sDims.rows} Filas &bull; {sDims.columns.length} Cols)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Flechas de Navegación por Columna (◀ Cols ▶) */}
                  <div className="flex items-center bg-zinc-100 dark:bg-slate-800 rounded-xl p-0.5 border border-zinc-200 dark:border-zinc-700" title="Navegar columna a columna">
                    <button
                      onClick={() => scrollBays("solidos", "left")}
                      className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-halliburton-red hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      title="Columna anterior (◀)"
                    >
                      <Icon name="chevron-left" size={16} />
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1 text-zinc-400">Cols</span>
                    <button
                      onClick={() => scrollBays("solidos", "right")}
                      className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-halliburton-red hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      title="Columna siguiente (▶)"
                    >
                      <Icon name="chevron-right" size={16} />
                    </button>
                  </div>

                  {/* + Fila */}
                  <button
                    onClick={() => {
                      const next = { ...data };
                      if (currentSector.id === "principal") {
                        next.warehouseDimensions.solidos.rows = Math.min(20, (next.warehouseDimensions.solidos.rows || 6) + 1);
                      } else {
                        const s = next.sectors.find(x => x.id === currentSector.id);
                        if (s) s.rows = Math.min(20, (s.rows || 6) + 1);
                      }
                      persistData(next);
                      showToast("+1 Fila agregada a Sólidos", "success");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    + Fila
                  </button>

                  {/* + Col */}
                  <button
                    onClick={() => {
                      const next = { ...data };
                      const targetCols = currentSector.id === "principal"
                        ? next.warehouseDimensions.solidos.columns
                        : next.sectors.find(x => x.id === currentSector.id).columns;
                      const nextLetter = ALL_ALPHABET.find(l => !targetCols.includes(l)) || "Z";
                      targetCols.push(nextLetter);
                      targetCols.sort();
                      persistData(next);
                      showToast(`+ Columna ${nextLetter} agregada a Sólidos`, "success");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    + Col
                  </button>
                </div>
              </div>

              {/* Grilla con Barra de Scroll Gruesa (12px) y Flechas Tenues a los Bordes */}
              <div className="relative group/zone">
                {/* Flecha tenue lateral izquierda */}
                <button
                  type="button"
                  onClick={() => scrollBays("solidos", "left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-16 rounded-r-xl bg-zinc-900/40 hover:bg-zinc-900/80 text-white backdrop-blur-sm border-y border-r border-white/20 shadow-lg flex items-center justify-center opacity-0 group-hover/zone:opacity-30 hover:!opacity-100 transition-all duration-200 active:scale-95 cursor-pointer"
                  title="Desplazar a columnas anteriores (◀)"
                >
                  <Icon name="chevron-left" size={18} />
                </button>

                <div
                  ref={solidsScrollRef}
                  className="overflow-x-auto custom-scrollbar-thick pb-3 scroll-smooth px-1"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
                >
                  <div className="flex gap-2 items-stretch py-1 min-w-max">
                    {sDims.columns.map((colLetter, cIdx) => (
                      <React.Fragment key={`sol-col-${colLetter}`}>
                        {cIdx > 0 && (
                          <div
                            className="w-[16px] min-w-[16px] max-w-[16px] rounded-lg bg-slate-100/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 select-none tracking-widest shrink-0"
                            style={{ writingMode: 'vertical-rl' }}
                          >
                            PASILLO
                          </div>
                        )}
                        <div className="w-[98px] min-w-[98px] max-w-[98px] flex flex-col gap-1.5 shrink-0">
                          {Array.from({ length: sDims.rows }, (_, rIdx) => rIdx + 1).map(rowNum =>
                            renderPalletCard("solidos", colLetter, rowNum)
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Flecha tenue lateral derecha */}
                <button
                  type="button"
                  onClick={() => scrollBays("solidos", "right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-16 rounded-l-xl bg-zinc-900/40 hover:bg-zinc-900/80 text-white backdrop-blur-sm border-y border-l border-white/20 shadow-lg flex items-center justify-center opacity-0 group-hover/zone:opacity-30 hover:!opacity-100 transition-all duration-200 active:scale-95 cursor-pointer"
                  title="Desplazar a columnas siguientes (▶)"
                >
                  <Icon name="chevron-right" size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ZONA LÍQUIDOS */}
          {(currentSector.id === "principal" || currentSector.type === "liquidos") && (
            <div className="p-4 lg:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-0.5 rounded-lg bg-purple-500/10 text-purple-500 font-black text-xs uppercase tracking-wider">
                    {currentSector.id === "principal" ? "ZONA LÍQUIDOS" : currentSector.name.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    Tambores 208 L y IBC 1.000 L ({lDims.rows} Filas &bull; {lDims.columns.length} Cols)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Flechas de Navegación por Columna (◀ Cols ▶) */}
                  <div className="flex items-center bg-zinc-100 dark:bg-slate-800 rounded-xl p-0.5 border border-zinc-200 dark:border-zinc-700" title="Navegar columna a columna">
                    <button
                      onClick={() => scrollBays("liquidos", "left")}
                      className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-halliburton-red hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      title="Columna anterior (◀)"
                    >
                      <Icon name="chevron-left" size={16} />
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1 text-zinc-400">Cols</span>
                    <button
                      onClick={() => scrollBays("liquidos", "right")}
                      className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-halliburton-red hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      title="Columna siguiente (▶)"
                    >
                      <Icon name="chevron-right" size={16} />
                    </button>
                  </div>

                  {/* + Fila */}
                  <button
                    onClick={() => {
                      const next = { ...data };
                      if (currentSector.id === "principal") {
                        next.warehouseDimensions.liquidos.rows = Math.min(20, (next.warehouseDimensions.liquidos.rows || 6) + 1);
                      } else {
                        const s = next.sectors.find(x => x.id === currentSector.id);
                        if (s) s.rows = Math.min(20, (s.rows || 6) + 1);
                      }
                      persistData(next);
                      showToast("+1 Fila agregada a Líquidos", "success");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    + Fila
                  </button>

                  {/* + Col */}
                  <button
                    onClick={() => {
                      const next = { ...data };
                      const targetCols = currentSector.id === "principal"
                        ? next.warehouseDimensions.liquidos.columns
                        : next.sectors.find(x => x.id === currentSector.id).columns;
                      const nextLetter = ALL_ALPHABET.find(l => !targetCols.includes(l)) || "Z";
                      targetCols.push(nextLetter);
                      targetCols.sort();
                      persistData(next);
                      showToast(`+ Columna ${nextLetter} agregada a Líquidos`, "success");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    + Col
                  </button>
                </div>
              </div>

              {/* Grilla con Barra de Scroll Gruesa (12px) y Flechas Tenues a los Bordes */}
              <div className="relative group/zone">
                {/* Flecha tenue lateral izquierda */}
                <button
                  type="button"
                  onClick={() => scrollBays("liquidos", "left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-16 rounded-r-xl bg-zinc-900/40 hover:bg-zinc-900/80 text-white backdrop-blur-sm border-y border-r border-white/20 shadow-lg flex items-center justify-center opacity-0 group-hover/zone:opacity-30 hover:!opacity-100 transition-all duration-200 active:scale-95 cursor-pointer"
                  title="Desplazar a columnas anteriores (◀)"
                >
                  <Icon name="chevron-left" size={18} />
                </button>

                <div
                  ref={liquidsScrollRef}
                  className="overflow-x-auto custom-scrollbar-thick pb-3 scroll-smooth px-1"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
                >
                  <div className="flex gap-2 items-stretch py-1 min-w-max">
                    {lDims.columns.map((colLetter, cIdx) => (
                      <React.Fragment key={`liq-col-${colLetter}`}>
                        {cIdx > 0 && (
                          <div
                            className="w-[16px] min-w-[16px] max-w-[16px] rounded-lg bg-slate-100/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 select-none tracking-widest shrink-0"
                            style={{ writingMode: 'vertical-rl' }}
                          >
                            PASILLO
                          </div>
                        )}
                        <div className="w-[98px] min-w-[98px] max-w-[98px] flex flex-col gap-1.5 shrink-0">
                          {Array.from({ length: lDims.rows }, (_, rIdx) => rIdx + 1).map(rowNum =>
                            renderPalletCard("liquidos", colLetter, rowNum)
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Flecha tenue lateral derecha */}
                <button
                  type="button"
                  onClick={() => scrollBays("liquidos", "right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-16 rounded-l-xl bg-zinc-900/40 hover:bg-zinc-900/80 text-white backdrop-blur-sm border-y border-l border-white/20 shadow-lg flex items-center justify-center opacity-0 group-hover/zone:opacity-30 hover:!opacity-100 transition-all duration-200 active:scale-95 cursor-pointer"
                  title="Desplazar a columnas siguientes (▶)"
                >
                  <Icon name="chevron-right" size={18} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Columna Derecha: Acordeón de Stock por Producto y Lote */}
        <div className="xl:col-span-4 2xl:col-span-3 min-w-[280px]">
          <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight text-zinc-800 dark:text-white">
                  Stock por Lote
                </h3>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Acumulado</span>
              </div>
              <button
                onClick={exportCsv}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300 transition-colors"
                title="Descargar archivo Excel CSV"
              >
                <Icon name="download" size={14} />
              </button>
            </div>

            {/* Lista Acordeón - Flujo natural sin scrollbar interna lenta */}
            <div className="space-y-1.5">
              {stockSummary.map(prod => (
                <div key={prod.name} className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-slate-800/20">
                  <div
                    onClick={() => setActiveFilter(prev => prev?.value === prod.name ? null : { type: 'product', value: prod.name })}
                    className={`p-2 px-2.5 flex justify-between items-center cursor-pointer border-l-4 border-halliburton-red transition-colors gap-2 ${
                      activeFilter?.value === prod.name ? 'bg-red-50 dark:bg-red-950/20' : 'hover:bg-zinc-100/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-200 truncate flex-1" title={prod.name}>
                      {getShortProductName(prod.name)}
                    </span>
                    <span className="text-[10.5px] font-mono font-black text-zinc-700 dark:text-zinc-300 shrink-0 whitespace-nowrap">
                      {prod.totalQty.toLocaleString("es-AR")} {prod.unit}
                    </span>
                  </div>

                  <div className="p-1.5 px-2 space-y-1">
                    {Object.keys(prod.lots).sort().map(lotNum => (
                      <div
                        key={lotNum}
                        onClick={() => setActiveFilter(prev => prev?.value === lotNum ? null : { type: 'lot', value: lotNum })}
                        className={`flex justify-between items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition-colors ${
                          activeFilter?.value === lotNum
                            ? 'bg-halliburton-red text-white font-bold'
                            : 'bg-white dark:bg-slate-800/40 text-zinc-600 dark:text-zinc-400 hover:bg-red-50/50'
                        }`}
                      >
                        <span className="font-bold truncate" title={`Lote: ${lotNum}`}>L: {lotNum}</span>
                        <span className="font-mono font-black shrink-0 whitespace-nowrap">{prod.lots[lotNum].toLocaleString("es-AR")} {prod.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: INGRESO RÁPIDO DE PALLET (1 CLIC EN ESPACIO VACÍO) */}
      {showReceptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-halliburton-red text-white flex items-center justify-center">
                  <Icon name="plus" size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-zinc-800 dark:text-white">Ingreso de Pallet</h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {receptionTarget ? `Posición ${receptionTarget.col}${receptionTarget.row} (${receptionTarget.zone.toUpperCase()})` : "Recepción a Almacén"}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowReceptionModal(false)} className="text-zinc-400 hover:text-white">&times;</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const prodName = form.product.value;
                const lot = form.lot.value.trim().toUpperCase();
                const units = Number(form.units.value) || 1;
                const unitWeight = Number(form.unitWeight.value) || 25;
                const prod = data.productCatalog.find(p => p.name === prodName) || data.productCatalog[0];
                const totalQty = units * unitWeight;

                let targetZone = receptionTarget?.zone;
                let targetCol = receptionTarget?.col;
                let targetRow = receptionTarget?.row;

                if (!targetCol) {
                  // Buscar primer espacio vacío disponible
                  targetZone = prod.type === "solido" ? "solidos" : "liquidos";
                  const dims = currentSector.id === "principal" ? data.warehouseDimensions[targetZone] : currentSector;
                  for (let r = 1; r <= (dims.rows || 6); r++) {
                    for (const c of (dims.columns || ["A","B","C"])) {
                      const exists = data.pallets.some(p => (p.sectorId || "principal") === activeSectorId && p.zone === targetZone && p.col === c && p.row === r && p.quantity > 0);
                      if (!exists) {
                        targetCol = c;
                        targetRow = r;
                        break;
                      }
                    }
                    if (targetCol) break;
                  }
                }

                if (!targetCol) {
                  showToast("No hay espacio libre en este sector para recibir este producto.", "error");
                  return;
                }

                const newPallet = {
                  id: `PAL-${targetZone.substring(0,3).toUpperCase()}-${targetCol}${targetRow}-${Date.now().toString().slice(-4)}`,
                  sectorId: activeSectorId,
                  zone: targetZone,
                  col: targetCol,
                  row: targetRow,
                  product: prodName,
                  lot: lot,
                  quantity: totalQty,
                  unit: prod.unit,
                  packageDetails: `${units} x ${unitWeight} ${prod.unit}`,
                  unitsCount: units,
                  capacityNominal: totalQty,
                  status: "full"
                };

                const nextPallets = data.pallets.filter(p => !(p.zone === targetZone && p.col === targetCol && p.row === targetRow && (p.sectorId || "principal") === activeSectorId));
                nextPallets.push(newPallet);
                persistData({ ...data, pallets: nextPallets });
                setShowReceptionModal(false);
                showToast(`✓ Pallet recibido en ${targetCol}${targetRow} (${prodName} L: ${lot})`, "success");
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Producto Químico</label>
                <select name="product" className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none">
                  {data.productCatalog.map(p => (
                    <option key={p.name} value={p.name}>{p.name} ({p.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Número de Lote</label>
                <input
                  name="lot"
                  required
                  placeholder="Ej: CCP2604-09 o 2517K1"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Unidades (Bolsas/Totes)</label>
                  <input name="units" type="number" defaultValue="50" min="1" className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Peso Unitario</label>
                  <input name="unitWeight" type="number" defaultValue="25" min="1" className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all mt-4"
              >
                Confirmar Ingreso a Almacén
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONSUMO / ACCIÓN DE PALLET (DOBLE CLIC) */}
      {showPalletActionModal && actionPallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-800 dark:text-white">{actionPallet.product}</h3>
                <span className="text-[10px] font-bold text-amber-500 font-mono">Posición {actionPallet.col}{actionPallet.row} &bull; Lote: {actionPallet.lot}</span>
              </div>
              <button onClick={() => setShowPalletActionModal(false)} className="text-zinc-400 hover:text-white">&times;</button>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-slate-800/40 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500">Stock Actual:</span>
              <span className="text-sm font-black font-mono text-zinc-800 dark:text-white">{actionPallet.quantity} {actionPallet.unit}</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const consumed = Number(e.target.consumed.value) || 0;
                const newQty = Math.max(0, Number(actionPallet.quantity) - consumed);
                let nextPallets;
                if (newQty <= 0) {
                  nextPallets = data.pallets.filter(p => p.id !== actionPallet.id);
                  showToast(`✓ Pallet consumido totalmente. Espacio ${actionPallet.col}${actionPallet.row} liberado.`, "warning");
                } else {
                  nextPallets = data.pallets.map(p => p.id === actionPallet.id ? { ...p, quantity: newQty, status: "partial" } : p);
                  showToast(`✓ Saldo actualizado: ${newQty} ${actionPallet.unit} restantes.`, "success");
                }
                persistData({ ...data, pallets: nextPallets });
                setShowPalletActionModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Cantidad Consumida para Receta ({actionPallet.unit})</label>
                <input
                  name="consumed"
                  type="number"
                  min="1"
                  max={actionPallet.quantity}
                  defaultValue={actionPallet.quantity <= 100 ? actionPallet.quantity : 100}
                  required
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextPallets = data.pallets.filter(p => p.id !== actionPallet.id);
                    persistData({ ...data, pallets: nextPallets });
                    setShowPalletActionModal(false);
                    showToast(`✓ Pallet en ${actionPallet.col}${actionPallet.row} vaciado a 0.`, "warning");
                  }}
                  className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Vaciar a 0
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Descontar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA PESTAÑA CON SELECTOR DE ABECEDARIO */}
      {showNewSectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-black uppercase tracking-tight text-zinc-800 dark:text-white">Nueva Pestaña de Almacén</h3>
              <button onClick={() => setShowNewSectorModal(false)} className="text-zinc-400 hover:text-white">&times;</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = e.target.sectorName.value.trim();
                const type = e.target.sectorType.value;
                const rows = Number(e.target.sectorRows.value) || 6;
                if (!name) return;
                const newId = `sec_${Date.now()}`;
                const newSector = {
                  id: newId,
                  name: name,
                  type: type,
                  rows: rows,
                  columns: ["A", "B", "C", "D", "E", "F"]
                };
                const nextSectors = [...data.sectors, newSector];
                persistData({ ...data, sectors: nextSectors });
                setActiveSectorId(newId);
                setShowNewSectorModal(false);
                showToast(`✓ Sector "${name}" creado exitosamente.`, "success");
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Nombre del Sector / Pestaña</label>
                <input name="sectorName" required placeholder="Ej: Patio Salmueras o Depósito Norte" className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Tipo de Material</label>
                  <select name="sectorType" className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none">
                    <option value="solidos">Sólidos</option>
                    <option value="liquidos">Líquidos</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Filas Iniciales</label>
                  <input name="sectorRows" type="number" defaultValue="6" min="1" max="20" className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all mt-3"
              >
                Crear Pestaña con Inventario Independiente
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WarehouseLotsSystem;
