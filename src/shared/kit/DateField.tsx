import { Field, type FieldProps } from "./Field";

/** Native date input in the branded field, with a calendar glyph. */
export function DateField(props: Omit<FieldProps, "type" | "iconStart">) {
  return <Field {...props} type="date" iconStart="calendar" />;
}
