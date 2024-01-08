import 'react-native-gesture-handler';
import React, {useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library'; //for saving to local system
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// export const useFocus = () => {
//   // Variables
//   const navigation = useNavigation();
//   const [focusState, setFocusState] = useState(false);
//   const [focusCount, setFocusCount] = useState(0);
//   const isFirstTime = focusCount === 1;
  
//   useEffect(() => {
//     //
//     const unsubscribeFocus = navigation.addListener('focus', () => {
//       setFocusState(true);
//       setFocusCount(prev => prev + 1);
//     });
//     const unsubscribeBlur = navigation.addListener('blur', () => {
//       setFocusState(false);
//     });
//     return () => {
//       test();
//       unsubscribeFocus();
//       unsubscribeBlur();
//     };
//   });
//   return {focusState, isFirstTime, focusCount};
// }

function App({route,navigation}) {
    const barcode = String(route.params.barcode.text);
    const {barcode2} = route.params;
    const [itemData,setItemData] = useState([]);
    const [content,setContent] = useState([]);
    const isFocused = useIsFocused();
    // const {focusCount, focusState} = useFocus();

    console.log('Barcode: '+ barcode);
    console.log('Barcode 2: '+ barcode2);

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

          const contentTxt = await FileSystem.readAsStringAsync(file2);
          setContent(contentTxt);

          // Do something with the file contents
          console.log(content);
          // console.log(content2);
          search(content);
          // return content
        } catch (error) {
            console.warn('File System/Permission Error: \n'+ error);
        }
    };

    const search = (data) => {
      // Declaring variables at start of function
      let itemName = '';
      let itemPrice = 0.00;
      // let itemStock = 0;
      let price = 0.00;
      let vat = 0.00;
      const tax = 0.125;
    
      let i = 0;
      const searchItemData = [];

      // console.log('CSV Data: '+ JSON.stringify(data));

      //The data json variable holds the values of the csv as a single string value
      //separated by , and \r\n for new rows.
      //It is converted to an array where \r\n is used to separate indexes.
      let dataStrng = String(data);
      // let dataStrng = String(contentCSV);
      let dataRow = dataStrng.split('\r\n');

      //Pull the spreadsheet headers
      let headers = dataRow[0].split(',');

      //Loop through the rest of the array to pull each row as an array with content
      let searchContent = [];
      for (let f = 1,row=0; f < dataRow.length;f++,row++) {
          let start = f;
          searchContent[row] = dataRow[start].split(',');
      }

      const itemNumIndex = headers.indexOf('ItemNum');
      const itemNameIndex = headers.indexOf('ItemName');
      const itemPriceIndex = headers.indexOf('Price');
      const itemTaxIndex = headers.indexOf('Tax_1');

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
      for (let index = 0; index < searchContent.length; index++) {
        if (itemNumIndex != -1) {
          console.log("Content Row: " + searchContent[index]);
          if (searchContent[index][itemNumIndex] == barcode) {
              searchItemData[i] = searchContent[index];
              // console.log('searchItemData in loop: '+ searchItemData[i]);
              console.warn('Barcode in loop: '+ barcode);
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

      // If searchItem returns empty use default empty values
      // Else save Item values and calculate price
      if (searchItem[0] != "undefined") {
        //Save the Items Name
        if (itemNameIndex > -1) {
          itemName = searchItem[itemNameIndex];
        } else {
          alert('ItemName header not found in CSV file.');
        }

        // Calculate VAT
        if (itemPriceIndex > -1) {
          price = Number(searchItem[itemPriceIndex]); 
          vat = price * tax;
          console.log('Price: '+ price+'\n Search Item with index: '+searchItem[itemPriceIndex]+'\n VAT: '+vat);
        } else {
          alert('Price header not found in CSV file.');
        }

        // Calculate Price
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

        // Pass Values to Template
        setItemData([barcode,itemName,itemPrice]);
        console.log('Item Info: '+itemData);
      } else {
        setItemData(['000','Item not found','0.00']);
      }

      return itemData
    };
  
    // Launch the search function and
    // Navigate to the specified screen after 15 seconds
    let focusCount = 0;
    React.useEffect(() => {
      const test = navigation.addListener('focus', () => {
        //Screen is focused, Do something
        focusCount = focusCount + 1;
        console.log('Content Values: \n'+ content);
        if (content.length == 0) {
          askForFilePermission();
        } else {
          search(content);
        }

        // if (focusCount == 1) {
        //   askForFilePermission();
        // } else {
        //   search(content);
        // }

        const timeout = setTimeout(() => {
          // isFocused = false;
          alert('Going Back To Scanner');
          navigation.goBack('Scanner'); // the name of the screen you want to navigate to
        }, 10000); // the number of milliseconds you want to wait before navigating 
      });
    }, [navigation]);

    // useEffect(() => {
    //   if (focusCount === 1 && focusState) {
    //     //This is the first time focus => init screen here
    //     askForFilePermission();
    //   }
    // });

    // useEffect(() => {
    //   if (focusCount > 1 && focusState) {
    //     // trigger when you navigate back from another screen
    //     // you can background reload data here
    //     search(contentCSV);
    //   }
    // });
  
    //Check itemData and return the appropriate screens
    if (itemData[1] == 'Item not found') {
      return (
        <View style={styles.container}>
          <Text>{itemData[1]}.</Text>
          <Text style={{marginBottom: 20}}>Please Scan Another Item.</Text>
          {/* <Button title='Scan Again?' onPress={() => navigation.goBack('Scanner')}/> */}
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

  