import { money } from "../lib/format";

const active = (value) => (
  <span className={`status ${value ? "success" : "muted"}`}>
    {value ? "Active" : "Inactive"}
  </span>
);

export const modules = {
  units: {
    table: "units",
    title: "Units",
    urdu: "یونٹس",
    singular: "Unit",
    columns: [
      { key: "name", label: "Name", urdu: "نام" },
      { key: "urduName", label: "Urdu name", urdu: "اردو نام" },
      { key: "symbol", label: "Symbol", urdu: "علامت" },
      { key: "kind", label: "Unit type", urdu: "یونٹ کی قسم" },
      { key: "grams", label: "Grams in unit", urdu: "گرام فی یونٹ" },
      { key: "decimals", label: "Precision", urdu: "اعشاریہ" },
    ],
    fields: [
      { key: "name", label: "Name", urdu: "نام" },
      { key: "urduName", label: "Urdu name", urdu: "اردو نام" },
      { key: "symbol", label: "Symbol", urdu: "علامت" },
      {
        key: "kind",
        label: "Unit type",
        urdu: "یونٹ کی قسم",
        type: "select",
        options: ["weight", "count"],
      },
      {
        key: "grams",
        label: "Grams represented",
        urdu: "گرام کی مقدار",
        type: "number",
      },
      {
        key: "decimals",
        label: "Decimal precision",
        urdu: "اعشاریہ کی تعداد",
        type: "number",
      },
    ],
  },
  tables: {
    table: "tables",
    title: "Tables",
    urdu: "میزیں",
    singular: "Table",
    columns: [
      { key: "name", label: "Table", urdu: "میز" },
      { key: "capacity", label: "Seats", urdu: "نشستیں" },
      {
        key: "status",
        label: "Status",
        urdu: "حالت",
        render: (value) => (
          <span
            className={`status ${
              value === "available" ? "success" : "warning"
            }`}
          >
            {value}
          </span>
        ),
      },
    ],
    fields: [
      { key: "name", label: "Table name", urdu: "میز کا نام" },
      { key: "capacity", label: "Capacity", urdu: "گنجائش", type: "number" },
      {
        key: "status",
        label: "Status",
        urdu: "حالت",
        type: "select",
        options: ["available", "occupied", "reserved"],
      },
    ],
  },
  payments: {
    table: "paymentMethods",
    title: "Payment Methods",
    urdu: "ادائیگی کے طریقے",
    singular: "Payment method",
    columns: [
      { key: "name", label: "Name", urdu: "نام" },
      { key: "urduName", label: "Urdu name", urdu: "اردو نام" },
      { key: "active", label: "Status", urdu: "حالت", render: active },
    ],
    fields: [
      { key: "name", label: "Name", urdu: "نام" },
      { key: "urduName", label: "Urdu name", urdu: "اردو نام" },
      {
        key: "active",
        label: "Active",
        urdu: "فعال",
        type: "checkbox",
        required: false,
      },
    ],
  },
  riders: {
    table: "riders",
    title: "Riders",
    urdu: "رائیڈرز",
    singular: "Rider",
    columns: [
      { key: "name", label: "Name", urdu: "نام" },
      { key: "mobile", label: "Mobile", urdu: "موبائل" },
      { key: "active", label: "Status", urdu: "حالت", render: active },
    ],
    fields: [
      { key: "name", label: "Full name", urdu: "پورا نام" },
      {
        key: "mobile",
        label: "Mobile number",
        urdu: "موبائل نمبر",
        type: "tel",
      },
      {
        key: "active",
        label: "Available",
        urdu: "دستیاب",
        type: "checkbox",
        required: false,
      },
    ],
  },
  items: {
    table: "items",
    title: "Menu Items",
    urdu: "کھانے کی اشیاء",
    singular: "Menu item",
    columns: [
      { key: "name", label: "Item", urdu: "آئٹم" },
      { key: "category", label: "Category", urdu: "قسم" },
      { key: "price", label: "Base price", urdu: "بنیادی قیمت", render: money },
      { key: "unit", label: "Priced per", urdu: "قیمت فی" },
      { key: "saleMode", label: "Sale mode", urdu: "فروخت کا طریقہ" },
      { key: "active", label: "Status", urdu: "حالت", render: active },
    ],
    fields: [
      { key: "name", label: "English name", urdu: "انگریزی نام" },
      { key: "urduName", label: "Urdu name", urdu: "اردو نام" },
      {
        key: "category",
        label: "Category",
        urdu: "قسم",
        type: "select",
        options: ["Rice", "Curry", "BBQ", "Snacks", "Bread", "Drinks"],
      },
      {
        key: "saleMode",
        label: "Sale mode",
        urdu: "فروخت کا طریقہ",
        type: "select",
        options: ["piece", "weight"],
      },
      {
        key: "price",
        label: "Price per unit / kg (Rs)",
        urdu: "فی یونٹ یا کلو قیمت",
        type: "number",
      },
      {
        key: "unit",
        label: "Pricing unit",
        urdu: "قیمت کا یونٹ",
        type: "select",
        options: ["piece", "plate", "kg"],
      },
      {
        key: "art",
        label: "Artwork",
        urdu: "تصویر",
        type: "select",
        options: [
          "biryani",
          "nihari",
          "fish",
          "beef",
          "samosa",
          "pakora",
          "roti",
        ],
      },
      {
        key: "active",
        label: "Active",
        urdu: "فعال",
        type: "checkbox",
        required: false,
      },
    ],
  },
  customers: {
    table: "customers",
    title: "Credit Customers",
    urdu: "ادھار گاہک",
    singular: "Credit customer",
    columns: [
      { key: "name", label: "Name", urdu: "نام" },
      { key: "mobile", label: "Mobile", urdu: "موبائل" },
      { key: "address", label: "Address", urdu: "پتہ" },
      { key: "balance", label: "Balance", urdu: "بقایا", render: money },
    ],
    fields: [
      { key: "name", label: "Full name", urdu: "پورا نام" },
      {
        key: "mobile",
        label: "Mobile number",
        urdu: "موبائل نمبر",
        type: "tel",
      },
      { key: "address", label: "Address", urdu: "پتہ", wide: true },
      {
        key: "balance",
        label: "Opening balance",
        urdu: "ابتدائی بقایا",
        type: "number",
      },
    ],
  },
};
