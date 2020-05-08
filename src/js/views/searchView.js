import { elements } from './base';

export const getInput = () => elements.searchInput.value; 

export const clearInput = () =>{
    elements.searchInput.value='';
};
//for clearing previous search result
export const clearResults =() =>{
    elements.searchResultList.innerHTML ="";
    elements.searchResPages.innerHTML=""; //for removing the navigation button

};

export let highlightSelected = id => {
    //for removing previous highlighted recipe when we click on the new one
    let resultArr = Array.from(document.querySelectorAll('.results__link'));
    resultArr.forEach(el => {
        el.classList.remove('results__link--active');
    });

    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
    //document.querySelector(`.likes__link[href="#${id}"]`).classList.add('likes__link--active');
}

//  6          11        16    20 
//['tomato', 'pasta', 'with', 'blue', 'cheese', 'and', 'basil']
export let limitRecipeTitle = (title, limit=17) => {
    let newTitle=[];
    if(title.length > limit){
       let arr= title.split(" ");
       arr.reduce((acc , cur) => {
          if(acc + cur.length <= limit){
            newTitle.push(cur);
          }
          return acc + cur.length;
       }, 0);
       return `${newTitle.join(' ')} ...`;
    }
    return title;
}

const renderRecipes = (recipe) => {
    const markup = ` 
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
}
//data-* HTML 5 property //type: 'prev' or 'next'
const createButton = (page, type) => `
        <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1: page + 1 }>
            <span>Page ${type === 'prev' ? page - 1: page + 1 }</span>
            <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === 'prev'? 'left' : 'right'}"></use>
            </svg>
        </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage); //30/10=3 pages 33/10 = 3.3 ceil = 4 page(last 3 will be diplayed too)
    let button;
        if(page === 1 && pages > 1){
            //Only btn to go to next page
            button = createButton(page , 'next');
        }
        else if (page < pages){
            //btn to go to next and previous page
            button = `
                ${createButton(page,'prev')}
                ${createButton(page,'next')}
            `;
        }
        else if(page === pages  && pages > 1){
            //only btn to go to previous page
            button = createButton(page , 'prev');
        }
    elements.searchResPages.insertAdjacentHTML('beforeend', button);
};


export const renderResults = (recipes, page = 1, resPerPage = 10) =>{
    // render results of curent page
    let start = (page - 1) * resPerPage;
    let end = page * resPerPage;
    
    recipes.slice(start , end).forEach(renderRecipes); //becauuse of for each  every current elements will automatically pass in renderecipes function
    
    //render page navigation button
    renderButtons(page, recipes.length, resPerPage);
};
