// Configuração do Firebase (já configurado previamente)
const firebaseConfig = {
    apiKey: "Sua_API_KEY",
    authDomain: "sistema-clinica-a8bc0.firebaseapp.com",
    projectId: "sistema-clinica-a8bc0",
    storageBucket: "sistema-clinica-a8bc0.appspot.com",
    messagingSenderId: "358716597367",
    appId: "1:358716597367:web:c25e427d1ee6c00b2d1272"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Adicionar uma nova consulta
document.getElementById("formConsulta").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomePaciente").value;
  const profissional = document.getElementById("profissional").value;
  const dataHora = document.getElementById("dataHora").value;
  const observacoes = document.getElementById("observacoes").value;

  db.collection("consultas").add({
    nomePaciente: nome,
    profissional: profissional,
    dataHora: firebase.firestore.Timestamp.fromDate(new Date(dataHora)),
    observacoes: observacoes,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    document.getElementById("mensagem").textContent = "Consulta agendada com sucesso!";
    document.getElementById("formConsulta").reset();
    carregarConsultas(); // Atualizar lista após salvar
  })
  .catch((error) => {
    document.getElementById("mensagem").textContent = "Erro ao salvar: " + error.message;
  });
});

// Carregar consultas agendadas
function carregarConsultas() {
  const nomeFiltro = document.getElementById("filtroNome").value.toLowerCase();
  const profissionalFiltro = document.getElementById("filtroProfissional").value.toLowerCase();

  db.collection("consultas")
    .orderBy("dataHora")
    .onSnapshot((snapshot) => {
      const lista = document.getElementById("listaConsultas");
      lista.innerHTML = "";

      snapshot.forEach((doc) => {
        const consulta = doc.data();
        const data = consulta.dataHora.toDate();
        const dataStr = data.toISOString().split("T")[0];

        const nomeCond = consulta.nomePaciente.toLowerCase().includes(nomeFiltro);
        const profissionalCond = consulta.profissional.toLowerCase().includes(profissionalFiltro);

        if (nomeCond && profissionalCond) {
          const item = document.createElement("li");
          const dataFormatada = data.toLocaleString("pt-BR");

          item.className = "bg-gray-50 p-3 border rounded";
          item.innerHTML = `
            <strong>Paciente:</strong> ${consulta.nomePaciente}<br>
            <strong>Profissional:</strong> ${consulta.profissional}<br>
            <strong>Data e Hora:</strong> ${dataFormatada}<br>
            <strong>Observações:</strong> ${consulta.observacoes || "-"}<br>
          `;
          lista.appendChild(item);
        }
      });
    });
}

// Filtros ao digitar nome ou mudar a data
document.getElementById("filtroNome").addEventListener("input", carregarConsultas);
document.getElementById("filtroProfissional").addEventListener("input", carregarConsultas);
document.getElementById("filtroData").addEventListener("change", carregarConsultas);

// Chama a função para carregar as consultas quando a página for carregada
carregarConsultas();
