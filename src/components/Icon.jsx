import React, { useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, size = 20, className = "", style = {} }) => {
  if (!name) return null;

  // 1. Vite / Bundler: Use React components from lucide-react if available
  const icons = (typeof LucideIcons !== 'undefined' && LucideIcons && Object.keys(LucideIcons).length > 0)
    ? LucideIcons
    : ((typeof window !== 'undefined' && (window.LucideReact || window.lucideReact)) || null);

  if (icons) {
    const pascalName = name
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    let TargetIcon = icons[pascalName];
    if (!TargetIcon) {
      if (pascalName === 'DropletOff') TargetIcon = icons.Droplets;
      else if (pascalName === 'Repeat') TargetIcon = icons.RefreshCw;
      else if (pascalName === 'ArrowDown01') TargetIcon = icons.SortAsc;
      else if (pascalName === 'ArrowUp10') TargetIcon = icons.SortDesc;
      else if (pascalName === 'SortAsc') TargetIcon = icons.ArrowDownAZ;
    }

    if (TargetIcon) {
      try {
        return <TargetIcon size={size} className={className} style={style} />;
      } catch (e) {
        // Fallback to DOM icon below
      }
    }
  }

  // 2. Standalone browser fallback using window.lucide DOM renderer
  const iconRef = useRef(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide && iconRef.current) {
      try {
        iconRef.current.innerHTML = '';
        const i = document.createElement('i');
        i.setAttribute('data-lucide', name);
        i.style.width = `${size}px`;
        i.style.height = `${size}px`;
        iconRef.current.appendChild(i);
        window.lucide.createIcons({ elements: [i] });
      } catch (e) {
        console.error("Icon render error:", name, e);
      }
    }
  }, [name, size]);

  return (
    <span
      ref={iconRef}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ ...style, width: size, height: size, minWidth: size, minHeight: size }}
    />
  );
};

export default Icon;
