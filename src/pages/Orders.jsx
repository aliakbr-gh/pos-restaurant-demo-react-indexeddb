import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Ban, RotateCcw, Search, X } from "lucide-react";
import { db } from "../data/db";
import { getT } from "../i18n";
import { money, orderNumber } from "../lib/format";

export default function Orders({ lang, notify }) {
  const t = getT(lang);
  const orders = useLiveQuery(() => db.orders.reverse().toArray(), [], []);
  const [query, setQuery] = useState("");
  const [returning, setReturning] = useState(null);
  const [returns, setReturns] = useState({});
  const filtered = orders.filter((order) =>
    `${orderNumber(order.id)} ${order.assignmentName} ${order.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  const cancelOrder = async (order) => {
    if (!window.confirm(t("cancelOrder") + "?")) return;
    await db.orders.update(order.id, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    });
    if (order.orderType === "dinein" && order.tableId)
      await db
        .table("tables")
        .update(order.tableId, { status: "available", activeOrderId: null });
    notify(t("cancelOrder"));
  };
  const openReturn = (order) => {
    setReturning(order);
    setReturns(Object.fromEntries(order.items.map((item) => [item.itemId, 0])));
  };
  const confirmReturn = async () => {
    const returnedItems = returning.items
      .filter((item) => Number(returns[item.itemId]) > 0)
      .map((item) => ({
        ...item,
        returnQty: Math.min(item.qty, Number(returns[item.itemId])),
      }));
    if (!returnedItems.length) return;
    const returnTotal = returnedItems.reduce(
      (sum, item) => sum + item.returnQty * item.price,
      0
    );
    const allReturned = returning.items.every(
      (item) =>
        (returnedItems.find((row) => row.itemId === item.itemId)?.returnQty ||
          0) === item.qty
    );
    await db.orders.update(returning.id, {
      status: allReturned ? "returned" : "partially_returned",
      returnedItems,
      returnTotal,
      returnedAt: new Date().toISOString(),
    });
    setReturning(null);
    notify(t("confirmReturn"));
  };
  return (
    <section className="module-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{t("management")}</p>
          <h1>{t("orders")}</h1>
          <p>
            {lang === "ur"
              ? "آرڈرز منسوخ کریں یا مکمل اور جزوی واپسی درج کریں۔"
              : "Review, cancel, or process full and partial returns."}
          </p>
        </div>
        <label className="search">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
          />
        </label>
      </header>
      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("date")}</th>
                <th>{t("customer")}</th>
                <th>{t("total")}</th>
                <th>{t("payment")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{orderNumber(order.id)}</strong>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString("en-PK")}</td>
                  <td>{order.assignmentName || order.orderType}</td>
                  <td>
                    <strong>{money(order.total)}</strong>
                    {order.returnTotal ? (
                      <small className="return-amount">
                        − {money(order.returnTotal)} returned
                      </small>
                    ) : null}
                  </td>
                  <td>{order.payment}</td>
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
                  <td className="actions">
                    {!["cancelled", "returned"].includes(order.status) && (
                      <>
                        <button
                          title={t("returnOrder")}
                          onClick={() => openReturn(order)}
                        >
                          <RotateCcw size={15} />
                        </button>
                        <button
                          className="danger-icon"
                          title={t("cancelOrder")}
                          onClick={() => cancelOrder(order)}
                        >
                          <Ban size={15} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <div className="empty-state">{t("noOrders")}</div>}
      </div>
      {returning && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <div>
                <p className="eyebrow">{orderNumber(returning.id)}</p>
                <h2>{t("returnOrder")}</h2>
              </div>
              <button className="close" onClick={() => setReturning(null)}>
                <X size={17} />
              </button>
            </div>
            <div className="return-list">
              {returning.items.map((item) => (
                <label key={item.itemId}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {money(item.price)} · max {item.qty}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={item.qty}
                    value={returns[item.itemId]}
                    onChange={(e) =>
                      setReturns({ ...returns, [item.itemId]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="button ghost"
                onClick={() => setReturning(null)}
              >
                {t("cancel")}
              </button>
              <button className="button primary" onClick={confirmReturn}>
                <RotateCcw size={15} />
                {t("confirmReturn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
