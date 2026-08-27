import { Printer, X } from "lucide-react";
import { getT } from "../i18n";
import { money, orderNumber } from "../lib/format";

export default function Receipt({ order, lang, onClose }) {
  if (!order) return null;
  const t = getT(lang);
  return (
    <div className="modal-backdrop receipt-backdrop">
      <div className="receipt-modal">
        <div className="receipt-actions no-print">
          <button className="button ghost" onClick={onClose}>
            <X size={16} />
            {t("close")}
          </button>
          <button className="button primary" onClick={() => window.print()}>
            <Printer size={16} />
            {t("print")}
          </button>
        </div>
        <article className="receipt">
          <header>
            <div className="receipt-logo">م</div>
            <h2>Mehfil Restaurant</h2>
            <p>Gulberg Branch · Lahore</p>
            <p>0300 1234567</p>
          </header>
          <div className="receipt-meta">
            <span>{orderNumber(order.id)}</span>
            <span>{new Date(order.createdAt).toLocaleString("en-PK")}</span>
            <span>{order.orderType.toUpperCase()}</span>
            <span>{order.assignmentName || "—"}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>{t("qty")}</th>
                <th>Item</th>
                <th>{t("price")}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.itemId}>
                  <td>{item.qty}</td>
                  <td>
                    {lang === "ur" ? item.urduName || item.name : item.name}
                  </td>
                  <td>{money(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="receipt-totals">
            <p>
              <span>{t("subtotal")}</span>
              <b>{money(order.subtotal)}</b>
            </p>
            <p>
              <span>{t("discount")}</span>
              <b>- {money(order.discount)}</b>
            </p>
            <p className="grand">
              <span>{t("total")}</span>
              <b>{money(order.total)}</b>
            </p>
            <p>
              <span>{t("payment")}</span>
              <b>{order.payment}</b>
            </p>
          </div>
          <footer>
            <strong>Thank you · شکریہ</strong>
            <p>Powered by Mehfil POS</p>
          </footer>
        </article>
      </div>
    </div>
  );
}
