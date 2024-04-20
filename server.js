const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor Express iniciado en el puerto ${PORT}`);
})

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

// Función para leer el archivo JSON
function leerJSON() {
    try {
        const data = fs.readFileSync("Deportes.json", "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer el archivo Json: ", error.message);
        return [];
    }
}

// Función para escribir en el archivo JSON
function escribirJSON(deportes, res, mensaje) {
    try {
        fs.writeFileSync("Deportes.json", JSON.stringify({deportes}));
        console.log(mensaje);
        res.send(mensaje);
    } catch (error) {
        console.error("Error al escribir en el archivo JSON: ", error.message);
        return res.status(500).send("Error al escribir en el archivo JSON");
    }
}

// Función para encontrar el índice de un deporte por nombre
function encontrarPorNombre(nombre, data) {
    return data.findIndex((elem) => elem.nombre === nombre);
}

function minusculas(nombre) {
    return nombre.toLowerCase();
}

//Rutas: /deportes, /agregar, /editar, /eliminar

app.get("/deportes", (req, res) => {
    const data = leerJSON();
    res.send(data);
})

app.get('/agregar', (req, res) => {
    try {
        let { nombre, precio } = req.query;

        if (!nombre || !precio) {
            return res.status(400).send("Faltan parámetros, se requiere nombre y precio");
        }
        nombre = minusculas(nombre);

        let deportes = leerJSON();
        let buscarDeporte = deportes.find(deporte => deporte.nombre == nombre);

        if (buscarDeporte) {
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

        escribirJSON(deportes, res, `Deporte ${nombre} editado`);
    } catch (error) {
        console.error("Error en la ruta /editar:", error.message);
        return res.status(500).send("Error interno del servidor");
    }
});

app.get('/eliminar/:nombre', (req, res) => {
    try {
        let nombre = req.params.nombre;
        if (!nombre) {
            return res.status(400).send("Faltan parámetros, se requiere nombre");
        }
        nombre = minusculas(nombre);

        let data = leerJSON();
        let busqueda = encontrarPorNombre(nombre, data);

        if (busqueda == -1) {
            console.log(`El deporte ${nombre} no existe`);
            return res.send(`El deporte ${nombre} no existe`)
        } else {
            console.log(`Deporte ${nombre} eliminado`);
            data.splice(busqueda, 1);
        }

        escribirJSON(data, res, `Deporte ${nombre} eliminado con exito`);
    } catch (error) {
        console.error("Error en la ruta /eliminar/:nombre:", error.message);
        return res.status(500).send("Error interno del servidor");
    }
});

app.get("*", (req, res) => {
    res.send("Esta página no existe...");
});