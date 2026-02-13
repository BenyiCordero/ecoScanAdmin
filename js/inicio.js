import { cargarVista } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {

    document.addEventListener("click", (e) => {
        const link = e.target.closest("[data-view]");

        if (link) {
            e.preventDefault();

            const ruta = link.getAttribute("data-view");
            cargarVista(ruta);

            if (link.classList.contains("side-card")) {
                document.querySelectorAll(".side-card")
                    .forEach(l => l.classList.remove("active"));

                link.classList.add("active");
            }
        }
    });

    const primeraVista = "pages/recicladoras.html";
    cargarVista(primeraVista);

    const primerLink = document.querySelector(`[data-view="${primeraVista}"]`);
    if (primerLink) {
        primerLink.classList.add("active");
    }
});
