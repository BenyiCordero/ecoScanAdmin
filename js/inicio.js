import { cargarVista } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {

    // Evento a todos los links
    document.querySelectorAll(".side-card").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            const ruta = link.getAttribute("data-view");
            cargarVista(ruta);

            // marcar activo
            document.querySelectorAll(".side-card").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // Cargar vista inicial
    const primeraVista = "pages/recicladoras.html";
    cargarVista(primeraVista);

    // Marcar el primero como activo
    const primerLink = document.querySelector(`[data-view="${primeraVista}"]`);
    if (primerLink) {
        primerLink.classList.add("active");
    }
});
