import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Modal from './components/Modal';
import FloatingNotes from './components/FloatingNotes';
import UpdateModal from './components/UpdateModal';
import { INITIAL_DATA_REFINED } from './data/initialData';
import { translations, translateText } from './data/translations';

const CURRENT_CODE_VERSION = '2.1.0';

const mergeData = (localSectors, defaultSectors) => {
    const isCustomId = (id) => {
        if (typeof id !== 'string') return false;
        return /^(sec|sub|l)_\d{10,}$/.test(id);
    };

    const merged = defaultSectors.map(defSector => {
        const userSector = localSectors.find(s => s.id === defSector.id);
        if (!userSector) return defSector;

        const defSubsectors = defSector.subsectors || [];
        const userSubsectors = userSector.subsectors || [];
        const mergedSubsectors = [];

        defSubsectors.forEach(defSub => {
            const userSub = userSubsectors.find(sub => sub.id === defSub.id);
            if (!userSub) {
                mergedSubsectors.push(defSub);
                return;
            }

            const defLinks = defSub.links || [];
            const userLinks = userSub.links || [];
            const mergedLinks = [];

            defLinks.forEach(defLink => {
                const userLink = userLinks.find(l => l.id === defLink.id);
                if (!userLink) {
                    mergedLinks.push(defLink);
                } else {
                    mergedLinks.push({
                        ...defLink,
                        isFavorite: !!userLink.isFavorite,
                        lastUsed: userLink.lastUsed || defLink.lastUsed || 0
                    });
                }
            });

            userLinks.forEach(userLink => {
                if (isCustomId(userLink.id)) {
                    mergedLinks.push(userLink);
                }
            });

            mergedSubsectors.push({
                ...defSub,
                links: mergedLinks
            });
        });

        userSubsectors.forEach(userSub => {
            if (isCustomId(userSub.id)) {
                mergedSubsectors.push(userSub);
            }
        });

        return {
            ...defSector,
            subsectors: mergedSubsectors
        };
    });

    localSectors.forEach(userSector => {
        if (isCustomId(userSector.id)) {
            merged.push(userSector);
        }
    });

    return merged;
};

const App = () => {
    const [lang, setLang] = useState(() => localStorage.getItem('baroid_lang') || 'es');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateInfo, setUpdateInfo] = useState(null);
    const [showUpdateBanner, setShowUpdateBanner] = useState(false);
    const [sectors, setSectors] = useState(() => {
        const saved = localStorage.getItem('baroid_hub_data_v6');
        if (!saved) return INITIAL_DATA_REFINED;
        try {
            return JSON.parse(saved);
        } catch (e) {
            return INITIAL_DATA_REFINED;
        }
    });
    const [activeSector, setActiveSector] = useState(sectors[0]?.id || 'sec_hr');
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(null);
    const [modalData, setModalData] = useState({});
    const [showNotes, setShowNotes] = useState(false);
    const [cardSize, setCardSize] = useState(() => localStorage.getItem('baroid_card_size') || 'large');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('baroid_dark_mode') === 'true');
    const [notes, setNotes] = useState(() => localStorage.getItem('baroid_notes') || '');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const searchInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const resetToDefaults = () => {
        if (confirm(translations[lang].backupConfirm)) {
            const keysToRemove = [
                'baroid_piletas_v8',
                'baroid_fluid_systems_v4',
                'baroid_calc_tabs_v7',
                'baroid_calc_tabs_v6',
                'baroid_calc_tabs_v5',
                'baroid_calc_tabs_v4',
                'baroid_treatment_config',
                'baroid_hub_data_v6',
                'baroid_hub_data_v5',
                'baroid_calc_tabs_v2',
                'baroid_card_size',
                'baroid_dark_mode',
                'baroid_notes',
                'baroid_products_inventory_v2',
                'baroid_inventory_entries_v1'
            ];
            keysToRemove.forEach(k => localStorage.removeItem(k));
            window.location.reload();
        }
    };

    const resetSectorsOnly = () => {
        const confirmMsg = lang === 'es' 
            ? 'Se restablecerán todos los sectores y enlaces a sus valores originales. Perderás los links y sectores personalizados que hayas creado manualmente. Tus calculadoras, piletas, notas e inventario NO se verán afectados. ¿Deseas continuar?' 
            : 'All default sectors and links will be reset. Any manually created links or sectors will be lost. Your calculators, mud pits, notes, and inventory will NOT be affected. Do you want to continue?';
            
        if (confirm(confirmMsg)) {
            localStorage.removeItem('baroid_hub_data_v6');
            localStorage.removeItem('baroid_hub_data_v5');
            window.location.reload();
        }
    };

    // Version Checking Logic
    const handleCloseUpdateModal = () => {
        if (updateInfo && updateInfo.version) {
            localStorage.setItem('baroid_dismissed_version', updateInfo.version);
        }
        setShowUpdateModal(false);
    };

    // Check database version compared to code version
    useEffect(() => {
        const storedVersion = localStorage.getItem('baroid_app_version');
        const hasData = localStorage.getItem('baroid_hub_data_v6') || localStorage.getItem('baroid_hub_data_v5');
        
        if (hasData && storedVersion !== CURRENT_CODE_VERSION) {
            setShowUpdateBanner(true);
        } else if (!storedVersion) {
            localStorage.setItem('baroid_app_version', CURRENT_CODE_VERSION);
        }
    }, []);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Fetch from the absolute base path to avoid relative trailing-slash issues
                const response = await fetch('/Baroid-Home/version.json?t=' + Date.now());
                if (!response.ok) return;
                const data = await response.json();
                
                const dismissedVersion = localStorage.getItem('baroid_dismissed_version');
                
                // Compare fetched version directly with CURRENT_CODE_VERSION
                if (data.version && data.version !== CURRENT_CODE_VERSION && data.version !== dismissedVersion) {
                    setUpdateInfo(data);
                    setShowUpdateModal(true);
                }
            } catch (err) {
                console.error('Error checking version:', err);
            }
        };

        const timer = setTimeout(checkVersion, 2000);
        const interval = setInterval(checkVersion, 15 * 60 * 1000);
        
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [lang]);

    const handleUpdateApp = async () => {
        // 1. Perform database merge
        setSectors(prev => {
            const merged = mergeData(prev, INITIAL_DATA_REFINED);
            localStorage.setItem('baroid_hub_data_v6', JSON.stringify(merged));
            return merged;
        });
        localStorage.setItem('baroid_app_version', CURRENT_CODE_VERSION);
        setShowUpdateBanner(false);

        // 2. Clear cache
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            } catch (e) {
                console.error('Error clearing caches:', e);
            }
        }
        
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            } catch (e) {
                console.error('Error unregistering service worker:', e);
            }
        }
        
        // 3. Reload with cache buster
        const cacheBuster = 'v-update=' + CURRENT_CODE_VERSION;
        let cleanUrl = window.location.href;
        if (cleanUrl.includes('v-update=')) {
            cleanUrl = cleanUrl.replace(/[?&]v-update=[^&]+/g, '');
        }
        const separator = cleanUrl.includes('?') ? '&' : '?';
        window.location.href = cleanUrl + separator + cacheBuster;
    };

    const [stableLastUsed, setStableLastUsed] = useState({});

    useEffect(() => {
        const news = {};
        sectors.forEach(s => (s.subsectors || []).forEach(sub => (sub.links || []).forEach(l => {
            news[l.id] = l.lastUsed || 0;
        })));
        setStableLastUsed(news);
    }, [activeSector, searchQuery]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('baroid_dark_mode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('baroid_card_size', cardSize);
    }, [cardSize]);

    useEffect(() => {
        localStorage.setItem('baroid_notes', notes);
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('baroid_lang', lang);
        document.title = lang === 'es' ? 'BAROID HUB | Aplicación' : 'BAROID HUB | Operations App';
        document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
        localStorage.setItem('baroid_hub_data_v6', JSON.stringify(sectors));
    }, [sectors]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const exportData = () => {
        const backup = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('baroid_')) {
                try {
                    backup[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    backup[key] = localStorage.getItem(key);
                }
            }
        }

        backup._meta = {
            date: new Date().toISOString(),
            app: 'BaroidHub',
            version: CURRENT_CODE_VERSION
        };

        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `BaroidHub_FullBackup_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
    };

    const importData = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm(translations[lang].importWarning)) {
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);

                if (!backup._meta && !confirm(translations[lang].importNoMeta)) {
                    return;
                }

                Object.keys(backup).forEach(key => {
                    if (key !== '_meta') {
                        const val = typeof backup[key] === 'object' ? JSON.stringify(backup[key]) : backup[key];
                        localStorage.setItem(key, val);
                    }
                });

                alert(translations[lang].importSuccess);
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert(translations[lang].importError);
            }
        };
        reader.readAsText(file);
    };

    const toggleFavorite = (lid) => {
        setSectors(prev => prev.map(s => ({
            ...s,
            subsectors: s.subsectors.map(sub => ({
                ...sub,
                links: sub.links.map(l => l.id === lid ? { ...l, isFavorite: !l.isFavorite } : l)
            }))
        })));
    };

    const trackLinkClick = (lid) => {
        setSectors(prev => prev.map(s => ({
            ...s,
            subsectors: s.subsectors.map(sub => ({
                ...sub,
                links: sub.links.map(l => l.id === lid ? { ...l, lastUsed: Date.now() } : l)
            }))
        })));
    };

    const updateItem = (target, id, newName, newUrl = null, newIcon = null) => {
        setSectors(prev => prev.map(s => {
            if (target === 'sector' && s.id === id) return { ...s, name: newName, icon: newIcon || s.icon };
            return {
                ...s,
                subsectors: s.subsectors.map(sub => {
                    if (target === 'subsector' && sub.id === id) return { ...sub, name: newName };
                    return {
                        ...sub,
                        links: sub.links.map(l => {
                            if (target === 'link' && l.id === id) return { ...l, name: newName, url: newUrl || l.url };
                            return l;
                        })
                    };
                })
            };
        }));
        setShowModal(null);
    };

    const addSector = (name, icon) => {
        setSectors(prev => [...prev, { id: 'sec_' + Date.now(), name, icon, color: '#CC0000', subsectors: [] }]);
        setShowModal(null);
    };

    const addSubsector = (sid, name) => {
        setSectors(prev => prev.map(s => s.id === sid ? { ...s, subsectors: [...s.subsectors, { id: 'sub_' + Date.now(), name, links: [] }] } : s));
        setShowModal(null);
    };

    const addLink = (sid, subsid, name, url) => {
        setSectors(prev => prev.map(s => s.id === sid ? {
            ...s, subsectors: s.subsectors.map(sub => sub.id === subsid ? { ...sub, links: [...sub.links, { id: 'l_' + Date.now(), name, url, isFavorite: false }] } : sub)
        } : s));
        setShowModal(null);
    };

    const deleteItem = (type, sid, subsid = null, lid = null) => {
        const deleteConfirmMsg = translations[lang].deleteConfirm.replace('{type}', type);
        if (!confirm(deleteConfirmMsg)) return;
        if (type === 'sector') setSectors(prev => prev.filter(s => s.id !== sid));
        if (type === 'subsector') setSectors(prev => prev.map(s => s.id === sid ? { ...s, subsectors: s.subsectors.filter(sub => sub.id !== subsid) } : s));
        if (type === 'link') setSectors(prev => prev.map(s => s.id === sid ? { ...s, subsectors: s.subsectors.map(sub => sub.id === subsid ? { ...sub, links: sub.links.filter(l => l.id !== lid) } : sub) } : s));
    };

    const favoritesList = useMemo(() => {
        const favs = [];
        sectors.forEach(s => {
            (s.subsectors || []).forEach(sub => {
                (sub.links || []).forEach(l => {
                    if (l.isFavorite) {
                        favs.push({ ...l, sid: s.id, subsid: sub.id });
                    }
                });
            });
        });
        return favs;
    }, [sectors]);

    const displaySectors = useMemo(() => {
        let data = [];

        if (activeSector === 'favorites') {
            data = [{
                id: 'fav',
                name: translateText('Mis Favoritos', lang),
                icon: 'heart',
                color: '#CC0000',
                subsectors: [{ id: 'fs1', name: translateText('Documentos Destacados', lang), links: favoritesList }]
            }];
        } else if (activeSector === 'calculator' || activeSector === 'inventory' || activeSector === 'piletas') {
            data = [];
        } else {
            data = sectors.filter(s => s.id === activeSector);
        }

        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            const source = activeSector === 'favorites' ? data : sectors;
            data = source.map(s => ({
                ...s,
                subsectors: (s.subsectors || []).map(sub => ({
                    ...sub,
                    links: (sub.links || []).filter(l =>
                        l.name.toLowerCase().includes(q) ||
                        sub.name.toLowerCase().includes(q)
                    )
                })).filter(sub => sub.links.length > 0)
            })).filter(s => s.subsectors.length > 0);
        }

        return data.map(s => ({
            ...s,
            name: translateText(s.name, lang),
            subsectors: (s.subsectors || []).map(sub => ({
                ...sub,
                name: translateText(sub.name, lang),
                links: [...(sub.links || [])]
                    .map(l => ({ ...l, name: translateText(l.name, lang) }))
                    .sort((a, b) => (stableLastUsed[b.id] || 0) - (stableLastUsed[a.id] || 0))
            }))
        }));
    }, [sectors, activeSector, searchQuery, stableLastUsed, favoritesList, lang]);

    return (
        <div className="bg-[var(--h-bg)] min-h-screen transition-colors duration-300 flex justify-center">
            <div className="flex flex-col lg:flex-row w-full max-w-[1600px] relative shadow-2xl">
                {isMobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}
                <Sidebar
                    sectors={sectors.map(s => ({ ...s, name: translateText(s.name, lang) }))}
                    setActiveSector={setActiveSector}
                    activeSector={activeSector}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    resetToDefaults={resetToDefaults}
                    resetSectorsOnly={resetSectorsOnly}
                    exportData={exportData}
                    importData={importData}
                    fileInputRef={fileInputRef}
                    searchInputRef={searchInputRef}
                    notes={notes}
                    setNotes={setNotes}
                    favorites={favoritesList}
                    deleteItem={deleteItem}
                    setShowModal={setShowModal}
                    setModalData={setModalData}
                    cardSize={cardSize}
                    setCardSize={setCardSize}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                    lang={lang}
                    setLang={setLang}
                />
                <MainContent
                    displaySectors={displaySectors}
                    activeSector={activeSector}
                    searchQuery={searchQuery}
                    sectors={sectors}
                    isEditing={isEditing}
                    setShowModal={setShowModal}
                    setModalData={setModalData}
                    deleteItem={deleteItem}
                    trackLinkClick={trackLinkClick}
                    toggleFavorite={toggleFavorite}
                    cardSize={cardSize}
                    setCardSize={setCardSize}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    addLink={addLink}
                    setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                    lang={lang}
                    setLang={setLang}
                    showUpdateBanner={showUpdateBanner}
                    setShowUpdateBanner={setShowUpdateBanner}
                    onUpdateApp={handleUpdateApp}
                />
                <Modal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    modalData={modalData}
                    addSector={addSector}
                    addSubsector={addSubsector}
                    addLink={addLink}
                    updateItem={updateItem}
                    lang={lang}
                />
                <FloatingNotes
                    notes={notes}
                    setNotes={setNotes}
                    showNotes={showNotes}
                    setShowNotes={setShowNotes}
                    lang={lang}
                />
                <UpdateModal
                    isOpen={showUpdateModal}
                    onClose={handleCloseUpdateModal}
                    onUpdate={handleUpdateApp}
                    updateInfo={updateInfo}
                    lang={lang}
                />
            </div>
        </div>
    );
};

export default App;
