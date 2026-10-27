# El Infierno de la Deep Web

An interactive Spanish-language 3D artwork depicting six destinations in a digital underworld. The experience combines a procedural Three.js scene, dossier-style storytelling, generative audio, and responsive controls.

## Live site

**[Open the interactive artwork](https://sourcenameux.github.io/infierno-deep-web/)**

## Run locally

The project is a static site with no build step or package installation.

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000> in a current version of Chrome, Edge, or Firefox. A local HTTP server is recommended so every browser feature behaves as it does in production.

## Deployment

GitHub Pages publishes directly from the repository root on the `main` branch. Every push to `main` triggers a new deployment.

The `.nojekyll` file tells GitHub Pages to serve the project as a plain static site without Jekyll processing.

## Project structure

```text
index.html        Page markup and script loading order
styles.css       Responsive interface and visual effects
js/              Scene, UI, audio, geometry, and procedural models
vendor/          Vendored Three.js runtime and post-processing scripts
models/          Local 3D assets and authoring notes
```

## Controls

- Drag to orbit the camera.
- Use the mouse wheel or trackpad to zoom.
- Select a circuit from the interface or press `1`–`5` and `0`.
- Press `T` to start or stop the guided tour.
- Press `Escape` to close the current dossier.
