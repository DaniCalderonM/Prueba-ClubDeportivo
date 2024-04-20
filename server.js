// Importaciones
const express = require('express');
const fs = require('fs');
// Instanciamos express
const app = express();
// Definimos el puerto
const PORT = 3000;

// Función para leer el archivo JSON
function leerJSON() {
    const archivo = "Deportes.json";
    try {
        if (fs.existsSync(archivo)) {
            const deportes = fs.readFileSync(archivo, "utf8");
            return JSON.parse(deportes);
        } else {
            // Si el archivo no existe, creamos un archivo vacio
            fs.writeFileSync(archivo, JSON.stringify({ deportes: [] }));
            console.log("Archivo JSON creado correctamente.");
            // Luego, intentamos leer el archivo nuevamente
            return leerJSON();
        }
    } catch (error) {
        if (error.code == 'ENOENT') {
            console.error("El archivo no existe");
            res.status(404).send("El archivo no existe en el servidor");
        } else {
            console.error("Error al leer el archivo Json: ", error.message);
        }
    }
}


// Función para escribir en el archivo JSON
function escribirJSON(deportes, res, mensaje) {
    try {
        fs.writeFileSync("Deportes.json", JSON.stringify({ deportes }));
        console.log(mensaje);
        res.send(mensaje);
    } catch (error) {
        console.error("Error al escribir en el archivo JSON: ", error.message);
        return res.status(500).send("Error al escribir en el archivo JSON");
    }
}

// Función para encontrar el indice de un deporte por nombre
function encontrarPorNombre(nombre, data) {
    return data.findIndex((elem) => elem.nombre === nombre);
}

// Función para pasar a minisculas
function minusculas(nombre) {
    return nombre.toLowerCase();
}

// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor Express iniciado en el puerto ${PORT}`);
})

// Ruta raiz
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

//Rutas: /deportes, /agregar, /editar, /eliminar
// Ruta deportes
app.get("/deportes", (req, res) => {
    const data = leerJSON();
    res.send(data);
})

// Ruta agregar
app.get('/agregar', (req, res) => {
    try {
        let { nombre, precio } = req.query;

        if (!nombre || !precio) {
            return res.status(400).send("Faltan parámetros, se requiere nombre y precio");
        }
        nombre = minusculas(nombre);

        let { deportes } = leerJSON();
        let indiceDeporte = encontrarPorNombre(nombre, deportes);

        if (indiceDeporte !== -1) {
            console.log(`El deporte ${nombre} ya existe, no puede volver a ingresarlo`);
            return res.send(`El deporte ${nombre} ya existe, no puede volver a ingresarlo`);
        } else {
            const deporte = {
                nombre: nombre,
                precio: precio
            };
            deportes.push(deporte);
            escribirJSON(deportes, res, `Deporte ${nombre} agregado con éxito`);
        }
    } catch (error) {
        console.error("Error en la ruta /agregar:", error.message);
        return res.status(500).send("Error interno del servidor");
    }
});

// Ruta editar
app.get('/editar', (req, res) => {
    try {
        let { nombre, precio } = req.query;
        if (!nombre || !precio) {
            return res.status(400).send("Faltan parámetros, se requiere nombre y nuevo precio");
        }

        nombre = minusculas(nombre);

        let { deportes } = leerJSON();
        let deporteIndex = encontrarPorNombre(nombre, deportes);

        if (deporteIndex == -1) {
            console.log(`El Deporte ${nombre} no existe`);
            return res.send(`El Deporte ${nombre} no existe`);
        } else {
            console.log(`Deporte ${nombre} editado con exito`);
            deportes[deporteIndex].precio = precio;
        }

        escribirJSON(deportes, res, `Deporte ${nombre} editado con exito`);
    } catch (error) {
        console.error("Error en la ruta /editar:", error.message);
        return res.status(500).send("Error interno del servidor");
    }
});

// Ruta eliminar
app.get('/eliminar/:nombre', (req, res) => {
    try {
        let nombre = req.params.nombre;
        if (!nombre) {
            return res.status(400).send("Faltan parámetros, se requiere nombre");
        }
        nombre = minusculas(nombre);

        let { deportes } = leerJSON();
        let busqueda = encontrarPorNombre(nombre, deportes);

        if (busqueda == -1) {
            console.log(`El deporte ${nombre} no existe`);
            return res.send(`El deporte ${nombre} no existe`)
        } else {
            console.log(`Deporte ${nombre} eliminado`);
            deportes.splice(busqueda, 1);
        }

        escribirJSON(deportes, res, `Deporte ${nombre} eliminado con exito`);
    } catch (error) {
        console.error("Error en la ruta /eliminar/:nombre:", error.message);
        return res.status(500).send("Error interno del servidor");
    }
});

// Ruta generica para manejar rutas no definidas
app.get("*", (req, res) => {
    res.send("Esta página no existe...");
});