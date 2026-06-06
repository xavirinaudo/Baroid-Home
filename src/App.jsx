import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Modal from './components/Modal';
import FloatingNotes from './components/FloatingNotes';
import { INITIAL_DATA_REFINED } from './data/initialData';

const App = () => {
    const [sectors, setSectors] = useState(() => {
        const saved = localStorage.getItem('baroid_hub_data_v5');
        return saved ? JSON.parse(saved) : INITIAL_DATA_REFINED;
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
    const searchInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const resetToDefaults = () => {
        if (confirm('Se borraran todos los cambios personalizados de la app. ¿Desea continuar?')) {
            const keysToRemove = [
                'baroid_piletas_v8',
                'baroid_fluid_systems_v4',
                'baroid_calc_tabs_v4',
                'baroid_treatment_config',
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
        localStorage.setItem('baroid_hub_data_v5', JSON.stringify(sectors));
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
            version: '2.0'
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

        if (!confirm("⚠️ ADVERTENCIA CRÍTICA ⚠️\n\nEsta acción SOBREESCRIBIRÁ todos sus datos actuales (Piletas, Inventario, Notas, Configuración) con los del archivo.\n\n¿Está seguro de continuar?")) {
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);

                if (!backup._meta && !confirm("Este archivo no parece tener metadatos de Baroid Hub. ¿Intentar importar de todas formas?")) {
                    return;
                }

                Object.keys(backup).forEach(key => {
                    if (key !== '_meta') {
                        const val = typeof backup[key] === 'object' ? JSON.stringify(backup[key]) : backup[key];
                        localStorage.setItem(key, val);
                    }
                });

                alert('✅ Restauración Completa. La aplicación se reiniciará para aplicar los cambios.');
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert('❌ Error: El archivo está corrupto o no es válido.');
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

    window.baroidAddPdf = addLink;

    const deleteItem = (type, sid, subsid = null, lid = null) => {
        if (!confirm(`¿Eliminar ${type}?`)) return;
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
                name: 'Mis Favoritos',
                icon: 'heart',
                color: '#CC0000',
                subsectors: [{ id: 'fs1', name: 'Documentos Destacados', links: favoritesList }]
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
            subsectors: (s.subsectors || []).map(sub => ({
                ...sub,
                links: [...(sub.links || [])].sort((a, b) => (stableLastUsed[b.id] || 0) - (stableLastUsed[a.id] || 0))
            }))
        }));
    }, [sectors, activeSector, searchQuery, stableLastUsed, favoritesList]);

    return (
        <div className="bg-[var(--h-bg)] min-h-screen transition-colors duration-300 flex justify-center">
            <div className="flex w-full max-w-[1600px] relative shadow-2xl">
                <Sidebar
                    sectors={sectors}
                    setActiveSector={setActiveSector}
                    activeSector={activeSector}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    resetToDefaults={resetToDefaults}
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
                />
                <Modal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    modalData={modalData}
                    addSector={addSector}
                    addSubsector={addSubsector}
                    addLink={addLink}
                    updateItem={updateItem}
                />
                <FloatingNotes
                    notes={notes}
                    setNotes={setNotes}
                    showNotes={showNotes}
                    setShowNotes={setShowNotes}
                />
            </div>
        </div>
    );
};

export default App;
