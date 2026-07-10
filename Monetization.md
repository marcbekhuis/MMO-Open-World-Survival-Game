# Monetization and Platforms

How the game is sold and where it runs are design decisions as much as business ones, because both shape who plays and how the persistent world is sustained. The short version is deliberate: a single subscription funds everything, nothing that touches power is ever for sale, and the game is built first for PC with consoles kept in view for later. This document sets out the business model and platform direction and the principles that keep them aligned with the rest of the design.

## A Single Subscription

The game is funded by a subscription and nothing else at the level of access. There is no box price to clear before a player can begin and no content walled off behind separate purchases; one recurring fee opens the whole world and pays for what a persistent online world genuinely costs, the live operations, the always-on infrastructure described in [Server Architecture](Server-architecture.md), and the steady stream of new content that keeps the world growing. Tying the game's income directly to whether players are content enough to keep paying, month after month, aligns the studio's interest with the players': the only way to earn is to keep the world worth living in.
<!-- REVIEW(investor): Subscription-only with no box price is the document's most aggressive commercial bet and it is asserted, not argued — name 2-3 comparable live subscription MMOs, an assumed price and target paying population, and the churn/retention math under which it closes. -->
<!-- REVIEW(monetization): The subscription's core promise is "a steady stream of new content" but no document commits to a live-ops cadence — state the rough rhythm of seasons/events/expansions and what a season delivers, and treat funding that pipeline as a standing cost. -->
<!-- REVIEW(monetization): The architecture is deliberately server-heavy (per-entity sync, region migration, standby failover) and there is no box price to front-load acquisition — show a back-of-envelope that run-cost per concurrent player sits below the sub price with margin left for content. -->

## No Pay-to-Win, by Design

Because the subscription already funds the game, nothing that affects power needs to be sold, and nothing that affects power ever is. Any optional storefront stays strictly cosmetic, the vanity appearances, dyes, and decorative touches for homes and gear that let players express themselves without buying an edge, and it stops firmly short of anything touching combat strength, loot, carrying capacity, territory, or the pace of progression. In a full-loot world where wealth and power are won and lost through play, as set out in [Economy and Trade](Economy.md) and [Death and Loss](Death-and-loss.md), letting either be bought would hollow out the very stakes the design is built on. Every advantage traces back to what a player did, never to what they paid.
<!-- REVIEW(player,monetization): A full-loot player economy is a gold-farming/RMT magnet and the "no pay-to-win" promise never acknowledges the black market it will attract — name RMT and botting as known threats and gesture at how sinks, detection, and enforcement hold the line. -->

## Platforms

Development targets PC first. The keyboard-and-mouse control surface suits the depth of the systems, the hardware ceiling suits the photorealistic fidelity described in [Art Direction](Art-direction.md), and an open platform leaves the most room for a community to grow around the game. Consoles are kept deliberately within reach rather than ruled out: holding to the Mature standard set in [Content and Tone](Content-and-tone.md), with no explicit content to bar certification, keeps the door to console ports open for after launch, when the interface and control work in [UI and HUD](UI-and-HUD.md) can be extended to suit a gamepad properly instead of bolted on as an afterthought.

## Who It Is For

The game is built for adults who want a deep, harsh, persistent world rather than a quick session and a soft landing. Its player accepts that the frontier can take everything they carry, measures their investment in weeks and months rather than minutes, and finds the reward in mastery, territory, reputation, and the kind of stories only a world with real stakes produces. Every choice in this document, the single fair price, the refusal to sell power, the PC-first build, follows from taking that player seriously.
<!-- REVIEW(investor): The audience is defined by temperament with no size attached, and full-loot plus subscription each narrow the funnel — add market sizing with real comparables (Albion, EVE, Mortal Online) and acknowledge the compounding niche rather than treating "adults who want depth" as a large market. -->
<!-- REVIEW(player): Weeks-to-months progression plus full-loot means a bad night can wipe days of work — state how replaceable mid-tier gear is and whether re-gearing after a full-loot death is an evening or a weekend, so limited-time players know if their schedule is welcome. -->

## Continue Reading

Continue with [Economy and Trade](Economy.md) for the in-world wealth the shop never touches, [Content and Tone](Content-and-tone.md) for the rating that keeps consoles in reach, and [Server Architecture](Server-architecture.md) for what the subscription sustains.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
