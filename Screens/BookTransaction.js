import React from 'react'
import {Text,View,TouchableOpacity, StyleSheet, CameraRoll, Image, TextInput, KeyboardAvoidingView} from 'react-native'
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permission from 'expo-permissions'
import db from '../config'
import firebase from 'firebase'
export default class BookTransaction extends React.Component{
    constructor(){
        super()
        this.state={
            hasCameraPermission:null,
            buttonState:'Normal',
            scanned:'false',
            scandata:'',
            scanBookId:'',
            scanStudentId:'',
            message:''
        }
    }
    getcameraPermissions = async()=>{
        const {status} = await Permission.askAsync(Permission.CAMERA)
        if(status==='granted'){
            this.setState({
                hasCameraPermission:true,
                buttonState:'clicked',
                scanned:'false'
            })
        }
        console.log(this.state.hasCameraPermission)
    }
    handleBarcode=async({type,data})=>{
        const buttonState=this.state.buttonState
        if (buttonState==="bookId"){
        this.setState({
            scanned:true,
            scanBookId:data,
            buttonState:'Normal'
        })}
        else if (buttonState==="studenId"){
            this.setState({
                scanned:true,
                scanBookId:data,
                buttonState:'Normal'
            })
        }
    }
    initiateBookIssue =async()=>{
      db.collection("transaction").add({
        studentId:this.state.scanStudentId,
        BookId:this.state.scanBookId,
        Date:firebase.firestore.Timestamp.now().toDate(),
        TransactionType:"issue"
      })
      db.collection("Books").doc(this.state.scanBookId).update({
        bookAvailability:false
      })
      db.collection("Students").doc(this.state.scanStudentId).update({
        BooksTaken:firebase.firestore.FieldValue.increment(1)
      })
      this.setState({
        scanBookId:'',
        scanStudentId:''
      })
    }
    initiateBookReturn =async()=>{
      db.collection("transaction").add({
        studentId:this.state.scanStudentId,
        BookId:this.state.scanBookId,
        Date:firebase.firestore.Timestamp.now().toDate(),
        TransactionType:"return"
      })
      db.collection("Books").doc(this.state.scanBookId).update({
        bookAvailability:true
      })
      db.collection("Students").doc(this.state.scanStudentId).update({
        BooksTaken:firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({
        scanBookId:'',
        scanStudentId:''
      })
    }
    handleTransaction=async()=>{
    /*  var message=null
      db.collection("Books").doc(this.state.scanBookId).get()
      .then(doc=>{
        var book=doc.data()
        if(book.bookAvailability===true){this.initiateBookIssue();
          alert("Book is Issued")
        message="Book is Issued"}
        else{
          this.initiateBookReturn();
          alert("Book is Returned")
          message="book is returned"
        }
      })
      this.setState({
        message:message
      })*/
    var TransactionType=await this.checkBookAvailability()
    if (!TransactionType){
      alert("The book is not available in the library")
      this.setState({scanStudentId:'',scanBookId:''})
    }
    else if (TransactionType=="issue"){
      var StudentEligible=await this.checkIssue()
      if (StudentEligible){
        this.initiateBookIssue()
        alert("Book is issued to the student")
      
      }
    } 
    else {
      var StudentEligible=await this.checkReturn()
      if (StudentEligible){
        this.initiateBookReturn()
        alert("Book has been returned to the library")
      }
    }
    }
    checkBookAvailability=async()=>{
      const bookref = await db.collection("Books").where("BookId","==",this.state.scanBookId).get()
      var TransactionType=''
      if (bookref.docs.length==0){
        TransactionType= false
      }
    else{
      bookref.docs.map(doc=>{
        var book=doc.data()
        if(book.bookAvailability){
          TransactionType="issue"
        }
        else{
          TransactionType="return"
        }
      })
    }
      return TransactionType
    }
    checkIssue=async()=>{
      const studentref=await db.collection("Students").where("StudentId","==",this.state.scanStudentId).get()
      var StudentEligible=""
      if(studentref.docs.length==0){
        this.setState({
          scanStudentId:'',
          scanBookId:''
        }) 
        StudentEligible=false
        alert("Student ID is Invalid")
      }
      else{
        studentref.docs.map(doc=>{
          var student = doc.data()
          if (student.BooksTaken < 2){
            StudentEligible=true
          }
          else{
            StudentEligible=false
            alert("Student has already taken 2 books")
            this.setState({
              scanStudentId:'',
              scanBookId:''
            }) 
          }
        })
      }
      return StudentEligible
    }
    checkReturn=async()=>{
      const transactionref=await db.collection("transaction").where("BookId","==",this.state.scanBookId).limit(1).get()
      var StudentEligible=""
      transactionref.docs.map(doc=>{
        var transaction=doc.data()
        if (transaction.studentId == this.state.studentId){
          StudentEligible=true
        }
        else{
          StudentEligible=false
          alert("The book was not taken by this student")
          this.setState({
            scanStudentId:'',
            scanBookId:''
          }) 
        }
      })
      return StudentEligible
    }
  render(){
      const hasCameraPermission=this.state.hasCameraPermission
      const buttonState=this.state.buttonState
      const scanned=this.state.scanned
      if(hasCameraPermission===true && buttonState!=='Normal'){
          return(
            <BarCodeScanner 
            onBarCodeScanned={scanned?undefined:this.handleBarcode}></BarCodeScanner>
          )
        }
        else if(buttonState==='Normal'){
      return(
          <KeyboardAvoidingView  style={styles.container} behavior="padding" enabled>
           
              <Image source={require("../assets/booklogo.jpg")}
              style={{width:200,height:200}}/>
              
              
              <TextInput 
              style={styles.inputBox}
              placeholder={"Book Id"}
              onChangeText={text=>this.setState({scanBookId:text})}
              value={this.state.scanBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("bookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity> 
            
              <TextInput 
              style={styles.inputBox}
              placeholder={"Student Id"}
              onChangeText={text=>this.setState({scanStudentId:text})}
              value={this.state.scanStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("studentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity> 
         <TouchableOpacity style={styles.scanButton} onPress={async()=>{await this.handleTransaction()}}>
             <Text style={styles.buttonText}> Scan </Text>
         </TouchableOpacity>
          </KeyboardAvoidingView>
      )}
  }
}
const styles = StyleSheet.create({
     container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
     , displayText:{ fontSize: 15, textDecorationLine: 'underline' },
      scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 },
      inputBox:{
        width: 200,
        height: 40,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20
      },
      scanButton:{
        backgroundColor: '#66BB6A',
        width: 50,
        borderWidth: 1.5,
        borderLeftWidth: 0
      },
  
       buttonText:{ fontSize: 20, } });

