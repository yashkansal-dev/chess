"use client";

interface MoveHistoryProps {
  moves: string[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const rows: Array<{ index: number; white?: string; black?: string }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      index: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white/75 p-4 shadow-sm backdrop-blur-lg transition duration-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/55">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Move History
      </h3>

      <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">White</th>
              <th className="px-3 py-2">Black</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400" colSpan={3}>
                  No moves yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.index} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-3 py-2 font-medium text-slate-500 dark:text-slate-400">{row.index}</td>
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{row.white ?? "-"}</td>
                  <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{row.black ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}
