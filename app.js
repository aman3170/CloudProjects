// app.js

// AWS configuration
AWS.config.region = 'us-east-1'; // Update with your region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:example-pool-id', // Replace with your Identity Pool ID
});

const rekognition = new AWS.Rekognition();
const translate = new AWS.Translate();
const polly = new AWS.Polly();

const analyzeButton = document.getElementById('analyze-button');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const recognizedObjects = document.getElementById('recognized-objects');
const translatedText = document.getElementById('translated-text');

analyzeButton.addEventListener('click', async () => {
    const file = imageUpload.files[0];
    if (!file) {
        alert('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageBytes = e.target.result.split(',')[1];

        // Display the uploaded image
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%;">`;

        try {
            // Object recognition
            const rekognitionParams = {
                Image: {
                    Bytes: Uint8Array.from(atob(imageBytes), c => c.charCodeAt(0)),
                },
                MaxLabels: 5,
            };

            const rekognitionData = await rekognition.detectLabels(rekognitionParams).promise();
            const labels = rekognitionData.Labels.map(label => label.Name).join(', ');
            recognizedObjects.textContent = `Recognized Objects: ${labels}`;

            // Translation
            const translateParams = {
                Text: labels,
                SourceLanguageCode: 'en',
                TargetLanguageCode: 'hi',
            };

            const translationData = await translate.translateText(translateParams).promise();
            const hindiText = translationData.TranslatedText;
            translatedText.textContent = `Translation in Hindi: ${hindiText}`;

            // Speech synthesis
            const pollyParams = {
                Text: hindiText,
                OutputFormat: 'mp3',
                VoiceId: 'Aditi', // A Hindi-speaking voice
            };

            const pollyData = await polly.synthesizeSpeech(pollyParams).promise();
            const audioBlob = new Blob([pollyData.AudioStream], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();

        } catch (err) {
            console.error('Error:', err);
            alert('An error occurred while processing the image.');
        }
    };
    reader.readAsDataURL(file);
});
