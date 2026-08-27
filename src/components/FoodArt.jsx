const palettes = {
  biryani: ["#f1a33c", "#fff0bd", "#d76731"],
  nihari: ["#8c391f", "#f2aa57", "#522517"],
  fish: ["#4c98a2", "#d8f0e4", "#efa741"],
  beef: ["#843825", "#f2b55f", "#6aa054"],
  samosa: ["#d9892b", "#ffd375", "#8d4d1b"],
  pakora: ["#b46c20", "#f2c353", "#739340"],
  roti: ["#d89845", "#f7d997", "#9a5a24"],
};

export default function FoodArt({ type = "biryani" }) {
  const [base, light, accent] = palettes[type] || palettes.biryani;
  return (
    <svg
      className="food-art"
      viewBox="0 0 220 132"
      role="img"
      aria-label={type}
    >
      <defs>
        <linearGradient id={`bg-${type}`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor={light} />
          <stop offset="1" stopColor={base} />
        </linearGradient>
        <filter id={`shadow-${type}`}>
          <feDropShadow dx="0" dy="7" stdDeviation="5" floodOpacity=".2" />
        </filter>
      </defs>
      <rect width="220" height="132" rx="18" fill={`url(#bg-${type})`} />
      <circle
        cx="110"
        cy="68"
        r="52"
        fill="#fff"
        opacity=".92"
        filter={`url(#shadow-${type})`}
      />
      <ellipse cx="110" cy="76" rx="43" ry="27" fill={base} />
      <ellipse cx="110" cy="70" rx="38" ry="23" fill={light} />
      {type === "fish" ? (
        <path
          d="M75 70c18-23 50-24 68 0-18 23-50 24-68 0Zm68 0 18-16v32Z"
          fill={base}
        />
      ) : null}
      {type === "samosa" ? (
        <path
          d="m110 40 31 56H79Z"
          fill={base}
          stroke={accent}
          strokeWidth="5"
        />
      ) : null}
      {type === "roti" ? (
        <circle
          cx="110"
          cy="70"
          r="34"
          fill={base}
          stroke={accent}
          strokeWidth="3"
        />
      ) : null}
      {type !== "fish" && type !== "samosa" && type !== "roti"
        ? [82, 100, 118, 136].map((x, index) => (
            <circle
              key={x}
              cx={x}
              cy={64 + (index % 2) * 12}
              r="7"
              fill={index % 2 ? accent : base}
            />
          ))
        : null}
      <path
        d="M47 25c9 5 16 5 25 0M164 106c7-5 14-5 21 0"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  );
}
