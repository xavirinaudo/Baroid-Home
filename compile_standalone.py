import re
import os
import subprocess
import datetime

def compile_standalone():
    workspace = os.path.dirname(os.path.abspath(__file__))
    
    # Files in topological order
    files = [
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
    ]
    
    print("Reading and processing React components...")
    compiled_js = []
    
    # Add babel global helper if needed
    compiled_js.append("/* Compiled Standalone React Code */\n")
    
    for relative_path in files:
        full_path = os.path.join(workspace, relative_path)
        if not os.path.exists(full_path):
            print(f"Warning: File {relative_path} not found.")
            continue
            
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Clean imports and exports
        # Remove imports
        content = re.sub(r'^import\s+.*?;?\s*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'^import\s+type\s+.*?;?\s*$', '', content, flags=re.MULTILINE)
        
        # Remove export default
        content = re.sub(r'^export\s+default\s+\w+;?\s*$', '', content, flags=re.MULTILINE)
        
        # Replace export const / export function
        content = re.sub(r'^export\s+const\s+', 'const ', content, flags=re.MULTILINE)
        content = re.sub(r'^export\s+function\s+', 'function ', content, flags=re.MULTILINE)
        content = re.sub(r'^export\s+class\s+', 'class ', content, flags=re.MULTILINE)
        content = re.sub(r'^export\s+default\s+', '', content, flags=re.MULTILINE)
        
        compiled_js.append(f"\n// --- FILE: {relative_path} ---\n")
        compiled_js.append(content)
        
    js_code = "".join(compiled_js)
    
    # Get current git hash
    commit_hash = 'dev'
    try:
        commit_hash = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode('utf-8').strip()
    except Exception as e:
        print(f"Warning: Could not get git hash: {e}")
        commit_hash = 'v-' + str(int(datetime.datetime.now().timestamp()))
        
    # Replace CURRENT_CODE_VERSION string with actual hash
    js_code = re.sub(r'const CURRENT_CODE_VERSION = typeof __APP_VERSION__ !== \'undefined\' \? __APP_VERSION__ : \'dev\';', 
                     f"const CURRENT_CODE_VERSION = '{commit_hash}';", js_code)
    
    # Also add root render and basic setup at the end
    js_code += "\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);\n"
                     
    # Load template html
    html_path = os.path.join(workspace, "Baroid Home.html")
    if not os.path.exists(html_path):
        print("Error: Baroid Home.html template not found.")
        return
        
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    # Locate script tag
    script_start_tag = '<script type="text/babel">'
    script_end_tag = '</script>'
    
    start_idx = html_content.find(script_start_tag)
    end_idx = html_content.find(script_end_tag, start_idx)
    
    if start_idx == -1 or end_idx == -1:
        print("Error: Could not locate <script type=\"text/babel\"> tags in template.")
        return
        
    new_html = html_content[:start_idx + len(script_start_tag)] + "\n" + js_code + "\n    " + html_content[end_idx:]
    
    # Also register minimal Service Worker if it is not in the tail already, but it's part of the template, so keeping it
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(new_html)
        
    print(f"Successfully compiled all components into Baroid Home.html (version: {commit_hash})!")

if __name__ == "__main__":
    compile_standalone()
