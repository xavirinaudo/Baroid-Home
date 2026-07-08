import React from 'react';
import Icon from './Icon';

import { translations } from '../data/translations';

const PayslipWarningModal = ({ setShowModal, modalData, lang }) => {
  const t = translations[lang || 'es'] || translations.es;
  
  const handleConfirm = () => {
    window.open(modalData.url, '_blank', 'noopener,noreferrer');
    setShowModal(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setShowModal(null)}></div>

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden flex flex-col animate-modal-in">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-halliburton-red to-[#a30000] p-6 sm:p-8 text-white relative shrink-0">
          <button
            onClick={() => setShowModal(null)}
            className="absolute top-6 right-6 bg-black/10 hover:bg-black/20 text-white/80 hover:text-white p-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
            title={lang === 'es' ? "Cerrar" : "Close"}
          >
            <Icon name="x" size={16} />
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Icon name="alert-triangle" size={20} className="text-white" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70">{lang === 'es' ? 'Aviso Importante' : 'Important Notice'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter leading-tight">
            {t.payslipTitle}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-5 bg-zinc-50/50 dark:bg-slate-800/20 border border-zinc-100 dark:border-zinc-800/60 rounded-3xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
            <p className="mb-2">
              {t.payslipWarning}
            </p>
            <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-2xl text-xs leading-relaxed text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wide flex items-start gap-3 mt-4">
              <Icon name="info" size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                {lang === 'es' ? (
                  <>Recorda que si la pantalla permanece en blanco tenés que apretar la tecla <span className="underline decoration-wavy">Shift + F5</span> para recargar la página.</>
                ) : (
                  <>Remember that if the screen remains blank, you must press <span className="underline decoration-wavy">Shift + F5</span> to reload the page.</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-slate-950/20 flex gap-3 justify-end items-center shrink-0">
          <button
            onClick={() => setShowModal(null)}
            className="px-5 py-3 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[10px] font-black uppercase tracking-widest transition-colors text-center"
          >
            {t.payslipCancel}
          </button>
          
          <button
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all hover:bg-halliburton-red hover:text-white dark:hover:bg-halliburton-red dark:hover:text-white"
          >
            {t.payslipAccept}
            <Icon name="external-link" size={12} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PayslipWarningModal;
