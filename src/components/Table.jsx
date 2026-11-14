import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "./Icon";

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function Person({ person, onClick }) {
  const content = (
    <>
      <img
        src={`/images/avatar-${Number.isInteger(person.avatar) ? person.avatar % 5 : 0}.png`}
        alt=""
        width="36"
        height="36"
        loading="lazy"
      />
      <span>{person.name}</span>
    </>
  );
  return onClick ? (
    <button type="button" className="person person-button" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="person">{content}</div>
  );
}

export function Status({ value }) {
  return (
    <span className={`status status-${String(value).toLowerCase()}`}>
      {value}
    </span>
  );
}

export function TablePanel({ title, children, className = "" }) {
  return (
    <section className={`table-panel ${className}`} aria-label={title}>
      <h2 className="panel-title">{title}</h2>
      <div
        className="table-scroll"
        tabIndex="0"
        role="region"
        aria-label={`${title} table`}
      >
        {children}
      </div>
    </section>
  );
}

export function EmptyRow({ columns, query }) {
  return (
    <tr>
      <td colSpan={columns} className="empty-state">
        <p>{query ? `No results for “${query}”` : "No records yet"}</p>
        <span>
          {query
            ? "Try another name or clear your filter."
            : "Your records will appear here."}
        </span>
      </td>
    </tr>
  );
}

export function useTableData(records, pageSize = 5) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [input, setInput] = useState(query);
  useEffect(() => {
    setInput(query);
  }, [query]);
  const filtered = records.filter((record) =>
    record.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const requestedPage = Number(searchParams.get("page"));
  const page = Math.min(
    Math.max(Number.isInteger(requestedPage) ? requestedPage : 1, 1),
    Math.max(pageCount, 1),
  );
  function setPage(nextPage) {
    const next = new URLSearchParams(searchParams);
    if (nextPage > 1) next.set("page", String(nextPage));
    else next.delete("page");
    setSearchParams(next);
  }
  function filter(event) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (input.trim()) next.set("q", input.trim());
    else next.delete("q");
    next.delete("page");
    setSearchParams(next);
  }
  function reset() {
    setInput("");
    setSearchParams({});
  }
  return {
    rows: filtered.slice((page - 1) * pageSize, page * pageSize),
    input,
    setInput,
    query,
    filter,
    reset,
    page,
    pageCount,
    setPage,
  };
}

export function FilterBar({ table, placeholder = "User Name", children }) {
  return (
    <div className="toolbar">
      <form className="filter-form" onSubmit={table.filter} role="search">
        <div className="filter-input-wrap">
          <label className="sr-only" htmlFor="name-filter">
            {placeholder}
          </label>
          <input
            id="name-filter"
            type="search"
            placeholder={placeholder}
            value={table.input}
            onChange={(event) => table.setInput(event.target.value)}
            maxLength="120"
          />
          {table.query && (
            <button
              type="button"
              className="clear-filter"
              aria-label="Clear filter"
              onClick={table.reset}
            >
              <Icon name="close" />
            </button>
          )}
        </div>
        <button type="submit" className="button button-primary filter-button">
          <Icon name="filter" />
          Filter
        </button>
      </form>
      {children}
    </div>
  );
}

export function Pagination({ table }) {
  if (table.pageCount <= 1) return null;
  const start = Math.min(
    Math.max(table.page - 3, 1),
    Math.max(table.pageCount - 6, 1),
  );
  const pages = Array.from(
    { length: Math.min(table.pageCount, 7) },
    (_, index) => start + index,
  );
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination-arrow"
        disabled={table.page === 1}
        onClick={() => table.setPage(table.page - 1)}
        aria-label="Previous page"
      >
        <Icon name="chevron" className="reverse" />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          aria-label={`Page ${page}`}
          aria-current={page === table.page ? "page" : undefined}
          className={`page-dot${page === table.page ? " selected" : ""}`}
          onClick={() => table.setPage(page)}
        >
          <span className="sr-only">{page}</span>
        </button>
      ))}
      <button
        className="pagination-arrow"
        disabled={table.page === table.pageCount}
        onClick={() => table.setPage(table.page + 1)}
        aria-label="Next page"
      >
        <Icon name="chevron" />
      </button>
    </nav>
  );
}

export function Notice({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timeout = setTimeout(onClose, 4500);
    return () => clearTimeout(timeout);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <Icon name="check" />
      <span>{message}</span>
      <button
        className="icon-button"
        aria-label="Dismiss notification"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
    </div>
  );
}
