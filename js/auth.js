// js/auth.js
import { displayError, clearError, displayMessage, clearMessage } from './utils.js';
const logoutButton = document.getElementById('btnLogout');
const showLoginLink = document.getElementById('show-login');

const loginError = document.getElementById('auth-error');
const authMessage = document.getElementById('auth-message'); 

const BASE_API_URL = 'http://localhost:8080/ecoScan_rest/api/usuario';
const LOGIN_API_URL = `${BASE_API_URL}/login`;

function isPathMatch(pathname, candidates) {
    return candidates.some(c => {
        if (c === '/') return pathname === '/';
        return pathname.endsWith(c);
    });
}

function safeDisplayMessage(el, msg) {
    if (!el) {
        console.warn('Elemento de mensaje no encontrado, mensaje descartado:', msg);
        return;
    }
    displayMessage(el, msg);
}

const loginForm = document.getElementById('login-form');

function safeDisplayError(el, msg) {
    if (!el) {
        console.warn('Elemento de error no encontrado, mensaje descartado:', msg);
        return;
    }
    displayError(el, msg);
}


function safeClearError(el) {
    if (!el) return;
    clearError(el);
}

function safeClearMessage(el) {
    if (!el) return;
    clearMessage(el);
}

function checkAuthStatus() {
    console.log('--- checkAuthStatus called ---');
    const authToken = localStorage.getItem('authToken');
    console.log('authToken:', authToken ? 'exists' : 'does not exist');

    const pathname = window.location.pathname || '/';
    console.log('Current path:', pathname);

    const isOnLoginPage = isPathMatch(pathname, ['index.html']);

    console.log('Is on login page:', isOnLoginPage);

    if (authToken) {
        console.log('User is authenticated.');
        if (isOnLoginPage) {
            console.log('On auth page with token. Redirecting to landingPage.html');
            if (!pathname.endsWith('inicio.html')) {
                window.location.href = 'inicio.html';
            }
        } else {
            console.log('Authenticated and not on auth pages — no redirect.');
        }
    } else {
        console.log('User is NOT authenticated.');
        if (!isOnLoginPage) {
            console.log('Not on allowed public page without token. Redirecting to index.html');
            if (!pathname.endsWith('index.html')) {
                window.location.href = 'index.html';
            } else {
                if (pathname !== '/' && !pathname.endsWith('index.html')) {
                    window.location.href = 'index.html';
                } else {
                    console.log('Already on index/root — no redirect.');
                }
            }
        } else {
            console.log('On allowed public page (login/register) and not authenticated — stay here.');
        }
    }
    console.log('--- checkAuthStatus end ---');
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        safeClearError(loginError);
        safeClearMessage(authMessage);

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password }),
            });

            let responseData = {};
            try {
                responseData = await response.json();
            } catch (jsonError) {
                console.warn('No JSON en respuesta de login. Status:', response.status, jsonError);
            }

            console.log('Respuesta de la API de login:', responseData);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
                } else if (response.status === 400) {
                    throw new Error(responseData.message || 'Solicitud incorrecta. Verifica tus datos.');
                } else {
                    throw new Error(responseData.message || 'Error en el servidor durante login.');
                }
            }

            if (responseData.token) {
                localStorage.setItem('email', username);
                localStorage.setItem('authToken', responseData.token);
                safeDisplayMessage(authMessage, '¡Inicio de sesión exitoso!');
                console.log('Login successful. Redirecting to landingPage.html');
                window.location.href = 'inicio.html';
            } else {
                safeDisplayError(loginError, 'Respuesta inesperada: no se recibió access_token.');
            }

        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
            safeDisplayError(loginError, error.message || 'Error al conectar con el servidor.');
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        console.log('Logout button clicked. Removing token and redirecting to login.html');
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (typeof showLoginView === 'function') {
            showLoginView();
        } else {
            window.location.href = 'index.html';
        }
    });
}

document.addEventListener('DOMContentLoaded', checkAuthStatus);