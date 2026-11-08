import type { PokemonDetails } from "../lib/pokeapi";
import Image from "next/image";

function displayName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type DexScreenProps = {
  activePokemon: PokemonDetails | null;
  loading: boolean;
  error: string;
};

export function DexScreen({
  activePokemon,
  loading,
  error,
}: DexScreenProps) {
  return (
    <div className="dex-screen relative flex h-full min-h-0 w-full flex-1 overflow-hidden border-[6px] border-[#ececec] bg-[#b8e8e9] sm:border-[8px]">
      {/* Reflets de l'écran */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.75),transparent_35%),linear-gradient(160deg,rgba(255,255,255,0.24),transparent_35%)]" />

      <div className="dex-vignette pointer-events-none absolute inset-0" />
      <div className="dex-scanlines pointer-events-none absolute inset-0" />
      <div className="dex-noise pointer-events-none absolute inset-0" />
      <div className="dex-glass pointer-events-none absolute inset-0" />

      {/* Contenu de l'écran */}
      <div className="relative z-10 flex h-full min-h-0 w-full items-center justify-center p-1.5 sm:p-2">
        {loading && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center text-center text-[#245c63]/60">
              <div className="mb-4 h-10 w-10 animate-spin border-[4px] border-[#245c63]/10 border-t-[#245c63]/65" />
              <p className="text-[9px] font-black uppercase tracking-[0.25em]">
                Loading...
              </p>
            </div>
          </div>
        )}

        {!loading && !error && activePokemon?.artwork && (
          <>
            <div className="pointer-events-none absolute bottom-[10%] h-5 w-[52%] bg-[#145b61]/15 blur-2xl sm:h-8" />

            <Image
              src={activePokemon.artwork}
              alt={displayName(activePokemon.englishName)}
              draggable={false}
              width={420}
              height={420}
              priority
              sizes="(max-width: 639px) 90vw, (max-width: 1023px) 60vw, 50vw"
              className="dex-pokemon-art relative z-10 max-h-full max-w-full object-contain"
            />
          </>
        )}

        {!loading && error && (
          <div className="absolute inset-0 grid place-items-center px-5 text-center">
            <p className="max-w-sm text-xs font-black uppercase tracking-[0.18em] text-[#6d2025]/65">
              {error}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .dex-screen {
          isolation: isolate;
        }

        .dex-screen::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          box-shadow:
            inset 0 0 55px rgba(29, 72, 77, 0.17),
            inset 0 0 5px rgba(29, 72, 77, 0.15);
        }

        .dex-scanlines {
          z-index: 25;
          opacity: 0.32;
          background: repeating-linear-gradient(
            to bottom,
            rgba(19, 76, 81, 0.09) 0px,
            rgba(19, 76, 81, 0.09) 1px,
            transparent 1px,
            transparent 4px
          );
          mix-blend-mode: multiply;
          animation: scan 7s linear infinite;
        }

        .dex-noise {
          z-index: 24;
          opacity: 0.06;
          background-image:
            radial-gradient(
              circle at 10% 20%,
              rgba(0, 0, 0, 0.8) 0 0.6px,
              transparent 0.7px
            ),
            radial-gradient(
              circle at 80% 60%,
              rgba(255, 255, 255, 0.9) 0 0.5px,
              transparent 0.7px
            );
          background-size: 8px 8px, 11px 11px;
          animation: noise 0.2s steps(2) infinite;
        }

        .dex-vignette {
          z-index: 23;
          background: radial-gradient(
            circle,
            transparent 46%,
            rgba(16, 63, 66, 0.16) 100%
          );
        }

        .dex-glass {
          z-index: 26;
          background: linear-gradient(
            125deg,
            rgba(255, 255, 255, 0.18),
            transparent 28%,
            transparent 72%,
            rgba(255, 255, 255, 0.05)
          );
          mix-blend-mode: screen;
        }

        .dex-pokemon-art {
          display: block;
          filter: saturate(1.04) contrast(1.02);
          animation: breathe 4.5s ease-in-out infinite;
          object-position: center;
        }

        @keyframes breathe {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-4px) scale(1.012);
          }
        }

        @keyframes scan {
          from {
            transform: translateY(0);
          }

          to {
            transform: translateY(4px);
          }
        }

        @keyframes noise {
          0% {
            transform: translate(0, 0);
          }

          25% {
            transform: translate(0.5px, -0.5px);
          }

          50% {
            transform: translate(-0.5px, 0.5px);
          }

          75% {
            transform: translate(0.5px, 0.5px);
          }

          100% {
            transform: translate(0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dex-scanlines,
          .dex-noise,
          .dex-pokemon-art {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}