import { useEffect, useState } from "react";
import api from "../../utils/api";
import Navbar from "../../components/Navbar";

export default function AccountantDashboard() {
  const [tab, setTab] = useState("orders");

  // state
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);

  // load data
  useEffect(() => {
    if (tab === "orders") api.get("/orders").then((res) => setOrders(res.data));
    if (tab === "payments")
      api.get("/payments").then((res) => setPayments(res.data));
    if (tab === "payouts")
      api.get("/payouts").then((res) => setPayouts(res.data));
  }, [tab]);

  // xử lý payout
  const processPayout = async (id, amount) => {
    await api.put(`/payouts/${id}`, { status: "PAID", amount });
    alert("Payout processed ✅");
    setTab("payouts");
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>💼 Accountant Dashboard</h2>

        {/* Nav */}
        <nav style={{ marginBottom: 20 }}>
          <button onClick={() => setTab("orders")}>📑 Orders</button>
          <button onClick={() => setTab("payments")}>💳 Payments</button>
          <button onClick={() => setTab("payouts")}>💵 Payouts</button>
        </nav>

        {/* Orders */}
        {tab === "orders" && (
          <div>
            <h3>📑 Danh sách Orders</h3>
            <ul>
              {orders.map((o) => (
                <li key={o.order_id} style={{ marginBottom: 10 }}>
                  #{o.order_id} – Class {o.class_id} – {o.amount}đ – {o.status}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payments */}
        {tab === "payments" && (
          <div>
            <h3>💳 Lịch sử Payments</h3>
            <ul>
              {payments.map((p) => (
                <li key={p.payment_id} style={{ marginBottom: 10 }}>
                  #{p.payment_id} – Order {p.order_id} – {p.amount}đ –{" "}
                  {p.status} ({p.method})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payouts */}
        {tab === "payouts" && (
          <div>
            <h3>💵 Quản lý Payouts</h3>
            <ul>
              {payouts.map((p) => (
                <li key={p.payout_id} style={{ marginBottom: 10 }}>
                  #{p.payout_id} – Tutor {p.tutor_id} – {p.amount}đ – {p.status}
                  {p.status === "PENDING" && (
                    <button
                      onClick={() => processPayout(p.payout_id, p.amount)}
                      style={{ marginLeft: 10 }}
                    >
                      💰 Pay Now
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
