import { FOREST_STAGES } from '../utils/constants';

function noise(seed) {
  const x = Math.sin(seed * 91.345) * 43758.5453;
  return x - Math.floor(x);
}

function toRange(seed, min, max) {
  return min + noise(seed) * (max - min);
}

function revealStyle(delay = 0) {
  return {
    opacity: 0,
    animation: 'forestReveal 620ms ease-out forwards',
    animationDelay: `${delay}ms`,
  };
}

function DeciduousTree({ x, y, scale = 1, hue = 120, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`} style={revealStyle(delay)}>
      <rect x={-3 * scale} y={-32 * scale} width={6 * scale} height={32 * scale} rx={2 * scale} fill="#3a2817" />
      <circle cx={0} cy={-42 * scale} r={17 * scale} fill={`hsl(${hue}, 52%, 31%)`} />
      <circle cx={-12 * scale} cy={-35 * scale} r={12 * scale} fill={`hsl(${hue + 4}, 50%, 35%)`} />
      <circle cx={12 * scale} cy={-35 * scale} r={12 * scale} fill={`hsl(${hue - 2}, 53%, 34%)`} />
    </g>
  );
}

function PineTree({ x, y, scale = 1, hue = 128, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`} style={revealStyle(delay)}>
      <rect x={-2.2 * scale} y={-42 * scale} width={4.4 * scale} height={42 * scale} rx={2} fill="#4a3018" />
      <polygon points={`${-15 * scale},${-22 * scale} 0,${-56 * scale} ${15 * scale},${-22 * scale}`} fill={`hsl(${hue}, 56%, 30%)`} />
      <polygon points={`${-13 * scale},${-10 * scale} 0,${-44 * scale} ${13 * scale},${-10 * scale}`} fill={`hsl(${hue + 5}, 55%, 34%)`} />
      <polygon points={`${-11 * scale},${0} 0,${-34 * scale} ${11 * scale},${0}`} fill={`hsl(${hue - 4}, 54%, 37%)`} />
    </g>
  );
}

function FantasyTree({ x, y, scale = 1, palette = 'violet', delay = 0 }) {
  const palettes = {
    violet: { leaf: '#a78bfa' },
    cyan: { leaf: '#22d3ee' },
    amber: { leaf: '#f59e0b' },
    rose: { leaf: '#f472b6' },
  };
  const chosen = palettes[palette] || palettes.violet;

  return (
    <g transform={`translate(${x} ${y})`} style={revealStyle(delay)}>
      <rect x={-2.8 * scale} y={-36 * scale} width={5.6 * scale} height={36 * scale} rx={2.4 * scale} fill="#4b2e1f" />
      <circle cx={0} cy={-46 * scale} r={16 * scale} fill={chosen.leaf} />
    </g>
  );
}

function Bush({ x, y, scale = 1, hue = 118, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`} style={revealStyle(delay)}>
      <ellipse cx={0} cy={0} rx={16 * scale} ry={10 * scale} fill={`hsl(${hue}, 45%, 29%)`} />
      <ellipse cx={-10 * scale} cy={1 * scale} rx={9 * scale} ry={7 * scale} fill={`hsl(${hue + 4}, 42%, 34%)`} />
      <ellipse cx={10 * scale} cy={2 * scale} rx={8 * scale} ry={6 * scale} fill={`hsl(${hue - 2}, 45%, 33%)`} />
    </g>
  );
}

function Rock({ x, y, scale = 1, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`} style={revealStyle(delay)}>
      <ellipse cx={0} cy={0} rx={11 * scale} ry={7 * scale} fill="#475569" />
      <ellipse cx={-4 * scale} cy={-2 * scale} rx={4 * scale} ry={2 * scale} fill="#64748b" opacity="0.7" />
    </g>
  );
}

function Mushroom({ x, y, scale = 1, hue = 330, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`} style={revealStyle(delay)}>
      <rect x={-1.5 * scale} y={-8 * scale} width={3 * scale} height={8 * scale} rx={1.2 * scale} fill="#f8fafc" opacity="0.85" />
      <ellipse cx={0} cy={-8 * scale} rx={6 * scale} ry={3.8 * scale} fill={`hsl(${hue}, 72%, 58%)`} />
      <circle cx={-2.5 * scale} cy={-8.7 * scale} r={0.8 * scale} fill="#fff" opacity="0.9" />
      <circle cx={1.7 * scale} cy={-9.1 * scale} r={0.7 * scale} fill="#fff" opacity="0.9" />
    </g>
  );
}

function GlowFly({ x, y, size = 1, delay = 0 }) {
  return (
    <g style={{ ...revealStyle(delay), animation: 'drift 4.6s ease-in-out infinite, forestReveal 620ms ease-out forwards' }}>
      <circle cx={x} cy={y} r={size * 2.2} fill="#34d399" opacity="0.16" />
      <circle cx={x} cy={y} r={size} fill="#a7f3d0" opacity="0.95" />
    </g>
  );
}

function Animal({ x, y, scale = 1, tone = '#64748b', delay = 0 }) {
  const ear = '#94a3b8';
  return (
    <g transform={`translate(${x} ${y})`} style={revealStyle(delay)}>
      <ellipse cx={0} cy={0} rx={6 * scale} ry={3.8 * scale} fill={tone} />
      <circle cx={5.4 * scale} cy={-1.7 * scale} r={2.2 * scale} fill={tone} />
      <circle cx={6.1 * scale} cy={-3.5 * scale} r={0.8 * scale} fill={ear} opacity="0.85" />
      <circle cx={5.9 * scale} cy={-1.7 * scale} r={0.45 * scale} fill="#e2e8f0" opacity="0.9" />
      <rect x={-3.8 * scale} y={2.6 * scale} width={1.1 * scale} height={2 * scale} rx={0.4 * scale} fill={tone} />
      <rect x={-0.5 * scale} y={2.6 * scale} width={1.1 * scale} height={2 * scale} rx={0.4 * scale} fill={tone} />
      <rect x={2.5 * scale} y={2.4 * scale} width={1.1 * scale} height={2 * scale} rx={0.4 * scale} fill={tone} />
    </g>
  );
}

function ForestScene({ totalXp, fullScreen = false }) {
  const width = 1000;
  const height = fullScreen ? 560 : 360;

  const grassVisible = totalXp >= 700;
  const bushesVisible = totalXp >= 2500;
  const moonVisible = totalXp >= 11700;
  const mushroomsVisible = totalXp >= 6200;
  const glowFliesVisible = totalXp >= 13100;

  const saplingCount = Math.min(22, Math.max(0, Math.floor((totalXp - 1500) / 230) + 4));
  const deciduousCount = Math.min(34, Math.max(0, Math.floor((totalXp - 4000) / 280) + 6));
  const pineCount = Math.min(24, Math.max(0, Math.floor((totalXp - 6000) / 380) + 4));
  const tallPineCount = Math.min(18, Math.max(0, Math.floor((totalXp - 9000) / 500) + 2));
  const bushCount = Math.min(26, Math.max(0, Math.floor((totalXp - 2500) / 450) + 4));
  const rockCount = Math.min(20, Math.max(0, Math.floor((totalXp - 300) / 850) + 2));
  const fantasyCount = Math.min(14, Math.max(0, Math.floor((totalXp - 17900) / 1200) + 1));
  const mushroomCount = mushroomsVisible ? Math.min(36, Math.max(8, Math.floor((totalXp - 6200) / 700) + 10)) : 0;
  const glowFlyCount = glowFliesVisible ? Math.min(48, Math.max(12, Math.floor((totalXp - 13100) / 500) + 14)) : 0;
  const animalCount = totalXp >= 11700 ? Math.min(16, Math.max(4, Math.floor((totalXp - 11700) / 2200) + 4)) : 0;

  const unlockedStages = FOREST_STAGES.filter((stage) => totalXp >= stage.xp).length;

  return (
    <div className="glass-panel relative overflow-hidden p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#071326" />
            <stop offset="52%" stopColor="#0b2340" />
            <stop offset="100%" stopColor="#08233a" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#18212e" />
            <stop offset="100%" stopColor="#101826" />
          </linearGradient>
        </defs>

        <rect width={width} height={height} fill="url(#sky)" />

        {Array.from({ length: 28 }).map((_, i) => (
          <circle
            key={`star-${i}`}
            cx={toRange(i + 1, 30, width - 30)}
            cy={toRange(i + 91, 20, height * 0.38)}
            r={toRange(i + 151, 0.7, 1.8)}
            fill="#dbeafe"
            opacity={toRange(i + 211, 0.35, 0.85)}
          />
        ))}

        {moonVisible && (
          <g style={revealStyle(280)}>
            <circle cx={width - 110} cy={90} r={34} fill="#e2e8f0" opacity="0.9" />
            <circle cx={width - 95} cy={86} r={30} fill="#0b2340" opacity="0.55" />
            <circle cx={width - 120} cy={72} r={4} fill="#cbd5e1" opacity="0.65" />
            <circle cx={width - 97} cy={104} r={3.5} fill="#cbd5e1" opacity="0.6" />
          </g>
        )}

        <rect y={height * 0.62} width={width} height={height * 0.38} fill="url(#ground)" />

        {grassVisible && (
          <g style={revealStyle(40)}>
            {Array.from({ length: 210 }).map((_, i) => {
              const x = (i / 209) * width;
              const bladeHeight = toRange(i + 401, 5, 14);
              return (
                <path
                  key={`grass-${i}`}
                  d={`M ${x} ${height * 0.62 + 6} L ${x + 2} ${height * 0.62 - bladeHeight}`}
                  stroke="#15803d"
                  strokeWidth="1.6"
                  opacity="0.82"
                />
              );
            })}
          </g>
        )}

        {Array.from({ length: rockCount }).map((_, i) => (
          <Rock
            key={`rock-${i}`}
            x={toRange(i + 700, 20, width - 20)}
            y={toRange(i + 790, height * 0.67, height * 0.96)}
            scale={toRange(i + 860, 0.7, 1.3)}
            delay={80 + i * 25}
          />
        ))}

        {bushesVisible &&
          Array.from({ length: bushCount }).map((_, i) => (
            <Bush
              key={`bush-${i}`}
              x={toRange(i + 900, 20, width - 20)}
              y={toRange(i + 990, height * 0.67, height * 0.94)}
              scale={toRange(i + 1050, 0.6, 1.15)}
              hue={Math.round(toRange(i + 1090, 110, 132))}
              delay={130 + i * 22}
            />
          ))}

        {mushroomCount > 0 &&
          Array.from({ length: mushroomCount }).map((_, i) => (
            <Mushroom
              key={`mush-${i}`}
              x={toRange(i + 1400, 20, width - 20)}
              y={toRange(i + 1480, height * 0.71, height * 0.98)}
              scale={toRange(i + 1560, 0.7, 1.35)}
              hue={Math.round(toRange(i + 1640, 290, 360))}
              delay={110 + i * 12}
            />
          ))}

        {Array.from({ length: saplingCount }).map((_, i) => (
          <DeciduousTree
            key={`sapling-${i}`}
            x={toRange(i + 1200, 28, width - 28)}
            y={toRange(i + 1280, height * 0.68, height * 0.93)}
            scale={toRange(i + 1370, 0.36, 0.55)}
            hue={Math.round(toRange(i + 1410, 118, 136))}
            delay={100 + i * 18}
          />
        ))}

        {Array.from({ length: deciduousCount }).map((_, i) => (
          <DeciduousTree
            key={`deciduous-${i}`}
            x={toRange(i + 1700, 20, width - 20)}
            y={toRange(i + 1780, height * 0.64, height * 0.9)}
            scale={toRange(i + 1860, 0.64, 1.08)}
            hue={Math.round(toRange(i + 1940, 106, 130))}
            delay={180 + i * 14}
          />
        ))}

        {Array.from({ length: pineCount }).map((_, i) => (
          <PineTree
            key={`pine-${i}`}
            x={toRange(i + 2000, 24, width - 24)}
            y={toRange(i + 2080, height * 0.63, height * 0.9)}
            scale={toRange(i + 2160, 0.66, 1.02)}
            hue={Math.round(toRange(i + 2240, 116, 138))}
            delay={220 + i * 13}
          />
        ))}

        {Array.from({ length: tallPineCount }).map((_, i) => (
          <PineTree
            key={`tall-pine-${i}`}
            x={toRange(i + 2300, 32, width - 32)}
            y={toRange(i + 2380, height * 0.6, height * 0.86)}
            scale={toRange(i + 2460, 1.12, 1.42)}
            hue={Math.round(toRange(i + 2540, 112, 131))}
            delay={250 + i * 14}
          />
        ))}

        {Array.from({ length: fantasyCount }).map((_, i) => {
          const palette = i % 4 === 0 ? 'violet' : i % 4 === 1 ? 'cyan' : i % 4 === 2 ? 'amber' : 'rose';
          return (
            <FantasyTree
              key={`fantasy-${i}`}
              x={toRange(i + 2600, 36, width - 36)}
              y={toRange(i + 2680, height * 0.66, height * 0.92)}
              scale={toRange(i + 2760, 0.9, 1.35)}
              palette={palette}
              delay={300 + i * 26}
            />
          );
        })}

        {glowFlyCount > 0 &&
          Array.from({ length: glowFlyCount }).map((_, i) => (
            <GlowFly
              key={`fly-${i}`}
              x={toRange(i + 3200, 28, width - 28)}
              y={toRange(i + 3280, height * 0.56, height * 0.9)}
              size={toRange(i + 3360, 0.9, 1.8)}
              delay={220 + i * 22}
            />
          ))}

        {animalCount > 0 &&
          Array.from({ length: animalCount }).map((_, i) => (
            <Animal
              key={`animal-${i}`}
              x={toRange(i + 2900, 30, width - 30)}
              y={toRange(i + 2980, height * 0.79, height * 0.97)}
              scale={toRange(i + 3060, 0.34, 0.5)}
              tone={i % 3 === 0 ? '#64748b' : i % 3 === 1 ? '#6b7280' : '#52525b'}
              delay={360 + i * 10}
            />
          ))}
      </svg>

      <div className="pointer-events-none absolute left-6 top-6 rounded-xl bg-slate-900/72 px-3 py-2 text-xs text-slate-200">
        <p>{`Stages unlocked: ${unlockedStages}/${FOREST_STAGES.length}`}</p>
      </div>
    </div>
  );
}

export default ForestScene;
