import React, { useState } from 'react';
import Icon from './Icon';

const AccurisGuideModal = ({ setShowModal }) => {
  const [activeTab, setActiveTab] = useState('fase1'); // 'fase1' or 'fase2'
  const accurisUrl = "https://login.ihserc.com/login/ihslogin?username=HALLIHO101&loginCode=DISP_MENU";

  const handleOpenPortal = () => {
    window.open(accurisUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setShowModal(null)}></div>

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden flex flex-col max-h-[90vh] animate-modal-in">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-halliburton-red to-[#a30000] p-8 sm:p-10 text-white relative shrink-0">
          <button
            onClick={() => setShowModal(null)}
            className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-black/10 hover:bg-black/20 text-white/80 hover:text-white p-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
            title="Cerrar instructivo"
          >
            <Icon name="x" size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Icon name="book-open" size={24} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Biblioteca Técnica Baroid</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter leading-tight">
            Acceso y Consulta de Normas API
          </h3>
          <p className="text-xs text-white/80 font-bold uppercase tracking-wide mt-2">
            Guía paso a paso para la consulta de normas <span className="text-yellow-300">API RP 13B-1</span> y <span className="text-yellow-300">13B-2</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-slate-950/20 px-8 py-4 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('fase1')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === 'fase1'
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700 hover:border-halliburton-red'
            }`}
          >
            <Icon name="compass" size={14} />
            Fase 1: HalWorld
          </button>
          <button
            onClick={() => setActiveTab('fase2')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === 'fase2'
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700 hover:border-halliburton-red'
            }`}
          >
            <Icon name="key" size={14} />
            Fase 2: Accuris
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar space-y-8">
          
          {activeTab === 'fase1' ? (
            <div className="space-y-6 animate-fade-in">
              <h4 className="text-xs font-black text-halliburton-red uppercase tracking-[0.2em] italic mb-2">
                Navegación Inicial en HalWorld
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    step: "Paso 1",
                    title: "Ingresar a HalWorld",
                    desc: "Entra a la pantalla principal de HalWorld, ve al menú superior de navegación y haz clic en la sección Support Services.",
                    badge: "SUPPORT SERVICES",
                    icon: "home"
                  },
                  {
                    step: "Paso 2",
                    title: "Seleccionar Technology",
                    desc: "Dentro del menú desplegado de Support Services, busca en el listado de soporte interno y haz clic en la opción Technology.",
                    badge: "TECHNOLOGY",
                    icon: "cpu"
                  },
                  {
                    step: "Paso 3",
                    title: "Ingresar a Library",
                    desc: "En el panel de navegación lateral izquierdo de la pantalla de Technology, selecciona la opción Library para abrir la biblioteca corporativa.",
                    badge: "LIBRARY",
                    icon: "folder-open"
                  },
                  {
                    step: "Paso 4",
                    title: "Standards and Specifications",
                    desc: "Dentro del menú de la Halliburton Library, haz clic sobre Standards and Specifications. Esto iniciará tu redirección automática al portal externo.",
                    badge: "ACCURIS REDIRECT",
                    icon: "external-link"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 bg-zinc-50/50 dark:bg-slate-800/20 border border-zinc-100 dark:border-zinc-800/60 rounded-3xl flex gap-4 hover-glow transition-all">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-halliburton-red shrink-0">
                      <Icon name={item.icon} size={18} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-halliburton-red bg-red-100/50 dark:bg-red-950/40 px-2 py-0.5 rounded-md uppercase">{item.step}</span>
                        <h5 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">{item.title}</h5>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                      <div className="inline-block bg-zinc-100 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-0.5 text-[8px] font-mono font-black text-zinc-400 tracking-wider">
                        {item.badge}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <h4 className="text-xs font-black text-halliburton-red uppercase tracking-[0.2em] italic mb-2">
                Autenticación y Consulta en Accuris
              </h4>

              <div className="space-y-4">
                {/* Step 5 */}
                <div className="p-6 bg-zinc-50/50 dark:bg-slate-800/20 border border-zinc-100 dark:border-zinc-800/60 rounded-3xl space-y-4 hover-glow transition-all">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-halliburton-red shrink-0">
                      <Icon name="user" size={18} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-halliburton-red bg-red-100/50 dark:bg-red-950/40 px-2 py-0.5 rounded-md uppercase">Paso 5</span>
                        <h5 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">Iniciar Sesión con Credenciales Personales</h5>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        En la plataforma de <strong>Accuris</strong>, ingresa tu correo corporativo de Halliburton para iniciar sesión o crear tu cuenta individual.
                      </p>
                    </div>
                  </div>
                  
                  {/* Critical Warning Alert */}
                  <div className="p-5 bg-red-50/50 dark:bg-red-950/10 border-l-4 border-halliburton-red rounded-r-2xl text-[10px] leading-relaxed text-red-800 dark:text-red-300 font-bold uppercase tracking-wider flex items-start gap-3">
                    <Icon name="alert-triangle" size={16} className="text-halliburton-red shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black">Control de Cumplimiento Obligatorio:</span> El acceso debe ser estrictamente individual y trazable; está estrictamente prohibido utilizar usuarios o credenciales compartidas para la consulta de estándares.
                    </div>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="p-6 bg-zinc-50/50 dark:bg-slate-800/20 border border-zinc-100 dark:border-zinc-800/60 rounded-3xl flex gap-4 hover-glow transition-all">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-halliburton-red shrink-0">
                    <Icon name="sliders" size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-halliburton-red bg-red-100/50 dark:bg-red-950/40 px-2 py-0.5 rounded-md uppercase">Paso 6</span>
                      <h5 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">Configurar Ubicación y Servicio</h5>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Selecciona la categoría/ubicación geográfica correspondiente para habilitar los permisos de tu licencia. Luego, haz clic sobre el servicio <strong>Engineering Workbench</strong> y presiona el botón <em>"Continue to Service"</em>.
                    </p>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="p-6 bg-zinc-50/50 dark:bg-slate-800/20 border border-zinc-100 dark:border-zinc-800/60 rounded-3xl flex gap-4 hover-glow transition-all">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-halliburton-red shrink-0">
                    <Icon name="search" size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-halliburton-red bg-red-100/50 dark:bg-red-950/40 px-2 py-0.5 rounded-md uppercase">Paso 7</span>
                      <h5 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">Buscar y Descargar la Norma</h5>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Una vez dentro de <strong>Engineering Workbench</strong>, escribe el código exacto de la norma en la barra de búsqueda superior (ej: <code>API RP 13B-1</code> o <code>API RP 13B-2</code>). Selecciona el documento de la lista de resultados para abrirlo o guardarlo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Consultation Recommendations Box */}
          <div className="p-6 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 rounded-[2rem] flex items-start gap-4">
            <div className="p-2.5 bg-blue-500 text-white rounded-xl shrink-0">
              <Icon name="info" size={16} />
            </div>
            <div className="space-y-1">
              <h5 className="text-xs font-black uppercase text-blue-800 dark:text-blue-300 tracking-wider">Recomendaciones para la Búsqueda</h5>
              <p className="text-xs leading-relaxed text-blue-900/80 dark:text-blue-300/80 font-semibold">
                Para optimizar los resultados del motor de búsqueda de Accuris, escribe la codificación exacta de la norma. El sistema te dará acceso directo a las versiones vigentes, tales como <span className="underline decoration-wavy">API RP 13B-1 6th Ed. 2026</span> o <span className="underline decoration-wavy">API RP 13B-2 5th Ed. 2014</span>.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
          <button
            onClick={() => setShowModal(null)}
            className="w-full sm:w-auto px-8 py-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[10px] font-black uppercase tracking-widest transition-colors text-center"
          >
            Cerrar Instructivo
          </button>
          
          <button
            onClick={handleOpenPortal}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all hover:bg-halliburton-red hover:text-white dark:hover:bg-halliburton-red dark:hover:text-white hover:shadow-red-900/10"
          >
            Ir al Portal de Accuris
            <Icon name="external-link" size={12} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AccurisGuideModal;
