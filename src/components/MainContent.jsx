import React from 'react';
import Icon from './Icon';
import GreetingDashboard from './GreetingDashboard';
import FluidCalculator from './FluidCalculator';
import InventoryConciliation from './InventoryConciliation';
import PiletasSystem from './PiletasSystem';

const getDisplayUrl = (url) => {
    try {
        if (url.startsWith('http')) {
            return new URL(url).hostname.replace('www.', '');
        }
        return url;
    } catch (e) {
        return url;
    }
};

const MainContent = ({
    displaySectors,
    activeSector,
    searchQuery,
    sectors,
    isEditing,
    setShowModal,
    setModalData,
    deleteItem,
    trackLinkClick,
    toggleFavorite,
    cardSize,
    setCardSize,
    darkMode,
    setDarkMode,
    addLink,
    setIsMobileSidebarOpen
}) => {
    return (
        <main className="flex-1 min-h-screen p-4 md:p-8 lg:p-12 overflow-x-hidden relative text-left">
            {/* Mobile Header Bar */}
            <div className="flex lg:hidden items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-3 bg-zinc-50 dark:bg-slate-800 rounded-2xl text-zinc-500 dark:text-zinc-300 hover:text-halliburton-red hover:scale-105 active:scale-95 transition-transform"
                        title="Abrir Menú"
                    >
                        <Icon name="menu" size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-halliburton-red rounded-xl flex items-center justify-center shadow-md">
                            <Icon name="activity" size={16} className="text-white" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-white italic">Baroid Hub</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCardSize(cardSize === 'large' ? 'small' : 'large')}
                        className="p-2.5 bg-zinc-50 dark:bg-slate-800 rounded-xl text-zinc-500 dark:text-zinc-400"
                        title="Cambiar Vista"
                    >
                        <Icon name={cardSize === 'large' ? "grid-3x3" : "layout-grid"} size={16} />
                    </button>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2.5 bg-zinc-50 dark:bg-slate-800 rounded-xl text-zinc-500 dark:text-zinc-400"
                        title={darkMode ? "Modo Claro" : "Modo Oscuro"}
                    >
                        <Icon name={darkMode ? "sun" : "moon"} size={16} />
                    </button>
                </div>
            </div>

            {/* Top Controls Overlay (Desktop only) */}
            <div className="hidden lg:flex absolute top-8 right-12 z-40 items-center gap-4">
                <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <button
                        onClick={() => setCardSize('large')}
                        className={`p-2.5 rounded-xl transition-all ${cardSize === 'large' ? 'bg-halliburton-red text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        title="Vista Grande"
                    >
                        <Icon name="layout-grid" size={20} />
                    </button>
                    <button
                        onClick={() => setCardSize('small')}
                        className={`p-2.5 rounded-xl transition-all ${cardSize === 'small' ? 'bg-halliburton-red text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        title="Vista Compacta"
                    >
                        <Icon name="grid-3x3" size={20} />
                    </button>
                </div>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-zinc-500 dark:text-zinc-400 hover:scale-105 transition-all"
                    title={darkMode ? "Modo Claro" : "Modo Oscuro"}
                >
                    <Icon name={darkMode ? "sun" : "moon"} size={22} />
                </button>
            </div>

            <div className={cardSize === 'small' ? "max-w-[1400px] mx-auto" : "max-w-6xl mx-auto"}>
                <header className="mb-10 lg:mb-14">
                    {(!searchQuery && activeSector !== 'favorites' && activeSector !== 'calculator' && activeSector !== 'inventory' && activeSector !== 'piletas') && <GreetingDashboard />}
                    <div className="space-y-3 lg:space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-halliburton-red rounded-full"></div>
                            <span className="text-[12px] font-bold text-halliburton-red uppercase tracking-widest">
                                {activeSector === 'favorites' ? 'Acceso Rápido' : (activeSector === 'calculator' ? 'Ingeniería' : (activeSector === 'inventory' ? 'Auditoría' : (activeSector === 'piletas' ? 'Volumen Activo' : (sectors.find(s => s.id === activeSector)?.name || 'Explorar'))))}
                            </span>
                        </div>
                        <h2 className="text-3xl lg:text-5xl font-black uppercase italic leading-none tracking-tighter text-zinc-800 dark:text-white truncate">
                            {activeSector === 'favorites' ? 'Mis Favoritos' : (activeSector === 'calculator' ? 'Calculadora de Fluidos' : (activeSector === 'inventory' ? 'Conciliación de Inventario' : (activeSector === 'piletas' ? 'Sistema de Piletas' : (sectors.find(s => s.id === activeSector)?.name || 'Directorio'))))}
                        </h2>
                    </div>
                </header>
                <div className="space-y-20">
                    {activeSector === 'calculator' ? <FluidCalculator isEditing={isEditing} /> :
                        activeSector === 'inventory' ? <InventoryConciliation isEditing={isEditing} /> :
                            activeSector === 'piletas' ? <PiletasSystem isEditing={isEditing} /> :
                                displaySectors.map(sec => (
                                    <div key={sec.id} className="space-y-10 animate-fade-in">

                                        {sec.subsectors.map(sub => (
                                            <section key={sub.id} className="group/sub">
                                                <div className="flex items-center justify-between mb-8 border-b-2 border-zinc-100 dark:border-zinc-800 pb-4">
                                                    <h3 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-200 uppercase italic flex items-center gap-3 tracking-tight">
                                                        {sub.name}
                                                    </h3>
                                                    {isEditing && activeSector !== 'favorites' && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => { setModalData({ type: 'subsector', id: sub.id, name: sub.name }); setShowModal('edit-item'); }} className="p-2 text-zinc-400 hover:text-halliburton-red transition-colors"><Icon name="edit-2" size={16} /></button>
                                                            <button onClick={() => { setModalData({ sid: sec.id, subsid: sub.id }); setShowModal('add-link'); }} className="px-4 py-2 btn-primary text-[10px] font-extrabold uppercase rounded-lg shadow-sm">+ Nuevo Link</button>
                                                            <button onClick={() => deleteItem('subsector', sec.id, sub.id)} className="p-2 text-zinc-400 hover:text-halliburton-red transition-colors"><Icon name="trash-2" size={16} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                                {sub.layout === 'list' ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {sub.links.map((l, lIdx) => (
                                                            <div key={l.id} className="relative group/list-item card-entrance" style={{ animationDelay: `${lIdx * 0.05}s` }}>
                                                                <a
                                                                    href={l.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => {
                                                                        trackLinkClick(l.id);
                                                                        if (l.id === 'l_soft_accuris') {
                                                                            e.preventDefault();
                                                                            setShowModal('accuris-guide');
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-4 bg-white dark:bg-slate-800/20 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-slate-800/40 transition-all group-hover/list-item:border-halliburton-red/30"
                                                                >
                                                                    <div className="bg-zinc-50 dark:bg-slate-900 p-2.5 rounded-xl group-hover/list-item:bg-red-50 dark:group-hover/list-item:bg-red-900/20 transition-colors">
                                                                        <Icon name="video" size={16} className="text-halliburton-red" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 truncate tracking-tight">{l.name}</h4>
                                                                        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest truncate">{getDisplayUrl(l.url)}</p>
                                                                    </div>
                                                                    <Icon name="external-link" size={14} className="text-zinc-300 dark:text-zinc-700 group-hover/list-item:text-halliburton-red transition-all transform translate-x-2 opacity-0 group-hover/list-item:translate-x-0 group-hover/list-item:opacity-100" />
                                                                </a>
                                                                {isEditing && (
                                                                    <div className="absolute -top-2 -right-2 flex gap-1 z-10 scale-75 opacity-0 group-hover/list-item:opacity-100 transition-opacity">
                                                                        <button onClick={() => { setModalData({ type: 'link', id: l.id, name: l.name, url: l.url }); setShowModal('edit-item'); }} className="bg-white dark:bg-slate-800 p-2 rounded-full text-zinc-400 hover:text-halliburton-red shadow-lg border border-zinc-100 dark:border-zinc-800"><Icon name="edit-3" size={12} /></button>
                                                                        <button onClick={() => deleteItem('link', sec.id, sub.id, l.id)} className="bg-halliburton-red p-2 rounded-full text-white shadow-lg"><Icon name="x" size={12} /></button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className={cardSize === 'small'
                                                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                                                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                                    }>
                                                        {sub.links.map((l, lIdx) => (
                                                            <div key={l.id} className="relative group/card card-entrance" style={{ animationDelay: `${lIdx * 0.1}s` }}>
                                                                <a href={l.url} target="_blank" rel="noopener noreferrer" onClick={(e) => {
                                                                    trackLinkClick(l.id);
                                                                    if (l.id === 'l_soft_accuris') {
                                                                        e.preventDefault();
                                                                        setShowModal('accuris-guide');
                                                                    }
                                                                }} className={`block bg-white dark:bg-slate-800/40 border border-zinc-100 dark:border-zinc-800 card-shadow hover-glow h-full overflow-hidden relative ${cardSize === 'small' ? 'p-5 rounded-3xl' : 'p-8 rounded-[2.5rem]'}`}>
                                                                    <div className={`flex items-center justify-between ${cardSize === 'small' ? 'mb-4' : 'mb-6'}`}>
                                                                        <div className={`bg-zinc-50 dark:bg-slate-900 group-hover/card:bg-red-50 dark:group-hover/card:bg-red-900/20 transition-all duration-500 group-hover/card:rotate-[5deg] ${cardSize === 'small' ? 'p-3 rounded-xl' : 'p-4 rounded-2xl'}`}>
                                                                            <Icon name="file-text" size={24} className="text-halliburton-red" />
                                                                        </div>
                                                                        <div className="flex gap-2 items-center">
                                                                            {l.lastUsed && <span className="text-[9px] font-extrabold text-halliburton-red bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md uppercase italic animate-pulse">Reciente</span>}
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    toggleFavorite(l.id);
                                                                                    const btn = e.currentTarget;
                                                                                    btn.classList.add('animate-heart-pop');
                                                                                    setTimeout(() => btn.classList.remove('animate-heart-pop'), 500);
                                                                                }}
                                                                                className="p-2 text-zinc-300 dark:text-zinc-700 hover:scale-125 transition-all duration-300 active:scale-95"
                                                                            >
                                                                                <Icon name="heart" size={22} className={l.isFavorite ? "favorite-active fill-current text-red-500" : "group-hover/card:text-zinc-400"} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <h4 className="text-[17px] font-extrabold text-zinc-800 dark:text-zinc-200 uppercase leading-tight line-clamp-2 title-font tracking-tight group-hover/card:text-halliburton-red transition-colors duration-300" style={{ marginBottom: cardSize === 'small' ? '1rem' : '1.25rem' }}>{l.name}</h4>
                                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                                                                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.1em] truncate mr-2" title={getDisplayUrl(l.url)}>{getDisplayUrl(l.url)}</span>
                                                                        <div className="flex items-center gap-1 text-halliburton-red opacity-0 group-hover/card:opacity-100 transform translate-x-4 group-hover/card:translate-x-0 transition-all duration-500 shrink-0">
                                                                            <span className="text-[9px] font-black uppercase">Abrir</span>
                                                                            <Icon name="arrow-right" size={14} />
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                                {isEditing && (
                                                                    <div className="absolute -top-3 -right-3 flex gap-2 z-10 scale-90">
                                                                        <button onClick={() => { setModalData({ type: 'link', id: l.id, name: l.name, url: l.url }); setShowModal('edit-item'); }} className="bg-white dark:bg-slate-800 p-3 rounded-full text-zinc-400 hover:text-halliburton-red shadow-lg border border-zinc-100 dark:border-zinc-800"><Icon name="edit-3" size={14} /></button>
                                                                        <button onClick={() => deleteItem('link', sec.id, sub.id, l.id)} className="bg-halliburton-red p-3 rounded-full text-white shadow-lg"><Icon name="x" size={14} /></button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>
                                        ))}
                                    </div>
                                ))
                    }
                </div>
            </div>
            <div className="mt-20 pb-8 flex justify-center items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                <div className="w-8 h-[1px] bg-zinc-400"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">creada por Ing. Rinaudo Xavier</span>
                <div className="w-8 h-[1px] bg-zinc-400"></div>
            </div>
        </main>
    );
};

export default MainContent;
