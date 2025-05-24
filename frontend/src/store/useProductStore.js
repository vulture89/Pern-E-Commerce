import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "";

export const useProductStore = create((set, get) => ({
  // Product State
  products: [],
  loading: false,
  error: null,
  currentProduct: null,

  fetchProduct: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${BASE_URL}/api/products/${id}`);
      set({
        currentProduct: response.data.data,
        formData: response.data.data, // prefill the form with current product data
        error: null,
      });
    } catch (err) {
      console.log("Error fetching product:", err);
      set({
        error: "An error occurred while fetching the product.",
        currentProduct: null,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${BASE_URL}/api/products`);
      set({ products: response.data.data, error: null });
    } catch (err) {
      if (err.status == 429) {
        set({
          error: "Too many requests. Please try again later.",
          products: [],
        });
      } else {
        set({
          error: "An error occurred while fetching products.",
          products: [],
        });
      }
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id) => {
    set({ loading: true });
    try {
      const { formData } = get();
      const response = await axios.put(
        `${BASE_URL}/api/products/${id}`,
        formData
      );
      set({ currentProduct: response.data.data });
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error("An error occurred while updating the product.");
      console.log("Error updating product:", error);
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`${BASE_URL}/api/products/${id}`);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
      }));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.log("Error deleting product:", error);
      toast.error("An error occurred while deleting the product.");
    } finally {
      set({ loading: false });
    }
  },

  // Form State
  formData: {
    name: "",
    price: "",
    image: "",
  },

  setFormData: (formData) => {
    set({ formData });
  },

  resetFormData: () => {
    set({
      formData: {
        name: "",
        price: "",
        image: "",
      },
    });
  },

  addProduct: async (e) => {
    e.preventDefault();
    set({ loading: true });
    try {
      const { formData } = get();
      await axios.post(`${BASE_URL}/api/products`, formData);
      await get().fetchProducts();
      get().resetFormData();
      toast.success("Product added successfully");
      document.getElementById("addProductModal").close();
    } catch (error) {
      console.log("Error adding product:", error);
      toast.error("An error occurred while adding the product.");
    } finally {
      set({ loading: false });
    }
  },
}));
