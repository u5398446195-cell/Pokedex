import type { Metadata } from "next";
import Link from "next/link";
import RetroHeader from "../components/RetroHeader.jsx";
import { PORTFOLIO_URL, GITHUB_URL } from "../lib/site.js";
import RetroFooter from "../components/RetroFooter.jsx";

export const metadata: Metadata = {
  title: "Mentions légales · Pokédex",
  description: "Mentions légales, données et crédits du Pokédex.",
};


// Mentions légales : obligatoires pour tout site publié en France (LCEN, art. 6).
// Site personnel non professionnel → l'éditeur peut rester anonyme (art. 6-III-2) ;
// il suffit d'indiquer l'hébergeur, qui connaît son identité.
export default function MentionsLegales() {
  const ext = { target: "_blank", rel: "noreferrer" } as const;

  return (
    <main className="gb">
      <RetroHeader title="MENTIONS LÉGALES" />

      <article className="gb-section gb-legal">
        <h1 className="gb-h2">
          <span className="gb-h2-ball" aria-hidden="true" />
          MENTIONS LÉGALES
        </h1>
        <p className="gb-legal-date">Dernière mise à jour : novembre 2026</p>

        <div className="gb-legal-box px-frame">
          <h2>▶ ÉDITEUR DU SITE</h2>
          <p>
            Ce Pokédex est un projet personnel et non commercial de <strong>T</strong>, développeur web basé en France.
            Conformément à l&apos;article 6-III-2 de la loi pour la confiance dans l&apos;économie numérique (LCEN),
            l&apos;éditeur a choisi de rester anonyme : ses coordonnées ont été communiquées à l&apos;hébergeur.
          </p>
          <p>
            Pour voir mes autres projets ou me contacter :{" "}
            {PORTFOLIO_URL ? (
              <>
                <a href={PORTFOLIO_URL} {...ext}>mon portfolio</a> ou{" "}
              </>
            ) : null}
            <a href={GITHUB_URL} {...ext}>mon GitHub</a>.
          </p>
        </div>

        <div className="gb-legal-box px-frame">
          <h2>▶ HÉBERGEUR</h2>
          <p>
            Vercel Inc.
            <br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
            <br />
            <a href="https://vercel.com" {...ext}>vercel.com</a>
          </p>
        </div>

        <div className="gb-legal-box px-frame">
          <h2>▶ POKÉMON</h2>
          <p>
            Site de fan non officiel, ni affilié ni approuvé par Nintendo, Creatures Inc., GAME FREAK inc. ou The Pokémon Company.
            Pokémon, les noms des Pokémon, leurs images et sprites sont des marques et œuvres de leurs propriétaires respectifs
            (© Nintendo / Creatures Inc. / GAME FREAK inc.). Aucune publicité, rien n&apos;est vendu.
          </p>
        </div>

        <div className="gb-legal-box px-frame">
          <h2>▶ DONNÉES ET COOKIES</h2>
          <p>
            Ce site ne collecte aucune donnée personnelle : pas de compte, pas de formulaire, pas de cookie, pas de traceur
            ni d&apos;outil de statistiques.
          </p>
          <p>
            Les fiches viennent de <a href="https://pokeapi.co" {...ext}>PokéAPI</a> et les images du dépôt{" "}
            <a href="https://github.com/PokeAPI/sprites" {...ext}>PokeAPI/sprites</a> sur GitHub. Ton navigateur les charge
            directement chez eux : comme pour toute page web, ces services voient ton adresse IP.
            L&apos;hébergeur enregistre aussi des journaux techniques (adresse IP, date, page demandée) pour la sécurité du site.
          </p>
        </div>

        <div className="gb-legal-box px-frame">
          <h2>▶ LIENS EXTERNES</h2>
          <p>Les liens vers d&apos;autres sites sont donnés à titre indicatif ; je ne suis pas responsable de leur contenu.</p>
        </div>

        <Link href="/" className="gb-btn px-frame gb-legal-back">◀ RETOUR</Link>
      </article>

      <RetroFooter />
    </main>
  );
}
