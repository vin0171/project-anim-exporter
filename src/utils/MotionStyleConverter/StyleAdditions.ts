
// Converts the interface to a custom style data (usually stores the offset)
// returns translation offset, rotation offset, multiplicity scale, opacity
// NOT SIZE YET

// positionOffset
// rotationOffset
// scaleFactor
// opacityMultiplier
export interface StyleAdditions {
  positionOffset: { x: number, y: number},
  rotationOffset: number,
  scaleFactor: { x: number, y: number},
  opacityMultiplier: number
}
