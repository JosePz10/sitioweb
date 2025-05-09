// Variables globales
const formEstudiantes = document.getElementById("formEstudiantes");
const tablaEstudiantes = document.getElementById("tablaEstudiantes");
const selectEstudiante = document.getElementById("selectEstudiante");
const formReservas = document.getElementById("formReservas");
const tablaReservas = document.getElementById("tablaReservas");

let estudiantes = [];
let reservas = [];
let editIndex = null; // Índice del estudiante/reserva en edición

// Función para mostrar mensajes de validación
definirFeedback = (input, mensaje, esValido) => {
  const feedback = input.nextElementSibling;
  input.classList.remove("is-valid", "is-invalid");
  input.classList.add(esValido ? "is-valid" : "is-invalid");
  feedback.textContent = mensaje;
  feedback.classList.remove("text-success", "text-danger");
  feedback.classList.add(esValido ? "text-success" : "text-danger");
};

// Función para registrar o actualizar un estudiante
formEstudiantes.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombreEstudiante = document.getElementById("nombreEstudiante").value.trim();
  const codigoMatricula = document.getElementById("codigoMatricula");
  const regex = /^[0-9]{8}$/;

  if (!regex.test(codigoMatricula.value)) {
    definirFeedback(codigoMatricula, "El código de matrícula debe tener 8 números.", false);
    return;
  }
  definirFeedback(codigoMatricula, "El código de matrícula es válido.", true);

  if (editIndex === null) {
    if (estudiantes.some((est) => est.codigoMatricula === codigoMatricula.value)) {
      alert("El código de matrícula ya está registrado.");
      return;
    }
    estudiantes.push({ nombre: nombreEstudiante, codigoMatricula: codigoMatricula.value });
  } else {
    estudiantes[editIndex] = { nombre: nombreEstudiante, codigoMatricula: codigoMatricula.value };
    editIndex = null;
  }

  actualizarTablaEstudiantes();
  actualizarSelectEstudiantes();
  formEstudiantes.reset();
});

// Función para permitir solo números en el campo de matrícula
document.getElementById("codigoMatricula").addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "");
});

// Función para actualizar la tabla de estudiantes
function actualizarTablaEstudiantes() {
  tablaEstudiantes.innerHTML = "";
  estudiantes.forEach((estudiante, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${estudiante.nombre}</td>
      <td>${estudiante.codigoMatricula}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editarEstudiante(${index})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="confirmarEliminacionEstudiante(${index})">Eliminar</button>
      </td>
    `;
    tablaEstudiantes.appendChild(fila);
  });
}

// Función para editar un estudiante
function editarEstudiante(index) {
  const estudiante = estudiantes[index];
  document.getElementById("nombreEstudiante").value = estudiante.nombre;
  document.getElementById("codigoMatricula").value = estudiante.codigoMatricula;
  editIndex = index;
}

// Confirmación y eliminación de estudiante
function confirmarEliminacionEstudiante(index) {
  if (confirm("¿Estás seguro de eliminar este estudiante?")) {
    eliminarEstudiante(index);
  }
}

function eliminarEstudiante(index) {
  const estudianteEliminado = estudiantes.splice(index, 1)[0];
  reservas = reservas.filter((reserva) => reserva.codigoMatricula !== estudianteEliminado.codigoMatricula);
  actualizarTablaEstudiantes();
  actualizarSelectEstudiantes();
  actualizarTablaReservas();
}

// Función para actualizar el select de estudiantes
function actualizarSelectEstudiantes() {
  selectEstudiante.innerHTML = '<option value="">Selecciona un estudiante</option>';
  estudiantes.forEach((estudiante) => {
    const opcion = document.createElement("option");
    opcion.value = estudiante.codigoMatricula;
    opcion.textContent = estudiante.nombre;
    selectEstudiante.appendChild(opcion);
  });
}

// Función para registrar o actualizar una reserva
formReservas.addEventListener("submit", (event) => {
  event.preventDefault();

  const codigoMatricula = selectEstudiante.value;
  const actividad = document.getElementById("actividad").value;
  const fecha = document.getElementById("fecha").value;

  if (!codigoMatricula || !actividad || !fecha) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  const hoy = new Date().toISOString().split("T")[0];
  if (fecha < hoy) {
    alert("La fecha debe ser actual o futura.");
    return;
  }

  const estudiante = estudiantes.find((est) => est.codigoMatricula === codigoMatricula);

  // Si estamos editando (editIndex no es null), ignoramos la validación de si ya existe la reserva para el estudiante en esa actividad
  if (editIndex === null && reservas.some((res) => res.codigoMatricula === estudiante.codigoMatricula && res.actividad === actividad)) {
    alert("Este estudiante ya está registrado en el taller.");
    return;
  }

  const reserva = { nombre: estudiante.nombre, codigoMatricula, actividad, fecha };

  if (editIndex === null) {
    reservas.push(reserva);
  } else {
    reservas[editIndex] = reserva;
    editIndex = null;
  }

  actualizarTablaReservas();
  formReservas.reset();
});

// Función para actualizar la tabla de reservas
function actualizarTablaReservas() {
  tablaReservas.innerHTML = "";
  reservas.forEach((reserva, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${reserva.nombre}</td>
      <td>${reserva.actividad}</td>
      <td>${reserva.fecha}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editarReserva(${index})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="alert('No se puede eliminar el estudiante porque tiene talleres asignados.')">Eliminar</button>
      </td>
    `;
    tablaReservas.appendChild(fila);
  });
}

// Función para editar una reserva
function editarReserva(index) {
  const reserva = reservas[index];
  document.getElementById("selectEstudiante").value = reserva.codigoMatricula;
  document.getElementById("actividad").value = reserva.actividad;
  document.getElementById("fecha").value = reserva.fecha;
  editIndex = index;
}

// Función para imprimir la tabla de estudiantes
document.getElementById("btnImprimirEstudiantes").addEventListener("click", () => {
  const content = document.getElementById("tablaEstudiantes").outerHTML;
  const newWindow = window.open();
  newWindow.document.write(`
    <html>
      <head><title>Imprimir Estudiantes</title></head>
      <body>
        <h1>Estudiantes Registrados</h1>
        ${content}
      </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.print();
});

// Función para imprimir la tabla de reservas
document.getElementById("btnImprimirReservas").addEventListener("click", () => {
  const content = document.getElementById("tablaReservas").outerHTML;
  const newWindow = window.open();
  newWindow.document.write(`
    <html>
      <head><title>Imprimir Reservas</title></head>
      <body>
        <h1>Reservas de Actividades</h1>
        ${content}
      </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.print();
});