//control budget
let budgetController = (function(){
    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPerc = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPerc = function (){
        return this.percentage;
    };
    let data = {
        allItems : {
            inc : [],
            exp : []
        },
        totals : {
            inc : 0,
            exp : 0                   
        },
        budget : 0,
        percentage : -1
    };
    let calcTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        });
        data.totals[type] = sum;
    };
    return {
        addItem : function(type, des, val){
            let newItem, ID;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0;
            }
            if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }else if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
            
        },
        //deleting data
        deleteItem : function(type, Id){
            let ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(Id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            };
        },
        
        claculateBudget : function(){
            //calc total inc & exp
            calcTotal('inc');
            calcTotal('exp');
            //inc - exp for budget
            data.budget = data.totals.inc - data.totals.exp;
            //calc percentege
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
        },
        calculatePercentage : function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPerc(data.totals.inc);
            });
        },
        getPercentage : function(){
            let allPerc = data.allItems.exp.map(function(curr){
                return curr.getPerc();
            });
            return allPerc;
        },
        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },
        test : function(){
            return data.allItems;
        }
    }
})();


//control the UI
let UIController = (function(){
    // 1-get the input data
    let DOMString = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeElement : '.income__list',
        expenseElement : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percLabel : '.budget__expenses--percentage',
        container : '.container',
        expensePercLabel : '.item__percentage',
        dataLabel : '.budget__title--month'
    };
    let formatNumber = function(num, type){
        let comma;
        num = Math.abs(num);
        comma = num.toLocaleString();
       return (type === 'exp'? '-' : '+') +' '+comma;
    };
    return {
        getInput : function(){
            return{
                type : document.querySelector(DOMString.inputType).value,
                description : document.querySelector(DOMString.inputDescription).value,
                value : parseFloat(document.querySelector(DOMString.inputValue).value),
                
            }
        },
        getDOMString : function(){
            return DOMString;
        },
        addItemList : function(obj,type){
            let html, newHTML, element;
            if(type === 'inc'){
                element = DOMString.incomeElement;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>';
                
            }else if(type === 'exp'){
                element = DOMString.expenseElement;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div>  </div>';
            }
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        deleteListItem : function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields : function(){
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMString.inputDescription+ ',' + DOMString.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(curr){
                curr.value = '';
                fields[0].focus();
            });

        } ,
        displayBudget : function(obj){
            let type;
            obj.budget > 0 ? type === 'inc': type === 'exp';
            document.querySelector(DOMString.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMString.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMString.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMString.percLabel).textContent = obj.percentage + '%' ;
            }else {
                document.querySelector(DOMString.percLabel).textContent = obj.percentage = '---';
            }
        },
        displayPercentage : function(percentage){
            let fields = document.querySelectorAll(DOMString.expensePercLabel);
            let nodeListforEach = function(list, callback){
                for(i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
            nodeListforEach(fields, function(current, index){
                if(percentage[index] > 0){
                    current.textContent = percentage[index] + '%';
                }else {
                     current.textContent = '---';
                }
            });
        },
        displayDate : function(){
            let now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Augest', 'September', 'November', 'December'];
            document.querySelector(DOMString.dataLabel).textContent = months[month] +' '+ year;
        }  
    }
})();

//control button
let controller = (function(budgetCtrl, UICtrl){
    let input, newItem;
    let updateBudget = function(){
        // 4.1-calculate the budget 
        budgetCtrl.claculateBudget();
        // 4.2- return budget
        let budget = budgetCtrl.getBudget();
        // 4.3-show the budget to the UI
        UICtrl.displayBudget(budget);
    };
    let updatePercentages = function(){
        //clac percentage
        budgetCtrl.calculatePercentage();
        //read from budget controller
        let percentage = budgetCtrl.getPercentage();
        //display to the UI
        UICtrl.displayPercentage(percentage);
    };
    let ctrlAddItem = function(){
        // 1-get the input data
        input = UICtrl.getInput();
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            // 2-add data to budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3-add data to UI controller
            UICtrl.addItemList(newItem, input.type);
            // 4-clear fields
            UICtrl.clearFields();
            // 5-calculte and update budget
            updateBudget();
            //update percentages
            updatePercentages();

        }
        
    };
    let ctrlDeleteItem = function(event){
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete item from data
            budgetCtrl.deleteItem(type, ID);
            //delete item from UI
            UICtrl.deleteListItem(itemID);
            //update and display the new budget
            updateBudget();
            //update percentages
            updatePercentages();
        }
    }

    let setupEventListener = function(){
        let DOM;
        DOM = UICtrl.getDOMString();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.key === "Enter") {ctrlAddItem()};
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    return {
        init : function(){
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            })
            return setupEventListener();
        }
    }
    
})(budgetController, UIController);
controller.init();
