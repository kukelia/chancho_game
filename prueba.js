var users = [1,2,3,4];
var decks= [
    [1,4,1,3], //player 1
    [3,2,2,4], //player 2
    [3,4,4,2], //player 3
    [1,3,1,3], //player 4
    [0,0,0,0], //player 5
    [0,0,0,0]  //player 6
 ]
 var temp_deck=[
    [0,4,0,0], //player 1
    [0,2,0,0], //player 2
    [0,4,0,0], //player 3
    [0,3,0,0], //player 4
    [0,0,0,0], //player 5
    [0,0,0,0]  //player 6
 ]
console.log('decks before')
for(var i =0; i<users.length;i++){
    console.log(decks[i][0],decks[i][1],decks[i][2],decks[i][3])
}
update_decks();
function update_decks(){
    for(var i =0; i<users.length;i++){
       var aux =-1;
 
       for(var j=0; j<4;j++){
 
          if(decks[i][j] == temp_deck[i][j]){
             decks[i][j] == 0;
             do{
                aux += 1;
                if(temp_deck[(i-1 % users.length + users.length) % users.length][aux] != 0){
                   console.log('value a:', temp_deck[(i-1 % users.length + users.length) % users.length][aux]);
                   console.log('value b:', decks[i][j]);
                   decks[i][j] = temp_deck[(i-1 % users.length + users.length) % users.length][aux];
                   console.log('replaced value');
                   
                }
             }while(temp_deck[(i % users.length + users.length) % users.length][aux] == 0);
          }
       }
    }
}

console.log('decks after')
for(var i =0; i<users.length;i++){
    console.log(decks[i][0],decks[i][1],decks[i][2],decks[i][3])
}
