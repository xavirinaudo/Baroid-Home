# compile_standalone.ps1
$ErrorActionPreference = "Stop"

$workspace = Get-Location

$files = @(
    "src/data/translations.js",
    "src/data/initialData.js",
    "src/components/Icon.jsx",
    "src/components/GreetingDashboard.jsx",
    "src/components/AccurisGuideModal.jsx",
    "src/components/PayslipWarningModal.jsx",
    "src/components/UpdateModal.jsx",
    "src/components/Modal.jsx",
    "src/components/FloatingNotes.jsx",
    "src/components/Sidebar.jsx",
    "src/components/FluidCalculator.jsx",
    "src/components/FluidFormulation.jsx",
    "src/components/InventoryConciliation.jsx",
    "src/components/PiletasSystem.jsx",
    "src/components/MainContent.jsx",
    "src/App.jsx"
)

Write-Output "Reading and processing React components..."
$compiledJs = "/* Compiled Standalone React Code */`n"

foreach ($file in $files) {
    $fullPath = Join-Path $workspace $file
    if (-not (Test-Path $fullPath)) {
        Write-Warning "File $file not found."
        continue
    }
    
    $content = [System.IO.File]::ReadAllText($fullPath)
    
    # Remove imports
    $content = $content -replace '(?m)^import\s+.*?;?\s*$', ''
    $content = $content -replace '(?m)^import\s+type\s+.*?;?\s*$', ''
    
    # Remove export default
    $content = $content -replace '(?m)^export\s+default\s+\w+;?\s*$', ''
    
    # Replace export const / export function / export default
    $content = $content -replace '(?m)^export\s+const\s+', 'const '
    $content = $content -replace '(?m)^export\s+function\s+', 'function '
    $content = $content -replace '(?m)^export\s+class\s+', 'class '
    $content = $content -replace '(?m)^export\s+default\s+', ''
    
    $compiledJs += "`n// --- FILE: $file ---`n" + $content
}

# Get current git hash
$commitHash = "dev"
try {
    $commitHash = (git rev-parse --short HEAD).Trim()
} catch {
    $commitHash = "v-" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
}

# Replace CURRENT_CODE_VERSION string with actual hash
$targetRegex = [regex]::Escape("const CURRENT_CODE_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';")
$compiledJs = $compiledJs -replace $targetRegex, "const CURRENT_CODE_VERSION = '$commitHash';"

# Add root render
$compiledJs += "`nconst root = ReactDOM.createRoot(document.getElementById('root'));`nroot.render(<App />);`n"

# Load template HTML
$htmlPath = Join-Path $workspace "Baroid Home.html"
if (-not (Test-Path $htmlPath)) {
    Write-Error "Baroid Home.html template not found."
    exit 1
}

$htmlContent = [System.IO.File]::ReadAllText($htmlPath)

$scriptStartTag = '<script type="text/babel">'
$scriptEndTag = '</script>'

$startIdx = $htmlContent.IndexOf($scriptStartTag)
$endIdx = $htmlContent.IndexOf($scriptEndTag, $startIdx)

if ($startIdx -eq -1 -or $endIdx -eq -1) {
    Write-Error "Could not locate script tags in template."
    exit 1
}

$newHtml = $htmlContent.Substring(0, $startIdx + $scriptStartTag.Length) + "`n" + $compiledJs + "`n    " + $htmlContent.Substring($endIdx)

[System.IO.File]::WriteAllText($htmlPath, $newHtml)

Write-Output "Successfully compiled all components into Baroid Home.html (version: $commitHash)!"
