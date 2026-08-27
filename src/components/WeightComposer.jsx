import { useMemo, useState } from "react";
import { Calculator, Scale, X } from "lucide-react";
import MenuImage from "./MenuImage";
import {
  amountFromWeight,
  formatWeight,
  weightFromAmount,
  weightToKg,
} from "../lib/unitEngine";
import { money } from "../lib/format";

export default function WeightComposer({ item, lang, onAdd, onClose }) {
  const [mode, setMode] = useState("amount");
  const [amount, setAmount] = useState("300");
  const [weight, setWeight] = useState("300");
  const [unit, setUnit] = useState("g");
  const calculatedKg = useMemo(
    () =>
      mode === "amount"
        ? Number(amount || 0) / item.price
        : weightToKg(weight || 0, unit),
    [mode, amount, weight, unit, item.price]
  );
  const calculatedAmount = useMemo(
    () =>
      mode === "amount"
        ? Number(amount || 0)
        : amountFromWeight(item.price, weight || 0, unit),
    [mode, amount, weight, unit, item.price]
  );
  const setAmountMode = (value) => {
    setMode("amount");
    setAmount(value);
  };
  const setWeightMode = (value) => {
    setMode("weight");
    setWeight(value);
  };
  const valid = calculatedKg > 0 && calculatedAmount > 0;
  const copy =
    lang === "ur"
      ? {
          title: "مقدار یا رقم درج کریں",
          rate: "فی کلو قیمت",
          byAmount: "رقم کے حساب سے",
          byWeight: "وزن کے حساب سے",
          amount: "مطلوبہ رقم",
          weight: "مطلوبہ وزن",
          resultWeight: "ملنے والا وزن",
          resultAmount: "قیمت",
          add: "آرڈر میں شامل کریں",
        }
      : {
          title: "Enter amount or weight",
          rate: "Price per kilogram",
          byAmount: "Buy by amount",
          byWeight: "Buy by weight",
          amount: "Customer amount",
          weight: "Required weight",
          resultWeight: "Calculated weight",
          resultAmount: "Calculated amount",
          add: "Add to order",
        };
  return (
    <div className="modal-backdrop">
      <div className="modal weight-modal">
        <div className="modal-head">
          <div className="weight-title">
            <MenuImage type={item.art} />
            <div>
              <p className="eyebrow">WEIGHTED ITEM</p>
              <h2>{lang === "ur" ? item.urduName : item.name}</h2>
              <span>
                {copy.rate}: <strong>{money(item.price)}</strong>
              </span>
            </div>
          </div>
          <button className="close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <h3>{copy.title}</h3>
        <div className="weight-tabs">
          <button
            className={mode === "amount" ? "active" : ""}
            onClick={() => setAmountMode(amount || "300")}
          >
            <Calculator size={18} />
            {copy.byAmount}
          </button>
          <button
            className={mode === "weight" ? "active" : ""}
            onClick={() => setWeightMode(weight || "300")}
          >
            <Scale size={18} />
            {copy.byWeight}
          </button>
        </div>
        {mode === "amount" ? (
          <label className="measurement-input">
            <span>{copy.amount}</span>
            <div>
              <b>Rs</b>
              <input
                autoFocus
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </label>
        ) : (
          <label className="measurement-input">
            <span>{copy.weight}</span>
            <div>
              <input
                autoFocus
                type="number"
                min="1"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                <option value="g">grams</option>
                <option value="kg">kilograms</option>
              </select>
            </div>
          </label>
        )}
        <div className="conversion-result">
          <div>
            <span>{copy.resultWeight}</span>
            <strong>{formatWeight(calculatedKg)}</strong>
          </div>
          <i>⇄</i>
          <div>
            <span>{copy.resultAmount}</span>
            <strong>{money(calculatedAmount)}</strong>
          </div>
        </div>
        <div className="conversion-example">
          {money(item.price)} / kg · {money(item.price / 2)} = 500 g · Rs 300 ={" "}
          {Math.round(weightFromAmount(item.price, 300, "g"))} g
        </div>
        <button
          className="button primary weight-add"
          disabled={!valid}
          onClick={() =>
            onAdd({ kilograms: calculatedKg, amount: calculatedAmount })
          }
        >
          {copy.add}
        </button>
      </div>
    </div>
  );
}
