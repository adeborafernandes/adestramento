/** Texto simples: parágrafos separados por linha em branco; linhas com "- " viram lista. */
export default function Prose({ text }: { text: string | null | undefined }) {
  if (!text?.trim()) return null;
  const blocos = text.trim().split(/\n{2,}/);
  return (
    <div className="prose">
      {blocos.map((b, i) => {
        const linhas = b.split("\n");
        if (linhas.every((l) => /^\s*[-•*]\s+/.test(l))) {
          return (
            <ul key={i}>
              {linhas.map((l, j) => (
                <li key={j}>{l.replace(/^\s*[-•*]\s+/, "")}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {linhas.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {l}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
