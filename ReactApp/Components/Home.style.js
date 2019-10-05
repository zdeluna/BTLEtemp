import {StyleSheet} from 'react-native';

export default StyleSheet.create({
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
