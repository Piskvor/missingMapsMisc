# Úvodní obrazovka k mapathonu

[Linky na aktuální mapathon a tak vůbec](offlineLandingPage/)

# Základní instalace JOSM 

[Návod k instalaci](JOSMmissingmaps.html) (Windows, Mac, Linux - všechno má svá špecifiká, ale všude se to dá zprovoznit)

## Pomocný skript do Chrome/Firefoxu

Pokud máte Firefox, lze si stáhnout jednoduchý skript pro zjednodušení práce s GPX soubory: [Open in JOSM](Open_in_JOSM/Open_in_JOSM.user.js). *Vyžaduje rozšíření [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)*

Zatím umí otevírat linky a samotnou stránku projektu - pokud potřebujete otevírat výběr, uložte si do záložek [Open selection in JOSM](javascript:void(function(){var s=window.getSelection().toString();if(s==''){var formula=document.getElementById('t-formula-bar-input');if(formula['innerText']!=null){s=formula.innerText}};if(s.indexOf('http')==0){if(typeof(osm_piskvor_org_josm_open)!="undefined"){osm_piskvor_org_josm_open(s,true)}};}())) - volá JOSM skrze ten usercript. 

# Pokročilé možnosti

Pokud vám nefunguje spuštění na Macu, je třeba kliknout pravým a potvrdit otevření, [viz](https://josm.openstreetmap.de/wiki/Download#MacOSXerrors). 

## Ready-to-map JOSM

Pokud máte hodně pozamykaný počítač (a nejde třeba instalovat Java, nebo nejde připojení k netu), lze použít flashku s předinstalovaným JOSM.

## Portable Java+JOSM+KMeleon

JOSM i browser KMeleon se spouští ve Windows, ale z flashky (bez instalace). Uživatelská data se ukládají na flashku.  Po vložení flashky z ní spusťte `Start.exe` a z menu spusťte KMeleon a JOSM Portable.
[TODO: screenshoty]

## Bootovací flashka

Z flashky se spouští celý operační systém (Puppy Linux), který obsahuje jen JOSM a Firefox. Uživatelská data se ukládají na flashku. (Při startu počítače je třeba vybrat boot z USB - bývá to klávesa `F12`)
[TODO: screenshoty]
