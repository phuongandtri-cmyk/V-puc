// src/config/faceFit.ts

export const FACE_FIT = {
  fill: 1.0,         // overall size multiplier of the face on the head
  sideInset: 0.92,   // face half-width = sideInset × chibi head radius
  topOverlap: 0.18,  // how far (× head radius) the face extends UP under the fringe
  chinInset: 0.02,   // gap above the chibi chin (× head radius)
  maxSquash: 0.78,   // never compress the face height below this fraction of its natural proportion
  offsetX: 0,
  offsetY: 0,
  feather: 0.05,
  syncHeadSkin: true
};
