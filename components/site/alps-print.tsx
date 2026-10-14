import Image from "next/image";

// The closing band on /profile, just above the footer: David's "Napoleon
// Crossing the Alps" in black and white. The stage sticks while the band
// scrolls; the picture starts close on Napoleon and pulls back to the whole
// painting as the line sharpens in word by word. SiteEffects sets --alps
// (0 to 1) across the band and marks each word in.

const MOTTO = ["My enemies are many,", "my equals are none."];

export function AlpsPrint() {
  return (
    <section className="mj-alps" aria-label="Motto">
      <div className="mj-alps-stage">
        <div className="mj-alps-print">
          <Image
            className="mj-alps-img"
            src="/napoleon-alps.jpg"
            alt="Jacques-Louis David's painting of Napoleon on a rearing horse, crossing the Alps"
            fill
            sizes="(max-width: 809px) 100vw, 62vw"
          />
        </div>
        <div className="mj-alps-inner mj-wrap">
          <blockquote className="mj-alps-quote">
            <p className="mj-alps-motto">
              {MOTTO.map((line) => (
                <span key={line} className="mj-alps-line">
                  {line.split(" ").map((word, i) => (
                    <span key={i}>{word} </span>
                  ))}
                </span>
              ))}
            </p>
            <footer className="mj-alps-credit">
              Napoleon Bonaparte
              <span className="mj-alps-dot" aria-hidden="true">
                ·
              </span>
              <span className="mj-alps-source">Napoleon: Total War</span>
            </footer>
          </blockquote>
        </div>
        <p className="mj-alps-plate">
          Jacques-Louis David, <i>Napoleon Crossing the Alps</i>, 1801
        </p>
      </div>
    </section>
  );
}
