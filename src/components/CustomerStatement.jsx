import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, Download, FileText, X } from 'lucide-react'
import { db } from '../data/db'
import { money, orderNumber } from '../lib/format'

const dateValue = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const monthStart = () => { const date = new Date(); return dateValue(new Date(date.getFullYear(), date.getMonth(), 1)) }

export default function CustomerStatement({ customer, lang, onClose }) {
  const orders = useLiveQuery(() => db.orders.where('customerId').equals(customer.id).reverse().toArray(), [customer.id], [])
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(() => dateValue(new Date()))
  const [exporting, setExporting] = useState(false)
  const filtered = useMemo(() => orders.filter((order) => { const time = new Date(order.createdAt).getTime(); return time >= new Date(`${from}T00:00:00`).getTime() && time <= new Date(`${to}T23:59:59`).getTime() }), [orders, from, to])
  const sales = filtered.filter((order) => !['cancelled', 'open'].includes(order.status))
  const purchases = sales.reduce((sum, order) => sum + order.total, 0)
  const returned = sales.reduce((sum, order) => sum + Number(order.returnTotal || 0), 0)
  const net = purchases - returned
  const closing = Number(customer.balance || 0) + net
  const copy = lang === 'ur' ? { title: 'گاہک کا کھاتہ', sub: 'منتخب مدت کے ادھار آرڈرز', from: 'شروع', to: 'اختتام', opening: 'ابتدائی بقایا', purchases: 'خریداری', returns: 'واپسی', closing: 'اختتامی بقایا', export: 'پی ڈی ایف بنائیں', empty: 'اس مدت میں کوئی ادھار آرڈر نہیں۔', order: 'آرڈر', date: 'تاریخ', items: 'اشیاء', amount: 'رقم', status: 'حالت' } : { title: 'Customer statement', sub: 'Credit orders for the selected period', from: 'From date', to: 'To date', opening: 'Opening balance', purchases: 'Credit purchases', returns: 'Returns', closing: 'Closing balance', export: 'Export PDF', empty: 'No credit orders in this date range.', order: 'Order', date: 'Date', items: 'Items', amount: 'Amount', status: 'Status' }

  const exportPdf = async () => {
    setExporting(true)
    try {
      const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      pdf.setFillColor(31, 42, 33); pdf.rect(0, 0, 210, 34, 'F'); pdf.setTextColor(255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(18); pdf.text('Mehfil Restaurant - Customer Statement', 14, 14); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.text(`${customer.name} | ${customer.mobile}`, 14, 23); pdf.text(`Period: ${from} to ${to}`, 14, 29)
      pdf.setTextColor(35); const metrics = [['Opening', customer.balance || 0], ['Purchases', purchases], ['Returns', returned], ['Closing', closing]]
      metrics.forEach(([label, value], index) => { const x = 14 + index * 47; pdf.setFillColor(245, 247, 243); pdf.roundedRect(x, 42, 42, 21, 2, 2, 'F'); pdf.setFontSize(8); pdf.setTextColor(105); pdf.text(label, x + 4, 49); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(55, 88, 59); pdf.text(money(value), x + 4, 57); pdf.setFont('helvetica', 'normal') })
      autoTable(pdf, { startY: 71, head: [['Order', 'Date and time', 'Items', 'Gross', 'Returned', 'Net', 'Status']], body: filtered.map((order) => [orderNumber(order.id), new Date(order.createdAt).toLocaleString('en-PK'), order.items?.reduce((sum, item) => sum + item.qty, 0) || 0, money(order.total), money(order.returnTotal || 0), money(order.total - Number(order.returnTotal || 0)), order.status.replace('_', ' ')]), theme: 'grid', styles: { fontSize: 8, cellPadding: 2.7, lineColor: [225, 228, 220], lineWidth: .2 }, headStyles: { fillColor: [72, 108, 75] }, alternateRowStyles: { fillColor: [248, 249, 246] }, margin: { left: 14, right: 14 } })
      pdf.setFontSize(8); pdf.setTextColor(120); pdf.text(`Generated ${new Date().toLocaleString('en-PK')} | Mehfil POS`, 14, 289)
      pdf.save(`customer-statement-${customer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${from}-to-${to}.pdf`)
    } finally { setExporting(false) }
  }

  return <div className="modal-backdrop statement-backdrop"><section className="modal statement-modal"><header className="statement-head"><div className="statement-customer"><span><FileText size={22} /></span><div><p className="eyebrow">{copy.title}</p><h2>{customer.name}</h2><small>{customer.mobile} · {customer.address}</small></div></div><button className="close" onClick={onClose}><X size={18} /></button></header><div className="statement-filters"><DateField label={copy.from} value={from} max={to} onChange={setFrom} /><DateField label={copy.to} value={to} min={from} onChange={setTo} /><button className="button primary" disabled={exporting} onClick={exportPdf}>{exporting ? <i className="button-spinner" /> : <Download size={17} />}{copy.export}</button></div><div className="statement-metrics"><Metric label={copy.opening} value={customer.balance} /><Metric label={copy.purchases} value={purchases} /><Metric label={copy.returns} value={returned} negative /><Metric label={copy.closing} value={closing} strong /></div><div className="statement-table table-scroll"><table><thead><tr><th>{copy.order}</th><th>{copy.date}</th><th>{copy.items}</th><th>{copy.amount}</th><th>{copy.status}</th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id}><td><strong>{orderNumber(order.id)}</strong></td><td>{new Date(order.createdAt).toLocaleString('en-PK')}</td><td>{order.items?.reduce((sum, item) => sum + item.qty, 0)}</td><td><strong>{money(order.total - Number(order.returnTotal || 0))}</strong></td><td><span className={`status ${order.status === 'completed' ? 'success' : 'muted'}`}>{order.status.replace('_', ' ')}</span></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state">{copy.empty}</div>}</div></section></div>
}

function DateField({ label, value, min, max, onChange }) { return <label className="statement-date"><span>{label}</span><div><CalendarDays size={16} /><input type="date" value={value} min={min || undefined} max={max || undefined} onChange={(event) => onChange(event.target.value)} /></div></label> }
function Metric({ label, value, negative, strong }) { return <article className={strong ? 'closing' : ''}><span>{label}</span><b className={negative ? 'negative' : ''}>{negative && value ? '− ' : ''}{money(value)}</b></article> }
