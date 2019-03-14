import {Injectable} from '@angular/core';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
@Injectable()
export class SpeechServiceProvider {
    matches: string[];
    constructor(
        private speechRecognition: SpeechRecognition
    ) {}

    /**
     * requests permission from the device's user to use speech recognition
     */
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

    /**
     * starts the speech recognition feature in English
     */
    startListening() {
        const options = {
            language: 'en-US'
        };
        return this.speechRecognition.startListening(options);
    }

}
