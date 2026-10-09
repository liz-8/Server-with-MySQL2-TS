import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../conf/dbConnection";

// ---------- Validaciones ----------
const parseId = (value: string): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const isValidPrice = (price: unknown): price is number =>
  typeof price === "number" && Number.isFinite(price) && price > 0;

const serverError = (res: Response, error: unknown) => {
  console.error(error); // el detalle solo queda en el log del servidor
  return res.status(500).json({ message: "Error interno del servidor" });
};

// ---------- GET /getAll?active=TRUE ----------
export const getAll = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE active = ?",
      [true]
    );
    return res.status(200).json(rows);
  } catch (error) {
    return serverError(res, error);
  }
};

// ---------- GET /getById/:id ----------
export const getById = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: "ID inválido" });

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE id = ? AND active = ?",
      [id, true]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Producto no encontrado" });
    return res.status(200).json(rows[0]);
  } catch (error) {
    return serverError(res, error);
  }
};

// ---------- POST /create ----------
export const create = async (req: Request, res: Response) => {
  const { name, price, stock, description, brand, img } = req.body ?? {};

  if (!name || typeof name !== "string" || !description || typeof description !== "string")
    return res.status(400).json({ message: "name y description son obligatorios" });
  if (!isValidPrice(price))
    return res.status(400).json({ message: "price debe ser numérico y mayor que cero" });
  if (!Number.isInteger(stock) || stock < 0)
    return res.status(400).json({ message: "stock debe ser un entero válido" });

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)",
      [name, price, stock, description, brand ?? null, img ?? null]
    );
    return res.status(201).json({ message: "Producto creado", id: result.insertId });
  } catch (error) {
    return serverError(res, error);
  }
};

// ---------- PUT /update/:id ----------
export const update = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: "ID inválido" });

  const { name, price, stock, description, brand, img } = req.body ?? {};

  if (!name || typeof name !== "string" || !description || typeof description !== "string")
    return res.status(400).json({ message: "name y description son obligatorios" });
  if (!isValidPrice(price))
    return res.status(400).json({ message: "price debe ser numérico y mayor que cero" });
  if (!Number.isInteger(stock) || stock < 0)
    return res.status(400).json({ message: "stock debe ser un entero válido" });

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE products
       SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ?
       WHERE id = ? AND active = ?`,
      [name, price, stock, description, brand ?? null, img ?? null, id, true]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Producto no encontrado" });
    return res.status(200).json({ message: "Producto actualizado" });
  } catch (error) {
    return serverError(res, error);
  }
};

// ---------- DELETE /delete/:id (baja lógica) ----------
export const remove = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: "ID inválido" });

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE products SET active = ? WHERE id = ? AND active = ?",
      [false, id, true]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Producto no encontrado" });
    return res.status(200).json({ message: "Producto dado de baja" });
  } catch (error) {
    return serverError(res, error);
  }
};

// ---------- PATCH /change-price/:id ----------
export const changePrice = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: "ID inválido" });

  const body = req.body ?? {};
  if (Object.keys(body).length !== 1 || !("price" in body))
    return res.status(400).json({ message: "El cuerpo debe contener solamente price" });
  if (!isValidPrice(body.price))
    return res.status(400).json({ message: "price debe ser numérico y mayor que cero" });

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE products SET price = ? WHERE id = ? AND active = ?",
      [body.price, id, true]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Producto no encontrado" });
    return res.status(200).json({ message: "Precio actualizado" });
  } catch (error) {
    return serverError(res, error);
  }
};
