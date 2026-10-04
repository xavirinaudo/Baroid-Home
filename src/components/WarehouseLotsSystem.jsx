import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';
import html2pdf from 'html2pdf.js';

// Catálogo Maestro Oficial de Productos BAROID
const OFFICIAL_BAROID_CATALOG = [
  // SÓLIDOS - Control de Filtrado, Alcalinidad, Viscosidad y Pérdida de Circulación
  { name: "LIME FG", type: "solido", defaultPackage: "Bolsa 20 kg", unitWeight: 20, unit: "KG", color: "#1D4ED8" },
  { name: "GELTONE® II", type: "solido", defaultPackage: "Bolsa 22.68 kg", unitWeight: 22.68, unit: "KG", color: "#15803D" },
  { name: "BARABLOK™ 400 NA", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#374151" },
  { name: "Cloruro de Calcio (CaCl₂)", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#C2410C" },
  { name: "BARACARB®-DF FINE", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#475569" },
  { name: "BARACARB®-DF MEDIUM", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#52525B" },
  { name: "BARACARB®-DF COARSE", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#64748B" },
  { name: "BaraShield®-981", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#059669" },
  { name: "BaraShield®-982", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#047857" },
  { name: "BaraFLC®-903", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#7C3AED" },
  { name: "BaraSeal™-957", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#0D9488" },
  { name: "BDF™-965 FINE", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#B45309" },
  { name: "BDF™-965 MEDIUM", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#92400E" },
  { name: "STOPPIT™", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#DC2626" },
  { name: "OBTURANTE MEZCLA", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#9A3412" },
  { name: "BAROFIBRE®", type: "solido", defaultPackage: "Bolsa 11.34 kg", unitWeight: 11.34, unit: "KG", color: "#78716C" },
  { name: "BARAZAN® D PLUS", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#2563EB" },
  { name: "CARBONOX®", type: "solido", defaultPackage: "Bolsa 22.68 kg", unitWeight: 22.68, unit: "KG", color: "#1E293B" },
  { name: "PAC™-L", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#0284C7" },
  { name: "SODA ASH", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#6366F1" },
  { name: "SODA CÁUSTICA", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#4338CA" },
  { name: "Potassium Chloride (KCl)", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#3B82F6" },
  { name: "BARAVIS W-637", type: "solido", defaultPackage: "Bolsa 25 kg", unitWeight: 25, unit: "KG", color: "#10B981" },
  { name: "Bentonita (Bolsón)", type: "solido", defaultPackage: "Big Bag 1000 kg", unitWeight: 1000, unit: "KG", color: "#71717A" },
  { name: "BAROID® (Barita Bolsones)", type: "solido", defaultPackage: "Big Bag 1500 kg", unitWeight: 1500, unit: "KG", color: "#475569" },

  // LÍQUIDOS - Emulsionantes, Humectantes y Acondicionadores OBM
  { name: "INVERMUL®", type: "liquido", defaultPackage: "Tambor 208 L", unitWeight: 208, unit: "LT", color: "#6B21A8" },
  { name: "INVERMUL® LA", type: "liquido", defaultPackage: "IBC Tote 1000 L", unitWeight: 1000, unit: "LT", color: "#7E22CE" },
  { name: "EZ MUL® LA", type: "liquido", defaultPackage: "IBC Tote 1000 L", unitWeight: 1000, unit: "LT", color: "#BE185D" },
  { name: "EZ MUL® NT", type: "liquido", defaultPackage: "Tambor 208 L", unitWeight: 208, unit: "LT", color: "#9D174D" },
  { name: "LE SUPERMUL™", type: "liquido", defaultPackage: "IBC Tote 1000 L", unitWeight: 1000, unit: "LT", color: "#831843" },
  { name: "DRILTREAT®", type: "liquido", defaultPackage: "IBC Tote 1000 L", unitWeight: 1000, unit: "LT", color: "#4338CA" },
  { name: "RM-63™", type: "liquido", defaultPackage: "Tambor 208 L", unitWeight: 208, unit: "LT", color: "#0E7490" },
  { name: "TAU-MOD®", type: "liquido", defaultPackage: "Balde 19 L", unitWeight: 19, unit: "LT", color: "#0369A1" },
  { name: "CLAY GRABBER®", type: "liquido", defaultPackage: "Balde 19 L", unitWeight: 19, unit: "LT", color: "#0284C7" },
  { name: "CLAY SYNC™ II", type: "liquido", defaultPackage: "Balde 19 L", unitWeight: 19, unit: "LT", color: "#0891B2" },
  { name: "BARA-DEFOAM® HP", type: "liquido", defaultPackage: "Balde 19 L", unitWeight: 19, unit: "LT", color: "#059669" },
  { name: "OMC® 3", type: "liquido", defaultPackage: "Tambor 208 L", unitWeight: 208, unit: "LT", color: "#065F46" },
  { name: "THERMA-THIN YPF", type: "liquido", defaultPackage: "Tambor 208 L", unitWeight: 208, unit: "LT", color: "#155E75" },
  { name: "XLR-RATE™", type: "liquido", defaultPackage: "Tambor 208 L", unitWeight: 208, unit: "LT", color: "#1E40AF" },
  { name: "TS PLUS YPF", type: "liquido", defaultPackage: "Tambor 208 L", unitWeight: 208, unit: "LT", color: "#4F46E5" }
];

// Dataset Oficial Fallback de Planta LMP
const DEFAULT_FALLBACK_STATE = {
  plant: "Planta LMP Baroid / YPF",
  version: "3.0",
  lastUpdated: new Date().toISOString(),
  warehouseDimensions: {
    solidos: { rows: 6, columns: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] },
    liquidos: { rows: 6, columns: ["A", "B", "C", "D", "E", "F", "G", "H"] }
  },
  sectors: [
    {
      id: "principal",
      name: "Zona de Productos Químicos",
      type: "mixto",
      rows: 4,
      columns: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
    }
  ],
  activeSectorId: "principal",
  productCatalog: OFFICIAL_BAROID_CATALOG,
  pallets: []
};

const ALL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const getShortProductName = (name) => {
  if (!name) return "";
  if (name.includes("Cloruro de Calcio") || name.includes("CaCl₂")) return "CaCl₂ Calcio";
  if (name.includes("BARABLOK")) return "BARABLOK™ 400";
  if (name.includes("BARACARB") && name.includes("FINE")) return "BARACARB® F";
  if (name.includes("BARACARB") && name.includes("MEDIUM")) return "BARACARB® M";
  if (name.includes("BARACARB") && name.includes("COARSE")) return "BARACARB® C";
  if (name.includes("BaraShield") && name.includes("981")) return "BaraShield® 981";
  if (name.includes("BaraShield") && name.includes("982")) return "BaraShield® 982";
  if (name.includes("BaraFLC")) return "BaraFLC® 903";
  if (name.includes("BaraSeal")) return "BaraSeal™ 957";
  if (name.includes("BDF") && name.includes("FINE")) return "BDF™-965 F";
  if (name.includes("BDF") && name.includes("MEDIUM")) return "BDF™-965 M";
  if (name.includes("INVERMUL") && name.includes("LA")) return "INVERMUL® LA";
  if (name.includes("INVERMUL")) return "INVERMUL®";
  if (name.includes("EZ MUL") && name.includes("LA")) return "EZ MUL® LA";
  if (name.includes("EZ MUL") && name.includes("NT")) return "EZ MUL® NT";
  if (name.includes("SUPERMUL")) return "SUPERMUL™";
  if (name.includes("GELTONE")) return "GELTONE® II";
  if (name.includes("DRILTREAT")) return "DRILTREAT®";
  if (name.includes("RM-63")) return "RM-63™";
  if (name.includes("TAU-MOD")) return "TAU-MOD®";
  if (name.includes("CLAY GRABBER")) return "CLAY GRABBER®";
  if (name.includes("CLAY SYNC")) return "CLAY SYNC™ II";
  if (name.includes("BARA-DEFOAM")) return "DEFOAM® HP";
  if (name.includes("OMC")) return "OMC® 3";
  if (name.includes("STOPPIT")) return "STOPPIT™";
  if (name.includes("BAROFIBRE")) return "BAROFIBRE®";
  if (name.includes("BARAZAN")) return "BARAZAN® D+";
  if (name.includes("CARBONOX")) return "CARBONOX®";
  if (name.includes("BARAVIS")) return "BARAVIS W-637";
  if (name.includes("BAROID") || name.includes("Barita")) return "BAROID® Barita";
  if (name.includes("Bentonita")) return "Bentonita";
  if (name.includes("LIME")) return "LIME FG";
  return name;
};

// Conversor a RGBA con opacidad tenue (12-16%) para ahorrar tinta en impresión física y facilitar lectura
const hexToRgba = (hex, alpha = 0.14) => {
  if (!hex || typeof hex !== 'string') return `rgba(153, 27, 27, ${alpha})`;
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Diccionario de Traducción Oficial Español / Inglés
const I18N = {
  es: {
    mapTitle: "Mapa de Zona de Productos",
    mapSubtitle: "Monitoreo y control de lotes",
    receivePallet: "Ingreso Pallet",
    highlightPartials: "Resaltar Parciales",
    showingPartials: "Mostrando Parciales",
    partialsOnly: "Solo Parciales",
    filter: "Filtro",
    loadJson: "Cargar JSON",
    backup: "Respaldar",
    clear: "Vaciar",
    undo: "Deshacer",
    zoomTooltip: "Escala del almacén (Clic en % para 100%)",
    zoomOut: "Reducir zoom (muestra más columnas y filas en pantalla)",
    zoomIn: "Aumentar zoom",
    newTab: "Nueva Pestaña",
    orderCapacity: "Capacidad de Pedido",
    free: "Libres",
    orderAvailable: "Capacidad disponible para solicitar",
    currentOccupancy: "Ocupación Actual",
    solids: "Sólidos",
    liquids: "Líquidos",
    cleanWarehouseTitle: "Almacén Limpio (Sin Lotes Asignados)",
    cleanWarehouseDesc: "El mapa está listo para operar. Puedes cargar tu inventario desde archivo JSON o ingresar pallets haciendo un clic en cualquier posición vacía.",
    loadInventoryBtn: "Cargar Inventario (JSON)",
    generalWarehouse: "Almacén General",
    powdersClays: "Polvos y Arcillas",
    drumsIbc: "Tambores 208 L y IBC 1.000 L",
    rows: "Filas",
    cols: "Cols",
    addRow: "+ Fila",
    addCol: "+ Col",
    aisle: "PASILLO",
    copy: "Copiar",
    paste: "Pegar",
    deleteEmpty: "Eliminar / Vaciar pallet a 0",
    stockByLot: "Stock por Lote",
    consolidated: "Acumulado",
    downloadCsv: "Descargar archivo Excel CSV",
    receiveModalTitle: "Ingreso de Pallet",
    receptionWarehouse: "Recepción a Almacén",
    position: "Posición",
    chemicalProduct: "Producto Químico BAROID",
    selectProduct: "-- Seleccionar Producto Baroid --",
    customProductOption: "-- Otro Producto Personalizado / Custom --",
    customProductName: "Nombre del Producto Personalizado",
    customProductUnit: "Unidad (KG / LT)",
    lotNumber: "Número de Lote",
    lotPlaceholder: "Ej: CCP2604-09 o 2517K1",
    packageCount: "Unidades (Bolsas/Totes)",
    unitWeight: "Peso / Vol. Unitario",
    totalToReceive: "Total a Ingresar",
    confirmReception: "Confirmar Ingreso a Almacén",
    cancel: "Cancelar",
    consumeModalTitle: "Consumo de Pallet",
    consumeLabel: "Cantidad Consumida para Receta",
    deductBtn: "Descontar",
    emptyToZero: "Vaciar a 0",
    newTabModalTitle: "Nueva Pestaña de Almacén",
    tabNameLabel: "Nombre del Sector / Pestaña",
    tabNamePlaceholder: "Ej: Almacén Principal o Depósito Norte",
    structureLabel: "Estructura del Almacén",
    singleCanvas: "Lienzo Único (Área Libre / Mixta)",
    singleCanvasDesc: "Un solo espacio unificado para cualquier tipo de producto (Predeterminado).",
    dualArea: "Doble Área (2 Áreas: Sólidos y Líquidos)",
    dualAreaDesc: "Separa la pestaña en dos sectores independientes (Sólidos arriba y Líquidos abajo).",
    initialRows: "Filas Iniciales",
    initialCols: "Cantidad de Columnas",
    solidsRows: "Filas Área Sólidos",
    solidsCols: "Columnas Área Sólidos",
    liquidsRows: "Filas Área Líquidos",
    liquidsCols: "Columnas Área Líquidos",
    createTabBtn: "Crear Pestaña",
    closeTab: "Cerrar / eliminar pestaña",
    confirmDeleteTab: "¿Eliminar la pestaña \"{name}\" y sus pallets asignados?",
    clipboardActive: "📋 Pallet copiado en portapapeles: {product} (Lote: {lot}). Haz clic en cualquier posición vacía para pegar.",
    cancelCopy: "Cancelar",
    undoSuccess: "Último movimiento deshecho.",
    palletPasted: "✓ Pallet pegado en {pos} ({prod})",
    palletSelected: "✓ Pallet seleccionado en {pos} ({prod}). Copiar: Ctrl+C | Consumir: Doble clic | Cancelar: Esc.",
    palletCopied: "📋 Pallet copiado ({prod} L: {lot}). Haz clic en cualquier celda libre para pegar.",
    palletDeleted: "✓ Pallet en {pos} vaciado a 0.",
    filterPartialsOn: "✨ Resaltando {count} pallets parciales / remanentes.",
    filterPartialsOff: "Filtro de parciales desactivado.",
    noStockExport: "No hay pallets con stock en este sector para exportar.",
    csvSuccess: "✓ Archivo Excel CSV descargado con éxito.",
    noFreeSlots: "No hay espacio libre en este sector para recibir este producto.",
    palletReceived: "✓ Pallet recibido en {pos} ({prod} L: {lot})",
    palletMoved: "✓ Pallet {prod} trasladado de {from} a {to}.",
    palletsSwapped: "✓ Pallets intercambiados entre {pos1} y {pos2}.",
    dropHere: "Soltar aquí",
    swapWith: "Intercambiar",
    stockDeducted: "✓ Saldo actualizado: {newQty} {unit} restantes.",
    tabCreated: "✓ Pestaña \"{name}\" creada exitosamente.",
    tabDeleted: "Pestaña \"{name}\" eliminada.",
    rowAdded: "+1 Fila agregada",
    colAdded: "+ Columna {col} agregada",
    emptyConfirm: "¿Estás seguro de que deseas vaciar todos los lotes del almacén para comenzar desde cero? Podrás deshacer esta acción con Ctrl+Z.",
    warehouseCleared: "🗑️ Almacén vaciado. Listo para nuevo inventario.",
    pdfPrintout: "Impresión PDF",
    warehouseSheetTitle: "Diagrama Almacén",
    fieldCountingSheetSubtitle: "Planilla conteo físico",
    lotProdSearch: "Buscador de Lote / Producto",
    searchPlaceholder: "Escribe lote o producto...",
    clearBtn: "Limpiar",
    directHighlight: "Resalta ubicación directa en mapa",
    noMatches: "Sin coincidencias",
    inSlots: "en:",
    solidsZone: "ZONA SÓLIDOS",
    liquidsZoneTrays: "ZONA LÍQUIDOS",
    generalZone: "ZONA GENERAL",
    tray: "Bandeja",
    trays: "Bandejas",
    loadedPallets: "pallets cargados",
    diagramSheetTitle: "DIAGRAMA DE ZONA DE PRODUCTOS",
    officialCountingSheet: "PLANILLA OFICIAL DE RECUENTO FÍSICO",
    issued: "Emisión",
    occupancy: "Ocupación",
    countingOfficer: "Responsable de Recuento: ___________________________",
    signatureApproval: "Firma / Aprobación: ___________________________",
    officialSheetFooter: "Baroid LMP • Planilla Oficial de Conteo Físico",
    printPreviewTitle: "Vista de Impresión • Diagrama de Zona de Productos",
    printPreviewSubtitle: "Diseñado en formato horizontal A4 con máxima resolución para recuento y verificación física en almacén.",
    downloadPdfBtn: "Descargar PDF",
    printSavePdfBtn: "Imprimir / Guardar PDF",
    closeModal: "✕ Cerrar (Esc)",
    availableTray: "BANDEJA DISPONIBLE",
    trayAvailable: "BANDEJA LIBRE",
    freeSlotTag: "Espacio Libre",
    countBox: "Conteo: [ _____ ]",
    colHeader: "Col",
    trayColHeader: "Bandejas",
    partialTag: "PARCIAL",
    freeTag: "(LIBRE)",
    containmentTrayTooltip: "Bandeja {col}{row} (Libre - Contención Antiderrame) • Recepcionar Pallet",
    emptySlotTooltip: "+ {col}{row} • Recepcionar Pallet",
    generatingPdfToast: "Generando archivo PDF en máxima resolución...",
    pdfSuccessToast: "✓ Archivo PDF descargado con éxito.",
    navColsTooltip: "Navegar columna a columna",
    prevCol: "Columna anterior (◀)",
    nextCol: "Columna siguiente (▶)",
    scrollToPrevCol: "Desplazar a columnas anteriores (◀)",
    scrollToNextCol: "Desplazar a columnas siguientes (▶)",
    openPrintModalTooltip: "Abrir e imprimir Diagrama de Zona de Productos para conteo físico",
    currentRegisteredStock: "Stock Registrado Actual",
    nominalCapacity: "Cap. Nominal",
    directMode: "Directo",
    byPackagesMode: "Por Bolsas / Envases",
    howMuchRemaining: "¿Cuánto queda del producto?",
    remainingPackages: "Bolsas / Envases que quedan",
    weightPerPackage: "Peso / Vol. por Envase",
    resultingCalculation: "Cálculo resultante",
    palletWillZeroWarning: "El pallet quedará en 0 y la posición {pos} se liberará.",
    recipeConsumption: "Consumo para receta",
    remainingLabel: "Quedan",
    upwardAdjustment: "Ajuste de inventario en alza",
    noStockChanges: "Sin cambios en el stock del pallet.",
    confirmEmptyPallet: "¿Vaciar totalmente el pallet en {pos}?",
    emptyToZeroBtn: "Vaciar a 0",
    saveBtn: "Guardar",
    closeEsc: "Cerrar (Esc)",
    invalidJsonFormat: "❌ El archivo no contiene un formato válido (falta lista de pallets).",
    jsonLoadSuccess: "✅ Inventario cargado con éxito: {count} pallets y lotes importados.",
    jsonLoadError: "❌ Error al procesar el archivo JSON.",
    backupDownloaded: "📥 Copia de seguridad JSON descargada.",
    confirmDeletePallet: "¿Vaciar totalmente {prod} (Lote: {lot}) en {pos}?"
  },
  en: {
    mapTitle: "Chemical Products Zone Map",
    mapSubtitle: "Lot monitoring and control",
    receivePallet: "Receive Pallet",
    highlightPartials: "Highlight Partials",
    showingPartials: "Showing Partials",
    partialsOnly: "Partials Only",
    filter: "Filter",
    loadJson: "Load JSON",
    backup: "Backup",
    clear: "Clear",
    undo: "Undo",
    zoomTooltip: "Warehouse scale (Click % for 100%)",
    zoomOut: "Zoom out (shows more columns and rows on screen)",
    zoomIn: "Zoom in",
    newTab: "New Tab",
    orderCapacity: "Order Capacity",
    free: "Free",
    orderAvailable: "Available capacity to request",
    currentOccupancy: "Current Occupancy",
    solids: "Solids",
    liquids: "Liquids",
    cleanWarehouseTitle: "Clean Warehouse (No Assigned Lots)",
    cleanWarehouseDesc: "The map is ready to operate. You can load your inventory from a JSON file or add pallets by clicking any empty slot.",
    loadInventoryBtn: "Load Inventory (JSON)",
    generalWarehouse: "General Warehouse",
    powdersClays: "Powders and Clays",
    drumsIbc: "208 L Drums & 1,000 L IBCs",
    rows: "Rows",
    cols: "Cols",
    addRow: "+ Row",
    addCol: "+ Col",
    aisle: "AISLE",
    copy: "Copy",
    paste: "Paste",
    deleteEmpty: "Delete / Empty pallet to 0",
    stockByLot: "Stock by Lot",
    consolidated: "Consolidated",
    downloadCsv: "Download Excel CSV File",
    receiveModalTitle: "Receive Pallet",
    receptionWarehouse: "Warehouse Reception",
    position: "Position",
    chemicalProduct: "BAROID Chemical Product",
    selectProduct: "-- Select Baroid Product --",
    customProductOption: "-- Other Custom Product --",
    customProductName: "Custom Product Name",
    customProductUnit: "Unit (KG / LT)",
    lotNumber: "Lot Number",
    lotPlaceholder: "Ex: CCP2604-09 or 2517K1",
    packageCount: "Package Count (Bags/Totes)",
    unitWeight: "Unit Weight / Volume",
    totalToReceive: "Total to Receive",
    confirmReception: "Confirm Warehouse Reception",
    cancel: "Cancel",
    consumeModalTitle: "Pallet Consumption",
    consumeLabel: "Consumed Quantity for Recipe",
    deductBtn: "Deduct",
    emptyToZero: "Empty to 0",
    newTabModalTitle: "New Warehouse Tab",
    tabNameLabel: "Sector / Tab Name",
    tabNamePlaceholder: "Ex: Main Warehouse or North Yard",
    structureLabel: "Warehouse Layout Structure",
    singleCanvas: "Single Canvas (Free / Mixed Area)",
    singleCanvasDesc: "A single unified open space for all chemical products (Default).",
    dualArea: "Dual Area (2 Areas: Solids and Liquids)",
    dualAreaDesc: "Splits the tab into two independent sectors (Solids on top, Liquids below).",
    initialRows: "Initial Rows",
    initialCols: "Number of Columns",
    solidsRows: "Solids Area Rows",
    solidsCols: "Solids Area Columns",
    liquidsRows: "Liquids Area Rows",
    liquidsCols: "Liquids Area Columns",
    createTabBtn: "Create Tab",
    closeTab: "Close / delete tab",
    confirmDeleteTab: "Delete tab \"{name}\" and its assigned pallets?",
    clipboardActive: "📋 Pallet copied to clipboard: {product} (Lot: {lot}). Click any empty slot to paste.",
    cancelCopy: "Cancel",
    undoSuccess: "Last movement undone.",
    palletPasted: "✓ Pallet pasted at {pos} ({prod})",
    palletSelected: "✓ Pallet selected at {pos} ({prod}). Copy: Ctrl+C | Consume: Double click | Cancel: Esc.",
    palletCopied: "📋 Pallet copied ({prod} Lot: {lot}). Click any free slot to paste.",
    palletDeleted: "✓ Pallet at {pos} emptied to 0.",
    filterPartialsOn: "✨ Highlighting {count} partial / remnant pallets.",
    filterPartialsOff: "Partial filter disabled.",
    noStockExport: "No pallets with stock in this sector to export.",
    csvSuccess: "✓ Excel CSV file downloaded successfully.",
    noFreeSlots: "No free space in this sector to receive this product.",
    palletReceived: "✓ Pallet received at {pos} ({prod} Lot: {lot})",
    palletMoved: "✓ Pallet {prod} moved from {from} to {to}.",
    palletsSwapped: "✓ Pallets swapped between {pos1} and {pos2}.",
    dropHere: "Drop here",
    swapWith: "Swap",
    stockDeducted: "✓ Balance updated: {newQty} {unit} remaining.",
    tabCreated: "✓ Tab \"{name}\" successfully created.",
    tabDeleted: "Tab \"{name}\" deleted.",
    rowAdded: "+1 Row added",
    colAdded: "+ Column {col} added",
    emptyConfirm: "Are you sure you want to empty all lots in this warehouse to start from scratch? You can undo with Ctrl+Z.",
    warehouseCleared: "🗑️ Warehouse cleared. Ready for fresh inventory.",
    pdfPrintout: "PDF Printout",
    warehouseSheetTitle: "Warehouse Sheet",
    fieldCountingSheetSubtitle: "Field counting sheet",
    lotProdSearch: "Lot / Product Search",
    searchPlaceholder: "Search lot or product...",
    clearBtn: "Clear",
    directHighlight: "Direct highlight on map",
    noMatches: "No matches",
    inSlots: "in:",
    solidsZone: "SOLIDS ZONE",
    liquidsZoneTrays: "LIQUIDS ZONE",
    generalZone: "GENERAL ZONE",
    tray: "Tray",
    trays: "Trays",
    loadedPallets: "loaded pallets",
    diagramSheetTitle: "CHEMICAL PRODUCTS ZONE DIAGRAM",
    officialCountingSheet: "OFFICIAL PHYSICAL COUNTING SHEET",
    issued: "Issued",
    occupancy: "Occupancy",
    countingOfficer: "Counting Officer: ___________________________",
    signatureApproval: "Signature / Approval: ___________________________",
    officialSheetFooter: "Baroid LMP • Official Counting Sheet",
    printPreviewTitle: "Print Preview • Chemical Products Zone Diagram",
    printPreviewSubtitle: "Designed in high-resolution A4 landscape format for physical counting and field audits.",
    downloadPdfBtn: "Download PDF",
    printSavePdfBtn: "Print / Save PDF",
    closeModal: "✕ Close (Esc)",
    availableTray: "AVAILABLE TRAY",
    trayAvailable: "FREE TRAY",
    freeSlotTag: "Free Slot",
    countBox: "Count: [ _____ ]",
    colHeader: "Col",
    trayColHeader: "Trays",
    partialTag: "PARTIAL",
    freeTag: "(FREE)",
    containmentTrayTooltip: "Tray {col}{row} (Free - Containment Tray) • Receive Pallet",
    emptySlotTooltip: "+ {col}{row} • Receive Pallet",
    generatingPdfToast: "Generating high-resolution PDF file...",
    pdfSuccessToast: "✓ PDF file downloaded successfully.",
    navColsTooltip: "Navigate column by column",
    prevCol: "Previous column (◀)",
    nextCol: "Next column (▶)",
    scrollToPrevCol: "Scroll to previous columns (◀)",
    scrollToNextCol: "Scroll to next columns (▶)",
    openPrintModalTooltip: "Open and print Chemical Products Zone Diagram for physical counting",
    currentRegisteredStock: "Current Registered Stock",
    nominalCapacity: "Nominal Cap.",
    directMode: "Direct",
    byPackagesMode: "By Bags / Packages",
    howMuchRemaining: "How much product remains?",
    remainingPackages: "Remaining bags / packages",
    weightPerPackage: "Weight / Vol. per Package",
    resultingCalculation: "Resulting calculation",
    palletWillZeroWarning: "The pallet will be emptied to 0 and slot {pos} will be freed.",
    recipeConsumption: "Recipe consumption",
    remainingLabel: "Remaining",
    upwardAdjustment: "Upward inventory adjustment",
    noStockChanges: "No change in pallet stock.",
    confirmEmptyPallet: "Completely empty pallet at {pos}?",
    emptyToZeroBtn: "Empty to 0",
    saveBtn: "Save",
    closeEsc: "Close (Esc)",
    invalidJsonFormat: "❌ File does not contain a valid format (missing pallets list).",
    jsonLoadSuccess: "✅ Inventory loaded successfully: {count} pallets and lots imported.",
    jsonLoadError: "❌ Error processing JSON file.",
    backupDownloaded: "📥 JSON backup downloaded.",
    confirmDeletePallet: "Completely empty {prod} (Lot: {lot}) at {pos}?"
  }
};

const WarehouseLotsSystem = ({ isEditing, lang = 'es', setLang, darkMode, setDarkMode }) => {
  // Helper de traducción i18n
  const t = (key, params = {}) => {
    let str = I18N[lang]?.[key] || I18N['es'][key] || key;
    Object.keys(params).forEach(k => {
      str = str.replace(`{${k}}`, params[k]);
    });
    return str;
  };

  // 1. Estado persistente con Multi-Ring Vault y Rescate Automático
  const [data, setData] = useState(() => {
    const candidateKeys = [
      "lmp_warehouse_state",
      "lmp_warehouse_state_vault",
      "baroid_warehouse_backup_persistent",
      "lmp_warehouse_last_known_good",
      "lmp_warehouse_pre_update_snapshot",
      "warehouse_lots_data_v1",
      "baroid_warehouse_lots_v1",
      "warehouse_lots_backup"
    ];

    let bestCandidate = null;
    let maxPallets = -1;

    for (const key of candidateKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (!parsed) continue;

        const count = Array.isArray(parsed.pallets) ? parsed.pallets.length : 0;
        // Priorizar el candidato con más pallets para jamás perder datos por un estado vacío accidental
        if (count > maxPallets) {
          bestCandidate = parsed;
          maxPallets = count;
        }
      } catch (e) {
        console.warn(`Error al leer almacenamiento ${key}:`, e);
      }
    }

    if (bestCandidate) {
      try {
        if (Array.isArray(bestCandidate.sectors) && bestCandidate.sectors.length > 0) {
          bestCandidate.sectors = bestCandidate.sectors
            .filter(s => s && !(s.name || "").toLowerCase().includes("1211") && !(s.id || "").toLowerCase().includes("1211"))
            .map(s => {
              const isDual = s.type === "dual";
              const isPrincipal = s.id === "principal" || (s.name || "").toLowerCase().includes("químicos") || (s.name || "").toLowerCase().includes("quimicos") || (s.name || "").toLowerCase().includes("principal");

              if (isPrincipal) {
                return {
                  ...s,
                  id: "principal",
                  name: "Zona de Productos Químicos",
                  type: isDual ? "dual" : "mixto",
                  rows: s.rows ? Math.max(1, Number(s.rows)) : (isDual ? 6 : 4),
                  columns: (s.columns && s.columns.length > 0)
                    ? s.columns
                    : (isDual ? ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] : ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"])
                };
              }
              return {
                ...s,
                type: isDual ? "dual" : (s.type || "mixto"),
                rows: s.rows ? Math.max(1, Number(s.rows)) : (isDual ? 6 : 4),
                columns: (s.columns && s.columns.length > 0)
                  ? s.columns
                  : ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
              };
            });
          if (bestCandidate.sectors.length === 0) {
            bestCandidate.sectors = DEFAULT_FALLBACK_STATE.sectors;
          }
        } else {
          bestCandidate.sectors = DEFAULT_FALLBACK_STATE.sectors;
        }

        if (Array.isArray(bestCandidate.pallets)) {
          bestCandidate.pallets = bestCandidate.pallets.filter(p => p && !(p.sectorId || "").toLowerCase().includes("1211"));
        } else {
          bestCandidate.pallets = [];
        }

        if (!bestCandidate.warehouseDimensions) {
          bestCandidate.warehouseDimensions = {
            solidos: { rows: 6, columns: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] },
            liquidos: { rows: 6, columns: ["A", "B", "C", "D", "E", "F", "G", "H"] }
          };
        }

        // Resincronizar de inmediato a todos los vaults para blindar persistencia
        try {
          const serialized = JSON.stringify(bestCandidate);
          localStorage.setItem("lmp_warehouse_state", serialized);
          localStorage.setItem("lmp_warehouse_state_vault", serialized);
          localStorage.setItem("baroid_warehouse_backup_persistent", serialized);
          if (bestCandidate.pallets.length > 0) {
            localStorage.setItem("lmp_warehouse_last_known_good", serialized);
          }
        } catch (e) {}

        return bestCandidate;
      } catch (e) {
        console.error("Error al procesar candidato de almacén:", e);
        if (Array.isArray(bestCandidate.pallets) && bestCandidate.pallets.length > 0) {
          return {
            ...DEFAULT_FALLBACK_STATE,
            pallets: bestCandidate.pallets
          };
        }
      }
    }
    return DEFAULT_FALLBACK_STATE;
  });

  const [activeSectorId, setActiveSectorId] = useState(data.activeSectorId || "principal");
  const [selectedPallet, setSelectedPallet] = useState(null);
  const [copiedPallet, setCopiedPallet] = useState(null);
  const [draggedPallet, setDraggedPallet] = useState(null); // { pallet, zone, col, row, sectorId }
  const [dragOverTarget, setDragOverTarget] = useState(null); // { zone, col, row }
  const [activeFilter, setActiveFilter] = useState(null); // { type: 'lot' | 'product' | 'partial', value: string }
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [undoStack, setUndoStack] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  // Modales
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [receptionTarget, setReceptionTarget] = useState(null);
  const [showPalletActionModal, setShowPalletActionModal] = useState(false);
  const [actionPallet, setActionPallet] = useState(null);
  const [stockEntryMode, setStockEntryMode] = useState("direct"); // "direct" (KG/LT) | "packages" (Bolsas/Unidades)
  const [remainingInputQty, setRemainingInputQty] = useState(0);
  const [remainingBagsCount, setRemainingBagsCount] = useState(0);
  const [remainingBagWeight, setRemainingBagWeight] = useState(25);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [showNewSectorModal, setShowNewSectorModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Estado para modal de Nueva Pestaña (Lienzo Único vs Doble Área)
  const [newTabStructure, setNewTabStructure] = useState('single'); // 'single' | 'dual'
  const [newTabRows, setNewTabRows] = useState(4);
  const [newTabCols, setNewTabCols] = useState(12);
  const [newTabSolidsRows, setNewTabSolidsRows] = useState(6);
  const [newTabSolidsCols, setNewTabSolidsCols] = useState(10);
  const [newTabLiquidsRows, setNewTabLiquidsRows] = useState(6);
  const [newTabLiquidsCols, setNewTabLiquidsCols] = useState(8);

  // Estado para modal de Recepción con Catálogo Oficial Baroid
  const [receptionSelectedProd, setReceptionSelectedProd] = useState(OFFICIAL_BAROID_CATALOG[0].name);
  const [receptionUnits, setReceptionUnits] = useState(50);
  const [receptionUnitWeight, setReceptionUnitWeight] = useState(25);
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [customProdName, setCustomProdName] = useState("");
  const [customProdUnit, setCustomProdUnit] = useState("KG");

  // Sector actual
  const currentSector = useMemo(() => {
    const sec = (data.sectors && data.sectors.find(s => s.id === activeSectorId)) || data.sectors?.[0] || {
      id: "principal",
      name: "Zona de Productos Químicos",
      type: "mixto",
      rows: 4,
      columns: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
    };
    return sec;
  }, [data.sectors, activeSectorId]);

  // Dimensiones del sector activo garantizadas defensivamente
  const sDims = useMemo(() => {
    let raw;
    if (currentSector.type === "dual") {
      raw = currentSector.warehouseDimensions?.solidos || data.warehouseDimensions?.solidos || { rows: 6, columns: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] };
    } else {
      raw = {
        rows: currentSector.rows || 4,
        columns: currentSector.columns || ["A","B","C","D","E","F","G","H","I","J","K","L"]
      };
    }
    return {
      rows: Math.max(1, Number(raw?.rows) || 4),
      columns: Array.isArray(raw?.columns) && raw.columns.length > 0 ? raw.columns : ["A","B","C","D","E","F","G","H","I","J","K","L"]
    };
  }, [currentSector, data.warehouseDimensions]);

  const lDims = useMemo(() => {
    let raw;
    if (currentSector.type === "dual") {
      raw = currentSector.warehouseDimensions?.liquidos || data.warehouseDimensions?.liquidos || { rows: 6, columns: ["A", "B", "C", "D", "E", "F", "G", "H"] };
    } else {
      raw = {
        rows: currentSector.rows || 4,
        columns: currentSector.columns || ["A","B","C","D"]
      };
    }
    return {
      rows: Math.max(1, Number(raw?.rows) || 4),
      columns: Array.isArray(raw?.columns) && raw.columns.length > 0 ? raw.columns : ["A","B","C","D"]
    };
  }, [currentSector, data.warehouseDimensions]);

  // Mapas Hash O(1) para eliminar lag en renderizado de celdas y hover con indexación estricta sin fugas de zona
  const palletsMap = useMemo(() => {
    const map = new Map();
    if (!data.pallets) return map;
    const sId = currentSector.id || activeSectorId || "principal";
    const isDual = currentSector.type === "dual";

    for (let i = 0; i < data.pallets.length; i++) {
      const p = data.pallets[i];
      if (!p || (p.sectorId || "principal") !== sId || Number(p.quantity) <= 0) continue;

      const pCol = String(p.col || '').trim().toUpperCase();
      const pRow = Number(p.row);

      if (isDual) {
        const isLiq = p.zone === "liquidos" || p.zone === "liquido";
        const zKey = isLiq ? "liquidos" : "solidos";
        map.set(`${zKey}_${pCol}_${pRow}`, p);
      } else {
        // En sector de lienzo único (mixto): indexar por coordenadas de celda
        map.set(`${pCol}_${pRow}`, p);
        map.set(`mixto_${pCol}_${pRow}`, p);
        map.set(`solidos_${pCol}_${pRow}`, p);
      }
    }
    return map;
  }, [data.pallets, currentSector, activeSectorId]);

  // Helper universal de consulta O(1) de pallet por posición para garantizar coincidencia 100% idéntica entre App y PDF
  const getPalletAt = (zone, col, row) => {
    const cCol = String(col || '').trim().toUpperCase();
    const cRow = Number(row);
    const isDual = currentSector.type === "dual";
    const zKey = (zone === "liquidos" || zone === "liquido") ? "liquidos" : "solidos";

    if (isDual) {
      return (
        palletsMap.get(`${zKey}_${cCol}_${cRow}`) ||
        palletsMap.get(`${zone}_${cCol}_${cRow}`) ||
        null
      );
    }
    // Lienzo único / sector mixto o general
    return (
      palletsMap.get(`${cCol}_${cRow}`) ||
      palletsMap.get(`mixto_${cCol}_${cRow}`) ||
      palletsMap.get(`solidos_${cCol}_${cRow}`) ||
      palletsMap.get(`${zone}_${cCol}_${cRow}`) ||
      null
    );
  };

  const productCatalogMap = useMemo(() => {
    const map = new Map();
    const catalog = data.productCatalog?.length ? data.productCatalog : OFFICIAL_BAROID_CATALOG;
    for (let i = 0; i < catalog.length; i++) {
      map.set(catalog[i].name, catalog[i]);
    }
    return map;
  }, [data.productCatalog]);

  // Dimensiones físicas de cada pallet calculadas con el zoom (relación de aspecto perfecta 98x80)
  const cardWidth = Math.round(98 * zoomLevel);
  const cardHeight = Math.round(80 * zoomLevel);
  const aisleWidth = Math.max(10, Math.round(16 * zoomLevel));

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

  // Persistencia Multi-Ring Vault en cada cambio de data
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

      // Guardar en 'lmp_warehouse_last_known_good' únicamente si contiene pallets cargados
      if (Array.isArray(nextData.pallets) && nextData.pallets.length > 0) {
        localStorage.setItem("lmp_warehouse_last_known_good", serialized);
        localStorage.setItem("lmp_warehouse_last_known_good_time", Date.now().toString());
      }
    } catch (err) {
      console.error("Error saving warehouse state to vault:", err);
    }
  };

  // Restaurar Copia de Seguridad Automática / Último Buen Estado Conocido
  const handleRestoreSafeBackup = () => {
    const candidateKeys = [
      "lmp_warehouse_last_known_good",
      "baroid_warehouse_backup_persistent",
      "lmp_warehouse_pre_wipe_backup",
      "lmp_warehouse_pre_update_snapshot",
      "lmp_warehouse_state_vault"
    ];

    let foundBackup = null;
    let foundCount = 0;

    for (const key of candidateKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.pallets) && parsed.pallets.length > 0) {
          if (parsed.pallets.length > foundCount) {
            foundBackup = parsed;
            foundCount = parsed.pallets.length;
          }
        }
      } catch (e) {}
    }

    if (!foundBackup || foundCount === 0) {
      showToast(lang === 'en' ? "No backup with pallets found in this browser." : "No se encontró ningún respaldo con pallets en este navegador.", "warning");
      return;
    }

    const confirmMsg = lang === 'en'
      ? `The last safe backup with ${foundCount} pallets and lots will be restored. Do you want to apply it now?`
      : `Se restaurará la última copia de seguridad segura encontrada con ${foundCount} pallets y lotes. ¿Deseas aplicarla ahora?`;

    if (confirm(confirmMsg)) {
      persistData(foundBackup);
      showToast(lang === 'en' ? `✓ Backup restored: ${foundCount} pallets recovered.` : `✓ Respaldo restaurado con éxito: ${foundCount} pallets recuperados.`, "success");
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
      showToast(t("undoSuccess"), "warning");
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
          showToast(t("invalidJsonFormat"), "error");
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

        const hasLiquids = normalizedPallets.some(p => p.zone === "liquidos");
        let importedSectors = imported.sectors || data.sectors;
        if (hasLiquids && Array.isArray(importedSectors)) {
          importedSectors = importedSectors.map(s => {
            if (s.id === "principal" || s.name?.toLowerCase().includes("nave principal") || s.name?.toLowerCase().includes("productos")) {
              return { ...s, type: "dual" };
            }
            return s;
          });
        }

        const nextData = {
          ...data,
          ...imported,
          pallets: normalizedPallets,
          sectors: importedSectors,
          productCatalog: imported.productCatalog || data.productCatalog,
          warehouseDimensions: imported.warehouseDimensions || data.warehouseDimensions
        };

        persistData(nextData);
        showToast(t("jsonLoadSuccess", { count: normalizedPallets.length }), "success");
      } catch (err) {
        console.error("Error importando JSON:", err);
        showToast(t("jsonLoadError"), "error");
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
    showToast(t("backupDownloaded"), "success");
  };

  // Vaciar Almacén (Empezar de Cero con Salvaguarda)
  const handleClearWarehouse = () => {
    if (confirm(t("emptyConfirm"))) {
      try {
        localStorage.setItem("lmp_warehouse_pre_wipe_backup", JSON.stringify(data));
      } catch (e) {}
      const nextData = {
        ...data,
        pallets: []
      };
      persistData(nextData);
      showToast(t("warehouseCleared"), "info");
    }
  };

  // Descargar Planilla Diagrama de Zona de Productos en PDF (1 Sola Página A4 Apaisado - Captura Fiel de la Vista Preliminar)
  const handleDownloadPdf = async () => {
    const origElement = document.getElementById("printableWarehouseSheet");
    if (!origElement) return;

    showToast(t("generatingPdfToast"), "info");

    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) document.documentElement.classList.remove('dark');

    const filename = `${lang === 'es' ? 'Diagrama_Zona_Productos' : 'Chemical_Products_Zone_Diagram'}_${currentSector.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
      const h2c = (typeof window !== "undefined" && window.html2canvas) || (typeof html2canvas !== "undefined" && html2canvas);
      const jsPdfClass = (typeof window !== "undefined" && (window.jspdf?.jsPDF || window.jsPDF)) || (typeof jspdf !== "undefined" && jspdf?.jsPDF);

      if (h2c && jsPdfClass) {
        // 1. Clonar en un wrapper aislado para eliminar scroll, márgenes y asegurar renderizado perfecto (mismo método que el index original)
        const wrapper = document.createElement("div");
        wrapper.id = "pdfExportWrapper";
        wrapper.style.position = "fixed";
        wrapper.style.top = "-9999px";
        wrapper.style.left = "-9999px";
        wrapper.style.width = "1200px";
        wrapper.style.background = "#FFFFFF";
        wrapper.style.padding = "10px";
        wrapper.style.boxSizing = "border-box";
        wrapper.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        wrapper.style.color = "#000000";
        wrapper.style.zIndex = "99999";

        const clone = origElement.cloneNode(true);
        clone.style.width = "100%";
        clone.style.maxWidth = "100%";
        clone.style.boxShadow = "none";
        clone.style.border = "none";
        clone.style.margin = "0";
        clone.style.padding = "0";

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        // Esperar un ciclo para que el navegador resuelva fuentes y estilos del clon
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await h2c(wrapper, {
          scale: 2, // 2x provee nitidez perfecta sin distorsión
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        document.body.removeChild(wrapper);

        // 2. Generación jsPDF con ajuste proporcional estricto (mismo método que app.js del index)
        const pdf = new jsPdfClass({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = 297;
        const pageHeight = 210;
        const margin = 5;
        const usableWidth = pageWidth - (margin * 2);
        const usableHeight = pageHeight - (margin * 2);

        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let renderHeight = imgHeight;
        let renderWidth = imgWidth;
        let offsetX = margin;
        let offsetY = margin;

        if (imgHeight > usableHeight) {
          renderHeight = usableHeight;
          renderWidth = (canvas.width * renderHeight) / canvas.height;
          offsetX = margin + ((usableWidth - renderWidth) / 2);
        } else {
          offsetY = margin + ((usableHeight - renderHeight) / 2);
        }

        pdf.addImage(canvas.toDataURL("image/png"), "PNG", offsetX, offsetY, renderWidth, renderHeight);
        pdf.save(filename);

        if (isDark) document.documentElement.classList.add('dark');
        showToast(t("pdfSuccessToast"), "success");
        return;
      }

      // Fallback: diálogo nativo de impresión
      window.print();
      if (isDark) document.documentElement.classList.add('dark');
    } catch (err) {
      if (isDark) document.documentElement.classList.add('dark');
      console.error("PDF generation error:", err);
      window.print();
    }
  };

  // Descargar Captura PNG Directa de Alta Resolución (Screenshot)
  const handleDownloadImage = async () => {
    const origElement = document.getElementById("printableWarehouseSheet");
    if (!origElement) return;

    showToast(lang === 'es' ? "Generando captura de pantalla..." : "Generating screenshot...", "info");

    try {
      const h2c = (typeof window !== "undefined" && window.html2canvas) || (typeof html2canvas !== "undefined" && html2canvas);
      if (h2c) {
        const wrapper = document.createElement("div");
        wrapper.id = "imgExportWrapper";
        wrapper.style.position = "fixed";
        wrapper.style.top = "-9999px";
        wrapper.style.left = "-9999px";
        wrapper.style.width = "1200px";
        wrapper.style.background = "#FFFFFF";
        wrapper.style.padding = "10px";
        wrapper.style.boxSizing = "border-box";
        wrapper.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        wrapper.style.color = "#000000";
        wrapper.style.zIndex = "99999";

        const clone = origElement.cloneNode(true);
        clone.style.width = "100%";
        clone.style.boxShadow = "none";
        clone.style.border = "none";
        clone.style.margin = "0";

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await h2c(wrapper, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        document.body.removeChild(wrapper);

        const link = document.createElement("a");
        link.download = `${lang === 'es' ? 'Diagrama_Zona_Productos' : 'Chemical_Products_Zone_Diagram'}_${currentSector.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast(lang === 'es' ? "✓ Captura PNG descargada con éxito." : "✓ PNG Screenshot downloaded.", "success");
      }
    } catch (err) {
      console.error("Image generation error:", err);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  // KPIs
  const {
    totalSlots,
    occupiedCount,
    freeSlots,
    occPct,
    freeSolids,
    freeLiquids,
    solidsSlots,
    liquidsSlots,
    solidsOccupied,
    liquidsOccupied
  } = useMemo(() => {
    let tSlots = 48;
    let sOccupied = 0;
    let lOccupied = 0;
    let sSlots = 48;
    let lSlots = 0;

    if (currentSector.type === "dual") {
      sSlots = (sDims.rows || 6) * (sDims.columns?.length || 10);
      lSlots = (lDims.rows || 6) * (lDims.columns?.length || 8);
      tSlots = sSlots + lSlots;
      sOccupied = data.pallets.filter(p => (p.sectorId || "principal") === currentSector.id && p.zone !== "liquidos" && Number(p.quantity) > 0).length;
      lOccupied = data.pallets.filter(p => (p.sectorId || "principal") === currentSector.id && p.zone === "liquidos" && Number(p.quantity) > 0).length;
    } else {
      const nRows = sDims.rows || 4;
      const nCols = sDims.columns ? sDims.columns.length : 12;
      tSlots = nRows * nCols;
      const occ = data.pallets.filter(p => (p.sectorId || "principal") === currentSector.id && Number(p.quantity) > 0).length;
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
      freeLiquids: Math.max(0, lSlots - lOccupied),
      solidsSlots: sSlots,
      liquidsSlots: lSlots,
      solidsOccupied: sOccupied,
      liquidsOccupied: lOccupied
    };
  }, [data.pallets, currentSector, sDims, lDims]);

  // Desplazamiento por Flechas (1 Columna = 116px * zoomLevel)
  const scrollBays = (zoneKey, direction) => {
    const ref = zoneKey === "solidos" ? solidsScrollRef.current : liquidsScrollRef.current;
    if (!ref) return;
    const delta = (direction === "left" ? -116 : 116) * zoomLevel;
    ref.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Eliminar Sector Personalizado
  // Eliminar Sector Personalizado
  const handleDeleteSector = (sectorId) => {
    if (sectorId === "principal") return;
    const sec = data.sectors.find(s => s.id === sectorId);
    if (!window.confirm(t("confirmDeleteTab", { name: sec?.name || sectorId }))) return;
    const nextSectors = data.sectors.filter(s => s.id !== sectorId);
    const nextPallets = data.pallets.filter(p => (p.sectorId || "principal") !== sectorId);
    persistData({ ...data, sectors: nextSectors, pallets: nextPallets });
    if (activeSectorId === sectorId) {
      setActiveSectorId("principal");
    }
    showToast(t("tabDeleted", { name: sec?.name || '' }), "info");
  };

  // Abrir Modal de Recepción / Ingreso
  const openReception = (target = null) => {
    setReceptionTarget(target);
    setIsCustomProduct(false);
    setCustomProdName("");
    const firstProd = OFFICIAL_BAROID_CATALOG[0] || {};
    setReceptionSelectedProd(firstProd.name || "BAROID® Barita");
    setReceptionUnits((firstProd.defaultPackage || "").includes("Big Bag") ? 1 : ((firstProd.defaultPackage || "").includes("Tambor") ? 4 : 50));
    setReceptionUnitWeight(firstProd.unitWeight || 25);
    setShowReceptionModal(true);
  };

  // Selección de Pallet o Clic en Celda Vacía
  const handlePalletClick = (pallet, zone, col, row) => {
    if (!pallet) {
      // Clic en Celda Vacía
      if (copiedPallet) {
        // Pegar de portapapeles
        const newPallet = {
          ...copiedPallet,
          id: `PAL-${(zone || 'mix').substring(0,3).toUpperCase()}-${col}${row}-${Date.now().toString().slice(-4)}`,
          zone: zone || 'mixto',
          col,
          row,
          sectorId: activeSectorId
        };
        const nextPallets = data.pallets.filter(p => !(p.zone === zone && p.col === col && p.row === row && (p.sectorId || "principal") === activeSectorId));
        nextPallets.push(newPallet);
        persistData({ ...data, pallets: nextPallets });
        showToast(t("palletPasted", { pos: `${col}${row}`, prod: newPallet.product }), "success");
      } else {
        // Abrir recepción inmediata
        openReception({ zone, col, row, sectorId: activeSectorId });
      }
      return;
    }

    // Clic en Pallet Ocupado -> Seleccionar (para Ctrl+C / Supr)
    setSelectedPallet(pallet);
    showToast(t("palletSelected", { pos: `${col}${row}`, prod: pallet.product }), "info");
  };

  // Doble Clic en Pallet Ocupado -> Abrir Modal para Indicar Stock Restante
  const handlePalletDblClick = (pallet) => {
    if (!pallet) return;
    setActionPallet(pallet);
    setStockEntryMode("direct");
    setRemainingInputQty(pallet.quantity);
    let wt = 25;
    if (pallet.packageDetails) {
      const match = pallet.packageDetails.match(/x\s*([\d.]+)/);
      if (match) wt = parseFloat(match[1]);
    } else {
      const def = productCatalogMap.get(pallet.product);
      if (def?.unitWeight) wt = def.unitWeight;
    }
    setRemainingBagWeight(wt || 25);
    setRemainingBagsCount(Math.round(pallet.quantity / (wt || 25)));
    setShowPalletActionModal(true);
  };

  // Copiar Pallet
  const handleCopyPallet = (pallet, e) => {
    if (e) e.stopPropagation();
    setCopiedPallet(pallet);
    showToast(t("palletCopied", { prod: pallet.product, lot: pallet.lot }), "info");
  };

  // Eliminar / Vaciar Pallet (Directo e instantáneo sin diálogos para máxima agilidad en campo)
  const handleDeletePallet = (pallet, e) => {
    if (e) e.stopPropagation();
    if (!pallet) return;
    const nextPallets = data.pallets.filter(p => p.id !== pallet.id);
    persistData({ ...data, pallets: nextPallets });
    if (selectedPallet?.id === pallet.id) setSelectedPallet(null);
    if (copiedPallet?.id === pallet.id) setCopiedPallet(null);
    showToast(t("palletDeleted", { pos: `${pallet.col}${pallet.row}` }), "warning");
  };

  // --- DRAG & DROP HANDLERS (Mover e Intercambiar Pallets) ---
  const handleDragStart = (e, pallet, zone, col, row) => {
    if (!pallet) return;
    const cCol = String(col || pallet.col || '').trim().toUpperCase();
    const cRow = Number(row ?? pallet.row);
    const zZone = zone || pallet.zone || (currentSector.type === "dual" ? "solidos" : "mixto");

    setDraggedPallet({
      pallet,
      zone: zZone,
      col: cCol,
      row: cRow,
      sectorId: activeSectorId
    });

    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", pallet.id);
    } catch (_) {}
  };

  const handleDragOver = (e, zone, col, row) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const cCol = String(col || '').trim().toUpperCase();
    const cRow = Number(row);
    const zZone = zone || (currentSector.type === "dual" ? "solidos" : "mixto");

    if (
      !dragOverTarget ||
      dragOverTarget.zone !== zZone ||
      dragOverTarget.col !== cCol ||
      dragOverTarget.row !== cRow
    ) {
      setDragOverTarget({ zone: zZone, col: cCol, row: cRow });
    }
  };

  const handleDragLeave = (e, zone, col, row) => {
    const cCol = String(col || '').trim().toUpperCase();
    const cRow = Number(row);
    const zZone = zone || (currentSector.type === "dual" ? "solidos" : "mixto");

    if (
      dragOverTarget &&
      dragOverTarget.zone === zZone &&
      dragOverTarget.col === cCol &&
      dragOverTarget.row === cRow
    ) {
      setDragOverTarget(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedPallet(null);
    setDragOverTarget(null);
  };

  const handleDrop = (e, targetPallet, targetZone, targetCol, targetRow) => {
    e.preventDefault();
    setDragOverTarget(null);
    if (!draggedPallet) return;

    const tCol = String(targetCol || '').trim().toUpperCase();
    const tRow = Number(targetRow);
    const tZone = targetZone || (currentSector.type === "dual" ? "solidos" : "mixto");

    const sCol = String(draggedPallet.col || '').trim().toUpperCase();
    const sRow = Number(draggedPallet.row);
    const sZone = draggedPallet.zone;

    // Si se suelta en la misma ubicación exacta
    if (sZone === tZone && sCol === tCol && sRow === tRow) {
      setDraggedPallet(null);
      return;
    }

    const currentPallets = [...(data.pallets || [])];

    if (!targetPallet) {
      // 1. TRASLADO A ESPACIO VACÍO
      const nextPallets = currentPallets.map(p => {
        if (
          p.id === draggedPallet.pallet.id ||
          ((p.sectorId || "principal") === activeSectorId &&
            String(p.col).trim().toUpperCase() === sCol &&
            Number(p.row) === sRow &&
            (currentSector.type !== "dual" || (p.zone || "solidos") === sZone))
        ) {
          return {
            ...p,
            zone: tZone,
            col: tCol,
            row: tRow,
            sectorId: activeSectorId
          };
        }
        return p;
      });

      persistData({ ...data, pallets: nextPallets });
      showToast(
        t("palletMoved", {
          prod: draggedPallet.pallet.product,
          from: `${sCol}${sRow}`,
          to: `${tCol}${tRow}`
        }),
        "success"
      );
    } else {
      // 2. INTERCAMBIO (SWAP) ENTRE DOS PALLETS
      const nextPallets = currentPallets.map(p => {
        // Pallet arrastrado pasa a la celda de destino
        if (
          p.id === draggedPallet.pallet.id ||
          ((p.sectorId || "principal") === activeSectorId &&
            String(p.col).trim().toUpperCase() === sCol &&
            Number(p.row) === sRow &&
            (currentSector.type !== "dual" || (p.zone || "solidos") === sZone))
        ) {
          return {
            ...p,
            zone: tZone,
            col: tCol,
            row: tRow,
            sectorId: activeSectorId
          };
        }
        // Pallet existente en destino pasa a la celda de origen
        if (
          p.id === targetPallet.id ||
          ((p.sectorId || "principal") === activeSectorId &&
            String(p.col).trim().toUpperCase() === tCol &&
            Number(p.row) === tRow &&
            (currentSector.type !== "dual" || (p.zone || "solidos") === tZone))
        ) {
          return {
            ...p,
            zone: sZone,
            col: sCol,
            row: sRow,
            sectorId: activeSectorId
          };
        }
        return p;
      });

      persistData({ ...data, pallets: nextPallets });
      showToast(
        t("palletsSwapped", {
          pos1: `${sCol}${sRow}`,
          pos2: `${tCol}${tRow}`
        }),
        "success"
      );
    }

    setDraggedPallet(null);
  };

  // Toggle Resaltar Parciales
  const togglePartialFilter = () => {
    if (activeFilter && activeFilter.type === "partial") {
      setActiveFilter(null);
      showToast(t("filterPartialsOff"), "info");
    } else {
      setActiveFilter({ type: "partial", value: "partial" });
      const partialsCount = data.pallets.filter(p => {
        const isPart = p.status === "partial" || (p.capacityNominal && Number(p.quantity) < Number(p.capacityNominal));
        return (p.sectorId || "principal") === activeSectorId && isPart;
      }).length;
      showToast(t("filterPartialsOn", { count: partialsCount }), "info");
    }
  };

  // Atajos de teclado (Escape para cerrar modales o limpiar búsqueda, Ctrl+Z deshacer, Ctrl+C copiar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (searchQuery) setSearchQuery("");
        if (showReceptionModal) setShowReceptionModal(false);
        if (showPalletActionModal) setShowPalletActionModal(false);
        if (showNewSectorModal) setShowNewSectorModal(false);
        if (showDimensionsModal) setShowDimensionsModal(false);
        if (showPrintModal) setShowPrintModal(false);
        if (draggedPallet) setDraggedPallet(null);
        if (dragOverTarget) setDragOverTarget(null);
        if (copiedPallet) {
          setCopiedPallet(null);
          showToast(t("cancelCopy"), "info");
        }
        if (selectedPallet) {
          setSelectedPallet(null);
        }
        if (activeFilter) {
          setActiveFilter(null);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoLastAction();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedPallet) {
        e.preventDefault();
        handleCopyPallet(selectedPallet);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPallet) {
        const targetTag = e.target?.tagName?.toLowerCase();
        if (targetTag !== 'input' && targetTag !== 'textarea' && targetTag !== 'select') {
          if (!showReceptionModal && !showPalletActionModal && !showNewSectorModal && !showDimensionsModal && !showPrintModal) {
            e.preventDefault();
            handleDeletePallet(selectedPallet);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPallet, copiedPallet, draggedPallet, dragOverTarget, showReceptionModal, showPalletActionModal, showNewSectorModal, showDimensionsModal, showPrintModal, undoStack, data, lang, searchQuery, activeFilter]);

  // Búsqueda reactiva de lotes y productos en el almacén
  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return (data.pallets || []).filter(p =>
      p &&
      (p.sectorId || "principal") === activeSectorId &&
      Number(p.quantity) > 0 &&
      (((p.lot || "").toLowerCase().includes(q)) || ((p.product || "").toLowerCase().includes(q)))
    );
  }, [data.pallets, activeSectorId, searchQuery]);

  // Resumen acumulado por producto y lote
  const stockSummary = useMemo(() => {
    const map = {};
    (data.pallets || []).forEach(p => {
      if (!p || (p.sectorId || "principal") !== activeSectorId || !p.quantity || p.quantity <= 0 || !p.product) return;
      if (!map[p.product]) {
        map[p.product] = {
          name: p.product,
          totalQty: 0,
          unit: p.unit || "KG",
          lots: {}
        };
      }
      map[p.product].totalQty += Number(p.quantity);
      const lKey = p.lot || "S/L";
      map[p.product].lots[lKey] = (map[p.product].lots[lKey] || 0) + Number(p.quantity);
    });
    return Object.values(map);
  }, [data.pallets, activeSectorId]);

  // Exportar CSV Excel
  const exportCsv = () => {
    const activePallets = data.pallets.filter(p => Number(p.quantity) > 0 && (p.sectorId || "principal") === activeSectorId);
    if (activePallets.length === 0) {
      showToast(t("noStockExport"), "warning");
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
    showToast(t("csvSuccess"), "success");
  };

  // Render Pallet Card Individual con HashMap O(1) de alto rendimiento y Soporte Drag & Drop
  const renderPalletCard = (zone, col, row) => {
    const cCol = String(col || '').trim().toUpperCase();
    const cRow = Number(row);
    const pallet = getPalletAt(zone, cCol, cRow);

    const isSelected = selectedPallet && selectedPallet.id === pallet?.id;
    const isCopied = copiedPallet && copiedPallet.id === pallet?.id;

    const isDragTarget = dragOverTarget && dragOverTarget.zone === zone && dragOverTarget.col === cCol && dragOverTarget.row === cRow;
    const isBeingDragged = draggedPallet && (draggedPallet.pallet.id === pallet?.id || (
      draggedPallet.zone === zone && draggedPallet.col === cCol && draggedPallet.row === cRow
    ));

    if (!pallet) {
      const isLiquids = zone === "liquidos";
      return (
        <div
          key={`${zone}-${col}-${row}`}
          onClick={() => handlePalletClick(null, zone, col, row)}
          onDragOver={(e) => handleDragOver(e, zone, col, row)}
          onDragLeave={(e) => handleDragLeave(e, zone, col, row)}
          onDrop={(e) => handleDrop(e, null, zone, col, row)}
          style={{ width: `${cardWidth}px`, height: `${cardHeight}px`, minWidth: `${cardWidth}px`, maxWidth: `${cardWidth}px`, minHeight: `${cardHeight}px`, maxHeight: `${cardHeight}px` }}
          className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all select-none p-1 text-center ${
            isDragTarget
              ? 'bg-emerald-100/90 dark:bg-emerald-950/60 border-emerald-500 ring-4 ring-emerald-400 scale-105 shadow-xl text-emerald-700 dark:text-emerald-300'
              : copiedPallet
                ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 animate-pulse hover:bg-blue-100 hover:scale-105'
                : isLiquids
                  ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800/60 hover:border-purple-500 hover:bg-purple-50/80 text-purple-600 dark:text-purple-400'
                  : 'bg-slate-50/80 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 hover:border-halliburton-red hover:bg-red-50/10 text-slate-400 dark:text-slate-500'
          }`}
          title={
            isDragTarget
              ? t("dropHere")
              : copiedPallet
                ? `${t("paste")} (${isLiquids ? t("tray") + ' ' : ''}${col}${row})`
                : isLiquids
                  ? t("containmentTrayTooltip", { col, row })
                  : t("emptySlotTooltip", { col, row })
          }
        >
          {isDragTarget ? (
            <div className="flex flex-col items-center justify-center animate-bounce pointer-events-none">
              <Icon name="arrow-down" size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                {t("dropHere")}
              </span>
            </div>
          ) : copiedPallet ? (
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 uppercase tracking-wider">
              <Icon name="copy" size={12} /> {t("paste")} {col}{row}
            </span>
          ) : isLiquids ? (
            <div className="flex flex-col items-center justify-center leading-tight">
              <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {t("tray")}
              </span>
              <span className="text-xs font-black tracking-wider text-purple-700 dark:text-purple-300">
                {col}{row}
              </span>
              <span className="text-[8px] font-bold text-purple-500/80 dark:text-purple-400/80 uppercase">
                {t("free")}
              </span>
            </div>
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

    // Lógica de resaltado por búsqueda instantánea o por filtros
    let isDimmed = false;
    let isHighlighted = false;

    const cleanSearch = searchQuery.trim().toLowerCase();
    if (cleanSearch.length > 0) {
      const matchLot = (pallet.lot || "").toLowerCase().includes(cleanSearch);
      const matchProd = (pallet.product || "").toLowerCase().includes(cleanSearch);
      if (matchLot || matchProd) {
        isHighlighted = true;
      } else {
        isDimmed = true;
      }
    } else if (activeFilter) {
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

    const prodDef = productCatalogMap.get(pallet.product);
    const bgColor = prodDef ? prodDef.color : "#991B1B";
    const shortName = getShortProductName(pallet.product);

    return (
      <div
        key={pallet.id}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, pallet, zone, col, row)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, zone, col, row)}
        onDragLeave={(e) => handleDragLeave(e, zone, col, row)}
        onDrop={(e) => handleDrop(e, pallet, zone, col, row)}
        onClick={() => handlePalletClick(pallet, zone, col, row)}
        onDoubleClick={() => handlePalletDblClick(pallet)}
        style={{
          backgroundColor: bgColor,
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          minWidth: `${cardWidth}px`,
          maxWidth: `${cardWidth}px`,
          minHeight: `${cardHeight}px`,
          maxHeight: `${cardHeight}px`
        }}
        className={`rounded-xl relative p-1 pt-3.5 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none transition-all overflow-hidden ${
          isBeingDragged
            ? 'opacity-30 scale-95 border-2 border-dashed border-white shadow-none ring-0'
            : isDragTarget
              ? 'ring-4 ring-sky-400 ring-offset-2 scale-105 z-30 shadow-2xl'
              : isSelected
                ? 'ring-4 ring-sky-400 ring-offset-2 z-20 shadow-xl scale-105'
                : 'shadow-md hover:scale-102 hover:shadow-lg'
        } ${isPartial ? 'border-2 border-dashed border-amber-400 shadow-[inset_0_0_10px_rgba(245,158,11,0.3)]' : 'border border-white/20'} ${
          isDimmed ? 'opacity-20 grayscale contrast-75 scale-95' : ''
        } ${isHighlighted && !isBeingDragged ? 'ring-4 ring-amber-400 ring-offset-2 scale-105 z-30 shadow-2xl animate-pulse' : ''}`}
        title={`${pallet.product} | ${t("filter") === "Filter" ? "Lot" : "Lote"}: ${pallet.lot} | ${pallet.quantity} ${pallet.unit}${isPartial ? ` (PARCIAL: ${pct}%)` : ''} | Pos: ${col}${row}`}
      >
        {/* Overlay cuando se arrastra otro pallet sobre este (Swap) */}
        {isDragTarget && !isBeingDragged && (
          <div className="absolute inset-0 bg-sky-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center z-40 text-white font-bold p-1 animate-pulse pointer-events-none">
            <Icon name="refresh-cw" size={16} className="text-sky-300 animate-spin mb-0.5" />
            <span className="text-[9px] font-black uppercase tracking-wider text-center leading-none">
              {t("swapWith")}
            </span>
          </div>
        )}

        {/* Botón Copiar (Esquina Sup. Izquierda) */}
        <button
          type="button"
          onClick={(e) => handleCopyPallet(pallet, e)}
          className="absolute top-1 left-1 w-[18px] h-[18px] rounded-md bg-slate-900/60 backdrop-blur-sm border border-white/40 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-blue-600 hover:scale-110 transition-all z-10"
          title={`${t("copy")} (Ctrl+C)`}
        >
          <Icon name="copy" size={10} />
        </button>

        {/* Botón Eliminar / Vaciar (Esquina Sup. Derecha - Cruz Roja) */}
        <button
          type="button"
          onClick={(e) => handleDeletePallet(pallet, e)}
          className="absolute top-1 right-1 w-[18px] h-[18px] rounded-md bg-red-600 border border-white/60 text-white flex items-center justify-center opacity-85 hover:opacity-100 hover:bg-red-700 hover:scale-110 transition-all z-10 shadow-sm"
          title={t("deleteEmpty")}
        >
          <Icon name="x" size={11} />
        </button>

        {/* Contenido Central: Nombre, Cantidad y Lote */}
        <div className="flex flex-col items-center justify-center text-center w-full gap-0.5 leading-none pointer-events-none">
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

  // Métricas geométricas y tipográficas calculadas para que el diagrama entre en 1 SOLA PÁGINA A4 Landscape
  const printMetrics = useMemo(() => {
    const isDual = currentSector.type === "dual";
    const sRows = sDims.rows;
    const lRows = isDual ? lDims.rows : 0;
    const totalRows = isDual ? (sRows + lRows) : sRows;
    const maxCols = Math.max(sDims.columns.length, isDual ? lDims.columns.length : 0);

    // Altura del card confortable para que nunca se aplasten las líneas de texto
    let cardH = 56;
    let titlePx = 10;
    let lotPx = 12.5;
    let qtyPx = 9.5;
    let titleSize = "text-[10px]";
    let lotSize = "text-[12px]";
    let qtySize = "text-[9.5px]";
    let gapClass = "gap-1";

    if (totalRows <= 4) {
      cardH = 88;
      titlePx = 12.5;
      lotPx = 15;
      qtyPx = 12;
      titleSize = "text-[12px]";
      lotSize = "text-[15px]";
      qtySize = "text-[12px]";
      gapClass = "gap-1.5";
    } else if (totalRows <= 6) {
      cardH = 72;
      titlePx = 11.5;
      lotPx = 13.5;
      qtyPx = 11;
      titleSize = "text-[11px]";
      lotSize = "text-[13px]";
      qtySize = "text-[10.5px]";
      gapClass = "gap-1";
    } else if (totalRows <= 8) {
      cardH = 62;
      titlePx = 10.5;
      lotPx = 12.5;
      qtyPx = 10;
      titleSize = "text-[10px]";
      lotSize = "text-[12px]";
      qtySize = "text-[10px]";
      gapClass = "gap-1";
    } else if (totalRows <= 10) {
      cardH = 54;
      titlePx = 10;
      lotPx = 12;
      qtyPx = 9.5;
      titleSize = "text-[9.5px]";
      lotSize = "text-[11.5px]";
      qtySize = "text-[9.5px]";
      gapClass = "gap-0.5";
    } else if (totalRows <= 12) {
      cardH = 50;
      titlePx = 9.5;
      lotPx = 11.5;
      qtyPx = 9;
      titleSize = "text-[9px]";
      lotSize = "text-[11px]";
      qtySize = "text-[9px]";
      gapClass = "gap-0.5";
    } else {
      cardH = Math.max(44, Math.floor(520 / totalRows));
      titlePx = 8.5;
      lotPx = 10.5;
      qtyPx = 8.5;
      titleSize = "text-[8.5px]";
      lotSize = "text-[10.5px]";
      qtySize = "text-[8.5px]";
      gapClass = "gap-0.5";
    }

    // Si hay 12 o más columnas (ej. de la A a la M), ajustar ligeramente los tamaños para que no desborden horizontalmente
    if (maxCols >= 12) {
      titlePx = Math.max(7.5, titlePx - 0.8);
      lotPx = Math.max(9, lotPx - 1);
      qtyPx = Math.max(7.5, qtyPx - 0.8);
    }

    return {
      cardH,
      titlePx,
      lotPx,
      qtyPx,
      titleSize,
      qtySize,
      lotSize,
      gapClass,
      totalRows,
      isDual
    };
  }, [currentSector, sDims, lDims]);

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
              {t("mapTitle")}
            </h2>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 pl-4 uppercase tracking-wider mt-0.5">
            {t("mapSubtitle")} &bull; {currentSector.name}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón Ingreso Pallet */}
          <button
            onClick={() => openReception(null)}
            className="flex items-center gap-2 px-4 py-2 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <Icon name="plus-circle" size={14} />
            <span>{t("receivePallet")}</span>
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
            <span>{activeFilter?.type === "partial" ? t("showingPartials") : t("highlightPartials")}</span>
          </button>

          {/* Badge de Filtro Activo */}
          {activeFilter && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs font-black text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>{activeFilter.type === "partial" ? t("partialsOnly") : `${t("filter")}: ${activeFilter.value}`}</span>
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
            <span>{t("loadJson")}</span>
          </button>

          {/* Respaldar JSON */}
          <button
            onClick={handleExportInventoryJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
            title="Descargar copia de seguridad completa del inventario (JSON)"
          >
            <Icon name="download" size={14} />
            <span className="hidden sm:inline">{t("backup")}</span>
          </button>

          {/* Restaurar Respaldo Seguro */}
          <button
            onClick={handleRestoreSafeBackup}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm border border-emerald-200 dark:border-emerald-800/40"
            title={lang === 'es' ? "Restaurar automáticamente el último inventario con pallets guardado en este equipo" : "Restore last safe inventory backup with pallets from this browser"}
          >
            <Icon name="shield-check" size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">{lang === 'es' ? "Restaurar Copia" : "Restore Copy"}</span>
          </button>

          {/* Vaciar Almacén */}
          {data.pallets.filter(p => (p.sectorId || 'principal') === activeSectorId && p.quantity > 0).length > 0 && (
            <button
              onClick={handleClearWarehouse}
              className="flex items-center gap-1 px-2.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-halliburton-red rounded-xl text-xs font-bold transition-all"
              title="Vaciar todos los lotes para comenzar de cero"
            >
              <Icon name="trash-2" size={13} />
              <span className="hidden xl:inline text-[11px]">{t("clear")}</span>
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
            <span>{t("undo")}</span>
          </button>

          {/* Zoom con botones de escala */}
          <div className="flex items-center bg-zinc-100 dark:bg-slate-800/80 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700" title={t("zoomTooltip")}>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.60, Math.round((prev - 0.05) * 100) / 100))}
              className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
              title={t("zoomOut")}
            >
              <Icon name="minus" size={12} />
            </button>
            <span
              onClick={() => setZoomLevel(1)}
              className="text-[10px] font-black px-1.5 text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-halliburton-red select-none transition-colors"
              title="Clic para restablecer al 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.30, Math.round((prev + 0.05) * 100) / 100))}
              className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
              title={t("zoomIn")}
            >
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
                    title={`${t("closeTab")} "${sec.name}"`}
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
          <span>{t("newTab")}</span>
        </button>
      </div>

      {/* 4 TARJETAS SUPERIORES: Capacidad de Pedido, Barra de Búsqueda, Ocupación Actual, Impresión PDF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* TARJETA 1: Capacidad de Pedido (Compacta) */}
        <div className="p-3.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Icon name="package-plus" size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">{t("orderCapacity")}</span>
                <div className="text-xl font-black italic tracking-tight text-emerald-500 leading-tight">
                  {freeSlots} {t("free")}
                </div>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-600/80 dark:text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              {totalSlots > 0 ? Math.round((freeSlots / totalSlots) * 100) : 0}%
            </span>
          </div>

          <div>
            <div className="w-full bg-zinc-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalSlots > 0 ? (freeSlots / totalSlots) * 100 : 0}%` }}></div>
            </div>
            {currentSector.type === "dual" ? (
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1.5">
                <span className="text-blue-500 font-black">{t("solids")}: {freeSolids}</span>
                <span className="text-purple-500 font-black">{t("trays")}: {freeLiquids}</span>
              </div>
            ) : (
              <div className="text-[9px] text-zinc-400 font-bold mt-1 text-right">
                {t("orderAvailable")}
              </div>
            )}
          </div>
        </div>

        {/* TARJETA 2: Barra de Búsqueda Instantánea de Lote / Producto */}
        <div className="p-3.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Icon name="search" size={18} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t("lotProdSearch")}
              </span>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-xs font-black cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-slate-800"
                title="Limpiar búsqueda (Esc)"
              >
                &times; {t("clearBtn")}
              </button>
            )}
          </div>

          <div className="relative">
            <Icon name="search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-7 pr-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/60 dark:bg-slate-800 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner"
            />
          </div>

          {searchQuery ? (
            <div className="text-[10px] font-black truncate flex items-center gap-1">
              {searchMatches.length > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0"></span>
                  <span>📍 {searchMatches.length} {t("inSlots")} {searchMatches.map(m => (m.zone === 'liquidos' ? 'B-' : '') + `${m.col}${m.row}`).slice(0, 4).join(', ')}{searchMatches.length > 4 ? '...' : ''}</span>
                </span>
              ) : (
                <span className="text-rose-500 dark:text-rose-400">❌ {t("noMatches")}</span>
              )}
            </div>
          ) : (
            <div className="text-[9px] text-zinc-400 font-bold truncate">
              {t("directHighlight")}
            </div>
          )}
        </div>

        {/* TARJETA 3: Ocupación Actual */}
        <div className="p-3.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-halliburton-red/10 text-halliburton-red flex items-center justify-center shrink-0">
                <Icon name="layers" size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">{t("currentOccupancy")}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black italic tracking-tight text-zinc-800 dark:text-white leading-tight">
                    {occupiedCount} / {totalSlots}
                  </span>
                  <span className="text-xs font-black text-zinc-400">({occPct}%)</span>
                </div>
              </div>
            </div>
            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
              occPct >= 90 ? 'bg-red-500/10 text-red-500' : occPct >= 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {occupiedCount} pallets
            </span>
          </div>

          <div>
            <div className="w-full bg-zinc-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-halliburton-red h-full rounded-full transition-all duration-500" style={{ width: `${occPct}%` }}></div>
            </div>
            {currentSector.type === "dual" ? (
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-1.5">
                <span className="text-blue-500 font-black">{t("solids")}: {solidsOccupied}/{solidsSlots}</span>
                <span className="text-purple-500 font-black">{t("trays")}: {liquidsOccupied}/{liquidsSlots}</span>
              </div>
            ) : (
              <div className="text-[9px] text-zinc-400 font-bold mt-1 text-right">
                {occupiedCount} {t("loadedPallets")}
              </div>
            )}
          </div>
        </div>

        {/* TARJETA 4: Impresión PDF / Conteo de Materiales */}
        <div
          onClick={() => setShowPrintModal(true)}
          className="group p-3.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm hover:border-halliburton-red dark:hover:border-halliburton-red hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-2.5 active:scale-[0.99]"
          title={t("openPrintModalTooltip")}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-halliburton-red/10 text-halliburton-red group-hover:bg-halliburton-red group-hover:text-white flex items-center justify-center shrink-0 transition-all">
                <Icon name="printer" size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-halliburton-red transition-colors block">
                  {t("pdfPrintout")}
                </span>
                <div className="text-base font-black italic tracking-tight text-zinc-800 dark:text-white group-hover:text-halliburton-red transition-colors leading-tight">
                  {t("warehouseSheetTitle")}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-100 group-hover:bg-halliburton-red text-zinc-600 group-hover:text-white dark:bg-slate-800 dark:text-zinc-300 transition-all">
              PDF
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors pt-0.5 border-t border-zinc-100 dark:border-zinc-800/60">
            <span>{t("fieldCountingSheetSubtitle")}</span>
            <Icon name="chevron-right" size={14} className="text-halliburton-red transform group-hover:translate-x-1 transition-transform" />
          </div>
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
                    {t("cleanWarehouseTitle")}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {t("cleanWarehouseDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <Icon name="upload" size={14} />
                  <span>{t("loadInventoryBtn")}</span>
                </button>
              </div>
            </div>
          )}

          {/* ZONA PRINCIPAL / SÓLIDOS (Lienzo Único o Sector Sólidos en Doble Área) */}
          {(currentSector.type === "dual" || currentSector.type === "solidos" || currentSector.type === "mixto") && (
            <div className="p-4 lg:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 font-black text-xs uppercase tracking-wider">
                    {currentSector.type === "dual" ? t("solidsZone") : currentSector.name.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    ({sDims.rows} {t("rows")} &bull; {sDims.columns.length} {t("cols")})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Flechas de Navegación por Columna (◀ Cols ▶) */}
                  <div className="flex items-center bg-zinc-100 dark:bg-slate-800 rounded-xl p-0.5 border border-zinc-200 dark:border-zinc-700" title={t("navColsTooltip")}>
                    <button
                      onClick={() => scrollBays("solidos", "left")}
                      className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-halliburton-red hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      title={t("prevCol")}
                    >
                      <Icon name="chevron-left" size={16} />
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1 text-zinc-400">Cols</span>
                    <button
                      onClick={() => scrollBays("solidos", "right")}
                      className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-halliburton-red hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      title={t("nextCol")}
                    >
                      <Icon name="chevron-right" size={16} />
                    </button>
                  </div>

                  {/* + Fila */}
                  <button
                    onClick={() => {
                      const next = { ...data };
                      if (currentSector.type === "dual") {
                        if (!next.warehouseDimensions) next.warehouseDimensions = { solidos: { rows: 6, columns: ["A","B","C","D"] } };
                        next.warehouseDimensions.solidos.rows = Math.min(20, (next.warehouseDimensions.solidos.rows || 6) + 1);
                      } else {
                        const s = next.sectors.find(x => x.id === currentSector.id);
                        if (s) s.rows = Math.min(20, (s.rows || 4) + 1);
                      }
                      persistData(next);
                      showToast(t("rowAdded"), "success");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    {t("addRow")}
                  </button>

                  {/* + Col */}
                  <button
                    onClick={() => {
                      const next = { ...data };
                      let targetCols;
                      if (currentSector.type === "dual") {
                        if (!next.warehouseDimensions) next.warehouseDimensions = { solidos: { rows: 6, columns: ["A","B","C","D"] } };
                        targetCols = next.warehouseDimensions.solidos.columns;
                      } else {
                        const s = next.sectors.find(x => x.id === currentSector.id);
                        if (s) {
                          if (!s.columns) s.columns = ["A","B","C","D","E","F","G","H","I","J","K","L"];
                          targetCols = s.columns;
                        }
                      }
                      if (targetCols) {
                        const nextLetter = ALL_ALPHABET.find(l => !targetCols.includes(l)) || "Z";
                        targetCols.push(nextLetter);
                        targetCols.sort();
                        persistData(next);
                        showToast(t("colAdded", { col: nextLetter }), "success");
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    {t("addCol")}
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
                  title={t("scrollToPrevCol")}
                >
                  <Icon name="chevron-left" size={18} />
                </button>

                <div
                  ref={solidsScrollRef}
                  className="overflow-x-auto custom-scrollbar-thick pb-3 scroll-smooth px-1"
                >
                  <div
                    className="flex gap-2 items-stretch py-1 min-w-max transition-all duration-150"
                  >
                    {sDims.columns.map((colLetter, cIdx) => (
                      <React.Fragment key={`sol-col-${colLetter}`}>
                        {cIdx > 0 && (
                          <div
                            style={{ width: `${aisleWidth}px`, minWidth: `${aisleWidth}px`, maxWidth: `${aisleWidth}px`, writingMode: 'vertical-rl' }}
                            className="rounded-lg bg-slate-100/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 select-none tracking-widest shrink-0"
                          >
                            {t("aisle")}
                          </div>
                        )}
                        <div
                          style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px`, maxWidth: `${cardWidth}px` }}
                          className="flex flex-col gap-1.5 shrink-0"
                        >
                          {Array.from({ length: sDims.rows }, (_, rIdx) => rIdx + 1).map(rowNum =>
                            renderPalletCard(currentSector.type === "dual" ? "solidos" : "mixto", colLetter, rowNum)
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
                  title={t("scrollToNextCol")}
                >
                  <Icon name="chevron-right" size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ZONA LÍQUIDOS (Solo si el sector es de tipo Doble Área "dual" o "liquidos") */}
          {(currentSector.type === "dual" || currentSector.type === "liquidos") && (
            <div className="p-4 lg:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-0.5 rounded-lg bg-purple-500/10 text-purple-500 font-black text-xs uppercase tracking-wider">
                    {t("liquidsZoneTrays")}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    ({lDims.rows} {t("rows")} &bull; {lDims.columns.length} {t("cols")})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Flechas de Navegación por Columna (◀ Cols ▶) */}
                  <div className="flex items-center bg-zinc-100 dark:bg-slate-800 rounded-xl p-0.5 border border-zinc-200 dark:border-zinc-700" title={t("navColsTooltip")}>
                    <button
                      onClick={() => scrollBays("liquidos", "left")}
                      className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-halliburton-red hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      title={t("prevCol")}
                    >
                      <Icon name="chevron-left" size={16} />
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1 text-zinc-400">Cols</span>
                    <button
                      onClick={() => scrollBays("liquidos", "right")}
                      className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-halliburton-red hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      title={t("nextCol")}
                    >
                      <Icon name="chevron-right" size={16} />
                    </button>
                  </div>

                  {/* + Fila */}
                  <button
                    onClick={() => {
                      const next = { ...data };
                      if (currentSector.type === "dual") {
                        if (!next.warehouseDimensions) next.warehouseDimensions = { liquidos: { rows: 6, columns: ["A","B","C","D"] } };
                        next.warehouseDimensions.liquidos.rows = Math.min(20, (next.warehouseDimensions.liquidos.rows || 6) + 1);
                      } else {
                        const s = next.sectors.find(x => x.id === currentSector.id);
                        if (s) s.rows = Math.min(20, (s.rows || 6) + 1);
                      }
                      persistData(next);
                      showToast(t("rowAdded"), "success");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    {t("addRow")}
                  </button>

                  {/* + Col */}
                  <button
                    onClick={() => {
                      const next = { ...data };
                      let targetCols;
                      if (currentSector.type === "dual") {
                        if (!next.warehouseDimensions) next.warehouseDimensions = { liquidos: { rows: 6, columns: ["A","B","C","D"] } };
                        targetCols = next.warehouseDimensions.liquidos.columns;
                      } else {
                        const s = next.sectors.find(x => x.id === currentSector.id);
                        if (s) {
                          if (!s.columns) s.columns = ["A","B","C","D","E","F","G","H"];
                          targetCols = s.columns;
                        }
                      }
                      if (targetCols) {
                        const nextLetter = ALL_ALPHABET.find(l => !targetCols.includes(l)) || "Z";
                        targetCols.push(nextLetter);
                        targetCols.sort();
                        persistData(next);
                        showToast(t("colAdded", { col: nextLetter }), "success");
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    {t("addCol")}
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
                  title={t("scrollToPrevCol")}
                >
                  <Icon name="chevron-left" size={18} />
                </button>

                <div
                  ref={liquidsScrollRef}
                  className="overflow-x-auto custom-scrollbar-thick pb-3 scroll-smooth px-1"
                >
                  <div
                    className="flex gap-2 items-stretch py-1 min-w-max transition-all duration-150"
                  >
                    {lDims.columns.map((colLetter, cIdx) => (
                      <React.Fragment key={`liq-col-${colLetter}`}>
                        {cIdx > 0 && (
                          <div
                            style={{ width: `${aisleWidth}px`, minWidth: `${aisleWidth}px`, maxWidth: `${aisleWidth}px`, writingMode: 'vertical-rl' }}
                            className="rounded-lg bg-slate-100/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 select-none tracking-widest shrink-0"
                          >
                            {t("aisle")}
                          </div>
                        )}
                        <div
                          style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px`, maxWidth: `${cardWidth}px` }}
                          className="flex flex-col gap-1.5 shrink-0"
                        >
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
                  title={t("scrollToNextCol")}
                >
                  <Icon name="chevron-right" size={18} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Columna Derecha: Acordeón de Stock por Producto y Lote */}
        <div className="xl:col-span-4 2xl:col-span-3 min-w-[300px]">
          <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-zinc-800 dark:text-white flex items-center gap-1.5">
                  <Icon name="layers" size={15} className="text-halliburton-red" />
                  <span>{t("stockByLot")}</span>
                </h3>
                <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest block">{t("consolidated")} &bull; {stockSummary.length} {lang === 'es' ? 'Productos' : 'Products'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={exportCsv}
                  className="p-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-600 dark:text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-black uppercase shadow-sm"
                  title={t("downloadCsv")}
                >
                  <Icon name="download" size={14} />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>

            {/* Lista Acordeón - Flujo natural sin scrollbar interna lenta */}
            <div className="space-y-2">
              {stockSummary.map(prod => {
                const prodDef = productCatalogMap.get(prod.name);
                const prodColor = prodDef?.color || "#991B1B";
                const isSelectedProd = activeFilter?.value === prod.name;
                return (
                  <div key={prod.name} className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/70 dark:bg-slate-800/30 transition-all shadow-sm">
                    <div
                      onClick={() => setActiveFilter(prev => prev?.value === prod.name ? null : { type: 'product', value: prod.name })}
                      className={`p-2.5 px-3 flex justify-between items-center cursor-pointer border-l-4 transition-colors gap-2.5 ${
                        isSelectedProd ? 'bg-red-50 dark:bg-red-950/25 border-halliburton-red' : 'hover:bg-zinc-100/80 dark:hover:bg-slate-800/50'
                      }`}
                      style={{ borderLeftColor: isSelectedProd ? '#DC2626' : prodColor }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: prodColor }}></span>
                        <span className="text-xs sm:text-[13px] font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 truncate" title={prod.name}>
                          {getShortProductName(prod.name)}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-black font-mono text-zinc-900 dark:text-emerald-400 bg-zinc-200/80 dark:bg-zinc-800/90 px-2 py-0.5 rounded-lg shrink-0 tracking-tight shadow-inner">
                        {prod.totalQty.toLocaleString("es-AR")} <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{prod.unit}</span>
                      </span>
                    </div>

                    <div className="p-1.5 px-2.5 space-y-1 bg-white/50 dark:bg-slate-900/40 border-t border-zinc-100 dark:border-zinc-800/60">
                      {Object.keys(prod.lots).sort().map(lotNum => {
                        const isSelectedLot = activeFilter?.value === lotNum;
                        return (
                          <div
                            key={lotNum}
                            onClick={() => setActiveFilter(prev => prev?.value === lotNum ? null : { type: 'lot', value: lotNum })}
                            className={`flex justify-between items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                              isSelectedLot
                                ? 'bg-halliburton-red text-white font-black shadow-sm'
                                : 'bg-white dark:bg-slate-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <span className="text-xs font-bold truncate flex items-center gap-1" title={`Lote: ${lotNum}`}>
                              <span className={isSelectedLot ? 'text-white/80' : 'text-zinc-400'}>L:</span>
                              <span>{lotNum}</span>
                            </span>
                            <span className={`text-xs sm:text-[12.5px] font-mono font-black shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded ${
                              isSelectedLot ? 'bg-white/20 text-white' : 'text-zinc-900 dark:text-zinc-100'
                            }`}>
                              {prod.lots[lotNum].toLocaleString("es-AR")} {prod.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: INGRESO RÁPIDO DE PALLET (1 CLIC EN ESPACIO VACÍO O BOTÓN SUPERIOR) */}
      {showReceptionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowReceptionModal(false); }}
        >
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-halliburton-red text-white flex items-center justify-center">
                  <Icon name="plus" size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-zinc-800 dark:text-white">
                    {t("receiveModalTitle")}
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {receptionTarget ? `${t("position")} ${receptionTarget.col}${receptionTarget.row} (${receptionTarget.zone.toUpperCase()})` : t("receptionWarehouse")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowReceptionModal(false)}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-800 dark:hover:text-white flex items-center justify-center transition-colors"
                title={t("cancel")}
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                let prodName = "";
                let unit = "KG";
                let prodDef = null;

                if (isCustomProduct) {
                  prodName = customProdName.trim() || "Producto Químico";
                  unit = customProdUnit.trim().toUpperCase() || "KG";
                } else {
                  prodDef = productCatalogMap.get(receptionSelectedProd) || OFFICIAL_BAROID_CATALOG[0];
                  prodName = prodDef.name;
                  unit = prodDef.unit;
                }

                const lot = e.target.lot.value.trim().toUpperCase();
                const units = Number(receptionUnits) || 1;
                const unitWeight = Number(receptionUnitWeight) || 25;
                const totalQty = units * unitWeight;

                let targetZone = receptionTarget?.zone || (currentSector.type === "dual" ? (prodDef?.type === "liquido" ? "liquidos" : "solidos") : "mixto");
                let targetCol = receptionTarget?.col;
                let targetRow = receptionTarget?.row;

                if (!targetCol) {
                  // Buscar primer espacio vacío disponible
                  const dims = currentSector.type === "dual"
                    ? (targetZone === "liquidos" ? lDims : sDims)
                    : sDims;
                  for (let r = 1; r <= (dims?.rows || 4); r++) {
                    for (const c of (dims?.columns || [])) {
                      const key = currentSector.type === "dual" ? `${targetZone}_${c}_${r}` : `${c}_${r}`;
                      if (!palletsMap.has(key)) {
                        targetCol = c;
                        targetRow = r;
                        break;
                      }
                    }
                    if (targetCol) break;
                  }
                }

                if (!targetCol) {
                  showToast(t("noFreeSlots"), "error");
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
                  unit: unit,
                  packageDetails: `${units} x ${unitWeight} ${unit}`,
                  unitsCount: units,
                  capacityNominal: totalQty,
                  status: "full"
                };

                const nextPallets = data.pallets.filter(p => !(p.zone === targetZone && p.col === targetCol && p.row === targetRow && (p.sectorId || "principal") === activeSectorId));
                nextPallets.push(newPallet);
                persistData({ ...data, pallets: nextPallets });
                setShowReceptionModal(false);
                showToast(t("palletReceived", { pos: `${targetCol}${targetRow}`, prod: prodName, lot: lot }), "success");
              }}
              className="space-y-3.5"
            >
              {/* Selector de Producto Químico Oficial BAROID */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  {t("chemicalProduct")}
                </label>
                <select
                  value={isCustomProduct ? "__CUSTOM__" : receptionSelectedProd}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__CUSTOM__") {
                      setIsCustomProduct(true);
                      setReceptionSelectedProd("__CUSTOM__");
                    } else {
                      setIsCustomProduct(false);
                      setReceptionSelectedProd(val);
                      const def = productCatalogMap.get(val);
                      if (def) {
                        setReceptionUnitWeight(def.unitWeight || 25);
                        let uCount = 50;
                        if (def.defaultPackage?.includes("Big Bag")) uCount = 1;
                        else if (def.defaultPackage?.includes("Tambor")) uCount = 4;
                        else if (def.defaultPackage?.includes("IBC")) uCount = 1;
                        else if (def.defaultPackage?.includes("Balde")) uCount = 32;
                        setReceptionUnits(uCount);
                      }
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-halliburton-red"
                >
                  <optgroup label={t("solids")}>
                    {OFFICIAL_BAROID_CATALOG.filter(p => p.type === "solido").map(p => (
                      <option key={p.name} value={p.name}>{p.name} ({p.defaultPackage})</option>
                    ))}
                  </optgroup>
                  <optgroup label={t("liquids")}>
                    {OFFICIAL_BAROID_CATALOG.filter(p => p.type === "liquido").map(p => (
                      <option key={p.name} value={p.name}>{p.name} ({p.defaultPackage})</option>
                    ))}
                  </optgroup>
                  <option value="__CUSTOM__">{t("customProductOption")}</option>
                </select>
              </div>

              {/* Campos condicionales si es producto personalizado */}
              {isCustomProduct && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-slate-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 animate-fade-in">
                  <div className="col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                      {t("customProductName")}
                    </label>
                    <input
                      required
                      value={customProdName}
                      onChange={(e) => setCustomProdName(e.target.value)}
                      placeholder="Ej: Biocida Especial o Aditivo X"
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold text-zinc-800 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                      {t("customProductUnit")}
                    </label>
                    <select
                      value={customProdUnit}
                      onChange={(e) => setCustomProdUnit(e.target.value)}
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold text-zinc-800 dark:text-white outline-none"
                    >
                      <option value="KG">KG</option>
                      <option value="LT">LT</option>
                      <option value="TN">TN</option>
                      <option value="BBL">BBL</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Número de Lote */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  {t("lotNumber")}
                </label>
                <input
                  name="lot"
                  required
                  placeholder={t("lotPlaceholder")}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none uppercase font-mono tracking-wider focus:ring-2 focus:ring-halliburton-red"
                />
              </div>

              {/* Cantidades y peso unitario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                    {t("packageCount")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={receptionUnits}
                    onChange={(e) => setReceptionUnits(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-halliburton-red font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                    {t("unitWeight")} ({isCustomProduct ? customProdUnit : (productCatalogMap.get(receptionSelectedProd)?.unit || "KG")})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={receptionUnitWeight}
                    onChange={(e) => setReceptionUnitWeight(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-halliburton-red font-mono"
                  />
                </div>
              </div>

              {/* Resumen Total a Ingresar */}
              <div className="p-3 bg-zinc-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500">
                  {t("totalToReceive")}:
                </span>
                <span className="text-sm font-black font-mono text-zinc-800 dark:text-white">
                  {(receptionUnits * receptionUnitWeight).toLocaleString("es-AR")} {isCustomProduct ? customProdUnit : (productCatalogMap.get(receptionSelectedProd)?.unit || "KG")}
                </span>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceptionModal(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  {t("cancel")} (Esc)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  {t("confirmReception")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INDICAR STOCK RESTANTE (DOBLE CLIC EN PALLET) */}
      {showPalletActionModal && actionPallet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPalletActionModal(false); }}
        >
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-halliburton-red text-white flex items-center justify-center font-bold">
                  <Icon name="package" size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-800 dark:text-white truncate max-w-[240px]">
                    {actionPallet.product}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-500 font-mono block">
                    {t("position")} {actionPallet.col}{actionPallet.row} &bull; {t("lotNumber")}: {actionPallet.lot}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPalletActionModal(false)}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title={t("closeEsc")}
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            {/* Tarjeta de Stock Actual */}
            <div className="p-3 bg-zinc-50 dark:bg-slate-800/40 rounded-2xl flex justify-between items-center border border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">{t("currentRegisteredStock")}</span>
                <span className="text-base font-black font-mono text-zinc-800 dark:text-white">
                  {Number(actionPallet.quantity).toLocaleString("es-AR")} {actionPallet.unit}
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {t("nominalCapacity")}: {actionPallet.capacityNominal || actionPallet.quantity} {actionPallet.unit}
              </span>
            </div>

            {/* Selector de Modo de Indicación: Directo KG/LT vs Bolsas/Envases */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setStockEntryMode("direct")}
                className={`py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  stockEntryMode === "direct"
                    ? 'bg-white dark:bg-slate-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                {actionPallet.unit} ({t("directMode")})
              </button>
              <button
                type="button"
                onClick={() => setStockEntryMode("packages")}
                className={`py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  stockEntryMode === "packages"
                    ? 'bg-white dark:bg-slate-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                {t("byPackagesMode")}
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                let finalQty = 0;
                if (stockEntryMode === "direct") {
                  finalQty = Math.max(0, parseFloat(remainingInputQty) || 0);
                } else {
                  finalQty = Math.max(0, (parseFloat(remainingBagsCount) || 0) * (parseFloat(remainingBagWeight) || 0));
                }

                let nextPallets;
                if (finalQty <= 0) {
                  nextPallets = data.pallets.filter(p => p.id !== actionPallet.id);
                  showToast(`✓ Pallet vaciado totalmente. Espacio ${actionPallet.col}${actionPallet.row} liberado.`, "warning");
                } else {
                  const cap = Number(actionPallet.capacityNominal) || Number(actionPallet.quantity);
                  const isPart = finalQty < cap;
                  nextPallets = data.pallets.map(p =>
                    p.id === actionPallet.id
                      ? { ...p, quantity: finalQty, status: isPart ? "partial" : "full" }
                      : p
                  );
                  showToast(`✓ Stock actualizado: quedan ${finalQty.toLocaleString("es-AR")} ${actionPallet.unit}.`, "success");
                }
                persistData({ ...data, pallets: nextPallets });
                setShowPalletActionModal(false);
              }}
              className="space-y-3.5"
            >
              {/* Modo 1: Directo en KG o Litros */}
              {stockEntryMode === "direct" ? (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {t("howMuchRemaining")} ({actionPallet.unit})
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={remainingInputQty}
                      onChange={(e) => setRemainingInputQty(e.target.value)}
                      required
                      className="w-full p-2.5 pr-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-sm font-black font-mono text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-halliburton-red"
                      placeholder={`Ej: ${actionPallet.quantity}`}
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">
                      {actionPallet.unit}
                    </span>
                  </div>
                </div>
              ) : (
                /* Modo 2: Por Bolsas / Unidades y Peso por Bolsa */
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9.5px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                        {t("remainingPackages")}
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={remainingBagsCount}
                        onChange={(e) => {
                          const bags = parseFloat(e.target.value) || 0;
                          setRemainingBagsCount(e.target.value);
                          setRemainingInputQty(bags * (parseFloat(remainingBagWeight) || 0));
                        }}
                        required
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-sm font-black font-mono text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-halliburton-red"
                        placeholder="Ej: 20"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                        {t("weightPerPackage")} ({actionPallet.unit})
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={remainingBagWeight}
                        onChange={(e) => {
                          const wt = parseFloat(e.target.value) || 0;
                          setRemainingBagWeight(e.target.value);
                          setRemainingInputQty((parseFloat(remainingBagsCount) || 0) * wt);
                        }}
                        required
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-sm font-black font-mono text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-halliburton-red"
                        placeholder="Ej: 25"
                      />
                    </div>
                  </div>
                  <div className="p-2.5 bg-zinc-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-500">{t("resultingCalculation")}:</span>
                    <strong className="font-mono font-black text-zinc-900 dark:text-emerald-400 text-sm">
                      {((parseFloat(remainingBagsCount) || 0) * (parseFloat(remainingBagWeight) || 0)).toLocaleString("es-AR")} {actionPallet.unit}
                    </strong>
                  </div>
                </div>
              )}

              {/* Feedback en tiempo real del Consumo Calculado para la Receta */}
              {(() => {
                const currentVal = parseFloat(stockEntryMode === "direct" ? remainingInputQty : ((parseFloat(remainingBagsCount) || 0) * (parseFloat(remainingBagWeight) || 0))) || 0;
                const diff = Number(actionPallet.quantity) - currentVal;
                if (currentVal <= 0) {
                  return (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                      <Icon name="trash-2" size={14} />
                      <span>{t("palletWillZeroWarning", { pos: `${actionPallet.col}${actionPallet.row}` })}</span>
                    </div>
                  );
                }
                if (diff > 0) {
                  return (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
                      <span>{t("recipeConsumption")}: <strong>{diff.toLocaleString("es-AR")} {actionPallet.unit}</strong></span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20">{t("remainingLabel")}: {currentVal.toLocaleString("es-AR")} {actionPallet.unit}</span>
                    </div>
                  );
                }
                if (diff < 0) {
                  return (
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                      {t("upwardAdjustment")}: +{Math.abs(diff).toLocaleString("es-AR")} {actionPallet.unit}.
                    </div>
                  );
                }
                return (
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-slate-800 text-zinc-500 text-[11px] text-center font-semibold">
                    {t("noStockChanges")}
                  </div>
                );
              })()}

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextPallets = data.pallets.filter(p => p.id !== actionPallet.id);
                    persistData({ ...data, pallets: nextPallets });
                    setShowPalletActionModal(false);
                    if (selectedPallet?.id === actionPallet.id) setSelectedPallet(null);
                    if (copiedPallet?.id === actionPallet.id) setCopiedPallet(null);
                    showToast(t("palletDeleted", { pos: `${actionPallet.col}${actionPallet.row}` }), "warning");
                  }}
                  className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0"
                  title={t("emptyToZeroBtn")}
                >
                  {t("emptyToZeroBtn")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPalletActionModal(false)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  {t("cancelBtn")}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  {t("saveBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA PESTAÑA (LIENZO ÚNICO VS DOBLE ÁREA SÓLIDOS Y LÍQUIDOS) */}
      {showNewSectorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewSectorModal(false); }}
        >
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-halliburton-red text-white flex items-center justify-center font-bold">
                  <Icon name="plus" size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-zinc-800 dark:text-white">
                    {t("newTabModalTitle")}
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {t("structureLabel")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowNewSectorModal(false)}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = e.target.sectorName.value.trim();
                if (!name) return;
                const newId = `sec_${Date.now()}`;
                let newSector;

                if (newTabStructure === 'dual') {
                  const sC = Math.min(26, Math.max(1, Number(newTabSolidsCols) || 10));
                  const lC = Math.min(26, Math.max(1, Number(newTabLiquidsCols) || 8));
                  newSector = {
                    id: newId,
                    name: name,
                    type: "dual",
                    warehouseDimensions: {
                      solidos: {
                        rows: Math.min(20, Math.max(1, Number(newTabSolidsRows) || 6)),
                        columns: ALL_ALPHABET.slice(0, sC)
                      },
                      liquidos: {
                        rows: Math.min(20, Math.max(1, Number(newTabLiquidsRows) || 6)),
                        columns: ALL_ALPHABET.slice(0, lC)
                      }
                    }
                  };
                } else {
                  const cCount = Math.min(26, Math.max(1, Number(newTabCols) || 12));
                  newSector = {
                    id: newId,
                    name: name,
                    type: "mixto",
                    rows: Math.min(20, Math.max(1, Number(newTabRows) || 4)),
                    columns: ALL_ALPHABET.slice(0, cCount)
                  };
                }

                const nextSectors = [...data.sectors, newSector];
                persistData({ ...data, sectors: nextSectors });
                setActiveSectorId(newId);
                setShowNewSectorModal(false);
                showToast(t("tabCreated", { name }), "success");
              }}
              className="space-y-4"
            >
              {/* Nombre de la pestaña */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  {t("tabNameLabel")}
                </label>
                <input
                  name="sectorName"
                  required
                  placeholder={t("tabNamePlaceholder")}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-slate-800 text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-halliburton-red"
                />
              </div>

              {/* Selector de Estructura: Lienzo Único vs Doble Área */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                  {t("structureLabel")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Opción 1: Lienzo Único (Predeterminado) */}
                  <div
                    onClick={() => setNewTabStructure('single')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      newTabStructure === 'single'
                        ? 'border-halliburton-red bg-red-50/20 dark:bg-red-950/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-slate-800/20 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        newTabStructure === 'single' ? 'border-halliburton-red' : 'border-zinc-400'
                      }`}>
                        {newTabStructure === 'single' && <div className="w-1.5 h-1.5 rounded-full bg-halliburton-red" />}
                      </div>
                      <span className="text-xs font-black uppercase text-zinc-800 dark:text-white">
                        {t("singleCanvas")}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 pl-5">
                      {t("singleCanvasDesc")}
                    </p>
                  </div>

                  {/* Opción 2: Doble Área (Sólidos y Líquidos) */}
                  <div
                    onClick={() => setNewTabStructure('dual')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      newTabStructure === 'dual'
                        ? 'border-halliburton-red bg-red-50/20 dark:bg-red-950/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-slate-800/20 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        newTabStructure === 'dual' ? 'border-halliburton-red' : 'border-zinc-400'
                      }`}>
                        {newTabStructure === 'dual' && <div className="w-1.5 h-1.5 rounded-full bg-halliburton-red" />}
                      </div>
                      <span className="text-xs font-black uppercase text-zinc-800 dark:text-white">
                        {t("dualArea")}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 pl-5">
                      {t("dualAreaDesc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dimensiones según la estructura seleccionada */}
              {newTabStructure === 'single' ? (
                <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-slate-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                      {t("initialRows")}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newTabRows}
                      onChange={(e) => setNewTabRows(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold text-zinc-800 dark:text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                      {t("initialCols")} (A - {ALL_ALPHABET[Math.min(25, newTabCols - 1)]})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="26"
                      value={newTabCols}
                      onChange={(e) => setNewTabCols(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold text-zinc-800 dark:text-white outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-zinc-50 dark:bg-slate-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-blue-500 block mb-1">
                        {t("solidsRows")}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newTabSolidsRows}
                        onChange={(e) => setNewTabSolidsRows(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-blue-500 block mb-1">
                        {t("solidsCols")} (A - {ALL_ALPHABET[Math.min(25, newTabSolidsCols - 1)]})
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="26"
                        value={newTabSolidsCols}
                        onChange={(e) => setNewTabSolidsCols(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-purple-500 block mb-1">
                        {t("liquidsRows")}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newTabLiquidsRows}
                        onChange={(e) => setNewTabLiquidsRows(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-wider text-purple-500 block mb-1">
                        {t("liquidsCols")} (A - {ALL_ALPHABET[Math.min(25, newTabLiquidsCols - 1)]})
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="26"
                        value={newTabLiquidsCols}
                        onChange={(e) => setNewTabLiquidsCols(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSectorModal(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  {t("cancel")} (Esc)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  {t("createTabBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESIÓN Y DIAGRAMA DE ZONA DE PRODUCTOS (ALTA RESOLUCIÓN A4 APAISADO) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-start items-center overflow-y-auto p-4 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
          {/* Barra Superior de Control (No se imprime) */}
          <div className="w-full max-w-7xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-halliburton-red text-white flex items-center justify-center shrink-0 shadow-md">
                <Icon name="printer" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-white">
                  {t("printPreviewTitle")}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {t("printPreviewSubtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                title={t("downloadPdfBtn")}
              >
                <Icon name="download" size={15} />
                <span>{t("downloadPdfBtn")}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                title={lang === 'es' ? "Descargar captura directa en imagen PNG de alta resolución" : "Download high-res PNG screenshot"}
              >
                <Icon name="camera" size={15} />
                <span>{lang === 'es' ? 'Captura PNG' : 'PNG Image'}</span>
              </button>
              <button
                type="button"
                onClick={handleNativePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                title={t("printSavePdfBtn")}
              >
                <Icon name="printer" size={15} />
                <span>{t("printSavePdfBtn")}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                {t("closeModal")}
              </button>
            </div>
          </div>

          {/* HOJA IMPRIMIBLE DE ALTA RESOLUCIÓN Y COBERTURA MÁXIMA A4 (1 SOLA PÁGINA) */}
          <div
            id="printableWarehouseSheet"
            style={{ width: '1020px', maxWidth: '1020px', boxSizing: 'border-box' }}
            className="bg-white text-black rounded-xl p-2.5 shadow-2xl border border-zinc-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none print:min-w-0 print:rounded-none mx-auto overflow-hidden"
          >
            {/* ENCABEZADO OFICIAL LIMPIO Y COMPACTO */}
            <div className="border-b-2 border-black pb-1 mb-1.5 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-black leading-none">
                  {t("diagramSheetTitle")}
                </h1>
                <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-0.5">
                  SECTOR: {currentSector.name.toUpperCase()} &bull; {t("officialCountingSheet")}
                </div>
              </div>
              <div className="text-right leading-tight">
                <div className="text-[10.5px] font-black text-black font-mono">
                  {t("issued")}: {new Date().toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US')} - {new Date().toLocaleTimeString(lang === 'es' ? 'es-AR' : 'en-US', { hour: '2-digit', minute: '2-digit' })} hs
                </div>
                <div className="text-[9.5px] font-bold text-zinc-700 mt-0.5">
                  {t("occupancy")}: {occupiedCount} / {totalSlots} ({occPct}%) &bull; {t("free")}: {freeSlots}
                </div>
              </div>
            </div>

            {/* CONTENIDO DEL ALMACÉN PARA IMPRESIÓN (OCUPA EL 100% DEL ANCHO) */}
            <div id="printableWarehouseContent" className="space-y-1.5">
              {/* SECTOR SÓLIDOS (O GENERAL) */}
              {(currentSector.type === "dual" || currentSector.type === "solidos" || currentSector.type === "mixto") && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between border-b border-zinc-400 pb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                      {currentSector.type === "dual" ? t("solidsZone") : currentSector.name.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-600 font-mono">
                      {sDims.rows} {t("rows")} &bull; {sDims.columns.length} {t("cols")}
                    </span>
                  </div>

                  <div
                    className={`grid ${printMetrics.gapClass}`}
                    style={{ gridTemplateColumns: `repeat(${sDims.columns.length}, minmax(0, 1fr))` }}
                  >
                    {sDims.columns.map((colLetter) => (
                      <div key={`print-sol-col-${colLetter}`} className={`flex flex-col ${printMetrics.gapClass}`}>
                        {Array.from({ length: sDims.rows }, (_, rIdx) => {
                          const rowNum = rIdx + 1;
                          const cCol = String(colLetter || '').trim().toUpperCase();
                          const cRow = Number(rowNum);
                          const p = getPalletAt(currentSector.type === "dual" ? "solidos" : "mixto", cCol, cRow);

                          if (p && Number(p.quantity) > 0) {
                            const cap = Number(p.capacityNominal) || Number(p.quantity) || 1000;
                            const isPartial = p.status === "partial" || (cap > 0 && Number(p.quantity) < cap);
                            const pct = cap > 0 ? Math.min(100, Math.round((Number(p.quantity) / cap) * 100)) : 100;
                            const prodDef = productCatalogMap.get(p.product);
                            const prodColor = prodDef ? prodDef.color : "#991B1B";
                            const bgTint = hexToRgba(prodColor, 0.12);
                            const shortName = getShortProductName(p.product);

                            return (
                              <div
                                key={`p-sol-${colLetter}-${rowNum}`}
                                style={{
                                  backgroundColor: bgTint,
                                  borderColor: prodColor,
                                  height: `${printMetrics.cardH}px`,
                                  minHeight: `${printMetrics.cardH}px`,
                                  maxHeight: `${printMetrics.cardH}px`
                                }}
                                className="rounded-lg p-1 border-2 flex flex-col justify-center items-center text-center shadow-none overflow-hidden select-none page-break-avoid"
                              >
                                {/* Línea 1: Nombre de producto (bien visible, negro y destacado) */}
                                <div className="w-full shrink-0 overflow-hidden leading-tight mb-0.5 text-center">
                                  <span
                                    style={{ fontSize: `${printMetrics.titlePx}px`, lineHeight: 1.15 }}
                                    className={`${printMetrics.titleSize} font-black uppercase text-black block truncate tracking-normal`}
                                  >
                                    {shortName}
                                  </span>
                                </div>

                                {/* Línea 2: Lote (más grande) */}
                                <div className="w-full shrink-0 overflow-hidden leading-tight mb-0.5 text-center">
                                  <span
                                    style={{ fontSize: `${printMetrics.lotPx}px`, lineHeight: 1.15 }}
                                    className={`${printMetrics.lotSize} font-bold text-zinc-950 block truncate tracking-normal`}
                                  >
                                    L: {p.lot}
                                  </span>
                                </div>

                                {/* Línea 3: Cantidad y parcial */}
                                <div className="w-full shrink-0 flex items-center justify-center gap-1 leading-tight overflow-hidden text-center">
                                  <span
                                    style={{ fontSize: `${printMetrics.qtyPx}px`, lineHeight: 1.15 }}
                                    className={`${printMetrics.qtySize} font-bold text-zinc-800 truncate tracking-normal`}
                                  >
                                    {Number(p.quantity).toLocaleString("es-AR")} {p.unit || 'KG'}
                                  </span>
                                  {isPartial && (
                                    <span
                                      style={{ fontSize: `${Math.max(7, printMetrics.qtyPx - 1)}px` }}
                                      className="bg-amber-400 text-slate-950 font-black px-1 py-0.2 rounded leading-none shrink-0"
                                    >
                                      ⚠️ {pct}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={`p-sol-${colLetter}-${rowNum}`}
                                style={{
                                  height: `${printMetrics.cardH}px`,
                                  minHeight: `${printMetrics.cardH}px`,
                                  maxHeight: `${printMetrics.cardH}px`
                                }}
                                className="rounded-lg border-2 border-dashed border-zinc-300 bg-transparent select-none page-break-avoid"
                              />
                            );
                          }
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTOR LÍQUIDOS */}
              {(currentSector.type === "dual" || currentSector.type === "liquidos") && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between border-b border-purple-400 pb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-300">
                      {t("liquidsZoneTrays")}
                    </span>
                    <span className="text-[9px] font-bold text-purple-700 font-mono">
                      {lDims.rows} {t("rows")} &bull; {lDims.columns.length} {t("cols")}
                    </span>
                  </div>

                  <div
                    className={`grid ${printMetrics.gapClass}`}
                    style={{ gridTemplateColumns: `repeat(${lDims.columns.length}, minmax(0, 1fr))` }}
                  >
                    {lDims.columns.map((colLetter) => (
                      <div key={`print-liq-col-${colLetter}`} className={`flex flex-col ${printMetrics.gapClass}`}>
                        {Array.from({ length: lDims.rows }, (_, rIdx) => {
                          const rowNum = rIdx + 1;
                          const cCol = String(colLetter || '').trim().toUpperCase();
                          const cRow = Number(rowNum);
                          const p = getPalletAt("liquidos", cCol, cRow);

                          if (p && Number(p.quantity) > 0) {
                            const cap = Number(p.capacityNominal) || Number(p.quantity) || 1000;
                            const isPartial = p.status === "partial" || (cap > 0 && Number(p.quantity) < cap);
                            const pct = cap > 0 ? Math.min(100, Math.round((Number(p.quantity) / cap) * 100)) : 100;
                            const prodDef = productCatalogMap.get(p.product);
                            const prodColor = prodDef ? prodDef.color : "#7E22CE";
                            const bgTint = hexToRgba(prodColor, 0.12);
                            const shortName = getShortProductName(p.product);

                            return (
                              <div
                                key={`p-liq-${colLetter}-${rowNum}`}
                                style={{
                                  backgroundColor: bgTint,
                                  borderColor: prodColor,
                                  height: `${printMetrics.cardH}px`,
                                  minHeight: `${printMetrics.cardH}px`,
                                  maxHeight: `${printMetrics.cardH}px`
                                }}
                                className="rounded-lg p-1 border-2 flex flex-col justify-center items-center text-center shadow-none overflow-hidden select-none page-break-avoid"
                              >
                                {/* Línea 1: Nombre de producto (bien visible, negro y destacado) */}
                                <div className="w-full shrink-0 overflow-hidden leading-tight mb-0.5 text-center">
                                  <span
                                    style={{ fontSize: `${printMetrics.titlePx}px`, lineHeight: 1.15 }}
                                    className={`${printMetrics.titleSize} font-black uppercase text-black block truncate tracking-normal`}
                                  >
                                    {shortName}
                                  </span>
                                </div>

                                {/* Línea 2: Lote (más grande) */}
                                <div className="w-full shrink-0 overflow-hidden leading-tight mb-0.5 text-center">
                                  <span
                                    style={{ fontSize: `${printMetrics.lotPx}px`, lineHeight: 1.15 }}
                                    className={`${printMetrics.lotSize} font-bold text-zinc-950 block truncate tracking-normal`}
                                  >
                                    L: {p.lot}
                                  </span>
                                </div>

                                {/* Línea 3: Cantidad y parcial */}
                                <div className="w-full shrink-0 flex items-center justify-center gap-1 leading-tight overflow-hidden text-center">
                                  <span
                                    style={{ fontSize: `${printMetrics.qtyPx}px`, lineHeight: 1.15 }}
                                    className={`${printMetrics.qtySize} font-bold text-zinc-800 truncate tracking-normal`}
                                  >
                                    {Number(p.quantity).toLocaleString("es-AR")} {p.unit || 'LT'}
                                  </span>
                                  {isPartial && (
                                    <span
                                      style={{ fontSize: `${Math.max(7, printMetrics.qtyPx - 1)}px` }}
                                      className="bg-amber-400 text-slate-950 font-black px-1 py-0.2 rounded leading-none shrink-0"
                                    >
                                      ⚠️ {pct}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={`p-liq-${colLetter}-${rowNum}`}
                                style={{
                                  height: `${printMetrics.cardH}px`,
                                  minHeight: `${printMetrics.cardH}px`,
                                  maxHeight: `${printMetrics.cardH}px`
                                }}
                                className="rounded-lg border-2 border-dashed border-zinc-300 bg-transparent select-none page-break-avoid"
                              />
                            );
                          }
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PIE DE PLANILLA DE RECUENTO FÍSICO */}
            <div className="mt-1.5 pt-1 border-t-2 border-black flex items-center justify-between text-[9px] font-bold text-zinc-700 uppercase tracking-wider">
              <span>{t("countingOfficer")}</span>
              <span>{t("signatureApproval")}</span>
              <span>{t("officialSheetFooter")}</span>
            </div>
          </div>

          {/* ESTILOS CSS DE IMPRESIÓN NATIVA (@MEDIA PRINT) */}
          <style>{`
            @media print {
              @page {
                size: landscape;
                margin: 3mm;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                height: 100% !important;
                max-height: 100% !important;
                overflow: hidden !important;
                background: white !important;
                color: black !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printableWarehouseSheet, #printableWarehouseSheet * {
                visibility: visible !important;
              }
              #printableWarehouseSheet {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                height: 100% !important;
                max-height: 204mm !important;
                margin: 0 !important;
                padding: 2mm !important;
                box-sizing: border-box !important;
                background: white !important;
                color: black !important;
                z-index: 999999 !important;
                overflow: hidden !important;
                box-shadow: none !important;
                border: none !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                page-break-inside: avoid !important;
              }
              .no-print {
                display: none !important;
              }
              .page-break-avoid {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
          `}</style>
        </div>
      )}

    </div>
  );
};

export default WarehouseLotsSystem;
