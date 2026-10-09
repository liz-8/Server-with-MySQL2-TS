import express from "express";
import routes from "./routes";

class Server {
  public app: any;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  config() {
    this.app.use(express.json());
  }

  routes() {
    this.app.get("/", (req: any, res: any) => {
      res.status(200).json({
        message: "API de productos funcionando"
      });
    });

    this.app.use("/api/v1", routes);
  }
}

export default Server;
