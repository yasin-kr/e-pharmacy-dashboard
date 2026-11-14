import { useData } from "../context/DataContext";
import {
  EmptyRow,
  FilterBar,
  Pagination,
  Person,
  Status,
  TablePanel,
  useTableData,
} from "../components/Table";
import { formatDate, formatMoney } from "../utils/format";

export default function OrdersPage() {
  const { orders } = useData();
  const table = useTableData(orders);
  return (
    <>
      <FilterBar table={table} />
      <TablePanel title="All orders">
        <table className="orders-table">
          <thead>
            <tr>
              {[
                "User Info",
                "Address",
                "Products",
                "Order date",
                "Price",
                "Status",
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((order) => (
              <tr key={order.id}>
                <td>
                  <Person person={order} />
                </td>
                <td>{order.address}</td>
                <td>
                  {Array.isArray(order.products)
                    ? order.products.length
                    : order.products}
                </td>
                <td>{formatDate(order.date)}</td>
                <td>{formatMoney(order.price)}</td>
                <td>
                  <Status value={order.status} />
                </td>
              </tr>
            ))}
            {!table.rows.length && <EmptyRow columns={6} query={table.query} />}
          </tbody>
        </table>
      </TablePanel>
      <Pagination table={table} />
    </>
  );
}
