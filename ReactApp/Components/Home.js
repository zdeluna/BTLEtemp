import React, {Component, Fragment} from 'react';
import {
    AppRegistry,
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
import styles from './Home.style.js';
import {
    SERVICE_UUID,
    TEMP_CHARACTERISTIC_UUID,
    HUMIDITY_CHARACTERISTIC_UUID,
} from 'react-native-dotenv';

import BLEManager from './BLEManager.js';

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
        this.BLEManager = new BLEManager();
        console.log('IN HOME: ' + this.BLEManager.deviceName);
        console.log('IN HOME: ' + this.BLEManager.bleManagerEmitter);
    }

    componentDidMount() {
        this.handlerUpdateSensorData = this.BLEManager.bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            this.updateSensorData,
        );
    }

    componenentWillUnMount() {
        this.handlerUpdateSensorData.remove();
    }

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
    };

    getSensorData = () => {
        this.BLEManager.startScan();
    };

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
