import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { translations, translateText } from '../data/translations';

const FluidFormulation = ({ isEditing, lang }) => {
  const t = translations[lang] || translations['es'];
  const [unitMode, setUnitMode] = useState('field');

  // Fluid Formulation State
  const [formType, setFormType] = useState('obm'); // 'wbm' or 'obm'
  const [formSystem, setFormSystem] = useState({
    volFinal: '1000',
    densFinal: '12.0',
    owrOil: '80',
    owrWater: '20',
    wps: '250000',
    wf: '0.8256',
    saltConc: '99.4',
    sgBrine: '1.18900',
    sgOil: '0.84',
    sgWeight: '4.20',
    wbmD1: '12.5',
    wbmD2: '8.33',
    wbmV1: '400',
    wbmV2: '500',
    wbmMode: 'weights' // 'weights' or 'blend'
  });

  const [obmAdditives, setObmAdditives] = useState([
    { id: '1', name: 'GELTONE II (Clay)', sg: '1.70', concentration: '6.0', packageSize: '50' },
    { id: '2', name: 'EZ MUL (Emulsifier)', sg: '0.98', concentration: '8.0', packageSize: '400' },
    { id: '3', name: 'LIME (Alkalinity)', sg: '2.20', concentration: '4.0', packageSize: '50' }
  ]);

  const [wbmAdditives, setWbmAdditives] = useState([
    { id: '1', name: 'AQUAGEL (Bentonite)', sg: '2.60', concentration: '15.0', packageSize: '100' },
    { id: '2', name: 'BARAZAN D (Xanthan)', sg: '1.50', concentration: '1.5', packageSize: '50' },
    { id: '3', name: 'SODA ASH', sg: '2.50', concentration: '0.5', packageSize: '50' }
  ]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(t.copySuccess || "¡Copiado al portapapeles!");
    });
  };

  const copyFormulationRecipe = (res) => {
    if (!res || res.invalid) return;
    let txt = "";
    const isMetric = unitMode === 'metric';

    if (res.type === 'obm') {
      txt += `=========================================\n`;
      txt += `  RECETA DE FORMULACIÓN OBM (BAROID)\n`;
      txt += `=========================================\n`;
      if (isMetric) {
        txt += `Volumen Final Target: ${res.vf.toFixed(2)} m³\n`;
        txt += `Densidad Final Target: ${res.df.toFixed(2)} SG\n`;
        txt += `Densidad Fase Fluida: ${res.dFaseFluida_sg.toFixed(2)} SG\n\n`;
        txt += `DESGLOSE VOLUMÉTRICO:\n`;
        txt += `- Aceite Base (NAP): ${res.volNap_m3.toFixed(2)} m³\n`;
        txt += `- Agua Dulce: ${res.volWater_m3.toFixed(2)} m³\n`;
        txt += `- Densificante (Barita): ${res.volWM_m3.toFixed(4)} m³\n`;
        txt += `- Volumen Químicos: ${res.fTotal_m3.toFixed(4)} m³\n\n`;
        txt += `RECETA DE MEZCLADO (EMPAQUES):\n`;
        const massNapKg = res.volNap_m3 * 1000 * parseFloat(formSystem.sgOil);
        const massWaterKg = res.volWater_m3 * 1000;
        txt += `- Aceite Base (NAP): ${res.volNap_m3.toFixed(2)} m³ (~${massNapKg.toFixed(0)} kg)\n`;
        txt += `- Agua Dulce: ${res.volWater_m3.toFixed(2)} m³ (~${massWaterKg.toFixed(0)} kg)\n`;
        txt += `- Sal Seca: ${res.massSalt_kg.toFixed(2)} kg (~${res.sacksSalt} sacos de 25 kg)\n`;
        txt += `- Barita: ${res.massWM_kg.toFixed(2)} kg (~${res.sacksWM} sacos de 50 kg)\n`;
        res.finalAdditives.forEach(add => {
          txt += `- ${add.name}: ${add.totalKg.toFixed(2)} kg (~${add.sacks} envases de ${add.pkgSize} kg) [Conc: ${add.concentration} kg/m³]\n`;
        });
      } else {
        txt += `Volumen Final Target: ${res.vf.toFixed(2)} bbl\n`;
        txt += `Densidad Final Target: ${res.df.toFixed(2)} ppg\n`;
        txt += `Densidad Fase Fluida: ${res.dFaseFluida.toFixed(2)} ppg\n\n`;
        txt += `DESGLOSE VOLUMÉTRICO:\n`;
        txt += `- Aceite Base (NAP): ${res.volNap.toFixed(2)} bbl\n`;
        txt += `- Agua Dulce: ${res.volWater.toFixed(2)} bbl\n`;
        txt += `- Densificante (Barita): ${res.volWM.toFixed(4)} bbl\n`;
        txt += `- Volumen Químicos (F_total): ${res.fTotal.toFixed(4)} bbl\n\n`;
        txt += `RECETA DE MEZCLADO (EMPAQUES):\n`;
        txt += `- Aceite Base (NAP): ${res.volNap.toFixed(2)} bbl\n`;
        txt += `- Agua Dulce: ${res.volWater.toFixed(2)} bbl\n`;
        txt += `- Sal Seca: ${res.massSalt.toFixed(2)} lbs (~${res.sacksSalt} sacos de 50 lbs)\n`;
        txt += `- Barita: ${res.massWM.toFixed(2)} lbs (~${res.sacksWM} sacos de 100 lbs)\n`;
        res.finalAdditives.forEach(add => {
          txt += `- ${add.name}: ${add.totalLbs.toFixed(2)} lbs (~${add.sacks} envases de ${add.pkgSize} lbs) [Conc: ${add.concentration} ppb]\n`;
        });
      }
    } else {
      txt += `=========================================\n`;
      txt += `  RECETA DE FORMULACIÓN WBM (BAROID)\n`;
      txt += `=========================================\n`;
      const volUnit = isMetric ? "m³" : "bbl";
      const densUnit = isMetric ? "SG" : "ppg";
      const concUnit = isMetric ? "kg/m³" : "ppb";
      const weightUnit = isMetric ? "kg" : "lbs";
      const pkgUnit = isMetric ? "kg" : "lbs";

      if (res.mode === 'weights') {
        txt += `MODO: Calcular Volúmenes de Mezcla\n`;
        txt += `Volumen Final Target: ${res.vf.toFixed(2)} ${volUnit}\n`;
        txt += `Densidad Final Target: ${res.df.toFixed(2)} ${densUnit}\n\n`;
        txt += `DESGLOSE VOLUMÉTRICO:\n`;
        txt += `- Lodo Base 1 (D1 = ${res.d1.toFixed(2)} ${densUnit}): ${res.v1.toFixed(2)} ${volUnit}\n`;
        txt += `- Diluyente 2 (D2 = ${res.d2.toFixed(2)} ${densUnit}): ${res.v2.toFixed(2)} ${volUnit}\n`;
        txt += `- Volumen Químicos: ${(isMetric ? res.vc_m3 : res.vc).toFixed(4)} ${volUnit}\n\n`;
      } else {
        txt += `MODO: Calcular Blend Final\n`;
        txt += `Volumen Base 1 (V1): ${res.v1.toFixed(2)} ${volUnit} (${res.d1.toFixed(2)} ${densUnit})\n`;
        txt += `Volumen Diluyente 2 (V2): ${res.v2.toFixed(2)} ${volUnit} (${res.d2.toFixed(2)} ${densUnit})\n`;
        txt += `Volumen Final Resultante: ${res.vf.toFixed(2)} ${volUnit}\n`;
        txt += `Densidad Final Resultante: ${res.df.toFixed(2)} ${densUnit}\n\n`;
      }
      txt += `RECETA DE ADITIVOS:\n`;
      res.finalAdditives.forEach(add => {
        const massVal = isMetric ? add.totalKg : add.totalLbs;
        txt += `- ${add.name}: ${massVal.toFixed(2)} ${weightUnit} (~${add.sacks} envases de ${add.pkgSize} ${pkgUnit}) [Conc: ${add.concentration} ${concUnit}]\n`;
      });
    }
    txt += `=========================================\n`;
    copyToClipboard(txt);
  };

  const getFormulationResult = () => {
    // Inputs globales
    const vf_input = parseFloat(formSystem.volFinal) || 0;
    const df_input = parseFloat(formSystem.densFinal) || 0;

    // Convert inputs to field units (bbl, ppg, ppb, lbs) for internal calculation if in metric mode
    let vf = vf_input;
    let df = df_input;
    if (unitMode === 'metric') {
      vf = vf_input * 6.28981; // m³ to bbl
      df = df_input * 8.33;    // SG to ppg
    }
    
    if (formType === 'obm') {
      const owrOil = parseFloat(formSystem.owrOil) || 0;
      const owrWater = parseFloat(formSystem.owrWater) || 0;
      const wps = parseFloat(formSystem.wps) || 0;
      const wf = parseFloat(formSystem.wf) || 0;
      
      let saltConc = parseFloat(formSystem.saltConc) || 0;
      if (unitMode === 'metric') {
        saltConc = saltConc / 2.853; // kg/m³ to ppb
      }

      const sgBrine = parseFloat(formSystem.sgBrine) || 1.189;
      const sgOil = parseFloat(formSystem.sgOil) || 0.84;
      const sgWeight = parseFloat(formSystem.sgWeight) || 4.20;

      const dBrine = sgBrine * 8.345;
      const dNap = sgOil * 8.345;
      const dWm = sgWeight * 8.345;

      if (vf <= 0 || df <= 0 || owrOil + owrWater !== 100) {
        return { invalid: true, msg: lang === 'es' ? 'Ingrese valores válidos (La relación OWR debe sumar 100%).' : 'Enter valid values (OWR ratio must sum to 100%).' };
      }

      // 1. Desplazamiento de Aditivos (ABC Chart)
      let F_total = 0; // bbl
      let G_total = 0; // bbl * ppg
      const abcAdditives = obmAdditives.map(add => {
        const sg = parseFloat(add.sg) || 0;
        let conc = parseFloat(add.concentration) || 0;
        let pkg = parseFloat(add.packageSize) || 50;

        if (unitMode === 'metric') {
          conc = conc / 2.853; // kg/m³ to ppb
          pkg = pkg * 2.20462; // kg to lbs
        }

        const ppgEq = sg * 8.345;
        const ppbEq = ppgEq * 42;
        const totalLbs = conc * vf;
        const volDisp = ppbEq > 0 ? totalLbs / ppbEq : 0;
        const ratio = volDisp * ppgEq;

        F_total += volDisp;
        G_total += ratio;

        return {
          ...add,
          ppgEq,
          ppbEq,
          totalLbs,
          volDisp,
          ratio,
          pkg
        };
      });

      // 2. Densidad de la Fase Fluida
      const dFaseFluida = Math.round(((dNap * owrOil) + (dBrine * owrWater)) / 100 * 100) / 100;

      // 3. Balance de Masa (Densificante)
      if (dWm <= dFaseFluida) {
        return { invalid: true, msg: lang === 'es' ? 'La densidad del densificante debe ser mayor que la de la fase fluida.' : 'Weighting material density must be greater than fluid phase density.' };
      }

      const numerator = (vf * df) - ((vf - F_total) * dFaseFluida) - G_total;
      const denominator = dWm - dFaseFluida;
      const volWM = numerator / denominator; // bbl

      if (volWM < 0 || volWM + F_total > vf) {
        return { invalid: true, isUnfeasible: true, msg: t.formUnfeasible };
      }

      // 4. Desglose Final
      const volFaseFluida = vf - volWM - F_total;
      const volNap = volFaseFluida * (owrOil / 100);
      const volBrine = volFaseFluida * (owrWater / 100);
      
      const volWater = volBrine * wf;
      const massSalt = volBrine * saltConc; // lbs
      
      const sacksSalt = unitMode === 'metric' 
        ? Math.ceil((massSalt / 2.20462) / 25) // 25 kg bags
        : Math.ceil(massSalt / 50);          // 50 lb bags
      
      const massWM = volWM * dWm * 42; // lbs
      const sacksWM = unitMode === 'metric'
        ? Math.ceil((massWM / 2.20462) / 50)  // 50 kg bags
        : Math.ceil(massWM / 100);           // 100 lb bags

      // Aditivos
      const finalAdditives = abcAdditives.map(add => {
        const totalLbs = add.totalLbs;
        const totalKg = totalLbs / 2.20462;
        const sacks = unitMode === 'metric'
          ? Math.ceil(totalKg / (parseFloat(add.packageSize) || 25)) // package size is entered in kg
          : Math.ceil(totalLbs / add.pkg);                           // in lb
        return {
          name: add.name,
          concentration: add.concentration,
          totalLbs: totalLbs,
          totalKg: totalKg,
          volDisp: add.volDisp,
          sacks: sacks,
          pkgSize: add.packageSize
        };
      });

      return {
        invalid: false,
        type: 'obm',
        abcAdditives,
        fTotal: F_total,
        fTotal_m3: F_total * 0.158987,
        gTotal: G_total,
        dFaseFluida,
        dFaseFluida_sg: dFaseFluida / 8.33,
        volWM,
        volWM_m3: volWM * 0.158987,
        massWM,
        massWM_kg: massWM / 2.20462,
        sacksWM,
        volFaseFluida,
        volFaseFluida_m3: volFaseFluida * 0.158987,
        volNap,
        volNap_m3: volNap * 0.158987,
        volBrine,
        volBrine_m3: volBrine * 0.158987,
        volWater,
        volWater_m3: volWater * 0.158987,
        massSalt,
        massSalt_kg: massSalt / 2.20462,
        sacksSalt,
        finalAdditives,
        vf: vf_input,
        df: df_input
      };
    } else {
      // WBM Mode
      let d1 = parseFloat(formSystem.wbmD1) || 0;
      let d2 = parseFloat(formSystem.wbmD2) || 0;
      if (unitMode === 'metric') {
        d1 = d1 * 8.33; // SG to ppg
        d2 = d2 * 8.33; // SG to ppg
      }
      
      const wbmMode = formSystem.wbmMode;

      // 1. Desplazamiento de Aditivos (WBM)
      let V_c = 0; // bbl
      let G_total = 0; // bbl * ppg
      const abcAdditives = wbmAdditives.map(add => {
        const sg = parseFloat(add.sg) || 0;
        let conc = parseFloat(add.concentration) || 0;
        let pkg = parseFloat(add.packageSize) || 50;

        if (unitMode === 'metric') {
          conc = conc / 2.853; // kg/m³ to ppb
          pkg = pkg * 2.20462; // kg to lbs
        }

        const ppgEq = sg * 8.345;
        const ppbEq = ppgEq * 42;
        const totalLbs = conc * vf;
        const volDisp = ppbEq > 0 ? totalLbs / ppbEq : 0;
        const ratio = volDisp * ppgEq;

        V_c += volDisp;
        G_total += ratio;

        return {
          ...add,
          ppgEq,
          ppbEq,
          totalLbs,
          volDisp,
          ratio,
          pkg
        };
      });

      if (wbmMode === 'weights') {
        if (Math.abs(d1 - d2) < 0.001) {
          return { invalid: true, isSameDensity: true, msg: t.formSameDensity };
        }

        const v1 = (vf * (df - d2) + V_c * d2 - G_total) / (d1 - d2);
        const v2 = vf - v1 - V_c;

        if (v1 < 0 || v2 < 0) {
          return { invalid: true, isUnfeasible: true, msg: t.formUnfeasible };
        }

        const finalAdditives = abcAdditives.map(add => {
          const totalLbs = add.totalLbs;
          const totalKg = totalLbs / 2.20462;
          const sacks = unitMode === 'metric'
            ? Math.ceil(totalKg / (parseFloat(add.packageSize) || 25))
            : Math.ceil(totalLbs / add.pkg);
          return {
            name: add.name,
            concentration: add.concentration,
            totalLbs: totalLbs,
            totalKg: totalKg,
            volDisp: add.volDisp,
            sacks: sacks,
            pkgSize: add.packageSize
          };
        });

        return {
          invalid: false,
          type: 'wbm',
          mode: 'weights',
          abcAdditives,
          v1: unitMode === 'metric' ? v1 * 0.158987 : v1,
          v2: unitMode === 'metric' ? v2 * 0.158987 : v2,
          v1_bbl: v1,
          v2_bbl: v2,
          vc: V_c,
          vc_m3: V_c * 0.158987,
          gTotal: G_total,
          vf: vf_input,
          df: df_input,
          d1: parseFloat(formSystem.wbmD1) || 0,
          d2: parseFloat(formSystem.wbmD2) || 0,
          finalAdditives
        };
      } else {
        // Blend Mode
        let v1 = parseFloat(formSystem.wbmV1) || 0;
        let v2 = parseFloat(formSystem.wbmV2) || 0;
        if (unitMode === 'metric') {
          v1 = v1 * 6.28981; // m³ to bbl
          v2 = v2 * 6.28981; // m³ to bbl
        }

        const vFinalCalculated = v1 + v2 + V_c; // bbl
        const dFinalCalculated = vFinalCalculated > 0 ? (v1 * d1 + v2 * d2 + G_total) / vFinalCalculated : 0; // ppg

        const finalAdditives = abcAdditives.map(add => {
          const conc = parseFloat(add.concentration) || 0;
          const totalLbs = conc * vFinalCalculated;
          const totalKg = totalLbs / 2.20462;
          const sacks = unitMode === 'metric'
            ? Math.ceil(totalKg / (parseFloat(add.packageSize) || 25))
            : Math.ceil(totalLbs / add.pkg);
          return {
            name: add.name,
            concentration: add.concentration,
            totalLbs: totalLbs,
            totalKg: totalKg,
            volDisp: add.volDisp,
            sacks: sacks,
            pkgSize: add.packageSize
          };
        });

        return {
          invalid: false,
          type: 'wbm',
          mode: 'blend',
          abcAdditives,
          v1: parseFloat(formSystem.wbmV1) || 0,
          v2: parseFloat(formSystem.wbmV2) || 0,
          v1_bbl: v1,
          v2_bbl: v2,
          vc: V_c,
          vc_m3: V_c * 0.158987,
          gTotal: G_total,
          vf: unitMode === 'metric' ? vFinalCalculated * 0.158987 : vFinalCalculated,
          df: unitMode === 'metric' ? dFinalCalculated / 8.33 : dFinalCalculated,
          vf_bbl: vFinalCalculated,
          df_ppg: dFinalCalculated,
          d1: parseFloat(formSystem.wbmD1) || 0,
          d2: parseFloat(formSystem.wbmD2) || 0,
          finalAdditives
        };
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Unit Toggle Button */}
      <div className="flex bg-zinc-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 self-start inline-flex">
        <button onClick={() => setUnitMode('field')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${unitMode === 'field' ? 'bg-halliburton-red text-white shadow-md' : 'text-zinc-500'}`}>{t.unitField}</button>
        <button onClick={() => setUnitMode('metric')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${unitMode === 'metric' ? 'bg-halliburton-red text-white shadow-md' : 'text-zinc-500'}`}>{t.unitMetric}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/40 p-10 rounded-[3.5rem] card-shadow border border-zinc-200 dark:border-zinc-800/50">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest italic">{t.formTitle}</h4>
              
              {/* Mud Type Toggle */}
              <div className="flex bg-zinc-100 dark:bg-slate-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFormType('obm')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${formType === 'obm' ? 'bg-zinc-900 text-white dark:bg-slate-800 shadow-md' : 'text-zinc-500'}`}
                >
                  {t.formObm}
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('wbm')}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${formType === 'wbm' ? 'bg-zinc-900 text-white dark:bg-slate-800 shadow-md' : 'text-zinc-500'}`}
                >
                  {t.formWbm}
                </button>
              </div>
            </div>

            {formType === 'obm' ? (
              // OBM Inputs Layout
              <div className="space-y-6">
                {/* Section 1: Target System */}
                <div className="space-y-4 bg-zinc-50/40 dark:bg-slate-900/10 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800/40">
                  <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-1">{t.formSystemData}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                        {t.formFinalVolume} (Vf - {unitMode === 'field' ? 'bbl' : 'm³'})
                      </label>
                      <input
                        type="number"
                        value={formSystem.volFinal}
                        onChange={e => setFormSystem({ ...formSystem, volFinal: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder={unitMode === 'field' ? "1000" : "159"}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                        {t.formFinalDensity} (Df - {unitMode === 'field' ? 'ppg' : 'SG'})
                      </label>
                      <input
                        type="number"
                        value={formSystem.densFinal}
                        onChange={e => setFormSystem({ ...formSystem, densFinal: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder={unitMode === 'field' ? "12.0" : "1.44"}
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">% Aceite (OWR Oil)</label>
                      <input
                        type="number"
                        value={formSystem.owrOil}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormSystem({ ...formSystem, owrOil: e.target.value, owrWater: (100 - val).toString() });
                        }}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">% Salmuera (OWR Brine)</label>
                      <input
                        type="number"
                        value={formSystem.owrWater}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormSystem({ ...formSystem, owrWater: e.target.value, owrOil: (100 - val).toString() });
                        }}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Brine Properties */}
                <div className="space-y-4 bg-zinc-50/40 dark:bg-slate-900/10 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800/40">
                  <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-1">{t.formSaltTable}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">{t.formWps} (ppm)</label>
                      <input
                        type="number"
                        value={formSystem.wps}
                        onChange={e => setFormSystem({ ...formSystem, wps: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="250000"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">{t.formBrineDens} (SG)</label>
                      <input
                        type="number"
                        value={formSystem.sgBrine}
                        onChange={e => setFormSystem({ ...formSystem, sgBrine: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="1.18900"
                        step="0.00001"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">{t.formWaterFactor} (WF)</label>
                      <input
                        type="number"
                        value={formSystem.wf}
                        onChange={e => setFormSystem({ ...formSystem, wf: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="0.8256"
                        step="0.0001"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                        {t.formSaltConc} ({unitMode === 'field' ? 'ppb' : 'kg/m³'})
                      </label>
                      <input
                        type="number"
                        value={formSystem.saltConc}
                        onChange={e => setFormSystem({ ...formSystem, saltConc: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder={unitMode === 'field' ? "99.4" : "283.6"}
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Phase SG */}
                <div className="space-y-4 bg-zinc-50/40 dark:bg-slate-900/10 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800/40">
                  <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-1">{t.formFluidSolids}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">{t.formOilSg}</label>
                      <input
                        type="number"
                        value={formSystem.sgOil}
                        onChange={e => setFormSystem({ ...formSystem, sgOil: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="0.84"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">{t.formWeightSg}</label>
                      <input
                        type="number"
                        value={formSystem.sgWeight}
                        onChange={e => setFormSystem({ ...formSystem, sgWeight: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="4.20"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Additives */}
                <div className="space-y-4 bg-zinc-50/40 dark:bg-slate-900/10 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800/40">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-1">
                    <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t.formAdditivesHeader}</h5>
                    <button
                      type="button"
                      onClick={() => setObmAdditives([...obmAdditives, { id: Date.now().toString(), name: '', sg: '1.0', concentration: '0.0', packageSize: '25' }])}
                      className="px-3 py-1 bg-zinc-900 dark:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase hover:bg-halliburton-red transition-all"
                    >
                      + {t.formAddRow}
                    </button>
                  </div>

                  {/* Explicación de Columnas */}
                  <div className="p-4 bg-zinc-100 dark:bg-slate-900/50 rounded-2xl text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider leading-relaxed space-y-1 border border-zinc-200/50 dark:border-zinc-800/50">
                    <p><span className="text-halliburton-red">SG (Densidad):</span> Gravedad específica del producto (Agua = 1.0). Permite calcular el volumen ocupado por los químicos.</p>
                    {unitMode === 'field' ? (
                      <>
                        <p><span className="text-halliburton-red">Conc (ppb):</span> Concentración requerida en libras por barril de lodo (ppb / lb/bbl).</p>
                        <p><span className="text-halliburton-red">Envase (lb):</span> Peso neto de la bolsa o tambor comercial para estimar la cantidad de envases.</p>
                      </>
                    ) : (
                      <>
                        <p><span className="text-halliburton-red">Conc (kg/m³):</span> Concentración requerida en kilogramos por metro cúbico (kg/m³ o g/L).</p>
                        <p><span className="text-halliburton-red">Envase (kg):</span> Peso neto de la bolsa o tambor comercial para estimar la cantidad de envases.</p>
                      </>
                    )}
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-12 gap-2 px-3 text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                    <div className="col-span-4">Nombre Producto</div>
                    <div className="col-span-2 text-center">SG</div>
                    <div className="col-span-3 text-center">Conc ({unitMode === 'field' ? 'ppb' : 'kg/m³'})</div>
                    <div className="col-span-2 text-center">Empaque ({unitMode === 'field' ? 'lb' : 'kg'})</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="space-y-3">
                    {obmAdditives.map((add, idx) => (
                      <div key={add.id} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 shadow-sm relative group/row">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={add.name}
                            onChange={e => {
                              const newAdd = [...obmAdditives];
                              newAdd[idx].name = e.target.value;
                              setObmAdditives(newAdd);
                            }}
                            className="w-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold focus:border-halliburton-red outline-none"
                            placeholder="Nombre Producto"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={add.sg}
                            onChange={e => {
                              const newAdd = [...obmAdditives];
                              newAdd[idx].sg = e.target.value;
                              setObmAdditives(newAdd);
                            }}
                            className="w-full bg-yellow-500/5 dark:bg-yellow-500/5 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder="SG"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={add.concentration}
                            onChange={e => {
                              const newAdd = [...obmAdditives];
                              newAdd[idx].concentration = e.target.value;
                              setObmAdditives(newAdd);
                            }}
                            className="w-full bg-yellow-500/5 dark:bg-yellow-500/5 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder={unitMode === 'field' ? "Conc (ppb)" : "Conc (kg/m³)"}
                            step="0.1"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={add.packageSize}
                            onChange={e => {
                              const newAdd = [...obmAdditives];
                              newAdd[idx].packageSize = e.target.value;
                              setObmAdditives(newAdd);
                            }}
                            className="w-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder={unitMode === 'field' ? "Env. lb" : "Env. kg"}
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => setObmAdditives(obmAdditives.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // WBM Inputs Layout
              <div className="space-y-6">
                {/* Section 1: Target mud volume to build */}
                <div className="space-y-4 bg-zinc-50/40 dark:bg-slate-900/10 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800/40">
                  <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-1">{t.formSystemData}</h5>
                  <div>
                    <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                      {t.lgsInitialVol} (V_build - {unitMode === 'field' ? 'bbl' : 'm³'})
                    </label>
                    <input
                      type="number"
                      value={formSystem.volFinal}
                      onChange={e => setFormSystem({ ...formSystem, volFinal: e.target.value })}
                      className="w-full input-style text-xl font-bold bg-yellow-500/5 focus:bg-white"
                      placeholder={unitMode === 'field' ? "1000" : "159"}
                    />
                  </div>
                </div>

                {/* Section 2: Material Balance Resolver */}
                <div className="space-y-4 bg-zinc-50/40 dark:bg-slate-900/10 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800/40">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-1">
                    <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t.formMaterialBalance}</h5>
                    
                    {/* Solver Mode Toggle */}
                    <div className="flex bg-zinc-100 dark:bg-slate-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setFormSystem({ ...formSystem, wbmMode: 'weights' })}
                        className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${formSystem.wbmMode === 'weights' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}
                      >
                        Modo 1
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSystem({ ...formSystem, wbmMode: 'blend' })}
                        className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${formSystem.wbmMode === 'blend' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}
                      >
                        Modo 2
                      </button>
                    </div>
                  </div>

                  {formSystem.wbmMode === 'weights' ? (
                    // Modo 1 (V1 y V2)
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tight mb-1 block">
                            Df ({unitMode === 'field' ? 'ppg' : 'SG'})
                          </label>
                          <input
                            type="number"
                            value={formSystem.densFinal}
                            onChange={e => setFormSystem({ ...formSystem, densFinal: e.target.value })}
                            className="w-full input-style text-sm font-bold bg-yellow-500/5 focus:bg-white text-center"
                            placeholder={unitMode === 'field' ? "11.5" : "1.38"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tight mb-1 block">
                            D1 ({unitMode === 'field' ? 'ppg' : 'SG'})
                          </label>
                          <input
                            type="number"
                            value={formSystem.wbmD1}
                            onChange={e => setFormSystem({ ...formSystem, wbmD1: e.target.value })}
                            className="w-full input-style text-sm font-bold bg-yellow-500/5 focus:bg-white text-center"
                            placeholder={unitMode === 'field' ? "12.5" : "1.50"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tight mb-1 block">
                            D2 ({unitMode === 'field' ? 'ppg' : 'SG'})
                          </label>
                          <input
                            type="number"
                            value={formSystem.wbmD2}
                            onChange={e => setFormSystem({ ...formSystem, wbmD2: e.target.value })}
                            className="w-full input-style text-sm font-bold bg-yellow-500/5 focus:bg-white text-center"
                            placeholder={unitMode === 'field' ? "8.33" : "1.00"}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Modo 2 (Vf y Df)
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-slate-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div>
                          <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                            V1 ({unitMode === 'field' ? 'bbl' : 'm³'})
                          </label>
                          <input
                            type="number"
                            value={formSystem.wbmV1}
                            onChange={e => setFormSystem({ ...formSystem, wbmV1: e.target.value })}
                            className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                            placeholder={unitMode === 'field' ? "400" : "63.6"}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                            D1 ({unitMode === 'field' ? 'ppg' : 'SG'})
                          </label>
                          <input
                            type="number"
                            value={formSystem.wbmD1}
                            onChange={e => setFormSystem({ ...formSystem, wbmD1: e.target.value })}
                            className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                            placeholder={unitMode === 'field' ? "12.5" : "1.50"}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-slate-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div>
                          <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                            V2 ({unitMode === 'field' ? 'bbl' : 'm³'})
                          </label>
                          <input
                            type="number"
                            value={formSystem.wbmV2}
                            onChange={e => setFormSystem({ ...formSystem, wbmV2: e.target.value })}
                            className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                            placeholder={unitMode === 'field' ? "500" : "79.5"}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                            D2 ({unitMode === 'field' ? 'ppg' : 'SG'})
                          </label>
                          <input
                            type="number"
                            value={formSystem.wbmD2}
                            onChange={e => setFormSystem({ ...formSystem, wbmD2: e.target.value })}
                            className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                            placeholder={unitMode === 'field' ? "8.33" : "1.00"}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Additives */}
                <div className="space-y-4 bg-zinc-50/40 dark:bg-slate-900/10 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800/40">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-1">
                    <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t.formAdditivesHeader}</h5>
                    <button
                      type="button"
                      onClick={() => setWbmAdditives([...wbmAdditives, { id: Date.now().toString(), name: '', sg: '1.0', concentration: '0.0', packageSize: '25' }])}
                      className="px-3 py-1 bg-zinc-900 dark:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase hover:bg-halliburton-red transition-all"
                    >
                      + {t.formAddRow}
                    </button>
                  </div>

                  {/* Explicación de Columnas */}
                  <div className="p-4 bg-zinc-100 dark:bg-slate-900/50 rounded-2xl text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider leading-relaxed space-y-1 border border-zinc-200/50 dark:border-zinc-800/50">
                    <p><span className="text-halliburton-red">SG (Densidad):</span> Gravedad específica del producto (Agua = 1.0). Permite calcular el volumen ocupado por los químicos.</p>
                    {unitMode === 'field' ? (
                      <>
                        <p><span className="text-halliburton-red">Conc (ppb):</span> Concentración requerida en libras por barril de lodo (ppb / lb/bbl).</p>
                        <p><span className="text-halliburton-red">Envase (lb):</span> Peso neto de la bolsa o tambor comercial para estimar la cantidad de envases.</p>
                      </>
                    ) : (
                      <>
                        <p><span className="text-halliburton-red">Conc (kg/m³):</span> Concentración requerida en kilogramos por metro cúbico (kg/m³ o g/L).</p>
                        <p><span className="text-halliburton-red">Envase (kg):</span> Peso neto de la bolsa o tambor comercial para estimar la cantidad de envases.</p>
                      </>
                    )}
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-12 gap-2 px-3 text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                    <div className="col-span-4">Nombre Producto</div>
                    <div className="col-span-2 text-center">SG</div>
                    <div className="col-span-3 text-center">Conc ({unitMode === 'field' ? 'ppb' : 'kg/m³'})</div>
                    <div className="col-span-2 text-center">Empaque ({unitMode === 'field' ? 'lb' : 'kg'})</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="space-y-3">
                    {wbmAdditives.map((add, idx) => (
                      <div key={add.id} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 shadow-sm relative group/row">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={add.name}
                            onChange={e => {
                              const newAdd = [...wbmAdditives];
                              newAdd[idx].name = e.target.value;
                              setWbmAdditives(newAdd);
                            }}
                            className="w-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold focus:border-halliburton-red outline-none"
                            placeholder="Nombre Producto"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={add.sg}
                            onChange={e => {
                              const newAdd = [...wbmAdditives];
                              newAdd[idx].sg = e.target.value;
                              setWbmAdditives(newAdd);
                            }}
                            className="w-full bg-yellow-500/5 dark:bg-yellow-500/5 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder="SG"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={add.concentration}
                            onChange={e => {
                              const newAdd = [...wbmAdditives];
                              newAdd[idx].concentration = e.target.value;
                              setWbmAdditives(newAdd);
                            }}
                            className="w-full bg-yellow-500/5 dark:bg-yellow-500/5 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder={unitMode === 'field' ? "Conc (ppb)" : "Conc (kg/m³)"}
                            step="0.1"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={add.packageSize}
                            onChange={e => {
                              const newAdd = [...wbmAdditives];
                              newAdd[idx].packageSize = e.target.value;
                              setWbmAdditives(newAdd);
                            }}
                            className="w-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder={unitMode === 'field' ? "Env. lb" : "Env. kg"}
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => setWbmAdditives(wbmAdditives.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900 p-10 rounded-[3.5rem] text-white flex flex-col justify-center h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Icon name="calculator" size={120} />
            </div>

            {(() => {
              const res = getFormulationResult();
              if (!res) return null;

              if (res.invalid) {
                return (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-sm font-bold text-red-400 uppercase tracking-widest text-center">
                    {res.msg || t.formUnfeasible}
                  </div>
                );
              }

              return (
                <div className="space-y-8 animate-fade-in">
                  {/* Header with Share Button */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">
                        {t.formResultRecipe}
                      </span>
                      <h5 className="text-2xl font-black text-white uppercase tracking-tight italic mt-1">
                        {res.type === 'obm' ? 'OBM / Invert Emulsion' : 'WBM / Water-Based'}
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyFormulationRecipe(res)}
                      className="p-3 bg-white/10 hover:bg-halliburton-red rounded-2xl transition-all shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Icon name="share-2" size={14} /> {t.formCopyRecipe}
                    </button>
                  </div>

                  {/* Volumetric / Blending Result Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {res.type === 'obm' ? (
                      <>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                          <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">
                            {t.formFluidPhaseDens}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <h5 className="text-3xl font-black italic text-halliburton-red">
                              {unitMode === 'field' ? res.dFaseFluida.toFixed(2) : res.dFaseFluida_sg.toFixed(2)}
                            </h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{unitMode === 'field' ? 'PPG' : 'SG'}</span>
                          </div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                          <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">
                            Volumen Densificante (Barita)
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <h5 className="text-3xl font-black italic text-zinc-200">
                              {unitMode === 'field' ? res.volWM.toFixed(4) : res.volWM_m3.toFixed(4)}
                            </h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{unitMode === 'field' ? 'BBL' : 'M³'}</span>
                          </div>
                        </div>
                      </>
                    ) : res.mode === 'weights' ? (
                      <>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                          <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">
                            Volumen Lodo Base 1 (V1)
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <h5 className="text-3xl font-black italic text-halliburton-red">
                              {res.v1.toFixed(2)}
                            </h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{unitMode === 'field' ? 'BBL' : 'M³'}</span>
                          </div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                          <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">
                            Volumen Diluyente 2 (V2)
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <h5 className="text-3xl font-black italic text-zinc-200">
                              {res.v2.toFixed(2)}
                            </h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{unitMode === 'field' ? 'BBL' : 'M³'}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                          <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">
                            Volumen Final Resultante (Vf)
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <h5 className="text-3xl font-black italic text-halliburton-red">
                              {res.vf.toFixed(2)}
                            </h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{unitMode === 'field' ? 'BBL' : 'M³'}</span>
                          </div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                          <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">
                            Densidad Final Resultante (Df)
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <h5 className="text-3xl font-black italic text-zinc-200">
                              {res.df.toFixed(2)}
                            </h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{unitMode === 'field' ? 'PPG' : 'SG'}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Breakdown & Packaging Recipe */}
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block border-b border-white/5 pb-2">
                      Receta de Mezclado Comercial ({unitMode === 'field' ? 'LBS' : 'KG'} & {unitMode === 'field' ? 'BBL' : 'M³'})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
                      {res.type === 'obm' ? (
                        <>
                          {/* Aceite Base (NAP) */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">{t.formBaseOil}</span>
                            <div className="flex justify-between items-baseline">
                              {unitMode === 'field' ? (
                                <>
                                  <span className="text-white text-base">{res.volNap.toFixed(2)} bbl <small className="text-[9px] text-zinc-500 font-mono">({res.volNap_m3.toFixed(2)} m³)</small></span>
                                  <span className="text-zinc-400 text-[10px] font-mono">
                                    {((res.volNap * 42 * (parseFloat(formSystem.sgOil) * 8.345))).toFixed(0)} lb ({((res.volNap * 42 * (parseFloat(formSystem.sgOil) * 8.345)) / 2.20462).toFixed(0)} kg)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-white text-base">{res.volNap_m3.toFixed(2)} m³ <small className="text-[9px] text-zinc-500 font-mono">({res.volNap.toFixed(2)} bbl)</small></span>
                                  <span className="text-zinc-400 text-[10px] font-mono">
                                    {((res.volNap * 42 * (parseFloat(formSystem.sgOil) * 8.345)) / 2.20462).toFixed(0)} kg ({((res.volNap * 42 * (parseFloat(formSystem.sgOil) * 8.345))).toFixed(0)} lb)
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Agua Dulce */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">{t.formWater}</span>
                            <div className="flex justify-between items-baseline">
                              {unitMode === 'field' ? (
                                <>
                                  <span className="text-white text-base">{res.volWater.toFixed(2)} bbl <small className="text-[9px] text-zinc-500 font-mono">({res.volWater_m3.toFixed(2)} m³)</small></span>
                                  <span className="text-zinc-400 text-[10px] font-mono">
                                    {((res.volWater * 42 * 8.33)).toFixed(0)} lb ({((res.volWater * 42 * 8.33) / 2.20462).toFixed(0)} kg)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-white text-base">{res.volWater_m3.toFixed(2)} m³ <small className="text-[9px] text-zinc-500 font-mono">({res.volWater.toFixed(2)} bbl)</small></span>
                                  <span className="text-zinc-400 text-[10px] font-mono">
                                    {((res.volWater * 42 * 8.33) / 2.20462).toFixed(0)} kg ({((res.volWater * 42 * 8.33)).toFixed(0)} lb)
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Sal Seca */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">{t.formSalt}</span>
                            <div className="flex justify-between items-baseline">
                              {unitMode === 'field' ? (
                                <>
                                  <span className="text-white text-base">{res.massSalt.toFixed(1)} lb <small className="text-[9px] text-zinc-500 font-mono">({res.massSalt_kg.toFixed(1)} kg)</small></span>
                                  <span className="inline-block px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-mono font-bold">~{res.sacksSalt} sacos (50 lb)</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-white text-base">{res.massSalt_kg.toFixed(1)} kg <small className="text-[9px] text-zinc-500 font-mono">({res.massSalt.toFixed(1)} lb)</small></span>
                                  <span className="inline-block px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-mono font-bold">~{res.sacksSalt} sacos (25 kg)</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Densificante (Barita) */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">{t.formWeightMaterial}</span>
                            <div className="flex justify-between items-baseline">
                              {unitMode === 'field' ? (
                                <>
                                  <span className="text-white text-base">{res.massWM.toFixed(0)} lb <small className="text-[9px] text-zinc-500 font-mono">({res.massWM_kg.toFixed(0)} kg)</small></span>
                                  <div className="text-right flex flex-col items-end gap-1">
                                    <span className="text-[9px] text-zinc-400 block font-mono">{res.volWM.toFixed(2)} bbl ({res.volWM_m3.toFixed(2)} m³)</span>
                                    <span className="inline-block px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-[9px] font-mono font-bold">~{res.sacksWM} sacos (100 lb)</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="text-white text-base">{res.massWM_kg.toFixed(0)} kg <small className="text-[9px] text-zinc-500 font-mono">({res.massWM.toFixed(0)} lb)</small></span>
                                  <div className="text-right flex flex-col items-end gap-1">
                                    <span className="text-[9px] text-zinc-400 block font-mono">{res.volWM_m3.toFixed(2)} m³ ({res.volWM.toFixed(2)} bbl)</span>
                                    <span className="inline-block px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-[9px] font-mono font-bold">~{res.sacksWM} sacos (50 kg)</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Lodo Base 1 */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">Lodo Base 1</span>
                            <div className="flex justify-between items-baseline">
                              <span className="text-white text-base">
                                {res.v1.toFixed(2)} {unitMode === 'field' ? 'bbl' : 'm³'}{' '}
                                <small className="text-[9px] text-zinc-500 font-mono">
                                  ({(unitMode === 'field' ? res.v1 * 0.158987 : res.v1_bbl).toFixed(2)} {unitMode === 'field' ? 'm³' : 'bbl'})
                                </small>
                              </span>
                              <span className="text-zinc-400 text-[10px] font-mono">
                                D: {res.d1.toFixed(2)} {unitMode === 'field' ? 'ppg' : 'SG'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Diluyente 2 */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">Diluyente 2</span>
                            <div className="flex justify-between items-baseline">
                              <span className="text-white text-base">
                                {res.v2.toFixed(2)} {unitMode === 'field' ? 'bbl' : 'm³'}{' '}
                                <small className="text-[9px] text-zinc-500 font-mono">
                                  ({(unitMode === 'field' ? res.v2 * 0.158987 : res.v2_bbl).toFixed(2)} {unitMode === 'field' ? 'm³' : 'bbl'})
                                </small>
                              </span>
                              <span className="text-zinc-400 text-[10px] font-mono">
                                D: {res.d2.toFixed(2)} {unitMode === 'field' ? 'ppg' : 'SG'}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Chemical Additives */}
                      {res.finalAdditives.map((add, idx) => {
                        const massPrimary = unitMode === 'field' ? `${add.totalLbs.toFixed(1)} lb` : `${add.totalKg.toFixed(1)} kg`;
                        const massSecondary = unitMode === 'field' ? `${add.totalKg.toFixed(1)} kg` : `${add.totalLbs.toFixed(1)} lb`;
                        const volDispPrimary = unitMode === 'field' ? `${add.volDisp.toFixed(4)} bbl` : `${(add.volDisp * 0.158987).toFixed(4)} m³`;
                        const volDispSecondary = unitMode === 'field' ? `${(add.volDisp * 0.158987).toFixed(4)} m³` : `${add.volDisp.toFixed(4)} bbl`;
                        const sacksLabel = unitMode === 'field' ? `~${add.sacks} envases (${add.pkgSize} lb)` : `~${add.sacks} envases (${add.pkgSize} kg)`;
                        
                        return (
                          <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl col-span-1 md:col-span-2 flex flex-col justify-between space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>{add.name || `Aditivo ${idx + 1}`}</span>
                              <span className="font-mono">Conc: {add.concentration} {unitMode === 'field' ? 'ppb' : 'kg/m³'}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-white text-base">
                                {massPrimary} <small className="text-[9px] text-zinc-500 font-mono">({massSecondary})</small>
                              </span>
                              <div className="text-right flex flex-col items-end gap-1">
                                <span className="text-[9px] text-zinc-400 block font-mono">Despl. {volDispPrimary} ({volDispSecondary})</span>
                                <span className="inline-block px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-mono font-bold">{sacksLabel}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FluidFormulation;
