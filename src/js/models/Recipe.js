import axios from 'axios';

export default class Recipe {
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try{
            let res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            //console.log(res);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.image =res.data.recipe.image_url;
            this.ingredients = res.data.recipe.ingredients;
            this.url = res.data.recipe.source_url;
        }
        catch(error){
            alert('something went wrong in searching recipe');
        }
    }

    calcTime(){
        //assuming that we need 15 min for 3 ingredients
        let numIng = this.ingredients.length;
        let periods = Math.ceil(numIng/3);
        this.time = periods *15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIndgredients(){
        let unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        let unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        let units = [...unitShort, 'kg', 'g']; //destrcturing so we don't need to write every array elements from begining
        
        let newIngredients = this.ingredients.map(el => {
            //1. uniform all units
            let ingredients = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredients = ingredients.replace(unit, unitShort[i]);
            });

            //2. remove parentheses
            ingredients = ingredients.replace(/ *\([^)]*\) */g, ' ');

            //3. parse indgredients into count, unit and indgredient
            let arrIng = ingredients.split(' ');
            let unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if(unitIndex > -1){
                //there is a unit               
                //ex = 4 1/2 cup of rice this will retun [4, 1/2] only
                let arrcCount = arrIng.slice(0, unitIndex); 
                let count;
                // 2nd ex "4 cups" just one number of unit
                if(arrcCount.length === 1){
                    count = eval(arrIng[0].replace('-', '+'));
                }
                else {
                    //here ex eval("4+1/2") will turn out 4.5...  here in eval we cal calculate even the elements are string
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng ={
                    count,
                    unit: arrIng[unitIndex],
                    ingredients: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if(parseInt(arrIng[0], 10)) {
                //there is no unit, but first element is a number (1 white enrich bread)
                objIng ={
                    count: parseInt(arrIng[0], 10),
                    unit: '',                               // 1 bread ex ====count =1, unit='', indgredients ='1 white enrich bread'
                    ingredients: arrIng.slice(1).join(' ')
                }
            }
            else if (unitIndex === -1){
                //there is no unit and no number in 1st position
                objIng = {
                    count: 1,
                    unit: '',        //count = 1, unit='', indgredients =  tomato sauce
                    ingredients     //here only indgredients means it will work similar to indgredients: indgredients
                }
            }

        return objIng;

        });
        this.ingredients = newIngredients;
        //console.log(newIngredients);
    }

    //type inc or dec 
    updateServings (type) {
        //servings
        let newServings = type === 'dec'? this.servings -1: this.servings +1;
        
        //indgredients
        this.ingredients.forEach(ing => {
            ing.count = ing.count * (newServings /this.servings);
        })

        this.servings = newServings;

    }

}



