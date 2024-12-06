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
        Filial: ${event.Filial}
      </div>
      <div>
        <button class="edit" onclick="editEvent(${event.id})">Editar</button>
        <button class="delete" onclick="deleteEvent(${event.id})">Eliminar</button>
      </div>
    `;
    eventList.appendChild(li);
  });
};

const createEvent = async (eventData) => {
  await fetch("/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  fetchEvents();
};

const updateEvent = async (id, eventData) => {
  await fetch(`/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  fetchEvents();
};

const deleteEvent = async (id) => {
  await fetch(`/events/${id}`, { method: "DELETE" });
  fetchEvents();
};

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const Titulo = document.getElementById("Titulo").value;
  const Descripcion = document.getElementById("Descripcion").value;
  const FechaInicio = document.getElementById("FechaInicio").value;
  const FechaFinal = document.getElementById("FechaFinal").value;
  const Filial = document.getElementById("Filial").value;

  const eventData = { Titulo, Descripcion, FechaInicio, FechaFinal, Filial };

  if (editingId) {
    await updateEvent(editingId, eventData);
    editingId = null;
  } else {
    await createEvent(eventData);
  }

  eventForm.reset();
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

fetchEvents();
