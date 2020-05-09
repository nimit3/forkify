// Global app controller
import Search from './models/Search';
import {elements, renderLoader, clearLoader} from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as likesView from './views/likesView';

/*  GLOBAL STATE OF THE APP
--- SEARCH OBJECT
--- CURRENT RECIPE OBJECT
--- SHOPPING LIST OBJECT
--- LIKED RECIPES
*/
const state = {};

//-----------------------------------------SEARCH CONTROLLER------------------------------------
const controlSearch = async () => {
        //1) get the query from view
        const query = searchView.getInput(); //TODO hardcoding at the momment
        if(query){
        //2) new search object and add to the state
        state.search = new Search(query);

        //3) Prepare UI for showing the results, showing the loading spinner, cleaning the old result
        searchView.clearInput(); //will clear text inpput field
        searchView.clearResults(); //for removing old result when new search results arelisted
        renderLoader(elements.searchRes);
        try{
            //4) search for recipes
            await state.search.getResults(); //that function returns a promise so that's why we need to write await and becase of that whole function needs to be async too   
            //5) give results on UI
            //console.log(state.search.result)
            searchView.renderResults(state.search.result);
            clearLoader();
        } catch(error){
            alert('Please Enter the valid recipe name');
            clearLoader();
        }

    }

}
    //search submit btn event
    elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); //this will stop preventing page getting refreshed everytime when btn is clicked
    controlSearch();
});

//data-goto navigation page event listener
elements.searchResPages.addEventListener('click', e => {
    let btn = e.target.closest('.btn-inline'); //event dedlagation and get the closest element
    if(btn){
        let goTopage = parseInt(btn.dataset.goto, 10); //for getting the data-go value from html 10 means base10
        searchView.clearResults(); 
        searchView.renderResults(state.search.result, goTopage);
    }
    
});


//--------------------------------------------RECIPE CONTROLLER-----------------------------------

let controlRecipe = async () => {
    // get the ID from URL when recipe is clicked
    let id = window.location.hash.replace('#', '');
    
    if(id){
        //1) prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        /*
        if(state.search){
        searchView.highlightSelected(id);
        }
        */
        //2) create a new recipe objects
        state.recipe = new Recipe(id);
        try{
            //3) get recipe data and parse indgredients
            await state.recipe.getRecipe();
            state.recipe.parseIndgredients();

            //4) calculate servings and time
            state.recipe.calcServings();
            state.recipe.calcTime();

            //5) render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                ); 
            listView.clearList(); //for previous clearing shopping list menu   
            //console.log(state.recipe.ingredients)
        }catch(error){
            console.log(error);
            alert('error processing recipe');
        }
  
    }
}

//adding 2 event listener at a same time --1 is "hashchange" ---2 is "load"(for controling last clicked ecipe's state)

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('hashchange', controlRecipe);
//for saving its state 
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

//------------------------------------------LIST CONTROLLER---------------------------------------------

let controlList = () =>{
    //1. create a new liste if there is none yet
    if(!state.list) state.list = new List()
    
    //2. add each ingredient to the list
    listView.clearList(); //for clearing the results everytime when addto shopping list is clicked
    state.recipe.ingredients.forEach(el => {
       let item = state.list.addItem(el.count, el.unit, el.ingredients);
       listView.renderItem(item);
    });
};

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    //1. try to retrive ID from data-id property
    let id = e.target.closest('.shopping__item').dataset.itemid;

    //2. handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);
    } 
    //handle the count update
    else if(e.target.matches('.shopping__count-value')){
        let val = parseFloat(e.target.value, 10);
        if(val > 0){
        state.list.updateCount(id, val);
        }
    }

});

//----------------------------------------LIKES CONTROLLER------------------------------------------

let controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    let currentID = state.recipe.id;

    //user has not liked current recipe yet
    if(!state.likes.isLiked(currentID)){
        //add like to the state
        let newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.image
        );
        //toggle the like button
        likesView.toggleLikeBtn(true); //because user hasn't liked recipe so true will be passed
        
        //add like to the UI list
        likesView.renderLike(newLike);
    } 
    //user has liked current recipe yet
    else {
         //remove like to the state
        state.likes.deleteLike(currentID);

        //toggle the like button
        likesView.toggleLikeBtn(false);
        
        //remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipe when page is loaded from localStorage
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    //restore likes
    state.likes.readStorage();

    //toggle like button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));

});

//------------------------ALL RECIPE SECTION EVENTS HANDLER(LIKE, + - SERVINGS, ADD_SHOPPING_LIST)-------------------
//handling recipe button clicks (matches means event delegation)
elements.recipe.addEventListener('click', (e) => {
    if(e.target.matches('.btn-decrease, .btn-decrease *' )){
        //decrease btn is clicked
        if(state.recipe.servings > 1){
        state.recipe.updateServings('dec');
        recipeView.updateServingsIndgredients(state.recipe);
        }
    }
    else if(e.target.matches('.btn-increase, .btn-increase *' )){
        //increase btnis clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIndgredients(state.recipe);
    }
    //this is for listview controller event delegation. because it's not visible in DOM from starting
    //add ingredients to shopping list
    else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }
    else if(e.target.matches('.recipe__love, .recipe__love *')){
        //call like controller
        controlLike();
    }
   
});


