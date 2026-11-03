# Velora 0.3 · Less friction. More flow.

A personal Electron/Chromium browser for Apple Silicon and Intel Macs, now matching the Velora website’s dark green look.

## Install
Download the universal DMG from this repository’s Releases, open it, and drag Velora to Applications. This is an unsigned, unnotarized prototype. It does not include automatic security updates.

## New in 0.3
- Dark green surfaces and soft lime accents, refreshed setup, and a new-tab screen matching the website.
- Local Phosphor duotone control icons and bundled YouTube, ChatGPT, Classroom and Google SVG logos, with no external favicon-service dependency for shortcuts.
- Actual website favicons in tabs when provided over HTTPS, with bundled icons for the four shortcut brands and a local globe fallback.
- A custom Velora Mac application icon, included in the installer.
- Retargetable spring hover/press effects, sliding mood selection, staggered shortcut entrances, and smooth dialogs.
- Focus, Explore and Unwind select the green, violet and graphite themes.
- Keyed tab elements preserve focus and hover state while page state updates.
- Fixed an overlay state feedback loop during first-run setup.

## Everyday features
Vertical tabs; DuckDuckGo search/address bar; bookmarks; back/forward/reload; mute; zoom; reopen closed tabs; session restoration; optional original synthesized ambient music and interface sounds with separate volumes and mute.

Memory Saver unloads background tabs after five minutes unless currently audible. Sleeping tabs reload when selected; unsaved forms and navigation history can be lost. Previously open tabs load only when selected. Cookies persist locally.

Command-L / Command-K: address palette. Command-T: new tab. Command-W: close tab. Command-R: reload.

## Build or run from source
Install current Node.js LTS, open Terminal in the project root:

    npm ci
    npm start

For a universal unsigned installer on macOS:

    npm run dist:mac -- --universal

Build output goes into `dist/`. GitHub Actions also builds and publishes the DMG on pushes to main, version tags and manual runs. The release version follows package.json.

## Checks
`npm test` checks URL routing and rejection of privileged schemes. `npm run test:app` runs a real Electron smoke check with a temporary profile and a local test website: asset loading, setup, page navigation, sandbox, bookmarks, mute, tabs and reopen. The Mac build workflow runs both before packaging.

DOM interaction checks cover setup, personalization and audio controls (with a mocked AudioContext). A browser preview is used to inspect the interface. These checks do not establish compatibility with all websites or substitute for physical Mac testing.

## Limits and security
Remote pages use sandboxing, context isolation and no Node.js integration. Privileged browser IPC is restricted to the app’s local chrome. HTTP/HTTPS navigation only. Site permission requests (including microphone, camera and location) are denied in this prototype. Downloads ask for a destination.

No extension support, cloud sync, private mode, password manager, DRM certification, automatic update service or ad-blocking engine. Some sign-ins, protected streaming and popup-dependent flows may be incompatible. Keep Electron updated before using sensitive accounts.

## Assets
Control icons: Phosphor (MIT). Brand marks: Simple Icons (CC0), Phosphor and Lobe Icons (MIT); included license files are in assets. Trademarks belong to their owners. Velora’s custom icon is vector artwork rendered locally. Shortcut artwork is bundled and can load offline; actual web-page favicons depend on the site/network.
