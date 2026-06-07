import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const FluidCalculator = ({ isEditing }) => {
  const [activeSubTab, setActiveSubTab] = useState('conv'); // 'conv', 'barite', 'mixing', 'eng', 'owr', 'slug', 'fit', 'pfmf', 'lgs'
  const [unitMode, setUnitMode] = useState('field');

  // Engineering State
  const [eng, setEng] = useState({ dens: '', depth: '', diam: '' });

  // Barite State
  const [barite, setBarite] = useState({ vol: '', d1: '', d2: '', sg: '4.2' });

  // Mixing State
  const [mix, setMix] = useState([
    { vol: '', dens: '' },
    { vol: '', dens: '' },
    { vol: '', dens: '' }
  ]);

  // Slug State
  const [slug, setSlug] = useState({ lengthSeca: '', idDP: '', densMud: '', densSlug: '', safetyPressure: '200', valveResist: '', mpdSBP: '', volToPrepare: '' });
  const [showAdvancedSlug, setShowAdvancedSlug] = useState(false);

  // OWR State
  const [owr, setOwr] = useState({ vOil: '', vWater: '', targetRatio: '80', volCondition: '' });

  // FIT State
  const [fit, setFit] = useState({ targetEMW: '', currentMW: '', shoeTVD: '' });

  // Pf/Mf State
  const [titration, setTitration] = useState({ pf: '', mf: '', ca: '', pom: '' });

  // LGS Dilution State
  const [lgs, setLgs] = useState({ v1: '', c1: '', c2: '', cf: '' });

  // LGS Advanced Retort State
  const [lgsRetort, setLgsRetort] = useState({
    vWater: '30',
    vOil: '50',
    mudWeight: '10.0',
    mlAgNo3: '12.0',
    normality: '0.282',
    mlSample: '2.0',
    sgLgs: '2.60',
    sgBarite: '4.20',
    hasBarite: true
  });

  // Mixing Densification State
  const [mixTargetDens, setMixTargetDens] = useState('');
  const [mixBariteSg, setMixBariteSg] = useState('4.2');

  // Rheology State
  const [rheo, setRheo] = useState({ vp: '20', yp: '15', tau0: '6' });
  const [rheoSelectedRpm, setRheoSelectedRpm] = useState(600);
  const [rheoActiveX, setRheoActiveX] = useState('rate'); // 'rate' or 'rpm'

  // Treatment Visibility State
  const [treatmentConfig, setTreatmentConfig] = useState(() => {
    const DEFAULT_TREATMENT = [
      { id: 'lime', label: 'Cal (Limpiar Carb.)', visible: true },
      { id: 'sodaAsh', label: 'Soda Ash (Rem. Ca++)', visible: true },
      { id: 'sodiumBicarb', label: 'Bicarb. (Rem. Ca++)', visible: true }
    ];
    const saved = localStorage.getItem('baroid_treatment_config');
    if (!saved) return DEFAULT_TREATMENT;
    try {
      const parsed = JSON.parse(saved);
      const merged = [...parsed];
      DEFAULT_TREATMENT.forEach(defTreat => {
        if (!merged.some(t => t.id === defTreat.id)) {
          merged.push(defTreat);
        }
      });
      return merged;
    } catch (e) {
      return DEFAULT_TREATMENT;
    }
  });

  const [tabsConfig, setTabsConfig] = useState(() => {
    const DEFAULT_TABS = [
      { id: 'conv', label: 'Conversor de Unidades', icon: 'repeat', visible: true },
      { id: 'barite', label: 'Ajuste de Densidad', icon: 'arrow-up-circle', visible: true },
      { id: 'mixing', label: 'Mezcla (Balance Masa)', icon: 'blend', visible: true },
      { id: 'lgs_retort', label: 'Cálculo LGS & Retorta', icon: 'percent', visible: true },
      { id: 'lgs', label: 'Dilución LGS', icon: 'sliders', visible: true },
      { id: 'owr', label: 'Relación Aceite/Agua', icon: 'droplets', visible: true },
      { id: 'eng', label: 'Hidrostática & Capacidad', icon: 'droplet', visible: true },
      { id: 'slug', label: 'Píldoras (Slugs)', icon: 'flask-conical', visible: true },
      { id: 'fit', label: 'Integridad (FIT)', icon: 'shield-check', visible: true },
      { id: 'pfmf', label: 'Pf/Mf & Tratamiento', icon: 'beaker', visible: true },
      { id: 'rheology', label: 'Perfil Reológico', icon: 'trending-up', visible: true }
    ];
    const saved = localStorage.getItem('baroid_calc_tabs_v6');
    if (!saved) return DEFAULT_TABS;
    try {
      const parsed = JSON.parse(saved);
      const merged = [...parsed];
      DEFAULT_TABS.forEach(defTab => {
        if (!merged.some(t => t.id === defTab.id)) {
          merged.push(defTab);
        }
      });
      return merged;
    } catch (e) {
      return DEFAULT_TABS;
    }
  });

  useEffect(() => {
    localStorage.setItem('baroid_treatment_config', JSON.stringify(treatmentConfig));
  }, [treatmentConfig]);

  useEffect(() => {
    localStorage.setItem('baroid_calc_tabs_v6', JSON.stringify(tabsConfig));
  }, [tabsConfig]);

  // Special Hybrid Units for Mixing and Barite
  const [mixUnits, setMixUnits] = useState({
    vol: unitMode === 'metric' ? 'm3' : 'bbl',
    dens: unitMode === 'metric' ? 'gL' : 'ppg'
  });

  const [bariteUnits, setBariteUnits] = useState({
    vol: unitMode === 'metric' ? 'm3' : 'bbl',
    dens: unitMode === 'metric' ? 'gL' : 'ppg'
  });

  useEffect(() => {
    const volUnit = unitMode === 'metric' ? 'm3' : 'bbl';
    const densUnit = unitMode === 'metric' ? 'gL' : 'ppg';
    setMixUnits({ vol: volUnit, dens: densUnit });
    setBariteUnits({ vol: volUnit, dens: densUnit });
  }, [unitMode]);

  // Conversion State
  const [convVal, setConvVal] = useState('');
  const [convReverse, setConvReverse] = useState(false);

  // Helpers
  const ppgToGL = (val) => val * 119.826;
  const glToPPG = (val) => val / 119.826;
  const mToFt = (val) => val * 3.28084;
  const ftToM = (val) => val / 3.28084;
  const bblToM3 = (val) => val * 0.158987;
  const m3ToBbl = (val) => val / 0.158987;
  const psiToKgCm2 = (val) => val * 0.070307;

  const getHydrostatic = () => {
    if (!eng.dens || !eng.depth) return 0;
    const densVal = parseFloat(eng.dens);
    const depthVal = parseFloat(eng.depth);
    if (isNaN(densVal) || isNaN(depthVal)) return 0;
    const dppg = unitMode === 'field' ? densVal : glToPPG(densVal);
    const dft = unitMode === 'field' ? depthVal : mToFt(depthVal);
    return (0.052 * dppg * dft).toFixed(2);
  };

  const getBariteTons = () => {
    const { vol, d1, d2 } = barite;
    if (!vol || !d1 || !d2) return 0;

    let v_m3 = bariteUnits.vol === 'm3' ? parseFloat(vol) : bblToM3(parseFloat(vol));
    let sg1 = bariteUnits.dens === 'gL' ? parseFloat(d1) / 1000 : parseFloat(d1) / 8.33;
    let sg2 = bariteUnits.dens === 'gL' ? parseFloat(d2) / 1000 : parseFloat(d2) / 8.33;

    if (isNaN(v_m3) || isNaN(sg1) || isNaN(sg2)) return 0;
    if (sg2 <= sg1) return 0;
    const sgB = parseFloat(barite.sg) || 4.2;
    if (isNaN(sgB) || sg2 >= sgB) return 0;

    const tons = v_m3 * (sg2 - sg1) / (sgB - sg2) * sgB;
    return tons.toFixed(2);
  };

  const getSlugResult = () => {
    const { lengthSeca, idDP, densMud, densSlug, safetyPressure, valveResist, mpdSBP, volToPrepare } = slug;

    let c = 0;
    let c_val = 0;
    let cField_local = 0;
    if (idDP && !isNaN(parseFloat(idDP))) {
      const id = parseFloat(idDP);
      cField_local = (id ** 2) / 1029.4;
      const cMetric = cField_local * 0.52161;
      c_val = unitMode === 'field' ? cField_local : cMetric;
      c = c_val.toFixed(5);
    }

    if (!lengthSeca || !idDP || !densMud || !densSlug) {
      return { volReq: 0, volFinal: 0, tons: 0, volInitial: 0, currentCap: c };
    }

    const dm = parseFloat(densMud);
    const ds = parseFloat(densSlug);
    const l = parseFloat(lengthSeca);

    const pSafe = parseFloat(safetyPressure || 0);
    const pValve = parseFloat(valveResist || 0);
    const pMPD = parseFloat(mpdSBP || 0);
    const totalExtraPressure = (isNaN(pSafe) ? 0 : pSafe) + (isNaN(pValve) ? 0 : pValve) + (isNaN(pMPD) ? 0 : pMPD);

    if (isNaN(dm) || isNaN(ds) || isNaN(l) || ds <= dm) {
      return { volReq: 0, volFinal: 0, tons: 0, volInitial: 0, currentCap: c };
    }

    const dm_ppg = unitMode === 'field' ? dm : glToPPG(dm);
    const ds_ppg = unitMode === 'field' ? ds : glToPPG(ds);
    const l_ft = unitMode === 'field' ? l : mToFt(l);

    const denominator = 0.052 * (ds_ppg - dm_ppg);
    if (denominator <= 0) return { volReq: 0, volFinal: 0, tons: 0, volInitial: 0, currentCap: c };

    const hSlug_ft = (l_ft * dm_ppg * 0.052 + totalExtraPressure) / denominator;
    const vSlugReq_bbl = hSlug_ft * cField_local;

    const vSlugReq = unitMode === 'field' ? vSlugReq_bbl : bblToM3(vSlugReq_bbl);
    const vFinal = parseFloat(volToPrepare) || vSlugReq;

    const sg_slug = ds_ppg / 8.33;
    const sg_mud = dm_ppg / 8.33;
    const sg_barite = 4.2;

    const denInitial = sg_barite - sg_mud;
    const volInitial = denInitial <= 0 ? 0 : vFinal * (sg_barite - sg_slug) / denInitial;

    const denLbs = 35.0 - ds_ppg;
    const lbsPerBbl = denLbs <= 0 ? 0 : (1470 * (ds_ppg - dm_ppg)) / denLbs;
    const vol_bbl_initial = unitMode === 'field' ? volInitial : m3ToBbl(volInitial);
    const totalLbs = lbsPerBbl * vol_bbl_initial;
    const totalTons = totalLbs / 2204.62;

    return {
      volReq: isNaN(vSlugReq) ? 0 : vSlugReq.toFixed(2),
      volFinal: isNaN(vFinal) ? 0 : vFinal.toFixed(2),
      tons: isNaN(totalTons) ? 0 : totalTons.toFixed(2),
      volInitial: isNaN(volInitial) ? 0 : volInitial.toFixed(2),
      currentCap: c
    };
  };

  const getOWRResult = () => {
    const { vOil, vWater, targetRatio, volCondition } = owr;
    if (!vOil && !vWater) return { current: '0/0', addOil: 0, addWater: 0, solids: '-', finalVol: 0 };

    const vo = parseFloat(vOil) || 0;
    const vw = parseFloat(vWater) || 0;
    const volCond = parseFloat(volCondition) || 1; // Default to 1 to show unit factor if not specified

    const solids = (100 - vo - vw).toFixed(1);
    const total = vo + vw;
    if (total === 0) return { current: '0/0', addOil: 0, addWater: 0, solids: '100', finalVol: 0 };

    const currentRatioOil = (vo / total) * 100;
    const currentRatioWater = (vw / total) * 100;

    const target = parseFloat(targetRatio) || 80;
    const targetPerm = 100 - target;

    const rw = vw / total;
    const ro = vo / total;
    const pw = targetPerm / 100;
    const po = target / 100;

    const addOilFactor = pw <= 0 ? 0 : Math.max(0, (rw / pw) - rw - ro);
    const addWaterFactor = po <= 0 ? 0 : Math.max(0, (ro / po) - rw - ro);

    const actualAddOil = addOilFactor * volCond;
    const actualAddWater = addWaterFactor * volCond;
    const finalVol = volCondition ? (volCond + actualAddOil + actualAddWater) : 0;

    return {
      current: `${currentRatioOil.toFixed(1)}/${currentRatioWater.toFixed(1)}`,
      addOil: actualAddOil.toFixed(2),
      addWater: actualAddWater.toFixed(2),
      oilPct: currentRatioOil,
      waterPct: currentRatioWater,
      solids: solids,
      finalVol: finalVol.toFixed(2),
      invalid: false
    };
  };

  const getPfMfResult = () => {
    const pf = parseFloat(titration.pf) || 0;
    const mf = parseFloat(titration.mf) || 0;
    const ca = parseFloat(titration.ca) || 0;

    if (isNaN(pf) || isNaN(mf) || isNaN(ca) || pf < 0 || mf < 0 || ca < 0 || pf > mf) {
      return {
        oh: '-',
        co3: '-',
        hco3: '-',
        lime: '-',
        sodaAsh: '-',
        sodiumBicarb: '-',
        invalid: true
      };
    }

    let oh = 0, co3 = 0, hco3 = 0;

    if (pf === 0) {
      hco3 = 1220 * mf;
    } else if (2 * pf < mf) {
      co3 = 1200 * pf;
      hco3 = 1220 * (mf - 2 * pf);
    } else if (2 * pf === mf) {
      co3 = 1200 * pf;
    } else if (2 * pf > mf && pf < mf) {
      oh = 340 * (2 * pf - mf);
      co3 = 1200 * (mf - pf);
    } else if (pf === mf) {
      oh = 340 * mf;
    }

    const factor = unitMode === 'field' ? 1 : 2.853;

    return {
      oh: oh.toFixed(0),
      co3: co3.toFixed(0),
      hco3: hco3.toFixed(0),
      lime: (0.00043 * (co3 + hco3) * factor).toFixed(3),
      sodaAsh: (0.000925 * ca * factor).toFixed(3),
      sodiumBicarb: (0.000734 * ca * factor).toFixed(3),
      invalid: false
    };
  };

  const getFITResult = () => {
    const { targetEMW: temw, currentMW: cmw, shoeTVD: tvd } = fit;
    if (!temw || !cmw || !tvd) return { surface: 0, total: 0, hydrostatic: 0, surfacePSI: 0 };

    const target = parseFloat(temw);
    const current = parseFloat(cmw);
    const depth = parseFloat(tvd);

    if (isNaN(target) || isNaN(current) || isNaN(depth) || target <= current) {
      return { surface: 0, total: 0, hydrostatic: 0, surfacePSI: 0 };
    }

    let surface = 0;
    let hydro = 0;
    let surfacePSI = 0;

    if (unitMode === 'field') {
      surface = (target - current) * 0.052 * depth;
      hydro = current * 0.052 * depth;
      surfacePSI = surface;
    } else {
      surface = (target - current) * depth * 0.0001;
      hydro = current * depth * 0.0001;
      surfacePSI = surface / 0.070307;
    }

    return {
      surface: surface.toFixed(1),
      hydrostatic: hydro.toFixed(1),
      total: (surface + hydro).toFixed(1),
      surfacePSI: surfacePSI.toFixed(1)
    };
  };

  const getMixingResult = () => {
    let totalVol = 0;
    let totalMass = 0;
    mix.forEach(f => {
      if (f.vol && f.dens) {
        const v = parseFloat(f.vol);
        const d = parseFloat(f.dens);
        if (!isNaN(v) && !isNaN(d) && v >= 0 && d >= 0) {
          totalVol += v;
          totalMass += v * d;
        }
      }
    });
    if (totalVol === 0) return { dens: 0, vol: 0 };
    return { dens: (totalMass / totalVol).toFixed(2), vol: totalVol.toFixed(2) };
  };

  const getMixDensificationTons = () => {
    const mixRes = getMixingResult();
    const vol = parseFloat(mixRes.vol) || 0;
    const d1 = parseFloat(mixRes.dens) || 0;
    const d2 = parseFloat(mixTargetDens) || 0;
    const sgB = parseFloat(mixBariteSg) || 4.2;

    if (vol <= 0 || d1 <= 0 || d2 <= 0 || isNaN(vol) || isNaN(d1) || isNaN(d2) || isNaN(sgB)) return 0;
    if (d2 <= d1) return 0;

    let v_m3 = mixUnits.vol === 'm3' ? vol : bblToM3(vol);
    let sg1 = mixUnits.dens === 'gL' ? d1 / 1000 : d1 / 8.33;
    let sg2 = mixUnits.dens === 'gL' ? d2 / 1000 : d2 / 8.33;

    if (sg2 <= sg1 || sg2 >= sgB) return 0;

    const tons = v_m3 * (sg2 - sg1) / (sgB - sg2) * sgB;
    return tons.toFixed(2);
  };

  const getMixDensificationVolFinal = () => {
    const mixRes = getMixingResult();
    const vol = parseFloat(mixRes.vol) || 0;
    const tons = parseFloat(getMixDensificationTons()) || 0;
    if (tons <= 0) return vol.toFixed(2);
    const sgB = parseFloat(mixBariteSg) || 4.2;
    const addedVol = (tons / sgB) * (mixUnits.vol === 'bbl' ? 6.2898 : 1);
    return (vol + addedVol).toFixed(2);
  };  const getLgsRetortResult = () => {
    const { vWater, vOil, mudWeight, mlAgNo3, normality, mlSample, sgLgs, sgBarite, hasBarite } = lgsRetort;

    const vw = parseFloat(vWater);
    const vo = parseFloat(vOil);
    const mw = parseFloat(mudWeight);
    const ml = parseFloat(mlAgNo3);
    const norm = parseFloat(normality);
    const mls = parseFloat(mlSample);
    const sglg = parseFloat(sgLgs) || 2.60;
    const sgb = parseFloat(sgBarite) || 4.20;

    if (isNaN(vw) || isNaN(vo) || isNaN(mw) || isNaN(ml) || isNaN(norm) || isNaN(mls) || mls <= 0) {
      return { invalid: true, msg: 'Ingrese valores numéricos válidos (Volumen de muestra debe ser mayor a 0).' };
    }

    if (vw < 0 || vo < 0 || mw < 0 || ml < 0 || norm < 0) {
      return { invalid: true, msg: 'Los valores no pueden ser negativos.' };
    }

    if (vw + vo > 100) {
      return { invalid: true, msg: 'La suma de Agua% y Aceite% no puede superar el 100%.' };
    }

    // 1. Cloruros y Salinidad
    let factor = norm * 35450;
    if (Math.abs(norm - 0.282) < 0.005) factor = 10000;
    else if (Math.abs(norm - 0.0282) < 0.0005) factor = 1000;

    const cl_mgL = (ml * factor) / mls;
    const nacl_mgL = cl_mgL * 1.648;

    // Brine density in SG
    const rho_brine = 0.998 + (1.142e-6 * cl_mgL) - (4.926e-13 * Math.pow(cl_mgL, 2));

    // WPS in ppm
    const wps = nacl_mgL / rho_brine;

    // 2. Corrección de volumen por sal
    const v_sal = vw * (-3.025e-4 + (5.068e-7 * cl_mgL) + (4.96e-13 * Math.pow(cl_mgL, 2)));

    // Sólidos suspendidos reales volume %
    const v_ss = Math.max(0, (100 - vw - vo) - v_sal);

    // Volumen real de salmuera %
    const v_brine = vw + v_sal;

    // 3. Mud weight conversion (to ppg if metric)
    const mwPpg = unitMode === 'field' ? mw : glToPPG(mw);

    // ASG (Average Solids Gravity)
    const rho_o = 0.84;
    let asg = 0;
    if (v_ss > 0) {
      asg = ((11.9826 * mwPpg) - (v_brine * rho_brine) - (vo * rho_o)) / v_ss;
    }

    // 4. LGS %
    let pctLgs = 0;
    if (hasBarite && sgb > sglg && v_ss > 0) {
      pctLgs = ((sgb - asg) / (sgb - sglg)) * v_ss;
      if (pctLgs < 0) pctLgs = 0;
      if (pctLgs > v_ss) pctLgs = v_ss;
    } else {
      pctLgs = v_ss;
    }

    const pctBarite = Math.max(0, v_ss - pctLgs);

    // LGS concentration in weight
    const lgs_ppb = pctLgs * sglg * 3.505;
    const barite_ppb = pctBarite * sgb * 3.505;

    const lgs_mass = unitMode === 'field' ? lgs_ppb : lgs_ppb * 2.853;
    const barite_mass = unitMode === 'field' ? barite_ppb : barite_ppb * 2.853;

    return {
      invalid: false,
      cl_mgL,
      nacl_mgL,
      rho_brine,
      wps,
      v_sal,
      v_ss,
      v_brine,
      asg,
      pctLgs,
      pctBarite,
      lgs_mass,
      barite_mass
    };
  };

  const lgsRetortResult = getLgsRetortResult();

  // Unit toggle converter for Retort Mud weight
  useEffect(() => {
    setLgsRetort(prev => {
      const mw = parseFloat(prev.mudWeight);
      if (isNaN(mw) || mw <= 0) return prev;
      if (unitMode === 'metric') {
        if (mw < 30) {
          return { ...prev, mudWeight: (mw * 119.826).toFixed(0) };
        }
      } else {
        if (mw > 30) {
          return { ...prev, mudWeight: (mw / 119.826).toFixed(2) };
        }
      }
      return prev;
    });
  }, [unitMode]);

  // Synchronize computed LGS% from retort to LGS Dilution C1 input
  useEffect(() => {
    if (lgsRetortResult && !lgsRetortResult.invalid && lgsRetortResult.pctLgs !== undefined) {
      setLgs(prev => {
        const calculatedVal = lgsRetortResult.pctLgs.toFixed(1);
        if (prev.c1 !== calculatedVal) {
          return { ...prev, c1: calculatedVal };
        }
        return prev;
      });
    }
  }, [lgsRetortResult.pctLgs, lgsRetortResult.invalid]);

  const getLGSResult = () => {
    const { v1, c1, c2, cf } = lgs;
    if (!v1 || !c1 || !c2 || !cf) return { v2: 0, vf: 0, factor: 0, invalid: false, msg: '' };

    const vol1 = parseFloat(v1);
    const con1 = parseFloat(c1);
    const con2 = parseFloat(c2);
    const conf = parseFloat(cf);

    if (isNaN(vol1) || isNaN(con1) || isNaN(con2) || isNaN(conf)) {
      return { v2: 0, vf: 0, factor: 0, invalid: true, msg: 'Ingrese valores numéricos válidos.' };
    }
    if (vol1 < 0 || con1 < 0 || con2 < 0 || conf < 0) {
      return { v2: 0, vf: 0, factor: 0, invalid: true, msg: 'Los valores no pueden ser negativos.' };
    }
    if (con1 <= con2) {
      return { v2: 0, vf: 0, factor: 0, invalid: true, msg: 'La concentración del diluyente (C2) debe ser menor a la del lodo actual (C1).' };
    }
    if (conf <= con2) {
      return { v2: 0, vf: 0, factor: 0, invalid: true, msg: 'La concentración objetivo (Cf) no puede ser menor o igual a la del diluyente (C2).' };
    }
    if (conf >= con1) {
      return { v2: 0, vf: 0, factor: 0, invalid: true, msg: 'La concentración objetivo (Cf) debe ser menor a la del lodo actual (C1).' };
    }

    const denominator = conf - con2;
    if (denominator <= 0) return { v2: 0, vf: 0, factor: 0, invalid: true, msg: 'La concentración objetivo (Cf) debe superar la del diluyente (C2).' };

    const factor = (con1 - conf) / denominator;
    const v2 = vol1 * factor;
    const vf = vol1 + v2;

    return {
      v2: v2.toFixed(2),
      vf: vf.toFixed(2),
      factor: factor.toFixed(4),
      invalid: false,
      msg: ''
    };
  };

  const getRheologyResult = () => {
    let vp = parseFloat(rheo.vp);
    let yp = parseFloat(rheo.yp);
    let tau0 = parseFloat(rheo.tau0);

    if (isNaN(vp) || vp < 1) vp = 20;
    if (isNaN(yp) || yp < 1) yp = 15;
    if (isNaN(tau0) || tau0 < 0) tau0 = 6;

    // Base Bingham values
    const theta300 = vp + yp;
    const theta600 = theta300 + vp;

    // Validation: prevent tau0 from exceeding or equal to theta300 to avoid negative logs
    let adjustedTau0 = tau0;
    let hasAlert = false;
    if (tau0 >= theta300) {
      adjustedTau0 = Math.max(0, theta300 - 0.5);
      hasAlert = true;
    }

    // Herschel-Bulkley parameters n and K
    const logRatio = Math.log10((theta600 - adjustedTau0) / (theta300 - adjustedTau0));
    const n = 3.32 * logRatio;
    const k = (theta300 - adjustedTau0) / Math.pow(511, n);

    const baseViscosimeterFactor = 1.7023;
    const speeds = [600, 300, 200, 100, 6, 3];
    const data = speeds.map(rpm => {
      const gamma = rpm * baseViscosimeterFactor;
      const thetaHB = adjustedTau0 + k * Math.pow(gamma, n);
      const thetaBingham = yp + vp * (rpm / 300);
      const viscAparente = (thetaHB * 300) / rpm;

      return {
        rpm,
        gamma,
        thetaHB,
        thetaBingham,
        viscAparente
      };
    });

    return {
      vp,
      yp,
      tau0,
      adjustedTau0,
      hasAlert,
      n,
      k,
      data
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("¡Resultado copiado al portapapeles!");
    });
  };

  const toggleTreatment = (id) => {
    setTreatmentConfig(prev => prev.map(t => t.id === id ? { ...t, visible: !t.visible } : t));
  };

  const toggleTab = (id) => {
    setTabsConfig(prev => prev.map(t => t.id === id ? { ...t, visible: !t.visible } : t));
  };

  const moveTab = (index, direction) => {
    const newOrder = [...tabsConfig];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setTabsConfig(newOrder);
    }
  };

  const addMixingFluid = () => {
    setMix([...mix, { vol: '', dens: '' }]);
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Calculator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-halliburton-red rounded-3xl shadow-lg shadow-red-900/20">
            <Icon name="calculator" size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-800 dark:text-white">Ingeniería de Fluidos</h3>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Soluciones de Fluidos</p>
          </div>
        </div>
        <div className="flex bg-zinc-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 self-start">
          <button onClick={() => setUnitMode('field')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${unitMode === 'field' ? 'bg-halliburton-red text-white shadow-md' : 'text-zinc-500'}`}>Campo</button>
          <button onClick={() => setUnitMode('metric')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${unitMode === 'metric' ? 'bg-halliburton-red text-white shadow-md' : 'text-zinc-500'}`}>Métrico</button>
        </div>
      </div>

      {/* SubTabs Navigation */}
      <div className="relative group/nav">
        <div id="subtabs-container" className="flex gap-2 overflow-x-auto pb-6 custom-scrollbar no-scrollbar-at-rest scroll-smooth">
          {tabsConfig.map((tab, idx) => (
            <div key={tab.id} className={`relative flex items-center group/tab-item ${(tab.visible || isEditing) ? 'block' : 'hidden'}`}>
              {isEditing && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 z-20 opacity-0 group-hover/tab-item:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); toggleTab(tab.id); }} className={`p-1 rounded-full ${tab.visible ? 'bg-green-500' : 'bg-zinc-600'} text-white shadow-lg`}><Icon name={tab.visible ? "eye" : "eye-off"} size={8} /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveTab(idx, -1); }} className="p-1 bg-zinc-700 rounded-full text-white shadow-lg"><Icon name="chevron-left" size={8} /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveTab(idx, 1); }} className="p-1 bg-zinc-700 rounded-full text-white shadow-lg"><Icon name="chevron-right" size={8} /></button>
                </div>
              )}
              <button
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${!tab.visible ? 'opacity-40 border-dashed bg-transparent' : ''} ${activeSubTab === tab.id ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-halliburton-red/10' : 'bg-white dark:bg-slate-800 text-zinc-500 border-zinc-100 dark:border-zinc-700 hover:border-halliburton-red'}`}
              >
                <Icon name={tab.icon} size={14} />
                {tab.label}
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const container = document.getElementById('subtabs-container');
            if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-slate-800/90 shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover/nav:opacity-100 transition-opacity border border-zinc-200 dark:border-zinc-700 z-30"
        >
          <Icon name="chevron-right" size={20} className="text-halliburton-red" />
        </button>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs Side */}
        <div className={`${activeSubTab === 'conv' ? 'lg:col-span-7' : 'lg:col-span-5'} bg-white dark:bg-slate-800/40 p-10 rounded-[3.5rem] card-shadow border border-zinc-200 dark:border-zinc-800/50`}>
          {activeSubTab === 'eng' && (
            <div className="space-y-6">
              <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest mb-4 italic">Parámetros Pozo</h4>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Densidad ({unitMode === 'field' ? 'ppg' : 'g/L'})</label>
                <input type="number" value={eng.dens} onChange={e => setEng({ ...eng, dens: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Profundidad ({unitMode === 'field' ? 'pies' : 'metros'})</label>
                <input type="number" value={eng.depth} onChange={e => setEng({ ...eng, depth: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Diámetro (pulgadas)</label>
                <input type="number" value={eng.diam} onChange={e => setEng({ ...eng, diam: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
              </div>
            </div>
          )}

          {activeSubTab === 'conv' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[11px] font-black text-halliburton-red uppercase tracking-widest italic">Valor a Convertir</h4>
                <button
                  onClick={() => setConvReverse(!convReverse)}
                  className="group flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-slate-900 text-zinc-600 dark:text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-halliburton-red hover:text-white transition-all shadow-sm border border-zinc-200 dark:border-zinc-800"
                >
                  <Icon name="repeat" size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                  {convReverse ? 'Sentido Inverso' : 'Sentido Directo'}
                </button>
              </div>
              <div className="relative group">
                <input type="number" value={convVal} onChange={e => setConvVal(e.target.value)} className="w-full input-style text-3xl font-black mb-10 pr-40" placeholder="0.00" />
                <div className="absolute right-6 top-5 px-3 py-1 bg-zinc-100 dark:bg-slate-900 rounded-lg text-zinc-400 font-black text-[10px] uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 shadow-sm">{convReverse ? 'Hacia Campo' : 'Desde Campo'}</div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    label: 'Densidad',
                    v1: `${(convVal * 1).toFixed(2)} ${convReverse ? 'g/L' : 'ppg'}`,
                    v2: `${convReverse ? glToPPG(convVal || 0).toFixed(2) + ' ppg' : ppgToGL(convVal || 0).toFixed(1) + ' g/L'}`
                  },
                  {
                    label: 'Volumen',
                    v1: `${(convVal * 1).toFixed(1)} ${convReverse ? 'm³' : 'bbl'}`,
                    v2: `${convReverse ? m3ToBbl(convVal || 0).toFixed(2) + ' bbl' : bblToM3(convVal || 0).toFixed(2) + ' m³'}`
                  },
                  {
                    label: 'Longitud',
                    v1: `${(convVal * 1).toFixed(1)} ${convReverse ? 'ft' : 'm'}`,
                    v2: `${convReverse ? ftToM(convVal || 0).toFixed(2) + ' m' : mToFt(convVal || 0).toFixed(1) + ' ft'}`
                  },
                  {
                    label: 'Presión',
                    v1: `${(convVal * 1).toFixed(1)} ${convReverse ? 'kg/cm²' : 'psi'}`,
                    v2: `${convReverse ? (convVal / 0.070307).toFixed(1) + ' psi' : psiToKgCm2(convVal || 0).toFixed(2) + ' kg/cm²'}`
                  },
                  {
                    label: 'Caudal',
                    v1: `${(convVal * 1).toFixed(1)} ${convReverse ? 'bpm' : 'gpm'}`,
                    v2: `${convReverse ? (convVal * 42).toFixed(1) + ' gpm' : (convVal / 42).toFixed(2) + ' bpm'}`
                  },
                  {
                    label: 'ROP',
                    v1: `${(convVal * 1).toFixed(1)} ${convReverse ? 'ft/min' : 'm/h'}`,
                    v2: `${convReverse ? (convVal * 60 / 3.28084).toFixed(1) + ' m/h' : (convVal * 3.28084 / 60).toFixed(2) + ' ft/min'}`
                  }
                ].map(c => (
                  <div key={c.label} className="p-5 bg-zinc-50 dark:bg-slate-900/60 rounded-3xl flex justify-between items-center border border-zinc-100 dark:border-zinc-800/50">
                    <span className="text-[13px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">{c.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-400 text-sm italic">{c.v1}</span>
                      <Icon name="arrow-right" size={12} className="text-halliburton-red opacity-30" />
                      <span className="font-black text-zinc-900 dark:text-zinc-200">{c.v2}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'barite' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest italic">Ajuste de Densidad</h4>
                <div className="flex gap-2 bg-zinc-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                  <button onClick={() => setBariteUnits({ ...bariteUnits, vol: bariteUnits.vol === 'm3' ? 'bbl' : 'm3' })} className="px-6 py-2.5 rounded-xl bg-zinc-800 text-white text-[11px] font-black uppercase shadow-lg hover:scale-105 transition-transform active:scale-95">{bariteUnits.vol}</button>
                  <button onClick={() => setBariteUnits({ ...bariteUnits, dens: bariteUnits.dens === 'ppg' ? 'gL' : 'ppg' })} className="px-6 py-2.5 rounded-xl bg-zinc-800 text-white text-[11px] font-black uppercase shadow-lg hover:scale-105 transition-transform active:scale-95">{bariteUnits.dens}</button>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Volumen Inicial ({bariteUnits.vol})</label>
                <input type="number" value={barite.vol} onChange={e => setBarite({ ...barite, vol: e.target.value })} className="w-full input-style text-xl font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">D. Actual ({bariteUnits.dens})</label>
                  <input type="number" value={barite.d1} onChange={e => setBarite({ ...barite, d1: e.target.value })} className="w-full input-style" />
                </div>
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">D. Final ({bariteUnits.dens})</label>
                  <input type="number" value={barite.d2} onChange={e => setBarite({ ...barite, d2: e.target.value })} className="w-full input-style" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-black text-halliburton-red uppercase tracking-widest mb-2 block">SG Material</label>
                <input type="number" value={barite.sg} onChange={e => setBarite({ ...barite, sg: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="4.2" step="0.01" />
              </div>
            </div>
          )}

          {activeSubTab === 'slug' && (
            <div className="space-y-6">
              <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest mb-4 italic">Diseño de Píldora Pesada</h4>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Longitud Seca Deseada ({unitMode === 'field' ? 'ft' : 'm'})</label>
                <input type="number" value={slug.lengthSeca} onChange={e => setSlug({ ...slug, lengthSeca: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">ID Drill Pipe (in)</label>
                  <input type="number" value={slug.idDP} onChange={e => setSlug({ ...slug, idDP: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[13px] font-black text-halliburton-red uppercase tracking-widest mb-2 block">Capacidad Calc.</label>
                  <div className="w-full bg-zinc-100 dark:bg-slate-900 rounded-xl p-3 text-sm font-black text-zinc-400 border border-zinc-200 dark:border-zinc-800 flex items-center h-[52px]">
                    {getSlugResult().currentCap || '0.000'} <small className="ml-1 opacity-50">{unitMode === 'field' ? 'bbl/ft' : 'm³/m'}</small>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Dens. Fluido ({unitMode === 'field' ? 'ppg' : 'g/L'})</label>
                  <input type="number" value={slug.densMud} onChange={e => setSlug({ ...slug, densMud: e.target.value })} className="w-full input-style" />
                </div>
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Dens. Píldora ({unitMode === 'field' ? 'ppg' : 'g/L'})</label>
                  <input type="number" value={slug.densSlug} onChange={e => setSlug({ ...slug, densSlug: e.target.value })} className="w-full input-style" />
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => setShowAdvancedSlug(!showAdvancedSlug)}
                  className="w-full flex justify-between items-center mb-2 group py-2"
                  type="button"
                >
                  <h5 className="text-[10px] font-black text-zinc-400 group-hover:text-halliburton-red uppercase tracking-[0.2em] transition-colors">Factores de Resistencia (Opcional)</h5>
                  <div className={`p-1 rounded-lg transition-all ${showAdvancedSlug ? 'bg-halliburton-red text-white rotate-180' : 'bg-zinc-100 dark:bg-slate-800 text-zinc-400'}`}>
                    <Icon name="chevron-down" size={12} />
                  </div>
                </button>

                {showAdvancedSlug && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-2 block">Válvulas/Motor (PSI)</label>
                        <input type="number" value={slug.valveResist} onChange={e => setSlug({ ...slug, valveResist: e.target.value })} className="w-full input-style" placeholder="Resorte/Fricción" title="Presión necesaria para abrir la válvula flotadora (Float Valve) o vencer motores." />
                      </div>
                      <div>
                        <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-2 block">MPD SBP (PSI)</label>
                        <input type="number" value={slug.mpdSBP} onChange={e => setSlug({ ...slug, mpdSBP: e.target.value })} className="w-full input-style" placeholder="Contrapresión" title="Surface Back Pressure aplicada por unidad de MPD en el anular." />
                      </div>
                    </div>
                    <div className="bg-zinc-100/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                      <div className="flex gap-3">
                        <Icon name="info" size={14} className="text-halliburton-red shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase leading-normal">
                          <span className="text-zinc-700 dark:text-zinc-300">Válvulas/Motor:</span> Presión extra necesaria para vencer el resorte del Float Valve o la resistencia interna de motores/MWD.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="activity" size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase leading-normal">
                          <span className="text-zinc-700 dark:text-zinc-300">MPD SBP:</span> Contrapresión de superficie aplicada en el anular.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div>
                  <label className="text-[13px] font-black text-halliburton-red uppercase tracking-widest mb-2 block">Margen Seguridad (PSI)</label>
                  <input type="number" value={slug.safetyPressure} onChange={e => setSlug({ ...slug, safetyPressure: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="200" />
                </div>
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Vol. a Preparar ({unitMode === 'field' ? 'bbl' : 'm³'})</label>
                  <input type="number" value={slug.volToPrepare} onChange={e => setSlug({ ...slug, volToPrepare: e.target.value })} className="w-full input-style" placeholder="Opcional" />
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'owr' && (
            <div className="space-y-6">
              <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest mb-4 italic">Análisis de Retorta (OWR)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">% Vol Aceite</label>
                  <input type="number" value={owr.vOil} onChange={e => setOwr({ ...owr, vOil: e.target.value })} className="w-full input-style text-xl font-bold" />
                </div>
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">% Vol Agua</label>
                  <input type="number" value={owr.vWater} onChange={e => setOwr({ ...owr, vWater: e.target.value })} className="w-full input-style text-xl font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">% Vol Sólidos (Calc.)</label>
                <div className="w-full bg-zinc-100 dark:bg-slate-900 rounded-2xl p-3 text-lg font-bold text-zinc-400 border border-zinc-200 dark:border-zinc-800 flex items-center h-[52px]">
                  {getOWRResult().solids} {getOWRResult().solids !== '-' && getOWRResult().solids !== 'Inválido' ? '%' : ''}
                </div>
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Volumen de Lodo a Acondicionar ({unitMode === 'field' ? 'bbl' : 'm³'})</label>
                <input type="number" value={owr.volCondition} onChange={e => setOwr({ ...owr, volCondition: e.target.value })} className="w-full input-style text-xl font-bold" placeholder={unitMode === 'field' ? 'Ej: 1000' : 'Ej: 150'} />
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block italic text-halliburton-red">Relación Objetivo (% Aceite)</label>
                <div className="flex gap-2">
                  {['70', '75', '80', '85', '90'].map(r => (
                    <button key={r} onClick={() => setOwr({ ...owr, targetRatio: r })} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all border ${owr.targetRatio === r ? 'bg-halliburton-red text-white border-halliburton-red shadow-lg' : 'bg-zinc-50 dark:bg-slate-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}>
                      {r}/{100 - r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'pfmf' && (
            <div className="space-y-6">
              <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest mb-4 italic">Titulación Pf / Mf</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Lectura Pf (ml)</label>
                  <input type="number" value={titration.pf} onChange={e => setTitration({ ...titration, pf: e.target.value })} className="w-full input-style text-xl font-bold" />
                </div>
                <div>
                  <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Lectura Mf (ml)</label>
                  <input type="number" value={titration.mf} onChange={e => setTitration({ ...titration, mf: e.target.value })} className="w-full input-style text-xl font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Dureza Calcio (mg/L Ca++) - Opcional</label>
                <input type="number" value={titration.ca} onChange={e => setTitration({ ...titration, ca: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="Para remediación de cemento" />
              </div>
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20 text-[10px] leading-relaxed text-blue-800 dark:text-blue-300 font-bold uppercase tracking-wider">
                <Icon name="info" size={12} className="inline mr-2" />
                Asegúrese de usar H2SO4 0.02N según norma API para estos cálculos.
              </div>
            </div>
          )}

          {activeSubTab === 'fit' && (
            <div className="space-y-6">
              <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest mb-4 italic">Prueba de Integridad (FIT)</h4>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">EMW Objetivo ({unitMode === 'field' ? 'ppg' : 'g/L'})</label>
                <input type="number" value={fit.targetEMW} onChange={e => setFit({ ...fit, targetEMW: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Densidad Lodo Actual ({unitMode === 'field' ? 'ppg' : 'g/L'})</label>
                <input type="number" value={fit.currentMW} onChange={e => setFit({ ...fit, currentMW: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">TVD Zapata ({unitMode === 'field' ? 'ft' : 'm'})</label>
                <input type="number" value={fit.shoeTVD} onChange={e => setFit({ ...fit, shoeTVD: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-slate-900/60 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 text-[10px] leading-relaxed text-zinc-500 font-bold uppercase tracking-wider">
                <Icon name="activity" size={12} className="inline mr-2" />
                La prueba verifica la integridad debajo de la zapata sin fracturar.
              </div>
            </div>
          )}

          {activeSubTab === 'mixing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest italic">Mezcla de Fluidos</h4>
                <div className="flex gap-2 bg-zinc-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                  <button onClick={() => setMixUnits({ ...mixUnits, vol: mixUnits.vol === 'm3' ? 'bbl' : 'm3' })} className="px-6 py-2.5 rounded-xl bg-zinc-800 text-white text-[11px] font-black uppercase shadow-lg hover:scale-105 transition-transform active:scale-95">{mixUnits.vol}</button>
                  <button onClick={() => setMixUnits({ ...mixUnits, dens: mixUnits.dens === 'ppg' ? 'gL' : 'ppg' })} className="px-6 py-2.5 rounded-xl bg-zinc-800 text-white text-[11px] font-black uppercase shadow-lg hover:scale-105 transition-transform active:scale-95">{mixUnits.dens}</button>
                </div>
              </div>
              <div className="space-y-4">
                {mix.map((f, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4 p-5 bg-zinc-50 dark:bg-slate-900/60 rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-sm relative group/fluid">
                    <div>
                      <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Vol {i + 1} ({mixUnits.vol})</label>
                      <input type="number" value={f.vol} onChange={e => {
                        const newMix = [...mix];
                        newMix[i].vol = e.target.value;
                        setMix(newMix);
                      }} className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold focus:border-halliburton-red outline-none transition-all shadow-inner" />
                    </div>
                    <div>
                      <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Dens {i + 1} ({mixUnits.dens})</label>
                      <input type="number" value={f.dens} onChange={e => {
                        const newMix = [...mix];
                        newMix[i].dens = e.target.value;
                        setMix(newMix);
                      }} className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold focus:border-halliburton-red outline-none transition-all shadow-inner" />
                    </div>
                    {mix.length > 2 && (
                      <button
                        onClick={() => setMix(mix.filter((_, idx) => idx !== i))}
                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover/fluid:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                      >
                        <Icon name="x" size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addMixingFluid}
                  className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-[2rem] text-zinc-400 hover:text-halliburton-red hover:border-halliburton-red transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest"
                >
                  <Icon name="plus" size={16} />
                  Agregar Fluido a la Mezcla
                </button>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 space-y-4">
                  <h5 className="text-[12px] font-black text-halliburton-red uppercase tracking-widest italic">Ajuste de Densidad de la Mezcla (Opcional)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">D. Objetivo ({mixUnits.dens})</label>
                      <input
                        type="number"
                        value={mixTargetDens}
                        onChange={e => setMixTargetDens(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold focus:border-halliburton-red outline-none transition-all shadow-inner"
                        placeholder="Ej: 10.0"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">SG Densificante</label>
                      <input
                        type="number"
                        value={mixBariteSg}
                        onChange={e => setMixBariteSg(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold focus:border-halliburton-red outline-none transition-all shadow-inner"
                        placeholder="4.2"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'lgs' && (
            <div className="space-y-6">
              <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest mb-4 italic">Dilución de Sólidos (LGS)</h4>
              <div>
                <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Volumen Activo Inicial (V1) ({unitMode === 'field' ? 'bbl' : 'm³'})</label>
                <input type="number" value={lgs.v1} onChange={e => setLgs({ ...lgs, v1: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="0.00" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">LGS Actual (C1) %</label>
                  <input type="number" value={lgs.c1} onChange={e => setLgs({ ...lgs, c1: e.target.value })} className="w-full input-style text-center" placeholder="7.0" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">LGS Diluyente (C2) %</label>
                  <input type="number" value={lgs.c2} onChange={e => setLgs({ ...lgs, c2: e.target.value })} className="w-full input-style text-center" placeholder="2.9" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">LGS Objetivo (Cf) %</label>
                  <input type="number" value={lgs.cf} onChange={e => setLgs({ ...lgs, cf: e.target.value })} className="w-full input-style text-center" placeholder="3.5" />
                </div>
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-slate-900/60 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 text-[10px] leading-relaxed text-zinc-500 font-bold uppercase tracking-wider">
                <Icon name="activity" size={12} className="inline mr-2" />
                El balance de masas calcula el volumen necesario de diluyente (C2) para reducir el LGS actual al nivel objetivo (Cf).
              </div>
            </div>
          )}

          {activeSubTab === 'lgs_retort' && (
            <div className="space-y-6">
              <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest mb-4 italic">Retorta y Salinidad (LGS)</h4>
              
              {/* Section 1: Retorta */}
              <div className="space-y-4">
                <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-1">1. Datos de Retorta</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">% Vol Agua (Vw)</label>
                    <input type="number" value={lgsRetort.vWater} onChange={e => setLgsRetort({ ...lgsRetort, vWater: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="30" />
                  </div>
                  <div>
                    <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">% Vol Aceite (Vo)</label>
                    <input type="number" value={lgsRetort.vOil} onChange={e => setLgsRetort({ ...lgsRetort, vOil: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="50" />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Densidad Lodo ({unitMode === 'field' ? 'ppg' : 'g/L'})</label>
                  <input type="number" value={lgsRetort.mudWeight} onChange={e => setLgsRetort({ ...lgsRetort, mudWeight: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="10.0" />
                </div>
              </div>

              {/* Section 2: Salinidad */}
              <div className="space-y-4 pt-2">
                <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-1">2. Titulación por Cloruros</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">mL AgNO₃</label>
                    <input type="number" value={lgsRetort.mlAgNo3} onChange={e => setLgsRetort({ ...lgsRetort, mlAgNo3: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="12.0" />
                  </div>
                  <div>
                    <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">mL Muestra</label>
                    <input type="number" value={lgsRetort.mlSample} onChange={e => setLgsRetort({ ...lgsRetort, mlSample: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="2.0" />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Normalidad AgNO₃ (N)</label>
                  <div className="flex gap-2">
                    {['0.0282', '0.282'].map(norm => (
                      <button
                        key={norm}
                        type="button"
                        onClick={() => setLgsRetort({ ...lgsRetort, normality: norm })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all border ${lgsRetort.normality === norm ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-halliburton-red/10' : 'bg-zinc-50 dark:bg-slate-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-halliburton-red'}`}
                      >
                        {norm} N
                      </button>
                    ))}
                    <input
                      type="number"
                      value={['0.0282', '0.282'].includes(lgsRetort.normality) ? '' : lgsRetort.normality}
                      onChange={e => setLgsRetort({ ...lgsRetort, normality: e.target.value })}
                      placeholder="Otra..."
                      className="w-24 bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-2 text-center text-sm font-bold focus:border-halliburton-red outline-none transition-all"
                      step="0.0001"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Sólidos */}
              <div className="space-y-4 pt-2">
                <h5 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-1">3. Propiedades de Sólidos</h5>
                <div className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    id="hasBarite"
                    checked={lgsRetort.hasBarite}
                    onChange={e => setLgsRetort({ ...lgsRetort, hasBarite: e.target.checked })}
                    className="w-5 h-5 accent-halliburton-red rounded border-zinc-300 dark:border-zinc-700"
                  />
                  <label htmlFor="hasBarite" className="text-[12px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest cursor-pointer select-none">
                    ¿Contiene Barita (Densificante)?
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">SG de LGS</label>
                    <input type="number" value={lgsRetort.sgLgs} onChange={e => setLgsRetort({ ...lgsRetort, sgLgs: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="2.60" step="0.01" />
                  </div>
                  {lgsRetort.hasBarite && (
                    <div>
                      <label className="text-[12px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">SG de Barita</label>
                      <input type="number" value={lgsRetort.sgBarite} onChange={e => setLgsRetort({ ...lgsRetort, sgBarite: e.target.value })} className="w-full input-style text-xl font-bold" placeholder="4.20" step="0.01" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'rheology' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[14px] font-black text-halliburton-red uppercase tracking-widest italic">Parámetros Fijos</h4>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Unidades API</span>
              </div>

              {/* Presets */}
              <div className="bg-zinc-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 space-y-3">
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Preajustes Rápidos:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRheo({ vp: '18', yp: '12', tau0: '5' })} className="text-[10px] bg-white dark:bg-slate-800 hover:border-halliburton-red border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 py-2 px-3 rounded-xl transition-all font-black uppercase tracking-wider">Agua Ligero</button>
                  <button type="button" onClick={() => setRheo({ vp: '35', yp: '25', tau0: '12' })} className="text-[10px] bg-white dark:bg-slate-800 hover:border-halliburton-red border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 py-2 px-3 rounded-xl transition-all font-black uppercase tracking-wider">Densificado</button>
                  <button type="button" onClick={() => setRheo({ vp: '22', yp: '38', tau0: '18' })} className="text-[10px] bg-white dark:bg-slate-800 hover:border-halliburton-red border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 py-2 px-3 rounded-xl transition-all font-black uppercase tracking-wider">Alta Cedencia</button>
                  <button type="button" onClick={() => setRheo({ vp: '25', yp: '18', tau0: '8' })} className="text-[10px] bg-halliburton-red/10 border border-halliburton-red/20 text-halliburton-red py-2 px-3 rounded-xl transition-all font-black uppercase tracking-wider">Básico</button>
                </div>
              </div>

              <div className="space-y-6 pt-2">
                {/* VP */}
                <div className="bg-zinc-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                      Viscosidad Plástica <span className="text-halliburton-red">(VP)</span>
                    </label>
                    <span className="text-[10px] font-bold text-zinc-400">cP</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button type="button" onClick={() => setRheo(prev => ({ ...prev, vp: Math.max(1, (parseFloat(prev.vp) || 0) - 1).toString() }))} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold transition-all hover:bg-zinc-100 dark:hover:bg-slate-700 flex items-center justify-center">-</button>
                    <input type="range" min="1" max="100" value={parseFloat(rheo.vp) || 20} onChange={e => setRheo(prev => ({ ...prev, vp: e.target.value }))} className="flex-1 h-1.5 bg-zinc-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-halliburton-red" />
                    <button type="button" onClick={() => setRheo(prev => ({ ...prev, vp: Math.min(100, (parseFloat(prev.vp) || 0) + 1).toString() }))} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold transition-all hover:bg-zinc-100 dark:hover:bg-slate-700 flex items-center justify-center">+</button>
                    <input type="number" min="1" max="100" value={rheo.vp} onChange={e => setRheo(prev => ({ ...prev, vp: e.target.value }))} className="w-18 bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl py-2 text-center font-bold text-zinc-800 dark:text-white focus:border-halliburton-red focus:outline-none" />
                  </div>
                </div>

                {/* YP */}
                <div className="bg-zinc-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                      Punto Cedente <span className="text-halliburton-red">(YP)</span>
                    </label>
                    <span className="text-[10px] font-bold text-zinc-400">lb/100ft²</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button type="button" onClick={() => setRheo(prev => ({ ...prev, yp: Math.max(1, (parseFloat(prev.yp) || 0) - 1).toString() }))} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold transition-all hover:bg-zinc-100 dark:hover:bg-slate-700 flex items-center justify-center">-</button>
                    <input type="range" min="1" max="100" value={parseFloat(rheo.yp) || 15} onChange={e => setRheo(prev => ({ ...prev, yp: e.target.value }))} className="flex-1 h-1.5 bg-zinc-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-halliburton-red" />
                    <button type="button" onClick={() => setRheo(prev => ({ ...prev, yp: Math.min(100, (parseFloat(prev.yp) || 0) + 1).toString() }))} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold transition-all hover:bg-zinc-100 dark:hover:bg-slate-700 flex items-center justify-center">+</button>
                    <input type="number" min="1" max="100" value={rheo.yp} onChange={e => setRheo(prev => ({ ...prev, yp: e.target.value }))} className="w-18 bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl py-2 text-center font-bold text-zinc-800 dark:text-white focus:border-halliburton-red focus:outline-none" />
                  </div>
                </div>

                {/* Tau0 */}
                <div className="bg-zinc-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[13px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                      Esfuerzo Cedente Real <span className="text-halliburton-red">(τ₀)</span>
                    </label>
                    <span className="text-[10px] font-bold text-zinc-400">lb/100ft²</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button type="button" onClick={() => setRheo(prev => ({ ...prev, tau0: Math.max(0, (parseFloat(prev.tau0) || 0) - 1).toString() }))} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold transition-all hover:bg-zinc-100 dark:hover:bg-slate-700 flex items-center justify-center">-</button>
                    <input type="range" min="0" max="80" value={parseFloat(rheo.tau0) || 6} onChange={e => setRheo(prev => ({ ...prev, tau0: e.target.value }))} className="flex-1 h-1.5 bg-zinc-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-halliburton-red" />
                    <button type="button" onClick={() => setRheo(prev => ({ ...prev, tau0: Math.min(80, (parseFloat(prev.tau0) || 0) + 1).toString() }))} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold transition-all hover:bg-zinc-100 dark:hover:bg-slate-700 flex items-center justify-center">+</button>
                    <input type="number" min="0" max="80" value={rheo.tau0} onChange={e => setRheo(prev => ({ ...prev, tau0: e.target.value }))} className="w-18 bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl py-2 text-center font-bold text-zinc-800 dark:text-white focus:border-halliburton-red focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Validaciones matemáticas alerta */}
              {getRheologyResult().hasAlert && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-[2rem] text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-relaxed flex gap-2">
                  <Icon name="alert-triangle" size={14} className="shrink-0 mt-0.5" />
                  <span>Ajuste técnico: El esfuerzo de cedencia real (τ₀) no puede superar o igualar la lectura θ₃₀₀ ({getRheologyResult().vp + getRheologyResult().yp} lb/100ft²). Se limitó automáticamente a {getRheologyResult().adjustedTau0.toFixed(1)}.</span>
                </div>
              )}

              {/* Fann 35 Simulation */}
              <div className="bg-zinc-50 dark:bg-slate-900/40 border-2 border-zinc-100 dark:border-zinc-800/50 rounded-[2.5rem] p-6 flex items-center gap-4">
                <div className="relative w-20 h-20 bg-zinc-100 dark:bg-slate-950 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-inner shrink-0">
                  <div
                    className="absolute w-14 h-14 border-4 border-dashed border-halliburton-red/30 rounded-full rotor-spinning"
                    style={{
                      animationPlayState: rheoSelectedRpm === 0 ? 'paused' : 'running',
                      '--spin-duration': `${rheoSelectedRpm === 0 ? 0 : Math.max(0.1, 600 / rheoSelectedRpm * 0.5)}s`
                    }}
                  ></div>
                  <div className="absolute w-8 h-8 bg-white dark:bg-slate-900 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <span className="text-[10px] font-black text-zinc-800 dark:text-white font-mono">{rheoSelectedRpm}</span>
                  </div>
                  <div className="absolute top-1 w-1 h-3 bg-halliburton-red rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Rotor Fann 35</h3>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight mt-0.5 leading-snug">Simula velocidades para evaluar corte dinámico.</p>
                  <div className="flex gap-1 mt-2">
                    {[600, 300, 6, 3].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRheoSelectedRpm(v)}
                        className={`text-[9px] px-2.5 py-1.5 rounded-lg font-black uppercase transition-all ${rheoSelectedRpm === v ? 'bg-halliburton-red text-white shadow-md' : 'bg-white dark:bg-slate-800 text-zinc-500 border border-zinc-100 dark:border-zinc-700 hover:border-halliburton-red'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* H-B Constantes */}
              <div className="bg-zinc-50 dark:bg-slate-900/40 border border-zinc-100 dark:border-zinc-800/50 rounded-[2.5rem] p-6 space-y-4">
                <h3 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Icon name="trending-up" size={14} className="text-emerald-500" />
                  Índices de Consistencia H-B
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">Índice n</span>
                      <h5 className="text-2xl font-black italic text-zinc-800 dark:text-white mt-1">{getRheologyResult().n.toFixed(3)}</h5>
                    </div>
                    <span className={`text-[8px] font-black uppercase mt-2 ${getRheologyResult().n < 1 ? 'text-emerald-500' : getRheologyResult().n === 1 ? 'text-zinc-400' : 'text-amber-500'}`}>
                      {getRheologyResult().n < 1 ? 'Seudoplástico' : getRheologyResult().n === 1 ? 'Newtoniano' : 'Dilatante'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm">
                    <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">Índice K</span>
                    <h5 className="text-2xl font-black italic text-zinc-800 dark:text-white mt-1">{getRheologyResult().k.toFixed(4)}</h5>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-tight block mt-2">lb/100ft²·sⁿ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Side */}
        <div className={`${activeSubTab === 'conv' ? 'lg:col-span-5' : 'lg:col-span-7'} space-y-6`}>
          {activeSubTab === 'eng' && (
            <>
              <div className="bg-gradient-to-br from-halliburton-red to-[#a30000] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Icon name="droplet" size={80} /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Presión Hidrostática</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h5 className="text-7xl font-black italic">{getHydrostatic()}</h5>
                  <span className="text-xl font-bold opacity-60 italic uppercase tracking-tighter">PSI</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-[10px] font-bold uppercase tracking-widest opacity-80 italic">
                  Eq: {psiToKgCm2(getHydrostatic()).toFixed(2)} kg/cm²
                </div>
              </div>
              <div className="bg-zinc-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Icon name="database" size={80} /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Capacidad Teórica</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h5 className="text-5xl font-black italic">{((eng.diam ** 2) / 1029.4 * (unitMode === 'field' ? 1 : 0.158987 / 0.3048)).toFixed(5)}</h5>
                  <span className="text-lg font-bold text-halliburton-red italic uppercase tracking-tighter">{unitMode === 'field' ? 'bbl/ft' : 'm³/m'}</span>
                </div>
              </div>
            </>
          )}

          {activeSubTab === 'barite' && (
            <div className="bg-zinc-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform"><Icon name="arrow-up-circle" size={300} /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 block">Requerimiento de Barita</span>
              <div className="space-y-10">
                <div>
                  <div className="flex items-baseline gap-3">
                    <h5 className="text-8xl font-black text-halliburton-red italic">{getBariteTons()}</h5>
                    <span className="text-2xl font-black opacity-40 uppercase italic">Tons métricas</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">Cálculo basado en SG {barite.sg}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 inline-block">
                  <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Volumen Final Estimado</span>
                  <p className="text-xl font-black italic">
                    {(parseFloat(barite.vol || 0) + (getBariteTons() / (parseFloat(barite.sg) || 4.2) * (bariteUnits.vol === 'bbl' ? 6.2898 : 1))).toFixed(2)} {bariteUnits.vol}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'slug' && (
            <div className="bg-zinc-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Icon name="flask-conical" size={100} /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 block">Especificación de Píldora</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] font-black text-zinc-500 uppercase block mb-1">Volumen Mínimo Requerido</span>
                    <div className="flex items-baseline gap-2 mb-4">
                      <h5 className="text-3xl font-black italic text-zinc-400">{getSlugResult().volReq}</h5>
                      <span className="text-sm font-bold opacity-30 uppercase">{unitMode === 'field' ? 'bbl' : 'm³'}</span>
                    </div>
                    <span className="text-[11px] font-black text-halliburton-red uppercase block mb-1">Volumen Total a Preparar</span>
                    <div className="flex items-baseline gap-2">
                      <h5 className="text-5xl font-black italic">{getSlugResult().volFinal}</h5>
                      <span className="text-xl font-bold opacity-40 uppercase">{unitMode === 'field' ? 'bbl' : 'm³'}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black text-zinc-400 uppercase block mb-1">Mud del Sistema Activo</span>
                    <div className="flex items-baseline gap-2">
                      <h5 className="text-3xl font-black italic text-zinc-200">{getSlugResult().volInitial}</h5>
                      <span className="text-sm font-bold opacity-40 uppercase">{unitMode === 'field' ? 'bbl' : 'm³'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-black text-halliburton-red uppercase block mb-1">Barita Requerida</span>
                  <div className="flex items-baseline gap-2">
                    <h5 className="text-6xl font-black italic">{getSlugResult().tons}</h5>
                    <span className="text-xl font-bold opacity-40 uppercase">Tons</span>
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 mt-2 uppercase tracking-widest italic leading-tight">Mezclar v. inicial + barita para vencer la hidrostática del anular, válvulas y MPD.</p>
                </div>
              </div>

              {/* Visual Trend: U-Tube */}
              <div className="relative h-40 w-full bg-zinc-800 rounded-2xl border border-white/5 overflow-hidden p-4 flex gap-4">
                <div className="flex-1 flex flex-col justify-end">
                  <div className="w-12 mx-auto bg-zinc-700 h-full rounded-t-lg relative overflow-hidden flex flex-col justify-end border-x border-white/10">
                    <div className="w-full bg-zinc-500" style={{ height: '60%' }}></div>
                    <div className="w-full bg-halliburton-red" style={{ height: (getSlugResult().volFinal > 0 ? '20%' : '0%') }}></div>
                    <div className="absolute top-0 left-0 right-0 py-1 text-[8px] font-black text-center text-white/40 uppercase">PIPE</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div className="w-20 mx-auto bg-zinc-700 h-[80%] rounded-t-lg relative overflow-hidden flex flex-col justify-end border-x border-white/10">
                    <div className="w-full bg-zinc-500" style={{ height: '100%' }}></div>
                    <div className="absolute top-0 left-0 right-0 py-1 text-[8px] font-black text-center text-white/40 uppercase">ANNULUS</div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[8px] font-black text-white/80 uppercase tracking-widest border border-white/10">Equilibrio Hidrostático</div>
              </div>
            </div>
          )}

          {activeSubTab === 'owr' && (
            <div className="bg-zinc-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Icon name="droplet-off" size={100} /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 block">Estado de Emulsión Inversa</span>

              {getOWRResult().invalid && (
                <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 uppercase tracking-widest text-center">
                  ⚠️ Error: La suma de Aceite y Agua ({parseFloat(owr.vOil || 0) + parseFloat(owr.vWater || 0)}%) no puede superar el 100%.
                </div>
              )}

              <div className="flex items-center gap-10 mb-12">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-800" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-halliburton-red" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * (getOWRResult().oilPct || 0)) / 100} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black italic">{getOWRResult().current}</span>
                    <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">OWR</span>
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase block mb-2 tracking-widest">
                      {owr.volCondition ? `Tratamiento Sugerido (para ${owr.volCondition} ${unitMode === 'field' ? 'bbl' : 'm³'})` : `Tratamiento Sugerido (por unidad)`}
                    </span>
                    {parseFloat(getOWRResult().addOil) > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-halliburton-red/10 border border-halliburton-red/20 rounded-2xl flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-halliburton-red italic">Agregar Aceite</span>
                          <span className="text-xl font-black text-white">{getOWRResult().addOil} <small className="text-[10px] opacity-40">{unitMode === 'field' ? 'BBL' : 'M³'}</small></span>
                        </div>
                        {parseFloat(owr.volCondition) > 0 && (
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 italic">Volumen Final Resultante</span>
                            <span className="text-xl font-black text-white">{getOWRResult().finalVol} <small className="text-[10px] opacity-40">{unitMode === 'field' ? 'BBL' : 'M³'}</small></span>
                          </div>
                        )}
                      </div>
                    ) : parseFloat(getOWRResult().addWater) > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 italic">Agregar Agua</span>
                          <span className="text-xl font-black text-white">{getOWRResult().addWater} <small className="text-[10px] opacity-40">{unitMode === 'field' ? 'BBL' : 'M³'}</small></span>
                        </div>
                        {parseFloat(owr.volCondition) > 0 && (
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 italic">Volumen Final Resultante</span>
                            <span className="text-xl font-black text-white">{getOWRResult().finalVol} <small className="text-[10px] opacity-40">{unitMode === 'field' ? 'BBL' : 'M³'}</small></span>
                          </div>
                        )}
                      </div>
                    ) : <div className="text-[11px] font-bold text-zinc-400 italic">Relación balanceada u objetivo alcanzado.</div>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-zinc-800">
                <div className="bg-halliburton-red transition-all duration-1000" style={{ width: `${getOWRResult().oilPct}%` }}></div>
                <div className="bg-blue-400 transition-all duration-1000" style={{ width: `${getOWRResult().waterPct}%` }}></div>
              </div>
              <div className="flex justify-between mt-3 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                <span>Aceite ({getOWRResult().current.split('/')[0]}%)</span>
                <span>Agua ({getOWRResult().current.split('/')[1]}%)</span>
              </div>
            </div>
          )}

          {activeSubTab === 'fit' && (
            <div className="bg-zinc-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Icon name="shield-check" size={120} /></div>

              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">Reporte para Supervisión</span>
                <button
                  onClick={() => copyToClipboard(`REPORTE PRUEBA FIT:\n- EMW Objetivo: ${fit.targetEMW} ${unitMode === 'field' ? 'ppg' : 'g/L'}\n- Dens. Actual: ${fit.currentMW} ${unitMode === 'field' ? 'ppg' : 'g/L'}\n- TVD Zapata: ${fit.shoeTVD} ${unitMode === 'field' ? 'ft' : 'm'}\n- PRESIÓN SUPERFICIE: ${getFITResult().surfacePSI} PSI`)}
                  className="p-3 bg-white/10 hover:bg-halliburton-red rounded-2xl transition-all shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <Icon name="share-2" size={14} /> Copiar Reporte
                </button>
              </div>

              <div className="space-y-10">
                <div className="relative inline-block">
                  <span className="text-[11px] font-black text-halliburton-red uppercase block mb-1 tracking-widest italic">Presión a aplicar en manómetro</span>
                  <div className="flex items-baseline gap-3">
                    <h5 className="text-8xl font-black italic text-white drop-shadow-2xl">{getFITResult().surfacePSI}</h5>
                    <span className="text-2xl font-black text-halliburton-red uppercase italic tracking-tighter">PSI</span>
                  </div>
                  {unitMode === 'metric' && (
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mt-2">
                      Equivalente: {getFITResult().surface} kg/cm²
                    </div>
                  )}
                </div>

                <div className="bg-halliburton-red/10 border border-halliburton-red/20 p-5 rounded-3xl">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Instrucción para Pozo:</p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.1em] italic leading-relaxed">
                    Cerrar pozo y bombear lentamente hasta alcanzar {getFITResult().surfacePSI} PSI en superficie. Mantener estable por 5 minutos para verificar integridad.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'pfmf' && (
            <div className="bg-zinc-900 p-10 rounded-[3.5rem] text-white flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Icon name="beaker" size={120} /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 block">Composición Iónica (mg/L)</span>

              {getPfMfResult().invalid && (
                <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 uppercase tracking-widest text-center">
                  ⚠️ Error: La lectura Pf ({titration.pf} ml) no puede ser mayor que Mf ({titration.mf} ml).
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {[
                  { label: 'Hidroxilo (OH-)', val: getPfMfResult().oh, color: 'text-halliburton-red' },
                  { label: 'Carbonato (CO3=)', val: getPfMfResult().co3, color: 'text-zinc-200' },
                  { label: 'Bicarb. (HCO3-)', val: getPfMfResult().hco3, color: 'text-zinc-400' }
                ].map(ion => (
                  <div key={ion.label} className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                    <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">{ion.label}</span>
                    <h5 className={`text-3xl font-black italic ${ion.color}`}>{ion.val}</h5>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h6 className="text-[11px] font-black text-halliburton-red uppercase italic tracking-widest">Tratamiento Recomendado</h6>
                    {isEditing && <span className="text-[8px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-bold">Personalizar vista activada</span>}
                  </div>
                  <button
                    onClick={() => copyToClipboard(`Pf/Mf Results:\nOH: ${getPfMfResult().oh} mg/L\nCO3: ${getPfMfResult().co3} mg/L\nHCO3: ${getPfMfResult().hco3} mg/L`)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <Icon name="share-2" size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {treatmentConfig.map((treat) => (
                    <div
                      key={treat.id}
                      className={`p-5 bg-white/5 rounded-3xl border transition-all relative group/treat ${treat.visible ? 'border-white/5' : 'opacity-30 border-dashed border-zinc-700'} ${!treat.visible && !isEditing ? 'hidden' : ''}`}
                    >
                      {isEditing && (
                        <div className="absolute -top-2 -left-2 z-10">
                          <button onClick={() => toggleTreatment(treat.id)} className={`p-1.5 rounded-full ${treat.visible ? 'bg-green-500' : 'bg-zinc-600'} text-white shadow-lg`}><Icon name={treat.visible ? "eye" : "eye-off"} size={10} /></button>
                        </div>
                      )}
                      <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">{treat.label}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white italic">{getPfMfResult()[treat.id]}</span>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase">{unitMode === 'field' ? 'lb/bbl' : 'kg/m³'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {(!getPfMfResult().invalid && parseFloat(getPfMfResult().oh) > 500 && Math.abs(2 * parseFloat(titration.pf) - parseFloat(titration.mf)) < 0.2 * parseFloat(titration.mf)) && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-[9px] font-bold text-orange-400 uppercase tracking-widest text-center">
                    ⚠️ ALERTA: Posible contaminación por Carbonatos. Verificar con Yeso.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'mixing' && (
            <div className="bg-zinc-900 p-10 rounded-[3.5rem] text-white space-y-8 relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Icon name="blend" size={100} /></div>
              <span className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-500 block">Resultado de Mezcla</span>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black text-halliburton-red uppercase block mb-1">Densidad Final</span>
                    <div className="flex items-baseline gap-2">
                      <h5 className="text-4xl font-black italic">{getMixingResult().dens}</h5>
                      <span className="text-xs font-bold opacity-40 uppercase">{mixUnits.dens}</span>
                    </div>
                  </div>
                  <Icon name="droplet" size={32} className="text-white/10" />
                </div>
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black text-halliburton-red uppercase block mb-1">Volumen Total</span>
                    <div className="flex items-baseline gap-2">
                      <h5 className="text-4xl font-black italic">{getMixingResult().vol}</h5>
                      <span className="text-xs font-bold opacity-40 uppercase">{mixUnits.vol}</span>
                    </div>
                  </div>
                  <Icon name="database" size={32} className="text-white/10" />
                </div>

                {parseFloat(getMixDensificationTons()) > 0 && (
                  <div className="pt-6 border-t border-white/10 space-y-4 animate-fade-in">
                    <span className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-500 block">Ajuste con Densificante</span>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black text-halliburton-red uppercase block mb-1">Densificante Requerido</span>
                          <div className="flex items-baseline gap-2">
                            <h5 className="text-4xl font-black italic text-halliburton-red">{getMixDensificationTons()}</h5>
                            <span className="text-xs font-bold opacity-40 uppercase">Tons métricas</span>
                          </div>
                        </div>
                        <Icon name="arrow-up-circle" size={32} className="text-white/10" />
                      </div>
                      <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black text-halliburton-red uppercase block mb-1">Volumen Final Ajustado</span>
                          <div className="flex items-baseline gap-2">
                            <h5 className="text-4xl font-black italic">{getMixDensificationVolFinal()}</h5>
                            <span className="text-xs font-bold opacity-40 uppercase">{mixUnits.vol}</span>
                          </div>
                        </div>
                        <Icon name="database" size={32} className="text-white/10" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'conv' && (
            <div className="grid grid-cols-1 gap-4 h-full">
              <div className="bg-halliburton-red/10 p-8 rounded-[2.5rem] border border-halliburton-red/20 h-full flex flex-col justify-center text-center">
                <span className="text-[14px] font-black text-halliburton-red uppercase block mb-6 tracking-widest">Conversiones de Campo</span>
                <div className="space-y-4 max-w-xs mx-auto w-full">
                  <div className="flex justify-between items-center text-[13px] py-2 border-b border-halliburton-red/10">
                    <span className="font-bold text-zinc-500 dark:text-zinc-400 italic">{convReverse ? 'lb/pie³ → ppg' : 'ppg → lb/pie³'}</span>
                    <span className="font-black dark:text-white">{convReverse ? (convVal / 7.48).toFixed(2) : (convVal * 7.48).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] py-2 border-b border-halliburton-red/10">
                    <span className="font-bold text-zinc-500 dark:text-zinc-400 italic">{convReverse ? 'gal (US) → bbl' : 'bbl → gal (US)'}</span>
                    <span className="font-black dark:text-white">{convReverse ? (convVal / 42).toFixed(2) : (convVal * 42).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] py-2 border-b border-halliburton-red/10">
                    <span className="font-bold text-zinc-500 dark:text-zinc-400 italic">{convReverse ? 'mts → ft' : 'ft → mts'}</span>
                    <span className="font-black dark:text-white">{convReverse ? (convVal * 3.28084).toFixed(1) : ftToM(convVal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'lgs' && (
            <div className="bg-zinc-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Icon name="percent" size={100} /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 block">Resultado de Dilución de Sólidos</span>

              {getLGSResult().invalid && (
                <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 uppercase tracking-widest text-center">
                  ⚠️ {getLGSResult().msg}
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <span className="text-[11px] font-black text-halliburton-red uppercase block mb-1">Volumen de Diluyente a Agregar (V2)</span>
                  <div className="flex items-baseline gap-2">
                    <h5 className="text-6xl font-black italic">{getLGSResult().v2}</h5>
                    <span className="text-xl font-bold opacity-40 uppercase">{unitMode === 'field' ? 'bbl' : 'm³'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Volumen Final (Vf)</span>
                    <div className="flex items-baseline gap-1">
                      <h6 className="text-2xl font-black italic text-zinc-200">{getLGSResult().vf}</h6>
                      <span className="text-[10px] font-bold opacity-40 uppercase">{unitMode === 'field' ? 'bbl' : 'm³'}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Factor (V2 / V1)</span>
                    <h6 className="text-2xl font-black italic text-zinc-200">{getLGSResult().factor}</h6>
                  </div>
                </div>

                {!getLGSResult().invalid && parseFloat(getLGSResult().factor) > 4 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-[9px] font-bold text-yellow-400 uppercase tracking-wider leading-relaxed">
                    💡 Diagnóstico Operativo: El volumen de dilución es alto ({getLGSResult().factor}x). Esto se debe a que el diluyente también contiene sólidos (C2 = {lgs.c2}%). Se recomienda usar fluido base limpio (0% LGS) o maximizar el uso de centrífugas.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'lgs_retort' && (
            <div className="bg-zinc-900 p-10 rounded-[3.5rem] text-white flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Icon name="percent" size={120} />
              </div>

              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">Análisis Sólidos & Salinidad</span>
                <button
                  onClick={() => {
                    const res = getLgsRetortResult();
                    if (res.invalid) return;
                    copyToClipboard(
                      `ANÁLISIS RETORTA & CLORUROS:\n- WPS (Salinidad): ${res.wps.toFixed(0)} ppm\n- Cloruros: ${res.cl_mgL.toFixed(0)} mg/L\n- Sólidos Suspendidos Totales (Vss): ${res.v_ss.toFixed(2)}%\n- ASG: ${res.asg.toFixed(3)}\n- LGS: ${res.pctLgs.toFixed(2)}% (${res.lgs_mass.toFixed(1)} ${unitMode === 'field' ? 'ppb' : 'kg/m³'})\n- Barita: ${res.pctBarite.toFixed(2)}% (${res.barite_mass.toFixed(1)} ${unitMode === 'field' ? 'ppb' : 'kg/m³'})`
                    );
                  }}
                  className="p-3 bg-white/10 hover:bg-halliburton-red rounded-2xl transition-all shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <Icon name="share-2" size={14} /> Copiar Reporte
                </button>
              </div>

              {getLgsRetortResult().invalid ? (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 uppercase tracking-widest text-center">
                  ⚠️ {getLgsRetortResult().msg}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Main metric: Salinity */}
                  <div className="bg-gradient-to-br from-halliburton-red to-[#a30000] p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Salinidad Fase Acuosa (WPS)</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h5 className="text-5xl font-black italic">{getLgsRetortResult().wps.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</h5>
                      <span className="text-lg font-black opacity-60 italic uppercase">PPM</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10 text-[9px] font-black uppercase tracking-wider text-white/80">
                      <div>Cloruros: <span className="text-white font-bold">{getLgsRetortResult().cl_mgL.toLocaleString('es-AR', { maximumFractionDigits: 0 })} mg/L</span></div>
                      <div>NaCl Equiv: <span className="text-white font-bold">{getLgsRetortResult().nacl_mgL.toLocaleString('es-AR', { maximumFractionDigits: 0 })} mg/L</span></div>
                    </div>
                  </div>

                  {/* Solids breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* LGS Card */}
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black text-halliburton-red uppercase block mb-1 tracking-widest">Sólidos Baja Gravedad (LGS)</span>
                        <div className="flex items-baseline gap-2">
                          <h5 className="text-4xl font-black italic text-white">{getLgsRetortResult().pctLgs.toFixed(2)}%</h5>
                          <span className="text-xs font-bold opacity-40 uppercase">Vol</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-baseline justify-between text-[11px] font-bold text-zinc-400">
                        <span>Masa:</span>
                        <span className="text-white font-black">{getLgsRetortResult().lgs_mass.toFixed(1)} {unitMode === 'field' ? 'ppb' : 'kg/m³'}</span>
                      </div>
                    </div>

                    {/* Barite/High Gravity Solids Card */}
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase block mb-1 tracking-widest">Sólidos Densificantes (Barita)</span>
                        <div className="flex items-baseline gap-2">
                          <h5 className="text-4xl font-black italic text-zinc-300">{lgsRetort.hasBarite ? getLgsRetortResult().pctBarite.toFixed(2) + '%' : '0.00%'}</h5>
                          <span className="text-xs font-bold opacity-40 uppercase">Vol</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-baseline justify-between text-[11px] font-bold text-zinc-400">
                        <span>Masa:</span>
                        <span className="text-white font-black">{lgsRetort.hasBarite ? getLgsRetortResult().barite_mass.toFixed(1) : '0.0'} {unitMode === 'field' ? 'ppb' : 'kg/m³'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed physics metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'ASG (Solids SG)', val: getLgsRetortResult().asg.toFixed(3), color: getLgsRetortResult().asg > 4.2 || getLgsRetortResult().asg < 2.5 ? 'text-yellow-400' : 'text-zinc-200' },
                      { label: 'Dens. Salmuera', val: getLgsRetortResult().rho_brine.toFixed(3) + ' SG', color: 'text-zinc-300' },
                      { label: 'Vol. Sal Disuelta', val: getLgsRetortResult().v_sal.toFixed(2) + '%', color: 'text-zinc-400' },
                      { label: 'Sólidos Reales (Vss)', val: getLgsRetortResult().v_ss.toFixed(2) + '%', color: 'text-zinc-200' }
                    ].map(m => (
                      <div key={m.label} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1 tracking-widest leading-tight">{m.label}</span>
                        <span className={`text-base font-black italic ${m.color}`}>{m.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Auto-sync notification */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3 items-center">
                    <div className="p-2 bg-green-500/10 text-green-400 rounded-lg shrink-0">
                      <Icon name="check" size={16} />
                    </div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-relaxed">
                      Sincronización Activa: El valor calculado de LGS ({getLgsRetortResult().pctLgs.toFixed(1)}%) se ha pre-cargado en la pestaña "Dilución LGS" (campo C1).
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeSubTab === 'rheology' && (
            <div className="bg-zinc-900 p-10 rounded-[3.5rem] text-white space-y-8 relative overflow-hidden h-full flex flex-col justify-center animate-fade-in">
              {/* Header and Toggle */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">Reograma Dinámico</span>
                  <h5 className="text-xl font-black text-white italic mt-1 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-halliburton-red animate-pulse"></span>
                    Herschel-Bulkley vs Bingham
                  </h5>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-zinc-800">
                  <button type="button" onClick={() => setRheoActiveX('rate')} className={`text-[10px] px-3.5 py-1.5 rounded-lg transition-all font-black uppercase tracking-wider ${rheoActiveX === 'rate' ? 'bg-halliburton-red text-white shadow-md' : 'text-zinc-500'}`}>Tasa de Corte (s⁻¹)</button>
                  <button type="button" onClick={() => setRheoActiveX('rpm')} className={`text-[10px] px-3.5 py-1.5 rounded-lg transition-all font-black uppercase tracking-wider ${rheoActiveX === 'rpm' ? 'bg-halliburton-red text-white shadow-md' : 'text-zinc-500'}`}>Velocidad (RPM)</button>
                </div>
              </div>

              {/* Dynamic SVG Plot */}
              {(() => {
                const rheoRes = getRheologyResult();
                const isRate = rheoActiveX === 'rate';
                const maxX = isRate ? 600 * 1.7023 : 600;
                
                // Calculate max Y for scaling
                const maxValHB = rheoRes.adjustedTau0 + rheoRes.k * Math.pow(600 * 1.7023, rheoRes.n);
                const maxValBingham = rheoRes.yp + rheoRes.vp * (600 / 300);
                const maxY = Math.max(maxValHB, maxValBingham) * 1.15; // 15% padding
                
                // Generate path points for HB curve
                const pointsHB = [];
                const steps = 60;
                for (let i = 0; i <= steps; i++) {
                  const xVal = (i / steps) * maxX;
                  const rpm = isRate ? xVal / 1.7023 : xVal;
                  const gamma = isRate ? xVal : xVal * 1.7023;
                  const yHB = rheoRes.adjustedTau0 + rheoRes.k * Math.pow(gamma, rheoRes.n);
                  
                  // Map to pixels (width 520, height 290; padding left 50, top 20)
                  const px = 50 + (xVal / maxX) * 520;
                  const py = 310 - (yHB / maxY) * 290;
                  pointsHB.push({ px, py, xVal, yVal: yHB });
                }

                // HB path d attribute
                const pathHB = pointsHB.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.px.toFixed(1)} ${pt.py.toFixed(1)}`).join(' ');
                
                // Area path for gradient fill
                const areaHB = `${pathHB} L 570 310 L 50 310 Z`;

                // Bingham line coordinates
                const pxB1 = 50;
                const pyB1 = 310 - (rheoRes.yp / maxY) * 290;
                const pxB2 = 570;
                const pyB2 = 310 - (maxValBingham / maxY) * 290;

                // Ticks
                const yTicks = [0.25, 0.5, 0.75, 1.0].map(p => ({
                  val: (p * maxY).toFixed(0),
                  py: 310 - p * 290
                }));
                const xTicks = [0.2, 0.4, 0.6, 0.8, 1.0].map(p => ({
                  val: (p * maxX).toFixed(0),
                  px: 50 + p * 520
                }));

                // Discrete rotor points coordinates
                const rotorPoints = rheoRes.data.map(d => {
                  const xVal = isRate ? d.gamma : d.rpm;
                  return {
                    rpm: d.rpm,
                    px: 50 + (xVal / maxX) * 520,
                    py: 310 - (d.thetaHB / maxY) * 290,
                    val: d.thetaHB.toFixed(1)
                  };
                });

                return (
                  <div className="space-y-4">
                    {/* SVG Container */}
                    <div className="relative bg-zinc-950 rounded-[2rem] border border-white/5 p-4 select-none">
                      <svg viewBox="0 0 600 350" className="w-full h-auto overflow-visible">
                        <defs>
                          <linearGradient id="rheoGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#CC0000" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#CC0000" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {yTicks.map(t => (
                          <line key={t.val} x1="50" y1={t.py} x2="570" y2={t.py} stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
                        ))}
                        {xTicks.map(t => (
                          <line key={t.val} x1={t.px} y1="20" x2={t.px} y2="310" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
                        ))}

                        {/* Y-axis Ticks and labels */}
                        <line x1="50" y1="20" x2="50" y2="310" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
                        <text x="40" y="313" fill="#8E979D" fontSize="10" textAnchor="end" fontWeight="bold">0</text>
                        {yTicks.map(t => (
                          <g key={t.val}>
                            <line x1="46" y1={t.py} x2="50" y2={t.py} stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
                            <text x="40" y={t.py + 4} fill="#8E979D" fontSize="9" textAnchor="end" fontWeight="bold" fontFamily="monospace">{t.val}</text>
                          </g>
                        ))}
                        <text x="15" y="165" fill="#ffffff" fillOpacity="0.4" fontSize="9" fontWeight="bold" transform="rotate(-90 15 165)" textAnchor="middle" className="uppercase tracking-widest">Esfuerzo Dial (lb/100ft²)</text>

                        {/* X-axis Ticks and labels */}
                        <line x1="50" y1="310" x2="570" y2="310" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
                        <text x="50" y="326" fill="#8E979D" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">0</text>
                        {xTicks.map(t => (
                          <g key={t.val}>
                            <line x1={t.px} y1="310" x2={t.px} y2="314" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
                            <text x={t.px} y="326" fill="#8E979D" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{t.val}</text>
                          </g>
                        ))}
                        <text x="310" y="344" fill="#ffffff" fillOpacity="0.4" fontSize="9" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest">
                          {isRate ? 'Tasa de Deformación / Corte (γ) [s⁻¹]' : 'Velocidad de Rotación [RPM]'}
                        </text>

                        {/* Curves */}
                        {/* Area under HB */}
                        <path d={areaHB} fill="url(#rheoGradient)" />

                        {/* Bingham Line */}
                        <line x1={pxB1} y1={pyB1} x2={pxB2} y2={pyB2} stroke="#f59e0b" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="6 4" />

                        {/* HB Curve */}
                        <path d={pathHB} fill="none" stroke="#CC0000" strokeWidth="2.5" />

                        {/* Rotor Points */}
                        {rotorPoints.map(p => (
                          <g key={p.rpm} className="group/dot cursor-pointer" onClick={() => setRheoSelectedRpm(p.rpm)}>
                            <circle cx={p.px} cy={p.py} r="5.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" className="transition-all duration-300 hover:r-7" />
                            <circle cx={p.px} cy={p.py} r="10" fill="transparent" />
                            <title>{p.rpm} RPM: {p.val} lb/100ft²</title>
                          </g>
                        ))}
                      </svg>

                      {/* Legend overlay */}
                      <div className="flex flex-wrap gap-4 justify-center text-[9px] font-black uppercase tracking-wider text-zinc-500 mt-2">
                        <span className="flex items-center gap-1.5 text-halliburton-red">
                          <span className="w-3 h-1 bg-halliburton-red rounded-full"></span>
                          Herschel-Bulkley
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-500">
                          <span className="w-3 h-0.5 border-t border-dashed border-amber-500"></span>
                          Bingham Plastic
                        </span>
                        <span className="flex items-center gap-1.5 text-red-400">
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                          Lecturas Dial
                        </span>
                      </div>
                    </div>

                    {/* Table and comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
                      {/* Predictions Table */}
                      <div className="md:col-span-8 space-y-3">
                        <h3 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Lecturas Dial Estimadas</h3>
                        <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-zinc-950 p-4">
                          <table className="w-full text-left border-collapse text-[11px] uppercase tracking-wider font-bold">
                            <thead>
                              <tr className="border-b border-white/5 text-zinc-500">
                                <th className="pb-3 text-left">Rotor (RPM)</th>
                                <th className="pb-3 text-right">Lectura Dial (θ-HB)</th>
                                <th className="pb-3 text-right">Bingham (θ-B)</th>
                                <th className="pb-3 text-right">Visc. Aparente (cP)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-zinc-300 font-mono">
                              {rheoRes.data.map(item => {
                                const isSelected = item.rpm === rheoSelectedRpm;
                                return (
                                  <tr
                                    key={item.rpm}
                                    onClick={() => setRheoSelectedRpm(item.rpm)}
                                    className={`transition-colors cursor-pointer hover:bg-white/5 ${isSelected ? 'bg-white/5 border-l-2 border-halliburton-red font-black text-white' : ''}`}
                                  >
                                    <td className="py-2.5 text-left flex items-center gap-1.5">
                                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-halliburton-red"></span>}
                                      {item.rpm} RPM
                                    </td>
                                    <td className="py-2.5 text-right font-black text-halliburton-red">{item.thetaHB.toFixed(2)}</td>
                                    <td className="py-2.5 text-right text-zinc-500">{item.thetaBingham.toFixed(2)}</td>
                                    <td className="py-2.5 text-right text-emerald-400">{item.viscAparente.toFixed(1)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-500 pt-1">
                          <span>Fórmula H-B: τ = τ₀ + K·γⁿ</span>
                          <button
                            type="button"
                            onClick={() => {
                              let csv = "data:text/csv;charset=utf-8,\uFEFF";
                              csv += `REOGRAMA VIRTUAL HERSCHEL-BULKLEY\r\n`;
                              csv += `Parametros Fijos: VP=${rheoRes.vp} cP, YP=${rheoRes.yp} lb/100ft2, Tau0=${rheoRes.tau0} lb/100ft2\r\n\r\n`;
                              csv += `RPM,Tasa de Corte (s-1),Lectura de Dial (theta-HB),Lectura Bingham (theta-B),Viscosidad Aparente (cP)\r\n`;
                              rheoRes.data.forEach(d => {
                                csv += `${d.rpm},${d.gamma.toFixed(3)},${d.thetaHB.toFixed(3)},${d.thetaBingham.toFixed(3)},${d.viscAparente.toFixed(2)}\r\n`;
                              });
                              const uri = encodeURI(csv);
                              const a = document.createElement("a");
                              a.setAttribute("href", uri);
                              a.setAttribute("download", `perfil_reologia_fann_vp${rheoRes.vp}_yp${rheoRes.yp}.csv`);
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}
                            className="text-halliburton-red hover:scale-105 transition-transform font-bold flex items-center gap-1"
                          >
                            Descargar Datos CSV <Icon name="download" size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Comparative Card */}
                      <div className="md:col-span-4 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-4">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Desviación del Modelo</span>
                          <div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Baja Velocidad (3 RPM):</span>
                            <div className="flex items-baseline gap-1 mt-1">
                              <h5 className="text-3xl font-black italic text-orange-400">
                                +{(( (rheoRes.yp + rheoRes.vp * (3 / 300)) - rheoRes.data.find(i => i.rpm === 3).thetaHB ) / rheoRes.data.find(i => i.rpm === 3).thetaHB * 100).toFixed(1)}%
                              </h5>
                              <span className="text-[8px] font-bold text-zinc-500 uppercase">Exceso Bingham</span>
                            </div>
                          </div>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight leading-relaxed">
                            Bingham suele sobreestimar las pérdidas de carga en el anular en velocidades de corte bajas. El modelo Herschel-Bulkley corrige esta brecha matemática, reduciendo el riesgo de fracturas accidentales.
                          </p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-bold uppercase tracking-wider text-zinc-300 leading-snug">
                          <span className="text-halliburton-red font-black">Tip de Ingeniería:</span> Utiliza τ₀ para calibrar el esfuerzo de geles en lodos viscosos o densificados.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FluidCalculator;
