---
title: "Van Eck Phreaking"
description: "a precise exploitation of electromagnetic emanations from electronic devices"
created: 2026-05-01T01:04pm
updated: 2026-05-01T01:04pm
status: "In Progress"
certainty: "certain"
importance: 8
---

I don't quite remember where I first encountered the idea of **Van Eck phreaking**. Probably a blog in some sense related to cybersecurity, although the topic is not quite in that general domain. The name is derived from the Dutch PTT researcher Wim van Eck, who in 1985 published an unclassified technical demonstration which displayed a TV set reconstructing the screen content from a CRT monitor hundreds of meters away, using components that cost less than $15. The phenomenon itself was however widely known by intelligence agencies since at least World War II. Bell Labs had detected teletype cipher leakage in 1943, but van Eck's paper brought proper attention to the subject.

If it is still unclear, the act of VEP is compromising emanations from electronic equipment. All electronic equipment radiates signals that are correlated with its internal state. It is the information in those signals that is susceptible to being targeted while leaving no forensic trace on the target.

## See Also
- Side-Channel Taxonomy (Placeholder)
- Soft TEMPEST Duality (Placeholder)
- Air-Gap Security and Covert Channels (Placeholder)

## Notes
- Why van Eck's 1985 paper was politically subversive, not merely technical (Placeholder)
- Soft TEMPEST as a steganographic primitive (Placeholder)
- The signal-to-noise reformulation: why van Eck phreaking is fundamentally an information-theoretic problem (Placeholder)
- How Deep-TEMPEST's success implies the threat model must include ML-equipped adversaries (Placeholder)
- RAMBO and the philosophy of air-gap security (Placeholder)
- The connection between TEMPEST and EMC regulation (Placeholder)
- Why "Screaming Channels" represents a phase transition in the threat model (Placeholder)
- The keyboard as the highest-value van Eck target today (Placeholder)

## To Read

### Primary Source Material
- Wim van Eck, [*Electromagnetic Radiation from Video Display Units: An Eavesdropping Risk?*](https://krisyotam.com/doc/computer-science/tempest/van-eck-1985-electromagnetic-radiation-from-video-display-units.pdf), Computers & Security 4:269-286, 1985
- NSA, [*TEMPEST: A Signal Problem*](https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/cryptologic-spectrum/tempest.pdf), Cryptologic Spectrum (Vol. 2, No. 3, 1972; Declassified 2008)
- Markus G. Kuhn & Ross J. Anderson, [*Soft Tempest: Hidden Data Transmission Using Electromagnetic Emanations*](https://krisyotam.com/doc/computer-science/tempest/kuhn-anderson-1998-soft-tempest.pdf), IH'98 Workshop on Information Hiding, LNCS 1525, 1998
- Markus G. Kuhn, [*Compromising Emanations: Eavesdropping Risks of Computer Displays*](https://krisyotam.com/doc/computer-science/tempest/kuhn-2003-compromising-emanations.pdf), Technical Report UCAM-CL-TR-577, University of Cambridge, 2003
- Ross Anderson & Markus Kuhn, [*Soft Tempest: An Opportunity for NATO*](https://www.cl.cam.ac.uk/~mgk25/nato99-tempest.pdf), Semantic Scholar, 1999
- [*Information Leakage via Electromagnetic Emanations and Evaluation of TEMPEST Countermeasures*](https://dl.acm.org/doi/10.1145/2660267.2660356), ACM Digital Library, 2014
- [*An Introduction to TEMPEST*](https://www.giac.org/paper/gsec/4073/transmission-media-security/106497), GIAC GSEC Practical Assignment, 2004

### Papers
- Fernández et al., [*Deep-TEMPEST: Using Deep Learning to Eavesdrop on HDMI from its Unintended Electromagnetic Emanations*](https://krisyotam.com/doc/computer-science/tempest/fernandez-2024-deep-tempest.pdf), arXiv 2407.09717, 2024
- Martin Vuagnoux & Sylvain Pasini, [*Compromising Electromagnetic Emanations of Wired and Wireless Keyboards*](https://www.usenix.org/conference/usenixsecurity09/technical-sessions/presentation/compromising-electromagnetic-emanation-0), USENIX Security 2009
- [*Screen Gleaning: A Screen Reading TEMPEST Attack on Mobile Devices*](https://www.ndss-symposium.org/ndss-paper/screen-gleaning-a-screen-reading-tempest-attack-on-mobile-devices/), NDSS 2021
- Mordechai Guri, [*RAMBO: Leaking Secrets from Air-Gap Computers by Spelling Covert Radio Signals from Computer RAM*](https://krisyotam.com/doc/computer-science/tempest/guri-2024-rambo-air-gap-ram-radio.pdf), arXiv 2409.02292, 2024
- Harrison et al., [*A Practical Deep Learning-Based Acoustic Side Channel Attack on Keyboards*](https://krisyotam.com/doc/computer-science/tempest/harrison-2023-acoustic-side-channel-keyboards.pdf), 2023
- Richard Aldrich & Christopher Murphy, [*The Impact of 'Tempest' on Anglo-American Communications Security and Intelligence, 1943-1970*](https://cryptome.org/2014/06/tempest-impact.pdf), Cryptome PDF
- Camurati et al., [*Screaming Channels: When TEMPEST Meets Side Channels and Wireless Security*](https://dl.acm.org/doi/10.1145/3243734.3243750), CCS 2018

### Secondary
- [*TEMPEST: Electronic Spying and Countermeasures*](https://greydynamics.com/tempest-electronic-spying-and-countermeasures/), Grey Dynamics, 2025
- [*TEMPEST in a Software Defined Radio*](https://hackaday.com/2017/12/21/tempest-in-a-software-defined-radio/), Hackaday, 2017
- Markus Kuhn, [*Soft Tempest FAQ*](https://www.cl.cam.ac.uk/~mgk25/emsec/soft-tempest-faq.html), Cambridge University
- Joel McNamara, *Secrets of Computer Espionage: Tactics and Countermeasures*, 2003
- Peter Wright, *Spycatcher*, 1987

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0;">
  <figure style="margin: 0; text-align: center;">
    <img src="https://krisyotam.com/cdn/images/notebooks/van-eck-phreaking/em-emanations-van-eck-setup.webp" alt="Van Eck phreaking demonstration setup with antenna intercepting CRT emissions" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">Van Eck phreaking demonstration: reconstructing a display from its electromagnetic emanations.</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="https://krisyotam.com/cdn/images/notebooks/van-eck-phreaking/tempest-lab-equipment.jpg" alt="TEMPEST lab with spectrum analyzer, parabolic antenna, and target monitor" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">TEMPEST lab setup with spectrum analyzer and parabolic antenna aimed at a target display.</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="https://krisyotam.com/cdn/images/notebooks/van-eck-phreaking/emc-testing-setup.jpg" alt="EMC testing bench with Aaronia antenna, spectrum analyzer, and target laptop" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">EMC testing bench with directional antenna and spectrum analysis equipment.</figcaption>
  </figure>
</div>
