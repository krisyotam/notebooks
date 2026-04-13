---
title: "Frequency Spreading"
description: "Fan noise mitigation through asymmetric blade spacing and RPM offset, as implemented in the Mac Pro 7,1."
created: 2026-04-13T03:50pm
updated: 2026-04-13T03:50pm
status: "In Progress"
certainty: "likely"
importance: 5
---

One of the most infuriating things about modern PCs, barring RGB, is the tonal noise of fans. That continually amplified jet engine sound while you're trying to think. It's been my mission for a while to free myself from this. I think I've finally found a workable solution, or rather taken one from the 2019 Mac Pro 7,1. That is **frequency spreading**, which in Apple's case is asymmetric blade spacing (sometimes called blade randomization). The fan blades are physically distributed at non-uniform angles so that the blade pass frequency energy spreads across a broad spectrum rather than concentrating at a single tone and its harmonics. The result is broadband noise instead of tonal whine. Apple's VP John Ternus credited the technique as borrowed "almost entirely from automobile tires," which use randomized tread block spacing for the same reason.

A related but distinct technique is **RPM offset**, popularized by Noctua: running multiple fans at slightly different speeds (50-200 RPM apart) to avoid beat frequencies, the pulsing amplitude modulation you hear when two fans of the same model spin at nearly identical speeds. Both techniques aim to make fan noise less perceptible, but they solve different problems. Blade randomization eliminates tonal peaks. RPM offset eliminates beating.

## Notes
-

## See Also

### To Read

**Foundational**
- Lord Rayleigh, *The Theory of Sound*, 2 vols. (1877-1878)
- Fletcher & Munson, "Loudness, Its Definition, Measurement and Calculation," *Journal of the Acoustical Society of America* (1933)
- Leo Beranek & Istvan Ver (eds.), *Noise and Vibration Control Engineering* (1992, Wiley)
- J.P. Den Hartog, *Mechanical Vibrations*, 4th ed. (1956, McGraw-Hill)
- Lawrence Kinsler et al., *Fundamentals of Acoustics*, 4th ed. (2000, Wiley)

**Papers**
- Lipshitz, Wannamaker & Vanderkooy, "Quantization and Dither: A Theoretical Survey," *Journal of the Audio Engineering Society* (1992)
- Frank Fahy & Paolo Gardonio, *Sound and Structural Vibration*, 2nd ed. (2007, Academic Press)
- Zwicker & Fastl, *Psychoacoustics: Facts and Models*, 3rd ed. (2007, Springer)

**Engineering Reference**
- ISO 10302: Acoustics - Measurement of Airborne Noise Emitted and Structure-Borne Vibration Induced by Small Air-Moving Devices
- Bernard Widrow & Istvan Kollar, *Quantization Noise* (2008, Cambridge University Press)

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0;">
  <figure style="margin: 0; text-align: center;">
    <img src="https://krisyotam.com/cdn/images/notebooks/frequency-spreading/mac-pro-7-1-internals-gpu.jpeg" alt="Mac Pro 7,1 internals with GPU installed" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">Mac Pro 7,1 internals with Sapphire RX 6900 XT.</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="https://krisyotam.com/cdn/images/notebooks/frequency-spreading/mac-pro-7-1-rear-open.jpeg" alt="Mac Pro 7,1 rear view with case open" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">Mac Pro 7,1, rear view open.</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="https://krisyotam.com/cdn/images/notebooks/frequency-spreading/mac-pro-7-1-triple-fan-array.webp" alt="Mac Pro 7,1 triple fan array with asymmetric blade spacing" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">Mac Pro 7,1 triple fan array, the blades use asymmetric spacing.</figcaption>
  </figure>
</div>
