import dotenv from "dotenv";
import Server from "./server";

dotenv.config();

const server = new Server();
const PORT = Number(process.env.PORT || 3000);

server.app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
