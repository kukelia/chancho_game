const app = require('express')();
var express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));
http.listen(8000, function() {
   console.log('listening on *:8000');
});
function shuffle(array) {
   let currentIndex = array.length,  randomIndex;
 
   // While there remain elements to shuffle...
   while (currentIndex != 0) {
 
     // Pick a remaining element...
     randomIndex = Math.floor(Math.random() * currentIndex);
     currentIndex--;
 
     // And swap it with the current element.
     [array[currentIndex], array[randomIndex]] = [
       array[randomIndex], array[currentIndex]];
   }
 
   return array;
 }
var cards_by_players =[
   [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4],                 //4 players
   [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5],         //5 players
   [1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6]  //6 players
]

var users = []
var decks = [
   [0,0,0,0], //player 1
   [0,0,0,0], //player 2
   [0,0,0,0], //player 3
   [0,0,0,0], //player 4
   [0,0,0,0], //player 5
   [0,0,0,0]  //player 6
]
var temp_deck=[
   [0,0,0,0], //player 1
   [0,0,0,0], //player 2
   [0,0,0,0], //player 3
   [0,0,0,0], //player 4
   [0,0,0,0], //player 5
   [0,0,0,0]  //player 6
]
var user_data=[
   [''],
   [''],
   [''],
   [''],
   [''],
   ['']
]
var arr_shuffled;

io.on("connection", (socket) => {

   users.push(socket.id)
   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
      users.splice(users.indexOf(socket.id) ,1);
   });

   socket.on('set_name', function(name){
      user_data[users.indexOf(socket.id)][0] = name;
      console.log(socket.id, 'logged')
      io.emit('add_player', name);
      console.log(name, 'is the name!!')
      if(socket.id == users[0]){
         io.to(socket.id).emit('set_admin');
      }
   });
   socket.on('start_game', function () {   
      arr_shuffled = shuffle(cards_by_players[users.length-4]);
      for(var i =0; i<users.length;i++){
         for(var j=0; j<4;j++){
            decks[i][j] = arr_shuffled[i*4 + j];
         }
         io.to(users[i]).emit('initial_deck', decks[i]);
      }
   });

   socket.on('l1b', function () { 
      io.emit('l1');

   });

   socket.on('upload_selection',function () {  //aca
     

   });

});

// arr[(i % n + n) % n]
// socket.on('', function () {   });