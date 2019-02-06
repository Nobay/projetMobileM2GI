import {Injectable} from '@angular/core';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
@Injectable()
export class SpeechServiceProvider {
    matches: String[];
    isRecording = false;
    constructor(
        private speechRecognition: SpeechRecognition
    ) {}

    stopListening() {
        this.speechRecognition.stopListening().then(() => {
            this.isRecording = false;
        });
    }

    getPermission() {
        this.speechRecognition.hasPermission()
            .then((hasPermission: boolean) => {
                if (!hasPermission) {
                    this.speechRecognition.requestPermission().then(
                        () => console.log('Permission granted'),
                        () => console.log('Permission denied')
                    );
                }
            });
    }

    startListening() {
        const options = {
            language: 'en-US'
        };
        this.speechRecognition.startListening(options).subscribe(matches => {
            this.matches = matches;
        });
        this.isRecording = true;
    }

}
