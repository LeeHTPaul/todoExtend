import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../database/firebaseDB";

const db = firebase.firestore().collection("todos");
export default function NotesScreen({ navigation, route }) {
  const [notes, setNotes] = useState([]);

  // load up firebase database on start
  // the snapshot keeps everything synched - no need to refresh it later 
  // onSnapshot() is a listener

useEffect(() => {
  const unsubscribe = db.orderBy("created","desc").onSnapshot((collection) => {
    const updatedNotes = collection.docs.map((doc) => {
    // create our own object that pulls the id into a property
    const noteObject = {
      ...doc.data(),
      id: doc.id,
    };
    //console.log("noteobject", noteObject); loop thru the collection
    return noteObject;
  });
  //console.log("setNotes");
  setNotes(updatedNotes);
  });
//console.log("return unsubscribe"); // run after thread close
  return unsubscribe; //return the cleanup function
}, []);
//*/
/*
  useEffect(() => {
    const unsubscribe = firebase.firestore().collection("todos").onSnapshot
    ((collection) => {
      const updatedNotes = collection.docs.map((doc) => doc.data());
      setNotes(updatedNotes);  // set our notes array to its docs
    });
    // unsubscribe when unmounting
    return () => {
      unsubscribe();
    };
  }, []);  */
  // This is to set up the top right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={addNote}>
          <Ionicons
            name="ios-create-outline"
            size={30}
            color="black"
            style={{
              color: "#f55",
              marginRight: 10,
            }}
          />
        </TouchableOpacity>
      ),
    });
  });

  // Monitor route.params for changes and add items to the database
  useEffect(() => {
    if (route.params?.text) {
      const newNote = {
        title: route.params.text,
        done: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        //id: notes.length.toString(), -- no more id line
      };
      // different text and existing text - to consider to add
      // if textE Add - meaning new todo - to add if not dont add

      //replace by textE=== Add below start
      //if (route.params.text !== route.params.textE) {
      //   route.params?.textE ? console.log("do nothing") : db.add(newNote);
      //   console.log("inside.. ", route.params.textE);
      //} else console.log("outside");
      // replace by textE === Add .... end 
      if (route.params.textE === "Add") db.add(newNote);
      //if (addInd) {
      //    db.add(newNote);
      //    addInd = false; 
      //}
      //db.add(newNote);
      //firebase.firestore().collection("todos").add(newNote);
      // setNotes([...notes, newNote]); this line can be deleted
    }
  }, [route.params?.text]);

  // update only ..  text below ?id meaning any change in id
  //console.log("update check. route==", route)
  useEffect(() => {
    if (route.params?.id) {
      if (route.params.text !== route.params.textE) {
        console.log("From Update -updating. ", route.params.id);
      //db.doc(route.params.id).delete();
        db.doc(route.params.id).update({title : route.params.text});
      }
    }
  }, [route.params?.id]);
  // update text end

  function addNote() {
    navigation.navigate("Add Screen");
  }

  function doneNote(id){
    db.doc(id).update({done : true});
  }
  // This deletes an individual note
  function deleteNote(id) {
    console.log("Deleting " + id);
    // To delete that item, we filter out the item we don't want
    //setNotes(notes.filter((item) => item.id !== id));
    db.doc(id).delete();  // this is much simpler now we have the fire ID
    //db.doc(id).update({title : "new to do from update"});
    /*firebase
    .firestore()
    .collection("todos")
    .where("id", "=", id)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => doc.ref.delete()); 
    }); */
  }

  // The function to render each row in our FlatList
  let iconName;
  function renderItem({ item }) {
    iconName = item.done ?  'checkbox' : 'checkbox-outline';
    return (
      <View
        style={{
          padding: 10,
          paddingTop: 20,
          paddingBottom: 20,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Ionicons name="trash" size={16} color="#944" />
        </TouchableOpacity>
        <Text onPress={() => navigation.navigate("Update", {item})}> {item.title}</Text>
        <TouchableOpacity onPress={() => doneNote(item.id)}> 
        <Ionicons
           name={iconName} 
           size={16}
           color="red" 
           style={{ marginLeft: 20 }}
         />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        style={{ width: "100%" }}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc",
    alignItems: "center",
    justifyContent: "center",
  },
});
