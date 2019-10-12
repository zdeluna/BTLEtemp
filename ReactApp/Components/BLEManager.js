import React, {Component} from 'react';
import {
    NativeAppEventEmitter,
    NativeEventEmitter,
    NativeModules,
} from 'react-native';

import BleManager from 'react-native-ble-manager';
import {bytesToString} from 'convert-string';

const BleManagerModule = NativeModules.BleManager;

import {
    SERVICE_UUID,
    TEMP_CHARACTERISTIC_UUID,
    HUMIDITY_CHARACTERISTIC_UUID,
} from 'react-native-dotenv';

class BLEManager extends Component {
    constructor() {
        super();
        this.deviceName = 'FeatherESP32';
        this.deviceID = '';
        this.peripherals = new Map();
        this.scanning = false;
        this.temperature = 'NA';
        this.humidity = 'NA';
        this.connected = false;
        this.statusMessage = '';
        this.bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
        BleManager.start({showAlert: false});
    }

    componentDidMount() {
        this.addListeners();
        this.props.setClick(this.startScan);
    }

    addListeners = () => {
        this.handlerDiscover = this.bleManagerEmitter.addListener(
            'BleManagerDiscoverPeripheral',
            this.handleDiscoverPeripheral,
        );
        this.handlerStop = this.bleManagerEmitter.addListener(
            'BleManagerStopScan',
            this.handleStopScan,
        );
        this.handlerDisconnect = this.bleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            this.handleDisconnectedPeripheral,
        );
        this.handlerUpdate = this.bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            this.updateSensorData,
        );
    };
    updateSensorData = data => {
        console.log('Sensor Data has Updated');
        if (
            data.characteristic.toLowerCase() ==
            TEMP_CHARACTERISTIC_UUID.toLowerCase()
        ) {
            console.log('changed temperature');
            this.setState({temperature: data.value[0]});
        }
        if (
            data.characteristic.toLowerCase() ==
            HUMIDITY_CHARACTERISTIC_UUID.toLowerCase()
        ) {
            console.log('changed humidity');
            this.setState({humidity: data.value[0]});
        }
        this.props.onSensorUpdate(this.state.temperature, this.state.humidity);
    };

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
                SERVICE_UUID,
                HUMIDITY_CHARACTERISTIC_UUID,
            );
            BleManager.startNotification(
                this.deviceID,
                SERVICE_UUID,
                TEMP_CHARACTERISTIC_UUID,
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
            console.log('Dispatch status update');
            this.statusMessage = 'Cannot connect to sensor device';
            this.props.onStatusUpdate(this.statusMessage);
            return error;
        }
    };

    readDataFromSensorDevice = async () => {
        try {
            console.log('read data from function');
            await this.connectToDevice(this.deviceID);

            let temperature = await this.readCharacteristic(
                this.deviceID,
                SERVICE_UUID,
                TEMP_CHARACTERISTIC_UUID,
            );

            let humidity = await this.readCharacteristic(
                this.deviceID,
                SERVICE_UUID,
                HUMIDITY_CHARACTERISTIC_UUID,
            );
            this.temperature = temperature;
            this.humidity = humidity;

            this.startNotifications();
        } catch (error) {
            return error;
        }
    };

    handleStopScan = async () => {
        try {
            console.log('Scan is stopped');
            this.scanning = false;

            if (this.deviceID) this.readDataFromSensorDevice();
            else {
                this.statusMessage = 'Sensor not found.';
                this.props.onStatusUpdate(this.statusMessage);
            }
            console.log('status: ' + this.statusMessage);
        } catch (error) {
            console.log('ERROR AFTER STOP SCAN');
        }
    };

    startScan = async () => {
        console.log('env: ' + SERVICE_UUID);
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
    render() {
        return null;
    }
}

export default BLEManager;
