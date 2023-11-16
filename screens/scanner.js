import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { useIsFocused } from '@react-navigation/native';

export default function App({navigation}) {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned');
  const barcode = '';
  const data = 0;
  const isFocused = useIsFocused();
  
  //Function for Requesting Camera Permission
  const askForCameraPermission = async() => {
    const {status} = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status == 'granted');
  };
  console.log('Scanned state: '+ scanned);
  console.log('Text state: '+ text);

  //Request Camera Permission
  useEffect(() => {
    console.log('Permission state: '+ hasPermission);
    
    const unsubscribe = navigation.addListener('focus', () => {
      // request camera permissions and set `hasPermission` state
      askForCameraPermission();
    });
    
    return () => {
      setScanned(false);
      setText('Not yet scanned');
    };

    return unsubscribe;
  }, [navigation]);

  //What happens when we scan the barcode
  const handleBarcodeScanned = useCallback(({type,data}) => {
    setScanned(true);
    setText(data);
    console.log('Barcode Type: '+type+'. With Data: '+data);
  }, [data]);

  //What happens when we scan the barcode
  const handleScanned = useCallback(({data}) => {
    setScanned(true);
    setText(data);
    console.log('With Data from input: '+data);
  }, [data]);

  //What happens when we press scan again
  const handleRescan = () => {
    setScanned(false);
    setText('Not Scanned Yet.');
  };

  //Check permissions and return the appropriate screens
  if (hasPermission == null){
    return(
      <View style={styles.container}>
        <Text>Requesting Camera Permissions</Text>
      </View>
      // <View style={styles.container}>
      //   <Text style={{margin: 10}}>No Camera Access</Text>
      //   <Button title={'Allow Camera Permissions'} onPress={() => askForCameraPermission()} />
      // </View>
    )
  }

  if (hasPermission == false) {
    return (
      <View style={styles.container}>
        <Text style={{margin: 10}}>No Camera Access</Text>
        <Button title={'Allow Camera Permissions'} onPress={() => askForCameraPermission()} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <View style={styles.barcodebox}>
          <BarCodeScanner 
            onBarCodeScanned={scanned ? undefined : handleBarcodeScanned}
            style={{ height: 400, width: 400 }}
          />
        </View>
      )}
      <Text style={styles.maintext}>{text}</Text>
      <TextInput 
        style={styles.border}
        placeholder='Please scan an item'
        onChangeText={newBarcode => setText(newBarcode)}
        defaultValue={text}
        activeUnderlineColor='red'
      />
      <View styles={styles.buttonContainer} rowGap={30} >
        <Button title='See Item Info' onPress={() => navigation.navigate('Info', { barcode: {text} }) } />
        {/* {scanned && <Button title={'Scan Again?'} onPress={() => setScanned(false) && setText('Not scanned yet')} color='tomato' />} */}
        {scanned && <Button title={'Scan Again?'} onPress={() => handleRescan()} color='tomato' />}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
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
  buttonContainer: {
    alignItems: 'center',
    // justifyContent: 'space-evenly',
  },
  buttonBkgd: {
    height: 300,
    width: 300,
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  border: {
    borderColor: '#4287f5',
    borderWidth: 1,
    padding: 2,
    margin:5,
  },
});
