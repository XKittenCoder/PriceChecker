import 'react-native-gesture-handler';
import React, {useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library'; //for saving to local system
import AsyncStorage from '@react-native-async-storage/async-storage';

function App({navigation,route}) {
    const barcode = String(route.params.barcode.text);
    const [itemData,setItemData] = useState([]);
    const [content,setContent] = useState([]);
    const isFocused = useIsFocused();

    const askForFilePermission = async () => {
        try {
          //root Documents directory
          const uri = "content://com.android.externalstorage.documents/tree/primary%3ADocuments/document/primary%3ADocuments";
          const uriPictures = "content://com.android.externalstorage.documents/tree/primary%3ADocuments/document/primary%3ADocuments%2FItem%20Pictures";
          
          //Request File Permissions
          const filePermissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(uri);
          // const mediaLibPermissions = await MediaLibrary.requestPermissionsAsync();

          // Find files in a folder
          if (filePermissions == true) {
            const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(uri);
            console.log('Files in document folder: ' + files);
          } else {
            const files = null;
          }
          // const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(uri);
          // const pictures = await FileSystem.StorageAccessFramework.readDirectoryAsync(uriPictures);
          // console.log('Files in document folder: ' + files);
          // console.log('Pictures in document folder: ' + pictures);

          // Path to file named 'export_inventory.csv' in android 'Document' directory
          // file = "content://com.android.externalstorage.documents/tree/primary%3ADocuments/document/primary%3ADocuments%2Fexport_inventory.csv";

          // Path to file named 'export_inventory5.csv' in android 'Document' directory
          file2 = "content://com.android.externalstorage.documents/tree/primary%3ADocuments/document/primary%3ADocuments%2Fexport_inventory7.csv";

          // const content = await FileSystem.readAsStringAsync(file);
          const content2 = await FileSystem.readAsStringAsync(file2);
          setContent(await FileSystem.readAsStringAsync(file2));

          // Do something with the file contents
          // console.log(content);
          // console.log(content2);

          search(content);
        } catch (error) {
            console.warn('File System/Permission Error: \n'+ error);
        }
    };

    const search = (data) => {
      // Declaring variables at start of function
      let itemName = '';
      let itemPrice = 0.00;
      // let itemStock = 0;
      let barcodeValidation = isNaN(barcode);
      let price = 0.00;
      let vat = 0.00;
      const tax = 0.125;

      console.log('Is barcode not a number: '+barcodeValidation);

      if (barcodeValidation == false) {
          console.log('CSV Data: '+ JSON.stringify(data));
  
          //The data json variable holds the values of the csv as a single string value
          //separated by , and \r\n for new rows.
          //It is converted to an array where \r\n is used to separate indexes.
          let dataStrng = String(data);
          let dataRow = dataStrng.split('\r\n');
  
          //Pull the spreadsheet headers
          let headers = dataRow[0].split(',');
  
          //Loop through the rest of the array to pull each row as an array with content
          let content = [];
          for (let f = 1,row=0; f < dataRow.length;f++,row++) {
              let start = f;
              content[row] = dataRow[start].split(',');
          }

          let itemNumIndex = headers.indexOf('ItemNum');
          let itemNameIndex = headers.indexOf('ItemName');
          let itemPriceIndex = headers.indexOf('Price');
          let itemTaxIndex = headers.indexOf('Tax_1');

          if (itemNumIndex == -1) {
            alert("Column not found: ItemNum is excepted.");
          } else if (itemNameIndex == -1) {
            alert("Column not found: ItemName is excepted.");
          } else if (itemPriceIndex == -1) {
            alert("Column not found: Price is excepted.");
          } else if (itemTaxIndex == -1) {
            alert("Column not found: Tax_1 is excepted.");
          }

          // Loop through the content and find item based on the barcode scan value,
          // barcode
          let i = 0;
          let searchItemData = [];
          for (let index = 0; index < content.length; index++) {
            if (itemNumIndex != -1) {
              console.log("Content Row: " + content[index]);
              if (content[index][itemNumIndex] == barcode) {
                  searchItemData[i] = content[index];
                  i++;
              }
            } else {
              alert('ItemNum header not found in CSV file.');
            }
          }
          console.log('Search Item Data: '+ searchItemData);

          // Save search item data in a form that can be used;
          let searchItemStr = String(searchItemData[0]);
          let searchItem = searchItemStr.split(',');

          console.log('Search Item: '+ searchItem);

          //Save the Items Value
          if (itemNameIndex > -1) {
            itemName = searchItem[itemNameIndex];
          } else {
            alert('ItemName header not found in CSV file.');
          }

          if (itemPriceIndex > -1) {
            price = Number(searchItem[itemPriceIndex]); 
            vat = price * tax;
            console.log('Price: '+ price+'\n Search Item with index: '+searchItem[itemPriceIndex]+'\n VAT: '+vat);
          } else {
            alert('Price header not found in CSV file.');
          }

          if (itemTaxIndex > -1) {
            if (searchItem[itemTaxIndex] == 'True') {
              let iSales = price + vat;
              itemPrice = iSales.toFixed(2);
            } else {
              let iSales = price;
              itemPrice = iSales.toFixed(2);
            }
          } else {
            alert('Tax_1 header not found in CSV file.');
          }

          setItemData([barcode,itemName,itemPrice]);
          console.log('Item Info: '+itemData);
      } else {
          setItemData(['000','Item not found','0.00']);
      }
    };
  
    // Launch the search function and
    // Navigate to the specified screen after 15 seconds
    // useEffect(() => {
    //   askForFilePermission();
    //   // search();

    //   if (isFocused == true) {
    //     alert('Going Back To Scanner');
    //     // return () => clearTimeout(timeout);
    //     const timeout = setTimeout(() => {
    //       // isFocused = false;
    //       navigation.goBack('Scanner'); // the name of the screen you want to navigate to
    //     }, 10000); // the number of milliseconds you want to wait before navigating  1000ms=1s
    //   }
    // }, [isFocused]); // barcode,navigation,

    React.useEffect(() => {
      const test = navigation.addListener('focus', () => {
        //Screen is focused, Do something
        if (content == null) {
          askForFilePermission();
        } else {
          search(content2);
        }
        // askForFilePermission();
        // return () => clearTimeout(timeout);
        const timeout = setTimeout(() => {
          // isFocused = false;
          alert('Going Back To Scanner');
          navigation.goBack('Scanner'); // the name of the screen you want to navigate to
        }, 10000); // the number of milliseconds you want to wait before navigating 
      });
      return test
    }, [navigation]);
  
    //Check itemData and return the appropriate screens
    if (itemData[1] == 'Item not found') {
      return (
        <View style={styles.container}>
          <Text>{itemData[1]}.</Text>
          <Text style={{marginBottom: 20}}>Please Scan Another Item.</Text>
          <Button title='Scan Again?' onPress={() => navigation.goBack('Scanner')}/>
        </View>
      )
    }
  
    return (
      <View style={styles.container}>
        <Text>Item Barcode: {itemData[0]} </Text>
        <Text>Item Name: {itemData[1]} </Text>
        <Text>Item Price: ${itemData[2]} </Text>
      </View>
    )
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

  