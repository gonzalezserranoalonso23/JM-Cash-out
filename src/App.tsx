import { useMemo } from "react";
import {
  Check,
  Coins,
  CreditCard,
  Download,
  Minus,
  Plus,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { useCountStore } from "./store";

type Denomination = {
  value: number;
  type: "Billete" | "Moneda";
};

const denominations: Denomination[] = [
  { value: 100000, type: "Billete" },
  { value: 50000, type: "Billete" },
  { value: 20000, type: "Billete" },
  { value: 10000, type: "Billete" },
  { value: 5000, type: "Billete" },
  { value: 2000, type: "Billete" },
  { value: 2000, type: "Moneda" },
  { value: 1000, type: "Moneda" },
  { value: 500, type: "Moneda" },
  { value: 200, type: "Moneda" },
  { value: 100, type: "Moneda" },
  { value: 50, type: "Moneda" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value / 100);
}

function formatDenomination(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: value % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function App() {
  const quantities = useCountStore((state) => state.quantities);
  const setCount = useCountStore((state) => state.setCount);
  const reset = useCountStore((state) => state.reset);

  const summary = useMemo(() => {
    return denominations.reduce(
      (total, denomination) => {
        const key = `${denomination.type}-${denomination.value}`;
        const count = quantities[key] ?? 0;
        total.amount += denomination.value * count;
        total.items += count;
        if (denomination.type === "Billete") total.bills += count;
        else total.coins += count;
        return total;
      },
      { amount: 0, items: 0, bills: 0, coins: 0 },
    );
  }, [quantities]);

  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    const now = new Date();
    const dateLabel = new Intl.DateTimeFormat("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(now);

    pdf.setFillColor(228, 49, 58);
    pdf.rect(0, 0, 210, 36, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(19);
    pdf.text("JM Cash-out", 14, 17);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Desglose de efectivo / MXN", 14, 27);

    pdf.setTextColor(55, 55, 55);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Fecha: ${dateLabel}`, 14, 48);
    pdf.setFont("helvetica", "bold");
    pdf.text("TOTAL CONTADO", 14, 62);
    pdf.setFontSize(18);
    pdf.text(formatCurrency(summary.amount), 14, 72);

    let y = 88;
    pdf.setFillColor(38, 38, 38);
    pdf.rect(14, y - 6, 182, 10, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text("DENOMINACIÓN", 18, y);
    pdf.text("CANTIDAD", 118, y, { align: "right" });
    pdf.text("SUBTOTAL", 192, y, { align: "right" });

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 55, 55);
    y += 12;

    for (const denomination of denominations) {
      const key = `${denomination.type}-${denomination.value}`;
      const count = quantities[key] ?? 0;
      if (count === 0) continue;

      pdf.text(`${formatDenomination(denomination.value)}  ${denomination.type}`, 18, y);
      pdf.text(String(count), 118, y, { align: "right" });
      pdf.text(formatCurrency(denomination.value * count), 192, y, { align: "right" });
      y += 9;
    }

    pdf.setDrawColor(220, 220, 220);
    pdf.line(14, y, 196, y);
    y += 9;
    pdf.setFont("helvetica", "bold");
    pdf.text(`Piezas: ${summary.items}  |  Billetes: ${summary.bills}  |  Monedas: ${summary.coins}`, 18, y);
    pdf.save(`JM-Cash-out-${now.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="JM Cash-out, inicio">
          <span className="brand-mark">
            <svg aria-hidden="true" viewBox="0 0 40 40">
              <rect width="40" height="40" rx="11" fill="white" />
              <text
                x="20"
                y="25"
                fill="#e4313a"
                fontFamily="Manrope, sans-serif"
                fontSize="15"
                fontWeight="800"
                textAnchor="middle"
              >
                JM
              </text>
            </svg>
          </span>
          <span>JM <span className="brand-accent">Cash-out</span></span>
        </a>
        <div className="topbar-right">
          <span className="saved-status">
            <span className="status-dot" />
            Guardado localmente
          </span>
          <button className="reset-button" onClick={reset} type="button">
            <RotateCcw size={15} />
            Empezar de nuevo
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="workspace">
          <section className="count-card" aria-labelledby="count-title">
            <div className="card-heading">
              <h2 id="count-title">Desglose de efectivo</h2>
            </div>

            <div className="column-headings" aria-hidden="true">
              <span>DENOMINACIÓN</span>
              <span>CANTIDAD</span>
              <span>SUBTOTAL</span>
            </div>

            <div className="denomination-list">
              {denominations.map((denomination) => {
                const key = `${denomination.type}-${denomination.value}`;
                const count = quantities[key] ?? 0;
                const subtotal = count * denomination.value;
                return (
                  <div className={`denomination-row ${count ? "has-count" : ""}`} key={key}>
                    <div className="denomination-info">
                      <span className={`denomination-icon ${denomination.type === "Billete" ? "bill-icon" : "coin-icon"}`}>
                        {denomination.type === "Billete" ? <CreditCard size={17} /> : <Coins size={17} />}
                      </span>
                      <span className="denomination-name">
                        <strong>{formatDenomination(denomination.value)}</strong>
                        <small>{denomination.type}</small>
                      </span>
                    </div>
                    <div className="quantity-control">
                      <button
                        aria-label={`Quitar uno de ${formatDenomination(denomination.value)}`}
                        className="quantity-button"
                        disabled={count === 0}
                        onClick={() => setCount(key, count - 1)}
                        type="button"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        aria-label={`Cantidad de ${formatDenomination(denomination.value)}`}
                        inputMode="numeric"
                        min="0"
                        onChange={(event) => {
                          const next = event.target.value;
                          setCount(key, next === "" ? 0 : Number.parseInt(next, 10) || 0);
                        }}
                        type="number"
                        value={count || ""}
                      />
                      <button
                        aria-label={`Agregar uno de ${formatDenomination(denomination.value)}`}
                        className="quantity-button"
                        onClick={() => setCount(key, count + 1)}
                        type="button"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className={`row-subtotal ${subtotal ? "subtotal-active" : ""}`}>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="list-footer">
              <span><Check size={14} /> Los cambios se calculan al instante</span>
              <span>{denominations.length} denominaciones</span>
            </div>
          </section>

          <section className="total-card" aria-label="Total contado">
              <div className="total-card-top">
                <span className="total-icon"><Wallet size={18} /></span>
                <span className="total-caption">TOTAL CONTADO</span>
              </div>
              <p className="total-amount">{formatCurrency(summary.amount)}</p>
              <p className="total-subtitle">Pesos mexicanos</p>
              <div className="total-divider" />
              <div className="total-detail">
                <span>Unidades en total</span>
                <strong>{summary.items}</strong>
              </div>
              <div className="total-detail">
                <span>Billetes</span>
                <strong>{summary.bills}</strong>
              </div>
              <div className="total-detail">
                <span>Monedas</span>
                <strong>{summary.coins}</strong>
              </div>
              <button
                className="export-button"
                disabled={summary.items === 0}
                onClick={exportPdf}
                type="button"
              >
                <Download size={16} />
                Exportar PDF
              </button>
              <div className="total-decoration" aria-hidden="true">
                <span /><span /><span />
              </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
