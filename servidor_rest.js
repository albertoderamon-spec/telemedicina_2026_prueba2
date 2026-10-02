const express = require("express");
const app = express();

const conexion = require("./bd/conexion_mysql.js"); // Exporta la instancia del cliente supabase

app.use("/appCliente", express.static("cliente_rest"));
app.use(express.json());

// GET /api/ubicaciones
app.get("/api/ubicaciones", (req, res) => {
  conexion
    .from("ubicaciones")
    .select("*")
    .then(({ data, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// GET /api/categorias
app.get("/api/categorias", (req, res) => {
  conexion
    .from("categorias")
    .select("*")
    .then(({ data, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// GET /api/modelos
app.get("/api/modelos", (req, res) => {
  conexion
    .from("modelos")
    .select("*")
    .then(({ data, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// GET /api/estados
app.get("/api/estados", (req, res) => {
  conexion
    .from("estado")
    .select("*")
    .order("id", { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// POST /api/gestores/login
app.post("/api/gestores/login", (req, res) => {
  var usuario = req.body.usuario;
  var contraseña = req.body.contraseña;

  conexion
    .from("gestores")
    .select("id")
    .eq("usuario", usuario)
    .eq("contrasena", contraseña)
    .then(({ data: gestores, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      if (gestores && gestores.length === 1) {
        res.status(200).json(gestores[0].id);
      } else {
        res.status(403).json("Credenciales incorrectas.");
      }
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// POST /api/area_salud
app.post("/api/area_salud", (req, res) => {
  var codigo_postal = req.body.codigo_postal;
  var nombre = req.body.nombre;
  var gestor = req.body.gestor;

  conexion
    .from("area_salud")
    .insert([{ codigo_postal, nombre, gestor }])
    .select()
    .then(({ data, error }) => {
      if (error) {
        console.log("Error al realizar el insert", error);
        return res.status(500).json("Error al realizar la insercion");
      }
      res.status(201).json(data);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la insercion");
    });
});

// POST /api/gestores
app.post("/api/gestores", (req, res) => {
  var nombre = req.body.nombre;
  var apellidos = req.body.apellidos;
  var usuario = req.body.usuario;
  var contraseña = req.body.contraseña;

  conexion
    .from("gestores")
    .select("id")
    .eq("usuario", usuario)
    .then(({ data: duplicados, error: errDup }) => {
      if (errDup) {
        console.log("Error al realizar la select", errDup);
        return res.status(500).json("Error al realizar la consulta");
      }
      if (duplicados && duplicados.length > 0) {
        return res.status(409).json("El login ya existe");
      }

      return conexion
        .from("gestores")
        .insert([{ nombre, apellidos, usuario, contrasena: contraseña }]);
    })
    .then((resultado) => {
      if (!resultado) return; // Si devolvió un error previo, no hacemos nada
      
      var error = resultado.error;
      if (error) {
        console.log("Error al realizar el insert", error);
        return res.status(500).json("Error al realizar la insercion");
      }

      res.status(201).json("Gestor añadido correctamente a la base de datos.");
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error interno");
    });
});

// PUT /api/gestores/:id
app.put("/api/gestores/:id", (req, res) => {
  var idGestor = parseInt(req.params.id);
  var nombre = req.body.nombre;
  var apellidos = req.body.apellidos;
  var usuario = req.body.usuario;
  var contraseña = req.body.contraseña;

  conexion
    .from("gestores")
    .select("id")
    .eq("id", idGestor)
    .then(({ data: encontrados, error: errEnc }) => {
      if (errEnc) {
        console.log("Error al realizar la select", errEnc);
        res.status(500).json("Error al realizar la consulta");
        return null;
      }
      if (!encontrados || encontrados.length === 0) {
        res.status(404).json("El usuario que está intentando modificar no se encuentra en la base de datos");
        return null;
      }

      return conexion
        .from("gestores")
        .select("id")
        .eq("usuario", usuario)
        .neq("id", idGestor);
    })
    .then((resDup) => {
      if (!resDup) return null;

      var duplicados = resDup.data;
      var errDup = resDup.error;

      if (errDup) {
        console.log("Error al realizar la select", errDup);
        res.status(500).json("Error al realizar la consulta");
        return null;
      }

      if (duplicados && duplicados.length > 0) {
        res.status(404).json("El login ya existe");
        return null;
      }

      return conexion
        .from("gestores")
        .update({ nombre, apellidos, usuario, contrasena: contraseña })
        .eq("id", idGestor);
    })
    .then((resUpdate) => {
      if (!resUpdate) return;

      var errUpdate = resUpdate.error;
      if (errUpdate) {
        console.log("Error al realizar el update", errUpdate);
        return res.status(500).json("Error al realizar la actualización");
      }

      res.status(201).json("Se han actualizado correctamente los datos.");
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error interno");
    });
});

// GET /api/gestores/:id
app.get("/api/gestores/:id", (req, res) => {
  var idGestor = parseInt(req.params.id);

  conexion
    .from("gestores")
    .select("id, nombre, apellidos, usuario")
    .eq("id", idGestor)
    .then(({ data: gestores, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      if (!gestores || gestores.length === 0) {
        return res.status(404).json("Gestor no encontrado.");
      }
      res.status(200).json(gestores[0]);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// GET /api/sanitarios/:id
app.get("/api/sanitarios/:id", (req, res) => {
  var idSanitario = parseInt(req.params.id);

  conexion
    .from("sanitarios")
    .select("id, nombre, apellidos, usuario")
    .eq("id", idSanitario)
    .then(({ data: sanitarios, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      if (!sanitarios || sanitarios.length === 0) {
        return res.status(404).json("Sanitario no encontrado.");
      }
      res.status(200).json(sanitarios[0]);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// GET /api/recursos
app.get("/api/recursos", (req, res) => {
  var categoria = req.query.categoria;
  var modelo = req.query.modelo;
  var ubicacion = req.query.ubicacion;
  var estadoFiltro = req.query.estado;

  var query = conexion.from("recursos").select("*");

  if (categoria) query = query.eq("categoria", categoria);
  if (modelo) query = query.eq("modelo", modelo);
  if (ubicacion) query = query.eq("ubicacion", ubicacion);
  if (estadoFiltro !== undefined && estadoFiltro !== "" && estadoFiltro !== "-1") {
    query = query.eq("estado", estadoFiltro);
  }

  query
    .then(({ data: recursos, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      res.status(200).json(recursos);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// GET /api/recursos/:id
app.get("/api/recursos/:id", (req, res) => {
  var idBusqueda = parseInt(req.params.id);

  conexion
    .from("recursos")
    .select("*")
    .or(`numero_serie.eq.${idBusqueda},id.eq.${idBusqueda}`)
    .then(({ data: recursos, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      if (!recursos || recursos.length === 0) {
        return res.status(404).json("Recurso no encontrado.");
      }
      res.status(200).json(recursos[0]);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// POST /api/recursos
app.post("/api/recursos", (req, res) => {
  var numSerie = parseInt(req.body.numero_serie);
  var modelo = req.body.modelo;
  var ubicacion = req.body.ubicacion;
  var estado = req.body.estado;

  conexion
    .from("recursos")
    .select("id")
    .eq("numero_serie", numSerie)
    .then(({ data: duplicados, error: errDup }) => {
      if (errDup) {
        console.log("Error al realizar la select", errDup);
        res.status(500).json("Error al realizar la consulta");
        return null;
      }
      if (duplicados && duplicados.length > 0) {
        res.status(409).json("Ya existe un recurso con ese número de serie");
        return null;
      }

      return conexion
        .from("modelos")
        .select("categoria")
        .eq("id", modelo)
        .single();
    })
    .then((resModelo) => {
      if (!resModelo) return null;

      var datosModelo = resModelo.data;
      var errModelo = resModelo.error;

      if (errModelo || !datosModelo) {
        console.log("Error al obtener la categoría del modelo", errModelo);
        res.status(500).json("Error al asociar la categoría del modelo");
        return null;
      }

      return conexion
        .from("recursos")
        .insert([{
          categoria: datosModelo.categoria,
          modelo: modelo,
          ubicacion: ubicacion,
          numero_serie: numSerie,
          estado: estado
        }]);
    })
    .then((resInsert) => {
      if (!resInsert) return;

      var errInsert = resInsert.error;
      if (errInsert) {
        console.log("Error al realizar el insert", errInsert);
        return res.status(500).json("Error al realizar la insercion");
      }

      res.status(201).json("Recurso añadido correctamente a la base de datos.");
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error interno");
    });
});

// PUT /api/recursos/:id
app.put("/api/recursos/:id", (req, res) => {
  var numSerie = parseInt(req.params.id);
  var modelo = req.body.modelo;
  var ubicacion = req.body.ubicacion;
  var estado = req.body.estado;

  conexion
    .from("modelos")
    .select("categoria")
    .eq("id", modelo)
    .single()
    .then(({ data: datosModelo, error: errModelo }) => {
      if (errModelo || !datosModelo) {
        console.log("Error al obtener la categoría del modelo", errModelo);
        res.status(500).json("Error al actualizar la categoría del modelo");
        return null;
      }

      return conexion
        .from("recursos")
        .update({
          categoria: datosModelo.categoria,
          modelo: modelo,
          ubicacion: ubicacion,
          estado: estado
        })
        .eq("numero_serie", numSerie)
        .select();
    })
    .then((resUpdate) => {
      if (!resUpdate) return;

      var data = resUpdate.data;
      var error = resUpdate.error;

      if (error) {
        console.log("Error al realizar el update", error);
        return res.status(500).json("Error al realizar la actualización");
      }

      if (data && data.length > 0) {
        res.status(200).json("El recurso se ha actualizado en la base de datos.");
      } else {
        res.status(404).json("Error actualizando el recurso.");
      }
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error interno");
    });
});

// GET /api/recursos/:id/reservas
app.get("/api/recursos/:id/reservas", (req, res) => {
  var idRecurso = parseInt(req.params.id);

  conexion
    .from("reservas")
    .select("*")
    .eq("recurso", idRecurso)
    .then(({ data: reservas, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      res.status(200).json(reservas);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// GET /api/recursos/:id/resenyas
app.get("/api/recursos/:id/resenyas", (req, res) => {
  var idRecurso = parseInt(req.params.id);

  conexion
    .from("resenyas")
    .select("*")
    .eq("recurso", idRecurso)
    .then(({ data: resenyas, error }) => {
      if (error) {
        console.log("Error al realizar la select", error);
        return res.status(500).json("Error al realizar la consulta");
      }
      res.status(200).json(resenyas);
    })
    .catch((err) => {
      console.log("Error en el servidor", err);
      res.status(500).json("Error al realizar la consulta");
    });
});

// DELETE /api/recursos/:id
app.delete("/api/recursos/:id", (req, res) => {
  var idRecursoOSerie = parseInt(req.params.id);

  conexion
    .from("recursos")
    .select("id")
    .or(`numero_serie.eq.${idRecursoOSerie},id.eq.${idRecursoOSerie}`)
    .then(({ data: recursos, error: errSel }) => {
      if (errSel) {
        console.log("Error al realizar la select", errSel);
        res.status(500).json("Error al realizar la consulta");
        return null;
      }

      if (!recursos || recursos.length === 0) {
        res.status(404).json("No se ha encontrado el recurso para eliminar.");
        return null;
      }

      var ids = recursos.map((r) => r.id);

      // Borrar resenyas
      return conexion.from("resenyas").delete().in("recurso", ids).then((resResenyas) => {
        if (resResenyas.error) throw resResenyas.error;
        // Borrar reservas
        return conexion.from("reservas").delete().in("recurso", ids);
      }).then((resReservas) => {
        if (resReservas.error) throw resReservas.error;
        // Borrar recursos
        return conexion.from("recursos").delete().in("id", ids);
      });
    })
    .then((resFinal) => {
      if (!resFinal) return;

      if (resFinal.error) {
        console.log("Error al realizar el borrado", resFinal.error);
        return res.status(500).json("Error al realizar el borrado");
      }

      res.status(200).json("Recurso eliminado correctamente.");
    })
    .catch((err) => {
      console.log("Error en el servidor durante el borrado", err);
      res.status(500).json("Error al realizar el borrado");
    });
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
