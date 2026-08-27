import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../data/db";
import { money, orderNumber } from "../lib/format";

export default function Reports({ lang }) {
  const orders = useLiveQuery(() => db.orders.reverse().toArray(), [], []);
  const total = orders.reduce((sum, order) => sum + order.total, 0);
  const average = orders.length ? total / orders.length : 0;
  const types = ["dinein", "cod", "takeaway", "credit"].map((type) => ({
    type,
    value: orders
      .filter((order) => order.orderType === type)
      .reduce((sum, order) => sum + order.total, 0),
  }));
  const max = Math.max(...types.map((entry) => entry.value), 1);
  const itemSales = {};
  orders.forEach((order) =>
    order.items?.forEach((item) => {
      itemSales[item.name] = (itemSales[item.name] || 0) + item.qty;
    })
  );
  const sellers = Object.entries(itemSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return (
    <section className="module-page reports-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">BUSINESS INSIGHTS</p>
          <h1>{lang === "ur" ? "تفصیلی رپورٹس" : "Detailed reports"}</h1>
          <p>
            {lang === "ur"
              ? "فروخت اور آرڈرز کی مکمل صورتحال"
              : "A clear view of sales, orders and performance."}
          </p>
        </div>
        <button className="button ghost" onClick={() => window.print()}>
          ⇩ {lang === "ur" ? "رپورٹ پرنٹ کریں" : "Print report"}
        </button>
      </header>
      <div className="metric-grid">
        <Metric
          label="Gross sales"
          urdu="کل فروخت"
          value={money(total)}
          change="Live"
        />
        <Metric
          label="Orders"
          urdu="آرڈرز"
          value={orders.length}
          change="Completed"
        />
        <Metric
          label="Average order"
          urdu="اوسط آرڈر"
          value={money(average)}
          change="Per ticket"
        />
        <Metric
          label="Credit sales"
          urdu="ادھار فروخت"
          value={money(types.find((x) => x.type === "credit").value)}
          change="Receivable"
        />
      </div>
      <div className="report-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <h3>{lang === "ur" ? "فروخت کی تقسیم" : "Sales by order type"}</h3>
            <p>
              {lang === "ur"
                ? "تمام محفوظ شدہ آرڈرز"
                : "Across all completed orders"}
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
            <h3>{lang === "ur" ? "سب سے زیادہ فروخت" : "Best sellers"}</h3>
            <p>{lang === "ur" ? "مقدار کے لحاظ سے" : "Ranked by quantity"}</p>
          </div>
          {sellers.length ? (
            sellers.map(([name, qty], index) => (
              <div className="seller-row" key={name}>
                <span>{index + 1}</span>
                <strong>{name}</strong>
                <b>{qty} sold</b>
              </div>
            ))
          ) : (
            <div className="empty-state">Complete orders to see rankings.</div>
          )}
        </div>
      </div>
      <div className="panel table-panel">
        <div className="table-toolbar">
          <strong>
            {lang === "ur" ? "حالیہ لین دین" : "Recent transactions"}
          </strong>
          <span className="count-pill">{orders.length}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date & time</th>
                <th>Type</th>
                <th>Payment</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 12).map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{orderNumber(order.id)}</strong>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString("en-PK")}</td>
                  <td>
                    <span className="status muted">{order.orderType}</span>
                  </td>
                  <td>{order.payment}</td>
                  <td>
                    {order.items?.reduce((sum, item) => sum + item.qty, 0)}
                  </td>
                  <td>
                    <strong>{money(order.total)}</strong>
                  </td>
                  <td>
                    <span className="status success">{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders.length && (
          <div className="empty-state">
            {lang === "ur"
              ? "POS سے آرڈر مکمل کریں"
              : "Complete an order from the POS to see reports."}
          </div>
        )}
      </div>
    </section>
  );
}
function Metric({ label, urdu, value, change }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">↗</div>
      <span>
        {label}
        <small>{urdu}</small>
      </span>
      <strong>{value}</strong>
      <em>{change}</em>
    </div>
  );
}
