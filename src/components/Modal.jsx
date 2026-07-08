import React, { useState } from 'react';
import Icon from './Icon';
import AccurisGuideModal from './AccurisGuideModal';
import PayslipWarningModal from './PayslipWarningModal';

const Modal = ({ showModal, setShowModal, modalData, addSector, addSubsector, addLink, updateItem, lang }) => {
  if (!showModal) return null;
  
  if (showModal === 'accuris-guide') {
    return <AccurisGuideModal setShowModal={setShowModal} lang={lang} />;
  }

  if (showModal === 'payslip-warning') {
    return <PayslipWarningModal setShowModal={setShowModal} modalData={modalData} lang={lang} />;
  }
  
  const [form, setForm] = useState({
    name: modalData.name || '',
    url: modalData.url || '',
    icon: modalData.icon || 'folder'
  });

  const submit = (e) => {
    e.preventDefault();
    if (showModal === 'add-sector') addSector(form.name, form.icon);
    if (showModal === 'add-subsector') addSubsector(modalData.sid, form.name);
    if (showModal === 'add-link') addLink(modalData.sid, modalData.subsid, form.name, form.url);
    if (showModal === 'edit-item') updateItem(modalData.type, modalData.id, form.name, form.url, form.icon);
  };

  const isEn = lang === 'en';
  const labelManage = isEn ? "Manage Element" : "Gestionar Elemento";
  const labelName = isEn ? "Name" : "Nombre";
  const labelSave = isEn ? "Save Changes" : "Guardar Cambios";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-12 rounded-[3.5rem] shadow-2xl relative border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setShowModal(null)}
          className="absolute top-10 right-10 text-zinc-400 hover:text-halliburton-red transition-colors"
        >
          <Icon name="x" size={28} />
        </button>
        <h3 className="text-3xl font-black text-zinc-800 dark:text-white uppercase italic mb-10 tracking-tighter">
          {labelManage}
        </h3>
        <form onSubmit={submit} className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-halliburton-red uppercase tracking-widest mb-3 block">{labelName}</label>
            <input
              type="text"
              required
              className="w-full input-style"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {(showModal === 'add-link' || (showModal === 'edit-item' && modalData.type === 'link')) && (
            <div>
              <label className="text-[10px] font-black text-halliburton-red uppercase tracking-widest mb-3 block italic">URL</label>
              <input
                type="url"
                required
                className="w-full input-style"
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full btn-primary py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl"
          >
            {labelSave}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
