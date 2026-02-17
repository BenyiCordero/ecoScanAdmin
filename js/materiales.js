import { showToast } from './utils.js';

const BASE_API_URL = 'http://localhost:8080/ecoScan_rest/api/material';
const GET_ALL = `${BASE_API_URL}/getall`;
const CREATE = `${BASE_API_URL}`;
const UPDATE = `${BASE_API_URL}`;
const DELETE = `${BASE_API_URL}`;

let materiales = [];
let materialIdEliminar = null;

async function cargarMateriales() {
    const tbody = document.getElementById('tablaMaterialesBody');
    const loadingRow = document.getElementById('loadingRow');
    const sinMateriales = document.getElementById('sinMateriales');

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
            throw new Error("Error al cargar materiales");
        }

        materiales = await response.json();
        actualizarTablaMateriales(materiales);

    } catch (error) {
        console.error(error);
        showToast("Error al cargar materiales");
        if (loadingRow) loadingRow.remove();
    }
}

function actualizarTablaMateriales(materialesData) {
    const tbody = document.getElementById('tablaMaterialesBody');
    const sinMateriales = document.getElementById('sinMateriales');
    const loadingRow = document.getElementById('loadingRow');
    const contadorMateriales = document.getElementById('contadorMateriales');

    if (!tbody) return;

    if (loadingRow) loadingRow.remove();

    tbody.innerHTML = '';

    if (!materialesData || materialesData.length === 0) {
        if (sinMateriales) sinMateriales.classList.remove('d-none');
        if (contadorMateriales) contadorMateriales.innerHTML = '<i class="bi bi-collection me-1"></i>0 materiales';
        return;
    }

    if (sinMateriales) sinMateriales.classList.add('d-none');
    if (contadorMateriales) contadorMateriales.innerHTML = `<i class="bi bi-collection me-1"></i>${materialesData.length} materiales`;

    materialesData.forEach(material => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-3">${material.idMaterial}</td>
            <td>${material.nombreMaterial}</td>
            <td class="text-end text-md-center">
                <div class="d-inline-flex gap-1">
                    <button class="btn btn-action btn-ver" onclick="verMaterial(${material.idMaterial})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-action btn-editar" onclick="editarMaterial(${material.idMaterial})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-action btn-eliminar" onclick="confirmarEliminarMaterial(${material.idMaterial})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarMateriales() {
    const busqueda = document.getElementById('buscadorMaterial');
    if (!busqueda || !materiales.length) return;

    const termino = busqueda.value.trim().toLowerCase();

    const filtrados = materiales.filter(material =>
        material.nombreMaterial.toLowerCase().includes(termino) ||
        String(material.idMaterial).includes(termino)
    );

    actualizarTablaMateriales(filtrados);
}

function verMaterial(id) {
    const material = materiales.find(m => m.idMaterial === id);
    if (!material) return;

    document.getElementById('verMaterialId').textContent = material.idMaterial;
    document.getElementById('verMaterialNombre').textContent = material.nombreMaterial || '-';

    const verMaterialModal = new bootstrap.Modal(document.getElementById('verMaterialModal'));
    verMaterialModal.show();
}

function editarMaterial(id) {
    const material = materiales.find(m => m.idMaterial === id);
    if (!material) return;

    document.getElementById('materialId').value = material.idMaterial;
    document.getElementById('nombreMaterial').value = material.nombreMaterial;
    document.getElementById('materialModalLabel').textContent = 'Editar Material';

    const materialModal = new bootstrap.Modal(document.getElementById('materialModal'));
    materialModal.show();
}

function confirmarEliminarMaterial(id) {
    const material = materiales.find(m => m.idMaterial === id);
    if (!material) return;

    materialIdEliminar = id;
    document.getElementById('deleteMaterialNombre').textContent = material.nombreMaterial;

    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    confirmDeleteModal.show();
}

async function eliminarMaterial() {
    if (!materialIdEliminar) return;

    try {
        const response = await fetch(`${DELETE}/?idMaterial=${materialIdEliminar}`, {
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
        
        const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        if (confirmDeleteModal) confirmDeleteModal.hide();

        materialIdEliminar = null;
        await cargarMateriales();

    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar el material");
    }
}

function limpiarFormulario() {
    document.getElementById('materialId').value = '';
    document.getElementById('nombreMaterial').value = '';
    document.getElementById('materialModalLabel').textContent = 'Nuevo Material';
    document.getElementById('nombreMaterial').classList.remove('is-invalid');
    document.getElementById('nombreMaterialError').textContent = '';
}

async function guardarMaterial(e) {
    e.preventDefault();

    const materialId = document.getElementById('materialId').value;
    const nombreMaterial = document.getElementById('nombreMaterial').value.trim();

    if (!nombreMaterial) {
        showToast("El nombre del material es obligatorio");
        return;
    }

    try {
        let response;

        if (materialId) {
            response = await fetch(UPDATE, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("authToken")
                },
                body: JSON.stringify({
                    idMaterial: parseInt(materialId),
                    nombreMaterial
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
                    nombreMaterial
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al guardar material");
        }

        showToast(materialId ? "Material actualizado correctamente" : "Material creado correctamente");

        const materialModal = bootstrap.Modal.getInstance(document.getElementById('materialModal'));
        if (materialModal) materialModal.hide();

        limpiarFormulario();
        await cargarMateriales();

    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar el material");
    }
}

export async function initMateriales() {
    await cargarMateriales();
}

window.verMaterial = verMaterial;
window.editarMaterial = editarMaterial;
window.confirmarEliminarMaterial = confirmarEliminarMaterial;
window.eliminarMaterial = eliminarMaterial;
window.limpiarFormulario = limpiarFormulario;
window.guardarMaterial = guardarMaterial;
window.filtrarMateriales = filtrarMateriales;