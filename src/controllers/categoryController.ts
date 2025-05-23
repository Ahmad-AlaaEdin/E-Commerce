import {
  getAll,
  createOne,
  updateOne,
  deleteOne,
  getOne,
} from "../controllers/factoryHandler";

export const createCategory = createOne("category");

export const getCategories = getAll("category");

export const getCategory = getOne("category", { subCategories: true });

export const deleteCategory = deleteOne("category");

export const updateCategory = updateOne("category");
