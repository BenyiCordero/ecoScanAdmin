import { getUserProfile, clearUserProfile } from './session.js';
import { showToast } from './utils.js';

/*Informacion del perfil*/
const perfilNombreCompleto = document.getElementById("perfilNombreCompleto");
const perfilRol = document.getElementById("perfilRol");
const perfilEmail = document.getElementById("perfilEmail");
/*Form actualizar*/ 
const perfilNombre = document.getElementById("perfilNombre");
const perfilPrimerApellido = document.getElementById("perfilPrimerApellido");
const perfilSegundoApellido = document.getElementById("perfilSegundoApellido");
/*Acciones*/
const confirmDeleteEmail = document.getElementById("confirmDeleteEmail");
const form = document.getElementById("formPerfil");

/*URLs*/
const BASE_API_URL = 'http://localhost:8080/ecoScan_rest/api/usuario';
const UPDATE_PROFILE = `${BASE_API_URL}/update`;

let idUsuario = null;

async function cargarPerfil() {

    try{
        const profile = await getUserProfile().catch(err => {
            console.warn("No se pudo obtener el perfil, usando valores por defecto", err);
            return null;
        });

        if (profile) {
            if (perfilNombreCompleto) perfilNombreCompleto.textContent = profile.nombre + " " + profile.primerApellido + " " + profile.segundoApellido;
            if (perfilRol) perfilRol.textContent = profile.rol;
            if (perfilEmail) perfilEmail.value = profile.email;
            if (perfilNombre) perfilNombre.value = profile.nombre;
            if (perfilPrimerApellido) perfilPrimerApellido.value = profile.primerApellido;
            if (perfilSegundoApellido) perfilSegundoApellido.value = profile.segundoApellido;
            idUsuario = profile.idUsuario;
        } else {
            if (perfilNombreCompleto) perfilNombreCompleto.textContent = 'Cargando...';
            if (perfilRol) perfilRol.textContent = 'Cargando...';
            if (perfilEmail) perfilEmail.textContent = 'Cargando...';
            idUsuario = null;
        }
    } catch(e){
        console.error("Error rellenando topbar", e);
        if (perfilNombreCompleto) perfilNombreCompleto.textContent = 'Error...';
        if (perfilRol) perfilRol.textContent = 'Error...';
        if (perfilEmail) perfilEmail.value = 'Error...';
        if (perfilNombre) perfilNombre.value = 'Error...';
        if (perfilPrimerApellido) perfilPrimerApellido.value = 'Error...';
        if (perfilSegundoApellido) perfilSegundoApellido.value = 'Error...';
    }
}

async function actualizarPerfil(e){
    e.preventDefault();

    const nombre = perfilNombre.value.trim();
    const primerApellido = perfilPrimerApellido.value.trim();
    const segundoApellido = perfilSegundoApellido.value.trim();

    if(!nombre || !primerApellido){
        showToast("Nombre y primer apellido son obligatorios");
        return;
    } 

    console.log(idUsuario);

    try {
        const response = await fetch(UPDATE_PROFILE, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            },
            body: JSON.stringify({
                idUsuario,
                nombre, 
                primerApellido,
                segundoApellido
            })
        });

        if(!response.ok){
            const errorData = await response.json();
            console.log("Error backend:", errorData);
            throw new Error(errorData.message || "Error al actualizar el usuario");
        }

        showToast("Perfil actualizado correctamente");
        clearUserProfile();
        await getUserProfile({ forceRefresh: true })
        await cargarPerfil();

        document.dispatchEvent(new CustomEvent('userUpdated'));

    } catch (error) {
        console.error(error);
        showToast("No se pudo actualizar el perfil");
    }
}

async function recargarDatosPerfil(){
    try {
        showToast("Sincronizando datos...");
        clearUserProfile();
        await cargarPerfil(true);

        document.dispatchEvent(new CustomEvent('userUpdated'));

        showToast("Datos actualizados correctamente");
    } catch (error) {
        showToast("No se pudieron recargar los datos");
    }
}

function cerrarSesion(){
    clearUserProfile();
    localStorage.clear();

    window.location.href = "./index.html"
}

export async function initConfiguration(){
    await cargarPerfil();

    if(form) {
        form.addEventListener("submit", actualizarPerfil)
    }
}

document.addEventListener('DOMContentLoaded', cargarPerfil);

window.recargarDatosPerfil = recargarDatosPerfil;
window.cerrarSesion = cerrarSesion;