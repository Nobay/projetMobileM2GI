import {Injectable} from '@angular/core';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
@Injectable()
export class SpeechServiceProvider {
    matches: string[];
    isRecording = false;
    constructor(
        private speechRecognition: SpeechRecognition
    ) {}

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
        return this.speechRecognition.startListening(options);
    }

}
