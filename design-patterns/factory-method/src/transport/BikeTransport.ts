import Transport from "./transport";
import Bike from "./vehicles/Bike";
import IVehicle from "./vehicles/interfaces/IVehicle";

export class BikeTransport extends Transport {

    protected createTransport(): IVehicle {

        return new Bike();

    }

}