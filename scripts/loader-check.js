/**
 * Simple check to verify if the main app module loaded correctly.
 * This runs as a regular script (not a module) to detect module loading failures.
 */
window.addEventListener('load', () => {
    if (!window.appInitialized) {
        const isLocal = window.location.protocol === 'file:';
        let msg = "App initialization failed.";
        if (isLocal) {
            msg += "\n\nCRITICAL: You are opening this file locally (file://). Browsers block modern JavaScript modules over local files.\n\nPlease use a local server like 'Live Server' in VS Code to run this project.";
        }
        alert(msg);
    }
});
