# Trading Simulation Backend

This is the **backend service** powering our trading simulation platform.  
It combines **high-performance C++ trade computation engine**, a **Node.js API layer**, and **Postgres** as the persistence layer.  

The backend handles:
- Trade computation (via native C++ engine for speed)
- Node.js bridge to communicate between C++ and the frontend
- Postgres for storing strategies, results, and trade history
- APIs consumed by the frontend dashboard

---

## 🏗️ Tech Stack

- **C++** → Core computation engine for simulating trades
- **Node.js + Express** → API layer & communication bridge
- **PostgreSQL** → Relational database for persistence

---

