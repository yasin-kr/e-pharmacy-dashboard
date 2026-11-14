import { useState } from "react";
import { useData } from "../context/DataContext";
import Icon from "../components/Icon";
import { SupplierForm } from "../components/RecordForms";
import {
  EmptyRow,
  FilterBar,
  Notice,
  Pagination,
  Status,
  TablePanel,
  useTableData,
} from "../components/Table";
import { formatDate, formatMoney } from "../utils/format";

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier } = useData();
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const table = useTableData(suppliers);
  async function save(values) {
    if (editing.id) await updateSupplier(editing.id, values);
    else await addSupplier(values);
    setNotice(editing.id ? "Supplier updated." : "Supplier added.");
    if (!editing.id) table.reset();
  }
  return (
    <>
      <FilterBar table={table}>
        <button
          type="button"
          className="button button-outline add-supplier"
          onClick={() => setEditing({})}
        >
          Add a new supplier
        </button>
      </FilterBar>
      <TablePanel title="All suppliers">
        <table className="suppliers-table">
          <thead>
            <tr>
              {[
                "Suppliers Info",
                "Address",
                "Company",
                "Delivery date",
                "Amount",
                "Status",
                "Action",
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.address}</td>
                <td>{supplier.company}</td>
                <td>{formatDate(supplier.deliveryDate)}</td>
                <td>{formatMoney(supplier.amount)}</td>
                <td>
                  <Status value={supplier.status} />
                </td>
                <td>
                  <button
                    type="button"
                    className="edit-button"
                    aria-label={`Edit ${supplier.name}`}
                    onClick={() => setEditing(supplier)}
                  >
                    <Icon name="edit" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!table.rows.length && <EmptyRow columns={7} query={table.query} />}
          </tbody>
        </table>
      </TablePanel>
      <Pagination table={table} />
      {editing && (
        <SupplierForm
          record={editing.id ? editing : undefined}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
      <Notice message={notice} onClose={() => setNotice("")} />
    </>
  );
}
