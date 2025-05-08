const db = firebase.firestore();

// Função principal
async function carregarDashboard() {
  const hoje = new Date();
  const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const receitasSnapshot = await db.collection("financeiro")
    .where("tipo", "==", "receita")
    .where("data", ">=", inicioDoMes)
    .where("data", "<=", fimDoMes)
    .get();

  const despesasSnapshot = await db.collection("financeiro")
    .where("tipo", "==", "despesa")
    .where("data", ">=", inicioDoMes)
    .where("data", "<=", fimDoMes)
    .get();

  let totalReceitas = 0;
  let totalDespesas = 0;

  const fluxoDiario = {};

  receitasSnapshot.forEach(doc => {
    const dados = doc.data();
    const valor = dados.valor || 0;
    const dataStr = formatarDataCurta(dados.data.toDate());

    totalReceitas += valor;
    fluxoDiario[dataStr] = (fluxoDiario[dataStr] || 0) + valor;
  });

  despesasSnapshot.forEach(doc => {
    const dados = doc.data();
    const valor = dados.valor || 0;
    const dataStr = formatarDataCurta(dados.data.toDate());

    totalDespesas += valor;
    fluxoDiario[dataStr] = (fluxoDiario[dataStr] || 0) - valor;
  });

  // Atualizar cards
  document.getElementById("totalReceitas").textContent = `R$ ${totalReceitas.toFixed(2)}`;
  document.getElementById("totalDespesas").textContent = `R$ ${totalDespesas.toFixed(2)}`;
  document.getElementById("saldoAtual").textContent = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;

  // Preparar dados para o gráfico de linha
  const dias = Object.keys(fluxoDiario).sort();
  const valores = dias.map(dia => fluxoDiario[dia]);

  criarGraficoLinha(dias, valores);
  criarGraficoPizza(totalReceitas, totalDespesas);
}

function formatarDataCurta(data) {
  return data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
}

function criarGraficoLinha(labels, valores) {
  const ctx = document.getElementById("graficoLinha").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Fluxo Diário (R$)",
        data: valores,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function criarGraficoPizza(receitas, despesas) {
  const ctx = document.getElementById("graficoPizza").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [receitas, despesas],
        backgroundColor: ["#10b981", "#ef4444"]
      }]
    },
    options: {
      responsive: true
    }
  });
}

// Carrega tudo ao abrir a página
carregarDashboard();
