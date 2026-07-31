# Reglas de Desarrollo para Baroid Hub / Development Rules for Baroid Hub

## 🌐 Soporte Multi-idioma Obligatorio (ES/EN) / Mandatory Multi-language Support (ES/EN)

> [!IMPORTANT]
> **ESPAÑOL:**
> Cualquier nueva característica, pestaña, modal, cálculo, alerta, descripción o cambio en la interfaz gráfica **DEBE** ser implementado y verificado en ambos idiomas (Español e Inglés) utilizando el diccionario de traducciones ubicado en `src/data/translations.js`.
> * No se permiten textos fijos (hardcoded) en español o inglés dentro de los componentes.
> * Las palabras técnicas en inglés deben utilizar la terminología oficial y real de la industria del petróleo y gas (Oil & Gas).
> * Los lemas corporativos de Halliburton deben utilizar siempre las versiones oficiales en inglés.

> [!IMPORTANT]
> **ENGLISH:**
> Any new feature, tab, modal, calculation, alert, description, or user interface change **MUST** be implemented and verified in both languages (Spanish and English) using the translation dictionary located in `src/data/translations.js`.
> * No hardcoded text in Spanish or English is allowed within components.
> * Technical English terms must use authentic, real-world Oil & Gas industry terminology.
> * Corporate Halliburton slogans must always use the official English versions.

## 🛑 NO ACTUALIZAR EL STANDALONE HTML (Baroid Home.html) / DO NOT UPDATE THE STANDALONE HTML (Baroid Home.html)

> [!WARNING]
> **ESPAÑOL:**
> Queda **ESTRICTAMENTE PROHIBIDO** actualizar, compilar o modificar de forma directa el archivo HTML completo/independiente (`Baroid Home.html` o similar).
> * Todas las modificaciones y características nuevas deben hacerse únicamente en los archivos del repositorio (carpeta `src/`).
> * La compilación o actualización del HTML completo no es necesaria y consume demasiados tokens. La aplicación de repositorio (Vite/React) es la versión oficial y el único lugar donde se deben hacer cambios.
>
> **ENGLISH:**
> It is **STRICTLY FORBIDDEN** to update, compile, or directly modify the standalone/complete HTML file (`Baroid Home.html` or similar).
> * All modifications and new features must be made solely in the repository files (`src/` folder).
> * Compiling or updating the complete HTML is unnecessary and consumes too many tokens. The repository application (Vite/React) is the official version and the only place where changes should be made.
