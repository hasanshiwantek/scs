import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../store/userSlice';
import { API_BASE_URL } from '../config';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'add-booking', label: 'Add Booking' },
  { id: 'settings', label: 'Settings' },
];

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];
const TYPES = ['Normal', 'Express', 'Return'];

export default function OrdersPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Redux se sirf apiKey lo
  const apiKey = useSelector((state) => state.user.userData?.apiKey || '');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    orderNumber: '',
    tag: '',
    date: '',
    city: '',
    financialStatus: '',
    fulfillmentStatus: '',
  });

  const apiBase = API_BASE_URL;

  // ✅ Shopify detect
  const searchParams = new URLSearchParams(window.location.search);
  const shopParam = searchParams.get("shop");
  const hostParam = searchParams.get("host");

  const isShopify = () =>
    typeof window !== "undefined" &&
    typeof window.shopify !== "undefined" &&
    shopParam &&
    hostParam;

  // ✅ Har baar fresh session token
  const getSessionToken = async () => {
    if (!isShopify()) return null;
    try {
      return await window.shopify.idToken();
    } catch (err) {
      console.warn("Session token error:", err);
      return null;
    }
  };

  // ✅ Auth headers — fresh token har baar
  const getAuthHeaders = async () => {
    const sessionToken = await getSessionToken();
    return sessionToken
      ? { Authorization: `Bearer ${sessionToken}` }
      : { Authorization: `Bearer ${apiKey}` };
  };

  useEffect(() => {
    if (!apiKey) {
      navigate('/', { replace: true });
      return;
    }
    loadOrders();
  }, [apiKey, navigate]);

  async function loadOrders() {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const ordersUrl = import.meta.env.VITE_API_ORDERS_URL || `${apiBase}/api/orders`;
      const res = await fetch(ordersUrl, { headers });

      if (res.ok) {
        const data = await res.json();
        // ✅ API response ko component format mein map karo
        const mapped = (data.orders || []).map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          name: o.shipping?.name || '—',
          phone: o.shipping?.phone || '—',
          address: o.shipping?.address1 || '—',
          city: o.shipping?.city || '',
          cod: o.amount || '0',
          kg: '',
          type: 'Normal',
          financialStatus: o.financial_status?.toLowerCase(),
          fulfillmentStatus: o.fulfillment_status?.toLowerCase(),
          items: o.items || [],
          currency: o.currency,
        }));
        setOrders(mapped);
        return;
      }
      setOrders([]);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filters.orderNumber && !String(o.orderNumber).toLowerCase().includes(filters.orderNumber.toLowerCase())) return false;
      if (filters.city && (o.city || '') !== filters.city) return false;
      if (filters.financialStatus && (o.financialStatus || '') !== filters.financialStatus) return false;
      if (filters.fulfillmentStatus && (o.fulfillmentStatus || '') !== filters.fulfillmentStatus) return false;
      return true;
    });
  }, [orders, filters]);

  const selectAllRef = useRef(null);
  const allSelected = filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id));
  const someSelected = filteredOrders.some((o) => selectedIds.has(o.id));

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  function toggleSelectAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleProceed() {
    const selected = orders.filter((o) => selectedIds.has(o.id));
    if (selected.length === 0) return;

    const headers = await getAuthHeaders(); // ✅ fresh token
    headers['Content-Type'] = 'application/json';

    const submitUrl = import.meta.env.VITE_API_UPLOAD_BOOKING_URL || `${apiBase}/api/push-orders`;
    const payload = { order_ids: selected.map((o) => o.id), orders: selected };

    console.log("[API] push-orders REQUEST:", { url: submitUrl, payload });

    fetch(submitUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then((r) => r.json().then((data) => ({ status: r.status, ok: r.ok, data })))
      .then((res) => console.log("[API] push-orders RESPONSE:", res))
      .catch((err) => console.error("[API] push-orders ERROR:", err));

    alert(`Selected ${selected.length} order(s).`);
  }

  function updateOrderField(id, field, value) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  }

  if (!apiKey) return null;

  const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
  );
  const PencilIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
  );

  const inputBase = "h-9 px-3 border border-[#c9cccf] rounded-lg text-sm text-[#202223] placeholder-[#8c9196] bg-white focus:outline-none focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/20 transition";
  const selectCell = "h-8 px-2.5 rounded-md border border-[#c9cccf] bg-[#fafbfb] text-[#202223] text-sm focus:outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060]/30 min-w-[90px] cursor-pointer hover:border-[#8c9196] transition";

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <header className="bg-white border-b border-[#e1e3e5] shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#202223]">SCS Courier Service</h1>
            <button
              onClick={() => { dispatch(clearUser()); navigate('/', { replace: true }); }}
              className="text-sm text-[#6d7175] hover:text-[#d72c0d] transition font-medium"
            >
              Logout
            </button>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href="#" className={`text-sm transition ${item.id === 'add-booking' ? 'text-[#008060] font-semibold border-b-2 border-[#008060] pb-0.5 -mb-px' : 'text-[#6d7175] hover:text-[#202223]'}`}>
                {item.label}
              </a>
            ))}
          </nav>
          <p className="mt-1 text-xl font-medium text-[#202223] text-center">Create Booking with SCS Courier Service</p>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-[#e1e3e5] shadow-sm p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <input type="text" placeholder="Search Order #" value={filters.orderNumber} onChange={(e) => setFilters((f) => ({ ...f, orderNumber: e.target.value }))} className={`${inputBase} min-w-[140px]`} />
            <input type="text" placeholder="Search Tag" value={filters.tag} onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))} className={`${inputBase} min-w-[120px]`} />
            <input type="date" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} className={`${inputBase} w-[152px]`} />
            <select value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} className={`${inputBase} min-w-[130px] cursor-pointer`}>
              <option value="">Select City</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.financialStatus} onChange={(e) => setFilters((f) => ({ ...f, financialStatus: e.target.value }))} className={`${inputBase} min-w-[150px] cursor-pointer`}>
              <option value="">Financial Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <select value={filters.fulfillmentStatus} onChange={(e) => setFilters((f) => ({ ...f, fulfillmentStatus: e.target.value }))} className={`${inputBase} min-w-[160px] cursor-pointer`}>
              <option value="">Fulfillment Status</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="unfulfilled">Unfulfilled</option>
            </select>
            <button type="button" className="h-9 px-5 rounded-lg bg-[#008060] text-white text-sm font-semibold hover:bg-[#006e52] transition shadow-sm">
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#e1e3e5] shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-10 w-10 text-[#008060]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-[#6d7175]">Loading orders…</span>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-sm text-[#6d7175]">No orders found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#e1e3e5]">
                    <th className="w-12 py-3.5 pl-5 text-left align-middle">
                      <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060] w-4 h-4 cursor-pointer" />
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">Order #</th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">Name</th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">Items</th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">Phone</th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">Address</th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">City</th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">COD</th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">KG</th>
                    <th className="py-3.5 px-4 font-semibold text-[#202223] text-left">Type</th>
                    <th className="w-20 py-3.5 pr-5"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((row) => (
                    <tr key={row.id} className="border-b border-[#e1e3e5] last:border-b-0 hover:bg-[#f9fafb] transition">
                      <td className="py-3 pl-5 align-middle">
                        <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} className="rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060] w-4 h-4 cursor-pointer" />
                      </td>
                      <td className="py-3 px-4 text-[#202223] font-medium align-middle">{row.orderNumber || '—'}</td>
                      <td className="py-3 px-4 text-[#202223] align-middle">{row.name}</td>
                      {/* ✅ Items column */}
                      <td className="py-3 px-4 align-middle">
                        {row.items?.length > 0 ? (
                          row.items.map((item, i) => (
                            <div key={i} className="text-xs text-[#6d7175] leading-5">
                              {item.title} <span className="font-medium text-[#202223]">x{item.quantity}</span>
                            </div>
                          ))
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 text-[#202223] align-middle">{row.phone}</td>
                      <td className="py-3 px-4 text-[#202223] align-middle max-w-[160px] truncate" title={row.address}>{row.address}</td>
                      <td className="py-3 px-4 align-middle">
                        <select value={row.city || ''} onChange={(e) => updateOrderField(row.id, 'city', e.target.value)} className={selectCell}>
                          <option value="">Select</option>
                          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      {/* ✅ COD with currency */}
                      <td className="py-3 px-4 text-[#202223] align-middle tabular-nums">
                        {row.cod} <span className="text-xs text-[#6d7175]">{row.currency}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={row.kg}
                          onChange={(e) => updateOrderField(row.id, 'kg', e.target.value)}
                          placeholder="0.0"
                          className="w-16 h-8 px-2 rounded-md border border-[#c9cccf] text-sm text-[#202223] focus:outline-none focus:border-[#008060]"
                        />
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <select value={row.type || 'Normal'} onChange={(e) => updateOrderField(row.id, 'type', e.target.value)} className={selectCell}>
                          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="py-3 pr-5 text-right align-middle">
                        <span className="inline-flex items-center gap-0.5">
                          <button type="button" className="p-2 text-[#6d7175] hover:text-[#008060] hover:bg-[#e3f1ec] rounded-md transition" title="View"><EyeIcon /></button>
                          <button type="button" className="p-2 text-[#6d7175] hover:text-[#008060] hover:bg-[#e3f1ec] rounded-md transition" title="Edit"><PencilIcon /></button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {someSelected && (
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={handleProceed} className="px-6 py-3 rounded-lg font-semibold text-white bg-[#008060] hover:bg-[#006e52] focus:outline-none focus:ring-2 focus:ring-[#008060] focus:ring-offset-2 transition shadow-sm">
              Upload Booking
            </button>
          </div>
        )}
      </main>
    </div>
  );
}