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

import BLEManager from './BLEManager';

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
    }

    componentDidMount() {
        /*
        this.handlerUpdateSensorData = this.BLEManager.bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            this.updateSensorData,
);*/
    }

    componenentWillUnMount() {
        this.handlerUpdateSensorData.remove();
    }

    getSensorData = (temp, humidity) => {
        console.log(
            'IN SENSOR FUNCTION ' + 'temp: ' + temp + 'humidity: ' + humidity,
        );
        this.setState({temperature: temp, humidity: humidity});
    };

    updateStatus = message => {
        console.log('Update STATUS: ' + message);
        this.setState({statusMessage: message});
    };

    render() {
        return (
            <View style={styles.topView}>
                <View>
                    <BLEManager
                        onSensorUpdate={(event, temp, humidity) =>
                            this.getSensorData(event, temp, humidity)
                        }
                        setClick={click => (this.startScan = click)}
                        onStatusUpdate={this.updateStatus}
                    />
                </View>
                <View style={styles.topView}>
                    <Text style={styles.title}>My Temperature Sensor</Text>
                    <Button
                        style={styles.button}
                        onPress={() => this.startScan()}
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
