const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const Brand = require("../../models/brandSchema");
const User = require("../../models/userSchema");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const getProductAddPage = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });
    res.render("product-add", {
      cat: category,
      brand: brand,
    });
  } catch (error) {
    console.log("error in loading productadd page", error);
    res.redirect("/pageerror");
  }
};

const addProducts = async (req, res) => {
  try {
    const products = req.body;
    const productExists = await Product.findOne({
      productName: products.productName,
    });
    if (!productExists) {
      const images = [];
      console.log(req.files);
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const originalImagePath = req.files[i].path;
          const resizedImagePath = path.join(
            "public",
            "uploads",
            "product-images",
            req.files[i].filename
          );
          await sharp(originalImagePath)
            .resize({ width: 440, height: 440 })
            .toFile(resizedImagePath);
          images.push(req.files[i].filename);
        }
      }
      const categoryId = await Category.findOne({ name: products.category });

      if (!categoryId) {
        return res.status(400).json("Invalid Category name");
      }

      const newproduct = new Product({
        productName: products.productName,
        description: products.description,
        brand: products.brand,
        category: categoryId._id,
        regularPrice: products.regularPrice,
        saleprice: products.salePrice,
        createdOn: new Date(),
        quantity: products.quantity,
        color: products.color,
        productImage: images,
        status: "Available",
      });
      await newproduct.save();
      return res.redirect("/admin/addProducts");
    } else {
      return res
        .status(400)
        .json("Product already exist.please try with another name");
    }
  } catch (error) {
    console.log("Error saving product", error);
    return res.redirect("/admin/pageerror");
  }
};

const getAllProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = req.query.page || 1;
    const limit = 4;

    const productData = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
        { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("category")
      .exec();

    const count = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
        { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
      ],
    }).countDocuments();

    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });

    if (category && brand) {
      res.render("products", {
        data: productData,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        cat: category,
        brand: brand,
      });
    } else {
      res.render("page-404");
    }
  } catch (error) {
    console.log("Error in loading products page", error);
    res.redirect("/pageerror");
  }
};

const blockProduct = async (req, res) => {
  try {
    let id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/products");
  } catch (error) {
    console.log("Error in blocking product", error);
    res.redirect("/pageerror");
  }
};

const unblockProduct = async (req, res) => {
  try {
    let id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/products");
  } catch (error) {
    console.log("error in unblocking product", error);
    res.redirect("/pageerror");
  }
};

const getEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findOne({ _id: id });
    const category = await Category.find({});
    const brand = await Brand.find({});

    res.render("edit-product", {
      product: product,
      cat: category,
      brand: brand,
    });
  } catch (error) {
    console.log("error in loading edit product", error);
    res.redirect("/pageerror");
  }
};

const editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ _id: id });
    const data = req.body;
    const existingProduct = await Product.findOne({
      productName: data.productName,
      _id: { $ne: id },
    });
    if (existingProduct) {
      return res.status(400).json({ error: "Product with this name exists" });
    }
    const images = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        images.push(req.files[i].filename);
      }
    }

    const updateFields = {
      productName: data.productName,
      description: data.description,
      brand: data.brand,
      category: product.category,
      regularPrice: data.regularPrice,
      saleprice: data.salePrice,
      quantity: data.quantity,
      color: data.color,
    };
    if (req.files.length > 0) {
      updateFields.$push = { productImage: { $each: images } };
    }
    await Product.findByIdAndUpdate(id, updateFields, { new: true });
    res.redirect("/admin/products");
  } catch (error) {
    console.log("error in editing products", error);
    res.redirect("/pageerror");
  }
};

const deleteSingleImage = async (req, res) => {
  try {
    const { imageNameToServer, productIdToServer } = req.body;

    // Fetch product and check image count
    const theProduct = await Product.findById(productIdToServer);
    if (!theProduct) return res.status(404).json({ message: "Product not found" });

    if (theProduct.productImage.length <= 3) {
      return res.json({ message: "Product should contain a minimum of 3 images" });
    }

    // Remove image from productImage array
    await Product.findByIdAndUpdate(productIdToServer, { $pull: { productImage: imageNameToServer } });

    // Delete image file from server
    const imagePath = path.join("public", "uploads", "re-image", imageNameToServer);
    fs.unlink(imagePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error(`Error deleting image ${imageNameToServer}:`, err);
      } else {
        console.log(`Image ${imageNameToServer} deleted successfully`);
      }
    });

    res.json({ status: true });
  } catch (error) {
    console.error("Error in deleting product image:", error);
    res.redirect("/pageerror");
  }
};

module.exports = {
  getProductAddPage,
  addProducts,
  getAllProducts,
  unblockProduct,
  blockProduct,
  getEditProduct,
  editProduct,
  deleteSingleImage,
};
