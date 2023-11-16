import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import ScannerScreen from './screens/scanner';
import InfoScreen from './screens/info';

function App() {
  const Stack = createNativeStackNavigator();
  const Drawer = createDrawerNavigator();

  return (
    <NavigationContainer initialRouteName='Scanner' >
      <Drawer.Navigator>
        <Stack.Screen name='Scanner' component={ScannerScreen} title='Barcode Scanner' />
        <Stack.Screen name='Info' component={InfoScreen} title='Item Information' />
        {/* <Stack.Screen name='Settings' /> */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodebox: {
    backgroundColor: 'tomato',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
});


