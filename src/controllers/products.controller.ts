
import { Request, Response } from "express";
import pool from "../conf/dbConnection";

const validId = (id: any) =>
  /^\d+$/.test(String(id)) &&
  Number.isSafeInteger(Number(id)) &&
  Number(id) > 0;

const validPrice = (price: any) =>
  (typeof price === "number" ||
    (typeof price === "string" && price.trim() !== "")) &&
  Number.isFinite(Number(price)) &&
  Number(price) > 0 &&
  /^\d+(\.\d{1,2})?$/.test(String(price));

const validProduct = (body: any) =>
  body &&
  typeof body.name === "string" &&
  body.name.trim() !== "" &&
  validPrice(body.price) &&
  Number.isInteger(Number(body.stock)) &&
  body.stock !== "" &&
  Number(body.stock) >= 0 &&
  typeof body.description === "string" &&
  (body.brand == null || typeof body.brand === "string") &&
  (body.img == null || typeof body.img === "string");

const handleError = (res: Response, error: any) => {
  console.error("Error en la operación de productos");
  return res.status(500).json({
    message: "Error interno del servidor o de la base de datos"
  });
};

// GET: obtener todos los productos activos
export const getAll = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(
      "SELECT * FROM products WHERE active = TRUE"
    );

    res.status(200).json(rows);
  } catch (error) {
    handleError(res, error);
  }
};

// GET: obtener un producto activo por ID
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [rows]: any = await pool.execute(
      "SELECT * FROM products WHERE id = ? AND active = TRUE",
      [Number(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    handleError(res, error);
  }
};

// POST: crear producto
export const create = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!validProduct(body)) {
      return res.status(400).json({
        message: "Datos inválidos. Revisa nombre, precio, stock y descripción"
      });
    }

    const { name, price, stock, description, brand, img } = body;

    const [result]: any = await pool.execute(
      `INSERT INTO products
      (name, price, stock, description, brand, img, active)
      VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        name.trim(),
        Number(price),
        Number(stock),
        description,
        brand ?? null,
        img ?? null
      ]
    );

    res.status(201).json({
      message: "Producto creado correctamente",
      id: result.insertId
    });
  } catch (error) {
    handleError(res, error);
  }
};

// PUT: actualizar todos los datos del producto
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (!validId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (!validProduct(body)) {
      return res.status(400).json({
        message: "Los datos del producto son inválidos"
      });
    }

    const { name, price, stock, description, brand, img } = body;

    const [result]: any = await pool.execute(
      `UPDATE products SET
      name = ?, price = ?, stock = ?, description = ?,
      brand = ?, img = ?
      WHERE id = ? AND active = TRUE`,
      [
        name.trim(),
        Number(price),
        Number(stock),
        description,
        brand ?? null,
        img ?? null,
        Number(id)
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE: baja lógica; no borra la fila
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [result]: any = await pool.execute(
      "UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto dado de baja correctamente" });
  } catch (error) {
    handleError(res, error);
  }
};

// PATCH: cambiar solamente el precio
export const changePrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!validId(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (!validPrice(price)) {
      return res.status(400).json({
        message: "El precio debe ser numérico, mayor que cero y tener máximo dos decimales"
      });
    }

    const [result]: any = await pool.execute(
      "UPDATE products SET price = ? WHERE id = ? AND active = TRUE",
      [Number(price), Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Precio actualizado correctamente" });
  } catch (error) {
    handleError(res, error);
  }
};
