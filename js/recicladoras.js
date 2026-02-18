import { showToast } from './utils.js';

const BASE_API_URL = 'http://localhost:8080/ecoScan_rest/api/recicladora';
const GET_ALL = `${BASE_API_URL}/getall`;
const GET_ACTIVAS = `${BASE_API_URL}/activas`;
const GET_INACTIVAS = `${BASE_API_URL}/inactivas`;
const CREATE = BASE_API_URL;
const UPDATE = BASE_API_URL;
const DELETE = BASE_API_URL;
const REACTIVAR = `${BASE_API_URL}/reactivar`;
const GET_MATERIALES = `${BASE_API_URL}/materiales`;
const ADD_MATERIAL = `${BASE_API_URL}/materiales`;
const DELETE_MATERIAL = `${BASE_API_URL}/materiales`;
const GET_HORARIOS = `${BASE_API_URL}/horarios`;
const ADD_HORARIO = `${BASE_API_URL}/horarios`;
const UPDATE_HORARIO = `${BASE_API_URL}/horarios`;
const DELETE_HORARIO = `${BASE_API_URL}/horarios`;

let recicladoras = [];
let materialesRecicladora = [];
let horariosRecicladora = [];
let materialesGlobal = [];
let recicladoraIdEliminar = null;
let materialIdEliminar = null;
let horarioIdEliminar = null;

async function cargarRecicladoras() {
    const tbody = document.getElementById('tablaRecicladorasBody');
    const loadingRow = document.getElementById('loadingRow');
    const sinRecicladoras = document.getElementById('sinRecicladoras');

    if (!tbody) return;

    const soloActivas = document.getElementById('soloActivas')?.checked || false;
    const url = soloActivas ? GET_ACTIVAS : GET_ALL;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            throw new Error("Error al cargar recicladoras");
        }

        recicladoras = await response.json();
        actualizarTablaRecicladoras(recicladoras);

    } catch (error) {
        console.error(error);
        showToast("Error al cargar recicladoras");
        if (loadingRow) loadingRow.remove();
    }
}

function actualizarTablaRecicladoras(recicladorasData) {
    const tbody = document.getElementById('tablaRecicladorasBody');
    const sinRecicladoras = document.getElementById('sinRecicladoras');
    const loadingRow = document.getElementById('loadingRow');
    const contadorRecicladoras = document.getElementById('contadorRecicladoras');

    if (!tbody) return;

    if (loadingRow) loadingRow.remove();

    tbody.innerHTML = '';

    if (!recicladorasData || recicladorasData.length === 0) {
        if (sinRecicladoras) sinRecicladoras.classList.remove('d-none');
        if (contadorRecicladoras) contadorRecicladoras.innerHTML = '<i class="bi bi-building me-1"></i>0 recicladoras';
        return;
    }

    if (sinRecicladoras) sinRecicladoras.classList.add('d-none');
    if (contadorRecicladoras) contadorRecicladoras.innerHTML = `<i class="bi bi-building me-1"></i>${recicladorasData.length} recicladoras`;

    recicladorasData.forEach(recicladora => {
        const estadoBadge = recicladora.activa 
            ? '<span class="badge bg-success badge-estado">Activa</span>'
            : '<span class="badge bg-secondary badge-estado">Inactiva</span>';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-3">${recicladora.idRecicladora}</td>
            <td class="fw-semibold">${recicladora.nombreRecicladora}</td>
            <td class="hide-mobile">${recicladora.direccion || '-'}</td>
            <td>${estadoBadge}</td>
            <td class="text-end text-md-center">
                <div class="d-inline-flex gap-1">
                    <button class="btn btn-action btn-ver" onclick="verRecicladora(${recicladora.idRecicladora})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-action btn-editar" onclick="editarRecicladora(${recicladora.idRecicladora})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-action btn-gestionar" onclick="gestionarRecicladora(${recicladora.idRecicladora})" title="Gestionar Materiales y Horarios">
                        <i class="bi bi-gear"></i>
                    </button>
                    ${recicladora.activa 
                        ? `<button class="btn btn-action btn-eliminar" onclick="confirmarEliminarRecicladora(${recicladora.idRecicladora})" title="Desactivar">
                            <i class="bi bi-power"></i>
                           </button>`
                        : `<button class="btn btn-action" style="background-color: rgba(25, 135, 84, 0.15); color: #198754; border: none;" onclick="reactivarRecicladora(${recicladora.idRecicladora})" title="Reactivar">
                            <i class="bi bi-arrow-counterclockwise"></i>
                           </button>`
                    }
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarRecicladoras() {
    const busqueda = document.getElementById('buscadorRecicladora');
    if (!busqueda || !recicladoras.length) return;

    const termino = busqueda.value.trim().toLowerCase();

    const filtrados = recicladoras.filter(recicladora =>
        recicladora.nombreRecicladora.toLowerCase().includes(termino) ||
        (recicladora.direccion && recicladora.direccion.toLowerCase().includes(termino)) ||
        String(recicladora.idRecicladora).includes(termino)
    );

    actualizarTablaRecicladoras(filtrados);
}

function verRecicladora(id) {
    const recicladora = recicladoras.find(r => r.idRecicladora === id);
    if (!recicladora) return;

    document.getElementById('verRecicladoraId').textContent = recicladora.idRecicladora;
    document.getElementById('verRecicladoraNombre').textContent = recicladora.nombreRecicladora || '-';
    document.getElementById('verRecicladoraDireccion').textContent = recicladora.direccion || '-';
    
    const estadoBadge = recicladora.activa 
        ? '<span class="badge bg-success">Activa</span>'
        : '<span class="badge bg-secondary">Inactiva</span>';
    document.getElementById('verRecicladoraEstado').innerHTML = estadoBadge;

    const ubicacion = [];
    if (recicladora.latitud) ubicacion.push(`Lat: ${recicladora.latitud}`);
    if (recicladora.longitud) ubicacion.push(`Lng: ${recicladora.longitud}`);
    document.getElementById('verRecicladoraUbicacion').textContent = ubicacion.length > 0 ? ubicacion.join(' | ') : '-';

    const verRecicladoraModal = new bootstrap.Modal(document.getElementById('verRecicladoraModal'));
    verRecicladoraModal.show();
}

function editarRecicladora(id) {
    const recicladora = recicladoras.find(r => r.idRecicladora === id);
    if (!recicladora) return;

    document.getElementById('recicladoraId').value = recicladora.idRecicladora;
    document.getElementById('nombreRecicladora').value = recicladora.nombreRecicladora || '';
    document.getElementById('direccionRecicladora').value = recicladora.direccion || '';
    document.getElementById('latitudRecicladora').value = recicladora.latitud || '';
    document.getElementById('longitudRecicladora').value = recicladora.longitud || '';
    document.getElementById('activaRecicladora').checked = recicladora.activa;

    document.getElementById('recicladoraModalLabel').textContent = 'Editar Recicladora';

    const recicladoraModal = new bootstrap.Modal(document.getElementById('recicladoraModal'));
    recicladoraModal.show();
}

function confirmarEliminarRecicladora(id) {
    const recicladora = recicladoras.find(r => r.idRecicladora === id);
    if (!recicladora) return;

    recicladoraIdEliminar = id;
    document.getElementById('deleteRecicladoraNombre').textContent = recicladora.nombreRecicladora;

    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteRecicladoraModal'));
    confirmDeleteModal.show();
}

async function eliminarRecicladora() {
    if (!recicladoraIdEliminar) return;

    try {
        const response = await fetch(`${DELETE}/?idRecicladora=${recicladoraIdEliminar}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar recicladora");
        }

        showToast("Recicladora desactivada correctamente");

        const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteRecicladoraModal'));
        if (confirmDeleteModal) confirmDeleteModal.hide();

        recicladoraIdEliminar = null;
        await cargarRecicladoras();

    } catch (error) {
        console.error(error);
        showToast("No se pudo desactivar la recicladora");
    }
}

async function reactivarRecicladora(id) {
    try {
        const response = await fetch(`${REACTIVAR}/?idRecicladora=${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al reactivar recicladora");
        }

        showToast("Recicladora reactivada correctamente");
        await cargarRecicladoras();

    } catch (error) {
        console.error(error);
        showToast("No se pudo reactivar la recicladora");
    }
}

function limpiarFormularioRecicladora() {
    document.getElementById('recicladoraId').value = '';
    document.getElementById('nombreRecicladora').value = '';
    document.getElementById('direccionRecicladora').value = '';
    document.getElementById('latitudRecicladora').value = '';
    document.getElementById('longitudRecicladora').value = '';
    document.getElementById('activaRecicladora').checked = true;
    document.getElementById('recicladoraModalLabel').textContent = 'Nueva Recicladora';
    
    document.getElementById('nombreRecicladora').classList.remove('is-invalid');
    document.getElementById('direccionRecicladora').classList.remove('is-invalid');
    document.getElementById('nombreRecicladoraError').textContent = '';
    document.getElementById('direccionRecicladoraError').textContent = '';
}

async function guardarRecicladora(e) {
    e.preventDefault();

    const recicladoraId = document.getElementById('recicladoraId').value;
    const nombreRecicladora = document.getElementById('nombreRecicladora').value.trim();
    const direccion = document.getElementById('direccionRecicladora').value.trim();
    const latitud = document.getElementById('latitudRecicladora').value.trim();
    const longitud = document.getElementById('longitudRecicladora').value.trim();
    const estado = document.getElementById('activaRecicladora').checked;

    if (!nombreRecicladora) {
        showToast("El nombre de la recicladora es obligatorio");
        return;
    }

    if (!direccion) {
        showToast("La dirección es obligatoria");
        return;
    }

    try {
        let response;

        if (recicladoraId) {
            response = await fetch(UPDATE, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("authToken")
                },
                body: JSON.stringify({
                    idRecicladora: parseInt(recicladoraId),
                    nombreRecicladora,
                    direccion,
                    latitud: latitud || null,
                    longitud: longitud || null
                })
            });
        } else {
            response = await fetch(CREATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("authToken")
                },
                body: JSON.stringify({
                    nombreRecicladora,
                    direccion,
                    latitud: latitud || null,
                    longitud: longitud || null
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al guardar recicladora");
        }

        showToast(recicladoraId ? "Recicladora actualizada correctamente" : "Recicladora creada correctamente");

        const recicladoraModal = bootstrap.Modal.getInstance(document.getElementById('recicladoraModal'));
        if (recicladoraModal) recicladoraModal.hide();

        limpiarFormularioRecicladora();
        await cargarRecicladoras();

    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar la recicladora");
    }
}

async function gestionarRecicladora(id) {
    const recicladora = recicladoras.find(r => r.idRecicladora === id);
    if (!recicladora) return;

    document.getElementById('gestionarRecicladoraId').value = id;
    document.getElementById('gestionarRecicladoraSubtitulo').textContent = recicladora.nombreRecicladora;

    await Promise.all([
        cargarMaterialesRecicladora(id),
        cargarHorariosRecicladora(id),
        cargarSelectMateriales()
    ]);

    const gestionarModal = new bootstrap.Modal(document.getElementById('gestionarRecicladoraModal'));
    gestionarModal.show();
}

async function cargarMaterialesRecicladora(idRecicladora) {
    try {
        const response = await fetch(`${GET_MATERIALES}?idRecicladora=${idRecicladora}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            throw new Error("Error al cargar materiales");
        }

        materialesRecicladora = await response.json();
        actualizarTablaMaterialesRecicladora();

    } catch (error) {
        console.error(error);
        showToast("Error al cargar materiales");
    }
}

function actualizarTablaMaterialesRecicladora() {
    const tbody = document.getElementById('tablaMaterialesRecicladoraBody');
    const badgeMateriales = document.getElementById('badgeMateriales');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (!materialesRecicladora || materialesRecicladora.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-3 text-muted">
                    <i class="bi bi-inbox me-2"></i>No hay materiales vinculados
                </td>
            </tr>
        `;
        if (badgeMateriales) badgeMateriales.textContent = '0';
        return;
    }

    if (badgeMateriales) badgeMateriales.textContent = materialesRecicladora.length;

    materialesRecicladora.forEach(material => {
        const idRecicladora = document.getElementById('gestionarRecicladoraId').value;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${material.idMaterial}</td>
            <td>${material.nombreMaterial || material.nombre || '-'}</td>
            <td class="text-end">
                <button class="btn btn-eliminar-mini btn-eliminar" onclick="confirmarEliminarMaterialRecicladora(${material.idMaterial}, ${idRecicladora})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cargarSelectMateriales() {
    try {
        const response = await fetch('http://localhost:8080/ecoScan_rest/api/material/getall', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            throw new Error("Error al cargar materiales");
        }

        materialesGlobal = await response.json();
        const select = document.getElementById('selectMaterial');
        
        if (!select) return;

        select.innerHTML = '<option value="">-- Selecciona un material --</option>';
        
        materialesGlobal.forEach(material => {
            const yaAgregado = materialesRecicladora.some(m => m.idMaterial === material.idMaterial);
            if (!yaAgregado) {
                const option = document.createElement('option');
                option.value = material.idMaterial;
                option.textContent = material.nombreMaterial;
                select.appendChild(option);
            }
        });

    } catch (error) {
        console.error(error);
        showToast("Error al cargar materiales");
    }
}

function prepararAgregarMaterial() {
    document.getElementById('recicladoraIdMaterial').value = document.getElementById('gestionarRecicladoraId').value;
    cargarSelectMateriales();
}

async function agregarMaterialRecicladora(e) {
    e.preventDefault();

    const idRecicladora = document.getElementById('recicladoraIdMaterial').value;
    const idMaterial = document.getElementById('selectMaterial').value;

    if (!idRecicladora || !idMaterial) {
        showToast("Selecciona un material");
        return;
    }

    try {
        const response = await fetch(ADD_MATERIAL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            },
            body: JSON.stringify({
                idRecicladora: parseInt(idRecicladora),
                idMaterial: parseInt(idMaterial)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al agregar material");
        }

        showToast("Material agregado correctamente");

        const agregarMaterialModal = bootstrap.Modal.getInstance(document.getElementById('agregarMaterialModal'));
        if (agregarMaterialModal) agregarMaterialModal.hide();

        document.getElementById('selectMaterial').value = '';
        await cargarMaterialesRecicladora(parseInt(idRecicladora));

    } catch (error) {
        console.error(error);
        showToast("No se pudo agregar el material");
    }
}

function confirmarEliminarMaterialRecicladora(idMaterial, idRecicladora) {
    materialIdEliminar = { idMaterial, idRecicladora };
    
    const material = materialesRecicladora.find(m => m.idMaterial === idMaterial);
    document.getElementById('deleteMaterialNombre').textContent = material?.nombreMaterial || material?.nombre || '-';

    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteMaterialRecicladoraModal'));
    confirmDeleteModal.show();
}

async function eliminarMaterialRecicladora() {
    if (!materialIdEliminar) return;

    try {
        const response = await fetch(`${DELETE_MATERIAL}?idRecicladora=${materialIdEliminar.idRecicladora}&idMaterial=${materialIdEliminar.idMaterial}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar material");
        }

        showToast("Material eliminado correctamente");

        const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteMaterialRecicladoraModal'));
        if (confirmDeleteModal) confirmDeleteModal.hide();

        await cargarMaterialesRecicladora(materialIdEliminar.idRecicladora);
        materialIdEliminar = null;

    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar el material");
    }
}

async function cargarHorariosRecicladora(idRecicladora) {
    try {
        const response = await fetch(`${GET_HORARIOS}?idRecicladora=${idRecicladora}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            throw new Error("Error al cargar horarios");
        }

        horariosRecicladora = await response.json();
        actualizarTablaHorariosRecicladora();

    } catch (error) {
        console.error(error);
        showToast("Error al cargar horarios");
    }
}

function actualizarTablaHorariosRecicladora() {
    const tbody = document.getElementById('tablaHorariosRecicladoraBody');
    const badgeHorarios = document.getElementById('badgeHorarios');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (!horariosRecicladora || horariosRecicladora.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-3 text-muted">
                    <i class="bi bi-inbox me-2"></i>No hay horarios registrados
                </td>
            </tr>
        `;
        if (badgeHorarios) badgeHorarios.textContent = '0';
        return;
    }

    if (badgeHorarios) badgeHorarios.textContent = horariosRecicladora.length;

    const diasSemana = {
        'LUNES': 'Lunes',
        'MARTES': 'Martes',
        'MIERCOLES': 'Miércoles',
        'JUEVES': 'Jueves',
        'VIERNES': 'Viernes',
        'SABADO': 'Sábado',
        'DOMINGO': 'Domingo'
    };

    horariosRecicladora.forEach(horario => {
        const idRecicladora = document.getElementById('gestionarRecicladoraId').value;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-semibold">${diasSemana[horario.diaSemana] || horario.diaSemana}</td>
            <td>${horario.horaApertura || '-'}</td>
            <td>${horario.horaCierre || '-'}</td>
            <td class="text-end">
                <div class="d-inline-flex gap-1">
                    <button class="btn btn-eliminar-mini btn-editar" onclick="editarHorarioRecicladora(${horario.idHorario}, '${horario.diaSemana}', '${horario.horaApertura}', '${horario.horaCierre}', ${idRecicladora})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-eliminar-mini btn-eliminar" onclick="confirmarEliminarHorarioRecicladora(${horario.idHorario}, '${horario.diaSemana}', ${idRecicladora})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepararAgregarHorario() {
    document.getElementById('horarioId').value = '';
    document.getElementById('recicladoraIdHorario').value = document.getElementById('gestionarRecicladoraId').value;
    document.getElementById('diaSemana').value = '';
    document.getElementById('horaInicio').value = '';
    document.getElementById('horaFin').value = '';
    document.getElementById('agregarHorarioModalLabel').textContent = 'Agregar Horario';
}

function editarHorarioRecicladora(idHorario, diaSemana, horaApertura, horaCierre, idRecicladora) {
    document.getElementById('horarioId').value = idHorario;
    document.getElementById('recicladoraIdHorario').value = idRecicladora;
    document.getElementById('diaSemana').value = diaSemana;
    document.getElementById('horaInicio').value = horaApertura;
    document.getElementById('horaFin').value = horaCierre;
    document.getElementById('agregarHorarioModalLabel').textContent = 'Editar Horario';

    const agregarHorarioModal = new bootstrap.Modal(document.getElementById('agregarHorarioModal'));
    agregarHorarioModal.show();
}

async function guardarHorarioRecicladora(e) {
    e.preventDefault();

    const horarioId = document.getElementById('horarioId').value;
    const idRecicladora = document.getElementById('recicladoraIdHorario').value;
    const diaSemana = document.getElementById('diaSemana').value;
    const horaApertura = document.getElementById('horaInicio').value;
    const horaCierre = document.getElementById('horaFin').value;

    if (!diaSemana || !horaApertura || !horaCierre) {
        showToast("Completa todos los campos");
        return;
    }

    try {
        let response;

        if (horarioId) {
            response = await fetch(UPDATE_HORARIO, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("authToken")
                },
                body: JSON.stringify({
                    idHorario: parseInt(horarioId),
                    diaSemana,
                    horaApertura,
                    horaCierre
                })
            });
        } else {
            response = await fetch(`${ADD_HORARIO}?idRecicladora=${idRecicladora}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("authToken")
                },
                body: JSON.stringify({
                    diaSemana,
                    horaApertura,
                    horaCierre
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al guardar horario");
        }

        showToast(horarioId ? "Horario actualizado correctamente" : "Horario agregado correctamente");

        const agregarHorarioModal = bootstrap.Modal.getInstance(document.getElementById('agregarHorarioModal'));
        if (agregarHorarioModal) agregarHorarioModal.hide();

        prepararAgregarHorario();
        await cargarHorariosRecicladora(parseInt(idRecicladora));

    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar el horario");
    }
}

function confirmarEliminarHorarioRecicladora(idHorario, diaSemana, idRecicladora) {
    horarioIdEliminar = { idHorario, idRecicladora };
    
    const diasSemana = {
        'LUNES': 'Lunes',
        'MARTES': 'Martes',
        'MIERCOLES': 'Miércoles',
        'JUEVES': 'Jueves',
        'VIERNES': 'Viernes',
        'SABADO': 'Sábado',
        'DOMINGO': 'Domingo'
    };
    
    document.getElementById('deleteHorarioDia').textContent = diasSemana[diaSemana] || diaSemana;

    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteHorarioModal'));
    confirmDeleteModal.show();
}

async function eliminarHorarioRecicladora() {
    if (!horarioIdEliminar) return;

    try {
        const response = await fetch(`${DELETE_HORARIO}?idHorario=${horarioIdEliminar.idHorario}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar horario");
        }

        showToast("Horario eliminado correctamente");

        const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteHorarioModal'));
        if (confirmDeleteModal) confirmDeleteModal.hide();

        await cargarHorariosRecicladora(horarioIdEliminar.idRecicladora);
        horarioIdEliminar = null;

    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar el horario");
    }
}

export async function initRecicladoras() {
    await cargarRecicladoras();
}

window.cargarRecicladoras = cargarRecicladoras;
window.filtrarRecicladoras = filtrarRecicladoras;
window.limpiarFormularioRecicladora = limpiarFormularioRecicladora;
window.guardarRecicladora = guardarRecicladora;
window.verRecicladora = verRecicladora;
window.editarRecicladora = editarRecicladora;
window.confirmarEliminarRecicladora = confirmarEliminarRecicladora;
window.eliminarRecicladora = eliminarRecicladora;
window.reactivarRecicladora = reactivarRecicladora;
window.gestionarRecicladora = gestionarRecicladora;
window.prepararAgregarMaterial = prepararAgregarMaterial;
window.agregarMaterialRecicladora = agregarMaterialRecicladora;
window.confirmarEliminarMaterialRecicladora = confirmarEliminarMaterialRecicladora;
window.eliminarMaterialRecicladora = eliminarMaterialRecicladora;
window.prepararAgregarHorario = prepararAgregarHorario;
window.editarHorarioRecicladora = editarHorarioRecicladora;
window.guardarHorarioRecicladora = guardarHorarioRecicladora;
window.confirmarEliminarHorarioRecicladora = confirmarEliminarHorarioRecicladora;
window.eliminarHorarioRecicladora = eliminarHorarioRecicladora;
