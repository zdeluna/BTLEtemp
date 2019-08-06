import React, {Component, Fragment} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Divider} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
    topView: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    tempView: {
        width: 100,
        height: 100,
        backgroundColor: '#e8e8e8',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 30,
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
    temperature: {
        fontSize: 60,
        textAlign: 'center',
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
                <View style={styles.tempView}>
                    <Text style={styles.temperature}>34&deg;</Text>
                </View>
            </View>
        );
    }
}

export default Home;
