const audioInput = document.getElementById('audioFile');
const srtInput = document.getElementById('srtFile');
const generateButton = document.getElementById('generateButton');
const playerContainer = document.getElementById('playerContainer');
const heading = document.querySelector('h1');
const uploadForm = document.getElementById('uploadForm');

audioInput.addEventListener('change', checkFiles);
srtInput.addEventListener('change', checkFiles);
generateButton.addEventListener('click', generatePlayer);

function checkFiles() {
    if (audioInput.files.length > 0 && srtInput.files.length > 0) {
        generateButton.disabled = false;
    } else {
        generateButton.disabled = true;
    }
}

function generatePlayer() {
    const audioFile = audioInput.files[0];
    const srtFile = srtInput.files[0];

    const audioURL = URL.createObjectURL(audioFile);
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = audioURL;

    const reader = new FileReader();
    reader.onload = function(e) {
        const srtContent = e.target.result;
        const subtitles = parseSRT(srtContent);
        const subtitleContainer = document.createElement('div');
        subtitleContainer.id = 'subtitle';

        subtitles.forEach(sub => {
            const words = sub.text.split(' ');
            words.forEach((word, index) => {
                const span = document.createElement('span');
                span.textContent = word;

                span.addEventListener('click', function() {
                    const startTimeInSeconds = convertTimeToSeconds(sub.startTime);
                    audioElement.currentTime = startTimeInSeconds;
                    audioElement.play();
                });

                subtitleContainer.appendChild(span);
            });
        });

        playerContainer.innerHTML = '';
        playerContainer.appendChild(audioElement);
        playerContainer.appendChild(subtitleContainer);

        // 파일 업로드 폼 숨기기
        uploadForm.style.display = 'none';

        // h1 텍스트를 오디오 파일의 이름(확장자 제외)으로 변경
        const fileName = audioFile.name.split('.').slice(0, -1).join('.');
        heading.textContent = fileName;
    };
    reader.readAsText(srtFile, 'UTF-8');
}

function parseSRT(data) {
    const regex = /(\d+)\s+(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\n\n|\n$)/g;
    let result;
    const subtitles = [];

    while ((result = regex.exec(data)) !== null) {
        subtitles.push({
            index: result[1],
            startTime: result[2],
            endTime: result[3],
            text: result[4].replace(/\n/g, ' ').trim() // 개행을 제거하고 공백으로 대체
        });
    }
    return subtitles;
}

function convertTimeToSeconds(time) {
    const parts = time.split(':');
    const seconds = parts[2].split(',')[0];
    const milliseconds = parts[2].split(',')[1];
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(seconds, 10) + parseInt(milliseconds, 10) / 1000;
}
