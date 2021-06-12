import React from 'react'
import firebase from 'firebase'
import {Text,View,TouchableOpacity, StyleSheet, CameraRoll, Image, TextInput, KeyboardAvoidingView} from 'react-native'
export default class Login extends React.Component {
    constructor(){
        super()
        this.state = {email:"",password:""}
    }
    login = async()=>{

        if(this.state.email && this.state.password){
            try{
            const response = await firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.password)
            if (response){
                this.props.navigation.navigate("TabNavigator")
            }}catch(error){
                alert(error)
            }
        }
        else{alert("Enter your email and password")}
    }
    render(){
        return(
            <KeyboardAvoidingView style = {{alignItems:"center", marginTop:20}}>
                <View>
                    <Image source={require("../assets/booklogo.jpg")}
                    style={{width:200,height:200}}></Image>
                    <Text style={{textAlign:'center',fontSize:30}}> Book Tracker </Text>
                </View>
                <TextInput style={{width:300,height:40,padding:10,margin:10,border:1.5}}
                placeholder="Enter your Email"
                keyboardType="email-address"
                onChangeText={T=> this.setState({email:T})}/>
                <TextInput style={{width:300,height:40,padding:10,margin:10,border:1.5}}
                placeholder="Enter your Password"
                secureTextEntry={true}
                onChangeText={T=> this.setState({password:T})}/>
                <TouchableOpacity style={{height:30,width:90,borderBottomWidth:2,padding:10,backgroundColor:"blue",margin:20,placeholderTextColor:"white"}}
                onPress={()=> this.login()}> <Text style={{color:"white"}}> Login </Text> </TouchableOpacity>
            </KeyboardAvoidingView>
        )
    }
}