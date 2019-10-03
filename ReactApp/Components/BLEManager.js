import {
    NativeAppEventEmitter,
    NativeEventEmitter,
    NativeModules,
} from 'react-native';

import BleManager from 'react-native-ble-manager';
import {bytesToString} from 'convert-string';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const serviceUUID = 'c23b7ab5-0301-441a-ac60-1757084297d4';
const tempCharacteristicUUID = 'e7ca3a76-9026-4f56-9b35-09da4c3c5eea';
const humidityCharacteristicUUID = '8c6fe5b0-0931-41f7-bab5-6b08cb20f524';

export default class BLEManager {
    constructor() {
        this.deviceName = 'FeatherESP32';
        this.peripherals = new Map();
        this.scanning = false;
        this.temperature = 'NA';
        this.humidity = 'NA';
        this.connected = false;
        this.statusMessage = '';
    }

    handleDisconnectedPeripheral = data => {
        let peripherals = this.peripherals;
        let peripheral = peripherals.get(data.peripheral);
        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            this.peripherals = peripherals;
        }
        console.log('Disconnected from ' + data.peripheral);
        this.connected = false;
    };

    handleUpdateValueForCharacteristic = data => {
        console.log(
            'Received data from ' +
                data.peripheral +
                ' characteristic ' +
                data.characteristic,
            data.value,
        );

        if (
            data.characteristic.toLowerCase() ==
            tempCharacteristicUUID.toLowerCase()
        ) {
            console.log('changed temperature');
            this.temperature = data.value[0];
        }
        if (
            data.characteristic.toLowerCase() ==
            humidityCharacteristicUUID.toLowerCase()
        ) {
            console.log('changed humidity');
            this.humidity = data.value[0];
        }
    };

    readCharacteristic = async (deviceID, serviceUUID, characteristicUUID) => {
        try {
            let peripheralInfo = await BleManager.retrieveServices(deviceID);
            let readData = await BleManager.read(
                deviceID,
                serviceUUID,
                characteristicUUID,
            );
            return readData[0];
        } catch (error) {
            console.log(error);
        }
    };

    startNotifications = async () => {
        try {
            let peripheralInfo = await BleManager.retrieveServices(
                this.deviceID,
            );
            await BleManager.startNotification(
                this.deviceID,
                serviceUUID,
                humidityCharacteristicUUID,
            );
            BleManager.startNotification(
                this.deviceID,
                serviceUUID,
                tempCharacteristicUUID,
            );
        } catch (error) {
            console.log(error);
        }
    };

    connectToDevice = async id => {
        try {
            await BleManager.connect(id);
            let peripherals = this.peripherals;
            let p = peripherals.get(id);
            if (p) {
                p.connected = true;
                peripherals.set(id, p);
                this.peripherals = peripherals;

                this.connected = true;
                this.statusMessage = '';
            }
        } catch (error) {
            this.statusMessage = 'Cannot connect to sensor device';
        }
    };

    readDataFromSensorDevice = async () => {
        try {
            await this.connectToDevice(this.deviceID);

            let temperature = await this.readCharacteristic(
                this.deviceID,
                serviceUUID,
                tempCharacteristicUUID,
            );

            let humidity = await this.readCharacteristic(
                this.deviceID,
                serviceUUID,
                humidityCharacteristicUUID,
            );
            this.temperature = temperature;
            this.humidity = humidity;
            this.startNotifications();
        } catch (error) {
            console.log(error);
        }
    };

    handleStopScan = async () => {
        console.log('Scan is stopped');
        this.scanning = false;

        if (this.deviceID) this.readDataFromSensorDevice();
        else {
            this.statusMessage = 'Sensor not found.';
        }
    };

    startScan = async () => {
        if (!this.scanning) {
            this.peripherals = new Map();
            let results = await BleManager.scan([], 3, true);
            console.log('Scanning...');
            this.scanning = true;
        }
    };

    retrieveConnected = async () => {
        let results = await BleManager.getConnectedPeripherals([]);

        if (results.length == 0) {
            console.log('No connected peripherals');
        }
        console.log(results);
        let peripherals = this.peripherals;
        for (let i = 0; i < results.length; i++) {
            let peripheral = results[i];
            peripheral.connected = true;
            peripherals.set(peripheral.id, peripheral);
            this.peripherals = peripherals;
        }
    };

    handleDiscoverPeripheral = async peripheral => {
        var peripherals = this.peripherals;
        if (!peripherals.has(peripheral.id)) {
            peripherals.set(peripheral.id, peripheral);
            this.peripherals = peripherals;

            /* If we find our ESP temperature device, than we can stop the scan*/
            if (peripheral.name == this.deviceName) {
                console.log('FOUND DEVICE: ' + peripheral.id);
                this.deviceID = peripheral.id;

                await BleManager.stopScan();
                this.scanning = false;
            }
        }
    };
}
