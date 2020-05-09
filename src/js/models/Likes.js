export default class Likes {

    constructor(){
        this.likes=[];
    }

    addLike(id, title, author, image){
        let like = {id, title, author, image};
        this.likes.push(like);
        
        //persist data in localstorage
        this.persistData();
        
        return like;
    }

    deleteLike(id){
        let index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index, 1);

        //persist data in localstorage
        this.persistData();
    }

    isLiked(id){
        return (this.likes.findIndex(el => el.id === id) !== -1);
    }

    getNumLikes(){
        return this.likes.length;
    }

    persistData(){
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        let storage =JSON.parse(localStorage.getItem('likes'));
        //restoring likes from the localstorage
        if(storage) this.likes = storage;

    }

}