function Lambda() {
    function* alphabetVName() {
        index = 97;
        while (index < 123) {
            yield  String.fromCharCode(index);
            index++;
        }
    }

    function λ(exp) {
        this.vname = alphabetVName();
        this.spset = ['\(','\)','.','\u03BB'];
        //return simplified
        //every lamda expression should be a
        this.names = [];//has name, then it is a lamda expression
        this.expressions = [];
        this.raw =  exp;
        console.log("construct lambda exp: "+this.raw)
        //a factor could be a lambda or variable or
    }
//A lambda expression consists of other lamda expressions
    λ.prototype = {

        reduce:function () {
            if(typeof this.raw === 'string'){
                this.raw = this.tocharArr(this.raw)
            }

            factors = this.factorize(this.raw);
            //what if the first is a stump?


            console.log("Factors:")
            console.log(factors.map((arr)=>arr.join('')))
            let first = factors.splice(0,1)[0]

            let {names, expressions} = this.itemize(first)
            this.names = names;
            this.expressions = expressions;
            this.factors = factors
            console.log("!!!!deconstruct first factor:")
            console.log("names: ")
            console.log(names)
            console.log("expressions")
            console.log(expressions)
            console.log("Remaining Factors:")
            console.log(factors.map((arr) => arr.join('')))


            if(factors.length < 1){//=>we had one expression, it might be lamda!
                console.log("only one remaining factor: ")
                if( this.hasLamdaChars(this.expressions)){
                    console.log("sub expression contains lamda")
                    this.expressions =new λ(this.expressions).reduce();
                    console.log("new expressions: ")
                    console.log(this.expressions)

                }
                console.log("current expressions: ")
                console.log(this.expressions)

                console.log("Final result:")
                console.log(this.toString())
                return this.tocharArr(this.toString())
            } else if(!this.hasLamdaMe()) {//This expression does not contain any lamda, but we have remaining factors, ask them!

                console.log("no, current factor does not contain lamda")
                if( this.hasLamdaChars(this.curFactors())){
                    console.log("but following factor has")
                    this.expressions.push('\(')

                    this.expressions = this.expressions.concat(new λ(this.curFactors()).reduce())
                    this.expressions.push('\)')
                    console.log("new expressions: ")
                    this.factors = []
                    console.log(this.expressions)

                }
                console.log("cur expressions")
                console.log(this.expressions)

                console.log("Final result:")
                console.log(this.toString())
                return this.tocharArr(this.toString())

            }

            this.raw = this.substitute(names, expressions, factors);
            console.log("new exp: ")
            console.log(this.raw)
            return this.reduce()
        },

        toString : function () {
            return (this.names.length>0?this.lamdaNamize(this.names)+'.':'')+ this.charArrtoStr(this.expressions) + (this.factors?this.factors.map((arr) => arr.join('')).join(''):'');
        },

        curFactors: function () {
            let result = [] ;
            this.factors.forEach((exp)=>{
                result = result.concat(this.tocharArr(exp))
            })
            return result
        },

        hasLamdaMe:function () {
            //return chars.includes('\u03BB');
            return this.names && this.names.length > 0;
        },

        hasLamdaChars: function(chars){
            return chars.includes('\u03BB');

        },


        charArrtoStr : function (chars) {
            return chars.join('');
        },

        getVname : function (curNames) {
            let next  = this.vname.next();

            console.log(curNames)
            curNames = curNames || [];
            if(!(next in curNames) && !next.done){
                next  = this.vname.next();
            }
            return next.done?null: next.value;
        },



        lamdaNamize: function (namelist) {
            return this.lambdaWrap(namelist.join(''));
        },
        lambdaWrap: function (exp) {
            return '\u03BB'+ exp;
        },

        substitute: function (names, expressions, factors) {

            let tempDict = {}//TODO, put dict here to be overcautious

            //alpha-conversion: pre-check for duplicate of name in factors
            for(let factor of factors) {
                for(let char of factor) {

                    if (!this.spset.includes(char) && expressions.includes(char)) {
                        console.log("searching for exp: ")
                        console.log(char)
                        let replace = this.getVname(names)
                        factor[factor.indexOf(char)] = tempDict[char] ? tempDict[char] : replace;
                        tempDict[char] = replace;
                        console.log("new factor:")
                        console.log(factor.join(''))
                        console.log("dict:")
                        console.log(tempDict)

                    }
                }
            }
            console.log(expressions.join(''))
            //beta-reduction
            //for everything in name, subsitute it with factor, in expression
            let insertIdxs = []
            let substituteNum, remainNames, remainFactors
            if(names.length > factors.length){
                substituteNum = factors.length;
                remainNames = names.splice(substituteNum);
            } else{
                substituteNum = names.length
                remainFactors = factors.splice(substituteNum);

            }

            for(let idxF = 0; idxF < substituteNum; idxF++){
                for(let idxC = 0;idxC < expressions.length;idxC++){
                    if(expressions[idxC] === names[idxF]){//note down this idx
                        insertIdxs.push([idxC, idxF])
                    }
                }
            }

            insertIdxs = insertIdxs.sort((a,b)=>(b[0]- a[0]));
            for(let i = 0; i < insertIdxs.length; i++){
                expressions.splice(insertIdxs[i][0], 1, ...factors[insertIdxs[i][1]]);
            }
            console.log("remain names")
            console.log(remainNames)
            console.log("remain factors:")
            console.log(remainFactors)
            console.log("result: ")
            console.log((remainNames?this.lambdaWrap(remainNames.join(''))+'.':'')+expressions.join(''))
            return (remainNames?this.lambdaWrap(remainNames.join(''))+'.':'')+expressions.join('')+(remainFactors?this.charArrtoStr(remainFactors):'');
        },

        tocharArr : function (expStr) {
            return [...expStr]
        },


        //breaks expression into factors
        factorize: function (charsori) {
            //\u03BB
            let chars = charsori.slice();
            let parenCounter = 0;
            let splitIdxs = []
            for (let i=0; i <chars.length; i++){
                let char = chars[i]
                if(char == '\('){
                    parenCounter++;
                }
                else if(char == '\)'){
                    parenCounter--;
                } else if(char === '.' && parenCounter ===0){//This is one expression
                    return [chars];
                }
                if(parenCounter === 0){
                    splitIdxs.push(i)
                }
            }

            factors = this.splitArrAtIndexs(splitIdxs, chars)
            return factors.reverse()
        },
        //break factors into parts: gamma part and exp part
        itemize :function (factor) {
            let names = []
            let expressions = []
            if(!factor){
                return null;
            }

            if(!factor.includes('.')){//it is a expression and nothing more
                //TODO

                return {names, expressions:factor};
            }
            factor = this.stripOfParenthese(factor)
            let splitIdxs = []
            for(let i  = 0, parenCounter = 0; i < factor.length; i++){
                let char = factor[i];
                if(char === '\('){
                    splitIdxs.push(i - 1)
                    parenCounter++;
                }
                else if(char === '\)'){
                    splitIdxs.push(i)
                    parenCounter--;
                } else if(parenCounter===0 && char==='.'){
                    splitIdxs.push(i)
                }
            }

            let subExps = this.splitArrAtIndexs(splitIdxs, factor)

            // console.log(" subexps:")
            // console.log(subExps.map((arr)=>arr.join('')))
            for(let subexp of subExps.reverse()){
                if(subexp[0] === '\u03BB'){
                    subexp.splice(0,1);
                    subexp = subexp.filter((char)=>char!=='.')
                    names.push(...subexp)
                }else{
                    expressions.push(...subexp)
                }
            }

            return {names, expressions};
        },
        stripOfParenthese: function (charArr) {

            // if(typeof  charArr ==="string"){
            //     return charArr.replace(/^\(/, '').replace(/\)$/, '')
            // }
            if(charArr[charArr.length -1] === '\)' && charArr[0] === '\('){
                charArr.splice(charArr.length -1, 1);
                charArr.splice(0, 1);

            }

            return charArr
        },
        splitArrAtIndexs: function (idxsArr, oriArr) {
            let resultArr = [];

            idxsArr.push( oriArr.length - 1)
            idxsArr.push(-1)
            idxsArr.sort((a,b)=> b-a);

            for(let i = 0; i < idxsArr.length -1 ; i++){
                let start  =idxsArr[i+1] + 1, num = idxsArr[i] - idxsArr[i+1]
                if(num > 0) {
                    let temp = oriArr.splice(start, num);
                    resultArr.push(temp)
                }
            }
            //resultArr.push(oriArr)
            return resultArr
        }
    }

    return λ;
}
