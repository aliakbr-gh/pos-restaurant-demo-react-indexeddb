import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../data/db";
import { FileText } from "lucide-react";

const fieldDefaults = (fields) =>
  Object.fromEntries(
    fields.map((field) => [field.key, field.type === "checkbox" ? true : ""])
  );

export default function CrudModule({ config, lang, onReport }) {
  const rows = useLiveQuery(
    () => db.table(config.table).toArray(),
    [config.table],
    []
  );
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(fieldDefaults(config.fields));
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())
      ),
    [rows, query]
  );

  const openNew = () => {
    setEditing(null);
    setForm(fieldDefaults(config.fields));
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditing(row.id);
    setForm(row);
    setShowForm(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const payload = { ...form };
    config.fields
      .filter((field) => field.type === "number")
      .forEach((field) => {
        payload[field.key] = Number(payload[field.key]);
      });
    if (editing) await db.table(config.table).update(editing, payload);
    else await db.table(config.table).add(payload);
    setShowForm(false);
  };

  const remove = async (id) => {
    if (
      window.confirm(
        lang === "ur"
          ? "کیا آپ یہ ریکارڈ حذف کرنا چاہتے ہیں؟"
          : "Delete this record?"
      )
    )
      await db.table(config.table).delete(id);
  };

  return (
    <section className="module-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">MANAGEMENT</p>
          <h1>{lang === "ur" ? config.urdu : config.title}</h1>
          <p>
            {lang === "ur"
              ? `${config.urdu} کی تفصیلات منظم کریں`
              : `Create and manage your ${config.title.toLowerCase()}.`}
          </p>
        </div>
        <button className="button primary" onClick={openNew}>
          ＋ {lang === "ur" ? "نیا شامل کریں" : `Add ${config.singular}`}
        </button>
      </header>
      <div className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <strong>
              {lang === "ur" ? "تمام ریکارڈ" : `All ${config.title}`}
            </strong>
            <span className="count-pill">{rows.length}</span>
          </div>
          <label className="search compact">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "ur" ? "تلاش کریں" : "Search records"}
            />
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key}>
                    {lang === "ur" ? column.urdu || column.label : column.label}
                  </th>
                ))}
                <th>{lang === "ur" ? "عمل" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? "—")}
                    </td>
                  ))}
                  <td className="actions">
                    {onReport && (
                      <button
                        className="report-icon"
                        title={
                          lang === "ur" ? "گاہک کی رپورٹ" : "Customer statement"
                        }
                        onClick={() => onReport(row)}
                      >
                        <FileText size={15} />
                      </button>
                    )}
                    <button onClick={() => openEdit(row)}>✎</button>
                    <button
                      className="danger-icon"
                      onClick={() => remove(row.id)}
                    >
                      ⌫
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="empty-state">
            {lang === "ur" ? "کوئی ریکارڈ نہیں ملا" : "No records found"}
          </div>
        )}
      </div>
      {showForm && (
        <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}>
          <form
            className="modal"
            onSubmit={save}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">{editing ? "EDIT" : "NEW RECORD"}</p>
                <h2>{lang === "ur" ? config.urdu : config.singular}</h2>
              </div>
              <button
                type="button"
                className="close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <div className="form-grid">
              {config.fields.map((field) => (
                <label key={field.key} className={field.wide ? "wide" : ""}>
                  <span>
                    {lang === "ur" ? field.urdu || field.label : field.label}
                  </span>
                  {field.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.key])}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.checked })
                      }
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={form[field.key]}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={field.required !== false}
                      type={field.type || "text"}
                      value={form[field.key] ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setShowForm(false)}
              >
                {lang === "ur" ? "منسوخ" : "Cancel"}
              </button>
              <button className="button primary">
                {lang === "ur" ? "محفوظ کریں" : "Save record"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
