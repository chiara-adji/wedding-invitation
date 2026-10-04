/* Inline SVG illustrations: joglo garden scene, lily-of-the-valley sprig, divider.
   Colours come from CSS variables (see .art rules in styles.css). */
window.Art = (() => {
  const paths = (list) => list.map((d, i) => `<path pathLength="1" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="${d}"/>`).join("");
  const palm = (x) => `<g transform="translate(${x} 0)">${paths([
    "M0 182Q5 130-2 84",
    "M-2 84q-26-4-38 14", "M-2 84q-16-24-36-18", "M-2 84q4-28 30-30", "M-2 84q24-12 40 4", "M-2 84q22 6 32 26"])}</g>`;
  const bell = (x, y) => `<path class="f" transform="translate(${x} ${y})" d="M-6 0q0-9 6-9t6 9q-3 3-6 3t-6-3z"/>`;

  function scene() {
    const roof = paths([
      "M60 134L150 64L240 134", "M150 54h20l16 38H134z", "M146 54h28",
      "M84 130L136 92h48l52 38z", "M78 132Q160 116 242 132",
      "M112 118l22-18M132 122l26-24M160 122l22-24M186 122l22-18",
      "M96 132v38M132 132v38M188 132v38M224 132v38", "M88 170h144",
      "M146 138h28v32h-28zM160 138v32", "M96 154h36M188 154h36", "M146 170v6h28v-6", "M10 182h300"]);
    return `<svg class="art scene draw" viewBox="0 0 320 200" role="img" aria-label="Line drawing of a Javanese joglo house among palms">
      ${palm(44)}<g transform="translate(320 0) scale(-1 1)">${palm(44)}</g>${roof}</svg>`;
  }

  const sprigSvg = `<svg class="art corner" viewBox="0 0 100 160" aria-hidden="true">
    <path class="l" d="M20 158C0 118 8 78 40 66C46 106 36 136 20 158z"/>
    <path class="l" d="M24 150C50 130 70 140 92 120C70 100 40 110 24 150z"/>
    <path d="M20 158C30 96 52 44 84 12"/>${[[80, 22], [70, 42], [60, 62], [51, 82]].map(([x, y]) => bell(x, y)).join("")}</svg>`;

  const corner = (side) => { const t = document.createElement("div"); t.innerHTML = sprigSvg;
    const el = t.firstElementChild; el.classList.add(side); return el; };

  const divider = () => `<svg class="art" viewBox="0 0 120 20" aria-hidden="true">
    <path d="M0 10H46M74 10H120"/><path d="M60 3v14M60 10q-7-7-12-2M60 10q7-7 12-2"/></svg>`;

  return { scene, corner, divider };
})();
