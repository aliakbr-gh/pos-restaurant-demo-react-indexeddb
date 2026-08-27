import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { getT } from "../i18n";

export default function Login({ lang, onLogin, onLanguage }) {
  const t = getT(lang);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (username === "admin" && password === "admin123") onLogin();
    else setError(t("invalidLogin"));
  };
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <span>م</span>
          <strong>Mehfil</strong>
        </div>
        <div>
          <p>RESTAURANT MANAGEMENT</p>
          <h1>
            Serve better.
            <br />
            Manage smarter.
          </h1>
          <span>فروخت، میزیں اور آرڈرز — سب ایک جگہ</span>
        </div>
        <small>Mehfil Restaurant · Gulberg Branch</small>
      </section>
      <section className="login-form-wrap">
        <button className="login-language" onClick={onLanguage}>
          {lang === "en" ? "اردو" : "English"}
        </button>
        <form className="login-card" onSubmit={submit}>
          <div className="login-logo">م</div>
          <p className="eyebrow">MEHFIL POS</p>
          <h2>{t("loginTitle")}</h2>
          <p>{t("loginSub")}</p>
          <label>
            <span>{t("username")}</span>
            <div>
              <UserRound size={18} />
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </label>
          <label>
            <span>{t("password")}</span>
            <div>
              <LockKeyhole size={18} />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
          {error && <div className="login-error">{error}</div>}
          <button className="login-submit">{t("signIn")}</button>
        </form>
      </section>
    </main>
  );
}
