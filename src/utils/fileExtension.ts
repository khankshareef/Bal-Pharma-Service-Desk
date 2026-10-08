export const fileExtension = (value: string): string => {
  const filename = value.split(/[?#]/, 1)[0].split(/[\\/]/).pop() ?? "";
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
};
