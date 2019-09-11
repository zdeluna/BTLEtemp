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

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

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
        this.setState({temperature: '30', humidity: 20});
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
    }

    handleUpdateValueForCharacteristic(data) {
        console.log(
            'Received data from ' +
                data.peripheral +
                ' characteristic ' +
                data.characteristic,
            data.value,
        );
    }

    connectToDevice(id) {
        BleManager.connect(id).then(() => {
            let peripherals = this.state.peripherals;
            let p = peripherals.get(id);
            if (p) {
                p.connected = true;
                peripherals.set(id, p);
                this.setState({peripherals});
            }
            console.log('Connected to ' + id);
        });
    }
    handleStopScan() {
        console.log('Scan is stopped');
        this.setState({scanning: false});
        connectToDevice('D4-61-9D-38-CE-A1');
    }

    startScan() {
        if (!this.state.scanning) {
            this.setState({peripherals: new Map()});
            BleManager.scan([], 3, true).then(results => {
                console.log('Scanning...');
                this.setState({scanning: true});
            });
        }
    }

    retrieveConnected() {
        BleManager.getConnectedPeripherals([]).then(results => {
            if (results.length == 0) {
                console.log('No connected peripherals');
            }
            console.log(results);
            var peripherals = this.state.peripherals;
            for (var i = 0; i < results.length; i++) {
                var peripheral = results[i];
                peripheral.connected = true;
                peripherals.set(peripheral.id, peripheral);
                this.setState({peripherals});
            }
        });
    }

    handleDiscoverPeripheral(peripheral) {
        var peripherals = this.state.peripherals;
        if (!peripherals.has(peripheral.id)) {
            console.log('Got ble peripheral', peripheral);
            peripherals.set(peripheral.id, peripheral);
            this.setState({peripherals});
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
                        title="Get Car Temperature"
                    />
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
