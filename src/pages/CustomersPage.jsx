import { useState } from "react";
import { useData } from "../context/DataContext";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import { CustomerForm } from "../components/RecordForms";
import {
  EmptyRow,
  FilterBar,
  Notice,
  Pagination,
  Person,
  Status,
  TablePanel,
  useTableData,
} from "../components/Table";
import { formatDate, formatMoney } from "../utils/format";

export default function CustomersPage() {
  const { customers, orders, updateCustomer } = useData();
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const table = useTableData(customers);
  const customerOrders = selected
    ? orders.filter((order) =>
        order.customerId
          ? order.customerId === selected.id
          : order.name === selected.name,
      )
    : [];
  async function save(values) {
    await updateCustomer(editing.id, values);
    setNotice("Customer updated.");
  }
  return (
    <>
      <FilterBar table={table} />
      <TablePanel title="Customers Data">
        <table className="customers-table">
          <thead>
            <tr>
              {[
                "User Info",
                "Email",
                "Address",
                "Phone",
                "Register date",
                "Action",
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <Person
                    person={customer}
                    onClick={() => setSelected(customer)}
                  />
                </td>
                <td>
                  <span className="cell-ellipsis" title={customer.email}>
                    {customer.email}
                  </span>
                </td>
                <td>{customer.address}</td>
                <td>
                  <a className="phone-link" href={`tel:${customer.phone}`}>
                    {customer.phone}
                  </a>
                </td>
                <td>{formatDate(customer.registerDate, true)}</td>
                <td>
                  <button
                    type="button"
                    className="action-button"
                    aria-label={`Edit ${customer.name}`}
                    onClick={() => setEditing(customer)}
                  >
                    <Icon name="edit" />
                  </button>
                </td>
              </tr>
            ))}
            {!table.rows.length && <EmptyRow columns={6} query={table.query} />}
          </tbody>
        </table>
      </TablePanel>
      <Pagination table={table} />
      {editing && (
        <CustomerForm
          record={editing}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
      {selected && (
        <Modal title="Customer details" onClose={() => setSelected(null)}>
          <div className="customer-details">
            <Person person={selected} />
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{selected.email}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{selected.address}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{selected.phone}</dd>
              </div>
              <div>
                <dt>Registered</dt>
                <dd>{formatDate(selected.registerDate, true)}</dd>
              </div>
              <div>
                <dt>Total spent</dt>
                <dd>{formatMoney(selected.spent)}</dd>
              </div>
            </dl>
            <h3>Order history</h3>
            {customerOrders.length ? (
              <ul className="customer-history">
                {customerOrders.map((order) => (
                  <li key={order.id}>
                    <span>{formatDate(order.date, true)}</span>
                    <Status value={order.status} />
                    <strong>{formatMoney(order.price)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders recorded.</p>
            )}
          </div>
        </Modal>
      )}
      <Notice message={notice} onClose={() => setNotice("")} />
    </>
  );
}
