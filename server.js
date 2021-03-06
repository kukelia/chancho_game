const app = require('express')();
const { sign } = require('crypto');
var express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));

http.listen(process.env.PORT || 8000, 
	() => console.log("Server is running..."));

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
];

var users = [];  //socket.id de c/ user
var decks = [
   [0,0,0,0], //player 1
   [0,0,0,0], //player 2
   [0,0,0,0], //player 3
   [0,0,0,0], //player 4
   [0,0,0,0], //player 5
   [0,0,0,0]  //player 6
];
var temp_deck=[
   [0,0,0,0], //player 1
   [0,0,0,0], //player 2
   [0,0,0,0], //player 3
   [0,0,0,0], //player 4
   [0,0,0,0], //player 5
   [0,0,0,0]  //player 6
];

var user_dict = {};
var puntaje = {}; //almacena estado de chanchito de c/ player
var arr_shuffled;
var n_uploaded = 0;
var lista_chancho = [];
var setted_name =0;
let signo = 1; //-1 es izquierda, 1 es derecha

io.on("connection", (socket) => {

   socket.emit('retrieve_names', user_dict,users);
   users.push(socket.id)
   

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
      users.splice(users.indexOf(socket.id) ,1);
      if(user_dict[socket.id]){
         setted_name -=1;
         delete puntaje[user_dict[socket.id]];
         delete user_dict[socket.id];
      }
      io.emit('back_to_menu');
      io.emit('retrieve_names', user_dict,users);
   });

   socket.on('set_name', function(name){
      user_dict[socket.id] = name;
      puntaje[name] = '';
      setted_name +=1;
      io.emit('add_player', name,setted_name);
      console.log(name, 'connected!!');

      if(socket.id == users[0]){ //PARA HACER ADMIN
         io.to(socket.id).emit('set_admin');
         console.log(socket.id, 'is admin')
      }
   });
   socket.on('start_game', function () { 
      console.log(setted_name +' is setted name');
      if(setted_name >=4){  
         arr_shuffled = shuffle(cards_by_players[users.length-4]); //menos 4 porque tiene 3 elementos en vez de 6
         for(var i =0; i<users.length;i++){
            for(var j=0; j<4;j++){
               decks[i][j] = arr_shuffled[i*4 + j];
            }
            io.to(users[i]).emit('update_deck', decks[i]);
         }
      }
   });

   socket.on('l1b', function () { 
      signo = -1;
      io.emit('l1');
   });
   socket.on('l2b', function () { 
      signo = -1;
      io.emit('l2');
   });
   socket.on('l3b', function () {
      signo = -1; 
      io.emit('l3');
   });
   socket.on('r1b', function () {
      signo = 1; 
      io.emit('r1');
   });
   socket.on('r2b', function () {
      signo = 1; 
      io.emit('r2');
   });
   socket.on('r3b', function () {
      signo = 1; 
      io.emit('r3');
   });

   socket.on('upload_selection',function (selected_deck) {  //aca
      n_uploaded +=1;
      temp_deck[users.indexOf(socket.id)] = selected_deck;
      if(n_uploaded == users.length){
            console.log('impresion de decks en server antes');
            for(let i =0; i<users.length;i++){
               console.log(decks[i][0],decks[i][1],decks[i][2],decks[i][3]);
            }
            console.log('impresion de temp_decks antes');
            for(var i =0; i<users.length;i++){
               console.log(temp_deck[i][0],temp_deck[i][1],temp_deck[i][2],temp_deck[i][3]);
            }

            update_decks();
            n_uploaded = 0;
      }
   });

   socket.on('chancho',function () {  
      lista_chancho.push(socket.id);

      if(lista_chancho.length == 1){
         io.emit('poder_chanchear');
      }
      socket.emit('chancho_input_aceptado');

      if(lista_chancho.length == users.length){

         if(puntaje[user_dict[lista_chancho.at(-1)]] == ''){
            puntaje[user_dict[lista_chancho.at(-1)]] += 'chan';
         }
         else if(puntaje[user_dict[lista_chancho.at(-1)]] == 'chan'){
            puntaje[user_dict[lista_chancho.at(-1)]] += 'chi';
         }
         else if(puntaje[user_dict[lista_chancho.at(-1)]] ==  'chanchi'){
            puntaje[user_dict[lista_chancho.at(-1)]] += 'to';
         }
         io.emit('resultado_chancho', user_dict[lista_chancho.at(-1)], puntaje, user_dict,users);
         if(puntaje[user_dict[lista_chancho.at(-1)]] ==  'chanchito'){ //check if smbody lost or start new round
            io.to(users[0]).emit('finalizar_client'); //maybe adding delay here
            }
         else{
            io.to(users[0]).emit('nueva ronda_client');
         }
         lista_chancho = [];
      }

   });

   socket.on('finalizar', function () {
         io.emit('back_to_menu');
   });

});


function update_decks(){
   for(let i =0; i<users.length;i++){
      var aux =-1;

      for(let j=0; j<4;j++){

         if(decks[i][j] == temp_deck[i][j]){
            
            do{
               aux += 1;
               if(temp_deck[( (i+(1*signo)) % users.length + users.length) % users.length][aux] != 0){
                  decks[i][j] = temp_deck[( (i+(1*signo)) % users.length + users.length) % users.length][aux];
                  console.log('replaced value');
               }
            }while(temp_deck[((i+(1*signo)) % users.length + users.length) % users.length][aux] == 0);
         }
      }
   }
   aux = -1;
   send_decks();
}

function send_decks(){
   console.log('starting to send new decks');
   for(let i =0; i<users.length;i++){
      io.to(users[i]).emit('update_deck', decks[i]);
   }

   //opcional
   console.log('impresion de decks en server dsp');
   for(let i =0; i<users.length;i++){
      console.log(decks[i][0],decks[i][1],decks[i][2],decks[i][3]);
   }
}

// arr[(i % n + n) % n]
// socket.on('', function () {   });
//i % users.length + users.length) % users.length
 //delete dict[x]