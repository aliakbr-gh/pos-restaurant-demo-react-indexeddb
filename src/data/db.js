import Dexie from "dexie";

export const db = new Dexie("MehfilRestaurantPOS");

db.version(1).stores({
  units: "++id, name, symbol",
  tables: "++id, name, status",
  paymentMethods: "++id, name, active",
  riders: "++id, name, mobile, active",
  items: "++id, name, category, price, active",
  customers: "++id, name, mobile",
  orders: "++id, createdAt, orderType, status, customerId",
});
db.version(2).stores({
  units: "++id, name, symbol",
  tables: "++id, name, status, activeOrderId",
  paymentMethods: "++id, name, active",
  riders: "++id, name, mobile, active",
  items: "++id, name, category, price, active",
  customers: "++id, name, mobile",
  orders: "++id, createdAt, orderType, status, customerId, tableId",
});
db.version(3)
  .stores({
    units: "++id, name, symbol, kind",
    tables: "++id, name, status, activeOrderId",
    paymentMethods: "++id, name, active",
    riders: "++id, name, mobile, active",
    items: "++id, name, category, price, active, saleMode",
    customers: "++id, name, mobile",
    orders: "++id, createdAt, orderType, status, customerId, tableId",
  })
  .upgrade(async (transaction) => {
    await transaction
      .table("items")
      .toCollection()
      .modify((item) => {
        if (["biryani", "fish", "beef", "pakora"].includes(item.art)) {
          item.saleMode = "weight";
          item.unit = "kg";
          if (item.art === "biryani") item.price = 1000;
        } else item.saleMode = "piece";
      });
    await transaction
      .table("units")
      .toCollection()
      .modify((unit) => {
        unit.kind = ["kg", "g", "Rs/kg"].includes(unit.symbol)
          ? "weight"
          : "count";
        unit.grams =
          unit.symbol === "g"
            ? 1
            : unit.symbol === "kg" || unit.symbol === "Rs/kg"
            ? 1000
            : 0;
        unit.decimals = unit.symbol === "g" ? 0 : 3;
      });
  });

const seed = {
  units: [
    {
      name: "Piece",
      urduName: "عدد",
      symbol: "pc",
      kind: "count",
      grams: 0,
      decimals: 0,
    },
    {
      name: "Kilogram",
      urduName: "کلوگرام",
      symbol: "kg",
      kind: "weight",
      grams: 1000,
      decimals: 3,
    },
    {
      name: "Gram",
      urduName: "گرام",
      symbol: "g",
      kind: "weight",
      grams: 1,
      decimals: 0,
    },
  ],
  tables: [
    { name: "Table 01", capacity: 4, status: "available" },
    { name: "Table 02", capacity: 2, status: "available" },
    { name: "Family 01", capacity: 8, status: "available" },
  ],
  paymentMethods: [
    { name: "Cash", urduName: "نقد", active: true },
    { name: "Card", urduName: "کارڈ", active: true },
    { name: "JazzCash", urduName: "جاز کیش", active: true },
  ],
  riders: [
    { name: "Ahmed Raza", mobile: "0300 1234567", active: true },
    { name: "Bilal Khan", mobile: "0321 7654321", active: true },
  ],
  customers: [
    {
      name: "M. Usman",
      mobile: "0301 1122334",
      address: "Gulberg, Lahore",
      balance: 3250,
    },
    {
      name: "Ayesha Noor",
      mobile: "0333 9080706",
      address: "Model Town, Lahore",
      balance: 1800,
    },
  ],
  items: [
    {
      name: "Chicken Biryani",
      urduName: "چکن بریانی",
      category: "Rice",
      price: 1000,
      unit: "kg",
      saleMode: "weight",
      art: "biryani",
      active: true,
    },
    {
      name: "Beef Nihari",
      urduName: "بیف نہاری",
      category: "Curry",
      price: 650,
      unit: "plate",
      art: "nihari",
      active: true,
    },
    {
      name: "Fried Fish",
      urduName: "فرائی مچھلی",
      category: "BBQ",
      price: 1450,
      unit: "kg",
      saleMode: "weight",
      art: "fish",
      active: true,
    },
    {
      name: "Beef Karahi",
      urduName: "بیف کڑاہی",
      category: "Curry",
      price: 1750,
      unit: "kg",
      saleMode: "weight",
      art: "beef",
      active: true,
    },
    {
      name: "Samosa",
      urduName: "سموسہ",
      category: "Snacks",
      price: 80,
      unit: "piece",
      art: "samosa",
      active: true,
    },
    {
      name: "Mix Pakora",
      urduName: "مکس پکوڑا",
      category: "Snacks",
      price: 480,
      unit: "kg",
      saleMode: "weight",
      art: "pakora",
      active: true,
    },
    {
      name: "Tandoori Roti",
      urduName: "تندوری روٹی",
      category: "Bread",
      price: 35,
      unit: "piece",
      art: "roti",
      active: true,
    },
  ],
};

db.on("populate", async () => {
  await Promise.all(
    Object.entries(seed).map(([table, rows]) => db.table(table).bulkAdd(rows))
  );
});

export async function resetDemoData() {
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  await Promise.all(
    Object.entries(seed).map(([table, rows]) => db.table(table).bulkAdd(rows))
  );
}
