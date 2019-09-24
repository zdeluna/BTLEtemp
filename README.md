# Temperature Sensor React Native App

This project uses an ESP32 microcontroller to measure temperature/humidity and sends sensor data via BlueTooth Low Energy (BLE) to an application on a mobile device made with React Native

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to create an ESP32 microcontroller such as Adafruit's Huzzah32. You will also need a temperature sensor such as the DHT 11.
You will also need XCode to run the React Native application.

### Installing

To run the React Native App after installing Homebrew using the instructions outlined in https://facebook.github.io/react-native/docs/getting-started

```
brew install yarn
brew install node
brew install watchman
brew tap AdoptOpenJDK/openjdk
brew cask install adoptopenjdk8
npm install -g react-native-cli
```

On Xcode, to run the application, plug in a mobile device with Bluetooth enabled before running.

```

## Built With

-   [React-Native](https://facebook.github.io/react-native/)
-   [React-Native Bluetooth Communication Module](https://github.com/innoveit/react-native-ble-manager/)

## Authors

-   **Zach DeLuna** - _Initial work_ - (https://github.com/zdeluna)
```
