# Jal Lijiye — notes

## Goal
A cute water buddy for a friend's iPhone 14. At fixed times a glass character
("Jal") drops in from the top and asks them to drink. They tap "Glug glug", hear
a gulp, Jal drains, grins and goes back up. Free, no server, no App Store.

## Decisions and why
- **Web page, not a native app.** A native app without the $99/year Apple account
  must be re-installed from a Mac every 7 days. I don't own an iPhone.
- **iPhone Shortcuts is the alarm clock.** A web page can't wake itself on iPhone,
  and we ruled out a push server. Personal automations (Time of Day, Run
  Immediately) open `…?remind`, which makes Jal drop in. 8 automations: 8, 10, 12,
  2, 4, 6, 8, 10.
- **Plan B (open the app) over a plain notification**, so the character itself appears.
- **The count lives on the phone** (localStorage, per day). No accounts.
- **Sound is synthesized** in Web Audio (three gulps), so there are no audio files.
- **No service worker yet.** Smallest version first.
- Design: marigold background, indigo ink, blue water, Baloo 2 (has Devanagari).
  The character is the one bold thing on screen.

## What I learned
- Every iPhone browser, Chrome included, uses Safari's engine (outside the EU).
- iOS doesn't let apps draw over other apps. Web pages can't schedule their own
  notifications on iPhone.
- Shortcuts "Open URLs" opens the default browser, not the Home Screen web app.
  So the count lives in that browser. Installing to the Home Screen is optional.

## Not verified yet (needs the real iPhone)
- Does the automation open the page when the phone is locked?
- Is the glug audible? The silent switch mutes web audio. It also needs a tap
  first, which "Glug glug" is.
- Does the count survive day to day in Safari/Chrome storage?

## Next step
Publish to GitHub Pages (needs OK), then do the setup call on their phone.
