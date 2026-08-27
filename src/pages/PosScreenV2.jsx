import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Bike,
  CreditCard,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import MenuImage from "../components/MenuImage";
import Receipt from "../components/Receipt";
import { db } from "../data/db";
import { getT, localName } from "../i18n";
import { money } from "../lib/format";

const typeIcons = {
  cod: Bike,
  takeaway: ShoppingBag,
  dinein: UtensilsCrossed,
  credit: CreditCard,
};
export default function PosScreenV2({
  lang,
  notify,
  initialTable,
  initialOrder,
  clearInitial,
}) {
  const t = getT(lang);
  const items = useLiveQuery(
    () => db.items.filter((item) => item.active).toArray(),
    [],
    []
  );
  const tables = useLiveQuery(() => db.table("tables").toArray(), [], []);
  const riders = useLiveQuery(
    () => db.riders.filter((rider) => rider.active).toArray(),
    [],
    []
  );
  const customers = useLiveQuery(() => db.customers.toArray(), [], []);
  const methods = useLiveQuery(
    () => db.paymentMethods.filter((method) => method.active).toArray(),
    [],
    []
  );
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [orderType, setOrderType] = useState(
    initialTable ? "dinein" : "takeaway"
  );
  const [assignment, setAssignment] = useState(
    initialTable ? String(initialTable) : ""
  );
  const [payment, setPayment] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [openOrderId, setOpenOrderId] = useState(initialOrder || null);
  const [receipt, setReceipt] = useState(null);
  useEffect(() => {
    if (!initialOrder) return;
    db.orders.get(initialOrder).then((order) => {
      if (order) {
        setCart(order.items);
        setDiscount(order.discount || 0);
        setAssignment(String(order.tableId));
        setOpenOrderId(order.id);
      }
    });
    clearInitial?.();
  }, [initialOrder, clearInitial]);
  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const visible = items.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      `${item.name} ${item.urduName}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.qty, 0),
    [cart]
  );
  const total = Math.max(0, subtotal - Number(discount || 0));
  const add = (item) =>
    setCart((rows) =>
      rows.some((line) => line.itemId === item.id)
        ? rows.map((line) =>
            line.itemId === item.id ? { ...line, qty: line.qty + 1 } : line
          )
        : [
            ...rows,
            {
              itemId: item.id,
              name: item.name,
              urduName: item.urduName,
              qty: 1,
              price: item.price,
              art: item.art,
            },
          ]
    );
  const quantity = (id, delta) =>
    setCart((rows) =>
      rows
        .map((line) =>
          line.itemId === id ? { ...line, qty: line.qty + delta } : line
        )
        .filter((line) => line.qty > 0)
    );
  const changeAssignment = async (value) => {
    setAssignment(value);
    if (orderType !== "dinein" || !value) return;
    const table = tables.find((row) => row.id === Number(value));
    if (table?.activeOrderId) {
      const order = await db.orders.get(table.activeOrderId);
      if (order?.status === "open") {
        setCart(order.items);
        setDiscount(order.discount || 0);
        setOpenOrderId(order.id);
        return;
      }
    }
    setCart([]);
    setDiscount(0);
    setOpenOrderId(null);
  };
  const options =
    orderType === "dinein"
      ? tables
      : orderType === "credit"
      ? customers
      : orderType === "cod"
      ? riders
      : [];
  const label =
    orderType === "dinein"
      ? t("selectTable")
      : orderType === "credit"
      ? t("selectCustomer")
      : t("assignRider");
  const needsAssignment = orderType !== "takeaway";
  const name = options.find((row) => row.id === Number(assignment))?.name || "";
  const buildOrder = (status) => ({
    createdAt: new Date().toISOString(),
    orderType,
    assignment,
    assignmentName: name,
    payment,
    subtotal,
    discount: Number(discount || 0),
    total,
    status,
    tableId: orderType === "dinein" ? Number(assignment) : null,
    customerId: orderType === "credit" ? Number(assignment) : null,
    riderId: orderType === "cod" ? Number(assignment) : null,
    items: cart,
  });
  const reset = () => {
    setCart([]);
    setDiscount(0);
    setAssignment("");
    setOpenOrderId(null);
  };
  const submit = async (settle = false) => {
    if (!cart.length) return notify(t("addItemFirst"), "error");
    if (needsAssignment && !assignment)
      return notify(t("selectRequired"), "error");
    if (orderType === "dinein" && !settle) {
      const payload = buildOrder("open");
      let id = openOrderId;
      if (id) await db.orders.update(id, { ...payload, createdAt: undefined });
      else id = await db.orders.add(payload);
      await db
        .table("tables")
        .update(Number(assignment), { status: "occupied", activeOrderId: id });
      setOpenOrderId(id);
      notify(t("tableSaved"));
      return;
    }
    let order;
    if (openOrderId && settle) {
      await db.orders.update(openOrderId, {
        ...buildOrder("completed"),
        completedAt: new Date().toISOString(),
      });
      order = await db.orders.get(openOrderId);
      await db
        .table("tables")
        .update(Number(assignment), {
          status: "available",
          activeOrderId: null,
        });
    } else {
      const id = await db.orders.add(buildOrder("completed"));
      order = await db.orders.get(id);
    }
    setReceipt(order);
    reset();
    notify(t("orderSaved"));
  };
  const types = ["cod", "takeaway", "dinein", "credit"];
  return (
    <section className="pos-page">
      <div className="catalog-pane">
        <header className="page-heading compact-heading">
          <div>
            <p className="eyebrow">{t("newOrder")}</p>
            <h1>{t("serving")}</h1>
            <p>{t("servingSub")}</p>
          </div>
          <label className="search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchMenu")}
            />
          </label>
        </header>
        <div className="category-row">
          {categories.map((row) => (
            <button
              key={row}
              className={category === row ? "active" : ""}
              onClick={() => setCategory(row)}
            >
              {row === "All" ? t("all") : row}
            </button>
          ))}
        </div>
        <div className="menu-grid">
          {visible.map((item) => (
            <button
              className="menu-card"
              key={item.id}
              onClick={() => add(item)}
            >
              <MenuImage type={item.art} />
              <div className="menu-card-copy">
                <div>
                  <strong>{localName(item, lang)}</strong>
                  <small>
                    {item.category} · {item.unit}
                  </small>
                </div>
                <span>{money(item.price)}</span>
              </div>
              <i>
                <Plus size={16} />
              </i>
            </button>
          ))}
        </div>
      </div>
      <aside className="order-pane">
        <div className="order-head">
          <div>
            <p className="eyebrow">{t("currentOrder")}</p>
            <h2>{t("orderDetails")}</h2>
          </div>
          {openOrderId && (
            <span className="status warning">
              #{openOrderId} · {t("openOrder")}
            </span>
          )}
        </div>
        <div className="type-grid">
          {types.map((type) => {
            const Icon = typeIcons[type];
            return (
              <button
                key={type}
                className={orderType === type ? "active" : ""}
                onClick={() => {
                  setOrderType(type);
                  setAssignment("");
                  setOpenOrderId(null);
                  setCart([]);
                }}
              >
                <Icon size={19} />
                <span>{t(type)}</span>
              </button>
            );
          })}
        </div>
        {needsAssignment && (
          <label className="select-field">
            <span>{label}</span>
            <select
              value={assignment}
              onChange={(e) => changeAssignment(e.target.value)}
            >
              <option value="">{t("select")}</option>
              {options.map((option) => (
                <option value={option.id} key={option.id}>
                  {option.name}
                  {option.activeOrderId ? ` · ${t("occupied")}` : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="cart-lines">
          {cart.length ? (
            cart.map((line) => (
              <div className="cart-line" key={line.itemId}>
                <div className="mini-art">
                  <MenuImage type={line.art} />
                </div>
                <div className="line-name">
                  <strong>{lang === "ur" ? line.urduName : line.name}</strong>
                  <small>{money(line.price)}</small>
                </div>
                <div className="stepper">
                  <button onClick={() => quantity(line.itemId, -1)}>
                    <Minus size={13} />
                  </button>
                  <span>{line.qty}</span>
                  <button onClick={() => quantity(line.itemId, 1)}>
                    <Plus size={13} />
                  </button>
                </div>
                <strong>{money(line.price * line.qty)}</strong>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <Store size={35} />
              <strong>{t("emptyCart")}</strong>
              <p>{t("emptyCartSub")}</p>
            </div>
          )}
        </div>
        <div className="bill">
          <div>
            <span>{t("subtotal")}</span>
            <b>{money(subtotal)}</b>
          </div>
          <div>
            <span>{t("discount")}</span>
            <label className="discount-input">
              Rs{" "}
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </label>
          </div>
          <div className="total">
            <span>{t("total")}</span>
            <b>{money(total)}</b>
          </div>
        </div>
        <div className="payment-row">
          {methods.map((method) => (
            <button
              key={method.id}
              className={payment === method.name ? "active" : ""}
              onClick={() => setPayment(method.name)}
            >
              {lang === "ur" ? method.urduName : method.name}
            </button>
          ))}
        </div>
        <button className="checkout" onClick={() => submit(false)}>
          <span>
            {orderType === "dinein"
              ? openOrderId
                ? t("updateTable")
                : t("sendTable")
              : t("complete")}
          </span>
          <strong>{money(total)}</strong>
        </button>
        {orderType === "dinein" && openOrderId && (
          <button className="settle-button" onClick={() => submit(true)}>
            {t("settle")}
          </button>
        )}
      </aside>
      {receipt && (
        <Receipt order={receipt} lang={lang} onClose={() => setReceipt(null)} />
      )}
    </section>
  );
}
