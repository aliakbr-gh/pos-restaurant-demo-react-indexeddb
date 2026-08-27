import { useEffect, useState } from "react";
import {
  Armchair,
  BarChart3,
  Bike,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Grid2X2,
  LogOut,
  Menu,
  Moon,
  PackageOpen,
  Scale,
  ShoppingCart,
  Sun,
  UsersRound,
} from "lucide-react";
import Login from "./components/Login";
import Loader from "./components/Loader";
import CrudModule from "./components/CrudModule";
import { modules } from "./data/modules.jsx";
import PosScreenV2 from "./pages/PosScreenV3";
import Reports from "./pages/ReportsV2";
import Orders from "./pages/Orders";
import LiveTables from "./pages/LiveTables";
import CreditCustomers from "./pages/CreditCustomers";
import { getT } from "./i18n";
import { todayLabel } from "./lib/format";

const navigation = [
  ["pos", ShoppingCart],
  ["items", PackageOpen],
  ["tableView", Grid2X2],
  ["tables", Armchair],
  ["orders", ClipboardList],
  ["units", Scale],
  ["payments", CreditCard],
  ["riders", Bike],
  ["customers", UsersRound],
  ["reports", BarChart3],
];
export default function AppV2() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("mehfil-auth") === "true"
  );
  const [page, setPage] = useState("pos");
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(
    () => localStorage.getItem("mehfil-theme") === "dark"
  );
  const [sidebar, setSidebar] = useState(false);
  const [toast, setToast] = useState(null);
  const [tableTarget, setTableTarget] = useState(null);
  const [booting, setBooting] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const t = getT(lang);
  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 650);
    return () => window.clearTimeout(timer);
  }, []);
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
    window.setTimeout(() => setToast(null), 2600);
  };
  const login = () => {
    sessionStorage.setItem("mehfil-auth", "true");
    setAuthenticated(true);
  };
  const logout = () => {
    sessionStorage.removeItem("mehfil-auth");
    setAuthenticated(false);
  };
  const navigate = (id) => {
    setPage(id);
    setSidebar(false);
    setPageLoading(true);
    window.setTimeout(() => setPageLoading(false), 320);
  };
  const openTable = (tableId, orderId) => {
    setTableTarget({ tableId, orderId });
    navigate("pos");
  };
  if (booting)
    return (
      <Loader
        fullscreen
        label={
          lang === "ur"
            ? "آپ کا ریسٹورنٹ تیار ہو رہا ہے..."
            : "Preparing your restaurant..."
        }
      />
    );
  if (!authenticated)
    return (
      <Login
        lang={lang}
        onLogin={login}
        onLanguage={() => setLang(lang === "en" ? "ur" : "en")}
      />
    );
  if (pageLoading)
    return (
      <Loader
        fullscreen
        label={lang === "ur" ? "صفحہ لوڈ ہو رہا ہے..." : "Loading workspace..."}
      />
    );
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
          <ChevronDown size={15} />
        </div>
        <nav>
          <p>{t("workspace")}</p>
          {navigation.map(([id, Icon]) => (
            <button
              className={page === id ? "active" : ""}
              key={id}
              onClick={() => navigate(id)}
            >
              <Icon size={18} />
              <span>{t(id)}</span>
              {page === id && <b />}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user">
            <span>AK</span>
            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
            <button title={t("logout")} onClick={logout}>
              <LogOut size={16} />
            </button>
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
              <Menu size={21} />
            </button>
            <div>
              <strong>{todayLabel()}</strong>
              <span>{t("activeShift")}</span>
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
            <button
              className="icon-button"
              aria-label="Theme"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <div className="content">
          {page === "pos" ? (
            <PosScreenV2
              lang={lang}
              notify={notify}
              initialTable={tableTarget?.tableId}
              initialOrder={tableTarget?.orderId}
              clearInitial={() => setTableTarget(null)}
            />
          ) : page === "reports" ? (
            <Reports lang={lang} />
          ) : page === "orders" ? (
            <Orders lang={lang} notify={notify} />
          ) : page === "tableView" ? (
            <LiveTables lang={lang} onOpenTable={openTable} />
          ) : page === "customers" ? (
            <CreditCustomers lang={lang} />
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
