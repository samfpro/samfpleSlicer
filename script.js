class AudioSlicer {
    constructor(fileInputId, sliceDurationInputId, sliceButtonId) {
        console.log("Initializing AudioSlicer...");
        this.fileInput = document.getElementById(fileInputId);
        console.log("File input element:", this.fileInput);
        
        this.projectNameInput = document.getElementById("projectName");
        this.sliceDurationInput = document.getElementById(sliceDurationInputId);
        console.log("Slice duration input element:", this.sliceDurationInput);
        this.sliceButton = document.getElementById(sliceButtonId);
        console.log("Slice button element:", this.sliceButton);

this.sliceButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    console.log("Slice button clicked.");
    this.sliceAndDownload();
});
        // Initialize Knobs
        const sliceDurationKnob = new RotaryKnob('sliceDurationKnob', 'sliceDuration', 1, 15);
        console.log("Slice duration knob initialized:", sliceDurationKnob);
        const maxSlicesKnob = new RotaryKnob('maxSlicesKnob', 'maxSlices', 0, 10);
        console.log("Max slices knob initialized:", maxSlicesKnob);
        const initOffsetKnob = new RotaryKnob('initOffsetKnob', 'initOffset', 0, 359);
        console.log("Init offset knob initialized:", initOffsetKnob);
    }

async sliceAndDownload() {
    console.log("Slicing and downloading process started...");
    const files = this.fileInput.files;
    console.log("Selected files:", files);
    const sliceDuration = parseInt(this.sliceDurationInput.value);
    console.log("Slice duration:", sliceDuration);
    const maxSlices = parseInt(document.getElementById('maxSlices').value); // Added
    console.log("Max slices:", maxSlices);
    const initOffset = parseInt(document.getElementById('initOffset').value); // Added
    console.log("Init offset:", initOffset);

    if (files.length === 0) {
        alert('Please select at least one MP3 file.');
        console.error("No files selected.");
        return;
    }

    const zip = new JSZip();
    const projectName = this.projectNameInput.value;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log("Processing file:", file);
        const fileName = file.name.replace(/^\d+\./, ''); // Remove leading digits and period
        console.log("File name:", fileName);
        const audioContext = new AudioContext();
        console.log("Audio context:", audioContext);
        const fileBuffer = await this.readFile(file);
        console.log("File buffer:", fileBuffer);
        const audioBuffer = await this.decodeAudioData(audioContext, fileBuffer);
        console.log("Audio buffer:", audioBuffer);
        const dir = zip.folder(fileName);
        console.log("Folder created in zip:", dir);

        const startSlice = Math.floor(initOffset / sliceDuration); // Calculate start slice based on initOffset
        console.log("Start slice index:", startSlice);
        const numberOfSlices = maxSlices > 0 ? Math.min(maxSlices, Math.ceil(audioBuffer.duration / sliceDuration)) : Math.ceil(audioBuffer.duration / sliceDuration);
        console.log("Number of slices:", numberOfSlices);

        for (let j = startSlice; j < startSlice + numberOfSlices; j++) { // Adjust loop condition
            const start = j * sliceDuration;
            console.log("Start time of slice:", + start);
            const end = Math.min((j + 1) * sliceDuration, audioBuffer.duration);
            console.log("End time of slice:" + end);
            const slicedBuffer = this.sliceAudioBuffer(audioContext, audioBuffer, start, end);
            console.log("Sliced buffer:" + slicedBuffer);
            const wavBlob = await this.encodeWav(audioContext, slicedBuffer);
            console.log("WAV blob:" + wavBlob);
            const sliceFileName = `slice${j + 1}.wav`; // Use a generic slice filename
            console.log("Slice file name:" + sliceFileName);
            dir.file(sliceFileName, wavBlob);
            console.log("Slice file added to directory.");
        }
    }

    const projectFileName = projectName + ".zip";
    console.log(projectFileName);
    zip.generateAsync({ type: "blob" }).then((content) => {
        this.saveAs(content, projectFileName);
        console.log("Zip file generated and saved.");
    });

    alert('Slicing and downloading completed.');
    console.log("Slicing and downloading completed.");
}
    readFile(file) {
        console.log("Reading file:", file);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                console.log("File reading completed.");
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                reject(reader.error);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    decodeAudioData(audioContext, buffer) {
        console.log("Decoding audio data...");
        return new Promise((resolve, reject) => {
            audioContext.decodeAudioData(buffer, resolve, reject);
        });
    }

    sliceAudioBuffer(audioContext, audioBuffer, start, end) {
        console.log("Slicing audio buffer...");
        const length = Math.round(audioContext.sampleRate * (end - start));
        const slicedBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, length, audioBuffer.sampleRate);
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            const slicedChannelData = slicedBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const sample = Math.min(Math.max(start * audioBuffer.sampleRate + i, 0), channelData.length - 1);
                slicedChannelData[i] = channelData[sample];
            }
        }
        console.log("Audio buffer sliced.");
        return slicedBuffer;
    }

    encodeWav(audioContext, audioBuffer) {
        console.log("Encoding audio buffer to WAV...");
        return new Promise((resolve) => {
            const interleaved = this.interleaveChannels(audioBuffer);
            const wav = this.audioBufferToWav(audioContext, interleaved);
            resolve(new Blob([wav], { type: 'audio/wav' }));
        });
    }

    interleaveChannels(audioBuffer) {
        console.log("Interleaving audio channels...");
        const interleaved = new Float32Array(audioBuffer.length * audioBuffer.numberOfChannels);
        const channels = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }
        for (let sample = 0; sample < audioBuffer.length; sample++) {
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                interleaved[sample * audioBuffer.numberOfChannels + channel] = channels[channel][sample];
            }
        }
        console.log("Audio channels interleaved.");
        return interleaved;
    }

    audioBufferToWav(audioContext, interleaved) {
        console.log("Converting audio buffer to WAV format...");
        const sampleRate = audioContext.sampleRate;
        const buffer = new ArrayBuffer(44 + interleaved.length * 2);
        const view = new DataView(buffer);

        // RIFF identifier
        this.writeString(view, 0, 'RIFF');
        // RIFF chunk length
        view.setUint32(4, 36 + interleaved.length * 2, true);
        // RIFF type
        this.writeString(view, 8, 'WAVE');
        // format chunk identifier
        this.writeString(view, 12, 'fmt ');
        // format chunk length
        view.setUint32(16, 16, true);
        // sample format (raw)
        view.setUint16(20, 1, true);
        // channel count
        view.setUint16(22, audioContext.destination.channelCount, true);
        // sample rate
        view.setUint32(24, sampleRate, true);
        // byte rate (sample rate * block align)
        view.setUint32(28, sampleRate * 4, true);
        // block align (channel count * bytes per sample)
        view.setUint16(32, audioContext.destination.channelCount * 2, true);
        // bits per sample
        view.setUint16(34, 16, true);
        // data chunk identifier
        this.writeString(view, 36, 'data');
        // data chunk length
        view.setUint32(40, interleaved.length * 2, true);

        // write the PCM samples
        const offset = 44;
        for (let i = 0; i < interleaved.length; i++) {
            view.setInt16(offset + i * 2, interleaved[i] * 0x7FFF, true);
        }

        console.log("Audio buffer converted to WAV.");
        return buffer;
    }

    saveWavFile(blob, fileName) {
        console.log("Saving WAV file...");
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("WAV file saved.");
    }

    saveAs(blob, fileName) {
        console.log("Saving file as:" + fileName);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("File saved as:" + fileName);
    }    

    writeString(view, offset, string) {
        console.log("Writing string:" + string);
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
        console.log("String written.");
    }
}

// Usage
const audioSlicer = new AudioSlicer('fileInput', 'sliceDuration', 'sliceButton');

