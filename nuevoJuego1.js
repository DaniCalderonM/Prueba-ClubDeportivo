const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

app.use(express.json());

// Ruta /nuevoJuego
app.get("/nuevoJuego", (req, res) => {
    // Se extraen parámetros de la URL
    const { nombre, consola } = req.query;
    // Manejo de error si falta alguno de los parámetros
    if (!nombre || !consola) {
        return res.status(400).json({
            error: "Ups! Faltan parámetros, se requiere nombre y consola"
        });
    }

    // Se crea el objeto con los datos del juego
    const juego = {
        nombre: nombre,
        consola: consola
    };

    // Se carga el contenido actual del archivo JSON
    let contenidoJson = [];
    try {
        contenidoJson = JSON.parse(fs.readFileSync("videojuegos.json", "utf8"));
    } catch (error) {
        console.error("Error al leer el archivo Json: ", error.message);
    }
    // Se agrega el nuevo juego al arreglo
    contenidoJson.push(juego);

    // Se guarda el objeto en el archivo JSON
    fs.writeFile("videojuegos.json", JSON.stringify(contenidoJson), (err) => {
        if (err) {
            console.error("Error al escribir el archivo:", err);
            return res.status(500).json({
                error: "Error interno del servidor"
            });
        }
        console.log("Juego guardado con éxito");
        // Se devuelve un mensaje de éxito
        res.send("Juego guardado con éxito");
    });
});
