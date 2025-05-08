// Inicializa o Firestore
const db = firebase.firestore();

// Cadastrar novo paciente
function salvarNovoPaciente(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const nascimento = document.getElementById("nascimento").value;

  db.collection("pacientes").add({
    nome,
    telefone,
    nascimento,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    document.getElementById("mensagem").textContent = "Paciente cadastrado com sucesso!";
    document.getElementById("formPaciente").reset();
  })
  .catch((error) => {
    document.getElementById("mensagem").textContent = "Erro ao salvar: " + error.message;
  });
}

document.getElementById("formPaciente").addEventListener("submit", salvarNovoPaciente);

// Carrega e exibe pacientes
function carregarPacientes(filtroNome = "") {
    db.collection("pacientes").orderBy("criadoEm", "desc").onSnapshot((snapshot) => {
      const lista = document.getElementById("listaPacientes");
      lista.innerHTML = "";
  
      snapshot.forEach((doc) => {
        const paciente = doc.data();
        const id = doc.id;
  
        if (paciente.nome.toLowerCase().includes(filtroNome.toLowerCase())) {
          const item = document.createElement("li");
          item.className = "bg-gray-50 p-3 border rounded";
  
          item.innerHTML = `
            <strong>Nome:</strong> ${paciente.nome}<br>
            <strong>Telefone:</strong> ${paciente.telefone}<br>
            <strong>Nascimento:</strong> ${paciente.nascimento}<br>
            <div class="mt-2 space-x-2">
              <button onclick="editarPaciente('${id}', '${paciente.nome}', '${paciente.telefone}', '${paciente.nascimento}')" class="bg-yellow-400 px-3 py-1 rounded">Editar</button>
              <button onclick="excluirPaciente('${id}')" class="bg-red-500 text-white px-3 py-1 rounded">Excluir</button>
            </div>
          `;
          lista.appendChild(item);
        }
      });
    });
  }

// Excluir paciente
function excluirPaciente(id) {
  if (confirm("Deseja realmente excluir este paciente?")) {
    db.collection("pacientes").doc(id).delete()
      .then(() => {
        alert("Paciente excluído com sucesso.");
      })
      .catch((error) => {
        alert("Erro ao excluir: " + error.message);
      });
  }
}

// Editar paciente
function editarPaciente(id, nome, telefone, nascimento) {
  document.getElementById("nome").value = nome;
  document.getElementById("telefone").value = telefone;
  document.getElementById("nascimento").value = nascimento;

  document.getElementById("mensagem").textContent = "Editando paciente...";

  const form = document.getElementById("formPaciente");
  form.onsubmit = function (e) {
    e.preventDefault();

    db.collection("pacientes").doc(id).update({
      nome: document.getElementById("nome").value,
      telefone: document.getElementById("telefone").value,
      nascimento: document.getElementById("nascimento").value
    })
    .then(() => {
      document.getElementById("mensagem").textContent = "Paciente atualizado com sucesso!";
      form.reset();
      form.onsubmit = salvarNovoPaciente;
    })
    .catch((error) => {
      document.getElementById("mensagem").textContent = "Erro ao atualizar: " + error.message;
    });
  };
}

// Chama a função para carregar pacientes ao abrir a página
carregarPacientes();
document.getElementById("buscaNome").addEventListener("input", (e) => {
    carregarPacientes(e.target.value);
  });