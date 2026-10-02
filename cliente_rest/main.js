var seccionActual = "acceso";
var idGestorActual = null;
var idRecursoActual = null;
var conexionWS = null;

var listaModelos = [];
var listaCategorias = [];
var listaUbicaciones = [];
var listaEstados = [];

function cambiarSeccion(seccion){ 
    document.getElementById(seccionActual).style.display = "none";
    document.getElementById(seccion).style.display = "block";
    seccionActual = seccion;
}

function salir() {
    if (conexionWS) {
        conexionWS.close();
        conexionWS = null;
    }
    cambiarSeccion('acceso');
}

function getNombreModelo(id) {
    for (var i = 0; i < listaModelos.length; i++) {
        if (listaModelos[i].id == id) return listaModelos[i].nombre;
    }
    return id;
}

function getNombreCategoria(id) {
    for (var i = 0; i < listaCategorias.length; i++) {
        if (listaCategorias[i].id == id) return listaCategorias[i].nombre;
    }
    return id;
}

function getNombreUbicacion(id) {
    for (var i = 0; i < listaUbicaciones.length; i++) {
        if (listaUbicaciones[i].id == id) return listaUbicaciones[i].nombre;
    }
    return id;
}

function getNombreEstado(val) {
    for (var i = 0; i < listaEstados.length; i++) {
        if (listaEstados[i].id == val) return listaEstados[i].estado;
    }
    return val;
}

// Rellena un <select> con los elementos de una lista de la base de datos.
// Conserva la primera opcion del HTML (por ejemplo "Todas" con value 0) y sustituye el resto.
function rellenarSelect(idSelect, lista, campoTexto) {
    var select = document.getElementById(idSelect);
    while (select.options.length > 1) select.remove(1);
    for (var i = 0; i < lista.length; i++) {
        var opcion = document.createElement("option");
        opcion.value = lista[i].id;
        opcion.text = lista[i][campoTexto];
        select.appendChild(opcion);
    }
}

function cargarListados() {
    rest.get("/api/modelos", function(estado, respuesta) {
        if (estado != 200) return;
        listaModelos = respuesta;
        ["home_modelo", "rec_modelo", "añadir_modelo"].forEach(function(id) { rellenarSelect(id, listaModelos, "nombre"); });
    });
    rest.get("/api/categorias", function(estado, respuesta) {
        if (estado != 200) return;
        listaCategorias = respuesta;
        ["home_categoria", "rec_categoria", "añadir_categoria"].forEach(function(id) { rellenarSelect(id, listaCategorias, "nombre"); });
    });
    rest.get("/api/ubicaciones", function(estado, respuesta) {
        if (estado != 200) return;
        listaUbicaciones = respuesta;
        ["home_ubicacion", "rec_ubicacion", "añadir_ubicacion"].forEach(function(id) { rellenarSelect(id, listaUbicaciones, "nombre"); });
    });
    rest.get("/api/estados", function(estado, respuesta) {
        if (estado != 200) return;
        listaEstados = respuesta;
        ["home_estado", "rec_estado", "añadir_estado"].forEach(function(id) { rellenarSelect(id, listaEstados, "estado"); });
    });
}

function login() {
    var gestor = {
        usuario: document.getElementById("usuario").value,
        contraseña: document.getElementById("contraseña").value
    };

    rest.post("/api/gestores/login", gestor, function(estado, respuesta) {
        if(estado == 200) {
            idGestorActual = respuesta;
            cargarListados();
            cambiarSeccion('home');
            obtenerDatosYBienvenida(idGestorActual);
            seccionActual = 'home';
        } else {
            alert("Credenciales incorrectas.");
        }
    });
}

function obtenerDatosYBienvenida(id) {
    rest.get("/api/gestores/" + id, function(estado, respuesta) {
        if (estado == 200) {
            var nombreCompleto = respuesta.nombre + " " + respuesta.apellidos;
            document.getElementById("texto_bienvenida").innerHTML = "Bienvenido/a " + nombreCompleto;

            conexionWS = new WebSocket("ws://localhost:4445", "avisos");
            conexionWS.addEventListener("open", function() {
                conexionWS.send(JSON.stringify({
                    operacion: "identificar",
                    rol: "gestor",
                    id: idGestorActual,
                    nombre: nombreCompleto
                }));
            });

            conexionWS.addEventListener("message", function(msg) {
                var aviso = JSON.parse(msg.data);
                var tbody = document.getElementById("tbody_avisos");
                var fila = "<tr>"
                    + "<td style='background-color:" + aviso.color + ";'>" + new Date(aviso.fecha).toLocaleString() + "</td>"
                    + "<td style='background-color:" + aviso.color + ";'>" + aviso.origen + "</td>"
                    + "<td style='background-color:" + aviso.color + ";'>" + aviso.texto + "</td>"
                    + "</tr>";
                tbody.innerHTML += fila;
            });
        } 
    });
}

function registrarUsuario() {
    var gestor = {
        nombre: document.getElementById("reg_nombre").value,
        apellidos: document.getElementById("reg_apellidos").value,
        usuario: document.getElementById("reg_usuario").value,
        contraseña: document.getElementById("reg_contraseña").value
    }
    rest.post("/api/gestores", gestor, function (estado, respuesta) {
        if (estado == 201) {
            alert("Gestor añadido correctamente a la base de datos.");
            cambiarSeccion('acceso');
            seccionActual = 'acceso';
        } else if (estado == 409) {
            alert("El login ya existe. Elige otro usuario.");
        } else {
            alert("Error al introducir gestor en la base de datos.")
        }
    });
}

function registrarAreaSalud(){
    var area = {
        codigo_postal: document.getElementById("codigo_postal").value,
        nombre: document.getElementById("area_nombre").value,
        gestor: idGestorActual
    }
    rest.post("/api/area_salud", area, function (estado, respuesta){
        if (estado == 201){
            alert("Área añadida con éxito");
        } else {
            alert("Error al introducir el area en la base de datos.")
        }
    })
}

function editarDatos(){
    cambiarSeccion('editarDatos');
    seccionActual = "editarDatos";
}

function modificarUsuario() {
    var gestor = {
        id: idGestorActual,
        nombre: document.getElementById("mod_nombre").value,
        apellidos: document.getElementById("mod_apellidos").value,
        usuario: document.getElementById("mod_usuario").value,
        contraseña: document.getElementById("mod_contraseña").value
    }
    rest.put("/api/gestores/" + idGestorActual, gestor, function(estado, respuesta) {
        if (estado == 201) {
            alert("Se han actualizado correctamente los datos.");
            idGestorActual = respuesta.id;
            cambiarSeccion('home');
        } else {
            alert("No se han actualizado los datos del gestor.")
        } 
    });
}

function mostrarRecursos() {
    var categoria = document.getElementById("home_categoria").value;
    var modelo = document.getElementById("home_modelo").value;
    var ubicacion = document.getElementById("home_ubicacion").value;
    var estadoVal = document.getElementById("home_estado").value;

    var url = "/api/recursos?";
    if (categoria != "0") url += "categoria=" + categoria + "&";
    if (modelo != "0") url += "modelo=" + modelo + "&";
    if (ubicacion != "0") url += "ubicacion=" + ubicacion + "&";
    if (estadoVal != "-1") url += "estado=" + estadoVal + "&";

    rest.get(url, function(estado, respuesta) {
        if (estado == 200) {
            var tbody = document.querySelector("#home table tbody");
            tbody.innerHTML = "";
            for (var i = 0; i < respuesta.length; i++) {
                var r = respuesta[i];
                var fila = "<tr>"
                    + "<td>" + r.numero_serie + "</td>"
                    + "<td>" + getNombreCategoria(r.categoria) + "</td>"
                    + "<td>" + getNombreModelo(r.modelo) + "</td>"
                    + "<td>" + getNombreUbicacion(r.ubicacion) + "</td>"
                    + "<td>" + getNombreEstado(r.estado) + "</td>"
                    + "<td>"
                    + "<button onclick=\"abrirRecursoConDatos(" + r.numero_serie + ")\">Abrir</button>"
                    + "<button onclick=\"borrarRecurso(" + r.numero_serie + ", this)\">X</button>"
                    + "</td>"
                    + "</tr>";
                tbody.innerHTML += fila;
            }
        } else {
            alert("No se han podido cargar los recursos.");
        }
    });
}

function añadirRecurso() {
    var recurso = {
        modelo: document.getElementById("rec_modelo").value,
        ubicacion: document.getElementById("rec_ubicacion").value,
        numero_serie: document.getElementById("rec_num_serie").value,
        estado: document.getElementById("rec_estado").value
    }

    rest.post("/api/recursos", recurso, function(estado, respuesta) {
        if(estado == 201) {
            alert("Recurso añadido correctamente a la base de datos.");

            var selectCategoria = document.getElementById("rec_categoria");
            var selectModelo = document.getElementById("rec_modelo");
            var selectUbicacion = document.getElementById("rec_ubicacion");
            var selectEstado = document.getElementById("rec_estado");

            var textoCategoria = selectCategoria.options[selectCategoria.selectedIndex].text;
            var textoModelo = selectModelo.options[selectModelo.selectedIndex].text;
            var textoUbicacion = selectUbicacion.options[selectUbicacion.selectedIndex].text;
            var textoEstado = selectEstado.options[selectEstado.selectedIndex].text;
            var numSerie = document.getElementById("rec_num_serie").value;

            if (conexionWS) {
                conexionWS.send(JSON.stringify({
                    operacion: "recursoCreado",
                    nombreCategoria: textoCategoria,
                    nombreModelo: textoModelo,
                    numeroSerie: numSerie
                }));
            }

            var tbody = document.querySelector("#home table tbody");
            var nuevaFila = "<tr>"
                + "<td>" + numSerie + "</td>"
                + "<td>" + textoCategoria + "</td>"
                + "<td>" + textoModelo + "</td>"
                + "<td>" + textoUbicacion + "</td>"
                + "<td>" + textoEstado + "</td>"
                + "<td>"
                + "<button onclick=\"abrirRecursoConDatos(" + numSerie + ")\">Abrir</button>"
                + "<button onclick=\"borrarRecurso(" + numSerie + ", this)\">X</button>"
                + "</td>"
                + "</tr>";
            tbody.innerHTML += nuevaFila;

            cambiarSeccion('home');
            seccionActual = 'home';
        } else if (estado == 409) {
            alert("Ya existe un recurso con ese número de serie.");
        } else {
            alert("El recurso no se ha podido añadir correctamente.");
        }
    });
}

function actualizarRecurso() {
    var numSerieRecurso = document.getElementById("añadir_num_serie").value;

    var recurso = {
        categoria: document.getElementById("añadir_categoria").options[document.getElementById("añadir_categoria").selectedIndex].text,
        modelo: document.getElementById("añadir_modelo").options[document.getElementById("añadir_modelo").selectedIndex].text,
        ubicacion: document.getElementById("añadir_ubicacion").options[document.getElementById("añadir_ubicacion").selectedIndex].text,
        estado: document.getElementById("añadir_estado").options[document.getElementById("añadir_estado").selectedIndex].text,
        id_modelo: document.getElementById("añadir_modelo").value,
        id_ubicacion: document.getElementById("añadir_ubicacion").value,
        id_estado: document.getElementById("añadir_estado").value
    }

    rest.put("/api/recursos/" + numSerieRecurso, {
        modelo: recurso.id_modelo,
        ubicacion: recurso.id_ubicacion,
        estado: recurso.id_estado
    }, function(estado, respuesta) {
        if(estado == 200) {
            alert("Recurso actualizado en la base de datos.");
            var filas = document.querySelectorAll("#home table tbody tr");
            filas.forEach(function(fila) {
                if (fila.cells[0].innerText == numSerieRecurso) {
                    fila.cells[1].innerText = recurso.categoria;
                    fila.cells[2].innerText = recurso.modelo;
                    fila.cells[3].innerText = recurso.ubicacion;
                    fila.cells[4].innerText = recurso.estado;
                }
            });
            cambiarSeccion('home');
        } else {
            alert("El recurso no se ha actualizado.");
        }
    });
}

function borrarRecurso(numSerie, boton) {
    if (confirm("¿Estás seguro de que deseas eliminar el recurso con Nº Serie: " + numSerie + "?")) {
        rest.delete("/api/recursos/" + numSerie, function(estado, respuesta) {
            if (estado == 200) {
                alert(respuesta);
                var fila = boton.parentNode.parentNode;
                fila.parentNode.removeChild(fila);
                cambiarSeccion('home');
                seccionActual = 'home';
            } else {
                alert("Error al borrar el recurso.");
            }
        });
    }
}

function abrirRecursoConDatos(numSerie) {
    rest.get("/api/recursos/" + numSerie, function(estado, recurso) {
        if (estado == 200) {
            idRecursoActual = recurso.id;   // recurso abierto en la ficha (lo usan los botones de la ficha)
            document.getElementById("añadir_num_serie").value = recurso.numero_serie;
            document.getElementById("añadir_modelo").value = recurso.modelo;
            document.getElementById("añadir_ubicacion").value = recurso.ubicacion;
            document.getElementById("añadir_estado").value = recurso.estado.toString();
            cargarTablaReservas(recurso.id);
            cargarTablaResenyas(recurso.id);
            cambiarSeccion('actualizarRecurso');
        } else {
            alert("Error al cargar el recurso. El servidor no lo encuentra.");
        }
    });
}

function cargarTablaReservas(idRecurso) {
    rest.get("/api/recursos/" + idRecurso + "/reservas", function(estado, reservas) {
        var tbody = document.getElementById("tabla_reservas_body");
        tbody.innerHTML = "";
        if (estado == 200) {
            reservas.forEach(function(r) {
                rest.get("/api/sanitarios/" + r.sanitario, function(st, san) {
                    var nombre = (st == 200) ? (san.nombre + " " + san.apellidos) : "ID: " + r.sanitario;
                    var colorFondo;
                    if (r.fecha_fin) {
                        colorFondo = "#ffffff";
                    } else if (r.fecha_inicio) {
                        var inicio = new Date(r.fecha_inicio);
                        var ahora = new Date();
                        var horasTranscurridas = (ahora - inicio) / (1000 * 60 * 60);
                        if (horasTranscurridas > r.horas_estimadas) {
                            colorFondo = "#fecaca";
                        } else {
                            colorFondo = "#bfdbfe";
                        }
                    } else {
                        colorFondo = "#d9f99d";
                    }
                    var fila = "<tr>"
                        + "<td style='background-color:" + colorFondo + ";'>" + nombre + "</td>"
                        + "<td style='background-color:" + colorFondo + ";'>" + r.horas_estimadas + "</td>"
                        + "<td style='background-color:" + colorFondo + ";'>" + new Date(r.fecha_peticion).toLocaleDateString() + "</td>"
                        + "<td style='background-color:" + colorFondo + ";'>" + (r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString() : "-") + "</td>"
                        + "<td style='background-color:" + colorFondo + ";'>" + (r.fecha_fin ? new Date(r.fecha_fin).toLocaleDateString() : "-") + "</td>"
                        + "</tr>";
                    tbody.innerHTML += fila;
                });
            });
        }
    });
}

function cargarTablaResenyas(idRecurso) {
    rest.get("/api/recursos/" + idRecurso + "/resenyas", function(estado, resenyas) {
        var tbody = document.getElementById("tabla_resenas_body");
        tbody.innerHTML = "";
        if (estado == 200) {
            resenyas.forEach(function(r) {
                rest.get("/api/sanitarios/" + r.sanitario, function(st, san) {
                    var nombre = (st == 200) ? (san.nombre + " " + san.apellidos) : "ID: " + r.sanitario;
                    var fila = "<tr><td>"+new Date(r.fecha).toLocaleDateString()+"</td><td>"+nombre+"</td><td>"+r.valor+"</td><td>"+r.descripcion+"</td></tr>";
                    tbody.innerHTML += fila;
                });
            });
        }
    });
}