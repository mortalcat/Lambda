/**
 * To determine the newly add object
 *
 */

function Input2D(value, x, y, epsilonX, epsilonY){
    this.value = value;
    this.x = x;
    this.y = y;
    this.epsilonX = epsilonX?epsilonX:0.5;
    this.epsilonY = epsilonY?epsilonY:0.5;

}

Input2D.prototype = {
    compare: function (attriName, anoInput, epsilon) {
        if(!anoInput[attriName]){
            throw new ReferenceError("Input2D does not have attribute named "+attriName);
        }
        let delta = this[attriName] - anoInput[attriName]
        return Math.abs(delta) < epsilon?0:delta;
    },

    compareY: function (anoInput) {
     return this.compare('y', anoInput, this.epsilonY)
    },
    compareX: function (anoInput) {
        return this.compare('x', anoInput, this.epsilonX)
    },

    nearest : function (inputLists) {

        let distances = inputLists.map(input=>this.compareX(input))
        let min = Math.min(...distances)
        return inputLists[distances.indexOf(min)]

    }



}


var Node = {
    init : function (value, parent, children) {
        this.value = value;
        this.parent = parent || null;
        this.children = children || []
    },

    setParent: function (parent) {
        this.parent = parent
    },

    addChild : function (child) {
        this.children.push(child)
        child.parent = this
    },
    addChildAtIndex: function(child, index){
        if (index > this.children.length){
            return;
        }
        this.children.splice(index, child)
    },


    hasChildren : function () {
        return this.children.length !== 0
    },
    getIndex : function () {
        if(!this.parent){
            return null
        }
        return this.parent.children.indexOf(this)
    },

    print : function () {
        console.log("["+this.value+"]")
    }
}




var Tree = {
    init: function (value) {
        this.root = Object.create(Node);
        this.root.init(value);
    },

    insert: function (newNode, old) {
        let parent = old.parent;
        newNode = newNode instanceof Node ? newNode : this.createNode(newNode)
        old.setParent(newNode);
        newNode.setParent(parent)
        newNode.addChild(old)
    },


    createNode: function (value) {
        let newNode = Object.create(Node)
        newNode.init(value)
        return newNode
    },

    print: function () {
        let node = this.root;


    }
}


var  InputSorter2D =  {

    init: function (options) {
        this.mergeOpts(options)
        //add fake top
        this.tree = Object.create(Tree);
        let rootValue = this.createInput2D(null, 0, 0)
        this.tree.init(null);
        this.root = tree.parse({id:1, value:rootValue})
    },

    createInput2D : function (value, x, y) {
        return new Input2D(value, x, y, this.opts.epsilonX, this.opts.epsilonY);
    },

    mergeOpts: function (opts) {
        this.defaultOpt = {
            epsilonX: 0.5,
            epsilonY: 0.5
        };
        this.opts = Object.assign({},this.defaultOpt, opts);
    },

    add: function (value, x, y) {
        let tree = this.tree;
        let newInput = new Input2D(value, x, y, this.opts.epsilonX, this.opts.epsilonY);
        let root = this.root;
        this.compareRecur(root)
    },

    compareRecur : function (node, newInput) {
        let yLevel = newInput.compareY(node.value);


        if(yLevel > 0){//i AM YOUR FATHER
            this.tree.insert(newInput, node)
            return;
        } else if(yLevel === 0){//I AM your sibling
           //compare x, then add me
         for(let child of node.parent.children){
             let xLevel = newInput.compareX(child.value)
                 if (xLevel <=0){
                    node.parent.addChildAtIndex(this.tree.createNode(newInput), child.getIndex())
                    return
                 }
         }
         node.parent.addChild(this.tree.createNode(newInput))
         return;
        } else {//I am your descendent
            let nearest = newInput.nearest(node.parent.children);
            this.compareRecur(nearest)
        }


    },

    print: function () {
        this.tree.tranverse()
    },



}



