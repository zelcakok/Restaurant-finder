import App from "../../App";
import Config from '../config';

const GoogleAPIURL: string = "https://maps.googleapis.com/maps/api/js?key=" + Config.API_KEY + "&libraries=places";

interface Callback {
    (): void
}

class GoogleAPILoader {
    public static instance: GoogleAPILoader;

    private callback: Callback;

    constructor(callback: Callback) {
        this.callback = callback;
    }

    static load(callback: Callback) {
        if (!GoogleAPILoader.instance) {
            GoogleAPILoader.instance = new GoogleAPILoader(callback);
            GoogleAPILoader.instance.addGoogleAPIScript();
        }
        return GoogleAPILoader.instance;
    }

    addGoogleAPIScript = () => {
        console.log("Google Map API is loaded");
        if (!document.querySelectorAll(`[src="${GoogleAPIURL}"]`).length) {
            document.body.appendChild(Object.assign(
                document.createElement('script'), {
                    type: 'text/javascript',
                    src: GoogleAPIURL,
                    onload: () => this.callback()
                }));
        } else {
            this.callback();
        }
    }
}
export default GoogleAPILoader;