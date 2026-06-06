import React from 'react';
import Icon from './Icon';

const Sidebar = ({
  sectors,
  setActiveSector,
  activeSector,
  searchQuery,
  setSearchQuery,
  isEditing,
  setIsEditing,
  darkMode,
  setDarkMode,
  resetToDefaults,
  exportData,
  importData,
  fileInputRef,
  searchInputRef,
  notes,
  setNotes,
  favorites,
  deleteItem,
  setShowModal,
  setModalData,
  cardSize,
  setCardSize,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen
}) => {
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 w-80 sidebar-bg h-screen flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-halliburton-red rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/30">
            <Icon name="activity" size={24} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-black tracking-tighter text-zinc-800 dark:text-white uppercase italic truncate">Baroid Hub</h1>
            <span className="text-[9px] font-bold text-halliburton-red uppercase tracking-[0.3em] truncate block">Field Operations</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden p-2 text-zinc-400 hover:text-halliburton-red transition-colors"
          title="Cerrar Menú"
        >
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="px-6 mb-8 group">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar herramienta... (/)"
            className="w-full bg-zinc-50 dark:bg-slate-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest placeholder-zinc-400 focus:border-halliburton-red outline-none transition-all shadow-sm group-hover:shadow-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Icon name="search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-halliburton-red transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-1 pb-10">
        <button
          onClick={() => { setActiveSector('favorites'); setSearchQuery(''); setIsMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-slate-800/50 ${activeSector === 'favorites' && !searchQuery ? 'sidebar-item-active shadow-lg' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <Icon name="heart" size={18} />
          <span className="truncate">Mis Favoritos</span>
          {favorites.length > 0 && (
            <span className="ml-auto bg-zinc-100 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded-full font-black">
              {favorites.length}
            </span>
          )}
        </button>

        <div className="my-6 px-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Cálculos & Operaciones</span>
        </div>

        <button
          onClick={() => { setActiveSector('calculator'); setSearchQuery(''); setIsMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-slate-800/50 ${activeSector === 'calculator' && !searchQuery ? 'sidebar-item-active shadow-lg' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <Icon name="calculator" size={18} />
          <span className="truncate">Calculadora Fluidos</span>
        </button>

        <button
          onClick={() => { setActiveSector('inventory'); setSearchQuery(''); setIsMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-slate-800/50 ${activeSector === 'inventory' && !searchQuery ? 'sidebar-item-active shadow-lg' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <Icon name="clipboard-check" size={18} />
          <span className="truncate">Conciliación Inventario</span>
        </button>

        <button
          onClick={() => { setActiveSector('piletas'); setSearchQuery(''); setIsMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-slate-800/50 ${activeSector === 'piletas' && !searchQuery ? 'sidebar-item-active shadow-lg' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <Icon name="layout" size={18} />
          <span className="truncate">Sistema de Piletas</span>
        </button>

        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-4 mx-4"></div>
        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] ml-4 mb-2">SECTORES</p>
        
        {sectors.map(sec => (
          <div key={sec.id} className="group relative">
            <button
              onClick={() => { setActiveSector(sec.id); setSearchQuery(''); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-semibold transition-all hover:bg-zinc-50 dark:hover:bg-slate-800/50 ${activeSector === sec.id && !searchQuery ? 'sidebar-item-active' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              <Icon name={sec.icon} size={18} style={{ color: (activeSector === sec.id && !searchQuery) ? '#CC0000' : '#8E979D' }} />
              <span className="truncate">{sec.name}</span>
            </button>
            {isEditing && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 scale-90">
                <button
                  onClick={() => { setModalData({ type: 'sector', id: sec.id, name: sec.name, icon: sec.icon }); setShowModal('edit-item'); }}
                  className="p-2 text-zinc-400 hover:text-halliburton-red transition-colors"
                >
                  <Icon name="edit-2" size={14} />
                </button>
                <button
                  onClick={() => deleteItem('sector', sec.id)}
                  className="p-2 text-zinc-400 hover:text-halliburton-red transition-colors"
                >
                  <Icon name="trash-2" size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3 bg-white dark:bg-transparent">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-halliburton-red text-white' : 'bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-slate-700'}`}
        >
          <Icon name={isEditing ? "check" : "settings"} size={14} /> {isEditing ? "Finalizar" : "Gestionar App"}
        </button>
        {isEditing && (
          <>
            <button
              onClick={exportData}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-slate-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-700 border border-zinc-200 dark:border-zinc-800"
            >
              <Icon name="download" size={12} /> Descargar Back Up
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-slate-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-700 border border-zinc-200 dark:border-zinc-800"
            >
              <Icon name="upload" size={12} /> Importar Back Up
            </button>
            <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
            <button
              onClick={resetToDefaults}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-slate-800/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/30"
            >
              <Icon name="rotate-ccw" size={12} /> Restablecer Original
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
