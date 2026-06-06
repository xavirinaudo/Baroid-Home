import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, size = 20, className = "", style = {} }) => {
  if (!name) return null;

  // Convert kebab-case or snake_case to PascalCase (e.g. arrow-up-circle -> ArrowUpCircle, play-circle -> PlayCircle)
  const pascalName = name
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // Fallbacks for specific icons or rename mismatches
  let TargetIcon = LucideIcons[pascalName];
  
  if (!TargetIcon) {
    // Check common mismatches
    if (pascalName === 'DropletOff') TargetIcon = LucideIcons.Droplets;
    else if (pascalName === 'Repeat') TargetIcon = LucideIcons.RefreshCw;
    else if (pascalName === 'ArrowDown01') TargetIcon = LucideIcons.SortAsc;
    else if (pascalName === 'ArrowUp10') TargetIcon = LucideIcons.SortDesc;
    else if (pascalName === 'SortAsc') TargetIcon = LucideIcons.ArrowDownAZ;
  }

  // Ensure TargetIcon is a valid component
  if (!TargetIcon) {
    TargetIcon = LucideIcons.CircleHelp || LucideIcons.HelpCircle || LucideIcons.Circle || (() => null);
  }

  try {
    return <TargetIcon size={size} className={className} style={style} />;
  } catch (e) {
    console.error("Error rendering icon:", name, e);
    return <span className={className} style={{ width: size, height: size, display: 'inline-block', fontSize: size }}>•</span>;
  }
};

export default Icon;

