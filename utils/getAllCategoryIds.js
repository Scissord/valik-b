export const getAllCategoryIds = category => {
  const ids = [category.id];
  for (const child of category.children) {
    ids.push(...getAllCategoryIds(child));
  }
  return ids;
};
