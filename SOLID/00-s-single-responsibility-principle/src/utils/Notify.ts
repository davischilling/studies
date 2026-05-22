import Client from "./Client";

export default class Notify {

    constructor(private client: Client) { }

    send(): void {
        // Notify the client
        const email = this.client.readEmail();
        // Send email to the client
        console.log(`Sending email to ${email}`);
    }
}