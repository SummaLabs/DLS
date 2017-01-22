/**
 * Created by ar on 22.01.17.
 */

import {
    LW_InputLayer, LW_OutputLayer, LW_Merge, LW_Flatten, LW_Dense, LW_Activation
} from './lightweight_layers/layers_basic';

import {
    LW_Convolution1D, LW_AtrousConvolution1D,
    LW_Convolution2D, LW_AtrousConvolution2D, LW_SeparableConvolution2D,
    LW_Convolution3D,
    LW_UpSampling1D, LW_UpSampling2D, LW_UpSampling3D,
    LW_ZeroPadding1D, LW_ZeroPadding2D, LW_ZeroPadding3D,
    LW_Cropping1D, LW_Cropping2D, LW_Cropping3D
} from './lightweight_layers/layers_convolutional';


import {
    LW_MaxPooling1D, LW_AveragePooling1D,
    LW_MaxPooling2D, LW_AveragePooling2D,
    LW_MaxPooling3D, LW_AveragePooling3D,
    LW_GlobalMaxPooling1D, LW_GlobalAveragePooling1D,
    LW_GlobalMaxPooling2D, LW_GlobalAveragePooling2D,
    LW_GlobalMaxPooling3D, LW_GlobalAveragePooling3D
} from './lightweight_layers/layers_pooling';

/*
export {
    LW_InputLayer, LW_Merge, LW_Flatten, LW_Dense, LW_Activation,

    LW_Convolution1D, LW_AtrousConvolution1D,
    LW_Convolution2D, LW_AtrousConvolution2D, LW_SeparableConvolution2D,
    LW_Convolution3D,
    LW_UpSampling1D, LW_UpSampling2D, LW_UpSampling3D,
    LW_ZeroPadding1D, LW_ZeroPadding2D, LW_ZeroPadding3D,
    LW_Cropping1D, LW_Cropping2D, LW_Cropping3D,

    LW_MaxPooling1D, LW_AveragePooling1D,
    LW_MaxPooling2D, LW_AveragePooling2D,
    LW_MaxPooling3D, LW_AveragePooling3D,
    LW_GlobalMaxPooling1D, LW_GlobalAveragePooling1D,
    LW_GlobalMaxPooling2D, LW_GlobalAveragePooling2D,
    LW_GlobalMaxPooling3D, LW_GlobalAveragePooling3D
}
*/

import {topologicalSort} from './toposort';

/////////////////////////////////////////////////////////////////////
class LWLayerBuilder {
    static buildNodeByType(nodeTypeStr, cfgJson) {
        switch (nodeTypeStr) {
            case 'datainput':
                return LW_InputLayer.get_layer(cfgJson);
            case 'dataoutput':
                return LW_OutputLayer.get_layer(cfgJson);
            case 'convolution1d':
                return LW_Convolution1D.get_layer(cfgJson);
            case 'convolution2d':
                return LW_Convolution2D.get_layer(cfgJson);
            case 'convolution3d':
                return LW_Convolution3D.get_layer(cfgJson);
            case 'pooling1d':
                return LW_MaxPooling1D.get_layer(cfgJson);
            case 'pooling2d':
                return LW_MaxPooling2D.get_layer(cfgJson);
            case 'pooling3d':
                return LW_MaxPooling3D.get_layer(cfgJson);
            case 'flatten':
                return LW_Flatten.get_layer(cfgJson);
            case 'activation':
                return LW_Activation.get_layer(cfgJson);
            case 'merge':
                return LW_Merge.get_layer(cfgJson);
            case 'dense':
                return LW_Dense.get_layer(cfgJson);
            default:
                console.log(`****WARNING**** unknown layer type [${nodeTypeStr}]`);
                return null;
        }
    }
}

/////////////////////////////////////////////////////////////////////
class NodeF {
    constructor(jsonNodeExt, nodeIdx, nodeName, inpNodesLst=null, outNodesLst=null) {
        this.nodeCfg     = jsonNodeExt;
        this.nodeIdx     = nodeIdx;
        this.inpNodesLst = inpNodesLst;
        this.outNodesLst = outNodesLst;
        this.nodeName    = nodeName;
        //
        this.shapeInp    = null;
        this.shapeOut    = null;
    }
    getType() {
        if(this.nodeCfg===null) {
            return 'Unknown';
        } else {
            return this.nodeCfg['layerType'];
        }
    }
    name() {
        if(this.nodeName===null) {
            return 'Unknown';
        } else {
            return this.nodeName;
        }
    }
    id() {
        if(this.nodeName===null) {
            return '-1';
        } else {
            return this.nodeCfg['id'];
        }
    }
    static _toStringNodeList(listOfNodes, pref='Inp') {
        let retVal = `${pref}: [`;
        if(listOfNodes !=null) {
            for(let ii of listOfNodes) {
                if(ii!=null) {
                    retVal=`${retVal} ${ii.name()},`;
                }
            }
        }
        retVal = `${retVal}]`;
        return retVal;
    }
    toString() {
        if(this.nodeCfg===null) {
            return 'NodeF(is not configured)';
        } else {
            let nodeInpStr = NodeF._toStringNodeList(this.inpNodesLst, 'Inp');
            let nodeOutStr = NodeF._toStringNodeList(this.outNodesLst, 'Out');
            return `NodeF(${this.name()})[${this.nodeIdx}](inp: [${nodeInpStr}], out: [${nodeOutStr}]) : [${this.getType()}]`;
        }
    }
    hasInpNodes() {
        if(this.inpNodesLst===null) {
            return false;
        } else {
            return (this.inpNodesLst.length>0);
        }
    }
    hasOutNodes() {
        if(this.outNodesLst===null) {
            return false;
        } else {
            return (this.outNodesLst.length>0);
        }
    }
}

/////////////////////////////////////////////////////////////////////
function _findNodeByID(listOfNodes, wireId) {
    for(let node of listOfNodes) {
        if(node.id()===wireId) {
            return node;
        }
    }
    return null;
}


/////////////////////////////////////////////////////////////////////
export function calculateShapesInModel(modelJson, defaultInputShape=[null, 3, 256, 256]) {
    let modelLayers = modelJson.layers;
    let ii = 0;
    let mapNodeNames = new Map();
    let nodeArray = [];
    // (1) Preparing array with nodes
    for(let ll of modelLayers) {
        const tmpType = ll['layerType'];
        if(mapNodeNames.has(tmpType)) {
            mapNodeNames.set(tmpType,mapNodeNames.get(tmpType)+1);
        } else {
            mapNodeNames.set(tmpType,1);
        }
        const newNodeName = `${tmpType}_${mapNodeNames.get(tmpType)}`;
        let tmpNode = new NodeF(ll,ii,newNodeName);
        tmpNode.inpNodesLst = [];
        tmpNode.outNodesLst = [];
        if(ll.hasOwnProperty('shapeInp')) {
            tmpNode.shapeInp = ll.shapeInp;
        } else {
            if(tmpType==='datainput') {
                tmpNode.shapeInp = defaultInputShape.slice();
            }
        }
        // ll.shapeInp = null;
        // ll.shapeOut = null;
        nodeArray.push(tmpNode);
        ii+=1;
    }
    console.log(modelLayers);
    // (2.1) Fill Input Nodes
    for(let [ii, node] of nodeArray.entries()) {
        // console.log(ii + ' : ' + node.name() + ' :   ' + node.nodeCfg.wires);
        if(node.nodeCfg.hasOwnProperty('wires')) {
            for (let wireIdx of node.nodeCfg.wires) {
                let tmpOutNode = _findNodeByID(nodeArray, wireIdx);
                if (tmpOutNode != null) {
                    node.outNodesLst.push(tmpOutNode);
                    // tmpOutNode.inpNodesLst.push(node);
                }
            }
        } else {
            //pass
        }
        // console.log(`\t\t${node.toString()}`);
    }
    // (2.2) Fill Output Nodes
    for(let node of nodeArray) {
        for(let nodeOut of node.outNodesLst) {
            nodeOut.inpNodesLst.push(node);
        }
    }
    for( let [ii,ll] of nodeArray.entries()) {
        console.log(`${ii}  :  ${ll.toString()}`);
    }
    // (3) Prepare Edge Index before sorting
    let edgesIdx = [];
    for(let [idx, ll] of nodeArray.entries()) {
        if(ll.hasOutNodes()) {
            for(let outNode of ll.outNodesLst) {
                edgesIdx.push([ll.nodeIdx, outNode.nodeIdx]);
            }
        }
    }
    console.log(edgesIdx);
    // (4) Sort Topolgicaly index of nodes
    let nodeIndexTopoSorted = topologicalSort(edgesIdx);
    console.log(nodeIndexTopoSorted);
    console.log(nodeArray);
    // (5) Fill Shape Information for every Node from list of NodeF
    for(let ii of nodeIndexTopoSorted) {
        let ll = nodeArray[ii];
        let tmpLayer = LWLayerBuilder.buildNodeByType(ll.getType(), ll.nodeCfg['params']);
        if(ll.shapeInp===null) {
            if(ll.hasInpNodes()) {
                if(tmpLayer.isMultiInput()) {
                    // Node like a Merge
                    let tmpInp = [];
                    let isOk   = true;
                    for (let nn of ll.inpNodesLst) {
                        tmpInp.push(nn.shapeOut.slice());
                        if(nn.shapeOut===null) {
                            isOk = false;
                        }
                    }
                    if(isOk) {
                        ll.shapeInp = tmpInp;
                    } else {
                        ll.shapeInp = null;
                    }
                } else {
                    let inpNodeF = ll.inpNodesLst[0];
                    if((inpNodeF!=null) && (inpNodeF.shapeOut!=null)) {
                        ll.shapeInp = inpNodeF.shapeOut.slice();
                    } else {
                        ll.shapeInp = null;
                    }
                }
            } else {
                ll.shapeInp = null;
            }
        } else {
            // Node from Input Nodes: pass
        }
        if(ll.shapeInp===null) {
            ll.shapeOut  = null;
        } else {
            ll.shapeOut  = tmpLayer.get_output_shape_for(ll.shapeInp.slice());
            console.log(`[${ii}] ${ll.shapeInp} : [${ll.shapeOut}] -> ${ll.toString()} * ${tmpLayer}`);
        }
    }
    // (6) Add inpShape and outShape properties in Model Json
    for( let ll of nodeArray) {
        modelLayers[ll.nodeIdx].shapeInp = ll.shapeInp;
        modelLayers[ll.nodeIdx].shapeOut = ll.shapeOut;
    }
}

export function test_network_library() {
    console.log('Hello, from network library!');
}










