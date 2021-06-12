import React from 'react'
import {View,Text,ScrollView,StyleSheet, FlatList,TextInput,TouchableOpacity} from 'react-native'
import db from '../config'
export default class SearchScreen extends React.Component{
    constructor(){
        super()
        this.state={
            alltransactions:[],
            search:'',
            lastVisibleTransaction:null
        }
    }
    fetchdata=async()=>{

        var docref = await db.collection("transaction").limit(3).get()
        docref.docs.map(doc=>{
            this.setState({alltransactions:[...this.state.alltransactions, doc.data()],lastVisibleTransaction:doc})
        })
    }
    componentDidMount(){
        this.fetchdata()
    }
    searchTransactions= async(text) =>{ 
        var enteredText = text.split("") 
        if (enteredText[0].toUpperCase() ==='B')
        { const transaction = await db.collection("transaction").where('BookId','==',text)
        .get() 
        transaction.docs.map((doc)=>{
             this.setState({ alltransactions:[...this.state.alltransactions,doc.data()],
                 lastVisibleTransaction: doc }) }) } 
                 else if(enteredText[0].toUpperCase() === 'S'){ 
                     const transaction = await db.collection('transaction')
                     .where('studentId','==',text).get()
                      transaction.docs.map((doc)=>{ 
    this.setState({ alltransactions:[...this.state.alltransactions,doc.data()],
         lastVisibleTransaction: doc }) }) } }
    fetchMoreTransactions = async ()=>{
         var text = this.state.search.toUpperCase() 
         var enteredText = text.split("") 
         if (enteredText[0].toUpperCase() ==='B')
         { const query = await db.collection("transaction").where('BookId','==',text)
         .startAfter(this.state.lastVisibleTransaction).limit(10).get()
          query.docs.map((doc)=>{ this.setState({ 
              alltransactions: [...this.state.alltransactions, doc.data()],
               lastVisibleTransaction: doc }) }) } 
               else if(enteredText[0].toUpperCase() === 'S')
               { const query = await db.collection("transaction").where('bookId','==',text)
               .startAfter(this.state.lastVisibleTransaction).limit(10).get() 
               query.docs.map((doc)=>{ this.setState({ 
                   alltransactions: [...this.state.alltransactions, doc.data()],
                    lastVisibleTransaction: doc }) }) } }
    render(){
        return(
            <View Style= {styles.container}>
                <View style={styles.searchBar}> 
                <TextInput style ={styles.bar} placeholder = "Enter Book Id or Student Id" 
                onChangeText={(text)=>{this.setState({search:text})}}/> 
                <TouchableOpacity style = {styles.searchButton} 
                onPress={()=>{this.searchTransactions(this.state.search)}} > <Text>Search</Text> 
                </TouchableOpacity> </View>
                <FlatList
                data= {this.state.alltransactions}
                renderItem={({item})=>
               (<View Style={{borderBottomWidth:2}}><Text> {item.BookId} </Text>
                    <Text> {item.studentId} </Text>
                    
                    <Text> {item.TransactionType} </Text>
                    </View>)
            }
        keyExtractor={(item,index)=>index.toString}
        onEndReached ={this.fetchMoreTransactions} 
        onEndReachedThreshold={0.7}
            />
            </View>
        )
    }
}
const styles = StyleSheet.create({ container: { flex: 1, marginTop: 20 }, searchBar:{ flexDirection:'row', height:40, width:'auto', borderWidth:0.5, alignItems:'center', backgroundColor:'grey', }, bar:{ borderWidth:2, height:30, width:300, paddingLeft:10, }, searchButton:{ borderWidth:1, height:30, width:50, alignItems:'center', justifyContent:'center', backgroundColor:'green' } })