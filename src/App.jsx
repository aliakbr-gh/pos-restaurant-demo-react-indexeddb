import { useEffect, useState } from "react";
import CrudModule from "./components/CrudModule";
import { modules } from "./data/modules.jsx";
import PosScreen from "./pages/PosScreen";
import Reports from "./pages/Reports";
import { todayLabel } from "./lib/format";

const navigation = [
  ["pos", "⌘", "Point of Sale", "فروخت"],
  ["items", "▦", "Menu Items", "کھانے کی اشیاء"],
  ["tables", "♧", "Tables", "میزیں"],
  ["units", "⚖", "Units", "یونٹس"],
  ["payments", "▰", "Payment Methods", "ادائیگی"],
  ["riders", "♙", "Riders", "رائیڈرز"],
  ["customers", "◎", "Credit Customers", "ادھار گاہک"],
  ["reports", "↗", "Reports", "رپورٹس"],
].map(([id, icon, label, urdu]) => ({ id, icon, label, urdu }));

function App() {
  const [page, setPage] = useState("pos");
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(
    () => localStorage.getItem("mehfil-theme") === "dark"
  );
  const [sidebar, setSidebar] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("mehfil-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);
  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };
  const navigate = (id) => {
    setPage(id);
    setSidebar(false);
  };
  return (
    <div className={`app-shell ${lang === "ur" ? "urdu" : ""}`}>
      <aside className={`sidebar ${sidebar ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">م</div>
          <div>
            <strong>Mehfil</strong>
            <span>RESTAURANT POS</span>
          </div>
        </div>
        <div className="venue">
          <span>MM</span>
          <div>
            <strong>Mehfil Restaurant</strong>
            <small>Gulberg Branch</small>
          </div>
          <b>⌄</b>
        </div>
        <nav>
          <p>WORKSPACE</p>
          {navigation.map((item) => (
            <button
              className={page === item.id ? "active" : ""}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              <i>{item.icon}</i>
              <span>{lang === "ur" ? item.urdu : item.label}</span>
              {page === item.id && <b />}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="storage">
            <div>
              <span>◉ IndexedDB</span>
              <b>Local & secure</b>
            </div>
            <i />
          </div>
          <div className="user">
            <span>AK</span>
            <div>
              <strong>Ali Khan</strong>
              <small>Administrator</small>
            </div>
            <button>⋮</button>
          </div>
        </div>
      </aside>
      {sidebar && (
        <button className="sidebar-scrim" onClick={() => setSidebar(false)} />
      )}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setSidebar(true)}>
              ☰
            </button>
            <div>
              <strong>{todayLabel()}</strong>
              <span>Open shift · 09:00 AM</span>
            </div>
          </div>
          <div className="top-actions">
            <button
              className="language"
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
            >
              <span>ع</span>
              {lang === "en" ? "اردو" : "English"}
            </button>
            <button className="icon-button" onClick={() => setDark(!dark)}>
              {dark ? "☀" : "◐"}
            </button>
            <button className="icon-button">
              ♢<i />
            </button>
          </div>
        </header>
        <div className="content">
          {page === "pos" ? (
            <PosScreen lang={lang} notify={notify} />
          ) : page === "reports" ? (
            <Reports lang={lang} />
          ) : (
            <CrudModule config={modules[page]} lang={lang} />
          )}
        </div>
      </main>
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "✓" : "!"} <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
