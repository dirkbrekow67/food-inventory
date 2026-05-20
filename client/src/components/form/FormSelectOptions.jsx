export function renderSelectOptions(options) {
  return options.map((option) => (
    <option value={option.value} key={option.value}>
      {option.label}
    </option>
  ));
}
