# Velora · personal browser prototype

A real Electron/Chromium desktop browser project for macOS. This is source code, not an installed or signed application.

## Run on your Mac
Install the current Node.js LTS from https://nodejs.org. Extract this folder, open Terminal in it, then run:

    npm install
    npm start

To create a local unsigned DMG on your Mac:

    npm run dist:mac

Developer ID signing and Apple notarization are required for a normally distributed, trusted Mac installer. No signing credentials are included. Keep Electron updated before using this with sensitive accounts. A dependency lockfile is included. Rebuild with current Electron security updates before distribution.

## Included
- Real web pages in isolated WebContentsViews; not iframes or simulated browsing.
- Vertical tabs, hover buttons, reduced-motion support, web search/address bar.
- Command-L / Command-K address palette; Command-T new tab; Command-W close; Command-R reload.
- Back, forward, refresh, zoom, tab mute, persistent bookmarks, reopen closed tabs.
- Session restoration; previously open tabs load only on selection.
- Memory Saver destroys inactive page views after five minutes, excluding currently audible tabs. Manual Sleep Other Tabs uses the same audible exemption.
- Downloads ask for a destination. HTTP/HTTPS navigation only. Remote pages have no Node access; sandbox and context isolation are enabled. Page IPC cannot control browser chrome.

## Limits
Prototype, not a production replacement for Safari/Chrome. Sleeping unloads pages: unsaved forms, playback positions and page navigation history can be lost. Cookies remain in the persistent local profile. Camera, mic, location, notifications and other site permission requests are denied in this version. No extensions, password manager, private browsing, sync, DRM certification, auto-update service or ad-blocking engine. Some Google sign-ins and protected streaming sites may reject embedded browsers. Popup links become regular tabs, which can affect popup-dependent sign-in flows.

## Validation
`npm test` checks URL routing and protocol rejection. JavaScript syntax checked and dependencies resolved successfully. Setup flow, theme selection, preference persistence, reopening setup and icon rendering passed DOM interaction checks. Automated visual testing was blocked by the environment’s Chromium process restrictions. Runtime website behavior and macOS packaging require testing with Electron on a Mac; performance has not been benchmarked. The project does not claim to outperform established browsers.

## Updated welcome experience
Three-step first-run setup with theme selection, Memory Saver and motion preferences. Reopen from the settings icon. Interface symbols use local SVG icons; shortcut logos use Google’s site favicon service and require a connection. Preferences remain local.

## Version 0.2 — finishing polish and audio
Open Sound & atmosphere in the sidebar. Enable Background music for an original synthesized ambient chord progression and melody, or Interface sounds for hover/click feedback. Each has independent volume; Mute all affects Velora audio, not websites. Options persist locally. Audio is opt-in and starts after interaction. Music softens while any browser tab is audible, stops while the window is hidden, and resumes when visible. No music downloads or audio libraries are required. Hover feedback is throttled and respects the interface effects toggle. Reduced-motion settings disable new transition effects.

URL tests, setup interaction checks, JavaScript syntax and audio control checks with a mocked AudioContext passed. Actual audio quality, macOS integration and native page-audio ducking still require on-device verification.

## Expanded startup
Four-step welcome now includes feature cards, theme selection, an optional first name with live greeting preview, new-tab shortcut choices, memory and motion options, and keyboard tips. The new-tab screen has a local-time clock and personalized greeting. Run setup again using the sidebar settings icon. Personalization interaction checks passed; no new data leaves the device.

## GitHub automatic Mac build
Upload this folder's contents (package.json at repository root) to a GitHub repository, including .github/workflows/build-mac.yml. Open Actions → Build Mac DMG → Run workflow. It builds a universal unsigned Mac DMG and publishes it under Releases. No personal access token is required: it uses the workflow's temporary GITHUB_TOKEN. A successful build must be verified before linking a website to its installer. The workflow is prepared but has not been run or validated on GitHub.
