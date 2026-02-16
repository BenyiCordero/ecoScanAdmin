import { getUserProfile } from './session.js';

/**
 * Renderiza el topbar con la información del usuario
 * @param {boolean} forceRefresh - Si es true, fuerza traer datos del backend
 */
async function renderTopbar(forceRefresh = false) {

    try {
        const profile = await getUserProfile({ forceRefresh }).catch(err => {
            console.warn("No se pudo obtener el perfil, usando valores por defecto", err);
            return null;
        });

        const nombreTop = document.getElementById('nombre-top');
        const letraIcon = document.getElementById('letra-icon');

        if (profile) {
            if (nombreTop) {
                nombreTop.textContent =
                    profile.nombre + " " +
                    profile.primerApellido + " " +
                    profile.segundoApellido;
            }

            if (letraIcon) {
                letraIcon.textContent =
                    profile.primeros ||
                    profile.nombreSimple?.charAt(0)?.toUpperCase() ||
                    'U';
            }

        } else {
            if (nombreTop) nombreTop.textContent = 'Usuario';
            if (letraIcon) letraIcon.textContent = 'U';
        }

    } catch (e) {
        console.error("Error rellenando topbar", e);

        const nombreTop = document.getElementById('nombre-top');
        const letraIcon = document.getElementById('letra-icon');

        if (nombreTop) nombreTop.textContent = 'Usuario';
        if (letraIcon) letraIcon.textContent = 'U';
    }
}


async function initPartials() {

    setupCommonBehavior();

    await renderTopbar();

    document.dispatchEvent(new CustomEvent('partialsLoaded'));
}


function setupCommonBehavior() {

    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    const hoy = document.getElementById('today');
    if (hoy) {
        const d = new Date();
        const opt = { year: 'numeric', month: 'short', day: 'numeric' };
        hoy.textContent = d.toLocaleDateString('es-MX', opt);
    }

}


document.addEventListener('userUpdated', async () => {
    await renderTopbar(true); 
});


document.addEventListener('DOMContentLoaded', initPartials);
