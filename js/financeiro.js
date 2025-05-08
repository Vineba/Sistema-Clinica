// Firebase config
const firebaseConfig = {
    apiKey: "Sua_API_KEY",
    authDomain: "sistema-clinica-a8bc0.firebaseapp.com",
    projectId: "sistema-clinica-a8bc0",
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Adicionar lançamento
  document.getElementById("formFinanceiro").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const tipo = document.getElementById("tipo").value;
    const categoria = document.getElementById("categoria").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const data = document.getElementById("data").value;
    const descricao = document.getElementById("descricao").value;
  
    db.collection("financeiro").add({
      tipo,
      categoria,
      valor,
      data: firebase.firestore.Timestamp.fromDate(new Date(data)),
      descricao,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => {
      document.getElementById("formFinanceiro").reset();
      carregarLancamentos();
    });
  });
  
  // Carregar lançamentos com filtros
  function carregarLancamentos() {
    const filtroTipo = document.getElementById("filtroTipo").value;
    const filtroCategoria = document.getElementById("filtroCategoria").value.toLowerCase();
    const filtroData = document.getElementById("filtroData").value;
  
    db.collection("financeiro").orderBy("data", "desc").onSnapshot((snapshot) => {
      const lista = document.getElementById("listaLancamentos");
      lista.innerHTML = "";
  
      let totalReceitas = 0;
      let totalDespesas = 0;
      const porCategoria = {};
      const porMes = {};
  
      snapshot.forEach((doc) => {
        const lancamento = doc.data();
        const dataObj = lancamento.data.toDate();
        const dataStr = dataObj.toISOString().split("T")[0];
  
        const condTipo = !filtroTipo || lancamento.tipo === filtroTipo;
        const condCat = lancamento.categoria.toLowerCase().includes(filtroCategoria);
        const condData = !filtroData || filtroData === dataStr;
  
        if (condTipo && condCat && condData) {
          const valorFormatado = lancamento.valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
          const dataFormatada = dataObj.toLocaleDateString("pt-BR");
  
          const item = document.createElement("li");
          item.className = `border-l-4 p-3 mb-2 rounded shadow-sm ${
            lancamento.tipo === "receita" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
          }`;
  
          item.innerHTML = `
            <p><strong>${lancamento.tipo === "receita" ? "Receita" : "Despesa"}</strong> - ${valorFormatado}</p>
            <p><strong>Categoria:</strong> ${lancamento.categoria}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Descrição:</strong> ${lancamento.descricao}</p>
          `;
          lista.appendChild(item);
  
          // Totais
          if (lancamento.tipo === "receita") {
            totalReceitas += lancamento.valor;
          } else {
            totalDespesas += lancamento.valor;
          }
  
          // Por Categoria
          const catKey = lancamento.categoria;
          porCategoria[catKey] = (porCategoria[catKey] || 0) + lancamento.valor;
  
          // Por Mês
          const mesAno = dataObj.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });
          if (!porMes[mesAno]) porMes[mesAno] = { receita: 0, despesa: 0 };
          porMes[mesAno][lancamento.tipo] += lancamento.valor;
        }
      });
  
      // Atualizar totais
      document.getElementById("totalReceitas").textContent = totalReceitas.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      document.getElementById("totalDespesas").textContent = totalDespesas.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      document.getElementById("saldoFinal").textContent = (totalReceitas - totalDespesas).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
  
      // Atualizar gráficos
      atualizarGraficoPizza(porCategoria);
      atualizarGraficoBarras(porMes);
    });
  }
  
  // Eventos de filtro
  document.getElementById("filtroTipo").addEventListener("change", carregarLancamentos);
  document.getElementById("filtroCategoria").addEventListener("input", carregarLancamentos);
  document.getElementById("filtroData").addEventListener("change", carregarLancamentos);
  
  // GRÁFICOS
  let graficoPizza, graficoBarras;
  
  function atualizarGraficoPizza(dados) {
    const categorias = Object.keys(dados);
    const valores = Object.values(dados);
  
    if (graficoPizza) graficoPizza.destroy();
    const ctx = document.getElementById("graficoPizza").getContext("2d");
    graficoPizza = new Chart(ctx, {
      type: "pie",
      data: {
        labels: categorias,
        datasets: [{
          data: valores,
          backgroundColor: [
            "#4ade80", "#f87171", "#60a5fa", "#facc15", "#a78bfa", "#34d399", "#fb923c"
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        }
      }
    });
  }
  
  function atualizarGraficoBarras(dados) {
    const meses = Object.keys(dados).sort((a, b) => {
      const [ma, aa] = a.split("/");
      const [mb, ab] = b.split("/");
      return new Date(`${aa}-${ma}-01`) - new Date(`${ab}-${mb}-01`);
    });
  
    const receitas = meses.map(m => dados[m].receita || 0);
    const despesas = meses.map(m => dados[m].despesa || 0);
  
    if (graficoBarras) graficoBarras.destroy();
    const ctx = document.getElementById("graficoBarras").getContext("2d");
    graficoBarras = new Chart(ctx, {
      type: "bar",
      data: {
        labels: meses,
        datasets: [
          {
            label: "Receitas",
            backgroundColor: "#4ade80",
            data: receitas
          },
          {
            label: "Despesas",
            backgroundColor: "#f87171",
            data: despesas
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Inicializar
  carregarLancamentos();  