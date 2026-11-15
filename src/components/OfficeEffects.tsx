export function OfficeEffects() {
  return (
    <svg className="office-effects" viewBox="0 0 1600 1000" aria-hidden="true">
      {[[489, 114, 39], [1150, 112, 43], [426, 585, 47]].map(([x, y, radius], index) => (
        <g key={index} transform={`translate(${x} ${y})`}>
          <circle className="hologram-aura" r={radius} />
          <circle className="hologram-orbit" r={radius * .83} style={{ animationDelay: `${-index * 2}s` }} />
          <path className="hologram-readout" d={`M${-radius * .6} 0H${radius * .6}M${-radius * .4} 9H${radius * .35}`} />
        </g>
      ))}
      {[[150, 710], [161, 880], [1375, 870]].map(([x, y], index) => (
        <g key={index} transform={`translate(${x} ${y})`}>
          <circle className="table-magic-glow" r="19" style={{ animationDelay: `${-index}s` }} />
          {[0, 1, 2].map((bubble) => <circle key={bubble} className="lab-bubble" cx={bubble * 9 - 9} cy="-4" r={2 + bubble % 2} style={{ animationDelay: `${-bubble * .7 - index}s` }} />)}
        </g>
      ))}
      <g transform="translate(1378 868)">
        <g className="lounge-steam"><path d="M-5 0Q-11-8-5-16T-5-29M6 2Q1-6 7-14T7-27" /></g>
      </g>
    </svg>
  )
}
