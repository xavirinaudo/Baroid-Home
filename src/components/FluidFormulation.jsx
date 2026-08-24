import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { translations, translateText } from '../data/translations';

// Reference data from "9- CaCl2 table 2.pdf" for Calcium Chloride brine properties
const CaCl2_Table = [
  { pct: 0,  wps: 0,      sg: 1.000, ppg: 8.34,  wf: 1.000, saltLbs: 0.0 },
  { pct: 5,  wps: 50000,  sg: 1.040, ppg: 8.67,  wf: 0.985, saltLbs: 18.0 },
  { pct: 10, wps: 100000, sg: 1.084, ppg: 9.03,  wf: 0.975, saltLbs: 38.5 },
  { pct: 15, wps: 150000, sg: 1.131, ppg: 9.42,  wf: 0.966, saltLbs: 61.21 },
  { pct: 16, wps: 160000, sg: 1.141, ppg: 9.50,  wf: 0.953, saltLbs: 65.84 },
  { pct: 17, wps: 170000, sg: 1.150, ppg: 9.58,  wf: 0.949, saltLbs: 70.54 },
  { pct: 18, wps: 180000, sg: 1.160, ppg: 9.66,  wf: 0.945, saltLbs: 75.30 },
  { pct: 19, wps: 190000, sg: 1.170, ppg: 9.74,  wf: 0.941, saltLbs: 80.18 },
  { pct: 20, wps: 200000, sg: 1.180, ppg: 9.83,  wf: 0.936, saltLbs: 85.10 },
  { pct: 21, wps: 210000, sg: 1.190, ppg: 9.91,  wf: 0.932, saltLbs: 90.16 },
  { pct: 22, wps: 220000, sg: 1.200, ppg: 9.99,  wf: 0.928, saltLbs: 95.22 },
  { pct: 23, wps: 230000, sg: 1.210, ppg: 10.08, wf: 0.923, saltLbs: 100.42 },
  { pct: 24, wps: 240000, sg: 1.220, ppg: 10.16, wf: 0.918, saltLbs: 105.62 },
  { pct: 25, wps: 250000, sg: 1.231, ppg: 10.25, wf: 0.910, saltLbs: 111.01 },
  { pct: 26, wps: 260000, sg: 1.241, ppg: 10.34, wf: 0.908, saltLbs: 116.39 },
  { pct: 27, wps: 270000, sg: 1.252, ppg: 10.43, wf: 0.903, saltLbs: 121.94 },
  { pct: 28, wps: 280000, sg: 1.262, ppg: 10.51, wf: 0.898, saltLbs: 127.48 },
  { pct: 29, wps: 290000, sg: 1.273, ppg: 10.60, wf: 0.892, saltLbs: 133.21 },
  { pct: 30, wps: 300000, sg: 1.284, ppg: 10.69, wf: 0.887, saltLbs: 138.94 },
  { pct: 31, wps: 310000, sg: 1.295, ppg: 10.79, wf: 0.881, saltLbs: 144.83 },
  { pct: 32, wps: 320000, sg: 1.306, ppg: 10.88, wf: 0.875, saltLbs: 150.72 },
  { pct: 33, wps: 330000, sg: 1.317, ppg: 10.97, wf: 0.869, saltLbs: 156.81 },
  { pct: 34, wps: 340000, sg: 1.328, ppg: 11.07, wf: 0.863, saltLbs: 162.90 },
  { pct: 35, wps: 350000, sg: 1.340, ppg: 11.16, wf: 0.856, saltLbs: 169.18 },
  { pct: 36, wps: 360000, sg: 1.351, ppg: 11.26, wf: 0.850, saltLbs: 175.47 },
  { pct: 37, wps: 370000, sg: 1.363, ppg: 11.35, wf: 0.843, saltLbs: 181.94 },
  { pct: 38, wps: 380000, sg: 1.375, ppg: 11.45, wf: 0.836, saltLbs: 188.41 },
  { pct: 39, wps: 390000, sg: 1.386, ppg: 11.55, wf: 0.829, saltLbs: 195.07 },
  { pct: 40, wps: 400000, sg: 1.398, ppg: 11.65, wf: 0.822, saltLbs: 201.74 }
];

// Calculate density (SG), Water Factor (WF) and Salt Conc (ppb) based on WPS (ppm) and Purity (%)
const calculateBrineProperties = (wps, purity) => {
  const targetWps = Math.max(0, Math.min(400000, wps));
  
  let lower = CaCl2_Table[0];
  let upper = CaCl2_Table[CaCl2_Table.length - 1];
  
  for (let i = 0; i < CaCl2_Table.length - 1; i++) {
    if (targetWps >= CaCl2_Table[i].wps && targetWps <= CaCl2_Table[i+1].wps) {
      lower = CaCl2_Table[i];
      upper = CaCl2_Table[i+1];
      break;
    }
  }
  
  let interpolFactor = 0;
  if (upper.wps !== lower.wps) {
    interpolFactor = (targetWps - lower.wps) / (upper.wps - lower.wps);
  }
  
  const sgBase = lower.sg + (upper.sg - lower.sg) * interpolFactor;
  const wfBase = lower.wf + (upper.wf - lower.wf) * interpolFactor;
  const saltLbsBase = lower.saltLbs + (upper.saltLbs - lower.saltLbs) * interpolFactor;
  
  const saltPurity = Math.max(1, Math.min(100, purity));
  
  // Adjusted salt concentration based on salt purity (lbs of commercial salt per bbl of brine)
  const saltConc = saltLbsBase * (95 / saltPurity);
  
  // Adjusted freshwater factor (bbl of water per bbl of brine)
  // Deduct water introduced by the commercial salt (assuming impurities are water/moisture)
  let wf = wfBase + (saltLbsBase * 0.05) / 350.5 - (saltConc * (1 - saltPurity / 100)) / 350.5;
  wf = Math.max(0, wf);
  
  return {
    sgBrine: sgBase,
    wf: wf,
    saltConc: saltConc
  };
};

const FluidFormulation = ({ isEditing, lang, unitMode, setUnitMode }) => {
  const t = translations[lang] || translations['es'];

  // Fluid Formulation State
  const [formType, setFormType] = useState('obm'); // 'wbm' or 'obm'
  const [formSystem, setFormSystem] = useState({
    volFinal: '1000',
    densFinal: '12.0',
    owrOil: '80',
    owrWater: '20',
    wps: '250000',
    wf: '0.9100',
    saltConc: '111.0',
    sgBrine: '1.23100',
    sgOil: '0.84',
    sgWeight: '4.20',
    saltPurity: '95', // New property for salt purity percentage
    wbmD1: '12.5',
    wbmD2: '8.33',
    wbmV1: '400',
    wbmV2: '500',
    wbmMode: 'weights' // 'weights' or 'blend'
  });

  const [obmAdditives, setObmAdditives] = useState([
    { id: '1', name: 'GELTONE II (Clay)', sg: '1.70', concentration: '6.0', packageSize: '50', isLiquid: false },
    { id: '2', name: 'EZ MUL (Emulsifier)', sg: '0.98', concentration: '8.0', packageSize: '400', isLiquid: true },
    { id: '3', name: 'LIME (Alkalinity)', sg: '2.20', concentration: '4.0', packageSize: '50', isLiquid: false }
  ]);

  const [wbmAdditives, setWbmAdditives] = useState([
    { id: '1', name: 'AQUAGEL (Bentonite)', sg: '2.60', concentration: '15.0', packageSize: '100', isLiquid: false },
    { id: '2', name: 'BARAZAN D (Xanthan)', sg: '1.50', concentration: '1.5', packageSize: '50', isLiquid: false },
    { id: '3', name: 'SODA ASH', sg: '2.50', concentration: '0.5', packageSize: '50', isLiquid: false }
  ]);

  // Local state to handle inputs visual representation in different units without losing precision
  const [localInputs, setLocalInputs] = useState({
    volFinal: '1000',
    densFinal: '12.0',
    saltConc: '111.0',
    wbmD1: '12.5',
    wbmD2: '8.33',
    wbmV1: '400',
    wbmV2: '500'
  });

  const formatInputVal = (key, rawValField) => {
    if (rawValField === '' || rawValField === undefined || rawValField === null) return '';
    const num = parseFloat(rawValField);
    if (isNaN(num)) return rawValField;
    if (unitMode === 'metric') {
      switch (key) {
        case 'volFinal':
        case 'wbmV1':
        case 'wbmV2':
          return (num * 0.158987).toFixed(2);
        case 'densFinal':
        case 'wbmD1':
        case 'wbmD2':
          return Math.round(num * 119.826).toString();
        case 'saltConc':
          return (num * 2.853).toFixed(1);
        default:
          return rawValField;
      }
    } else {
      switch (key) {
        case 'volFinal':
        case 'wbmV1':
        case 'wbmV2':
          return Math.round(num).toString();
        case 'densFinal':
        case 'wbmD1':
        case 'wbmD2':
          return (Math.round(num * 100) / 100).toString();
        case 'saltConc':
          return (Math.round(num * 10) / 10).toString();
        default:
          return rawValField;
      }
    }
  };

  useEffect(() => {
    setLocalInputs(prev => ({
      ...prev,
      volFinal: formatInputVal('volFinal', formSystem.volFinal),
      densFinal: formatInputVal('densFinal', formSystem.densFinal),
      saltConc: formatInputVal('saltConc', formSystem.saltConc),
      wbmD1: formatInputVal('wbmD1', formSystem.wbmD1),
      wbmD2: formatInputVal('wbmD2', formSystem.wbmD2),
      wbmV1: formatInputVal('wbmV1', formSystem.wbmV1),
      wbmV2: formatInputVal('wbmV2', formSystem.wbmV2),
    }));
  }, [unitMode, formSystem.volFinal, formSystem.densFinal, formSystem.saltConc, formSystem.wbmD1, formSystem.wbmD2, formSystem.wbmV1, formSystem.wbmV2]);

  // Automatically recalculate brine properties when WPS or Salt Purity changes
  useEffect(() => {
    if (formType !== 'obm') return;
    const wpsVal = parseFloat(formSystem.wps) || 0;
    const purityVal = parseFloat(formSystem.saltPurity) || 95;
    
    const brineProps = calculateBrineProperties(wpsVal, purityVal);
    
    setFormSystem(prev => {
      const newSgBrine = brineProps.sgBrine.toFixed(5);
      const newWf = brineProps.wf.toFixed(4);
      const newSaltConc = brineProps.saltConc.toFixed(1);
      
      if (
        prev.sgBrine === newSgBrine &&
        prev.wf === newWf &&
        prev.saltConc === newSaltConc
      ) {
        return prev;
      }
      return {
        ...prev,
        sgBrine: newSgBrine,
        wf: newWf,
        saltConc: newSaltConc
      };
    });

    setLocalInputs(prev => {
      const formattedSaltConc = formatInputVal('saltConc', brineProps.saltConc.toString());
      if (prev.saltConc === formattedSaltConc) return prev;
      return {
        ...prev,
        saltConc: formattedSaltConc
      };
    });
  }, [formSystem.wps, formSystem.saltPurity, formType, unitMode]);

  const handleLocalInputChange = (key, val) => {
    setLocalInputs(prev => ({ ...prev, [key]: val }));

    if (val === '') {
      setFormSystem(prev => ({ ...prev, [key]: '' }));
      return;
    }

    const num = parseFloat(val);
    if (isNaN(num)) {
      setFormSystem(prev => ({ ...prev, [key]: val }));
      return;
    }

    let fieldVal = num;
    if (unitMode === 'metric') {
      switch (key) {
        case 'volFinal':
        case 'wbmV1':
        case 'wbmV2':
          fieldVal = num / 0.158987;
          break;
        case 'densFinal':
        case 'wbmD1':
        case 'wbmD2':
          fieldVal = num / 119.826;
          break;
        case 'saltConc':
          fieldVal = num / 2.853;
          break;
      }
    }
    setFormSystem(prev => ({ ...prev, [key]: fieldVal.toString() }));
  };

  // Additives unit display & change helpers
  const getAddConcValue = (add) => {
    const num = parseFloat(add.concentration);
    if (isNaN(num)) return add.concentration;
    if (unitMode === 'metric') {
      return Math.round(num * 2.853 * 100) / 100;
    }
    return num;
  };

  const handleAddConcChange = (addList, setAddList, idx, typedVal) => {
    const newAdd = [...addList];
    if (typedVal === '') {
      newAdd[idx].concentration = '';
    } else {
      const num = parseFloat(typedVal);
      if (isNaN(num)) {
        newAdd[idx].concentration = typedVal;
      } else {
        newAdd[idx].concentration = unitMode === 'metric' ? (num / 2.853).toString() : typedVal;
      }
    }
    setAddList(newAdd);
  };

  const getAddPkgValue = (add) => {
    const num = parseFloat(add.packageSize);
    if (isNaN(num)) return add.packageSize;
    if (unitMode === 'metric') {
      if (add.isLiquid) {
        return Math.round(num * 3.78541 * 10) / 10;
      } else {
        return Math.round(num / 2.20462 * 10) / 10;
      }
    }
    return num;
  };

  const handleAddPkgChange = (addList, setAddList, idx, typedVal) => {
    const newAdd = [...addList];
    if (typedVal === '') {
      newAdd[idx].packageSize = '';
    } else {
      const num = parseFloat(typedVal);
      if (isNaN(num)) {
        newAdd[idx].packageSize = typedVal;
      } else {
        if (unitMode === 'metric') {
          newAdd[idx].packageSize = add.isLiquid 
            ? (num / 3.78541).toString() 
            : (num * 2.20462).toString();
        } else {
          newAdd[idx].packageSize = typedVal;
        }
      }
    }
    setAddList(newAdd);
  };

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
          const valMetric = add.isLiquid ? add.totalValMetric : add.totalKg;
          const uMetric = add.isLiquid ? 'lt' : 'kg';
          txt += `- ${add.name}: ${valMetric.toFixed(2)} ${uMetric} (~${add.sacks} envases de ${add.pkgSize} ${uMetric}) [Conc: ${add.concentration} kg/m³]\n`;
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
          const valField = add.isLiquid ? add.totalVal : add.totalLbs;
          const uField = add.isLiquid ? 'gal' : 'lbs';
          txt += `- ${add.name}: ${valField.toFixed(2)} ${uField} (~${add.sacks} envases de ${add.pkgSize} ${uField}) [Conc: ${add.concentration} ppb]\n`;
        });
      }
    } else {
      txt += `=========================================\n`;
      txt += `  RECETA DE FORMULACIÓN WBM (BAROID)\n`;
      txt += `=========================================\n`;
      const volUnit = isMetric ? "m³" : "bbl";
      const densUnit = isMetric ? "SG" : "ppg";
      const concUnit = isMetric ? "kg/m³" : "ppb";

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
        const val = isMetric ? (add.isLiquid ? add.totalValMetric : add.totalKg) : (add.isLiquid ? add.totalVal : add.totalLbs);
        const unit = isMetric ? (add.isLiquid ? 'lt' : 'kg') : (add.isLiquid ? 'gal' : 'lbs');
        txt += `- ${add.name}: ${val.toFixed(2)} ${unit} (~${add.sacks} envases de ${add.pkgSize} ${unit}) [Conc: ${add.concentration} ${concUnit}]\n`;
      });
    }
    txt += `=========================================\n`;
    copyToClipboard(txt);
  };

  const getFormulationResult = () => {
    // Inputs globales (siempre en unidades de campo)
    const vf = parseFloat(formSystem.volFinal) || 0;
    const df = parseFloat(formSystem.densFinal) || 0;
    
    if (formType === 'obm') {
      const owrOil = parseFloat(formSystem.owrOil) || 0;
      const owrWater = parseFloat(formSystem.owrWater) || 0;
      const wps = parseFloat(formSystem.wps) || 0;
      const wf = parseFloat(formSystem.wf) || 0;
      const saltConc = parseFloat(formSystem.saltConc) || 0;

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
        const sg = parseFloat(add.sg) || 1.0;
        const conc = parseFloat(add.concentration) || 0; // ppb
        const pkgSizeVal = parseFloat(add.packageSize) || (add.isLiquid ? 5 : 50);

        let pkg = pkgSizeVal;
        if (add.isLiquid) {
          pkg = pkgSizeVal * sg * 8.345; // pkg size in lbs
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
      
      const massSalt_kg = massSalt / 2.20462;
      const sacksSalt = unitMode === 'metric' 
        ? Math.ceil(massSalt_kg / 25) // 25 kg bags
        : Math.ceil(massSalt / 50);          // 50 lb bags
      
      const massWM = volWM * dWm * 42; // lbs
      const massWM_kg = massWM / 2.20462;
      const sacksWM = unitMode === 'metric'
        ? Math.ceil(massWM_kg / 50)  // 50 kg bags
        : Math.ceil(massWM / 100);           // 100 lb bags

      // Aditivos
      const finalAdditives = abcAdditives.map(add => {
        const totalLbs = add.totalLbs;
        const totalKg = totalLbs / 2.20462;
        const sgVal = parseFloat(add.sg) || 1.0;
        const pkgSizeVal = parseFloat(add.packageSize) || (add.isLiquid ? 5 : 50);
        
        let totalVal = 0;
        let totalValMetric = 0;
        let unitLabelField = 'lb';
        let unitLabelMetric = 'kg';
        let sacks = 0;

        if (add.isLiquid) {
          const totalGal = totalLbs / (sgVal * 8.345);
          const totalLiters = totalKg / sgVal;
          totalVal = totalGal;
          totalValMetric = totalLiters;
          unitLabelField = 'gal';
          unitLabelMetric = 'lt';
          sacks = Math.ceil(totalGal / pkgSizeVal);
        } else {
          totalVal = totalLbs;
          totalValMetric = totalKg;
          unitLabelField = 'lb';
          unitLabelMetric = 'kg';
          sacks = Math.ceil(totalLbs / pkgSizeVal);
        }

        return {
          name: add.name,
          isLiquid: add.isLiquid,
          concentration: getAddConcValue(add),
          totalLbs: totalLbs,
          totalKg: totalKg,
          volDisp: add.volDisp,
          sacks: sacks,
          pkgSize: getAddPkgValue(add),
          totalVal,
          totalValMetric,
          unitLabelField,
          unitLabelMetric
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
        dFaseFluida_gL: dFaseFluida * 119.826,
        dFaseFluida_sg: dFaseFluida / 8.345,
        volWM,
        volWM_m3: volWM * 0.158987,
        massWM,
        massWM_kg,
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
        massSalt_kg,
        sacksSalt,
        finalAdditives,
        vf,
        df
      };
    } else {
      // WBM Mode
      const d1 = parseFloat(formSystem.wbmD1) || 0;
      const d2 = parseFloat(formSystem.wbmD2) || 0;
      const wbmMode = formSystem.wbmMode;

      // 1. Desplazamiento de Aditivos (WBM)
      let V_c = 0; // bbl
      let G_total = 0; // bbl * ppg
      const abcAdditives = wbmAdditives.map(add => {
        const sg = parseFloat(add.sg) || 1.0;
        const conc = parseFloat(add.concentration) || 0; // ppb
        const pkgSizeVal = parseFloat(add.packageSize) || (add.isLiquid ? 5 : 50);

        let pkg = pkgSizeVal;
        if (add.isLiquid) {
          pkg = pkgSizeVal * sg * 8.345;
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
          const sgVal = parseFloat(add.sg) || 1.0;
          const pkgSizeVal = parseFloat(add.packageSize) || (add.isLiquid ? 5 : 50);
          
          let totalVal = 0;
          let totalValMetric = 0;
          let unitLabelField = 'lb';
          let unitLabelMetric = 'kg';
          let sacks = 0;

          if (add.isLiquid) {
            const totalGal = totalLbs / (sgVal * 8.345);
            const totalLiters = totalKg / sgVal;
            totalVal = totalGal;
            totalValMetric = totalLiters;
            unitLabelField = 'gal';
            unitLabelMetric = 'lt';
            sacks = Math.ceil(totalGal / pkgSizeVal);
          } else {
            totalVal = totalLbs;
            totalValMetric = totalKg;
            unitLabelField = 'lb';
            unitLabelMetric = 'kg';
            sacks = Math.ceil(totalLbs / pkgSizeVal);
          }

          return {
            name: add.name,
            isLiquid: add.isLiquid,
            concentration: getAddConcValue(add),
            totalLbs: totalLbs,
            totalKg: totalKg,
            volDisp: add.volDisp,
            sacks: sacks,
            pkgSize: getAddPkgValue(add),
            totalVal,
            totalValMetric,
            unitLabelField,
            unitLabelMetric
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
          v1_m3: v1 * 0.158987,
          v2_m3: v2 * 0.158987,
          vc: V_c,
          vc_m3: V_c * 0.158987,
          gTotal: G_total,
          vf: unitMode === 'metric' ? vf * 0.158987 : vf,
          df: unitMode === 'metric' ? df * 119.826 : df,
          vf_bbl: vf,
          df_ppg: df,
          v1_display: v1,
          v2_display: v2,
          d1: d1,
          d2: d2,
          finalAdditives
        };
      } else {
        // Blend Mode
        let v1 = parseFloat(formSystem.wbmV1) || 0;
        let v2 = parseFloat(formSystem.wbmV2) || 0;

        const vFinalCalculated = v1 + v2 + V_c; // bbl
        const dFinalCalculated = vFinalCalculated > 0 ? (v1 * d1 + v2 * d2 + G_total) / vFinalCalculated : 0; // ppg

        const finalAdditives = abcAdditives.map(add => {
          const totalLbs = add.totalLbs;
          const totalKg = totalLbs / 2.20462;
          const sgVal = parseFloat(add.sg) || 1.0;
          const pkgSizeVal = parseFloat(add.packageSize) || (add.isLiquid ? 5 : 50);
          
          let totalVal = 0;
          let totalValMetric = 0;
          let unitLabelField = 'lb';
          let unitLabelMetric = 'kg';
          let sacks = 0;

          if (add.isLiquid) {
            const totalGal = totalLbs / (sgVal * 8.345);
            const totalLiters = totalKg / sgVal;
            totalVal = totalGal;
            totalValMetric = totalLiters;
            unitLabelField = 'gal';
            unitLabelMetric = 'lt';
            sacks = Math.ceil(totalGal / pkgSizeVal);
          } else {
            totalVal = totalLbs;
            totalValMetric = totalKg;
            unitLabelField = 'lb';
            unitLabelMetric = 'kg';
            sacks = Math.ceil(totalLbs / pkgSizeVal);
          }

          return {
            name: add.name,
            isLiquid: add.isLiquid,
            concentration: getAddConcValue(add),
            totalLbs: totalLbs,
            totalKg: totalKg,
            volDisp: add.volDisp,
            sacks: sacks,
            pkgSize: getAddPkgValue(add),
            totalVal,
            totalValMetric,
            unitLabelField,
            unitLabelMetric
          };
        });

        return {
          invalid: false,
          type: 'wbm',
          mode: 'blend',
          abcAdditives,
          v1: unitMode === 'metric' ? v1 * 0.158987 : v1,
          v2: unitMode === 'metric' ? v2 * 0.158987 : v2,
          v1_bbl: v1,
          v2_bbl: v2,
          v1_m3: v1 * 0.158987,
          v2_m3: v2 * 0.158987,
          vc: V_c,
          vc_m3: V_c * 0.158987,
          gTotal: G_total,
          vf: unitMode === 'metric' ? vFinalCalculated * 0.158987 : vFinalCalculated,
          df: unitMode === 'metric' ? dFinalCalculated * 119.826 : dFinalCalculated,
          vf_bbl: vFinalCalculated,
          df_ppg: dFinalCalculated,
          v1_display: v1,
          v2_display: v2,
          d1: d1,
          d2: d2,
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
                        value={localInputs.volFinal}
                        onChange={e => handleLocalInputChange('volFinal', e.target.value)}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder={unitMode === 'field' ? "1000" : "159"}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                        {t.formFinalDensity} (Df - {unitMode === 'field' ? 'ppg' : 'g/L'})
                      </label>
                      <input
                        type="number"
                        value={localInputs.densFinal}
                        onChange={e => handleLocalInputChange('densFinal', e.target.value)}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder={unitMode === 'field' ? "12.0" : "1440"}
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
                  
                  {/* Modifiable parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">{t.formWps} (ppm)</label>
                      <input
                        type="number"
                        value={formSystem.wps}
                        onChange={e => setFormSystem({ ...formSystem, wps: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="250000"
                        min="0"
                        max="400000"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">{t.formSaltPurity}</label>
                      <input
                        type="number"
                        value={formSystem.saltPurity}
                        onChange={e => setFormSystem({ ...formSystem, saltPurity: e.target.value })}
                        className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                        placeholder="95"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  {/* Informative text about Salt Purity */}
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                    {t.formSaltPurityDesc}
                  </div>

                  {/* Calculated/ReadOnly parameters */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-100/50 dark:border-zinc-800/50">
                    <div>
                      <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">{t.formBrineDens} (SG)</label>
                      <input
                        type="number"
                        value={formSystem.sgBrine}
                        readOnly={true}
                        className="w-full input-style text-xs font-bold bg-zinc-100/70 dark:bg-slate-800/80 text-zinc-500 dark:text-zinc-400 cursor-not-allowed border-zinc-200/50 dark:border-zinc-700/50"
                        placeholder="1.23100"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">{t.formWaterFactor} (WF)</label>
                      <input
                        type="number"
                        value={formSystem.wf}
                        readOnly={true}
                        className="w-full input-style text-xs font-bold bg-zinc-100/70 dark:bg-slate-800/80 text-zinc-500 dark:text-zinc-400 cursor-not-allowed border-zinc-200/50 dark:border-zinc-700/50"
                        placeholder="0.9100"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">
                        {t.formSaltConc} ({unitMode === 'field' ? 'ppb' : 'kg/m³'})
                      </label>
                      <input
                        type="number"
                        value={localInputs.saltConc}
                        readOnly={true}
                        className="w-full input-style text-xs font-bold bg-zinc-100/70 dark:bg-slate-800/80 text-zinc-500 dark:text-zinc-400 cursor-not-allowed border-zinc-200/50 dark:border-zinc-700/50"
                        placeholder="111.0"
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
                    <div className="col-span-3">Nombre Producto</div>
                    <div className="col-span-2 text-center">Tipo</div>
                    <div className="col-span-2 text-center">SG</div>
                    <div className="col-span-2 text-center">Conc ({unitMode === 'field' ? 'ppb' : 'kg/m³'})</div>
                    <div className="col-span-2 text-center">Empaque ({unitMode === 'field' ? 'lb' : 'kg/lt'})</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="space-y-3">
                    {obmAdditives.map((add, idx) => (
                      <div key={add.id} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 shadow-sm relative group/row">
                        <div className="col-span-3">
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
                          <select
                            value={add.isLiquid ? 'liquid' : 'solid'}
                            onChange={e => {
                              const isLiq = e.target.value === 'liquid';
                              const newAdd = [...obmAdditives];
                              newAdd[idx].isLiquid = isLiq;
                              if (isLiq) {
                                newAdd[idx].packageSize = unitMode === 'field' ? '5' : (20 / 3.78541).toString();
                              } else {
                                newAdd[idx].packageSize = unitMode === 'field' ? '50' : (25 * 2.20462).toString();
                              }
                              setObmAdditives(newAdd);
                            }}
                            className="w-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold focus:border-halliburton-red outline-none shadow-inner"
                          >
                            <option value="solid">Sólido</option>
                            <option value="liquid">Líquido</option>
                          </select>
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
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={getAddConcValue(add)}
                            onChange={e => handleAddConcChange(obmAdditives, setObmAdditives, idx, e.target.value)}
                            className="w-full bg-yellow-500/5 dark:bg-yellow-500/5 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder={unitMode === 'field' ? "Conc (ppb)" : "Conc (kg/m³)"}
                            step="0.1"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={getAddPkgValue(add)}
                            onChange={e => handleAddPkgChange(obmAdditives, setObmAdditives, idx, e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder={add.isLiquid ? (unitMode === 'field' ? "Env. gal" : "Env. lt") : (unitMode === 'field' ? "Env. lb" : "Env. kg")}
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
                      value={localInputs.volFinal}
                      onChange={e => handleLocalInputChange('volFinal', e.target.value)}
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
                            Df ({unitMode === 'field' ? 'ppg' : 'g/L'})
                          </label>
                          <input
                            type="number"
                            value={localInputs.densFinal}
                            onChange={e => handleLocalInputChange('densFinal', e.target.value)}
                            className="w-full input-style text-sm font-bold bg-yellow-500/5 focus:bg-white text-center"
                            placeholder={unitMode === 'field' ? "11.5" : "1380"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tight mb-1 block">
                            D1 ({unitMode === 'field' ? 'ppg' : 'g/L'})
                          </label>
                          <input
                            type="number"
                            value={localInputs.wbmD1}
                            onChange={e => handleLocalInputChange('wbmD1', e.target.value)}
                            className="w-full input-style text-sm font-bold bg-yellow-500/5 focus:bg-white text-center"
                            placeholder={unitMode === 'field' ? "12.5" : "1500"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tight mb-1 block">
                            D2 ({unitMode === 'field' ? 'ppg' : 'g/L'})
                          </label>
                          <input
                            type="number"
                            value={localInputs.wbmD2}
                            onChange={e => handleLocalInputChange('wbmD2', e.target.value)}
                            className="w-full input-style text-sm font-bold bg-yellow-500/5 focus:bg-white text-center"
                            placeholder={unitMode === 'field' ? "8.33" : "1000"}
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
                            value={localInputs.wbmV1}
                            onChange={e => handleLocalInputChange('wbmV1', e.target.value)}
                            className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                            placeholder={unitMode === 'field' ? "400" : "63.6"}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                            D1 ({unitMode === 'field' ? 'ppg' : 'g/L'})
                          </label>
                          <input
                            type="number"
                            value={localInputs.wbmD1}
                            onChange={e => handleLocalInputChange('wbmD1', e.target.value)}
                            className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                            placeholder={unitMode === 'field' ? "12.5" : "1500"}
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
                            value={localInputs.wbmV2}
                            onChange={e => handleLocalInputChange('wbmV2', e.target.value)}
                            className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                            placeholder={unitMode === 'field' ? "500" : "79.5"}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block">
                            D2 ({unitMode === 'field' ? 'ppg' : 'g/L'})
                          </label>
                          <input
                            type="number"
                            value={localInputs.wbmD2}
                            onChange={e => handleLocalInputChange('wbmD2', e.target.value)}
                            className="w-full input-style text-lg font-bold bg-yellow-500/5 focus:bg-white"
                            placeholder={unitMode === 'field' ? "8.33" : "1000"}
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
                    <div className="col-span-3">Nombre Producto</div>
                    <div className="col-span-2 text-center">Tipo</div>
                    <div className="col-span-2 text-center">SG</div>
                    <div className="col-span-2 text-center">Conc ({unitMode === 'field' ? 'ppb' : 'kg/m³'})</div>
                    <div className="col-span-2 text-center">Empaque ({unitMode === 'field' ? 'lb' : 'kg/lt'})</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="space-y-3">
                    {wbmAdditives.map((add, idx) => (
                      <div key={add.id} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 shadow-sm relative group/row">
                        <div className="col-span-3">
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
                          <select
                            value={add.isLiquid ? 'liquid' : 'solid'}
                            onChange={e => {
                              const isLiq = e.target.value === 'liquid';
                              const newAdd = [...wbmAdditives];
                              newAdd[idx].isLiquid = isLiq;
                              if (isLiq) {
                                newAdd[idx].packageSize = unitMode === 'field' ? '5' : (20 / 3.78541).toString();
                              } else {
                                newAdd[idx].packageSize = unitMode === 'field' ? '50' : (25 * 2.20462).toString();
                              }
                              setWbmAdditives(newAdd);
                            }}
                            className="w-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold focus:border-halliburton-red outline-none shadow-inner"
                          >
                            <option value="solid">Sólido</option>
                            <option value="liquid">Líquido</option>
                          </select>
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
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={getAddConcValue(add)}
                            onChange={e => handleAddConcChange(wbmAdditives, setWbmAdditives, idx, e.target.value)}
                            className="w-full bg-yellow-500/5 dark:bg-yellow-500/5 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder={unitMode === 'field' ? "Conc (ppb)" : "Conc (kg/m³)"}
                            step="0.1"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={getAddPkgValue(add)}
                            onChange={e => handleAddPkgChange(wbmAdditives, setWbmAdditives, idx, e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-xs font-bold text-center focus:border-halliburton-red outline-none"
                            placeholder={add.isLiquid ? (unitMode === 'field' ? "Env. gal" : "Env. lt") : (unitMode === 'field' ? "Env. lb" : "Env. kg")}
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
                              {unitMode === 'field' ? res.dFaseFluida.toFixed(2) : res.dFaseFluida_gL.toFixed(0)}
                            </h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{unitMode === 'field' ? 'PPG' : 'g/L'}</span>
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
                              {unitMode === 'field' ? res.df.toFixed(2) : res.df.toFixed(0)}
                            </h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{unitMode === 'field' ? 'PPG' : 'g/L'}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Breakdown & Packaging Recipe */}
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block border-b border-white/5 pb-2">
                      Receta de Mezclado Comercial ({unitMode === 'field' ? 'LBS / GAL' : 'KG / LT'} & {unitMode === 'field' ? 'BBL' : 'M³'})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
                      {res.type === 'obm' ? (
                        <>
                          {/* Aceite Base (NAP) */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">{t.formBaseOil}</span>
                            <div className="flex justify-between items-baseline">
                              {unitMode === 'field' ? (
                                <span className="text-white text-base">{res.volNap.toFixed(2)} bbl</span>
                              ) : (
                                <span className="text-white text-base">{res.volNap_m3.toFixed(2)} m³</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Agua Dulce */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">{t.formWater}</span>
                            <div className="flex justify-between items-baseline">
                              {unitMode === 'field' ? (
                                <span className="text-white text-base">{res.volWater.toFixed(2)} bbl</span>
                              ) : (
                                <span className="text-white text-base">{res.volWater_m3.toFixed(2)} m³</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Sal Seca */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">{t.formSalt}</span>
                            <div className="flex justify-between items-baseline">
                              {unitMode === 'field' ? (
                                <>
                                  <span className="text-white text-base">{res.massSalt.toFixed(1)} lb</span>
                                  <span className="inline-block px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-mono font-bold">~{res.sacksSalt} sacos (50 lb)</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-white text-base">{res.massSalt_kg.toFixed(1)} kg</span>
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
                                  <span className="text-white text-base">{res.massWM.toFixed(0)} lb</span>
                                  <span className="inline-block px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-[9px] font-mono font-bold">~{res.sacksWM} sacos (100 lb)</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-white text-base">{res.massWM_kg.toFixed(0)} kg</span>
                                  <span className="inline-block px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-[9px] font-mono font-bold">~{res.sacksWM} sacos (50 kg)</span>
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
                                {res.v1.toFixed(2)} {unitMode === 'field' ? 'bbl' : 'm³'}
                              </span>
                              <span className="text-zinc-400 text-[10px] font-mono">
                                D: {unitMode === 'field' ? res.d1.toFixed(2) + ' ppg' : res.d1.toFixed(0) + ' g/L'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Diluyente 2 */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2">
                            <span className="text-zinc-400 text-[10px]">Diluyente 2</span>
                            <div className="flex justify-between items-baseline">
                              <span className="text-white text-base">
                                {res.v2.toFixed(2)} {unitMode === 'field' ? 'bbl' : 'm³'}
                              </span>
                              <span className="text-zinc-400 text-[10px] font-mono">
                                D: {unitMode === 'field' ? res.d2.toFixed(2) + ' ppg' : res.d2.toFixed(0) + ' g/L'}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Chemical Additives */}
                      {res.finalAdditives.map((add, idx) => {
                        let massPrimary = "";
                        let sacksLabel = "";

                        if (add.isLiquid) {
                          massPrimary = unitMode === 'field' ? `${add.totalVal.toFixed(1)} gal` : `${add.totalValMetric.toFixed(1)} lt`;
                          sacksLabel = unitMode === 'field' ? `~${add.sacks} envases (${add.pkgSize} gal)` : `~${add.sacks} envases (${add.pkgSize} lt)`;
                        } else {
                          massPrimary = unitMode === 'field' ? `${add.totalLbs.toFixed(1)} lb` : `${add.totalKg.toFixed(1)} kg`;
                          sacksLabel = unitMode === 'field' ? `~${add.sacks} envases (${add.pkgSize} lb)` : `~${add.sacks} envases (${add.pkgSize} kg)`;
                        }
                        
                        return (
                          <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl col-span-1 md:col-span-2 flex flex-col justify-between space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>{add.name || `Aditivo ${idx + 1}`}</span>
                              <span className="font-mono">Conc: {add.concentration} {unitMode === 'field' ? 'ppb' : 'kg/m³'}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-white text-base">
                                {massPrimary}
                              </span>
                              <span className="inline-block px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-mono font-bold">{sacksLabel}</span>
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
