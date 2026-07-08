import React from 'react';
import Icon from './Icon';

const UpdateModal = ({ isOpen, onClose, onUpdate, updateInfo, lang }) => {
  if (!isOpen) return null;

  const isEn = lang === 'en';
  const title = isEn ? "New Update Available" : "Nueva Actualización Disponible";
  const desc = isEn 
    ? "A new version of Baroid Hub has been published. Update now to access new links, tools, and bug fixes." 
    : "Se ha publicado una nueva versión de Baroid Hub. Actualiza ahora para acceder a nuevos enlaces, herramientas y corrección de errores.";
  const note = isEn
    ? "Your local data (Mud Pits, Inventory, and Fluid Calculations) will NOT be lost during this update."
    : "Tus datos locales (Sistema de Piletas, Inventario y Calculadora de Fluidos) NO se perderán con esta actualización.";
  const btnUpdate = isEn ? "Update Now" : "Actualizar Ahora";
  const btnLater = isEn ? "Later" : "Más tarde";

  const releaseNotes = updateInfo 
    ? (isEn ? updateInfo.description_en : updateInfo.description) 
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden flex flex-col animate-modal-in">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-halliburton-red to-[#a30000] p-6 sm:p-8 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 bg-black/10 hover:bg-black/20 text-white/80 hover:text-white p-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
            title={isEn ? "Close" : "Cerrar"}
          >
            <Icon name="x" size={16} />
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Icon name="sparkles" size={20} className="text-white" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70">
              {isEn ? 'System Update' : 'Actualización de Sistema'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter leading-tight">
            {title}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
          <div className="space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
              {desc}
            </p>

            {updateInfo && (
              <div className="p-4 bg-zinc-50 dark:bg-slate-800/40 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2">
                  {isEn ? `VERSION ${updateInfo.version} (${updateInfo.releaseDate})` : `VERSIÓN ${updateInfo.version} (${updateInfo.releaseDate})`}
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed">
                  {releaseNotes || (isEn ? "Stability improvements and general fixes." : "Mejoras de estabilidad y correcciones generales.")}
                </p>
              </div>
            )}

            <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-2xl text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wide flex items-start gap-3 mt-4">
              <Icon name="shield-check" size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                {note}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-slate-950/20 flex gap-3 justify-end items-center shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-3 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[10px] font-black uppercase tracking-widest transition-colors text-center"
          >
            {btnLater}
          </button>
          
          <button
            onClick={onUpdate}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all hover:bg-halliburton-red hover:text-white dark:hover:bg-halliburton-red dark:hover:text-white"
          >
            {btnUpdate}
            <Icon name="refresh-cw" size={12} className="animate-spin" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdateModal;
