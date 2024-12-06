import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const readData = () => {
  try {
    const data = fs.readFileSync("./db.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer db.json:", error);
    return { events: [] };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error al escribir en db.json:", error);
  }
};

app.get("/events", (req, res) => {
  const data = readData();
  res.json(data.events);
});

app.post("/events", (req, res) => {
  const data = readData();
  const newEvent = { id: Date.now(), ...req.body };
  data.events.push(newEvent);
  writeData(data);
  res.status(201).json(newEvent);
});

app.put("/events/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const eventIndex = data.events.findIndex((event) => event.id === id);
  if (eventIndex !== -1) {
    data.events[eventIndex] = { ...data.events[eventIndex], ...req.body };
    writeData(data);
    res.json({ message: "Evento actualizado con éxito" });
  } else {
    res.status(404).json({ message: "Evento no encontrado" });
  }
});

app.delete("/events/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const eventIndex = data.events.findIndex((event) => event.id === id);
  if (eventIndex !== -1) {
    data.events.splice(eventIndex, 1);
    writeData(data);
    res.json({ message: "Evento eliminado con éxito" });
  } else {
    res.status(404).json({ message: "Evento no encontrado" });
  }
});

app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
