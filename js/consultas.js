const db = firebase.firestore();

function salvarConsulta(e) {
  e.preventDefault();

  const nome = document.getElementById("nomePaciente").value;
  const dataHora = document.getElementById("dataHora").value;
  const observacoes = document.getElementById("observacoes").value;

  db.collection("consultas").add({
    nomePaciente: nome,
    dataHora: firebase.firestore.Timestamp.fromDate(new Date(dataHora)),
    observacoes: observacoes,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    document.getElementById("mensagem").textContent = "Consulta agendada com sucesso!";
    document.getElementById("formConsulta").reset();
  })
  .catch((error) => {
    document.getElementById("mensagem").textContent = "Erro ao salvar: " + error.message;
  });
}

function editarConsulta(id, nome, dataHora, observacoes) {
  document.getElementById("nomePaciente").value = nome;
  document.getElementById("dataHora").value = dataHora.slice(0, 16);
  document.getElementById("observacoes").value = observacoes;

  document.getElementById("mensagem").textContent = "Editando consulta...";

  const form = document.getElementById("formConsulta");
  form.onsubmit = function (e) {
    e.preventDefault();

    db.collection("consultas").doc(id).update({
      nomePaciente: document.getElementById("nomePaciente").value,
      dataHora: firebase.firestore.Timestamp.fromDate(new Date(document.getElementById("dataHora").value)),
      observacoes: document.getElementById("observacoes").value
    })
    .then(() => {
      document.getElementById("mensagem").textContent = "Consulta atualizada com sucesso!";
      form.reset();
      form.onsubmit = salvarConsulta;
    })
    .catch((error) => {
      document.getElementById("mensagem").textContent = "Erro ao atualizar: " + error.message;
    });
  };
}

function excluirConsulta(id) {
  if (confirm("Deseja excluir esta consulta?")) {
    db.collection("consultas").doc(id).delete()
      .then(() => alert("Consulta excluída com sucesso."))
      .catch((error) => alert("Erro ao excluir: " + error.message));
  }
}

function carregarConsultas() {
  db.collection("consultas").orderBy("dataHora").onSnapshot((snapshot) => {
    const lista = document.getElementById("listaConsultas");
    lista.innerHTML = "";

    const nomeFiltro = document.getElementById("filtroNome").value.toLowerCase();
    const dataFiltro = document.getElementById("filtroData").value;

    snapshot.forEach((doc) => {
      const consulta = doc.data();
      const data = consulta.dataHora.toDate();
      const dataStr = data.toISOString().split("T")[0];

      const nomeCond = consulta.nomePaciente.toLowerCase().includes(nomeFiltro);
      const dataCond = !dataFiltro || dataFiltro === dataStr;

      if (nomeCond && dataCond) {
        const item = document.createElement("li");
        const dataFormatada = data.toLocaleString("pt-BR");

        item.className = "bg-gray-50 p-3 border rounded";
        item.innerHTML = `
          <strong>Paciente:</strong> ${consulta.nomePaciente}<br>
          <strong>Data e Hora:</strong> ${dataFormatada}<br>
          <strong>Observações:</strong> ${consulta.observacoes || "-"}<br>
          <div class="mt-2 space-x-2">
            <button onclick="editarConsulta('${doc.id}', '${consulta.nomePaciente}', '${data.toISOString()}', '${consulta.observacoes || ''}')" class="bg-yellow-400 px-3 py-1 rounded">Editar</button>
            <button onclick="excluirConsulta('${doc.id}')" class="bg-red-500 text-white px-3 py-1 rounded">Excluir</button>
          </div>
        `;
        lista.appendChild(item);
      }
    });
  });
}

// Eventos
document.getElementById("formConsulta").addEventListener("submit", salvarConsulta);
document.getElementById("filtroNome").addEventListener("input", carregarConsultas);
document.getElementById("filtroData").addEventListener("change", carregarConsultas);

// Inicial
carregarConsultas();