import React, { useState, useEffect, useMemo, useRef } from 'react';
import Icon from './Icon';
import html2pdf from 'html2pdf.js';
import { translations } from '../data/translations';

// Catálogo base Baroid de factores por defecto
const DEFAULT_INVENTORY_PRODUCTS = [
    { id: '1', name: 'LIME FG – Cal', factor: 20, order: 1 },
    { id: '2', name: 'BARABLOK™ 400 NA', factor: 25, order: 2 },
    { id: '3', name: 'BARACARB®-DF FINE', factor: 25, order: 3 },
    { id: '4', name: 'BARACARB®-DF MEDIUM', factor: 25, order: 4 },
    { id: '5', name: 'BARACARB®-DF COARSE', factor: 25, order: 5 },
    { id: '6', name: 'GELTONE® II', factor: 22.7, order: 6 },
    { id: '7', name: 'BDF™-965 FINE', factor: 25, order: 7 },
    { id: '8', name: 'BDF™-965 MEDIUM', factor: 25, order: 8 },
    { id: '9', name: 'BaraShield®-982', factor: 22.7, order: 9 },
    { id: '10', name: 'BaraShield®-981', factor: 22.7, order: 10 },
    { id: '11', name: 'BaraFLC®-903', factor: 22.7, order: 11 },
    { id: '12', name: 'BaraSeal™-957', factor: 22.7, order: 12 },
    { id: '13', name: 'STOPPIT™', factor: 22.7, order: 13 },
    { id: '14', name: 'OBTURANTE MEZCLA', factor: 25, order: 14 },
    { id: '15', name: 'EZ MUL® LA', factor: 1, order: 15 },
    { id: '16', name: 'CLAY GRABBER®', factor: 18.9, order: 16 },
    { id: '17', name: 'CLAY SYNC™ II', factor: 22.7, order: 17 },
    { id: '18', name: 'BARA-DEFOAM® HP', factor: 18.9, order: 18 },
    { id: '19', name: 'OMC® 3', factor: 25, order: 19 },
    { id: '20', name: 'THERMA-THIN YPF', factor: 18.9, order: 20 },
    { id: '21', name: 'XLR-RATE™', factor: 1, order: 21 },
    { id: '22', name: 'DRILTREAT®', factor: 1, order: 22 },
    { id: '23', name: 'INVERMUL® LA', factor: 1, order: 23 },
    { id: '24', name: 'RM-63™', factor: 208, order: 24 },
    { id: '25', name: 'BAROFIBRE®', factor: 11.34, order: 25 },
    { id: '26', name: 'BARAZAN® D PLUS', factor: 25, order: 26 },
    { id: '27', name: 'CARBONOX®', factor: 22.7, order: 27 },
    { id: '28', name: 'PAC™-L', factor: 22.7, order: 28 },
    { id: '29', name: 'BENTONITA BOLSÓN', factor: 700, order: 29 },
    { id: '30', name: 'BENTONITA PALLET', factor: 20, order: 30 },
    { id: '31', name: 'SODA ASH', factor: 25, order: 31 },
    { id: '32', name: 'SODA CÁUSTICA', factor: 25, order: 32 },
    { id: '33', name: 'Potassium chloride (KCl)', factor: 25, order: 33 },
    { id: '34', name: 'BARAVIS W-637', factor: 10, order: 34 },
    { id: '35', name: 'TS PLUS YPF', factor: 11.34, order: 35 },
    { id: '36', name: 'CALCIUM CHLORIDE BRINE (YPF)', factor: 1, order: 36 },
    { id: '37', name: 'BARITA EN BOLSONES', factor: 1.5, order: 37 },
    { id: '38', name: 'Cloruro de Calcio', factor: 25, order: 38 },
    { id: '39', name: 'BARITA EN SILO', factor: 1, order: 39 },
    { id: '40', name: 'INVERMUL®', factor: 208, order: 40 },
    { id: '41', name: 'LE SUPERMUL™', factor: 1, order: 41 },
    { id: '42', name: 'TAU-MOD®', factor: 22.7, order: 42 }
];

// Helper para normalizar nombres eliminando marcas registradas y espacios extras
const normalizeProductName = (name) => {
    if (!name) return '';
    return String(name)
        .replace(/[®™]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
};

const InventoryConciliation = ({ isEditing, lang }) => {
    const t = translations[lang || 'es'] || translations.es;

    // Pestaña Activa: 'warehouse' (Sincronizado desde Diagrama) vs 'manual' (Carga Manual)
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('baroid_inventory_reconc_active_tab') || 'warehouse';
    });

    useEffect(() => {
        localStorage.setItem('baroid_inventory_reconc_active_tab', activeTab);
    }, [activeTab]);

    // Catálogo Maestro de Productos y Factores
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('baroid_products_inventory_v2');
        return saved ? JSON.parse(saved) : DEFAULT_INVENTORY_PRODUCTS;
    });

    useEffect(() => {
        localStorage.setItem('baroid_products_inventory_v2', JSON.stringify(products));
    }, [products]);

    // Modo de Carga Manual: 'kgl' (directo en kg/L) vs 'units' (unidades x factor)
    const [manualMode, setManualMode] = useState(() => {
        return localStorage.getItem('baroid_inventory_manual_mode') || 'kgl';
    });

    useEffect(() => {
        localStorage.setItem('baroid_inventory_manual_mode', manualMode);
    }, [manualMode]);

    // Entradas de la Pestaña Manual
    const getInitialManualEntries = () => Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        productId: '',
        physical: '',
        software: '',
        searchTerm: '',
        isDropdownOpen: false
    }));

    const [entries, setEntries] = useState(() => {
        const saved = localStorage.getItem('baroid_inventory_entries_v1');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.length > 0 ? parsed : getInitialManualEntries();
            } catch (e) {
                return getInitialManualEntries();
            }
        }
        return getInitialManualEntries();
    });

    useEffect(() => {
        localStorage.setItem('baroid_inventory_entries_v1', JSON.stringify(entries));
    }, [entries]);

    // Almacenamiento de valores de WellSight para la Pestaña Sincronizada
    // Clave: { [productKey]: stringOrNumber }
    const [wsStockMap, setWsStockMap] = useState(() => {
        const saved = localStorage.getItem('baroid_inventory_ws_stock_v1');
        if (saved) {
            try { return JSON.parse(saved) || {}; } catch (e) { return {}; }
        }
        return {};
    });

    useEffect(() => {
        localStorage.setItem('baroid_inventory_ws_stock_v1', JSON.stringify(wsStockMap));
    }, [wsStockMap]);

    // Productos adicionales con Físico 0 agregados a la pestaña sincronizada
    const [extraZeroProducts, setExtraZeroProducts] = useState(() => {
        const saved = localStorage.getItem('baroid_inventory_extra_zero_v1');
        if (saved) {
            try { return JSON.parse(saved) || []; } catch (e) { return []; }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('baroid_inventory_extra_zero_v1', JSON.stringify(extraZeroProducts));
    }, [extraZeroProducts]);

    // Filtro de Sector para la Sincronización del Almacén ('all' o sectorId)
    const [selectedSectorFilter, setSelectedSectorFilter] = useState('all');
    const [availableSectors, setAvailableSectors] = useState([]);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // Búsqueda y Ordenamiento
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    // Modales
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddZeroModal, setShowAddZeroModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', factor: '1', order: '' });

    // Toast Timer
    useEffect(() => {
        if (!toastMessage) return;
        const tId = setTimeout(() => setToastMessage(null), 3000);
        return () => clearTimeout(tId);
    }, [toastMessage]);

    // Desactivar incremento por rueda del ratón en todos los inputs numéricos de la app
    useEffect(() => {
        const handleWheel = (e) => {
            if (document.activeElement && document.activeElement.type === 'number') {
                document.activeElement.blur();
            }
        };
        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    // Función universal para leer el estado del almacén desde vaults de localStorage
    const readWarehouseFromVault = () => {
        const candidateKeys = [
            'lmp_warehouse_state',
            'lmp_warehouse_state_vault',
            'baroid_warehouse_backup_persistent',
            'lmp_warehouse_last_known_good'
        ];
        for (const k of candidateKeys) {
            try {
                const raw = localStorage.getItem(k);
                if (!raw) continue;
                const parsed = JSON.parse(raw);
                if (parsed && (Array.isArray(parsed.pallets) || Array.isArray(parsed.sectors))) {
                    return parsed;
                }
            } catch (e) {}
        }
        return null;
    };

    // Extraer y agrupar stock físico por TIPO de producto (independiente de lotes)
    const warehouseData = useMemo(() => {
        const whState = readWarehouseFromVault();
        if (!whState) {
            return { items: [], sectors: [] };
        }

        const rawSectors = Array.isArray(whState.sectors) ? whState.sectors : [];
        const rawPallets = Array.isArray(whState.pallets) ? whState.pallets : [];

        // Agrupación de pallets por tipo de producto
        const groupMap = new Map();

        rawPallets.forEach(p => {
            if (!p) return;
            const qty = Number(p.quantity) || 0;
            if (qty <= 0) return; // Excluir pallets vacíos

            // Filtro por sector si no es 'all'
            const sId = p.sectorId || 'principal';
            if (selectedSectorFilter !== 'all' && sId !== selectedSectorFilter) {
                return;
            }

            const rawName = String(p.product || '').trim();
            if (!rawName) return;

            const normKey = normalizeProductName(rawName);

            if (!groupMap.has(normKey)) {
                groupMap.set(normKey, {
                    key: normKey,
                    name: rawName,
                    totalKgL: 0,
                    unit: String(p.unit || 'KG').toUpperCase(),
                    palletsCount: 0,
                    packageDetailsList: [],
                    isLiquid: p.zone === 'liquidos' || p.zone === 'liquido' || String(p.unit || '').toUpperCase() === 'LT'
                });
            }

            const item = groupMap.get(normKey);
            item.totalKgL += qty;
            item.palletsCount += 1;
            if (p.packageDetails && !item.packageDetailsList.includes(p.packageDetails)) {
                item.packageDetailsList.push(p.packageDetails);
            }
        });

        // Incorporar productos con stock 0 agregados manualmente para poder conciliar
        extraZeroProducts.forEach(extraName => {
            const normKey = normalizeProductName(extraName);
            if (!groupMap.has(normKey)) {
                groupMap.set(normKey, {
                    key: normKey,
                    name: extraName,
                    totalKgL: 0,
                    unit: 'KG',
                    palletsCount: 0,
                    packageDetailsList: ['Stock Físico 0'],
                    isLiquid: false,
                    isExtraZero: true
                });
            }
        });

        // Enlazar con catálogo maestro de productos para obtener factor y orden
        const catalogList = products || DEFAULT_INVENTORY_PRODUCTS;
        const aggregatedList = Array.from(groupMap.values()).map(item => {
            // Buscar en catálogo por nombre normalizado
            const match = catalogList.find(c => {
                const normC = normalizeProductName(c.name);
                return normC === item.key || normC.includes(item.key) || item.key.includes(normC);
            });

            return {
                ...item,
                factor: match ? (parseFloat(match.factor) || 1) : 1,
                order: match ? (parseFloat(match.order) || 999) : 999,
                catalogName: match ? match.name : item.name
            };
        });

        return {
            items: aggregatedList,
            sectors: rawSectors
        };
    }, [selectedSectorFilter, extraZeroProducts, products, lastSyncTime]);

    // Actualizar sectores disponibles
    useEffect(() => {
        if (warehouseData.sectors && warehouseData.sectors.length > 0) {
            setAvailableSectors(warehouseData.sectors);
        }
    }, [warehouseData.sectors]);

    // Forzar resincronización visual desde almacén
    const handleSyncFromWarehouse = () => {
        setLastSyncTime(new Date());
        setToastMessage(t.invRefreshToast || "✓ Stock físico actualizado desde el almacén.");
    };

    // Actualizar valor de WellSight en la pestaña sincronizada
    const handleWsChange = (productKey, val) => {
        setWsStockMap(prev => ({
            ...prev,
            [productKey]: val
        }));
    };

    // Navegación con tecla Enter estilo Excel (bajar a la fila siguiente)
    const handleCellKeyDown = (e, rowIdx, colName, maxRows) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextIdx = e.shiftKey ? rowIdx - 1 : rowIdx + 1;
            if (nextIdx >= 0 && nextIdx < maxRows) {
                const target = document.querySelector(`input[data-col="${colName}"][data-row-idx="${nextIdx}"]`);
                if (target) {
                    target.focus();
                    target.select();
                }
            }
        }
    };

    // Agregar producto con stock 0 a la conciliación
    const handleAddZeroProduct = (prodName) => {
        if (!prodName) return;
        if (!extraZeroProducts.includes(prodName)) {
            setExtraZeroProducts([...extraZeroProducts, prodName]);
        }
        setShowAddZeroModal(false);
    };

    // Quitar producto con stock 0
    const handleRemoveZeroProduct = (prodName) => {
        setExtraZeroProducts(extraZeroProducts.filter(p => p !== prodName));
    };

    // Lista ordenada y filtrada de la pestaña sincronizada
    const displayWarehouseRows = useMemo(() => {
        let list = [...warehouseData.items];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            list = list.filter(item =>
                item.name.toLowerCase().includes(term) ||
                (item.catalogName && item.catalogName.toLowerCase().includes(term))
            );
        }

        if (sortConfig.key) {
            list.sort((a, b) => {
                if (sortConfig.key === 'name') {
                    const comp = a.name.localeCompare(b.name);
                    return sortConfig.direction === 'asc' ? comp : -comp;
                }
                if (sortConfig.key === 'physical') {
                    return sortConfig.direction === 'asc' ? a.totalKgL - b.totalKgL : b.totalKgL - a.totalKgL;
                }
                if (sortConfig.key === 'software') {
                    const sA = parseFloat(wsStockMap[a.key]) || 0;
                    const sB = parseFloat(wsStockMap[b.key]) || 0;
                    return sortConfig.direction === 'asc' ? sA - sB : sB - sA;
                }
                if (sortConfig.key === 'diff') {
                    const sA = parseFloat(wsStockMap[a.key]) || 0;
                    const sB = parseFloat(wsStockMap[b.key]) || 0;
                    const diffA = a.totalKgL - sA;
                    const diffB = b.totalKgL - sB;
                    return sortConfig.direction === 'asc' ? diffA - diffB : diffB - diffA;
                }
                if (sortConfig.key === 'custom') {
                    return sortConfig.direction === 'asc' ? a.order - b.order : b.order - a.order;
                }
                return 0;
            });
        } else {
            // Por defecto ordenar por orden maestro del catálogo
            list.sort((a, b) => a.order - b.order);
        }

        return list;
    }, [warehouseData.items, searchTerm, sortConfig, wsStockMap]);

    // Resumen Ejecutivo de Totales para Pestaña Sincronizada
    const warehouseSummary = useMemo(() => {
        let totPhys = 0;
        let totWS = 0;
        let countOk = 0;
        let countUnder = 0;
        let countOver = 0;
        let countPending = 0;

        displayWarehouseRows.forEach(row => {
            totPhys += row.totalKgL;
            const wsVal = wsStockMap[row.key];
            if (wsVal === '' || wsVal === undefined || wsVal === null) {
                countPending += 1;
            } else {
                const wsNum = parseFloat(wsVal) || 0;
                totWS += wsNum;
                const diff = row.totalKgL - wsNum;
                if (diff < -0.01) countUnder += 1;
                else if (diff > 0.01) countOver += 1;
                else countOk += 1;
            }
        });

        const netDiff = totPhys - totWS;

        return {
            totPhys,
            totWS,
            netDiff,
            countOk,
            countUnder,
            countOver,
            countPending
        };
    }, [displayWarehouseRows, wsStockMap]);

    // Operaciones sobre Pestaña Manual
    const sortedProducts = useMemo(() => [...products].sort((a, b) => (parseFloat(a.order) || 0) - (parseFloat(b.order) || 0)), [products]);

    const displayManualEntries = useMemo(() => {
        let list = [...entries];
        if (searchTerm.trim() && activeTab === 'manual') {
            const term = searchTerm.toLowerCase().trim();
            list = list.filter(e => {
                const prod = products.find(p => p.id === e.productId);
                const name = prod ? prod.name : (e.searchTerm || '');
                return name.toLowerCase().includes(term);
            });
        }
        if (sortConfig.key && activeTab === 'manual') {
            list.sort((a, b) => {
                const prodA = products.find(p => p.id === a.productId);
                const prodB = products.find(p => p.id === b.productId);
                if (sortConfig.key === 'name') {
                    const nameA = prodA ? prodA.name.toLowerCase() : (a.searchTerm || '').toLowerCase();
                    const nameB = prodB ? prodB.name.toLowerCase() : (b.searchTerm || '').toLowerCase();
                    return sortConfig.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                }
                return 0;
            });
        }
        return list;
    }, [entries, products, searchTerm, sortConfig, activeTab]);

    const addManualEntry = () => setEntries([...entries, { id: Date.now(), productId: '', physical: '', software: '', searchTerm: '', isDropdownOpen: false }]);

    const updateManualEntry = (id, field, val) => {
        setEntries(prev => prev.map(e => e.id === id ?
            (typeof field === 'string' ? { ...e, [field]: val } : { ...e, ...field })
            : e));
    };

    const removeManualEntry = (id) => {
        if (entries.length > 1) setEntries(entries.filter(e => e.id !== id));
        else setEntries(getInitialManualEntries().slice(0, 1));
    };

    const clearManualForm = () => {
        if (window.confirm(t.invClearConfirm || "¿Desea limpiar todos los datos del formulario?")) {
            setEntries(getInitialManualEntries());
        }
    };

    // Configuración Maestro de Productos
    const addProduct = () => {
        setNewProduct({ name: '', factor: '1', order: products.length + 1 });
        setShowAddModal(true);
    };

    const handleSaveProduct = () => {
        if (!newProduct.name || !newProduct.factor) {
            alert(lang === 'es' ? 'Por favor complete el nombre y el factor.' : 'Please enter a name and factor.');
            return;
        }
        setProducts([...products, {
            id: Date.now().toString(),
            name: newProduct.name,
            factor: parseFloat(newProduct.factor) || 1,
            order: parseInt(newProduct.order) || products.length + 1
        }]);
        setShowAddModal(false);
    };

    const updateProduct = (id, field, val) => setProducts(products.map(p => p.id === id ? { ...p, [field]: val } : p));
    const removeProduct = (id) => setProducts(products.filter(p => p.id !== id));

    // Importar CSV
    const importCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const newProducts = lines.slice(1).map((line, idx) => {
                const parts = line.split(',');
                if (parts.length < 2) return null;
                return {
                    id: (Date.now() + idx).toString(),
                    name: parts[0].trim(),
                    factor: parseFloat(parts[1]) || 1,
                    order: idx + 1
                };
            }).filter(p => p !== null);
            if (newProducts.length > 0) {
                setProducts(newProducts);
                alert(`Se cargaron ${newProducts.length} productos.`);
            }
        };
        reader.readAsText(file);
    };

    const downloadCSVTemplate = () => {
        const csvContent = "Producto,Factor (kg/L)\nBAROID,1.0\nGELTONE II,22.7\nRM-63,208.0\nLIME FG,20.0";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "plantilla_inventario_baroid.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Exportación a PDF de alta resolución en modo A4 horizontal
    const exportPDF = () => {
        const element = document.getElementById('inventory-report-container');
        if (!element) return;
        const date = new Date().toLocaleDateString();
        const tabTitle = activeTab === 'warehouse' ? 'Almacen_Sincronizado' : 'Carga_Manual';
        const opt = {
            margin: [8, 8, 8, 8],
            filename: `Conciliacion_${tabTitle}_${date}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) document.documentElement.classList.remove('dark');

        html2pdf().from(element).set(opt).save().then(() => {
            if (isDark) document.documentElement.classList.add('dark');
        });
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Toast Notificación Flotante */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-[200] bg-emerald-600 text-white font-black text-xs uppercase px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
                    <Icon name="check-circle" size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ENCABEZADO PRINCIPAL */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-halliburton-red rounded-2xl shadow-lg shadow-red-900/20 text-white">
                        <Icon name="clipboard-check" size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-halliburton-red">BAROID LMP &bull; YPF</span>
                            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">WellSight vs Físico</span>
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-zinc-800 dark:text-white title-font">
                            {t.invReconcTitle}
                        </h3>
                    </div>
                </div>

                {/* ACCIONES SUPERIORES */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Botón Sincronizar desde Almacén */}
                    {activeTab === 'warehouse' && (
                        <button
                            onClick={handleSyncFromWarehouse}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                            title="Actualizar stock físico directamente desde el diagrama de pallets"
                        >
                            <Icon name="refresh-cw" size={13} />
                            <span>{t.invSyncFromWarehouseBtn || "Sincronizar Almacén"}</span>
                        </button>
                    )}

                    {/* Botón Configurar Productos */}
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                            isSettingsOpen
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                                : 'bg-zinc-50 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-halliburton-red'
                        }`}
                    >
                        <Icon name={isSettingsOpen ? "check" : "settings"} size={13} />
                        <span>{isSettingsOpen ? t.invFinishConfig : t.invConfigProducts}</span>
                    </button>

                    {/* Botón Importar CSV */}
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-halliburton-red rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                        <Icon name="upload" size={13} />
                        <span>{t.invImportCsv}</span>
                    </button>

                    {/* Botón PDF */}
                    <button
                        onClick={exportPDF}
                        className="flex items-center gap-2 px-4 py-2.5 bg-halliburton-red hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                        <Icon name="file-text" size={13} />
                        <span>PDF</span>
                    </button>
                </div>
            </div>

            {/* SELECTOR DE PESTAÑAS (ALMACÉN vs MANUAL) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {/* Pestaña 1: Sincronizado desde Almacén */}
                    <button
                        onClick={() => { setActiveTab('warehouse'); setSearchTerm(''); }}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                            activeTab === 'warehouse'
                                ? 'bg-halliburton-red text-white border-halliburton-red shadow-lg'
                                : 'bg-white dark:bg-slate-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                        }`}
                    >
                        <Icon name="package" size={15} />
                        <span>{t.invTabWarehouseSync || "Sincronizado desde Almacén"}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                            activeTab === 'warehouse' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-slate-700 text-zinc-500'
                        }`}>
                            {warehouseData.items.length}
                        </span>
                    </button>

                    {/* Pestaña 2: Carga Manual */}
                    <button
                        onClick={() => { setActiveTab('manual'); setSearchTerm(''); }}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                            activeTab === 'manual'
                                ? 'bg-halliburton-red text-white border-halliburton-red shadow-lg'
                                : 'bg-white dark:bg-slate-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                        }`}
                    >
                        <Icon name="edit-3" size={15} />
                        <span>{t.invTabManual || "Carga Manual"}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                            activeTab === 'manual' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-slate-700 text-zinc-500'
                        }`}>
                            {entries.length}
                        </span>
                    </button>
                </div>

                {/* CONTROLES ESPECÍFICOS DE LA PESTAÑA */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Selector de Sector de Almacén (Solo en pestaña sincronizada) */}
                    {activeTab === 'warehouse' && availableSectors.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl shadow-xs">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">{t.invSelectSectorFilter || "Sector:"}</span>
                            <select
                                value={selectedSectorFilter}
                                onChange={(e) => setSelectedSectorFilter(e.target.value)}
                                className="bg-transparent text-xs font-bold text-zinc-700 dark:text-zinc-200 outline-none cursor-pointer"
                            >
                                <option value="all">{t.invAllSectors || "Todo el Almacén (Consolidado)"}</option>
                                {availableSectors.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Selector de Modo de Entrada (Solo en pestaña manual) */}
                    {activeTab === 'manual' && (
                        <div className="flex items-center bg-zinc-100 dark:bg-slate-800 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase">
                            <button
                                onClick={() => setManualMode('kgl')}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    manualMode === 'kgl'
                                        ? 'bg-white dark:bg-slate-700 text-halliburton-red shadow-xs font-black'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                {t.invModeKgL || "Carga en Kg / Litros"}
                            </button>
                            <button
                                onClick={() => setManualMode('units')}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    manualMode === 'units'
                                        ? 'bg-white dark:bg-slate-700 text-halliburton-red shadow-xs font-black'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                {t.invModeUnits || "Unidades x Factor"}
                            </button>
                        </div>
                    )}

                    {/* Barra de Búsqueda Rápida */}
                    <div className="relative min-w-[180px]">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t.invSearchPlaceholder || "Buscar producto..."}
                            className="w-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-halliburton-red"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                            <Icon name="search" size={13} />
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                                <Icon name="x" size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* PANEL DE CONFIGURACIÓN DEL MAESTRO DE PRODUCTOS */}
            {isSettingsOpen && (
                <div className="bg-zinc-50 dark:bg-slate-900/60 p-6 lg:p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 animate-fade-in space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-lg font-black uppercase italic text-zinc-800 dark:text-zinc-200">{t.invMasterCatalog}</h4>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Factores de conversión oficiales Baroid</p>
                        </div>
                        <button onClick={addProduct} className="btn-primary px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md">
                            <Icon name="plus" size={13} className="inline mr-1" />
                            {t.invNewProduct}
                        </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-zinc-50 dark:bg-slate-900 z-10">
                                <tr className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                                    <th className="pb-3 px-2 w-16 text-center">{t.invOrder}</th>
                                    <th className="pb-3 px-2">{t.invProductDescription}</th>
                                    <th className="pb-3 px-2 w-44">{t.invFactorLabel}</th>
                                    <th className="pb-3 px-2 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-zinc-100/70 dark:hover:bg-slate-800/40">
                                        <td className="py-2 px-2 text-center">
                                            <input
                                                type="number"
                                                value={p.order}
                                                onChange={e => updateProduct(p.id, 'order', e.target.value)}
                                                onWheel={e => e.target.blur()}
                                                className="w-12 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1 text-center font-bold outline-none"
                                            />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input
                                                type="text"
                                                value={p.name}
                                                onChange={e => updateProduct(p.id, 'name', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 font-bold outline-none"
                                            />
                                        </td>
                                        <td className="py-2 px-2">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={p.factor}
                                                    onChange={e => updateProduct(p.id, 'factor', e.target.value)}
                                                    onWheel={e => e.target.blur()}
                                                    className="w-full bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 font-black outline-none"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400">Kg/L</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 text-right">
                                            <button onClick={() => removeProduct(p.id)} className="p-1.5 text-zinc-400 hover:text-halliburton-red">
                                                <Icon name="trash-2" size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TABLA PRINCIPAL DEL REPORTE CONCILIACIÓN */}
            <div id="inventory-report-container" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-zinc-200/80 dark:border-zinc-800 space-y-6">
                
                {/* ENCABEZADO PARA IMPRESIÓN PDF */}
                <div className="hidden print:block border-b-2 border-zinc-800 pb-3 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-black">BAROID LMP &bull; CONCILIACIÓN OFICIAL DE INVENTARIO</h2>
                            <p className="text-xs text-zinc-600 font-bold">
                                Modalidad: {activeTab === 'warehouse' ? 'Sincronizado desde Diagrama de Almacén' : 'Carga Manual'} &bull; Fecha: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right text-xs font-mono text-zinc-700">
                            YPF &bull; Halliburton Baroid Argentina
                        </div>
                    </div>
                </div>

                {/* ============================================================== */}
                {/* VISTA 1: TABLA SINCRONIZADA DESDE ALMACÉN (PREDETERMINADA)      */}
                {/* ============================================================== */}
                {activeTab === 'warehouse' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[10px]">
                                    <Icon name="check-circle" size={12} />
                                    <span>Diagrama Conectado</span>
                                </span>
                                <span className="text-zinc-400 font-bold">
                                    {displayWarehouseRows.length} productos con stock o en seguimiento
                                </span>
                            </div>
                            <div className="text-[10px] font-bold text-zinc-400 italic">
                                {t.invEnterNavHint || "💡 Tip: Usa Enter para bajar a la fila siguiente y Tab para avanzar."}
                            </div>
                        </div>

                        {displayWarehouseRows.length === 0 ? (
                            <div className="py-16 text-center space-y-4 bg-zinc-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-200 dark:bg-slate-700 flex items-center justify-center text-zinc-400">
                                    <Icon name="package" size={24} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-tight">
                                        {t.invNoWarehouseData || "No se detectaron pallets con stock en el almacén."}
                                    </p>
                                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                                        Carga pallets en la pestaña Diagrama Almacén, o pulsa el botón de abajo para agregar productos de WellSight con stock físico 0.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddZeroModal(true)}
                                    className="btn-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                                >
                                    <Icon name="plus" size={14} className="inline mr-1" />
                                    {t.invAddZeroProduct || "+ Agregar Producto con Físico 0"}
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-1.5 min-w-[950px]">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                                            {/* Columna Producto */}
                                            <th
                                                className="pb-2 px-3 w-1/4 cursor-pointer hover:text-halliburton-red transition-colors select-none"
                                                onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span>{t.invTableProduct}</span>
                                                    <Icon name="chevrons-up-down" size={11} className="opacity-60" />
                                                </div>
                                            </th>

                                            {/* Columna Empaque / Presentación */}
                                            <th className="pb-2 px-3 text-center w-28">{t.invTablePackUnit}</th>

                                            {/* Columna Físico Real (Kg/L) */}
                                            <th
                                                className="pb-2 px-3 text-center w-36 cursor-pointer hover:text-halliburton-red transition-colors select-none"
                                                onClick={() => setSortConfig({ key: 'physical', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                            >
                                                <div className="flex items-center justify-center gap-1">
                                                    <span>{t.invPhysicalStockKgL || "Físico Real (kg/L)"}</span>
                                                    <Icon name="chevrons-up-down" size={11} className="opacity-60" />
                                                </div>
                                            </th>

                                            {/* Columna WellSight (Editable) */}
                                            <th className="pb-2 px-3 text-center w-44">
                                                <span className="text-halliburton-red underline decoration-dotted">{t.invTableWSStock}</span>
                                            </th>

                                            {/* Columna Diferencia (Kg/L) */}
                                            <th
                                                className="pb-2 px-3 text-center w-32 cursor-pointer hover:text-halliburton-red transition-colors select-none"
                                                onClick={() => setSortConfig({ key: 'diff', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                            >
                                                <div className="flex items-center justify-center gap-1">
                                                    <span>{t.invTableDiffWeight}</span>
                                                    <Icon name="chevrons-up-down" size={11} className="opacity-60" />
                                                </div>
                                            </th>

                                            {/* Columna Diferencia Empaques */}
                                            <th className="pb-2 px-3 text-center w-28">{t.invTableDiffPack}</th>

                                            {/* Columna Estado */}
                                            <th className="pb-2 px-3 text-center w-40">{t.invTableStatus}</th>

                                            {/* Acción */}
                                            <th className="pb-2 px-2 w-10 text-center"></th>
                                        </tr>
                                    </thead>

                                    <tbody className="text-xs">
                                        {displayWarehouseRows.map((row, rIdx) => {
                                            const wsVal = wsStockMap[row.key];
                                            const hasWS = wsVal !== '' && wsVal !== undefined && wsVal !== null;
                                            const wsNum = hasWS ? (parseFloat(wsVal) || 0) : 0;
                                            const diffKgL = hasWS ? (row.totalKgL - wsNum) : 0;
                                            const diffUM = row.factor > 0 ? (diffKgL / row.factor) : 0;

                                            let statusLabel = t.invStatusOk;
                                            let badgeClass = "bg-green-500/10 text-green-600 ring-green-500/30";

                                            if (!hasWS) {
                                                statusLabel = t.invPendingWS || "PENDIENTE WS";
                                                badgeClass = "bg-zinc-100 text-zinc-500 ring-zinc-300 dark:bg-slate-800 dark:text-zinc-400";
                                            } else if (diffKgL < -0.01) {
                                                statusLabel = t.invStatusUnder; // FALTA COBRAR
                                                badgeClass = "bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/40 font-black";
                                            } else if (diffKgL > 0.01) {
                                                statusLabel = t.invStatusOver; // SOBRANTE (AJUSTE)
                                                badgeClass = "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-amber-500/40 font-black";
                                            }

                                            return (
                                                <tr
                                                    key={`wh-row-${row.key}`}
                                                    className="group transition-all bg-zinc-50/60 dark:bg-slate-800/20 hover:bg-zinc-100 dark:hover:bg-slate-800/60"
                                                >
                                                    {/* Nombre del Producto */}
                                                    <td className="py-2.5 px-3 rounded-l-xl">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-extrabold text-zinc-800 dark:text-zinc-100">{row.name}</span>
                                                                {row.isLiquid && (
                                                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black uppercase">Líq</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-zinc-400 font-bold">
                                                                {row.palletsCount > 0 ? `${row.palletsCount} ${t.invPalletsCount || "pallets"}` : 'Sin pallets en almacén'}
                                                                {row.packageDetailsList?.length > 0 && ` &bull; ${row.packageDetailsList[0]}`}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Presentación / Factor */}
                                                    <td className="py-2.5 px-3 text-center">
                                                        <span className="text-zinc-500 dark:text-zinc-400 font-bold text-[11px]">
                                                            {row.factor} {row.unit}/UM
                                                        </span>
                                                    </td>

                                                    {/* Físico Real de Almacén (Kg/L) */}
                                                    <td className="py-2.5 px-3 text-center font-black text-sm tabular-nums text-zinc-900 dark:text-white">
                                                        {row.totalKgL.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                        <span className="text-[10px] text-zinc-400 font-bold ml-1">{row.unit}</span>
                                                    </td>

                                                    {/* WellSight Input (Editable con salto Enter) */}
                                                    <td className="py-2.5 px-3">
                                                        <input
                                                            type="number"
                                                            data-col="ws-stock"
                                                            data-row-idx={rIdx}
                                                            value={wsVal !== undefined ? wsVal : ''}
                                                            onChange={(e) => handleWsChange(row.key, e.target.value)}
                                                            onKeyDown={(e) => handleCellKeyDown(e, rIdx, 'ws-stock', displayWarehouseRows.length)}
                                                            onWheel={(e) => e.target.blur()}
                                                            placeholder="0.0"
                                                            className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 focus:border-halliburton-red rounded-xl p-2 text-center font-black text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-all shadow-xs"
                                                        />
                                                    </td>

                                                    {/* Diferencia en Kg/L */}
                                                    <td className={`py-2.5 px-3 text-center font-black text-sm tabular-nums ${
                                                        !hasWS ? 'text-zinc-400' : (diffKgL < -0.01 ? 'text-red-600 dark:text-red-400' : (diffKgL > 0.01 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'))
                                                    }`}>
                                                        {!hasWS ? '-' : (diffKgL === 0 ? '0.0' : (diffKgL > 0 ? '+' : '') + diffKgL.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))}
                                                    </td>

                                                    {/* Diferencia en UM / Empaques */}
                                                    <td className="py-2.5 px-3 text-center font-bold text-xs opacity-70 tabular-nums">
                                                        {!hasWS ? '-' : (diffUM === 0 ? '0' : (diffUM > 0 ? '+' : '') + diffUM.toFixed(1))}
                                                    </td>

                                                    {/* Estado Badge */}
                                                    <td className="py-2.5 px-3">
                                                        <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-center ring-1 ring-inset ${badgeClass}`}>
                                                            {statusLabel}
                                                        </div>
                                                    </td>

                                                    {/* Acción (Quitar si fue agregado como 0) */}
                                                    <td className="py-2.5 px-2 rounded-r-xl text-center">
                                                        {row.isExtraZero && (
                                                            <button
                                                                onClick={() => handleRemoveZeroProduct(row.name)}
                                                                className="p-1.5 text-zinc-300 hover:text-red-500 rounded-lg transition-colors"
                                                                title="Quitar producto con físico 0"
                                                            >
                                                                <Icon name="x" size={13} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* BOTÓN INFERIOR PARA AGREGAR PRODUCTOS CON STOCK 0 */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                            <button
                                onClick={() => setShowAddZeroModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                                <Icon name="plus" size={13} />
                                <span>{t.invAddZeroProduct || "+ Agregar Producto (Stock Físico 0 kg/L)"}</span>
                            </button>

                            {/* Botón limpiar valores de WellSight */}
                            <button
                                onClick={() => {
                                    if (window.confirm("¿Limpiar todos los valores ingresados de WellSight para este conteo?")) {
                                        setWsStockMap({});
                                    }
                                }}
                                className="px-3 py-2 text-zinc-400 hover:text-red-600 text-[10px] font-bold uppercase transition-colors"
                            >
                                Limpiar WellSight
                            </button>
                        </div>

                        {/* RESUMEN EJECUTIVO (METRIC CARDS) */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="p-3 bg-zinc-50 dark:bg-slate-800/40 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">{t.invSummaryPhysical || "Físico Total"}</span>
                                <span className="text-base font-black text-zinc-800 dark:text-zinc-100 tabular-nums">
                                    {warehouseSummary.totPhys.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg/L
                                </span>
                            </div>

                            <div className="p-3 bg-zinc-50 dark:bg-slate-800/40 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">{t.invSummaryWS || "WellSight Total"}</span>
                                <span className="text-base font-black text-zinc-800 dark:text-zinc-100 tabular-nums">
                                    {warehouseSummary.totWS.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg/L
                                </span>
                            </div>

                            <div className="p-3 bg-zinc-50 dark:bg-slate-800/40 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">{t.invSummaryDiff || "Diferencia Neta"}</span>
                                <span className={`text-base font-black tabular-nums ${
                                    warehouseSummary.netDiff < -0.01 ? 'text-red-600' : (warehouseSummary.netDiff > 0.01 ? 'text-amber-600' : 'text-emerald-600')
                                }`}>
                                    {(warehouseSummary.netDiff > 0 ? '+' : '') + warehouseSummary.netDiff.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg/L
                                </span>
                            </div>

                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">{t.invSummaryOk || "Conciliados (OK)"}</span>
                                <span className="text-base font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                                    {warehouseSummary.countOk}
                                </span>
                            </div>

                            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                <span className="text-[9px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">{t.invSummaryUnder || "Falta Cobrar"}</span>
                                <span className="text-base font-black text-red-700 dark:text-red-300 tabular-nums">
                                    {warehouseSummary.countUnder}
                                </span>
                            </div>

                            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">{t.invSummaryOver || "Sobrante"}</span>
                                <span className="text-base font-black text-amber-700 dark:text-amber-300 tabular-nums">
                                    {warehouseSummary.countOver}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* VISTA 2: TABLA DE CARGA MANUAL (TRADICIONAL MEJORADA)          */}
                {/* ============================================================== */}
                {activeTab === 'manual' && (
                    <div className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-1.5 min-w-[950px]">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                                        <th
                                            className="pb-2 px-3 w-1/4 cursor-pointer hover:text-halliburton-red transition-colors"
                                            onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>{t.invTableProduct}</span>
                                                <Icon name="chevrons-up-down" size={11} className="opacity-60" />
                                            </div>
                                        </th>
                                        <th className="pb-2 px-3 text-center w-28">{t.invTablePackUnit}</th>
                                        <th className="pb-2 px-3 text-center w-36">
                                            {manualMode === 'kgl' ? "Físico (kg/L)" : "Cant. Unidades"}
                                        </th>
                                        <th className="pb-2 px-3 text-center w-32">Físico Total (kg/L)</th>
                                        <th className="pb-2 px-3 text-center w-40">{t.invTableWSStock}</th>
                                        <th className="pb-2 px-3 text-center w-32">{t.invTableDiffWeight}</th>
                                        <th className="pb-2 px-3 text-center w-28">{t.invTableDiffPack}</th>
                                        <th className="pb-2 px-3 text-center w-36">{t.invTableStatus}</th>
                                        <th className="pb-2 px-2 w-10 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    {displayManualEntries.map((e, rIdx) => {
                                        const prod = products.find(p => p.id === e.productId);
                                        const factor = prod ? (parseFloat(prod.factor) || 0) : 0;
                                        const rawPhys = parseFloat(e.physical) || 0;
                                        const softWS = parseFloat(e.software) || 0;

                                        // Si el modo es 'kgl', el físico es directo en kg/L; si es 'units', se multiplica por factor
                                        const physKgL = manualMode === 'kgl' ? rawPhys : (rawPhys * factor);
                                        const diffKgL = physKgL - softWS;
                                        const diffUM = factor !== 0 ? diffKgL / factor : 0;

                                        let statusLabel = t.invStatusOk;
                                        let bgClass = "bg-green-500/10 text-green-600 ring-green-500/30";
                                        if (diffKgL < -0.01) {
                                            statusLabel = t.invStatusUnder;
                                            bgClass = "bg-red-500/15 text-red-600 dark:text-red-400 ring-red-500/40 font-black";
                                        } else if (diffKgL > 0.01) {
                                            statusLabel = t.invStatusOver;
                                            bgClass = "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-amber-500/40 font-black";
                                        }

                                        return (
                                            <tr key={e.id} className="group transition-all bg-zinc-50/60 dark:bg-slate-800/20 hover:bg-zinc-100 dark:hover:bg-slate-800/60">
                                                {/* Selector de Producto */}
                                                <td className="py-1 px-3 rounded-l-xl relative">
                                                    <div className="relative group/select">
                                                        <input
                                                            type="text"
                                                            value={prod ? prod.name : (e.searchTerm || '')}
                                                            onChange={(val) => {
                                                                const term = val.target.value;
                                                                updateManualEntry(e.id, 'searchTerm', term);
                                                                if (prod && term !== prod.name) {
                                                                    updateManualEntry(e.id, 'productId', '');
                                                                }
                                                            }}
                                                            onKeyDown={(evt) => {
                                                                if (evt.key === 'Tab' && !e.productId && (e.searchTerm || '').length > 0) {
                                                                    const filtered = sortedProducts.filter(p => p.name.toLowerCase().includes((e.searchTerm || '').toLowerCase()));
                                                                    if (filtered.length > 0) {
                                                                        const bestMatch = filtered[0];
                                                                        updateManualEntry(e.id, { productId: bestMatch.id, searchTerm: bestMatch.name, isDropdownOpen: false });
                                                                    }
                                                                }
                                                            }}
                                                            onFocus={() => updateManualEntry(e.id, 'isDropdownOpen', true)}
                                                            onBlur={() => setTimeout(() => updateManualEntry(e.id, 'isDropdownOpen', false), 250)}
                                                            placeholder={t.invSearchProduct}
                                                            className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-2 font-bold pr-8 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                                        />
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                                                            <Icon name="chevron-down" size={12} />
                                                        </div>

                                                        {e.isDropdownOpen && (
                                                            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                                                {sortedProducts
                                                                    .filter(p => !e.searchTerm || p.name.toLowerCase().includes((e.searchTerm || '').toLowerCase()))
                                                                    .map(p => (
                                                                        <button
                                                                            key={p.id}
                                                                            onClick={() => {
                                                                                updateManualEntry(e.id, { productId: p.id, searchTerm: p.name, isDropdownOpen: false });
                                                                            }}
                                                                            className="w-full text-left px-4 py-2.5 hover:bg-halliburton-red hover:text-white transition-colors text-xs font-bold flex items-center justify-between"
                                                                        >
                                                                            <span className="truncate">{p.name}</span>
                                                                            <span className="text-[9px] opacity-60 uppercase">{p.factor} Kg/L</span>
                                                                        </button>
                                                                    ))
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Presentación / Factor */}
                                                <td className="py-1 px-3 text-center text-zinc-500 font-bold">
                                                    {factor} Kg/L
                                                </td>

                                                {/* Entrada Física */}
                                                <td className="py-1 px-3">
                                                    <input
                                                        type="number"
                                                        data-col="manual-phys"
                                                        data-row-idx={rIdx}
                                                        value={e.physical}
                                                        onChange={val => updateManualEntry(e.id, 'physical', val.target.value)}
                                                        onKeyDown={evt => handleCellKeyDown(evt, rIdx, 'manual-phys', displayManualEntries.length)}
                                                        onWheel={evt => evt.target.blur()}
                                                        className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-2 text-center font-black text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                                        placeholder="0"
                                                    />
                                                </td>

                                                {/* Físico Total en Kg/L */}
                                                <td className="py-1 px-3 text-center font-black text-sm tabular-nums text-zinc-900 dark:text-white">
                                                    {physKgL.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                </td>

                                                {/* Entrada WellSight */}
                                                <td className="py-1 px-3">
                                                    <input
                                                        type="number"
                                                        data-col="manual-ws"
                                                        data-row-idx={rIdx}
                                                        value={e.software}
                                                        onChange={val => updateManualEntry(e.id, 'software', val.target.value)}
                                                        onKeyDown={evt => handleCellKeyDown(evt, rIdx, 'manual-ws', displayManualEntries.length)}
                                                        onWheel={evt => evt.target.blur()}
                                                        className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-2 text-center font-black text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                                        placeholder="Stock"
                                                    />
                                                </td>

                                                {/* Diferencia en Kg/L */}
                                                <td className={`py-1 px-3 text-center font-black text-sm tabular-nums ${
                                                    diffKgL < -0.01 ? 'text-red-600 dark:text-red-400' : (diffKgL > 0.01 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')
                                                }`}>
                                                    {diffKgL === 0 ? '0' : (diffKgL > 0 ? '+' : '') + diffKgL.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                </td>

                                                {/* Diferencia en UM */}
                                                <td className="py-1 px-3 text-center font-bold text-xs opacity-70 tabular-nums">
                                                    {diffUM === 0 ? '-' : (diffUM > 0 ? '+' : '') + diffUM.toFixed(1)}
                                                </td>

                                                {/* Estado Badge */}
                                                <td className="py-1 px-3">
                                                    <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider text-center ring-1 ring-inset ${bgClass}`}>
                                                        {statusLabel}
                                                    </div>
                                                </td>

                                                {/* Eliminar Fila */}
                                                <td className="py-1 px-2 rounded-r-xl text-center">
                                                    <button onClick={() => removeManualEntry(e.id)} className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors">
                                                        <Icon name="trash-2" size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ACCIONES INFERIORES DE CARGA MANUAL */}
                        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <button
                                onClick={addManualEntry}
                                className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all shadow-md active:scale-95"
                            >
                                <Icon name="plus" size={14} />
                                {t.invAddProductCount}
                            </button>

                            <button onClick={clearManualForm} className="px-6 py-3 bg-zinc-100 dark:bg-slate-800 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-zinc-200 transition-all">
                                <Icon name="refresh-ccw" size={13} className="inline mr-2" />
                                {t.invClearAll}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL PARA AGREGAR PRODUCTO CON STOCK 0 A LA CONCILIACIÓN */}
            {showAddZeroModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="absolute inset-0" onClick={() => setShowAddZeroModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 animate-modal-in">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                            <div>
                                <h3 className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                                    Agregar Producto a Conciliar
                                </h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Stock Físico en Almacén = 0 kg/L</p>
                            </div>
                            <button onClick={() => setShowAddZeroModal(false)} className="text-zinc-400 hover:text-zinc-700">
                                <Icon name="x" size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Selecciona el Producto</label>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                                {sortedProducts.map(p => (
                                    <button
                                        key={`zero-pick-${p.id}`}
                                        onClick={() => handleAddZeroProduct(p.name)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-halliburton-red hover:text-white text-xs font-bold transition-colors flex items-center justify-between"
                                    >
                                        <span>{p.name}</span>
                                        <span className="text-[10px] opacity-60 uppercase">{p.factor} Kg/L</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowAddZeroModal(false)}
                                className="px-4 py-2 bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE IMPORTAR CSV */}
            {showImportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="absolute inset-0" onClick={() => setShowImportModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white/20 p-8 space-y-6 animate-modal-in overflow-hidden">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-800 dark:text-white title-font">{t.invImportHeader}</h3>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.invImportSub}</p>
                            </div>
                            <button onClick={() => setShowImportModal(false)} className="text-zinc-400 hover:text-halliburton-red transition-colors">
                                <Icon name="x" size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={downloadCSVTemplate}
                                className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-halliburton-red group transition-all"
                            >
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md mb-3 group-hover:scale-110 transition-transform">
                                    <Icon name="download" size={20} className="text-halliburton-red" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">{t.invDownloadTemplate}</span>
                                <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase text-center">{t.invDownloadTemplateSub}</span>
                            </button>

                            <label className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-halliburton-red group cursor-pointer transition-all">
                                <input type="file" accept=".csv" className="hidden" onChange={(e) => { importCSV(e); setShowImportModal(false); }} />
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md mb-3 group-hover:scale-110 transition-transform">
                                    <Icon name="upload" size={20} className="text-halliburton-red" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">{t.invUploadFile}</span>
                                <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase text-center">{t.invUploadFileSub}</span>
                            </label>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 text-left">
                            <p className="text-[9px] font-bold text-red-600 dark:text-red-400 leading-relaxed uppercase">
                                <Icon name="alert-circle" size={10} className="inline mr-1 mb-0.5" />
                                {t.invImportNotice}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NUEVO PRODUCTO MAESTRO */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="absolute inset-0" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 p-8 space-y-6 animate-modal-in">
                        <div className="text-center space-y-1">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-800 dark:text-white title-font">{t.invNewProductTitle}</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.invNewProductSub}</p>
                        </div>

                        <div className="space-y-4 text-left">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t.invNewProductName}</label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm font-bold outline-none"
                                    placeholder="Ej: GELTONE II"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Factor (kg/L)</label>
                                    <input
                                        type="number"
                                        value={newProduct.factor}
                                        onChange={e => setNewProduct({ ...newProduct, factor: e.target.value })}
                                        onWheel={e => e.target.blur()}
                                        className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm font-black outline-none"
                                        placeholder="1.0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t.invOrder}</label>
                                    <input
                                        type="number"
                                        value={newProduct.order}
                                        onChange={e => setNewProduct({ ...newProduct, order: e.target.value })}
                                        onWheel={e => e.target.blur()}
                                        className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-sm font-bold text-center outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 bg-zinc-100 dark:bg-slate-800 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-wider"
                            >
                                {t.invCancel}
                            </button>
                            <button
                                onClick={handleSaveProduct}
                                className="flex-1 py-3 btn-primary rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg"
                            >
                                {t.invSaveProduct}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryConciliation;
