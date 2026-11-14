import { useId } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "./Modal";
import { categories as productCategories } from "../data/seed";

const requiredText = (label, max = 120) =>
  yup
    .string()
    .trim()
    .required(`${label} is required`)
    .max(max, `Use ${max} characters or fewer`);

const nonnegativeNumber = (label) =>
  yup
    .number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError(`Enter a valid ${label.toLowerCase()}`)
    .required(`${label} is required`)
    .min(0, `${label} cannot be negative`)
    .max(Number.MAX_SAFE_INTEGER, `${label} is too large`);

const calendarDate = (label) =>
  requiredText(label).test("valid-date", "Enter a valid date", (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  });

const supplierSchema = yup.object({
  name: requiredText("Supplier name"),
  address: requiredText("Address", 240),
  company: requiredText("Company"),
  deliveryDate: calendarDate("Delivery date"),
  amount: nonnegativeNumber("Amount"),
  status: yup
    .string()
    .oneOf(["Active", "Deactive"], "Select a status")
    .required("Status is required"),
});

const customerSchema = yup.object({
  name: requiredText("Customer name"),
  email: requiredText("Email", 254).email("Enter a valid email address"),
  address: requiredText("Address", 240),
  phone: requiredText("Phone", 30)
    .matches(/^\+?[\d\s().-]+$/, "Enter a valid phone number")
    .test("phone-digits", "Use 7 to 15 digits", (value) => {
      const digits = (value || "").replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }),
  registerDate: calendarDate("Register date"),
});

function FormField({
  name,
  label,
  register,
  error,
  type = "text",
  options,
  ...inputProps
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const attributes = {
    id: inputId,
    "aria-required": true,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    ...register(name),
    ...inputProps,
  };

  return (
    <div className={`record-field record-field-${name}`}>
      <label htmlFor={inputId} className="record-field-label">
        {label}
      </label>
      {options ? (
        <select {...attributes}>
          <option value="" disabled>
            {label}
          </option>
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input {...attributes} type={type} placeholder={label} />
      )}
      {error && (
        <p id={errorId} className="record-field-error">
          {error.message}
        </p>
      )}
    </div>
  );
}

function RecordForm({
  title,
  defaults,
  schema,
  fields,
  onSubmit,
  onClose,
  editing,
  className = "",
}) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaults,
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  async function submit(values) {
    clearErrors("root");
    try {
      await onSubmit(values);
    } catch (error) {
      setError("root", {
        message: error?.message || "Unable to save changes. Please try again.",
      });
      return;
    }
    onClose();
  }

  return (
    <Modal title={title} onClose={onClose} busy={isSubmitting}>
      <form
        className={`record-form ${className}`}
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        <fieldset className="record-fields" disabled={isSubmitting}>
          <legend className="record-field-label">{title}</legend>
          {fields.map((field) => (
            <FormField
              key={field.name}
              {...field}
              register={register}
              error={errors[field.name]}
            />
          ))}
        </fieldset>
        {errors.root && (
          <p className="record-submit-error" role="alert">
            {errors.root.message}
          </p>
        )}
        <div className="record-form-actions">
          <button
            className="record-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : editing ? "Save" : "Add"}
          </button>
          <button
            className="record-cancel"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ProductForm({ record, onSubmit, onClose }) {
  const categories = [...productCategories];
  if (record?.category && !categories.includes(record.category))
    categories.push(record.category);

  const schema = yup.object({
    name: requiredText("Product name"),
    category: yup
      .string()
      .oneOf(categories, "Select a category")
      .required("Category is required"),
    stock: nonnegativeNumber("Stock").integer("Stock must be a whole number"),
    supplier: requiredText("Supplier"),
    price: nonnegativeNumber("Price"),
  });

  return (
    <RecordForm
      title={record ? "Edit product" : "Add a new product"}
      className="product-form"
      defaults={{
        name: record?.name ?? "",
        category: record?.category ?? "",
        stock: record?.stock ?? "",
        supplier: record?.supplier ?? "",
        price: record?.price ?? "",
      }}
      schema={schema}
      fields={[
        { name: "name", label: "Product Info", maxLength: 120 },
        { name: "category", label: "Category", options: categories },
        {
          name: "stock",
          label: "Stock",
          type: "number",
          min: 0,
          step: 1,
          inputMode: "numeric",
        },
        { name: "supplier", label: "Suppliers", maxLength: 120 },
        {
          name: "price",
          label: "Price",
          type: "number",
          min: 0,
          step: "0.01",
          inputMode: "decimal",
        },
      ]}
      onSubmit={onSubmit}
      onClose={onClose}
      editing={Boolean(record)}
    />
  );
}

export function SupplierForm({ record, onSubmit, onClose }) {
  return (
    <RecordForm
      title={record ? "Edit supplier" : "Add a new supplier"}
      defaults={{
        name: record?.name ?? "",
        address: record?.address ?? "",
        company: record?.company ?? "",
        deliveryDate: record?.deliveryDate ?? "",
        amount: record?.amount ?? "",
        status: record?.status ?? "",
      }}
      schema={supplierSchema}
      fields={[
        { name: "name", label: "Suppliers Info", maxLength: 120 },
        { name: "address", label: "Address", maxLength: 240 },
        { name: "company", label: "Company", maxLength: 120 },
        { name: "deliveryDate", label: "Delivery date", type: "date" },
        {
          name: "amount",
          label: "Amount",
          type: "number",
          min: 0,
          step: "0.01",
          inputMode: "decimal",
        },
        { name: "status", label: "Status", options: ["Active", "Deactive"] },
      ]}
      onSubmit={onSubmit}
      onClose={onClose}
      editing={Boolean(record)}
    />
  );
}

export function CustomerForm({ record, onSubmit, onClose }) {
  return (
    <RecordForm
      title="Edit customer"
      defaults={{
        name: record?.name ?? "",
        email: record?.email ?? "",
        address: record?.address ?? "",
        phone: record?.phone ?? "",
        registerDate: record?.registerDate ?? "",
      }}
      schema={customerSchema}
      fields={[
        {
          name: "name",
          label: "User Info",
          maxLength: 120,
          autoComplete: "name",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          maxLength: 254,
          autoComplete: "email",
        },
        {
          name: "address",
          label: "Address",
          maxLength: 240,
          autoComplete: "street-address",
        },
        {
          name: "phone",
          label: "Phone",
          type: "tel",
          maxLength: 30,
          autoComplete: "tel",
        },
        { name: "registerDate", label: "Register date", type: "date" },
      ]}
      onSubmit={onSubmit}
      onClose={onClose}
      editing
    />
  );
}
