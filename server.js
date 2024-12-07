import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Servir imágenes desde la carpeta raíz `/uploads`
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif)"));
    }
  },
});

// Leer y escribir datos en `db.json`
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

// Rutas de la API
app.get("/events", (req, res) => {
  const data = readData();
  res.json(data.events);
});

app.post("/events", upload.single("imagen"), (req, res) => {
  const data = readData();
  const { Titulo, Descripcion, FechaInicio, FechaFinal, Filial } = req.body;
  const newEvent = {
    id: Date.now(),
    Titulo,
    Descripcion,
    FechaInicio,
    FechaFinal,
    Filial,
    imagen: req.file ? `/uploads/${req.file.filename}` : null,
  };
  data.events.push(newEvent);
  writeData(data);
  res.status(201).json(newEvent);
});

app.put("/events/:id", upload.single("imagen"), (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const eventIndex = data.events.findIndex((event) => event.id === id);
  if (eventIndex !== -1) {
    const { Titulo, Descripcion, FechaInicio, FechaFinal, Filial } = req.body;
    const updatedEvent = {
      ...data.events[eventIndex],
      Titulo,
      Descripcion,
      FechaInicio,
      FechaFinal,
      Filial,
      imagen: req.file ? `/uploads/${req.file.filename}` : data.events[eventIndex].imagen,
    };
    data.events[eventIndex] = updatedEvent;
    writeData(data);
    res.json({ message: "Evento actualizado con éxito", updatedEvent });
  } else {
    res.status(404).json({ message: "Evento no encontrado" });
  }
});

app.delete("/events/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const eventIndex = data.events.findIndex((event) => event.id === id);
  if (eventIndex !== -1) {
    const [deletedEvent] = data.events.splice(eventIndex, 1);
    if (deletedEvent.imagen) {
      const imagePath = path.join(__dirname, deletedEvent.imagen);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    writeData(data);
    res.json({ message: "Evento eliminado con éxito" });
  } else {
    res.status(404).json({ message: "Evento no encontrado" });
  }
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
