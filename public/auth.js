// Configuração do Firebase (compartilhada no arquivo HTML)
const firebaseConfig = {
  apiKey: "AIzaSyAaxV6VvQ0xWXQkxSBIiYYaKzLMcYWyY2E",
  authDomain: "sistema-clinica-a8bc0.firebaseapp.com",
  projectId: "sistema-clinica-a8bc0",
  storageBucket: "sistema-clinica-a8bc0.appspot.com",
  messagingSenderId: "358716597367",
  appId: "1:358716597367:web:c25e427d1ee6c00b2d1272"
};

// Inicializa o Firebase apenas uma vez no arquivo auth.js
firebase.initializeApp(firebaseConfig);

// Função de login
function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then(() => {
      window.location.href = "dashboard.html";  // Redireciona para o dashboard após login
    })
    .catch((error) => {
      document.getElementById("erro").textContent = "Erro: " + error.message;
    });
}

// Protege o dashboard (e outras páginas que requerem autenticação)
function protegerPagina() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "login.html";  // Redireciona para a página de login se o usuário não estiver autenticado
    }
  });
}

// Função de logout
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";  // Redireciona para a página de login após logout
  });
}

// Verifica se o usuário está logado e redireciona de acordo com a página atual
firebase.auth().onAuthStateChanged((user) => {
  if (window.location.pathname.includes("login.html") && user) {
    window.location.href = "dashboard.html";  // Se o usuário já estiver logado, redireciona para o dashboard
  }

  if (window.location.pathname.includes("dashboard.html") || window.location.pathname.includes("consultas.html")) {
    protegerPagina();  // Protege as páginas de dashboard e outras
  }
});

// Funcionalidade para o botão de logout
document.getElementById("logoutButton")?.addEventListener("click", logout);
