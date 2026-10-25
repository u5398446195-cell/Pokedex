
import "./Fontanime1.css";

export default function ParticleAnimation() {
  return (
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 31 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

  );
}
