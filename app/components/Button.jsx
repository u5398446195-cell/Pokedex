"use client";

import Link from "next/link";

// Bouton du menu (effet « gel » qui se remplit au survol).
// - href : la page à ouvrir
// - wip  : fonctionnalité en cours de développement → bouton grisé, non cliquable, avec un badge
export default function Button1({ text, href = "/", wip = false, setOpenMenu }) {
  const content = (
    <span className="surface">
      <span className="gel-core" />
      <span className="gel-highlight" />
      <span className="gel-reflection" />
      <span className={`label ${wip ? "label-wip" : ""}`}>{text}</span>
      {wip && <span className="wip-badge">En cours de dev</span>}
    </span>
  );

  if (wip) {
    return (
      <span className="jelly is-wip w-full" aria-disabled="true" title="Fonctionnalité en cours de développement">
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className="jelly w-full" onClick={() => setOpenMenu?.(false)}>
      {content}
    </Link>
  );
}
