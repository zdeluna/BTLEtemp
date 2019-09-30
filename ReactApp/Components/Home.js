import React, {Component, Fragment} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    NativeAppEventEmitter,
    NativeEventEmitter,
    NativeModules,
    Platform,
    PermissionsAndroid,
    ListView,
    ScrollView,
    AppState,
    Dimensions,
} from 'react-native';
import {Button, Divider} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Col, Row, Grid} from 'react-native-easy-grid';
import BleManager from 'react-native-ble-manager';
import {bytesToString} from 'convert-string';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const serviceUUID = 'c23b7ab5-0301-441a-ac60-1757084297d4';
const tempCharacteristicUUID = 'e7ca3a76-9026-4f56-9b35-09da4c3c5eea';
const humidityCharacteristicUUID = '8c6fe5b0-0931-41f7-bab5-6b08cb20f524';

const styles = StyleSheet.create({
    topView: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    temperatureTextView: {
        width: 90,
        height: 90,
        backgroundColor: '#e8e8e8',
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        color: 'blue',
        fontWeight: 'bold',
        fontSize: 25,
        textAlign: 'center',
        margin: 50,
    },
    button: {
        width: 300,
    },
    table: {
        margin: 30,
    },
    temperatureText: {
        fontSize: 40,
        textAlign: 'center',
    },
    statusMessage: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 16,
        margin: 10,
    },
    column: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {},
    label: {
        fontSize: 25,
    },
});

class Home extends Component {
    constructor() {
        super();

        this.state = {
            scanning: false,
            peripherals: new Map(),
            appState: '',
            temperature: 'NA',
            humidity: 'NA',
            deviceID: '',
            deviceName: 'FeatherESP32',
            connected: false,
            statusMessage: '',
        };

        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(
            this,
        );
        this.handleStopScan = this.handleStopScan.bind(this);
        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
            this,
        );
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
            this,
        );
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    getSensorData = () => {
        this.startScan();
    };

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);

        BleManager.start({showAlert: false});

        this.handlerDiscover = bleManagerEmitter.addListener(
            'BleManagerDiscoverPeripheral',
            this.handleDiscoverPeripheral,
        );
        this.handlerStop = bleManagerEmitter.addListener(
            'BleManagerStopScan',
            this.handleStopScan,
        );
        this.handlerDisconnect = bleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            this.handleDisconnectedPeripheral,
        );
        this.handlerUpdate = bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            this.handleUpdateValueForCharacteristic,
        );
        this.setState({statusMessage: 'Cannot connect to sensor device.'});
    }
    handleAppStateChange(nextAppState) {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            console.log('App has come to the foreground!');
            BleManager.getConnectedPeripherals([]).then(peripheralsArray => {
                console.log(
                    'Connected peripherals: ' + peripheralsArray.length,
                );
            });
        }
        this.setState({appState: nextAppState});
    }

    componentWillUnmount() {
        this.handlerDiscover.remove();
        this.handlerStop.remove();
        this.handlerDisconnect.remove();
        this.handlerUpdate.remove();
    }

    handleDisconnectedPeripheral(data) {
        let peripherals = this.state.peripherals;
        let peripheral = peripherals.get(data.peripheral);
        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            this.setState({peripherals});
        }
        console.log('Disconnected from ' + data.peripheral);
        this.setState({connected: false});
    }

    handleUpdateValueForCharacteristic(data) {
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
            this.setState({temperature: data.value[0]});
        }
        if (
            data.characteristic.toLowerCase() ==
            humidityCharacteristicUUID.toLowerCase()
        ) {
            console.log('changed humidity');
            this.setState({humidity: data.value[0]});
        }
    }

    async readCharacteristic(deviceID, serviceUUID, characteristicUUID) {
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
    }

    async startNotifications() {
        try {
            let peripheralInfo = await BleManager.retrieveServices(
                this.state.deviceID,
            );
            await BleManager.startNotification(
                this.state.deviceID,
                serviceUUID,
                humidityCharacteristicUUID,
            );
            BleManager.startNotification(
                this.state.deviceID,
                serviceUUID,
                tempCharacteristicUUID,
            );
        } catch (error) {
            console.log(error);
        }
    }

    async connectToDevice(id) {
        try {
            await BleManager.connect(id);
            let peripherals = this.state.peripherals;
            let p = peripherals.get(id);
            if (p) {
                p.connected = true;
                peripherals.set(id, p);
                this.setState({peripherals});
                this.setState({connected: true, statusMessage: ''});
            }
        } catch (error) {
            this.setState({statusMessage: 'Cannot connect to sensor device'});
        }
    }

    async readDataFromSensorDevice() {
        try {
            await this.connectToDevice(this.state.deviceID);

            let temperature = await this.readCharacteristic(
                this.state.deviceID,
                serviceUUID,
                tempCharacteristicUUID,
            );

            let humidity = await this.readCharacteristic(
                this.state.deviceID,
                serviceUUID,
                humidityCharacteristicUUID,
            );
            this.setState({temperature: temperature, humidity: humidity});
            this.startNotifications();
        } catch (error) {
            console.log(error);
        }
    }

    async handleStopScan() {
        console.log('Scan is stopped');
        this.setState({scanning: false});

        if (this.state.deviceID) this.readDataFromSensorDevice();
        else {
            this.setState({statusMessage: 'Sensor not found.'});
        }
    }

    async startScan() {
        if (!this.state.scanning) {
            this.setState({peripherals: new Map()});
            let results = await BleManager.scan([], 3, true);
            console.log('Scanning...');
            this.setState({scanning: true});
        }
    }

    async retrieveConnected() {
        let results = await BleManager.getConnectedPeripherals([]);

        if (results.length == 0) {
            console.log('No connected peripherals');
        }
        console.log(results);
        let peripherals = this.state.peripherals;
        for (let i = 0; i < results.length; i++) {
            let peripheral = results[i];
            peripheral.connected = true;
            peripherals.set(peripheral.id, peripheral);
            this.setState({peripherals});
        }
    }

    async handleDiscoverPeripheral(peripheral) {
        var peripherals = this.state.peripherals;
        if (!peripherals.has(peripheral.id)) {
            peripherals.set(peripheral.id, peripheral);
            this.setState({peripherals});

            /* If we find our ESP temperature device, than we can stop the scan*/
            if (peripheral.name == this.state.deviceName) {
                console.log('FOUND DEVICE: ' + peripheral.id);
                this.setState({deviceID: peripheral.id});

                await BleManager.stopScan();
                this.setState({scanning: false});
            }
        }
    }

    render() {
        return (
            <View style={styles.topView}>
                <View style={styles.topView}>
                    <Text style={styles.title}>My Temperature Sensor</Text>
                    <Button
                        style={styles.button}
                        onPress={this.getSensorData}
                        title="Get Sensor Data"
                    />
                </View>
                <View>
                    <Text style={styles.statusMessage}>
                        {this.state.statusMessage}
                    </Text>
                </View>
                <Grid style={styles.table}>
                    <Col size={3} style={styles.column}>
                        <Row size={1} style={styles.row}>
                            <Text style={styles.label}>
                                Temperature F&deg;:
                            </Text>
                        </Row>
                        <Row size={1} style={styles.row}>
                            <Text style={styles.label}>Humidity:</Text>
                        </Row>
                    </Col>
                    <Col size={2} style={styles.column}>
                        <Row size={2} style={styles.row}>
                            <View style={styles.temperatureTextView}>
                                <Text style={styles.temperatureText}>
                                    {this.state.temperature}&deg;
                                </Text>
                            </View>
                        </Row>
                        <Row size={2} style={styles.row}>
                            <View style={styles.temperatureTextView}>
                                <Text style={styles.temperatureText}>
                                    {this.state.humidity}%
                                </Text>
                            </View>
                        </Row>
                    </Col>
                </Grid>
            </View>
        );
    }
}

export default Home;
