import { showToast } from './utils.js';

const BASE_API_URL = '/api/usuario';
const GET_ALL = `${BASE_API_URL}/getall`;
const CREATE = `${BASE_API_URL}/register`;
const UPDATE = `${BASE_API_URL}/update`;
const DELETE = `${BASE_API_URL}`;

let usuarios = [];
let usuarioIdEliminar = null;

async function cargarUsuarios() {
    const tbody = document.getElementById('tablaUsuariosBody');
    const loadingRow = document.getElementById('loadingRow');
    const sinUsuarios = document.getElementById('sinUsuarios');

    if (!tbody) return;

    try {
        const response = await fetch(GET_ALL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            throw new Error("Error al cargar usuarios");
        }

        usuarios = await response.json();
        actualizarTablaUsuarios(usuarios);

    } catch (error) {
        console.error(error);
        showToast("Error al cargar usuarios");
        if (loadingRow) loadingRow.remove();
    }
}

function actualizarTablaUsuarios(usuariosData) {
    const tbody = document.getElementById('tablaUsuariosBody');
    const sinUsuarios = document.getElementById('sinUsuarios');
    const loadingRow = document.getElementById('loadingRow');
    const contadorUsuarios = document.getElementById('contadorUsuarios');

    if (!tbody) return;

    if (loadingRow) loadingRow.remove();

    tbody.innerHTML = '';

    if (!usuariosData || usuariosData.length === 0) {
        if (sinUsuarios) sinUsuarios.classList.remove('d-none');
        if (contadorUsuarios) contadorUsuarios.innerHTML = '<i class="bi bi-people me-1"></i>0 usuarios';
        return;
    }

    if (sinUsuarios) sinUsuarios.classList.add('d-none');
    if (contadorUsuarios) contadorUsuarios.innerHTML = `<i class="bi bi-people me-1"></i>${usuariosData.length} usuarios`;

    usuariosData.forEach(usuario => {
        const nombreCompleto = `${usuario.nombre} ${usuario.primerApellido || ''} ${usuario.segundoApellido || ''}`.trim();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-3">${usuario.idUsuario}</td>
            <td>${nombreCompleto}</td>
            <td>${usuario.email}</td>
            <td><span class="badge bg-success">${usuario.rol}</span></td>
            <td class="text-end text-md-center">
                <div class="d-inline-flex gap-1">
                    <button class="btn btn-action btn-ver" onclick="verUsuario(${usuario.idUsuario})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-action btn-editar" onclick="editarUsuario(${usuario.idUsuario})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-action btn-eliminar" onclick="confirmarEliminarUsuario(${usuario.idUsuario})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarUsuarios() {
    const busqueda = document.getElementById('buscadorUsuario');
    if (!busqueda || !usuarios.length) return;

    const termino = busqueda.value.trim().toLowerCase();

    const filtrados = usuarios.filter(usuario => {
        const nombreCompleto = `${usuario.nombre} ${usuario.primerApellido || ''} ${usuario.segundoApellido || ''}`.toLowerCase();
        return nombreCompleto.includes(termino) ||
            usuario.email.toLowerCase().includes(termino) ||
            String(usuario.idUsuario).includes(termino);
    });

    actualizarTablaUsuarios(filtrados);
}

function verUsuario(id) {
    const usuario = usuarios.find(u => u.idUsuario === id);
    if (!usuario) return;

    const nombreCompleto = `${usuario.nombre} ${usuario.primerApellido || ''} ${usuario.segundoApellido || ''}`.trim();

    document.getElementById('verUsuarioId').textContent = usuario.idUsuario;
    document.getElementById('verUsuarioRol').textContent = usuario.rol || '-';
    document.getElementById('verUsuarioNombre').textContent = nombreCompleto || '-';
    document.getElementById('verUsuarioEmail').textContent = usuario.email || '-';

    const verUsuarioModal = new bootstrap.Modal(document.getElementById('verUsuarioModal'));
    verUsuarioModal.show();
}

function editarUsuario(id) {
    const usuario = usuarios.find(u => u.idUsuario === id);
    if (!usuario) return;

    document.getElementById('usuarioId').value = usuario.idUsuario;
    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('primerApellido').value = usuario.primerApellido || '';
    document.getElementById('segundoApellido').value = usuario.segundoApellido || '';
    document.getElementById('email').value = usuario.email;

    document.getElementById('usuarioModalLabel').textContent = 'Editar Usuario';

    const passwordInput = document.getElementById('password');
    passwordInput.value = '';
    passwordInput.required = false;

    document.getElementById('passwordHint').textContent = "Déjalo vacío si no deseas cambiarlo";

    const usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    usuarioModal.show();
}


function confirmarEliminarUsuario(id) {
    const usuario = usuarios.find(u => u.idUsuario === id);
    if (!usuario) return;

    usuarioIdEliminar = id;

    const nombreCompleto = `${usuario.nombre} ${usuario.primerApellido || ''}`.trim();
    document.getElementById('deleteUsuarioNombre').textContent = nombreCompleto;

    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    confirmDeleteModal.show();
}

async function eliminarUsuario() {
    if (!usuarioIdEliminar) return;

    try {
        const response = await fetch(`${DELETE}/?idUsuario=${usuarioIdEliminar}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar usuario");
        }

        showToast("Usuario eliminado correctamente");

        const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        if (confirmDeleteModal) confirmDeleteModal.hide();

        usuarioIdEliminar = null;
        await cargarUsuarios();

    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar el usuario");
    }
}

function limpiarFormulario() {
    document.getElementById('usuarioId').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('primerApellido').value = '';
    document.getElementById('segundoApellido').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';

    document.getElementById('usuarioModalLabel').textContent = 'Nuevo Usuario';

    const passwordInput = document.getElementById('password');
    passwordInput.required = true;

    document.getElementById('passwordHint').textContent = "Solo requerido para nuevos usuarios";
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('togglePasswordIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }
}

async function guardarUsuario(e) {
    e.preventDefault();

    const usuarioId = document.getElementById('usuarioId').value;
    const nombre = document.getElementById('nombre').value.trim();
    const primerApellido = document.getElementById('primerApellido').value.trim();
    const segundoApellido = document.getElementById('segundoApellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!nombre) {
        showToast("El nombre es obligatorio");
        return;
    }

    if (!primerApellido) {
        showToast("El primer apellido es obligatorio");
        return;
    }

    if (!email) {
        showToast("El email es obligatorio");
        return;
    }

    if (!usuarioId && !password) {
        showToast("El password es obligatorio para nuevos usuarios");
        return;
    }

    try {
        let response;
        let bodyData = {
            nombre,
            primerApellido,
            segundoApellido: segundoApellido || null,
            email
        };

        if (usuarioId) {
            const updateData = {
                idUsuario: parseInt(usuarioId),
                nombre,
                primerApellido,
                segundoApellido: segundoApellido || null
            };
            response = await fetch(UPDATE, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("authToken")
                },
                body: JSON.stringify(updateData)
            });
        } else {
            bodyData.password = password;
            response = await fetch(CREATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("authToken")
                },
                body: JSON.stringify(bodyData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al guardar usuario");
        }

        showToast(usuarioId ? "Usuario actualizado correctamente" : "Usuario creado correctamente");

        if (usuarioId) {
            const emailLogueado = localStorage.getItem("email");

            if (email === emailLogueado) {
                document.dispatchEvent(new Event('userUpdated'));
            }
        }

        const usuarioModal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
        if (usuarioModal) usuarioModal.hide();

        limpiarFormulario();
        await cargarUsuarios();

    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar el usuario");
    }
}

export async function initUsuarios() {
    await cargarUsuarios();
}

window.verUsuario = verUsuario;
window.editarUsuario = editarUsuario;
window.confirmarEliminarUsuario = confirmarEliminarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.limpiarFormulario = limpiarFormulario;
window.guardarUsuario = guardarUsuario;
window.filtrarUsuarios = filtrarUsuarios;
window.togglePassword = togglePassword;