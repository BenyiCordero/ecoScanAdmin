import { cargarVista } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const sidebarHolder = document.getElementById("sidebar-holder");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const body = document.body;

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("sidebar-open");
            body.classList.toggle("sidebar-active");
        });

        document.addEventListener("click", (e) => {
            if (window.innerWidth < 768 && 
                sidebar.classList.contains("sidebar-open") &&
                !sidebar.contains(e.target) &&
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove("sidebar-open");
                body.classList.remove("sidebar-active");
            }
        });
    }

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
