let mediaRecorder;
let recordedChunks = [];
let startTime;
let timerInterval;

// Verificar compatibilidade do navegador
if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    alert('Seu navegador não suporta gravação de tela. Use Chrome, Firefox ou Edge atualizado.');
}

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const preview = document.getElementById('preview');

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = new Date(currentTime - startTime);
    const hours = Math.floor(elapsedTime / 3600000).toString().padStart(2, '0');
    const minutes = (elapsedTime.getMinutes()).toString().padStart(2, '0');
    const seconds = (elapsedTime.getSeconds()).toString().padStart(2, '0');
    status.textContent = `Tempo de Gravação: ${hours}:${minutes}:${seconds}`;
}

async function startRecording() {
    try {
        // Limpar gravação anterior
        recordedChunks = [];
        preview.style.display = 'none';
        status.textContent = 'Selecione a tela para gravar...';
       
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        // Iniciar timer após seleção da tela
        startTime = new Date().getTime();
        timerInterval = setInterval(updateTimer, 1000);
        status.textContent = 'Tempo de Gravação: 00:00:00';

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8,opus'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            clearInterval(timerInterval);
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
           
            preview.src = url;
            preview.style.display = 'block';
           
            const a = document.createElement('a');
            a.href = url;
            a.download = `gravacao-${new Date().toISOString()}.webm`;
            a.click();
           
            status.textContent = 'Gravação finalizada e salva';
            status.classList.remove('recording');
            startBtn.disabled = false;
            stopBtn.disabled = true;
        };

        mediaRecorder.start(1000); // Capturar a cada 1 segundo
        status.textContent = 'Gravando...';
        status.classList.add('recording');
        startBtn.disabled = true;
        stopBtn.disabled = false;

    } catch (error) {
        clearInterval(timerInterval);
        console.error('Erro ao iniciar gravação:', error);
        status.textContent = 'Erro ao iniciar gravação. Verifique as permissões.';
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        clearInterval(timerInterval);
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        status.textContent = 'Gravação finalizada';
    }
}

// Remover event listeners duplicados
startBtn.onclick = startRecording;
stopBtn.onclick = stopRecording;
