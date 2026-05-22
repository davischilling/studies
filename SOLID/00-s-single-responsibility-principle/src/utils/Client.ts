export default class Client {
    private id: number;
    private name: string;
    private email: string;

    create(): void { }
    readEmail(): string {
        return this.email;
    }
    update(): void { }
    delete(): void { }
}
