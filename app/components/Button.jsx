
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Button1({ text, duration, openMenu, setOpenMenu }) {
  const [bouncing, setBouncing] = useState(false);
  const router = useRouter();

  function Redirecte() {
    setOpenMenu(true);
    router.push("/");
  }

  return (
    <button
      className={`jelly w-full duration-${duration} ${
        openMenu ? "translate-x-0" :"translate-x-full" 
      } ${bouncing ? "" : "is-bouncing"}`}
      onClick={Redirecte}
      onAnimationEnd={(event) => {
        if (event.animationName === "jelly-impact") {
          setBouncing(false);
        }
      }}
    >
      <span className="surface">
        <span className="gel-core" />
        <span className="gel-highlight" />
        <span className="gel-reflection" />
        <span className="label">{text}</span>
      </span>
    </button>
  );
}
