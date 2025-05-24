import { sql } from "../config/db.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await sql`
            SELECT * FROM products
            ORDER BY created_at DESC
        `;
    console.log("Products fetched successfully:", products);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error in getAllProducts controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, image } = req.body;
  if (!name || !price || !image) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const newProduct = await sql`
            INSERT INTO products (name, price, image)   
            VALUES (${name}, ${price}, ${image})
            RETURNING *
        `; // returns an array so select first element
    res.status(201).json({ success: true, data: newProduct[0] });
    console.log("Product created successfully:", newProduct[0]);
  } catch (error) {
    console.error("Error in createProduct controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await sql`
                SELECT * FROM products
                WHERE id = ${id}
            `;
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product[0] });
  } catch (error) {
    console.error("Error in getProduct controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;
  try {
    const updatedProduct = await sql`
            UPDATE products
            SET name = ${name}, price = ${price}, image = ${image}
            WHERE id = ${id}
            RETURNING *`;
    if (updatedProduct.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ success: true, data: updatedProduct[0] });
    console.log("Product updated successfully:", updatedProduct[0]);
  } catch (error) {
    console.error("Error in updateProduct controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProdcut = await sql`
        DELETE FROM products WHERE id = ${id} RETURNING *`;
    if (deletedProdcut.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ success: true, data: deletedProdcut[0] });
    console.log("Product deleted successfully");
  } catch (error) {
    console.error("Error in deleteProduct controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
