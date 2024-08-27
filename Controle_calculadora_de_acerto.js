// 🤖 Controle calculadora de acerto

// Função para desativar a Calculadora de Acerto
function desativarCalculadoraAcerto() {
    if (typeof window.calculadoraAcertoAtiva !== 'undefined') {
      window.calculadoraAcertoAtiva = false;
      let indicador = document.getElementById('calculadoraAcertoIndicador');
      if (indicador) {
        indicador.innerHTML = '🤖 Calculadora de acerto desativada';
      }
      ui.notifications.info("Calculadora de acerto desativada.");
    } else {
      ui.notifications.warn("A macro Calculadora de acerto não está ativa ou não foi encontrada.");
    }
  }
  
  // Executar a função ao ativar esta macro
  desativarCalculadoraAcerto();