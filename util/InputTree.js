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

    setEpsilonX : function (value) {
        this.epsilonX = value
    },

    setEpsilonY : function (value) {
        this.epsilonY = value
    }

}

function Tree() {//she is a tree, yeah
    this.nodes = []
}

Tree.prototype = {


    addNode: function (value, parent, level, index) {//index is optional
        this.nodes[level] = this.nodes[level]?this.nodes[level]:[];
        let seq  = index?index : this.nodes.length;
        let node = new Node(value, level, seq, parent)
        let parentNode = parent? this.getNodeByLS(parent.level, parent.seq) : null
        if(parentNode){
            parentNode.addChild(node)
        }
        index?this.nodes[level].push(node):this.nodes[level].splice(1, index, node);
    },



    getNodeByLS : function (l, s) {
        return this.nodes[l][s]
    },
    getNodesInLevel: function (i) {
        return this.nodes[i]
    },
    /*A transverse function to go thru everything*/
    tranverse: function () {
        console.log(JSON.stringify(this.nodes))

    },
    depth : function () {
        return this.nodes.length
    },

    addLevel: function (levelIdx) {
        if(!levelIdx){
            this.nodes.push([])
        return this.depth()-1
        }
        this.nodes.splice(levelIdx, 0, [])
    }



}

function Node(value, level, seq, parent, children) {//I am a node, yeah
    this.parent = parent
    this.value = value
    this.level = level
    this.seq = seq
    this.children = children?children:[];
}

Node.prototype = {
    addChild: function (child) {
        this.children.push(child)
    },

    setParent :function (parent) {
        this.parent = parent
    },

    setId : function (id) {
        this.id = id
    },

    setSeq: function (seq) {
      this.seq = seq
    },
    getId: function () {
        return this.id
    }
}


function InputSorter2D(options) {
    this.tree = new Tree();
    this.mergeOpts(options)
    //add fake top
    this.tree.addNode(null, null, 0 )
}

    InputSorter2D.prototype = {
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


            for (let idxL = 1; idxL < tree.depth(); idxL++) {
                //check y for level
                let level = tree.getNodesInLevel(idxL)
                let levelHead = level[0]

                let compareLevel  = newInput.compareY(levelHead)

                if(compareLevel === 0){
                    //check x for sequence in level
                    //check x for parent belonging
                    for(let idxS = 0; idxS < level.length;idxS++){
                        compareSeq = newInput.compareX();
                        if(compareSeq > 0){//whow, he is larger than me! should take my place!
                            tree.addNode(newInput, parent, idxL, idxS)
                            return
                        }
                    }
                    tree.addNode(newInput, parent, idxL)//add to the last if no return at this
                    return
                }
                    else if(compareLevel > 0){//This is
                    tree.addLevel(idxL);
                    tree.addNode(newInput, parent, idxL)
                    return
                }

            }
            let curidxL  = tree.addLevel();
            tree.addNode(newInput, parent, curidxL)
    },
        print: function () {
            this.tree.tranverse()
        },




}



let sorter = new InputSorter2D()

sorter.add(1,10, 10);
sorter.print()


