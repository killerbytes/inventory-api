export const getSKU = (name, category, unit, values) => {
  console.log(66, name, category, unit, values);

  const clean = (str) =>
    str
      .normalize("NFD") // normalize accented characters
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "") // remove special characters
      .toUpperCase();

  const parts = [
    clean(name),
    `CAT${category}`,
    clean(unit),
    ...values.map((val) => clean(val.value)),
  ];

  return parts.join("-");
};
