import React, {Component, Fragment} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Divider} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Col, Row, Grid} from 'react-native-easy-grid';

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
    state = {temperature: 'NA', humidity: 'NA'};

    getSensorData = () => {
        this.setState({temperature: '30', humidity: 20});
    };

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
