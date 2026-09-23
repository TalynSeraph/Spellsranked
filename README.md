# Spell Lore — D&D 5e Spell Rankings

A mobile-first, parchment-themed D&D 5e spell reference for personal use.

## What is included

- Class-first selection for the 12 2014 classes.
- Spell lists are loaded from the 2014 SRD API.
- Spells are grouped by spell level and ordered by a community-informed usefulness score.
- Search and level/source filters.
- Expandable spell descriptions.
- LocalStorage remembers your selected class and imported personal spells.
- A JSON importer lets you add material you personally own (for example, subclass/expansion spell data).
- Responsive layout designed primarily for phones.

## Important content/licensing note

The public repository intentionally does **not** bundle non-SRD book text from books such as *Xanathar's Guide to Everything* or *Tasha's Cauldron of Everything*. Owning a book gives you access to that material, but it does not automatically grant permission to redistribute its text in a public GitHub repository.

Instead, use the included `data/private-compendium.example.json` as the schema for your own personal additions. The imported data is stored in your browser's localStorage and is not uploaded anywhere by this app.

SRD 5.1 is available under CC-BY-4.0. Attribution:
"This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode."

D&D and related marks are property of Wizards of the Coast. This is an unofficial fan project.

## Publishing with GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: `main`; folder: `/ (root)`.
6. Save and open the generated Pages URL.

The app needs internet access to retrieve SRD spell data from the public 5e API. The app will cache its shell, but the first spell-list load requires a connection.

## Ranking philosophy

The ranking is deliberately described as **community-informed**, not "official" or statistically proven consensus. Public guides and community discussions repeatedly emphasise different things: combat impact, concentration cost, versatility, action economy, ritual casting, party composition and campaign context. Sources consulted while designing the baseline include RPGBOT, Treantmonk's material, Tabletop Builds and community discussions.

The same spell can move dramatically depending on class, subclass, level, party composition and campaign. Treat the ordering as a quick decision aid, not a definitive power ranking.


### App icon

The app includes the custom Spell Lore grimoire icon in `assets/`. The 192px version is used in the header, the 192px and 512px versions are used by the PWA manifest, and the smaller versions are used for browser favicons.

To publish the updated icon, upload the whole repository including the `assets` folder. GitHub Pages will serve the icons automatically. On Android, open the published site in Chrome and use **Add to Home screen / Install app**; the 512px PWA icon will be used where supported. If an older installed version still shows the previous icon, uninstall the old shortcut/app and install it again after the new GitHub Pages deployment has refreshed.


### SRD loading
The app loads the 2014 SRD spell dataset as one static JSON file from the 5e-bits `5e-database` repository, then caches a local copy in the browser. This avoids the public API request-per-spell pattern that can trigger HTTP 429 rate limits. If the static dataset is unavailable, the app attempts the API as a fallback.

The SRD is published by Wizards of the Coast under CC-BY-4.0; see the official SRD page: https://www.dndbeyond.com/srd.
