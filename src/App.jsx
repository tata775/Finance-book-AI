import { useState } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import jsPDF from "jspdf";
import "./App.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const [message, setMessage] = useState("");

  const [chat, setChat] = useState([
    {
      role: "ai",
      text: "Halo 👋 Saya AI Finance Assistant. Tanyakan kondisi keuangan Anda."
    }
  ]);

  const addTransaction = () => {
    if (!desc || !amount) return;

    const newTransaction = {
      id: Date.now(),
      desc,
      amount: Number(amount),
      type,
      date
    };

    setTransactions([...transactions, newTransaction]);

    setDesc("");
    setAmount("");
  };

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = income - expense;

  const chartData = [
    {
      name: "Pendapatan",
      value: income
    },
    {
      name: "Pengeluaran",
      value: expense
    }
  ];

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Laporan Keuangan", 20, 20);

    doc.text(
      `Pendapatan : Rp ${income.toLocaleString("id-ID")}`,
      20,
      40
    );

    doc.text(
      `Pengeluaran : Rp ${expense.toLocaleString("id-ID")}`,
      20,
      50
    );

    doc.text(
      `Saldo : Rp ${balance.toLocaleString("id-ID")}`,
      20,
      60
    );

    doc.save("laporan-keuangan.pdf");
  };

  function sendMessage() {
    if (!message) return;

    const lower = message.toLowerCase();

    let reply =
      "Maaf, saya belum memahami pertanyaan tersebut.";

    if (lower.includes("saldo")) {
      reply = `Saldo Anda saat ini Rp ${balance.toLocaleString(
        "id-ID"
      )}`;
    }

    if (lower.includes("pendapatan")) {
      reply = `Total pendapatan Anda Rp ${income.toLocaleString(
        "id-ID"
      )}`;
    }

    if (lower.includes("pengeluaran")) {
      reply = `Total pengeluaran Anda Rp ${expense.toLocaleString(
        "id-ID"
      )}`;
    }

    if (
      lower.includes("analisis") ||
      lower.includes("kondisi")
    ) {
      const ratio =
        income === 0
          ? 0
          : ((expense / income) * 100).toFixed(0);

      reply = `
Pendapatan : Rp ${income.toLocaleString(
        "id-ID"
      )}

Pengeluaran : Rp ${expense.toLocaleString(
        "id-ID"
      )}

Saldo : Rp ${balance.toLocaleString(
        "id-ID"
      )}

Rasio Pengeluaran : ${ratio}%

${
  ratio > 80
    ? "⚠ Pengeluaran terlalu tinggi."
    : "✅ Kondisi keuangan cukup sehat."
}
`;
    }

    setChat([
      ...chat,
      {
        role: "user",
        text: message
      },
      {
        role: "ai",
        text: reply
      }
    ]);

    setMessage("");
  }

  return (
    <div
      className={
        darkMode ? "app dark" : "app"
      }
    >
      <header className="header">
        <h1>💰 AI Finance Dashboard</h1>

        <button
          className="theme-btn"
          onClick={() =>
            setDarkMode(!darkMode)
          }
        >
          {darkMode
            ? "☀ Light"
            : "🌙 Dark"}
        </button>
      </header>

      <div className="summary-grid">
        <div className="card">
          <h3>Pendapatan</h3>
          <h2>
            Rp {income.toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="card">
          <h3>Pengeluaran</h3>
          <h2>
            Rp {expense.toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="card">
          <h3>Saldo</h3>
          <h2>
            Rp {balance.toLocaleString("id-ID")}
          </h2>
        </div>
      </div>

      <div className="card">
        <h3>Tambah Transaksi</h3>

        <input
          placeholder="Deskripsi"
          value={desc}
          onChange={(e) =>
            setDesc(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Nominal"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <input
          type="datetime-local"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
        />

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <option value="income">
            Pendapatan
          </option>

          <option value="expense">
            Pengeluaran
          </option>
        </select>

        <button onClick={addTransaction}>
          Tambah
        </button>

        <button onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      <div className="card chart-card">
        <h3>Grafik Keuangan</h3>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              outerRadius={100}
              label
            >
              <Cell fill="#16a34a" />
              <Cell fill="#dc2626" />
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>📋 Tabel Transaksi</h3>

        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Jenis</th>
              <th>Nominal</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>
                  {new Date(
                    t.date
                  ).toLocaleString("id-ID")}
                </td>

                <td>{t.desc}</td>

                <td>
                  {t.type === "income"
                    ? "Pendapatan"
                    : "Pengeluaran"}
                </td>

                <td>
                  Rp{" "}
                  {t.amount.toLocaleString(
                    "id-ID"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>🤖 AI Finance Assistant</h3>

        <div className="chat-box">
          {chat.map((c, i) => (
            <div
              key={i}
              className={
                c.role === "user"
                  ? "user-msg"
                  : "ai-msg"
              }
            >
              {c.text}
            </div>
          ))}
        </div>

        <input
          placeholder="Tanyakan sesuatu..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
        />

        <button onClick={sendMessage}>
          Kirim
        </button>
      </div>
    </div>
  );
}