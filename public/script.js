let events = [];
let editingId = null;

const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("events");

const fetchEvents = async () => {
  const response = await fetch("/events");
  events = await response.json();
  renderEvents();
};

const renderEvents = () => {
  eventList.innerHTML = "";
  events.forEach((event) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${event.Titulo}</strong><br>
        ${event.Descripcion}<br>
        Fecha: ${event.FechaInicio} - ${event.FechaFinal}<br>
        Filial: ${event.Filial}<br>
        ${
          event.imagen
            ? `<img src="${event.imagen}" alt="Imagen del evento" style="max-width: 200px;">`
            : ""
        }
      </div>
      <div>
        <button class="edit" onclick="editEvent(${event.id})">Editar</button>
        <button class="delete" onclick="deleteEvent(${event.id})">Eliminar</button>
      </div>
    `;
    eventList.appendChild(li);
  });
};

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const Titulo = document.getElementById("Titulo").value;
  const Descripcion = document.getElementById("Descripcion").value;
  const FechaInicio = document.getElementById("FechaInicio").value;
  const FechaFinal = document.getElementById("FechaFinal").value;
  const Filial = document.getElementById("Filial").value;
  const imagen = document.getElementById("Imagen").files[0];

  const formData = new FormData();
  formData.append("Titulo", Titulo);
  formData.append("Descripcion", Descripcion);
  formData.append("FechaInicio", FechaInicio);
  formData.append("FechaFinal", FechaFinal);
  formData.append("Filial", Filial);
  if (imagen) {
    formData.append("imagen", imagen);
  }

  if (editingId) {
    await fetch(`/events/${editingId}`, {
      method: "PUT",
      body: formData,
    });
    editingId = null;
  } else {
    await fetch("/events", {
      method: "POST",
      body: formData,
    });
  }

  eventForm.reset();
  fetchEvents();
});

const editEvent = (id) => {
  const event = events.find((e) => e.id === id);
  if (event) {
    editingId = id;
    document.getElementById("Titulo").value = event.Titulo;
    document.getElementById("Descripcion").value = event.Descripcion;
    document.getElementById("FechaInicio").value = event.FechaInicio;
    document.getElementById("FechaFinal").value = event.FechaFinal;
    document.getElementById("Filial").value = event.Filial;
  }
};

const deleteEvent = async (id) => {
  await fetch(`/events/${id}`, { method: "DELETE" });
  fetchEvents();
};

fetchEvents();
