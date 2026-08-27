import { useState } from "react";
import CrudModule from "../components/CrudModule";
import CustomerStatement from "../components/CustomerStatement";
import { modules } from "../data/modules.jsx";

export default function CreditCustomers({ lang }) {
  const [customer, setCustomer] = useState(null);
  return (
    <>
      <CrudModule config={modules.customers} lang={lang} onReport={setCustomer} />
      {customer && (
        <CustomerStatement
          customer={customer}
          lang={lang}
          onClose={() => setCustomer(null)}
        />
      )}
    </>
  );
}