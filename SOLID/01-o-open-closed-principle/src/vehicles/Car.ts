import IVehicleCar from './IVehicleCar';
export default class Car implements IVehicleCar {
    constructor(
        private color: string,
        private year: number,
        private engine: number,
        private seats: number,
        private doors: number,

    ) { }

    configureVehicle(): void {
        console.log(`Carro da cor ${this.color}, motor ${this.engine}, ${this.doors} portas, ano ${this.year}. ${this.year} assentos e ${this.seats} portas.`);
        this.startVehicle();
    }

    startVehicle(): void {
        console.log(`Ligando os motores...`);
    }
}
