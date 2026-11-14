import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import Icon from "../components/Icon";
import { EmptyRow, Person, Status, TablePanel } from "../components/Table";
import { formatMoney } from "../utils/format";

export default function DashboardPage() {
  const { products, suppliers, customers, transactions } = useData();
  const statistics = [
    {
      title: "All products",
      total: products.length,
      icon: "coins",
      to: "/products",
    },
    {
      title: "All suppliers",
      total: suppliers.length,
      icon: "users",
      to: "/suppliers",
    },
    {
      title: "All customers",
      total: customers.length,
      icon: "users",
      to: "/customers",
    },
  ];
  const recent = [...customers]
    .sort((a, b) =>
      String(b.registerDate).localeCompare(String(a.registerDate)),
    )
    .slice(0, 5);
  return (
    <>
      <section className="statistics" aria-label="Pharmacy statistics">
        {statistics.map((stat) => (
          <Link className="stat-card" to={stat.to} key={stat.title}>
            <span className="stat-label">
              <Icon name={stat.icon} />
              {stat.title}
            </span>
            <strong>{stat.total.toLocaleString("en-US")}</strong>
          </Link>
        ))}
      </section>
      <div className="dashboard-grid">
        <TablePanel title="Recent Customers" className="recent-customers">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Spent</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <Link
                      className="customer-link"
                      to={`/customers?q=${encodeURIComponent(customer.name)}`}
                    >
                      <Person person={customer} />
                    </Link>
                  </td>
                  <td>
                    <span className="cell-ellipsis" title={customer.email}>
                      {customer.email}
                    </span>
                  </td>
                  <td>{formatMoney(customer.spent)}</td>
                </tr>
              ))}
              {!recent.length && <EmptyRow columns={3} />}
            </tbody>
          </table>
        </TablePanel>
        <section
          className="table-panel transactions-panel"
          aria-labelledby="transactions-title"
        >
          <h2 id="transactions-title" className="panel-title">
            Income/Expenses
          </h2>
          <div className="transactions-content">
            <p className="transactions-date">Latest transactions</p>
            <ul className="transactions-list">
              {transactions.slice(0, 6).map((transaction) => (
                <li key={transaction.id}>
                  <Status value={transaction.type} />
                  <div className="transaction-title">
                    {transaction.title}
                    {transaction.email && <small>{transaction.email}</small>}
                  </div>
                  <span
                    className={`transaction-amount amount-${transaction.type.toLowerCase()}`}
                  >
                    {transaction.amount >= 0 ? "+" : "-"}
                    {formatMoney(Math.abs(transaction.amount))}
                  </span>
                </li>
              ))}
            </ul>
            {!transactions.length && (
              <div className="empty-state">
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
