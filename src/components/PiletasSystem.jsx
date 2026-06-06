import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const PiletasSystem = ({ isEditing }) => {
    const [unitMode, setUnitMode] = useState('metric'); // 'field', 'metric'
    const [isConfiguringFluids, setIsConfiguringFluids] = useState(false);
    const [showFluidStats, setShowFluidStats] = useState(false);
    const [draggingPitId, setDraggingPitId] = useState(null);
    const [resizingPitId, setResizingPitId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ w: 0, h: 0, x: 0, y: 0 });
    const [historyPits, setHistoryPits] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionBox, setSelectionBox] = useState(null); // { x, y, startX, startY }
    const [groupStartStates, setGroupStartStates] = useState(null);

    const INITIAL_FLUIDS = [
        { id: 'WBM', label: 'WBM', color: 'bg-blue-600' },
        { id: 'OBM', label: 'OBM', color: 'bg-halliburton-red' },
        { id: 'KillMud', label: 'KillMud', color: 'bg-zinc-900' },
        { id: 'Gasoil', label: 'Gasoil', color: 'bg-yellow-500' }
    ];

    const INITIAL_PITS = [
        { n: 'SUCCIÓN 1', cap: 35 }, { n: 'SUCCIÓN 2', cap: 35 }, { n: 'PILDORA 1', cap: 14 },
        { n: 'INTERMEDIA 1', cap: 45 }, { n: 'INTERMEDIA 2', cap: 45 },
        { n: 'RESERVA 1', cap: 45 }, { n: 'RESERVA 2', cap: 45 }, { n: 'PILDORA 2', cap: 14 },
        { n: 'RESERVA 3', cap: 45 }, { n: 'RESERVA 4', cap: 45 },
        { n: 'NOV1', cap: 60 }, { n: 'NOV2', cap: 60 }, { n: 'NOV3', cap: 60 }, { n: 'NOV4', cap: 60 }, { n: 'NOV5', cap: 60 }
    ].map((p, i) => ({
        id: i + 1,
        name: p.n,
        vol: 0,
        maxVol: p.cap,
        density: 1.0,
        type: 'WBM',
        x: 50 + ((i % 5) * 170),
        y: 40 + (Math.floor(i / 5) * 240),
        w: 120,
        h: 105,
        rotated: false
    }));

    const [fluidSystems, setFluidSystems] = useState(() => {
        const saved = localStorage.getItem('baroid_fluid_systems_v4');
        return saved ? JSON.parse(saved) : INITIAL_FLUIDS;
    });

    const [pits, setPits] = useState(() => {
        const saved = localStorage.getItem('baroid_piletas_v8');
        return saved ? JSON.parse(saved) : INITIAL_PITS;
    });

    useEffect(() => {
        localStorage.setItem('baroid_piletas_v8', JSON.stringify(pits));
    }, [pits]);

    useEffect(() => {
        localStorage.setItem('baroid_fluid_systems_v4', JSON.stringify(fluidSystems));
    }, [fluidSystems]);

    const addPit = () => {
        const newPit = {
            id: Date.now(),
            name: `P-${pits.length + 1}`,
            vol: 0,
            maxVol: 50,
            density: 1.0,
            type: fluidSystems[0]?.id || 'WBM',
            x: 50,
            y: 50,
            rotated: false,
            w: 120,
            h: 105
        };

        const nextPits = [...pits, newPit];
        setPits(nextPits);

        if (historyPits) {
            setHistoryPits([...historyPits, newPit]);
        }
    };

    const updatePit = (id, field, val) => {
        const mapper = p => {
            if (p.id === id) {
                const next = { ...p, [field]: val };
                const v = parseFloat(next.vol);
                const m = parseFloat(next.maxVol);
                if (!isNaN(v) && !isNaN(m) && v > m && next.maxVol !== '') {
                    next.vol = next.maxVol;
                }
                return next;
            }
            return p;
        };

        setPits(pits.map(mapper));

        if (historyPits) {
            setHistoryPits(historyPits.map(mapper));
        }
    };

    const reorderPits = () => {
        setHistoryPits(JSON.parse(JSON.stringify(pits)));

        const sortedPits = [...pits].sort((a, b) => {
            if (Math.abs(a.y - b.y) < 100) return a.x - b.x;
            return a.y - b.y;
        });

        const COLS = 5;
        const SPACING_X = 170;
        const SPACING_Y = 240;
        const OFFSET_X = 50;
        const OFFSET_Y = 40;

        const newPits = sortedPits.map((p, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            return {
                ...p,
                x: OFFSET_X + (col * SPACING_X),
                y: OFFSET_Y + (row * SPACING_Y),
                w: 120,
                h: 105,
                rotated: false
            };
        });

        setPits(newPits);
    };

    const undoReorder = () => {
        if (historyPits) {
            setPits(historyPits);
            setHistoryPits(null);
        }
    };

    const deletePit = (id) => {
        const isSelected = selectedIds.includes(id);
        const idsToDelete = isSelected ? selectedIds : [id];
        const count = idsToDelete.length;
        const msg = count > 1 ? `¿Eliminar las ${count} piletas seleccionadas?` : '¿Eliminar esta pileta?';

        if (confirm(msg)) {
            const filterer = p => !idsToDelete.includes(p.id);
            setPits(pits.filter(filterer));
            if (historyPits) {
                setHistoryPits(historyPits.filter(filterer));
            }
            setSelectedIds(prev => prev.filter(sid => !idsToDelete.includes(sid)));
        }
    };

    const handleMouseDown = (e, id = null) => {
        const isTouch = e.type.startsWith('touch');
        const eventClientX = isTouch ? e.touches[0].clientX : e.clientX;
        const eventClientY = isTouch ? e.touches[0].clientY : e.clientY;
        const eventShiftKey = isTouch ? false : e.shiftKey;

        if (e.target.closest('input') || e.target.closest('button') || e.target.closest('select')) return;

        if (id) {
            e.stopPropagation();
            let nextSelection = selectedIds;
            const isNowSelected = selectedIds.includes(id);

            if (eventShiftKey) {
                nextSelection = isNowSelected ? selectedIds.filter(i => i !== id) : [...selectedIds, id];
                setSelectedIds(nextSelection);
            } else if (!isNowSelected) {
                nextSelection = [id];
                setSelectedIds(nextSelection);
            }

            const startData = {};
            pits.forEach(p => {
                if (nextSelection.includes(p.id)) {
                    startData[p.id] = { x: p.x, y: p.y, w: p.w, h: p.h };
                }
            });
            setGroupStartStates(startData);

            const pit = pits.find(p => p.id === id);
            if (e.target.closest('.resize-handle')) {
                setResizingPitId(id);
                setResizeStart({ w: pit.w, h: pit.h, x: eventClientX, y: eventClientY });
            } else {
                setDraggingPitId(id);
                setDragOffset({ x: eventClientX - pit.x, y: eventClientY - pit.y });
            }
        } else {
            if (!eventShiftKey) setSelectedIds([]);
            setSelectionBox({ x: eventClientX, y: eventClientY, startX: eventClientX, startY: eventClientY, w: 0, h: 0 });
        }
    };

    const handleMouseMove = (e) => {
        const isTouch = e.type.startsWith('touch');
        const eventClientX = isTouch ? e.touches[0].clientX : e.clientX;
        const eventClientY = isTouch ? e.touches[0].clientY : e.clientY;

        if (isTouch && (draggingPitId || resizingPitId)) {
            if (e.cancelable) e.preventDefault();
        }

        const canvasEl = document.getElementById('piletas-canvas');
        if (!canvasEl) return;
        const canvasRect = canvasEl.getBoundingClientRect();
        const margin = 20;

        if (selectionBox) {
            const currentX = eventClientX;
            const currentY = eventClientY;
            const x = Math.min(currentX, selectionBox.startX);
            const y = Math.min(currentY, selectionBox.startY);
            const w = Math.abs(currentX - selectionBox.startX);
            const h = Math.abs(currentY - selectionBox.startY);
            setSelectionBox({ ...selectionBox, x, y, w, h });

            const boxInCanvas = {
                left: x - canvasRect.left,
                top: y - canvasRect.top,
                right: (x + w) - canvasRect.left,
                bottom: (y + h) - canvasRect.top
            };

            const pitsInBox = pits.filter(p => {
                const pw = p.w + 24;
                const ph = 150;
                return (p.x < boxInCanvas.right && p.x + pw > boxInCanvas.left &&
                    p.y < boxInCanvas.bottom && p.y + ph > boxInCanvas.top);
            }).map(p => p.id);
            setSelectedIds(pitsInBox);
        } else if (draggingPitId && groupStartStates) {
            const dx = eventClientX - (groupStartStates[draggingPitId].x + dragOffset.x);
            const dy = eventClientY - (groupStartStates[draggingPitId].y + dragOffset.y);

            setPits(prevPits => prevPits.map(p => {
                if (selectedIds.includes(p.id) && groupStartStates[p.id]) {
                    const s = groupStartStates[p.id];
                    return {
                        ...p,
                        x: Math.max(margin, Math.min(s.x + dx, canvasRect.width - margin - (p.w + 24))),
                        y: Math.max(margin, Math.min(s.y + dy, canvasRect.height - margin - 150))
                    };
                }
                return p;
            }));
        } else if (resizingPitId && groupStartStates) {
            const dx = eventClientX - resizeStart.x;
            const dy = eventClientY - resizeStart.y;

            setPits(prevPits => prevPits.map(p => {
                if (selectedIds.includes(p.id) && groupStartStates[p.id]) {
                    const s = groupStartStates[p.id];
                    return {
                        ...p,
                        w: Math.max(120, s.w + dx),
                        h: Math.max(105, s.h + dy)
                    };
                }
                return p;
            }));
        }
    };

    const handleMouseUp = () => {
        setDraggingPitId(null);
        setResizingPitId(null);
        setSelectionBox(null);
        setGroupStartStates(null);
    };

    const handleEnter = (e) => {
        if (e.key === 'Enter') e.target.blur();
    };

    const addFluidSystem = () => {
        const id = `SYS_${Date.now()}`;
        setFluidSystems([...fluidSystems, { id, label: 'Nuevo', color: 'bg-zinc-500' }]);
    };

    const updateFluidSystem = (id, field, val) => {
        setFluidSystems(fluidSystems.map(s => s.id === id ? { ...s, [field]: val } : s));
    };

    const deleteFluidSystem = (id) => {
        if (fluidSystems.length <= 1) return alert('Debe haber al menos un sistema.');
        if (confirm('¿Eliminar este sistema? Las piletas que lo usen volverán al primero.')) {
            const nextSystems = fluidSystems.filter(s => s.id !== id);
            setFluidSystems(nextSystems);
            setPits(pits.map(p => p.type === id ? { ...p, type: nextSystems[0].id } : p));
        }
    };

    const totalVol = pits.reduce((acc, p) => acc + (parseFloat(p.vol) || 0), 0);
    const totalMax = pits.reduce((acc, p) => acc + (parseFloat(p.maxVol) || 0), 0);
    const avgSG = totalVol > 0
        ? pits.reduce((acc, p) => acc + ((parseFloat(p.vol) || 0) * (parseFloat(p.density) || 1)), 0) / totalVol
        : 1.0;

    const displayDens = (sg) => {
        return unitMode === 'metric' ? (sg * 1000).toFixed(0) : (sg * 8.33).toFixed(2);
    };
    const parseDens = (val) => {
        const num = parseFloat(val) || 0;
        return unitMode === 'metric' ? num / 1000 : num / 8.33;
    };
    const getDensLabel = () => unitMode === 'metric' ? 'g/L' : 'ppg';

    const displayVol = (v) => {
        if (v === '' || v === undefined || v === null) return '';
        const num = parseFloat(v);
        if (isNaN(num)) return '';
        const converted = unitMode === 'metric' ? num : num / 0.158987;
        return Math.round(converted * 100) / 100;
    };

    const parseVol = (val) => {
        if (val === '' || val === undefined || val === null) return '';
        const num = parseFloat(val);
        if (isNaN(num)) return '';
        const converted = unitMode === 'metric' ? num : num * 0.158987;
        return Math.round(converted * 100) / 100;
    };

    const availableColors = [
        'bg-blue-600', 'bg-halliburton-red', 'bg-zinc-900', 'bg-yellow-500', 'bg-zinc-700', 'bg-sky-400',
        'bg-orange-600', 'bg-emerald-600', 'bg-amber-500', 'bg-purple-600', 'bg-zinc-500'
    ];

    const statsBySystem = fluidSystems.map(sys => {
        const vol = pits.filter(p => p.type === sys.id).reduce((acc, p) => acc + (parseFloat(p.vol) || 0), 0);
        const cap = pits.filter(p => p.type === sys.id).reduce((acc, p) => acc + (parseFloat(p.maxVol) || 0), 0);
        return { ...sys, vol, cap };
    });

    return (
        <div className="animate-fade-in space-y-4 pb-32 select-none" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
            {/* Simplified Header */}
            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex bg-zinc-100 dark:bg-slate-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <button onClick={() => setUnitMode('field')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${unitMode === 'field' ? 'bg-halliburton-red text-white' : 'text-zinc-500'}`}>ppg</button>
                            <button onClick={() => setUnitMode('metric')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${unitMode === 'metric' ? 'bg-halliburton-red text-white' : 'text-zinc-500'}`}>g/L</button>
                        </div>
                        <button onClick={() => setIsConfiguringFluids(!isConfiguringFluids)} className="bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors">
                            <Icon name="sliders" size={14} /> {isConfiguringFluids ? 'Cerrar' : 'Config. Fluidos'}
                        </button>

                        <button
                            onClick={historyPits ? undoReorder : reorderPits}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm border transition-all flex items-center gap-2 ${historyPits ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 shadow-lg' : 'bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700'}`}
                        >
                            <Icon name={historyPits ? "mouse-pointer" : "grid"} size={14} />
                            {historyPits ? 'Personalizado' : 'Reordenar'}
                        </button>

                        <button onClick={addPit} className="bg-white dark:bg-slate-800 text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors">
                            <Icon name="plus" size={14} /> Añadir Tanque
                        </button>

                        <button onClick={() => setShowFluidStats(!showFluidStats)} className={`px-6 py-3 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 transition-all transform hover:scale-105 ${showFluidStats ? 'bg-halliburton-red text-white' : 'bg-zinc-900 text-white'}`}>
                            <Icon name="bar-chart-2" size={16} /> Ver Dashboard
                        </button>
                    </div>

                    {/* Summary Integrated */}
                    <div className="flex flex-wrap gap-8 items-center bg-zinc-50 dark:bg-slate-800/50 px-8 py-3 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-inner">
                        {[
                            { label: 'Vol. Total', val: unitMode === 'metric' ? totalVol.toFixed(1) : (totalVol / 0.158987).toFixed(0), unit: unitMode === 'metric' ? 'm³' : 'bbl', color: 'text-halliburton-red' },
                            { label: 'Dens. Media', val: displayDens(avgSG), unit: getDensLabel() },
                            { label: 'Ocupación', val: ((totalVol / (totalMax || 1)) * 100).toFixed(1), unit: '%' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-baseline gap-2">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}:</span>
                                <span className={`text-xl font-black italic ${stat.color || 'dark:text-white text-zinc-800'}`}>{stat.val}</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">{stat.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fluid Volume Dashboard */}
            {showFluidStats && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statsBySystem.map(sys => (
                        <div key={sys.id} className="p-6 bg-zinc-50 dark:bg-slate-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700 flex flex-col gap-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${sys.color}`}></div>
                                <span className="text-sm font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">{sys.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black italic text-zinc-900 dark:text-white">
                                    {unitMode === 'metric' ? sys.vol.toFixed(1) : (sys.vol / 0.158987).toFixed(0)}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">{unitMode === 'metric' ? 'm³' : 'bbl'}</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full ${sys.color}`} style={{ width: `${Math.min((sys.vol / (sys.cap || 1)) * 100, 100)}%` }}></div>
                            </div>
                            <span className="text-[9px] font-black text-zinc-400 uppercase">Cap: {unitMode === 'metric' ? sys.cap.toFixed(1) : (sys.cap / 0.158987).toFixed(0)} {unitMode === 'metric' ? 'm³' : 'bbl'}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Fluid Config Panel */}
            {isConfiguringFluids && (
                <div className="bg-zinc-100 dark:bg-slate-950 p-8 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 animate-fade-in shadow-inner">
                    <div className="flex flex-wrap gap-4">
                        {fluidSystems.map(sys => (
                            <div key={sys.id} className="bg-white dark:bg-slate-900 p-3 pl-5 rounded-2xl flex items-center gap-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                <div className="relative group/color">
                                    <div className={`w-8 h-8 rounded-xl ${sys.color} shadow-inner`}></div>
                                    <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover/color:opacity-100 flex flex-wrap gap-1 p-1 bg-white shadow-2xl rounded-xl z-50 transition-opacity">
                                        {availableColors.map(c => <button key={c} onClick={() => updateFluidSystem(sys.id, 'color', c)} className={`w-3 h-3 ${c} rounded-sm`}></button>)}
                                    </div>
                                </div>
                                <input value={sys.label} onChange={e => updateFluidSystem(sys.id, 'label', e.target.value)} className="bg-transparent border-none text-[12px] font-black uppercase w-24 focus:ring-0 text-zinc-800 dark:text-zinc-100" />
                                <button onClick={() => deleteFluidSystem(sys.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Icon name="x" size={18} /></button>
                            </div>
                        ))}
                        <button onClick={addFluidSystem} className="text-xs font-black text-halliburton-red hover:text-red-700 flex items-center gap-2 p-4 transition-colors"><Icon name="plus-circle" size={20} /> Nuevo Sistema</button>
                    </div>
                </div>
            )}

            {/* FREE LAYOUT CANVAS */}
            <div className="w-full overflow-x-auto custom-scrollbar no-scrollbar-at-rest rounded-[4rem]">
                <div
                    id="piletas-canvas"
                    onMouseDown={(e) => handleMouseDown(e)}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={(e) => handleMouseDown(e)}
                    className="relative bg-zinc-50 dark:bg-slate-950/40 rounded-[4rem] border-2 border-zinc-100 dark:border-zinc-800 min-h-[1200px] shadow-inner p-10 mb-20 overflow-visible"
                    style={{ cursor: (draggingPitId || resizingPitId) ? (resizingPitId ? 'se-resize' : 'grabbing') : 'default' }}
                >
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#52525b 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>

                    {/* Selection Box Overlay */}
                    {selectionBox && (
                        <div
                            className="absolute bg-blue-500/10 border border-blue-500/50 z-[100] pointer-events-none rounded-sm"
                            style={{
                                left: selectionBox.x - (document.getElementById('piletas-canvas')?.getBoundingClientRect().left || 0),
                                top: selectionBox.y - (document.getElementById('piletas-canvas')?.getBoundingClientRect().top || 0),
                                width: selectionBox.w,
                                height: selectionBox.h
                            }}
                        />
                    )}

                {pits.map(p => {
                    const isSelected = selectedIds.includes(p.id);
                    const curMax = parseFloat(p.maxVol) || 1;
                    const curVol = parseFloat(p.vol) || 0;
                    const fillPct = Math.min((curVol / curMax) * 100, 100);
                    const currentType = fluidSystems.find(t => t.id === p.type) || fluidSystems[0];

                    const baseW = 130;
                    const baseH = 220;
                    const wScale = p.w / baseW;
                    const hScale = p.h / baseH;
                    const globalScale = Math.min(wScale, hScale, 1.3);
                    const innerH = p.h;

                    return (
                        <div
                            key={p.id}
                            id={`pit-${p.id}`}
                            onMouseDown={(e) => handleMouseDown(e, p.id)}
                            onTouchStart={(e) => handleMouseDown(e, p.id)}
                            className={`absolute ${isSelected ? 'ring-4 ring-blue-500/30 rounded-[22px]' : ''}`}
                            style={{
                                left: `${p.x}px`,
                                top: `${p.y}px`,
                                zIndex: (draggingPitId === p.id || resizingPitId === p.id) ? 1000 : Math.floor(p.w * p.h),
                                transition: (draggingPitId || resizingPitId || selectionBox) ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        >
                            <div
                                className={`relative bg-white dark:bg-slate-900 border-[3px] shadow-2xl group/pit ${isSelected ? 'border-blue-500 shadow-blue-500/20' : 'border-zinc-300 dark:border-slate-700 shadow-black/10'} ${draggingPitId === p.id ? 'shadow-red-500/20' : ''}`}
                                style={{
                                    width: `${p.w + (24 * globalScale)}px`,
                                    padding: `${12 * globalScale}px`,
                                    borderRadius: `${20 * globalScale}px`,
                                    transition: (resizingPitId === p.id) ? 'none' : 'transform 0.2s',
                                    marginTop: '8px'
                                }}
                            >
                                {/* Subtle Clip 'Hook' Drag Handle */}
                                <div className="move-handle absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 bg-zinc-200 dark:bg-slate-700 rounded-t-md border-x border-t border-zinc-300 dark:border-slate-600 flex flex-col gap-0.5 items-center justify-center cursor-grab active:cursor-grabbing shadow-sm z-20 hover:bg-zinc-100 dark:hover:bg-slate-600 transition-colors opacity-80 hover:opacity-100">
                                    <div className="w-5 h-0.5 bg-zinc-400 dark:bg-slate-500 rounded-full"></div>
                                    <div className="w-5 h-0.5 bg-zinc-400 dark:bg-slate-500 rounded-full opacity-30"></div>
                                </div>

                                <div className="flex items-center gap-1 px-1" style={{ marginBottom: `${8 * globalScale}px` }}>
                                    <input
                                        value={p.name}
                                        onChange={e => updatePit(p.id, 'name', e.target.value)}
                                        onKeyDown={handleEnter}
                                        style={{ fontSize: `${Math.max(13, 11 * globalScale)}px`, width: '100%' }}
                                        className="bg-transparent border-none font-black uppercase text-zinc-500 focus:ring-0 truncate italic tracking-wider transition-colors mr-2 text-left p-0"
                                    />
                                </div>

                                <button
                                    onClick={() => deletePit(p.id)}
                                    className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-zinc-400 hover:text-red-500 hover:scale-110 transition-all p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm opacity-0 group-hover/pit:opacity-100 z-50"
                                >
                                    <Icon name="trash-2" size={14} />
                                </button>

                                <div
                                    className="relative bg-zinc-100 dark:bg-slate-800 border-[1.5px] border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col justify-end shadow-inner"
                                    style={{
                                        width: `${p.w}px`,
                                        height: `${p.h}px`,
                                        borderRadius: `${14 * globalScale}px`,
                                        transition: (resizingPitId === p.id) ? 'none' : 'all 0.3s'
                                    }}
                                >
                                    <div
                                        className={`w-full transition-all duration-1000 ease-in-out ${currentType.color} relative pt-1`}
                                        style={{ height: `${fillPct}%` }}
                                    >
                                        <div className="absolute top-0 left-0 right-0 bg-white/20 animate-pulse" style={{ height: `${Math.min(6, 6 * hScale)}px` }}></div>
                                    </div>

                                    {/* Value Overlay */}
                                    <div className={`absolute inset-0 flex flex-col items-center p-2 text-center pointer-events-none ${innerH < 120 ? 'justify-start pt-1' : 'justify-center'}`}>
                                        <div className="flex flex-col items-center pointer-events-auto w-full">
                                            <div className={`flex items-baseline justify-center gap-1 w-full backdrop-blur-[3px] rounded-xl py-1 px-2 border border-white/20 shadow-sm transition-all ${((currentType.color === 'bg-zinc-900' && fillPct > 80) || (currentType.color !== 'bg-zinc-900' && fillPct > 82)) ? 'bg-black/40' : 'bg-black/20 dark:bg-white/10'}`}>
                                                <input
                                                    type="number"
                                                    value={displayVol(p.vol)}
                                                    onChange={e => updatePit(p.id, 'vol', parseVol(e.target.value))}
                                                    onKeyDown={handleEnter}
                                                    style={{
                                                        fontSize: `${Math.max(18, Math.min(32 * globalScale, innerH > 60 ? 32 * globalScale : innerH * 0.5))}px`,
                                                        lineHeight: 1,
                                                        textShadow: ((currentType.color === 'bg-zinc-900' && fillPct > 80) || (currentType.color !== 'bg-zinc-900' && fillPct > 82)) ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                                                    }}
                                                    className={`bg-transparent border-none text-center font-black focus:ring-0 ${((currentType.color === 'bg-zinc-900' && fillPct > 80) || (currentType.color !== 'bg-zinc-900' && fillPct > 82)) ? 'text-white' : 'text-zinc-900 dark:text-white'} w-full transition-colors p-0 outline-none`}
                                                />
                                                {innerH > 75 && (
                                                    <span style={{ fontSize: `${Math.max(12, 11 * globalScale)}px` }}
                                                        className={`font-black uppercase tracking-widest ${((currentType.color === 'bg-zinc-900' && fillPct > 80) || (currentType.color !== 'bg-zinc-900' && fillPct > 82)) ? 'text-white/80' : 'text-zinc-600 dark:text-white/80'}`}>
                                                        {unitMode === 'metric' ? 'm³' : 'bbl'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Details */}
                                    <div className={`absolute bottom-1 inset-x-1 flex justify-between items-center bg-black/60 backdrop-blur-lg border border-white/10 transition-all ${innerH < 65 ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}
                                        style={{ padding: `${3 * globalScale}px ${14 * globalScale}px`, borderRadius: `${10 * globalScale}px` }}>
                                        <div className="flex flex-col items-baseline leading-none">
                                            <span className="font-black text-white/50 uppercase tracking-tighter" style={{ fontSize: `${Math.max(9, 8 * globalScale)}px` }}>{getDensLabel()}</span>
                                            <input
                                                value={displayDens(p.density)}
                                                onChange={e => updatePit(p.id, 'density', parseDens(e.target.value))}
                                                style={{ fontSize: `${Math.max(13, 11 * globalScale)}px`, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                                className="w-12 bg-transparent border-none font-bold text-white p-0 focus:ring-0 leading-none outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col items-end leading-none">
                                            <span className="font-black text-white/50 uppercase tracking-tighter" style={{ fontSize: `${Math.max(9, 8 * globalScale)}px` }}>CAP</span>
                                            <input
                                                value={displayVol(p.maxVol)}
                                                onChange={e => updatePit(p.id, 'maxVol', parseVol(e.target.value))}
                                                style={{ fontSize: `${Math.max(13, 11 * globalScale)}px`, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                                className="w-12 bg-transparent border-none font-bold text-right text-white p-0 focus:ring-0 leading-none outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* High-Contrast Fluid Selector */}
                                <div className="relative" style={{ marginTop: `${8 * globalScale}px` }}>
                                    <select
                                        value={p.type}
                                        onChange={e => updatePit(p.id, 'type', e.target.value)}
                                        style={{
                                            fontSize: `${Math.max(12, 9 * globalScale)}px`,
                                            padding: `${6 * globalScale}px ${24 * globalScale}px ${6 * globalScale}px ${10 * globalScale}px`,
                                            borderRadius: `${10 * globalScale}px`
                                        }}
                                        className="w-full bg-zinc-50 dark:bg-slate-800/80 border border-zinc-200 dark:border-zinc-700 font-black uppercase text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-halliburton-red/30 transition-all appearance-none cursor-pointer shadow-sm hover:bg-white dark:hover:bg-slate-700"
                                    >
                                        {fluidSystems.map(fs => (
                                            <option key={fs.id} value={fs.id} className="bg-white dark:bg-slate-900 text-zinc-900 dark:text-white">{fs.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500">
                                        <Icon name="chevron-down" size={Math.max(12, 10 * globalScale)} />
                                    </div>
                                </div>

                                {/* Resize Handle */}
                                <div className="resize-handle absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-600 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center cursor-se-resize shadow-lg opacity-0 group-hover/pit:opacity-100 transition-all z-50 hover:bg-halliburton-red hover:scale-110">
                                    <Icon name="maximize-2" size={14} className="text-white rotate-90" />
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
};

export default PiletasSystem;
