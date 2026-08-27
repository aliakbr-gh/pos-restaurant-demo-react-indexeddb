import { useLiveQuery } from "dexie-react-hooks";
import { Armchair, Clock3, Plus, ReceiptText, UsersRound } from "lucide-react";
import { db } from "../data/db";
import { getT } from "../i18n";
import { money, orderNumber } from "../lib/format";

export default function LiveTables({ lang, onOpenTable }) {
  const t = getT(lang);
  const tables = useLiveQuery(() => db.table("tables").toArray(), [], []);
  const orders = useLiveQuery(
    () => db.orders.where("status").equals("open").toArray(),
    [],
    []
  );
  const orderMap = Object.fromEntries(
    orders.map((order) => [order.tableId, order])
  );
  return (
    <section className="module-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">DINING ROOM</p>
          <h1>{t("tableView")}</h1>
          <p>
            {lang === "ur"
              ? "تمام میزوں اور جاری آرڈرز کی براہ راست صورتحال۔"
              : "Live status of every table and its running order."}
          </p>
        </div>
        <div className="table-legend">
          <span>
            <i className="free" />
            {t("available")}
          </span>
          <span>
            <i className="busy" />
            {t("occupied")}
          </span>
        </div>
      </header>
      <div className="floor-grid">
        {tables.map((table) => {
          const order = orderMap[table.id];
          const busy = Boolean(order);
          return (
            <article
              className={`floor-table ${busy ? "busy" : "free"}`}
              key={table.id}
            >
              <div className="floor-top">
                <div className="table-symbol">
                  <Armchair size={23} />
                </div>
                <span className={`status ${busy ? "warning" : "success"}`}>
                  {busy ? t("occupied") : t("available")}
                </span>
              </div>
              <h3>{table.name}</h3>
              <p>
                <UsersRound size={14} />
                {table.capacity} {t("seats")}
              </p>
              {busy ? (
                <div className="running-order">
                  <div>
                    <span>{orderNumber(order.id)}</span>
                    <strong>{money(order.total)}</strong>
                  </div>
                  <p>
                    <Clock3 size={13} />
                    {new Date(order.createdAt).toLocaleTimeString("en-PK", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {order.items.reduce((sum, item) => sum + item.qty, 0)}{" "}
                    items
                  </p>
                </div>
              ) : (
                <div className="available-space">
                  <Armchair size={24} />
                  <span>
                    {lang === "ur"
                      ? "نئے مہمانوں کے لیے تیار"
                      : "Ready for new guests"}
                  </span>
                </div>
              )}
              <button onClick={() => onOpenTable(table.id, order?.id)}>
                {busy ? <ReceiptText size={16} /> : <Plus size={16} />}
                {busy ? t("viewOrder") : t("newOrder")}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
