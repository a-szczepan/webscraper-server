const express = require("express");
const product = require("../controller/productController");

exports.prepareRouter = () => {
  const router = express.Router();

  router.get("/products/", product.getProducts);
  router.get("/product/categories", product.getCategories);
  router.get("/product/:name", product.getProductInfoByName);
  router.post("/product", product.createProduct);
  router.put("/product/:id", product.updateProduct);
  router.delete("/product/:id", product.deleteProduct);

  return router;
};
