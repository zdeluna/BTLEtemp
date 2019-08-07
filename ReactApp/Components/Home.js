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
        fontSize: 50,
        textAlign: 'center',
    },
    column: {
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
        textAlignVertical: 'center',
        flex: 1,
    },
    label: {
        fontSize: 25,
    },
});

class Home extends Component {
    render() {
        return (
            <View style={styles.topView}>
                <View style={styles.topView}>
                    <Text style={styles.title}>My Temperature Sensor</Text>
                    <Button style={styles.button} title="Get Car Temperature" />
                </View>
                <Grid style={styles.table}>
                    <Col style={styles.column}>
                        <Row>
                            <Text style={styles.label}>
                                Temperature F&deg;:
                            </Text>
                        </Row>
                    </Col>
                    <Col style={styles.column}>
                        <Row>
                            <View style={styles.temperatureTextView}>
                                <Text style={styles.temperatureText}>
                                    34&deg;
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
