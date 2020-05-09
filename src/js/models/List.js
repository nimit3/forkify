import uniqid from 'uniqid';

export default class List {
    constructor(){
        this.items = [];
    }

    addItem(count, unit, ingredient){
        let item ={
            id: uniqid(),
            count,           //count : count, ES 6 version
            unit,
            ingredient
        }
    this.items.push(item); 
    //console.log(this.items)
    return item;

    }

    deleteItem(id){
        //[1,4,8] = splice(1,1) => return 4 AND mutate the orignal array as [1,8]
        //[1,4,8] = slice(1,1) => return 4 AND  don't mutate the orignal array so we will get [1,4,8]
        let index = this.items.findIndex(el => el.id === id);
        //console.log(index)
        this.items.splice(index, 1);
    }

    updateCount(id, newCount){
        this.items.find(el => el.id === id).count = newCount;
    }

}
