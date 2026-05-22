import IVehicle from './interfaces/IVehicle';

export default class Bike implements IVehicle {

    startRoute(): void {
        this.getCargo();
        console.log("Iniciando o trajeto...");
    }

    getCargo(): void {
        console.log("Peguei a encomenda, mas vou devagar pq tô de bike!");
    }

}