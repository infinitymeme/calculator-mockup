function dragElement(windowclass) {
    let elmnt = document.querySelector(windowclass);
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let header = document.querySelector(windowclass + " .widget-header");
    if (header) {
      header.addEventListener("mousedown", dragMouseDown);
    } else {
        throw new Error("Cannot find header element for "+windowclass);
    }
  
    function dragMouseDown(e) {
        if (e.target.classList.contains("widget-header")) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.body.classList.add('dragging');
            document.addEventListener("mouseup", closeDragElement);
            document.addEventListener("mousemove", elementDrag);
            
        }
    }
  
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.body.classList.remove('dragging');
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag)
    }
}
dragElement(".calculator-widget");

//object representing a calculator
class CalculatorApp {
    constructor(windowclass) {
        this.widgetNode = undefined;
        this.outputNode = undefined;
        this.applyDefaults();

        this.widgetNode = document.querySelector(windowclass);
        this.outputNode = document.querySelector(`${windowclass} .calc-output`);
        
        //bind event listeners. .bind(this) makes this.method() work inside of event.
        document.querySelectorAll(`${windowclass} .operators .cell`).forEach(el => {
            el.addEventListener("click", this.pressOperation.bind(this))
        });
        document.querySelector(`${windowclass} .cmd-clear`).addEventListener("click", this.pressClear.bind(this));
        document.querySelector(`${windowclass} .cmd-plusminus`).addEventListener("click", this.pressPlusMinus.bind(this));
        document.querySelector(`${windowclass} .cmd-percent`).addEventListener("click", this.pressPercent.bind(this));
        document.querySelectorAll(`${windowclass} .main-buttons .cell-row:not(.commands) .cell`).forEach(el => {
            el.addEventListener("click", this.pressNumber.bind(this))
        });
        //keypress doesn't accept backspace are you kidding me
        this.widgetNode.addEventListener("keydown", this.keyboardPress.bind(this))
        this.updateOutput();
    }

    //clears instance variables
    applyDefaults() {
        this.numberOne = "0";
        this.numberOneFloat = "";
        this.floatInput = false;

        this.operation = "";
        this.symbol = "";

        this.numberTwo = "";
        this.numberTwoFloat = "";
        
        this.clearOnNextNumber = false;
    }

    //updates output screen with instance variables
    updateOutput() {
        this.outputNode.innerHTML = `
        <span>${this.numberTwo}</span>
        <span>${this.numberTwoFloat != "" ? "." : ""}</span>
        <span>${this.numberTwoFloat}</span>
        <span class="extra-space">${this.symbol}</span>
        <span>${this.numberOne}</span>
        <span>${this.floatInput ? "." : ""}</span>
        <span>${this.numberOneFloat}</span>
        `
    }

    //clear button
    pressClear() {
        this.applyDefaults();
        this.updateOutput();
    }

    //plusminus button
    pressPlusMinus() {
        if (this.numberOne == "0") {
            this.numberOne = "-"+this.numberOne;
        } else {
            this.numberOne = String(this.numberOne * -1);
        }
        this.updateOutput();
    }
    
    //percent button; shifts two digits from main to float variable, padding main with another zero if it empties it
    pressPercent() {
        if (this.numberOne+this.numberOneFloat == "0") return;
        this.numberOne = this.numberOne.split("");
        this.numberOneFloat = this.numberOneFloat.split("");
        for (let i = 0; i < 2; i++) {
            this.numberOneFloat.unshift(this.numberOne.pop());
            if ((this.numberOne.length === 0)||(this.numberOne[0] === "-")) {
                this.numberOne.push("0");
            }
        }
        this.numberOne = this.numberOne.join("");
        this.numberOneFloat = this.numberOneFloat.join("");
        this.floatInput = this.numberOneFloat.length > 0 ? true : false;
        this.updateOutput();
    }

    //press an operation button, chooses operation based on the class of the button
    pressOperation(event) {
        this.inputRecieved();
        let classes = [...event.target.classList];
        if ((classes.indexOf('op-equals') >= 0)&&(this.numberOne !== "")&&(this.numberTwo !== "")) {
            //valid equal sign press
            this.evaluateEquation();
            return;
        } else {
            //operator class name to [js operation symbol, ui symbol]
            const classToOp = {
                "op-divide":["/","÷"],
                "op-multiply":["*","×"],
                "op-subtract":["-","−"],
                "op-add":["+","+"]
            }
            let keys = Object.keys(classToOp);
            for (let i = 0; i < keys.length; i++) {
                if (classes.indexOf(keys[i]) >= 0) {
                    //chain equation e.g. 5*5*5*5*5....
                    if (this.operation != "") {
                        if ((this.numberOne != "")&&(this.numberTwo != "")) {
                            this.evaluateEquation();
                            this.clearOnNextNumber = false;
                        } else {
                            //eval operaiton and symbol from class name
                            this.operation = classToOp[keys[i]][0];
                            this.symbol = classToOp[keys[i]][1];
                            this.updateOutput();
                            return;
                        }
                    }
                    //eval operaiton and symbol from class name
                    this.operation = classToOp[keys[i]][0];
                    this.symbol = classToOp[keys[i]][1];

                    //move numberOne
                    this.numberTwo = this.numberOne;
                    this.numberTwoFloat = this.numberOneFloat;
                    
                    //clear numberOne
                    this.numberOne = "";
                    this.numberOneFloat = "";
                    this.floatInput = false;
                    break;
                }
            }
        }
        this.updateOutput();
    }

    pressNumber(event) {
        this.inputRecieved(true);
        if (this.floatInput) {
            if (event.target.innerText === ".") {
                this.floatInput = false;
                this.numberOne = String(parseInt(this.numberOne + String(this.numberOneFloat)));
                this.numberOneFloat = "";
            } else {
                this.numberOneFloat = this.numberOneFloat + event.target.innerText;
            }
        } else {
            if (event.target.innerText === ".") {
                if (this.numberOne === "") {
                    this.numberOne = "0";
                }
                this.floatInput = true;
            }
            this.numberOne = String(parseInt(this.numberOne + event.target.innerText));
        }
        
        this.updateOutput();
    }

    //clears the field (if desired) when input is recieved
    inputRecieved(clear=false) {
        if ((clear)&&(this.clearOnNextNumber)) {
            this.numberOne = "";
            this.operation = "";
            this.symbol = "";
            this.numberTwo = "";
            this.floatInput = false;
            this.numberOneFloat = "";
        }
        this.clearOnNextNumber = false;
    }

    keyboardPress(event) {
        //this is going to be very hacky and ugly.
        //not only am I going to use an if chain,
        //I'm going to pass in objects to functions set up to look like event objects
        //so, for example, event.target.innerText will read the same as if it were an actual button event
        //I'm sorry
        if ((event.keyCode === 56)&&(event.shiftKey)) { // *
            this.pressOperation({target:{classList:["op-multiply"]}});
        } else if (event.keyCode === 191) { // /
            this.pressOperation({target:{classList:["op-divide"]}});
        } else if ((event.keyCode === 187)&&(event.shiftKey)) { // +
            this.pressOperation({target:{classList:["op-add"]}});
        } else if (event.keyCode === 189) { // -
            this.pressOperation({target:{classList:["op-subtract"]}});
        } else if ((event.keyCode === 53)&&(event.shiftKey)) { //%
            this.pressPercent();
        } else if ((event.keyCode >= 48)&&(event.keyCode <= 57)) { // 0-9
            this.pressNumber({target:{innerText:event.keyCode-48}})
        } else if ((event.keyCode === 8)||(event.keyCode === 46)) { //backspace, delete
            this.pressClear();
        } else if (event.keyCode === 13) { //enter
            this.evaluateEquation();
        } else if (event.keyCode === 190) { //.
            this.pressNumber({target:{innerText:"."}});
        }
    }

    evaluateEquation() {
        //EQUALS SIGN
        //there's a lot of complicated stuff to do integer operations with floats, but it's worth it

        //diffOne and diffTwo are for padding zeroes
        let diffOne = this.numberTwoFloat.length-this.numberOneFloat.length;
        let diffTwo = this.numberOneFloat.length-this.numberTwoFloat.length;
        let evalstr = "(";

        //pad zeroes and eval as int
        evalstr += "("+ parseInt(this.numberTwo+this.numberTwoFloat + ("0".repeat(diffTwo > 0 ? diffTwo : 0))) +")";

        evalstr += this.operation;

        //pad zeroes and eval as int
        evalstr += "("+ parseInt(this.numberOne+this.numberOneFloat + ("0".repeat(diffOne > 0 ? diffOne : 0))) +")";

        //division by the amount of decimal places is included at the end to reduce the decimal places back to normal
        evalstr += ")/";
        
        //remove less zeroes for +- more for */
        if (["+","-"].indexOf(this.operation) >= 0) {
            evalstr += 10**Math.max(this.numberOneFloat.length,this.numberTwoFloat.length);
        } else {
            evalstr += (10**Math.max(this.numberOneFloat.length,this.numberTwoFloat.length)) ** 2;
        }
        console.log(evalstr);
        
        //evaluate and set to fixed 8 decimal places
        //uses eval... security issue? idk
        evalstr = String(parseFloat(eval(evalstr).toFixed(8)));
        console.log(evalstr);
        if (evalstr.indexOf(".") >= 0) {
            this.floatInput = true;
            evalstr = evalstr.split(".");
            this.numberOne = evalstr[0];
            this.numberOneFloat = evalstr[1];
        } else {
            this.numberOne = evalstr;
            this.floatInput = false;
            this.numberOneFloat = "";
        }
        this.operation = "";
        this.symbol = "";

        this.numberTwo = "";
        this.numberTwoFloat = "";

        this.clearOnNextNumber = true;

        this.updateOutput();
    }
}
var myCalculator = new CalculatorApp(".calculator-widget");