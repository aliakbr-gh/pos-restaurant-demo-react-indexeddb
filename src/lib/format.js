export const money = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-PK")}`;

export const todayLabel = () =>
  new Intl.DateTimeFormat("en-PK", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date());

export const orderNumber = (id) => `ORD-${String(id).padStart(4, "0")}`;
