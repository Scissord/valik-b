export const buildTree = (categories, parentId) => {
  return categories
    .filter(cat => +cat.parent_id === +parentId)
    .map(cat => {
      const children = buildTree(categories, cat.id);

      return {
        ...cat,
        children
      };
    });
};
