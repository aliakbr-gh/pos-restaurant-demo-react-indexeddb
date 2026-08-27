import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CalendarDays,
  Download,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { db } from "../data/db";
import { money, orderNumber } from "../lib/format";

const inputDate = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
const monthStart = () => {
  const date = new Date();
  return inputDate(new Date(date.getFullYear(), date.getMonth(), 1));
};

export default function ReportsV2({ lang }) {
  const orders = useLiveQuery(() => db.orders.reverse().toArray(), [], []);
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(() => inputDate(new Date()));
  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const time = new Date(order.createdAt).getTime();
        return (
          time >= (from ? new Date(`${from}T00:00:00`).getTime() : -Infinity) &&
          time <= (to ? new Date(`${to}T23:59:59`).getTime() : Infinity)
        );
      }),
    [orders, from, to]
  );
  const sales = filtered.filter(
    (order) => !["cancelled", "open"].includes(order.status)
  );
  const gross = sales.reduce((sum, order) => sum + order.total, 0);
  const returns = sales.reduce(
    (sum, order) => sum + Number(order.returnTotal || 0),
    0
  );
  const net = gross - returns;
  const average = sales.length ? net / sales.length : 0;
  const types = ["dinein", "cod", "takeaway", "credit"].map((type) => ({
    type,
    value: sales
      .filter((order) => order.orderType === type)
      .reduce(
        (sum, order) => sum + order.total - Number(order.returnTotal || 0),
        0
      ),
  }));
  const max = Math.max(...types.map((entry) => entry.value), 1);
  const itemSales = {};
  sales.forEach((order) =>
    order.items?.forEach((item) => {
      const returned =
        order.returnedItems?.find((row) => row.itemId === item.itemId)
          ?.returnQty || 0;
      itemSales[item.name] = (itemSales[item.name] || 0) + item.qty - returned;
    })
  );
  const sellers = Object.entries(itemSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const setPreset = (type) => {
    const now = new Date();
    if (type === "today") setFrom(inputDate(now));
    if (type === "week") {
      const week = new Date(now);
      week.setDate(now.getDate() - 6);
      setFrom(inputDate(week));
    }
    if (type === "month") setFrom(monthStart());
    if (type === "all") setFrom("");
    setTo(inputDate(now));
  };

  const exportPdf = async () => {
    const [{ jsPDF }, { autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    pdf.setFillColor(31, 42, 33);
    pdf.rect(0, 0, 297, 31, "F");
    pdf.setTextColor(255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("Mehfil Restaurant - Sales Report", 14, 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(
      `Period: ${from || "Beginning"} to ${
        to || "Today"
      } | Generated: ${new Date().toLocaleString("en-PK")}`,
      14,
      23
    );
    const metrics = [
      ["Gross sales", money(gross)],
      ["Returns", money(returns)],
      ["Net sales", money(net)],
      ["Orders", String(sales.length)],
      ["Average order", money(average)],
    ];
    metrics.forEach(([label, value], index) => {
      const x = 14 + index * 55;
      pdf.setFillColor(244, 246, 241);
      pdf.roundedRect(x, 39, 48, 20, 2, 2, "F");
      pdf.setFontSize(8);
      pdf.setTextColor(105, 112, 102);
      pdf.text(label, x + 4, 46);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(43, 72, 47);
      pdf.text(value, x + 4, 54);
      pdf.setFont("helvetica", "normal");
    });
    autoTable(pdf, {
      startY: 68,
      head: [
        [
          "Order",
          "Date and time",
          "Type",
          "Customer / Table",
          "Payment",
          "Items",
          "Gross",
          "Returned",
          "Net",
          "Status",
        ],
      ],
      body: filtered.map((order) => [
        orderNumber(order.id),
        new Date(order.createdAt).toLocaleString("en-PK"),
        order.orderType,
        order.assignmentName || "-",
        order.payment || "-",
        order.items?.reduce((sum, item) => sum + item.qty, 0) || 0,
        money(order.total),
        money(order.returnTotal || 0),
        money(order.total - Number(order.returnTotal || 0)),
        order.status.replace("_", " "),
      ]),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: 2.5,
        lineColor: [225, 228, 220],
        lineWidth: 0.2,
      },
      headStyles: { fillColor: [72, 108, 75], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 249, 246] },
      margin: { left: 14, right: 14, bottom: 13 },
      didDrawPage: ({ pageNumber }) => {
        pdf.setFontSize(8);
        pdf.setTextColor(125);
        pdf.text(`Mehfil POS | Page ${pageNumber}`, 283, 202, {
          align: "right",
        });
      },
    });
    pdf.save(`mehfil-sales-report-${from || "all"}-to-${to || "today"}.pdf`);
  };

  const c =
    lang === "ur"
      ? {
          eye: "کاروباری تجزیہ",
          title: "تاریخ کے حساب سے رپورٹس",
          sub: "مطلوبہ مدت منتخب کریں اور مکمل فروخت رپورٹ دیکھیں۔",
          from: "شروع کی تاریخ",
          to: "آخری تاریخ",
          today: "آج",
          week: "گزشتہ 7 دن",
          month: "یہ مہینہ",
          all: "تمام",
          export: "پی ڈی ایف ڈاؤن لوڈ",
          gross: "کل فروخت",
          returns: "واپسی",
          net: "خالص فروخت",
          orders: "آرڈرز",
          average: "اوسط آرڈر",
          byType: "قسم کے مطابق فروخت",
          best: "سب سے زیادہ فروخت",
          transactions: "منتخب مدت کی ٹرانزیکشنز",
          empty: "اس مدت میں کوئی آرڈر موجود نہیں۔",
          order: "آرڈر",
          date: "تاریخ اور وقت",
          type: "قسم",
          payment: "ادائیگی",
          items: "اشیاء",
          total: "کل",
          status: "حالت",
          sold: "فروخت",
        }
      : {
          eye: "BUSINESS INSIGHTS",
          title: "Date range reports",
          sub: "Choose a period to review sales and transaction performance.",
          from: "From date",
          to: "To date",
          today: "Today",
          week: "Last 7 days",
          month: "This month",
          all: "All time",
          export: "Export PDF",
          gross: "Gross sales",
          returns: "Returns",
          net: "Net sales",
          orders: "Orders",
          average: "Average order",
          byType: "Sales by order type",
          best: "Best sellers",
          transactions: "Transactions in selected period",
          empty: "No orders found in this date range.",
          order: "Order",
          date: "Date and time",
          type: "Type",
          payment: "Payment",
          items: "Items",
          total: "Total",
          status: "Status",
          sold: "sold",
        };
  return (
    <section className="module-page reports-page">
      <header className="page-heading report-title">
        <div>
          <p className="eyebrow">{c.eye}</p>
          <h1>{c.title}</h1>
          <p>{c.sub}</p>
        </div>
        <button className="button primary export-button" onClick={exportPdf}>
          <Download size={18} />
          {c.export}
        </button>
      </header>
      <div className="report-filter panel">
        <DateField label={c.from} value={from} max={to} onChange={setFrom} />
        <span className="date-separator">→</span>
        <DateField label={c.to} value={to} min={from} onChange={setTo} />
        <div className="preset-buttons">
          <button onClick={() => setPreset("today")}>{c.today}</button>
          <button onClick={() => setPreset("week")}>{c.week}</button>
          <button onClick={() => setPreset("month")}>{c.month}</button>
          <button onClick={() => setPreset("all")}>{c.all}</button>
        </div>
      </div>
      <div className="metric-grid report-metrics">
        <Metric
          icon={TrendingUp}
          label={c.gross}
          value={money(gross)}
          tone="green"
        />
        <Metric
          icon={TrendingDown}
          label={c.returns}
          value={money(returns)}
          tone="orange"
        />
        <Metric
          icon={WalletCards}
          label={c.net}
          value={money(net)}
          tone="blue"
        />
        <Metric
          icon={ShoppingBag}
          label={c.orders}
          value={sales.length}
          tone="purple"
        />
        <Metric
          icon={TrendingUp}
          label={c.average}
          value={money(average)}
          tone="green"
        />
      </div>
      <div className="report-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <h3>{c.byType}</h3>
            <p>
              {from || "—"} → {to || "—"}
            </p>
          </div>
          <div className="bar-chart">
            {types.map((entry) => (
              <div className="bar-item" key={entry.type}>
                <div className="bar-track">
                  <span
                    style={{
                      height: `${Math.max(
                        (entry.value / max) * 100,
                        entry.value ? 8 : 2
                      )}%`,
                    }}
                  >
                    <b>{entry.value ? money(entry.value) : ""}</b>
                  </span>
                </div>
                <small>{entry.type}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel sellers">
          <div className="panel-heading">
            <h3>{c.best}</h3>
            <p>
              {sales.length} {c.orders}
            </p>
          </div>
          {sellers.length ? (
            sellers.map(([name, qty], index) => (
              <div className="seller-row" key={name}>
                <span>{index + 1}</span>
                <strong>{name}</strong>
                <b>
                  {qty} {c.sold}
                </b>
              </div>
            ))
          ) : (
            <div className="empty-state">{c.empty}</div>
          )}
        </div>
      </div>
      <div className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <strong>{c.transactions}</strong>
            <span className="count-pill">{filtered.length}</span>
          </div>
          <span className="range-caption">
            {from || "Beginning"} — {to || "Today"}
          </span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{c.order}</th>
                <th>{c.date}</th>
                <th>{c.type}</th>
                <th>{c.payment}</th>
                <th>{c.items}</th>
                <th>{c.total}</th>
                <th>{c.status}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{orderNumber(order.id)}</strong>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString("en-PK")}</td>
                  <td>
                    <span className="status muted">{order.orderType}</span>
                  </td>
                  <td>{order.payment || "—"}</td>
                  <td>
                    {order.items?.reduce((sum, item) => sum + item.qty, 0)}
                  </td>
                  <td>
                    <strong>
                      {money(order.total - Number(order.returnTotal || 0))}
                    </strong>
                    {order.returnTotal ? (
                      <small className="return-amount">
                        − {money(order.returnTotal)}
                      </small>
                    ) : null}
                  </td>
                  <td>
                    <span
                      className={`status ${
                        order.status === "completed"
                          ? "success"
                          : order.status === "open"
                          ? "warning"
                          : "muted"
                      }`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="empty-state report-empty">
            <CalendarDays size={30} />
            <strong>{c.empty}</strong>
          </div>
        )}
      </div>
    </section>
  );
}

function DateField({ label, value, min, max, onChange }) {
  return (
    <div className="date-field">
      <label>{label}</label>
      <div>
        <CalendarDays size={18} />
        <input
          type="date"
          value={value}
          min={min || undefined}
          max={max || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className={`metric-card roomy ${tone}`}>
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
