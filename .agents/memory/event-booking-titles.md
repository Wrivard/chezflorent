---
name: Event booking titles
description: Why Quiz and Hitster bookings must tolerate edited event titles and ignore tags.
---

Les titres d’événements sont souvent modifiés pour ajouter une thématique ou
une heure. Les réservations Quiz et Hitster doivent suivre l’activité sans
exiger un titre exact ni une nouvelle configuration pour chaque variante.

**Why:** Le créateur a précisé : « souvent elle change les mot apres pour les
thematique ou les heures » et demandé une détection dans les titres.

**How to apply:** Conserver l’association automatique à partir du mot complet
dans le titre. Ne pas utiliser l’étiquette comme classification équivalente :
les données en ligne peuvent avoir un titre Quiz et une étiquette Hitster.
Ne pas modifier les titres ou les étiquettes du CMS pour forcer l’association.