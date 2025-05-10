document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'pt-br',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: async function(fetchInfo, successCallback, failureCallback) {
  try {
    const snapshot = await firebase.firestore().collection("consultas").get();
    const eventos = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(data);  // Adicionei isso para verificar os dados que estão sendo recuperados
      return {
        title: `${data.paciente} - ${data.profissional}`,
        start: `${data.data}T${data.hora}`,  // Verifique se data e hora estão corretos
        allDay: false
      };
    });
    successCallback(eventos);
  } catch (err) {
    console.error('Erro ao buscar consultas:', err);
    failureCallback(err);
  }
},
    eventClick: function(info) {
      const consultaId = info.event.id;

      // Buscar dados detalhados da consulta no Firebase
      firebase.firestore().collection('consultas').doc(consultaId).get().then(doc => {
        const data = doc.data();

        // Preencher o modal com os dados da consulta
        document.getElementById('modalPaciente').innerText = `Paciente: ${data.paciente}`;
        document.getElementById('modalHorario').innerText = `Horário: ${data.hora}`;
        document.getElementById('modalProfissional').innerText = `Profissional: ${data.profissional}`;

        // Exibir o modal
        document.getElementById('consultaModal').classList.remove('hidden');
      });
    }
  });

  calendar.render();
console.log('Calendário renderizado');
});

// Função para fechar o modal
function closeModal() {
  document.getElementById('consultaModal').classList.add('hidden');
}