const { Product } = require("../model/productModel");

exports.getProducts = (req, res) => {
  const queryFilters = req.query.filters
    ? JSON.parse(JSON.stringify(req.query.filters))
    : undefined;
  const page = JSON.parse(req.query?.page) - 1;
  const resultNum = 24;
  const filters = {
    name: queryFilters.keyWords
      ? `^${queryFilters.keyWords
          .split(" ")
          .map((element) => `(?=.*\\b${element.trim()}\\b)`)
          .join("")}.*$`
      : null,
    brands: queryFilters.brands
      ? queryFilters.brands
          .split(",")
          .map((element) => element.toUpperCase().trim())
      : null,
    category: queryFilters.category
      ? `${queryFilters.category}$|${queryFilters.category}---$`
      : null,
    contain: queryFilters.contain ? queryFilters.contain.split(",") : null,
    notContain: queryFilters.notContain
      ? queryFilters.notContain.split(",")
      : null,
  };
  const definedFilters = {};
  Object.entries(filters).forEach(([key, value]) =>
    value ? (definedFilters[key] = value) : null
  );
  let searchFilters = {
    name: definedFilters.name
      ? { $regex: definedFilters.name, $options: "igm" }
      : { $regex: "." },
    brand: definedFilters.brands
      ? { $in: definedFilters.brands }
      : { $regex: "." },
    category: definedFilters.category
      ? { $regex: definedFilters.category, $options: "igm" }
      : { $regex: "." },
  };
  definedFilters.contain || definedFilters.notContain
    ? (searchFilters["$and"] = [])
    : null;
  searchFilters["$and"]
    ? definedFilters.contain?.map((ingredient) =>
        searchFilters["$and"].push({
          inci: { $regex: `${ingredient}`, $options: "igm" },
        })
      )
    : null;
  searchFilters["$and"]
    ? definedFilters.notContain?.map((ingredient) =>
        searchFilters["$and"].push({
          inci: { $regex: `^((?!${ingredient}).)*$`, $options: "igm" },
        })
      )
    : null;

  Product.aggregate([
    { $match: searchFilters },
    {
      $facet: {
        totalData: [{ $skip: resultNum * page }, { $limit: resultNum }],
        totalCount: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]).exec(function (err, doc) {
    if (err) {
      return res.status(404).json({ message: "getProducts error" });
    } else {
      return res
        .status(200)
        .send([[...doc[0].totalData], { all: doc[0].totalCount[0].count }]);
    }
  });
};

exports.getProductInfoByName = (req, res) => {
  const name = req.params.name;
  Product.findOne({ name: name }, (err, doc) => {
    if (err) {
      return res.status(404).json({ message: "getProductInfoByName error" });
    } else {
      return res.status(200).json({ doc });
    }
  });
};

exports.createProduct = (req, res) => {
  const data = req.body;
  const product = new Product(data);
  product.save((err, doc) => {
    if (err) {
      return res.status(404).json({ message: "createProduct error" });
    } else {
      return res.status(200).json(doc);
    }
  });
};

exports.updateProduct = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Product.findByIdAndUpdate(
    id,
    { $set: data },
    { returnDocument: "after" },
    (err, doc) => {
      if (err) {
        return res.status(404).json({ message: "updateProduct error" });
      } else if (!doc) {
        return res.status(404).json({ message: "Product doesn't exist" });
      } else {
        return res.status(201).json(doc);
      }
    }
  );
};

exports.deleteProduct = (req, res) => {
  const id = req.params.id;
  Product.findByIdAndDelete(id, (err, doc) => {
    if (err) {
      return res.status(404).json({ message: "updateProduct error" });
    } else if (!doc) {
      return res.status(404).json({ message: "Product doesn't exist" });
    } else {
      return res.status(201).json(doc);
    }
  });
};

exports.getCategories = (req, res) => {
  Product.find().distinct("category", (err, doc) => {
    if (err) {
      return res.status(404).json({ message: "getCategories error" });
    } else if (!doc) {
      return res.status(404).json({ message: "Doc doesn't exist" });
    } else {
      doc = [
        ...new Set(
          doc.map((e) => e.split("---")[0].split("Włosy-Pielęgnacja-")[1])
        ),
      ];
      return res.status(201).json(doc);
    }
  });
};
