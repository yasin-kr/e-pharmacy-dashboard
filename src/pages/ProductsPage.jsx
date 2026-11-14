import { useState } from "react";
import { useData } from "../context/DataContext";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import { ProductForm } from "../components/RecordForms";
import {
  EmptyRow,
  FilterBar,
  Notice,
  Pagination,
  TablePanel,
  useTableData,
} from "../components/Table";
import { formatMoney } from "../utils/format";

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const table = useTableData(products);

  async function save(values) {
    if (editing.id) await updateProduct(editing.id, values);
    else await addProduct(values);
    setNotice(editing.id ? "Product updated." : "Product added.");
    if (!editing.id) table.reset();
  }
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await deleteProduct(deleting.id);
      setDeleting(null);
      setNotice("Product deleted.");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <FilterBar table={table} placeholder="Product Name">
        <button
          type="button"
          className="add-product"
          onClick={() => setEditing({})}
        >
          <span>
            <Icon name="plus" />
          </span>
          Add a new product
        </button>
      </FilterBar>
      <TablePanel title="All products">
        <table className="products-table">
          <thead>
            <tr>
              {[
                "Product Info",
                "Category",
                "Stock",
                "Suppliers",
                "Price",
                "Action",
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((product) => (
              <tr key={product.id}>
                <td>
                  <span className="cell-ellipsis" title={product.name}>
                    {product.name}
                  </span>
                </td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>
                  <span className="cell-ellipsis" title={product.supplier}>
                    {product.supplier}
                  </span>
                </td>
                <td>{formatMoney(product.price)}</td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="action-button"
                      aria-label={`Edit ${product.name}`}
                      title="Edit product"
                      onClick={() => setEditing(product)}
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="action-button action-danger"
                      aria-label={`Delete ${product.name}`}
                      title="Delete product"
                      onClick={() => {
                        setError("");
                        setDeleting(product);
                      }}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!table.rows.length && <EmptyRow columns={6} query={table.query} />}
          </tbody>
        </table>
      </TablePanel>
      <Pagination table={table} />
      {editing && (
        <ProductForm
          record={editing.id ? editing : undefined}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <Modal
          title="Delete product?"
          onClose={() => setDeleting(null)}
          busy={busy}
        >
          <p className="confirm-description">
            “{deleting.name}” will be removed from your products.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="confirm-actions">
            <button
              className="button button-danger"
              onClick={remove}
              disabled={busy}
            >
              {busy ? "Deleting…" : "Delete"}
            </button>
            <button
              className="button button-secondary"
              onClick={() => setDeleting(null)}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
      <Notice message={notice} onClose={() => setNotice("")} />
    </>
  );
}
