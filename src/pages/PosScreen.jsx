import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import FoodArt from "../components/FoodArt";
import { db } from "../data/db";
import { money } from "../lib/format";

const orderTypes = [
  { id: "cod", label: "Delivery", urdu: "ڈیلیوری", icon: "⌂" },
  { id: "takeaway", label: "Take away", urdu: "ٹیک اوے", icon: "↗" },
  { id: "dinein", label: "Dine in", urdu: "یہیں کھائیں", icon: "♨" },
  { id: "credit", label: "On credit", urdu: "ادھار", icon: "◷" },
];

export default function PosScreen({ lang, notify }) {
  const items = useLiveQuery(
    () => db.items.filter((item) => item.active).toArray(),
    [],
    []
  );
  const tables = useLiveQuery(
    () => db.table("tables").where("status").equals("available").toArray(),
    [],
    []
  );
  const riders = useLiveQuery(
    () => db.riders.filter((rider) => rider.active).toArray(),
    [],
    []
  );
  const customers = useLiveQuery(() => db.customers.toArray(), [], []);
  const paymentMethods = useLiveQuery(
    () => db.paymentMethods.filter((method) => method.active).toArray(),
    [],
    []
  );
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [orderType, setOrderType] = useState("dinein");
  const [assignment, setAssignment] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [ticket] = useState(() => String(Date.now()).slice(-4));

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
    setCart((current) =>
      current.some((line) => line.id === item.id)
        ? current.map((line) =>
            line.id === item.id ? { ...line, qty: line.qty + 1 } : line
          )
        : [...current, { ...item, qty: 1 }]
    );
  const quantity = (id, delta) =>
    setCart((current) =>
      current
        .map((line) =>
          line.id === id ? { ...line, qty: line.qty + delta } : line
        )
        .filter((line) => line.qty > 0)
    );

  const assignmentOptions =
    orderType === "dinein"
      ? tables
      : orderType === "credit"
      ? customers
      : riders;
  const assignmentLabel =
    orderType === "dinein"
      ? "Select table"
      : orderType === "credit"
      ? "Select credit customer"
      : "Assign rider";

  const placeOrder = async () => {
    if (!cart.length)
      return notify(
        lang === "ur" ? "پہلے کوئی آئٹم شامل کریں" : "Add an item first",
        "error"
      );
    if (!assignment)
      return notify(
        lang === "ur" ? "تفصیل منتخب کریں" : assignmentLabel,
        "error"
      );
    const id = await db.orders.add({
      createdAt: new Date().toISOString(),
      orderType,
      assignment,
      payment,
      subtotal,
      discount: Number(discount || 0),
      total,
      status: "completed",
      items: cart.map(({ id: itemId, name, qty, price }) => ({
        itemId,
        name,
        qty,
        price,
      })),
    });
    if (orderType === "dinein")
      await db
        .table("tables")
        .update(Number(assignment), { status: "occupied" });
    setCart([]);
    setDiscount(0);
    setAssignment("");
    notify(
      lang === "ur" ? `آرڈر #${id} محفوظ ہوگیا` : `Order #${id} completed`,
      "success"
    );
  };

  return (
    <section className="pos-page">
      <div className="catalog-pane">
        <header className="page-heading compact-heading">
          <div>
            <p className="eyebrow">NEW ORDER</p>
            <h1>{lang === "ur" ? "آرڈر بنائیں" : "What are we serving?"}</h1>
            <p>
              {lang === "ur"
                ? "مینو سے آئٹمز منتخب کریں"
                : "Select items from your menu."}
            </p>
          </div>
          <label className="search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "ur" ? "مینو تلاش کریں" : "Search menu"}
            />
          </label>
        </header>
        <div className="category-row">
          {categories.map((name) => (
            <button
              key={name}
              className={category === name ? "active" : ""}
              onClick={() => setCategory(name)}
            >
              {name}
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
              <FoodArt type={item.art} />
              <div className="menu-card-copy">
                <div>
                  <strong>{lang === "ur" ? item.urduName : item.name}</strong>
                  <small>
                    {item.category} · per {item.unit}
                  </small>
                </div>
                <span>{money(item.price)}</span>
              </div>
              <i>＋</i>
            </button>
          ))}
        </div>
      </div>
      <aside className="order-pane">
        <div className="order-head">
          <div>
            <p className="eyebrow">CURRENT ORDER</p>
            <h2>{lang === "ur" ? "موجودہ آرڈر" : "Order details"}</h2>
          </div>
          <span className="ticket">#{ticket}</span>
        </div>
        <div className="type-grid">
          {orderTypes.map((type) => (
            <button
              key={type.id}
              className={orderType === type.id ? "active" : ""}
              onClick={() => {
                setOrderType(type.id);
                setAssignment("");
              }}
            >
              <b>{type.icon}</b>
              <span>{lang === "ur" ? type.urdu : type.label}</span>
            </button>
          ))}
        </div>
        <label className="select-field">
          <span>{lang === "ur" ? "تفصیل" : assignmentLabel}</span>
          <select
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
          >
            <option value="">
              {lang === "ur" ? "منتخب کریں..." : `${assignmentLabel}...`}
            </option>
            {assignmentOptions.map((option) => (
              <option value={option.id} key={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <div className="cart-lines">
          {cart.length ? (
            cart.map((line) => (
              <div className="cart-line" key={line.id}>
                <div className="mini-art">
                  <FoodArt type={line.art} />
                </div>
                <div className="line-name">
                  <strong>{lang === "ur" ? line.urduName : line.name}</strong>
                  <small>{money(line.price)}</small>
                </div>
                <div className="stepper">
                  <button onClick={() => quantity(line.id, -1)}>−</button>
                  <span>{line.qty}</span>
                  <button onClick={() => quantity(line.id, 1)}>+</button>
                </div>
                <strong>{money(line.price * line.qty)}</strong>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <span>♨</span>
              <strong>
                {lang === "ur" ? "آپ کا آرڈر خالی ہے" : "Your order is empty"}
              </strong>
              <p>
                {lang === "ur"
                  ? "مینو سے آئٹمز شامل کریں"
                  : "Add a few delicious items from the menu."}
              </p>
            </div>
          )}
        </div>
        <div className="bill">
          <div>
            <span>{lang === "ur" ? "ذیلی کل" : "Subtotal"}</span>
            <b>{money(subtotal)}</b>
          </div>
          <div>
            <span>{lang === "ur" ? "رعایت" : "Discount"}</span>
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
            <span>{lang === "ur" ? "کل رقم" : "Total"}</span>
            <b>{money(total)}</b>
          </div>
        </div>
        <div className="payment-row">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              className={payment === method.name ? "active" : ""}
              onClick={() => setPayment(method.name)}
            >
              {method.name}
            </button>
          ))}
        </div>
        <button className="checkout" onClick={placeOrder}>
          <span>{lang === "ur" ? "آرڈر مکمل کریں" : "Complete order"}</span>
          <strong>{money(total)} →</strong>
        </button>
      </aside>
    </section>
  );
}
